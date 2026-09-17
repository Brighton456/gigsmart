// Cross-platform share.
//
// react-native-web's Share.share() is a silent no-op, so on web the referral
// "Share Link" button did nothing. Here we use the Web Share API when the
// browser supports it, and fall back to copying to the clipboard with a
// visible confirmation. Native platforms pass through to RN's Share.

import { Share, Platform, Clipboard } from 'react-native';
import PlatformAlert from './platformAlert';

export const shareText = async ({ message, title }, successNote = 'Copied to clipboard') => {
  if (Platform.OS !== 'web') {
    try {
      await Share.share({ message, title });
      return { shared: true };
    } catch (e) {
      // User cancelled or the share sheet failed
      return { shared: false, cancelled: true };
    }
  }

  // Web: prefer the native share sheet when available (mobile browsers, Edge)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: title || undefined, text: message });
      return { shared: true };
    } catch (e) {
      if (e && e.name === 'AbortError') return { shared: false, cancelled: true };
      // fall through to clipboard
    }
  }

  // Fallback: copy + confirm so the tap always has a visible result
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(message);
    } else {
      Clipboard.setString(message);
    }
    PlatformAlert.alert('Ready to share', successNote || 'Copied to clipboard — paste it anywhere.');
    return { shared: true, copied: true };
  } catch (e) {
    PlatformAlert.alert('Could not share', 'Copying failed. Long-press the link to copy it manually.');
    return { shared: false };
  }
};

export default shareText;
