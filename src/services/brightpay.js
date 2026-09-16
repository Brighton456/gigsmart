// BrightPay M-Pesa integration.
//
// All BrightPay traffic is routed through the `payment-processor` Supabase
// Edge Function so the BrightPay API key stays server-side (never shipped in
// the app bundle) and wallet crediting / level upgrades are verified and
// applied server-side with an exact-once guard.
//
// Flow (unchanged from the user's perspective):
//   1. initiate  -> Edge Function -> BrightPay /endpoint-pay -> { checkout_id }
//   2. poll      -> Edge Function -> BrightPay /endpoint-status every 3s
//   3. confirm   -> Edge Function re-verifies with BrightPay, then credits
//                   the wallet (deposit) or applies the upgrade exactly once.

import axios from 'axios';
import { supabase } from './supabaseClient';
import { APP_SHORT_NAME } from '../constants/branding';

// The single "backend": a Supabase Edge Function inside our own project.
export const PAYMENT_PROCESSOR_URL = `${supabase.supabaseUrl}/functions/v1/payment-processor`;

export const BRIGHTPAY_POLL_INTERVAL_MS = 3000;
export const BRIGHTPAY_POLL_MAX_MS = 120000; // ~2 minutes

const REQUEST_TIMEOUT_MS = 25000;

// Call the Edge Function with the user's Supabase session (function is
// deployed with --no-verify-jwt but we still send the auth context).
const callProcessor = async (payload) => {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = { 'Content-Type': 'application/json' };
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  return axios.post(PAYMENT_PROCESSOR_URL, payload, { headers, timeout: REQUEST_TIMEOUT_MS });
};

// Accept "07..", "2547..", "+2547.." -> "2547........"
export const normalizeKenyanPhone = (raw) => {
  const digits = String(raw || '').replace(/\s+/g, '').replace(/^\+/, '');
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  if (digits.startsWith('254')) return digits;
  if (digits.length === 9) return `254${digits}`;
  return digits;
};

export const isValidKenyanPhone = (raw) => {
  const normalized = normalizeKenyanPhone(raw);
  return /^254(7|1)\d{8}$/.test(normalized);
};

