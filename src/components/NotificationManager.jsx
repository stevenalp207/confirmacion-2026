import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';

const NotificationManager = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [isEnabled, setIsEnabled] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    // Verificar si ya hay notificaciones programadas
    const enabled = localStorage.getItem('attendanceNotificationsEnabled') === 'true';
    setIsEnabled(enabled);

    // Obtener el Service Worker registrado por Vite PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        console.log('Service Worker listo:', reg);
        setRegistration(reg);
      });
    }

    // Configurar notificaciones si ya están habilitadas
    if (enabled && permission === 'granted') {
      scheduleWeeklyNotifications();
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      return perm === 'granted';
    }
    return false;
  };

  const scheduleWeeklyNotifications = () => {
    // Limpiar cualquier intervalo previo
    const existingInterval = localStorage.getItem('notificationIntervalId');
    if (existingInterval) {
      clearInterval(parseInt(existingInterval));
    }

    // Verificar la hora cada minuto
    const intervalId = setInterval(checkAndNotify, 60000);
    localStorage.setItem('notificationIntervalId', intervalId.toString());
    
    // Verificar inmediatamente también
    checkAndNotify();
  };

  const checkAndNotify = async () => {
    const now = new Date();
    
    // Convertir a hora de Costa Rica (UTC-6)
    const costaRicaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
    
    const day = costaRicaTime.getDay(); // 0 = Domingo, 4 = Jueves
    const hours = costaRicaTime.getHours();
    const minutes = costaRicaTime.getMinutes();

    // Verificar si es jueves a las 5:05 PM (17:05)
    if (day === 4 && hours === 17 && minutes === 5) {
      // Verificar si ya se envió hoy
      const lastNotification = localStorage.getItem('lastNotificationDate');
      const today = costaRicaTime.toDateString();
      
      if (lastNotification !== today) {
        await showNotification();
        localStorage.setItem('lastNotificationDate', today);
      }
    }
  };

  const showNotification = async () => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      try {
        const reg = registration || await navigator.serviceWorker.ready;
        
        await reg.showNotification('Confirmación 2026', {
          body: 'Recuerda pasar lista',
          icon: '/android-chrome-192x192.png',
          badge: '/android-chrome-192x192.png',
          vibrate: [200, 100, 200],
          tag: 'attendance-reminder',
          requireInteraction: true,
          actions: [
            {
              action: 'open',
              title: 'Abrir app'
            },
            {
              action: 'close',
              title: 'Cerrar'
            }
          ]
        });
      } catch (error) {
        console.error('Error mostrando notificación:', error);
      }
    }
  };

  const toggleNotifications = async () => {
    if (!isEnabled) {
      // Habilitar notificaciones
      const granted = permission === 'granted' ? true : await requestPermission();
      
      if (granted) {
        setIsEnabled(true);
        localStorage.setItem('attendanceNotificationsEnabled', 'true');
        scheduleWeeklyNotifications();
        
        // Mostrar confirmación
        alert('✅ Notificaciones activadas! Recibirás un recordatorio todos los jueves a las 5:05 PM (hora Costa Rica).');
      } else {
        alert('❌ Por favor, permite las notificaciones en la configuración de tu navegador.');
      }
    } else {
      // Deshabilitar notificaciones
      const intervalId = localStorage.getItem('notificationIntervalId');
      if (intervalId) {
        clearInterval(parseInt(intervalId));
        localStorage.removeItem('notificationIntervalId');
      }
      
      setIsEnabled(false);
      localStorage.setItem('attendanceNotificationsEnabled', 'false');
      alert('🔕 Notificaciones desactivadas.');
    }
  };

  // Botón de prueba (solo para desarrollo)
  const testNotification = async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        alert('Por favor, permite las notificaciones.');
        return;
      }
    }
    
    await showNotification();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col gap-2 items-end">
        <button
          onClick={toggleNotifications}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all ${
            isEnabled
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
          title={isEnabled ? 'Notificaciones activas' : 'Activar notificaciones'}
        >
          {isEnabled ? (
            <>
              <Bell size={20} />
              <span className="text-sm font-medium">Notificaciones ON</span>
            </>
          ) : (
            <>
              <BellOff size={20} />
              <span className="text-sm font-medium">Notificaciones OFF</span>
            </>
          )}
        </button>
        
        {/* Botón de prueba - ocultar en producción */}
        {isEnabled && import.meta.env.DEV && (
          <button
            onClick={testNotification}
            className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded shadow"
          >
            Probar notificación
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationManager;
