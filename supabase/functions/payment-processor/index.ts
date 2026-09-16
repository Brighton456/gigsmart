// ============================================================
// payment-processor — the app's entire "backend"
// Replaces the legacy Render server (Server/app.js).
//
// POST /functions/v1/payment-processor
//   body: { action: 'initiate' | 'verify' | 'confirm_deposit' | 'complete_withdrawal' }
//
// All money operations run server-side with the service role key.
// The frontend keeps the BrightPay STK flow (initiate + 3s status polling);
// this function verifies the outcome and credits wallets with an exact-once
// guard so a payment can never be double-credited.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BRIGHTPAY_BASE = 'https://lqlpgghortuhdxnfqavj.supabase.co/functions/v1';
const BRIGHTPAY_KEY = Deno.env.get('BRIGHTPAY_API_KEY') ?? '';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// Credit a user's wallet exactly once per payment.
// dedupeRef is the BrightPay checkout-derived key ("BP-<checkout_id>"), so a
// paid checkout can never be replayed with a fresh external reference.
async function creditDepositOnce(userId, amountKes, dedupeRef, meta = {}) {
  const { data: existing, error: existingErr } = await supabase
    .from('transactions')
    .select('id')
    .eq('external_reference', dedupeRef)
    .limit(1);

  if (existingErr) return { credited: false, error: existingErr };
  if (existing && existing.length > 0) {
    return { credited: false, alreadyProcessed: true };
  }

  const { data: row, error: txErr } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: 'deposit',
      amount: amountKes,
      fee: 0,
      net_amount: amountKes,
      status: 'completed',
      description: `M-Pesa deposit (${meta.human_ref ?? dedupeRef})`,
      external_reference: dedupeRef,
      payment_method: 'm-pesa',
      metadata: meta,
      processed_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (txErr) return { credited: false, error: txErr };

  const { data: cur, error: curErr } = await supabase
    .from('users')
    .select('recharge_wallet')
    .eq('id', userId)
    .single();
  if (curErr) return { credited: false, error: curErr, transaction_id: row.id };

  const next = Number(cur?.recharge_wallet ?? 0) + Number(amountKes);
  const { error: updErr } = await supabase
    .from('users')
    .update({ recharge_wallet: next, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (updErr) return { credited: false, error: updErr, transaction_id: row.id };

  return { credited: true, transaction_id: row.id, new_balance: next };
}

// Upgrade a user's level exactly once per payment (dedupe keyed on checkout).
async function applyUpgradeOnce(userId, levelId, dedupeRef, meta = {}) {
  const { data: existing, error: existingErr } = await supabase
    .from('transactions')
    .select('id')
    .eq('external_reference', dedupeRef)
    .limit(1);
  if (existingErr) return { applied: false, error: existingErr };
  if (existing && existing.length > 0) return { applied: false, alreadyProcessed: true };

  const { data: level, error: levelErr } = await supabase
    .from('levels')
    .select('id, name, cost')
    .eq('id', levelId)
    .single();
  if (levelErr || !level) return { applied: false, error: levelErr ?? { message: 'Level not found' } };

  const { data: cur, error: curErr } = await supabase
    .from('users')
    .select('recharge_wallet, current_level')
    .eq('id', userId)
    .single();
  if (curErr) return { applied: false, error: curErr };

  const balance = Number(cur?.recharge_wallet ?? 0);
  const cost = Number(level.cost ?? 0);
  if (balance < cost) {
    return { applied: false, error: { message: `Insufficient balance: KES ${balance} < KES ${cost}` } };
  }

  const { data: tx, error: txErr } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: 'upgrade',
      amount: cost,
      fee: 0,
      net_amount: cost,
      status: 'completed',
      description: `Level upgrade to ${level.name} (${meta.human_ref ?? dedupeRef})`,
      external_reference: dedupeRef,
      payment_method: 'm-pesa',
      metadata: { level_id: levelId, level_name: level.name, ...meta },
      processed_at: new Date().toISOString(),
    })
    .select('id')
    .single();
  if (txErr) return { applied: false, error: txErr };

  const next = balance - cost;
  const { error: updErr } = await supabase
    .from('users')
    .update({
      recharge_wallet: next,
      current_level: levelId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  if (updErr) return { applied: false, error: updErr };

  return { applied: true, new_balance: next, level: level.name };
}

Deno.serve(async (req) => {
  // CORS for browser callers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  const action = body?.action;

  try {
    // ---------------------------------------------------------------
    // 1) INITIATE — server-side BrightPay STK push
    // ---------------------------------------------------------------
    if (action === 'initiate') {
      const amount = Number(body.amount);
      const phone = String(body.phone_number ?? '');
      const purpose = body.purpose === 'upgrade' ? 'upgrade' : 'deposit';
      const levelId = body.level_id ? Number(body.level_id) : null;
      const userId = body.user_id ?? null;

      if (!Number.isFinite(amount) || amount < 1 || amount > 1_000_000) {
        return json({ success: false, error: 'Amount must be between KES 1 and 1,000,000' }, 400);
      }
      const digits = phone.replace(/\D/g, '');
      const normalized = digits.startsWith('254') ? digits
        : digits.startsWith('0') ? `254${digits.slice(1)}`
        : null;
      if (!normalized || !/^254(7|1)\d{8}$/.test(normalized)) {
        return json({ success: false, error: 'Invalid Kenyan phone number' }, 400);
      }

      const externalRef = `GS-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      const bpRes = await fetch(`${BRIGHTPAY_BASE}/endpoint-pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': BRIGHTPAY_KEY },
        body: JSON.stringify({ amount, phone_number: normalized, external_reference: externalRef }),
      });
      const bpData = await bpRes.json().catch(() => ({}));

      if (!bpRes.ok) {
        return json({ success: false, error: bpData?.error ?? `BrightPay error ${bpRes.status}` }, 502);
      }

      return json({
        success: true,
        checkout_id: bpData.checkout_id ?? null,
        transaction_id: bpData.transaction_id ?? null,
        external_reference: externalRef,
        dedupe_ref: `BP-${bpData.checkout_id}`,
        amount,
        phone_number: normalized,
        purpose,
      });
    }

    // ---------------------------------------------------------------
    // 2) VERIFY — single server-side BrightPay status check
    // ---------------------------------------------------------------
    if (action === 'verify') {
      const { checkoutId, externalRef } = body;
      if (!checkoutId) return json({ success: false, error: 'checkout_id required' }, 400);

      const bpRes = await fetch(`${BRIGHTPAY_BASE}/endpoint-status?checkout_id=${encodeURIComponent(checkoutId)}`, {
        headers: { 'x-api-key': BRIGHTPAY_KEY },
      });
      const bpData = await bpRes.json().catch(() => ({}));
      if (!bpRes.ok) return json({ success: false, error: `BrightPay error ${bpRes.status}` }, 502);

      const rawStatus = String(bpData.status ?? 'PENDING').toUpperCase();
      return json({
        success: true,
        status: rawStatus,
        mpesa_receipt: bpData.mpesa_receipt ?? null,
        amount: bpData.amount ?? null,
        external_reference: externalRef ?? null,
      });
    }

    // ---------------------------------------------------------------
    // 3) CONFIRM_DEPOSIT — verify with BrightPay, then credit wallet
    // ---------------------------------------------------------------
    if (action === 'confirm_deposit') {
      const { userId, amount, checkoutId, externalRef, dedupeRef, mpesaReceipt } = body;
      if (!checkoutId || !dedupeRef) return json({ success: false, error: 'checkoutId and dedupeRef required' }, 400);

      if (checkoutId && BRIGHTPAY_KEY) {
        const bpRes = await fetch(`${BRIGHTPAY_BASE}/endpoint-status?checkout_id=${encodeURIComponent(checkoutId)}`, {
          headers: { 'x-api-key': BRIGHTPAY_KEY },
        });
        const bpData = await bpRes.json().catch(() => ({}));
        const s = String(bpData.status ?? '').toUpperCase();
        if (s === 'FAILED') {
          return json({ success: false, outcome: 'FAILED', error: 'Payment failed at M-Pesa' });
        }
        if (s !== 'COMPLETED') {
          return json({ success: false, outcome: 'PENDING', error: 'Payment not yet completed at M-Pesa' });
        }
      }

      const result = await creditDepositOnce(userId, Number(amount), dedupeRef, {
        human_ref: externalRef ?? null,
        checkout_id: checkoutId,
        mpesa_receipt: mpesaReceipt ?? null,
        verified: Boolean(checkoutId),
      });
      if (result.error) return json({ success: false, outcome: 'ERROR', error: result.error });
      return json({
        success: true,
        outcome: result.alreadyProcessed ? 'ALREADY_PROCESSED' : 'CREDITED',
        transaction_id: result.transaction_id ?? null,
        new_balance: result.new_balance ?? null,
      });
    }

    // ---------------------------------------------------------------
    // 4) CONFIRM_UPGRADE — verify with BrightPay, then apply upgrade
    // ---------------------------------------------------------------
    if (action === 'confirm_upgrade') {
      const { userId, levelId, checkoutId, externalRef, dedupeRef, mpesaReceipt } = body;
      if (!userId || !levelId || !checkoutId || !dedupeRef) {
        return json({ success: false, error: 'userId, levelId, checkoutId and dedupeRef required' }, 400);
      }

      if (checkoutId && BRIGHTPAY_KEY) {
        const bpRes = await fetch(`${BRIGHTPAY_BASE}/endpoint-status?checkout_id=${encodeURIComponent(checkoutId)}`, {
          headers: { 'x-api-key': BRIGHTPAY_KEY },
        });
        const bpData = await bpRes.json().catch(() => ({}));
        const s = String(bpData.status ?? '').toUpperCase();
        if (s === 'FAILED') {
          return json({ success: false, outcome: 'FAILED', error: 'Payment failed at M-Pesa' });
        }
        if (s !== 'COMPLETED') {
          return json({ success: false, outcome: 'PENDING', error: 'Payment not yet completed at M-Pesa' });
        }
      }

      const result = await applyUpgradeOnce(userId, Number(levelId), dedupeRef, {
        human_ref: externalRef ?? null,
        checkout_id: checkoutId,
        mpesa_receipt: mpesaReceipt ?? null,
        verified: Boolean(checkoutId),
      });
      if (result.error) return json({ success: false, outcome: 'ERROR', error: result.error });
      return json({
        success: true,
        outcome: result.alreadyProcessed ? 'ALREADY_PROCESSED' : 'APPLIED',
        new_balance: result.new_balance ?? null,
        level: result.level ?? null,
      });
    }

    return json({ success: false, error: `Unknown action: ${action}` }, 400);
  } catch (e) {
    console.error('payment-processor error:', e);
    return json({ success: false, error: e?.message ?? 'Internal error' }, 500);
  }
});
