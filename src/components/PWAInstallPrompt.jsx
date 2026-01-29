import { Download, X } from 'lucide-react';
import { usePWAInstallPrompt } from '../hooks/usePWAInstallPrompt';

export default function PWAInstallPrompt() {
  const { showPrompt, handleInstall, dismissPrompt } = usePWAInstallPrompt();

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-500 shadow-lg z-[60] p-6 md:bottom-4 md:left-4 md:right-auto md:max-w-sm md:rounded-lg">
      <div className="flex flex-col items-center text-center">
        <button
          onClick={dismissPrompt}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        
        <Download size={48} className="text-blue-600 mb-3" />
        
        <h3 className="font-semibold text-gray-900 text-lg mb-2">
          Instalar App
        </h3>
        
        <p className="text-sm text-gray-600 mb-6">
          Instala Confirmación 2026 para acceder sin conexión y recibir notificaciones
        </p>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={handleInstall}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Instalar
        </button>
        <button
          onClick={dismissPrompt}
          className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Después
        </button>
      </div>
    </div>
  );
}
