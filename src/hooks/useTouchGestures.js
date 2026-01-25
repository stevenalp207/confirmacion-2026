import { useRef, useEffect, useState } from 'react';

/**
 * Hook para detectar gestos táctiles comunes
 * Soporta: swipe, long-press, pinch, double-tap
 */
export const useTouchGestures = () => {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const longPressTimer = useRef(null);
  const lastTapTime = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
    touchStartY.current = e.changedTouches[0].screenY;
  };

  const handleTouchEnd = (e, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onLongPress) => {
    touchEndX.current = e.changedTouches[0].screenX;
    touchEndY.current = e.changedTouches[0].screenY;

    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = touchEndY.current - touchStartY.current;
    const minSwipeDistance = 50;

    // Detectar swipe
    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    if (Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }

    // Limpiar long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleLongPress = (e, callback, duration = 500) => {
    longPressTimer.current = setTimeout(() => {
      if (callback) callback(e);
    }, duration);
  };

  const handleDoubleTap = (callback) => {
    const now = new Date().getTime();
    const timeSinceLastTap = now - lastTapTime.current;

    if (timeSinceLastTap < 300) {
      // Double tap detectado
      if (callback) callback();
    }

    lastTapTime.current = now;
  };

  return {
    handleTouchStart,
    handleTouchEnd,
    handleLongPress,
    handleDoubleTap
  };
};

/**
 * Hook para detectar si el dispositivo es móvil
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

/**
 * Hook para manejar viewport
 */
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
};

/**
 * Hook para detectar safe area (notch en phones)
 */
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const top = parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)')) || 0;
      const right = parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-right)')) || 0;
      const bottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)')) || 0;
      const left = parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-left)')) || 0;

      setSafeArea({ top, right, bottom, left });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    return () => window.removeEventListener('resize', updateSafeArea);
  }, []);

  return safeArea;
};
