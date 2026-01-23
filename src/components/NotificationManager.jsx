import { useState, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationSettings from './NotificationSettings';

const NotificationManager = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);
  const { isEnabled, unreadCount, enabledTypes } = useNotifications();

  const hasActiveNotifications = enabledTypes.length > 0;

  // Efecto de pulso después del onboarding
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('confirmacion2026_onboarding_completed');
    const notificationsPulsed = localStorage.getItem('notifications_pulse_shown');
    
    if (onboardingCompleted === 'true' && !notificationsPulsed && !hasActiveNotifications) {
      // Esperar 1 segundo después del onboarding
      const timer = setTimeout(() => {
        setShouldPulse(true);
        localStorage.setItem('notifications_pulse_shown', 'true');
        
        // Detener el pulso después de 10 segundos
        setTimeout(() => setShouldPulse(false), 10000);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [hasActiveNotifications]);

  const handleClick = () => {
    setShouldPulse(false);
    setShowSettings(true);
  };

  return (
    <>
      <div className="relative">
        {/* Anillo de pulso animado */}
        {shouldPulse && (
          <div className="absolute inset-0 -m-2">
            <div className="absolute inset-0 rounded-lg bg-blue-400 animate-ping opacity-75"></div>
            <div className="absolute inset-0 rounded-lg bg-blue-500 animate-pulse"></div>
          </div>
        )}
        
        <button
          onClick={handleClick}
          className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all shadow-sm ${
            hasActiveNotifications
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
          } ${shouldPulse ? 'ring-4 ring-blue-300 ring-opacity-50 scale-110' : ''}`}
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
      </div>

      {showSettings && (
        <NotificationSettings onClose={() => setShowSettings(false)} />
      )}
    </>
  );
};

export default NotificationManager;
