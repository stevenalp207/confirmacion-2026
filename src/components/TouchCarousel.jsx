import { useState, useCallback } from 'react';
import { useTouchGestures } from '../hooks/useTouchGestures';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Componente para deslizar entre items (carrusel táctil)
 */
export default function TouchCarousel({ items, onItemChange, children }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { handleTouchStart, handleTouchEnd } = useTouchGestures();

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    onItemChange?.(Math.max(0, currentIndex - 1));
  }, [currentIndex, items.length, onItemChange]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    onItemChange?.(Math.min(items.length - 1, currentIndex + 1));
  }, [currentIndex, items.length, onItemChange]);

  return (
    <div className="relative overflow-hidden">
      {/* Carousel container */}
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={(e) =>
          handleTouchEnd(
            e,
            goToNext, // swipe left
            goToPrevious // swipe right
          )
        }
      >
        {items.map((item, idx) => (
          <div key={idx} className="w-full flex-shrink-0">
            {children ? children(item, idx) : item}
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2 pointer-events-none">
        <button
          onClick={goToPrevious}
          className="pointer-events-auto p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="Anterior"
        >
          <ChevronLeft size={20} className="text-gray-800" />
        </button>
        <button
          onClick={goToNext}
          className="pointer-events-auto p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="Siguiente"
        >
          <ChevronRight size={20} className="text-gray-800" />
        </button>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentIndex ? 'bg-blue-600 w-8' : 'bg-gray-300 w-2'
            }`}
            aria-label={`Ir al item ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
