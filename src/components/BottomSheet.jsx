import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Componente BottomSheet Modal (modal desde abajo)
 * Común en apps móviles Android/iOS
 */
export default function BottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  height = 'half',
  isDismissible = true,
  showHandle = true
}) {
  const [isVisible, setIsVisible] = useState(isOpen);
  const sheetRef = useRef(null);
  const dragStartY = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleTouchStart = (e) => {
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (!sheetRef.current) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStartY.current;

    // Solo permitir arrastrar hacia abajo
    if (diff > 0) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = (e) => {
    if (!sheetRef.current) return;

    const currentY = e.changedTouches[0].clientY;
    const diff = currentY - dragStartY.current;

    // Si arrastra más de 100px hacia abajo, cerrar
    if (diff > 100) {
      onClose?.();
      sheetRef.current.style.transform = '';
    } else {
      // Animar de vuelta
      sheetRef.current.style.transform = '';
      sheetRef.current.style.transition = 'transform 0.3s ease-out';
      setTimeout(() => {
        if (sheetRef.current) {
          sheetRef.current.style.transition = '';
        }
      }, 300);
    }
  };

  const heightClass = {
    full: 'h-full',
    half: 'h-[50vh]',
    third: 'h-[33vh]',
    auto: 'max-h-[90vh]'
  }[height] || height;

  return (
    <>
      {/* Backdrop */}
      {isVisible && (
        <div
          className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
            isOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={isDismissible ? onClose : undefined}
        />
      )}

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-50 overflow-hidden flex flex-col ${heightClass} transition-all duration-300 transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle (drag indicator) */}
        {showHandle && (
          <div className="flex justify-center py-2 bg-gray-50 touch-none">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {isDismissible && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {children}
        </div>
      </div>
    </>
  );
}
