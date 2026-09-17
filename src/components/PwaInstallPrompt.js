import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from './SafeIonicons';
import { colors, spacing, fontSizes } from '../constants/theme';
import adminService from '../services/adminService';

/**
 * PWA install experience.
 *
 * Android/Chrome: the browser fires `beforeinstallprompt` once per page load;
 * we capture it and, after a short delay (configurable via system_settings),
 * show an in-app install card. Chrome requires the prompt to be shown in a
 * user-gesture-free window right after page load, so the delay stays small.
 *
 * iOS Safari: no programmatic prompt exists — we show a banner explaining
 * Share → Add to Home Screen.
 *
 * Per the product requirement, the prompt appears on EVERY browser session
 * until the user actually installs (pwa_prompt_every_visit setting), rather
 * than the usual dismiss-and-never-ask-again behaviour.
 *
 * Tracks: session_start, beforeinstallprompt, install_accepted, installed
 * into pwa_events (best-effort, never blocks the UI).
 */

const SESSION_KEY = 'gigs_pwa_session_id';
const INSTALLED_KEY = 'gigs_pwa_installed';
const DISMISS_KEY = 'gigs_pwa_dismissed_at';

const getSessionId = () => {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch (e) {
    return `${Date.now()}`;
  }
};

const PwaInstallPrompt = ({ settings, settingsReady }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState('unknown');
  const [isStandalone, setIsStandalone] = useState(false);
  const [delaySecs, setDelaySecs] = useState(5);
  const [iosInstructions, setIosInstructions] = useState(false);
  const [promptUnavailable, setPromptUnavailable] = useState(false);
  const shownRef = useRef(false);

  const enabled = String(settings?.pwa_install_prompt ?? 'enabled') !== 'disabled';
  const everyVisit = String(settings?.pwa_prompt_every_visit ?? 'true') === 'true';
  const delaySetting = parseInt(settings?.pwa_prompt_delay_seconds ?? '5', 10);
  const iosBanner = String(settings?.pwa_ios_banner ?? 'enabled') !== 'disabled';

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (!Number.isNaN(delaySetting) && delaySetting >= 0) setDelaySecs(delaySetting);

    const ua = navigator.userAgent || '';
    const ios = /iPad|iPhone|iPod/.test(ua) || (Platform.OS === 'web' && /Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const standalone = window.matchMedia?.('(display-mode: standalone)').matches || (navigator.standalone === true);
    setIsStandalone(!!standalone);
    setPlatform(ios ? 'ios' : /Android/.test(ua) ? 'android' : 'desktop');

    let installed = false;
    try { installed = localStorage.getItem(INSTALLED_KEY) === 'true'; } catch (e) { /* ignore */ }
    if (installed || standalone) return undefined; // already installed — respect that

    let captured = null;
    const onBip = (e) => {
      e.preventDefault(); // stop the mini-infobar; we own the UX now
      captured = e;
      setDeferredPrompt(e);
      adminService.trackPwaEvent('beforeinstallprompt', getSessionId());
    };
    const onInstalled = () => {
      try { localStorage.setItem(INSTALLED_KEY, 'true'); } catch (e) { /* ignore */ }
      adminService.trackPwaEvent('installed', getSessionId());
      setVisible(false);
    };
    window.addEventListener('beforeinstallprompt', onBip);
    window.addEventListener('appinstalled', onInstalled);

    // Track this browser session (per-session event).
    if (!shownRef.current) {
      shownRef.current = true;
      adminService.trackPwaEvent('session_start', getSessionId());
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Show the prompt once per session after the configured delay.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.__GIGS_IS_APP__ === true) return undefined; // inside installed app
    if (!enabled || !settingsReady || isStandalone) return undefined;
    if (platform === 'ios' && !iosBanner) return undefined;

    let dismissedThisSession = false;
    try {
      const at = Number(sessionStorage.getItem(DISMISS_KEY) || 0);
      // "Every visit" = a new browser session shows the prompt again even if
      // dismissed before. Within the SAME session, don't nag after a dismissal.
      dismissedThisSession = !everyVisit && at > 0;
    } catch (e) { /* ignore */ }

    const t = setTimeout(() => {
      if (dismissedThisSession) return;
      setVisible(true);
    }, Math.max(0, delaySecs) * 1000);
    return () => clearTimeout(t);
  }, [enabled, settingsReady, isStandalone, platform, iosBanner, delaySecs, everyVisit, deferredPrompt]);

  const dismiss = () => {
    setVisible(false);
    try { sessionStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) { /* ignore */ }
  };

  const install = async () => {
    if (deferredPrompt) {
      setPromptUnavailable(false);
      adminService.trackPwaEvent('install_accepted', getSessionId());
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          try { localStorage.setItem(INSTALLED_KEY, 'true'); } catch (e) { /* ignore */ }
        }
      } catch (e) { /* user closed chrome's sheet */ }
      setDeferredPrompt(null);
      setVisible(false);
    } else if (platform === 'ios') {
      setIosInstructions(true);
    } else {
      // Chrome/Edge didn't fire beforeinstallprompt (manifest/SW checks were
      // still pending, or the browser blocks programmatic prompts). Guide the
      // user through the native menu instead of a dead button.
      setPromptUnavailable(true);
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible onRequestClose={dismiss}>
      <View style={s.backdrop}>
        <LinearGradient colors={gradientsSafe} style={s.card}>
          <TouchableOpacity style={s.close} onPress={dismiss} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <SafeIonicons name="close" size={20} color={colors.white} />
          </TouchableOpacity>

          <View style={s.iconWrap}>
            <SafeIonicons name="phone-portrait" size={34} color={colors.white} />
          </View>
          <Text style={s.title}>Install Gig-Smart</Text>

          {!iosInstructions ? (
            <>
              <Text style={s.body}>
                {platform === 'ios'
                  ? 'Add Gig-Smart to your home screen for a full-screen, app-like experience — no app store needed.'
                  : 'Use Gig-Smart like a real app — full screen, faster loading, right from your home screen. No download from an app store.'}
              </Text>
              <View style={s.benefits}>
                <View style={s.benefitRow}>
                  <SafeIonicons name="flash" size={14} color={colors.warning} />
                  <Text style={s.benefitText}>Opens instantly</Text>
                </View>
                <View style={s.benefitRow}>
                  <SafeIonicons name="expand" size={14} color={colors.warning} />
                  <Text style={s.benefitText}>Full-screen experience</Text>
                </View>
                <View style={s.benefitRow}>
                  <SafeIonicons name="notifications" size={14} color={colors.warning} />
                  <Text style={s.benefitText}>Works like a native app</Text>
                </View>
              </View>
              <TouchableOpacity style={s.installBtn} onPress={install}>
                <SafeIonicons name="download" size={18} color={colors.white} />
                <Text style={s.installText}>
                  {platform === 'ios' ? 'Show me how' : 'Install App'}
                </Text>
              </TouchableOpacity>
              {promptUnavailable && (
                <Text style={s.menuHint}>
                  One-tap install isn't available right now — open your browser menu (⋮) and tap "Install app" or "Add to Home screen".
                </Text>
              )}
              <TouchableOpacity onPress={dismiss} hitSlop={{ top: 10, bottom: 10 }}>
                <Text style={s.later}>Not now</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={s.body}>Adding Gig-Smart to your iPhone home screen takes 5 seconds:</Text>
              <View style={s.steps}>
                <View style={s.stepRow}>
                  <Text style={s.stepNum}>1</Text>
                  <Text style={s.stepText}>Tap the <SafeIonicons name="share-outline" size={13} color={colors.white} /> Share button in Safari's toolbar</Text>
                </View>
                <View style={s.stepRow}>
                  <Text style={s.stepNum}>2</Text>
                  <Text style={s.stepText}>Scroll and tap <Text style={s.stepBold}>Add to Home Screen</Text></Text>
                </View>
                <View style={s.stepRow}>
                  <Text style={s.stepNum}>3</Text>
                  <Text style={s.stepText}>Tap <Text style={s.stepBold}>Add</Text> — done!</Text>
                </View>
              </View>
              <TouchableOpacity style={s.installBtn} onPress={() => setIosInstructions(false)}>
                <Text style={s.installText}>Got it</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={dismiss} hitSlop={{ top: 10, bottom: 10 }}>
                <Text style={s.later}>Maybe later</Text>
              </TouchableOpacity>
            </>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
};

// fallback gradient (avoids importing theme gradients twice)
const gradientsSafe = ['#1e3a8a', '#1e40af', '#2563eb'];

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  card: { width: '100%', maxWidth: 360, borderRadius: 20, padding: spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  close: { position: 'absolute', top: 12, right: 12, padding: 6 },
  iconWrap: { alignItems: 'center', marginBottom: spacing.sm },
  title: { color: colors.white, fontSize: fontSizes.xl, fontWeight: 'bold', textAlign: 'center', marginBottom: spacing.sm },
  body: { color: colors.textSecondary, fontSize: fontSizes.sm, textAlign: 'center', lineHeight: 20, marginBottom: spacing.md },
  benefits: { marginBottom: spacing.md },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  benefitText: { color: colors.textPrimary, fontSize: fontSizes.sm, marginLeft: 8 },
  steps: { marginBottom: spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stepNum: { color: colors.warning, fontWeight: 'bold', fontSize: fontSizes.md, marginRight: 8 },
  stepText: { color: colors.textPrimary, fontSize: fontSizes.sm, flex: 1 },
  stepBold: { fontWeight: 'bold' },
  installBtn: { backgroundColor: colors.success, borderRadius: 12, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  menuHint: { color: colors.warning, fontSize: fontSizes.xs, textAlign: 'center', lineHeight: 17, marginBottom: spacing.sm },
  installText: { color: colors.white, fontWeight: 'bold', fontSize: fontSizes.md, marginLeft: 8 },
  later: { color: colors.textMuted, textAlign: 'center', fontSize: fontSizes.sm, padding: 6 },
});

export default PwaInstallPrompt;
