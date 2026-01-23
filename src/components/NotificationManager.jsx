import { useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationSettings from './NotificationSettings';

const NotificationManager = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { isEnabled, unreadCount, enabledTypes } = useNotifications();

  const hasActiveNotifications = enabledTypes.length > 0;

  return (
    <>
      <button
        onClick={() => setShowSettings(true)}
        className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all shadow-sm ${
          hasActiveNotifications
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
        }`}
        title={hasActiveNotifications ? 'Notificaciones activas' : 'Configurar notificaciones'}
      >
        {hasActiveNotifications ? (
          <BellRing size={18} className="animate-pulse" />
        ) : (
          <Bell size={18} />
        )}
        
        {/* Badge de contador */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Badge de activas */}
        {hasActiveNotifications && (
          <span className="hidden sm:inline text-xs font-semibold">
            {enabledTypes.length}
          </span>
        )}
      </button>

      {showSettings && (
        <NotificationSettings onClose={() => setShowSettings(false)} />
      )}
    </>
  );
};

export default NotificationManager;
