import { useState, useRef, useEffect } from 'react';

/**
 * Componente para acciones de long-press (mantener presionado)
 * Útil para borrar o editar elementos rápidamente en mobile
 */
export default function LongPressAction({ children, onLongPress, duration = 500, className = '' }) {
  const [isPressed, setIsPressed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const pressTimer = useRef(null);
  const elementRef = useRef(null);

  const handleTouchStart = () => {
    setIsPressed(true);
    pressTimer.current = setTimeout(() => {
      setShowMenu(true);
      onLongPress?.();
      // Haptic feedback si está disponible
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    }, duration);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  const handleMouseDown = handleTouchStart;
  const handleMouseUp = handleTouchEnd;
  const handleMouseLeave = handleTouchEnd;

  return (
    <div
      ref={elementRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={`${className} ${
        isPressed ? 'opacity-50 scale-95' : ''
      } transition-all duration-150 cursor-pointer select-none`}
    >
      {children({ isPressed, showMenu, setShowMenu })}
    </div>
  );
}
