import { HelpCircle, Info, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function Tooltip({ children, text, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const targetRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!isVisible || !targetRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current?.getBoundingClientRect();

    if (!tooltipRect) return;

    let top = 0,
      left = 0;

    switch (position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - 12;
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + 12;
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
        left = targetRect.left - tooltipRect.width - 12;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
        left = targetRect.right + 12;
        break;
      default:
        break;
    }

    setTooltipPos({ top, left });
  }, [isVisible, position]);

  return (
    <div className="relative inline-block">
      <div
        ref={targetRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`,
            zIndex: 1000
          }}
          className="bg-gray-800 text-white px-3 py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap shadow-lg animate-fade-in"
        >
          {text}
        </div>
      )}
    </div>
  );
}

export function HelpHint({ title, description, onDismiss, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleDismiss = () => {
    setIsOpen(false);
    onDismiss?.();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:text-blue-800 transition-colors"
        aria-label="Mostrar ayuda"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg animate-fade-in flex gap-3">
      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-semibold text-blue-900 text-sm mb-1">{title}</h4>
        <p className="text-blue-800 text-sm">{description}</p>
      </div>
      <button
        onClick={handleDismiss}
        className="text-blue-600 hover:text-blue-800 transition-colors"
        aria-label="Cerrar ayuda"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

export function FieldHint({ text, type = 'info' }) {
  const typeStyles = {
    info: 'text-blue-600 bg-blue-50',
    warning: 'text-amber-600 bg-amber-50',
    success: 'text-green-600 bg-green-50',
    error: 'text-red-600 bg-red-50'
  };

  return (
    <p className={`text-xs sm:text-sm mt-2 p-2 rounded ${typeStyles[type]}`}>
      💡 {text}
    </p>
  );
}

export function InfoBadge({ count, variant = 'blue' }) {
  const bgColors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  };

  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 ${bgColors[variant]} text-white text-xs font-bold rounded-full animate-pulse-subtle`}
    >
      {count}
    </span>
  );
}
