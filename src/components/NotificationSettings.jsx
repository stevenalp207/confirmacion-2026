import { useState, useEffect } from 'react';
import { 
  Bell, 
  BellOff, 
  CheckCircle, 
  DollarSign, 
  FileText, 
  AlertTriangle,
  Calendar,
  Users,
  X,
  Settings,
  History,
  Trash2
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { NOTIFICATION_TYPES } from '../utils/notifications';

const NotificationSettings = ({ onClose }) => {
  const {
    permission,
    isEnabled,
    enabledTypes,
    history,
    unreadCount,
    toggleNotificationType,
    markAsRead,
    clearHistory,
    testNotification,
    isTypeEnabled,
    NOTIFICATION_CONFIGS
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('settings');
  const [showHistory, setShowHistory] = useState(false);

  // Configuración de tipos de notificaciones con iconos
  const notificationTypeConfig = [
    {
      type: NOTIFICATION_TYPES.ATTENDANCE_REMINDER,
      icon: CheckCircle,
      label: 'Recordatorio de Asistencia',
      description: 'Jueves a las 5:05 PM',
      color: 'text-green-600'
    },
    {
      type: NOTIFICATION_TYPES.UPCOMING_EVENT,
      icon: Calendar,
      label: 'Eventos Próximos',
      description: '24 horas antes del evento',
      color: 'text-purple-600'
    },
    {
      type: NOTIFICATION_TYPES.CATECHIST_REMINDER,
      icon: Users,
      label: 'Recordatorio Catequistas',
      description: 'Jueves a las 4:00 PM',
      color: 'text-cyan-600'
    }
  ];

  const handleToggle = async (type) => {
    const success = await toggleNotificationType(type);
    if (!success) {
      alert('❌ No se pudo activar. Verifica los permisos de notificación.');
    }
  };

  const handleTest = async () => {
    const success = await testNotification();
    if (success) {
      alert('✅ Notificación de prueba enviada');
    } else {
      alert('❌ Error enviando notificación de prueba');
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Menos de 1 minuto
    if (diff < 60000) return 'Ahora';
    // Menos de 1 hora
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)}m`;
    // Menos de 24 horas
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)}h`;
    // Más de 24 horas
    return date.toLocaleDateString('es-CR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-8 pb-8 px-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-7 h-7" />
            <div>
              <h2 className="text-2xl font-bold">Notificaciones</h2>
              <p className="text-blue-100 text-sm">
                {isEnabled ? '✓ Activas' : '✗ Inactivas'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 px-4 font-semibold transition ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Configuración
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 font-semibold transition relative ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <History className="w-4 h-4 inline mr-2" />
            Historial
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'settings' ? (
            <>
              {/* Estado de permisos */}
              {permission !== 'granted' && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 font-semibold mb-2">
                    ⚠️ Permisos necesarios
                  </p>
                  <p className="text-yellow-700 text-sm">
                    Para recibir notificaciones, activa cualquier tipo de notificación abajo
                    y acepta los permisos en tu navegador.
                  </p>
                </div>
              )}

              {/* Lista de tipos de notificaciones */}
              <div className="space-y-3">
                {notificationTypeConfig.map(({ type, icon: Icon, label, description, color }) => {
                  const enabled = isTypeEnabled(type);
                  return (
                    <div
                      key={type}
                      className={`p-4 rounded-lg border-2 transition cursor-pointer ${
                        enabled
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleToggle(type)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{label}</h3>
                          <p className="text-sm text-gray-600 mt-1">{description}</p>
                        </div>
                        <div
                          className={`w-12 h-6 rounded-full transition ${
                            enabled ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow transition transform ${
                              enabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                            style={{ marginTop: '2px' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botón de prueba */}
              {enabledTypes.length > 0 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleTest}
                    className="bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition"
                  >
                    🔔 Enviar Notificación de Prueba
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Historial de notificaciones */}
              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-semibold">Sin notificaciones</p>
                    <p className="text-sm mt-2">Las notificaciones aparecerán aquí</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-700">
                        {history.length} notificación{history.length !== 1 ? 'es' : ''}
                      </h3>
                      <button
                        onClick={clearHistory}
                        className="text-red-600 hover:text-red-700 text-sm font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Limpiar todo
                      </button>
                    </div>
                    {history.map((notification) => {
                      const config = NOTIFICATION_CONFIGS[notification.type];
                      return (
                        <div
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={`p-4 rounded-lg border cursor-pointer transition ${
                            notification.read
                              ? 'border-gray-200 bg-white'
                              : 'border-blue-300 bg-blue-50'
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className="text-2xl">{config?.icon || '🔔'}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-gray-800">
                                  {config?.title || 'Notificación'}
                                </h4>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-2">
                                {formatTimestamp(notification.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-2">
          <p className="text-xs text-gray-500 text-center">
            Las notificaciones se enviarán según tu horario local (Costa Rica)
          </p>
          
          {/* Botón para volver a ver el tutorial */}
          <div className="text-center">
            <button
              onClick={() => {
                localStorage.removeItem('confirmacion2026_onboarding_completed');
                localStorage.removeItem('notifications_pulse_shown');
                window.location.reload();
              }}
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              Ver tutorial de nuevo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
