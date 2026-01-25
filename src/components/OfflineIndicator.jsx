import { Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstallPrompt';

export default function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white py-2 px-4 flex items-center justify-center gap-2 z-50 safe-top">
      <WifiOff size={18} />
      <span className="text-sm font-medium">Sin conexión a internet</span>
    </div>
  );
}
