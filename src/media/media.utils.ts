/** A device with a shorter screen side than this is a phone, the rest are tablets and desktops */
const PHONE_MAX_SHORT_SIDE = 600;

type LockableOrientation = ScreenOrientation & { lock?: (orientation: 'portrait') => Promise<void> };

/**
 * Keeps the installed app in portrait on a phone, not on a tablet. Not in the manifest (`orientation`), which
 * would lock tablets too. The browser allows it in an installed app only (Chrome on Android; not in a tab, not on
 * iOS), elsewhere the rejection is ignored.
 */
export const lockPhoneOrientation = () => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isPhone = Math.min(window.screen.width, window.screen.height) < PHONE_MAX_SHORT_SIDE;
  if (!isStandalone || !isPhone) return;
  (window.screen.orientation as LockableOrientation | undefined)?.lock?.('portrait').catch(() => {});
};
