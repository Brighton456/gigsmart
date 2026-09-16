import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import adminService from '../services/adminService';

/**
 * Headless PWA bootstrap:
 * - Registers /sw.js (web only) so the app is installable (Chrome requires a
 *   service worker with a fetch handler for the install prompt to fire).
 * - Records a page_view event per load for the admin PWA dashboard.
 * Renders nothing.
 */
const PwaTracker = () => {
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((e) => {
          console.warn('Service worker registration failed:', e?.message);
        });
      });
    }
    adminService.trackPwaEvent('page_view');
  }, []);

  return null;
};

export default PwaTracker;
