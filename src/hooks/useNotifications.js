import { useState, useEffect, useCallback } from 'react';
import notificationService, { 
  NOTIFICATION_TYPES, 
  NOTIFICATION_CONFIGS 
} from '../utils/notifications';

/**
 * Hook personalizado para gestionar notificaciones push
 */
export function useNotifications() {
  const [permission, setPermission] = useState('default');
  const [isInitialized, setIsInitialized] = useState(false);
  const [enabledTypes, setEnabledTypes] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [history, setHistory] = useState([]);

  // Inicializar servicio de notificaciones
  useEffect(() => {
    const init = async () => {
      const success = await notificationService.initialize();
      setIsInitialized(success);
      setPermission(notificationService.permission);
      
      // Cargar configuración guardada
      const enabled = notificationService.getEnabledNotifications();
      setEnabledTypes(enabled);
      
      // Si hay tipos habilitados, programar notificaciones
      if (enabled.length > 0 && notificationService.isEnabled()) {
        notificationService.scheduleAutoNotifications(enabled);
      }
      
      // Cargar contador y historial
      updateHistory();
    };

    init();

    // Actualizar historial cada minuto
    const interval = setInterval(updateHistory, 60000);
    return () => clearInterval(interval);
  }, []);

  // Actualizar historial y contador
  const updateHistory = useCallback(() => {
    setHistory(notificationService.getHistory());
    setUnreadCount(notificationService.getUnreadCount());
  }, []);

  // Solicitar permisos
  const requestPermission = useCallback(async () => {
    const granted = await notificationService.requestPermission();
    setPermission(notificationService.permission);
    return granted;
  }, []);

  // Mostrar notificación
  const showNotification = useCallback(async (type, message, options = {}) => {
    const success = await notificationService.show(type, message, options);
    if (success) {
      updateHistory();
    }
    return success;
  }, [updateHistory]);

  // Alternar tipo de notificación
  const toggleNotificationType = useCallback(async (type) => {
    let newEnabled = [...enabledTypes];
    
    if (newEnabled.includes(type)) {
      newEnabled = newEnabled.filter(t => t !== type);
    } else {
      // Si no hay permiso, solicitarlo primero
      if (permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          return false;
        }
      }
      newEnabled.push(type);
    }
    
    setEnabledTypes(newEnabled);
    notificationService.scheduleAutoNotifications(newEnabled);
    return true;
  }, [enabledTypes, permission, requestPermission]);

  // Habilitar tipo de notificación
  const enableNotificationType = useCallback(async (type) => {
    if (enabledTypes.includes(type)) return true;
    return await toggleNotificationType(type);
  }, [enabledTypes, toggleNotificationType]);

  // Deshabilitar tipo de notificación
  const disableNotificationType = useCallback(async (type) => {
    if (!enabledTypes.includes(type)) return true;
    return await toggleNotificationType(type);
  }, [enabledTypes, toggleNotificationType]);

  // Deshabilitar todas las notificaciones
  const disableAll = useCallback(() => {
    setEnabledTypes([]);
    notificationService.stopAutoNotifications();
  }, []);

  // Marcar notificación como leída
  const markAsRead = useCallback((id) => {
    notificationService.markAsRead(id);
    updateHistory();
  }, [updateHistory]);

  // Limpiar historial
  const clearHistory = useCallback(() => {
    notificationService.clearHistory();
    updateHistory();
  }, [updateHistory]);

  // Enviar notificación de prueba
  const testNotification = useCallback(async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }
    
    const success = await notificationService.test();
    if (success) {
      updateHistory();
    }
    return success;
  }, [permission, requestPermission, updateHistory]);

  // Verificar si un tipo está habilitado
  const isTypeEnabled = useCallback((type) => {
    return enabledTypes.includes(type);
  }, [enabledTypes]);

  return {
    // Estado
    permission,
    isInitialized,
    isEnabled: permission === 'granted' && isInitialized,
    enabledTypes,
    unreadCount,
    history,
    
    // Acciones
    requestPermission,
    showNotification,
    toggleNotificationType,
    enableNotificationType,
    disableNotificationType,
    disableAll,
    markAsRead,
    clearHistory,
    testNotification,
    isTypeEnabled,
    
    // Constantes
    NOTIFICATION_TYPES,
    NOTIFICATION_CONFIGS
  };
}

export default useNotifications;
