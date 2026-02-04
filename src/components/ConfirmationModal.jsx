import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  type = 'success', // 'success', 'error', 'confirm'
  title = '', 
  message = '', 
  onConfirm, 
  onCancel,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar'
}) {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';
  const isConfirm = type === 'confirm';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in">
        {/* Header con ícono */}
        <div className={`px-6 py-4 flex items-start gap-4 ${
          isSuccess ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
          isError ? 'bg-gradient-to-r from-red-600 to-rose-600' :
          'bg-gradient-to-r from-blue-600 to-cyan-600'
        }`}>
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
            isSuccess ? 'bg-green-500/30' :
            isError ? 'bg-red-500/30' :
            'bg-blue-500/30'
          }`}>
            {isSuccess || isConfirm ? (
              <CheckCircle className="w-6 h-6 text-white" />
            ) : (
              <AlertCircle className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
          {isConfirm && (
            <button
              onClick={onCancel}
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Mensaje */}
        <div className="px-6 py-5">
          <div className="text-gray-700 text-sm leading-relaxed">{message}</div>
        </div>

        {/* Botones */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold transition-colors text-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm text-white ${
              isSuccess ? 'bg-green-600 hover:bg-green-700' :
              isError ? 'bg-red-600 hover:bg-red-700' :
              'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