// Unique per-transaction reference (spec: unique external_reference each time)
export const generateExternalReference = (purpose = 'TXN') =>
  `${APP_SHORT_NAME}-${purpose}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();

const friendlyError = (error) => {
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return 'The payment service took too long to respond. Please try again.';
  }
  if (error?.response) {
    const status = error.response.status;
    const detail = error.response.data?.error || error.response.data?.message;
    if (status === 401 || status === 403) return 'Payment service authentication failed. Please contact support.';
    if (status === 400) return detail || 'Invalid payment request. Check the amount and phone number.';
    if (status >= 500) return 'The payment service is temporarily unavailable. Please try again shortly.';
    return detail || `Payment request failed (HTTP ${status}).`;
  }
  if (error?.message === 'Network Error') {
    return 'Network error. Check your internet connection and try again.';
  }
  return error?.message || 'An unexpected error occurred while initiating the payment.';
};

/**
 * STEP 1 — Initiate an STK push (via the payment-processor Edge Function).
 * @returns {Promise<{success: boolean, checkoutId?: string, transactionId?: string,
 *   externalReference?: string, dedupeRef?: string, error?: string, raw?: any}>}
 */
export const initiateBrightpayPayment = async ({ amount, phoneNumber, externalReference, purpose = 'deposit', levelId = null }) => {
  const phone = normalizeKenyanPhone(phoneNumber);
  const reference = externalReference || generateExternalReference();

  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return { success: false, error: 'Invalid amount. Enter a value greater than zero.' };
  }
  if (!isValidKenyanPhone(phone)) {
    return { success: false, error: 'Invalid M-Pesa number. Use format 07XX XXX XXX or 2547XX XXX XXX.' };
  }

  try {
    const response = await callProcessor({
      action: 'initiate',
      amount: Number(amount),
      phone_number: phone,
      external_reference: reference,
      purpose,
      level_id: levelId,
    });

    const data = response?.data ?? {};
    if (!data.success || !data.checkout_id) {
      return {
        success: false,
        error: data.error || 'The payment service rejected the request. Please try again.',
        raw: data,
      };
    }

    return {
      success: true,
      checkoutId: String(data.checkout_id),
      transactionId: data.transaction_id ? String(data.transaction_id) : null,
      externalReference: data.external_reference || reference,
      dedupeRef: data.dedupe_ref || `BP-${data.checkout_id}`,
      raw: data,
    };
  } catch (error) {
    console.error('Payment initiate error:', error?.response?.data || error?.message || error);
    return { success: false, error: friendlyError(error) };
  }
};

/**
 * STEP 2 — One status check (via the Edge Function; BrightPay key stays server-side).
 * @returns {Promise<{ok: boolean, status?: 'PENDING'|'COMPLETED'|'FAILED',
 *   mpesaReceipt?: string|null, raw?: any, error?: string}>}
 */
export const checkBrightpayStatus = async (checkoutId) => {
  try {
    const response = await callProcessor({ action: 'verify', checkoutId });
    const data = response?.data ?? {};
    if (!data.success) return { ok: false, status: 'PENDING', error: data.error || 'Status check failed' };
    return {
      ok: true,
      status: String(data.status ?? 'PENDING').toUpperCase(),
      mpesaReceipt: data.mpesa_receipt ?? null,
      raw: data,
    };
  } catch (error) {
    // Network hiccup during polling should not abort the poll — report as pending-ish.
    console.error('Payment status error:', error?.response?.data || error?.message || error);
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      return { ok: false, status: 'FAILED', error: 'Payment service authentication failed.' };
    }
    return { ok: false, status: 'PENDING', error: friendlyError(error) };
  }
};

/**
 * STEP 2 (loop) — Poll until COMPLETED / FAILED / timeout.
 * @returns {Promise<{outcome: 'COMPLETED'|'FAILED'|'TIMEOUT'|'CANCELLED',
 *   mpesaReceipt?: string|null, raw?: any, error?: string}>}
 */
export const pollBrightpayPayment = async (
  checkoutId,
  { onTick, intervalMs = BRIGHTPAY_POLL_INTERVAL_MS, maxMs = BRIGHTPAY_POLL_MAX_MS, signal } = {}
) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < maxMs) {
    if (signal?.aborted) return { outcome: 'CANCELLED' };

    const result = await checkBrightpayStatus(checkoutId);
    onTick?.(result, Date.now() - startedAt);

    if (result.ok && result.status === 'COMPLETED') {
      return { outcome: 'COMPLETED', mpesaReceipt: result.mpesaReceipt, raw: result.raw };
    }
    if (result.ok && ['FAILED', 'CANCELLED', 'CANCELED', 'TIMEOUT'].includes(result.status)) {
      return { outcome: result.status === 'TIMEOUT' ? 'FAILED' : 'FAILED', mpesaReceipt: result.mpesaReceipt, raw: result.raw };
    }
    // PENDING or transient error -> keep polling

    await new Promise((resolve) => {
      const t = setTimeout(resolve, intervalMs);
      signal?.addEventListener?.('abort', () => { clearTimeout(t); resolve(); }, { once: true });
    });
  }

  return { outcome: 'TIMEOUT' };
};

// Small axios wrappers kept here so every BrightPay call shares config.
const axiosPost = (url, body) =>
  axios.post(url, body, { headers: { 'Content-Type': 'application/json' }, timeout: REQUEST_TIMEOUT_MS });
const axiosGet = (url) =>
  axios.get(url, { headers: { 'Content-Type': 'application/json' }, timeout: REQUEST_TIMEOUT_MS });

/**
 * STEP 3 — Confirm a deposit server-side (verify + exactly-once wallet credit).
 * The frontend no longer writes balances itself.
 * @returns {Promise<{success: boolean, outcome?: 'CREDITED'|'ALREADY_PROCESSED'|'PENDING'|'FAILED'|'ERROR',
 *   newBalance?: number|null, error?: string}>}
 */
export const confirmDeposit = async ({ userId, amount, checkoutId, externalReference, dedupeRef, mpesaReceipt }) => {
  try {
    const response = await callProcessor({
      action: 'confirm_deposit',
      userId,
      amount,
      checkoutId,
      externalRef: externalReference,
      dedupeRef: dedupeRef || `BP-${checkoutId}`,
      mpesaReceipt: mpesaReceipt ?? null,
    });
    const data = response?.data ?? {};
    if (!data.success) return { success: false, outcome: data.outcome || 'ERROR', error: data.error };
    return { success: true, outcome: data.outcome, newBalance: data.new_balance ?? null };
  } catch (error) {
    console.error('Confirm deposit error:', error?.response?.data || error?.message || error);
    return { success: false, outcome: 'ERROR', error: friendlyError(error) };
  }
};

/**
 * STEP 3 — Confirm an upgrade server-side (verify + exactly-once level change).
 * @returns {Promise<{success: boolean, outcome?: 'APPLIED'|'ALREADY_PROCESSED'|'PENDING'|'FAILED'|'ERROR',
 *   newBalance?: number|null, level?: string|null, error?: string}>}
 */
export const confirmUpgrade = async ({ userId, levelId, checkoutId, externalReference, dedupeRef, mpesaReceipt }) => {
  try {
    const response = await callProcessor({
      action: 'confirm_upgrade',
      userId,
      levelId,
      checkoutId,
      externalRef: externalReference,
      dedupeRef: dedupeRef || `BP-${checkoutId}`,
      mpesaReceipt: mpesaReceipt ?? null,
    });
    const data = response?.data ?? {};
    if (!data.success) return { success: false, outcome: data.outcome || 'ERROR', error: data.error };
    return { success: true, outcome: data.outcome, newBalance: data.new_balance ?? null, level: data.level ?? null };
  } catch (error) {
    console.error('Confirm upgrade error:', error?.response?.data || error?.message || error);
    return { success: false, outcome: 'ERROR', error: friendlyError(error) };
  }
};
