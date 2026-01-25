import { useState, useEffect } from 'react';

/**
 * Hook para manejar el prompt de instalación de PWA
 */
export const usePWAInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detectar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Mostrar el prompt después de 3 segundos (UX mejor)
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setInstallPrompt(null);
    setShowPrompt(false);
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
  };

  return {
    installPrompt,
    isInstalled,
    showPrompt,
    handleInstall,
    dismissPrompt
  };
};

/**
 * Hook para sincronización en background
 */
export const useBackgroundSync = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        // Registrar sync tag para sincronizar datos
        const registerSync = (tag) => {
          return registration.sync.register(tag).catch((err) => {
            console.error('Error registrando sync:', err);
          });
        };

        return { registerSync };
      });
    }

    return null;
  }, []);

  const syncData = async (tag = 'sync-data') => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(tag);
        return true;
      } catch (error) {
        console.error('Error solicitando background sync:', error);
        return false;
      }
    }
    return false;
  };

  return { syncData };
};

/**
 * Hook para detectar conexión de red
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
