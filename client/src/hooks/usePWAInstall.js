import { useState, useEffect, useCallback } from 'react';

/**
 * Tracks the browser's `beforeinstallprompt` event (Chrome/Edge/most Android
 * browsers) and exposes an `install()` action plus running/installed state.
 *
 * Safari (iOS/iPadOS/macOS) and Firefox never fire this event — there,
 * installation is a manual "Add to Home Screen" / browser-menu step, which
 * the UI explains separately per platform (see InstallAppButton).
 */
export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalled(standalone);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return { outcome: 'unavailable' };
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
    return { outcome };
  }, [deferredPrompt]);

  return { isInstallable, isInstalled, install };
};

/**
 * Best-effort platform + browser detection used ONLY to pick which manual
 * install instructions to show when `beforeinstallprompt` hasn't fired
 * (either because the browser doesn't support it, or Chrome's engagement
 * heuristic hasn't been met yet on a fresh visit). This never blocks the
 * native prompt path above — it's purely for the fallback instructions.
 */
export const detectPlatform = () => {
  if (typeof window === 'undefined') return { os: 'unknown', browser: 'unknown' };
  const ua = window.navigator.userAgent || '';
  const platform = window.navigator.platform || '';

  const isIphoneIpod = /iphone|ipod/i.test(ua);
  // Modern iPadOS reports itself as "MacIntel" but has touch support —
  // real Macs don't have touch points.
  const isIpad = /ipad/i.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isIos = isIphoneIpod || isIpad;

  const isAndroid = /android/i.test(ua);
  const isWindows = /win(dows|32|64)/i.test(ua) || /win(dows|32|64)/i.test(platform);
  const isMac = /mac/i.test(platform) && !isIpad;
  const isLinux = /linux/i.test(platform) && !isAndroid;

  const isChrome = /chrome|crios/i.test(ua) && !/edg|opr|brave/i.test(ua);
  const isEdge = /edg/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/chrome|crios|android|edg|opr/i.test(ua);
  const isFirefox = /firefox|fxios/i.test(ua);
  const isSamsung = /samsungbrowser/i.test(ua);

  let os = 'unknown';
  if (isIos) os = 'ios';
  else if (isAndroid) os = 'android';
  else if (isWindows) os = 'windows';
  else if (isMac) os = 'mac';
  else if (isLinux) os = 'linux';

  let browser = 'unknown';
  if (isEdge) browser = 'edge';
  else if (isSamsung) browser = 'samsung';
  else if (isChrome) browser = 'chrome';
  else if (isFirefox) browser = 'firefox';
  else if (isSafari) browser = 'safari';

  return { os, browser };
};
