import { useState, useCallback, useEffect } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);

    if (duration) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};

export function Toast({ id, message, type, onClose }) {
  const bgColor = {
    success: 'bg-green-50 border-green-300',
    error: 'bg-red-50 border-red-300',
    warning: 'bg-yellow-50 border-yellow-300',
    info: 'bg-blue-50 border-blue-300'
  }[type] || 'bg-blue-50 border-blue-300';

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  }[type] || 'text-blue-800';

  const Icon = {
    success: Check,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info
  }[type] || Info;

  const iconColor = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  }[type] || 'text-blue-600';

  return (
    <div className={`animate-fade-in ${bgColor} border-2 ${textColor} px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg flex items-start gap-3 max-w-sm`}>
      <Icon className={`${iconColor} w-5 h-5 flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        <p className="font-medium text-sm sm:text-base">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className={`${textColor} hover:opacity-70 transition-opacity flex-shrink-0 font-bold text-lg`}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-3 pointer-events-auto max-w-sm">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={onClose}
        />
      ))}
    </div>
  );
}
