import { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'warning',
  icon: Icon = AlertTriangle,
  loading = false
}) {
  const [isClosing, setIsClosing] = useState(false);

  const variantConfig = {
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      button: 'bg-linear-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800'
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      button: 'bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      button: 'bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
    }
  };

  const config = variantConfig[variant];

  const handleCancel = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onCancel?.();
    }, 200);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`${config.bg} border-2 ${config.border} rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 transform transition-all duration-200 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} animate-fade-in`}>
        {/* Icon */}
        <div className={`w-16 h-16 ${config.bg} border-2 ${config.border} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Icon className={`${config.icon} w-8 h-8`} />
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-2">
          {title}
        </h2>

        {/* Message */}
        <p className="text-sm sm:text-base text-gray-600 text-center mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3 sm:gap-4">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 sm:py-3 rounded-lg border-2 border-gray-300 text-gray-800 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 ${config.button} text-white font-semibold py-2 sm:py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base`}
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Procesando...
              </>
            ) : (
              <>
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeleteConfirmDialog({
  isOpen,
  itemName,
  onConfirm,
  onCancel,
  loading = false
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title="Confirmar eliminación"
      message={`¿Estás seguro de que quieres eliminar "${itemName}"? Esta acción no se puede deshacer.`}
      confirmText="Eliminar"
      cancelText="Cancelar"
      variant="danger"
      icon={Trash2}
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={loading}
    />
  );
}
