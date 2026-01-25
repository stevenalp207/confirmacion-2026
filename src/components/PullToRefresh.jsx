import { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Componente para Pull-to-Refresh (tirar hacia abajo para actualizar)
 * Muy común en apps móviles
 */
export default function PullToRefresh({ children, onRefresh, threshold = 80 }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const scrollElement = useRef(null);

  useEffect(() => {
    if (!scrollElement.current) return;

    const element = scrollElement.current;

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      // Solo si estamos al tope del scroll
      if (element.scrollTop !== 0) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - touchStartY.current;

      if (distance > 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance, threshold * 1.5));
      }
    };

    const handleTouchEnd = async (e) => {
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(0);

        try {
          await onRefresh?.();
        } catch (error) {
          console.error('Error en refresh:', error);
        } finally {
          setIsRefreshing(false);
        }
      } else {
        setPullDistance(0);
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-gradient-to-b from-blue-50 to-transparent transition-all duration-200 overflow-hidden"
        style={{
          height: `${Math.min(pullDistance, threshold)}px`,
          opacity: pullDistance / threshold
        }}
      >
        <div
          className={`transition-transform duration-200 ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          style={{
            transform: `rotate(${Math.min(pullDistance / threshold, 1) * 180}deg)`
          }}
        >
          <RefreshCw size={20} className="text-blue-600" />
        </div>
      </div>

      {/* Content */}
      <div
        ref={scrollElement}
        className="w-full h-full overflow-y-auto"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isRefreshing ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}

        {/* Refresh state overlay */}
        {isRefreshing && (
          <div className="flex items-center justify-center gap-2 py-4 text-gray-600">
            <RefreshCw size={18} className="animate-spin" />
            <span className="text-sm font-medium">Actualizando...</span>
          </div>
        )}
      </div>
    </div>
  );
}
