import { useState, useEffect, useCallback } from 'react';

/**
 * Tracks the browser's `beforeinstallprompt` event (Chrome/Edge/Android)
 * and exposes an `install()` action plus running/installed state.
 *
 * iOS Safari does not fire this event — there, users install via
 * Share -> "Add to Home Screen", which the UI should explain separately.
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

const isIos = () =>
  typeof window !== 'undefined' && /iphone|ipad|ipod/i.test(window.navigator.userAgent);

const isSafari = () =>
  typeof window !== 'undefined' &&
  /^((?!chrome|android|crios|fxios).)*safari/i.test(window.navigator.userAgent);

export const isIosSafari = () => isIos() && isSafari();
