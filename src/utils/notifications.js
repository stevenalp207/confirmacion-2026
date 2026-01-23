/**
 * Sistema de Notificaciones Push PWA
 * Gestiona todos los tipos de notificaciones de la aplicación
 */

// Tipos de notificaciones disponibles
export const NOTIFICATION_TYPES = {
  ATTENDANCE_REMINDER: 'attendance_reminder',
  PAYMENT_REMINDER: 'payment_reminder',
  DOCUMENT_REMINDER: 'document_reminder',
  LOW_ATTENDANCE_ALERT: 'low_attendance_alert',
  UPCOMING_EVENT: 'upcoming_event',
  CATECHIST_REMINDER: 'catechist_reminder',
  GENERAL: 'general'
};

// Configuración por defecto para cada tipo
export const NOTIFICATION_CONFIGS = {
  [NOTIFICATION_TYPES.ATTENDANCE_REMINDER]: {
    title: 'Recordatorio de Asistencia',
    icon: '✅',
    color: '#10b981',
    schedule: { day: 4, hour: 17, minute: 5 } // Jueves 5:05 PM
  },
  [NOTIFICATION_TYPES.PAYMENT_REMINDER]: {
    title: 'Recordatorio de Pagos',
    icon: '💰',
    color: '#f59e0b',
    schedule: { day: 1, hour: 9, minute: 0 } // Lunes 9:00 AM
  },
  [NOTIFICATION_TYPES.DOCUMENT_REMINDER]: {
    title: 'Documentos Pendientes',
    icon: '📄',
    color: '#3b82f6',
    schedule: { day: 3, hour: 10, minute: 0 } // Miércoles 10:00 AM
  },
  [NOTIFICATION_TYPES.LOW_ATTENDANCE_ALERT]: {
    title: 'Alerta de Asistencia Baja',
    icon: '⚠️',
    color: '#ef4444',
    priority: 'high'
  },
  [NOTIFICATION_TYPES.UPCOMING_EVENT]: {
    title: 'Evento Próximo',
    icon: '📅',
    color: '#8b5cf6',
    priority: 'high'
  },
  [NOTIFICATION_TYPES.CATECHIST_REMINDER]: {
    title: 'Recordatorio para Catequistas',
    icon: '👨‍🏫',
    color: '#06b6d4',
    schedule: { day: 4, hour: 16, minute: 0 } // Jueves 4:00 PM
  },
  [NOTIFICATION_TYPES.GENERAL]: {
    title: 'Confirmación 2026',
    icon: '🔔',
    color: '#6366f1'
  }
};

class NotificationService {
  constructor() {
    this.registration = null;
    this.permission = 'default';
    this.checkInterval = null;
    this.initialized = false;
  }

  /**
   * Inicializar el servicio de notificaciones
   */
  async initialize() {
    if (this.initialized) return true;

    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones');
      return false;
    }

    this.permission = Notification.permission;

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.ready;
        console.log('✅ Service Worker listo para notificaciones');
        this.initialized = true;
        return true;
      } catch (error) {
        console.error('Error inicializando Service Worker:', error);
        return false;
      }
    }

    return false;
  }

  /**
   * Solicitar permisos de notificación
   */
  async requestPermission() {
    if (this.permission === 'granted') return true;

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error solicitando permiso:', error);
      return false;
    }
  }

  /**
   * Verificar si las notificaciones están habilitadas
   */
  isEnabled() {
    return this.permission === 'granted' && this.initialized;
  }

  /**
   * Mostrar una notificación inmediata
   */
  async show(type, message, options = {}) {
    if (!this.isEnabled()) {
      console.warn('Notificaciones no habilitadas');
      return false;
    }

    await this.initialize();

    const config = NOTIFICATION_CONFIGS[type] || NOTIFICATION_CONFIGS[NOTIFICATION_TYPES.GENERAL];
    
    const notificationOptions = {
      body: message,
      icon: '/android-chrome-192x192.png',
      badge: '/android-chrome-192x192.png',
      vibrate: [200, 100, 200],
      tag: type,
      requireInteraction: options.requireInteraction || false,
      data: {
        type,
        timestamp: Date.now(),
        url: options.url || '/',
        ...options.data
      },
      actions: [
        {
          action: 'open',
          title: '👁️ Ver'
        },
        {
          action: 'close',
          title: '✕ Cerrar'
        }
      ],
      ...options
    };

    try {
      if (this.registration) {
        await this.registration.showNotification(config.title, notificationOptions);
      } else {
        new Notification(config.title, notificationOptions);
      }
      
      // Guardar en historial
      this.saveToHistory(type, message);
      return true;
    } catch (error) {
      console.error('Error mostrando notificación:', error);
      return false;
    }
  }

  /**
   * Programar notificaciones automáticas
   */
  scheduleAutoNotifications(enabledTypes = []) {
    // Limpiar intervalo anterior
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    if (enabledTypes.length === 0) return;

    // Guardar tipos habilitados
    localStorage.setItem('enabledNotifications', JSON.stringify(enabledTypes));

    // Verificar cada minuto
    this.checkInterval = setInterval(() => {
      this.checkScheduledNotifications(enabledTypes);
    }, 60000);

    // Verificar inmediatamente
    this.checkScheduledNotifications(enabledTypes);
  }

  /**
   * Verificar y enviar notificaciones programadas
   */
  checkScheduledNotifications(enabledTypes) {
    const now = new Date();
    const crTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
    
    const currentDay = crTime.getDay();
    const currentHour = crTime.getHours();
    const currentMinute = crTime.getMinutes();
    const today = crTime.toDateString();

    enabledTypes.forEach(type => {
      const config = NOTIFICATION_CONFIGS[type];
      if (!config.schedule) return;

      const { day, hour, minute } = config.schedule;
      
      // Verificar si es el momento correcto
      if (currentDay === day && currentHour === hour && currentMinute === minute) {
        // Verificar si ya se envió hoy
        const lastSent = localStorage.getItem(`lastNotification_${type}`);
        
        if (lastSent !== today) {
          this.sendScheduledNotification(type);
          localStorage.setItem(`lastNotification_${type}`, today);
        }
      }
    });
  }

  /**
   * Enviar notificación programada según el tipo
   */
  async sendScheduledNotification(type) {
    const messages = {
      [NOTIFICATION_TYPES.ATTENDANCE_REMINDER]: 
        '📋 Es hora de pasar asistencia. No olvides registrar a todos los estudiantes.',
      [NOTIFICATION_TYPES.PAYMENT_REMINDER]: 
        '💵 Revisa los pagos pendientes del retiro. Hay familias por contactar.',
      [NOTIFICATION_TYPES.DOCUMENT_REMINDER]: 
        '📑 Verifica los documentos pendientes de entrega.',
      [NOTIFICATION_TYPES.CATECHIST_REMINDER]: 
        '👨‍🏫 Recuerda registrar la asistencia de los catequistas antes de la sesión.'
    };

    const message = messages[type] || 'Tienes tareas pendientes';
    await this.show(type, message, { requireInteraction: true });
  }

  /**
   * Detener todas las notificaciones programadas
   */
  stopAutoNotifications() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    localStorage.removeItem('enabledNotifications');
  }

  /**
   * Obtener notificaciones habilitadas
   */
  getEnabledNotifications() {
    const enabled = localStorage.getItem('enabledNotifications');
    return enabled ? JSON.parse(enabled) : [];
  }

  /**
   * Guardar notificación en historial
   */
  saveToHistory(type, message) {
    const history = this.getHistory();
    history.unshift({
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false
    });

    // Mantener solo las últimas 50 notificaciones
    const trimmed = history.slice(0, 50);
    localStorage.setItem('notificationHistory', JSON.stringify(trimmed));
  }

  /**
   * Obtener historial de notificaciones
   */
  getHistory() {
    const history = localStorage.getItem('notificationHistory');
    return history ? JSON.parse(history) : [];
  }

  /**
   * Marcar notificación como leída
   */
  markAsRead(id) {
    const history = this.getHistory();
    const updated = history.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem('notificationHistory', JSON.stringify(updated));
  }

  /**
   * Limpiar historial
   */
  clearHistory() {
    localStorage.removeItem('notificationHistory');
  }

  /**
   * Obtener contador de no leídas
   */
  getUnreadCount() {
    return this.getHistory().filter(n => !n.read).length;
  }

  /**
   * Enviar notificación de prueba
   */
  async test() {
    return await this.show(
      NOTIFICATION_TYPES.GENERAL,
      '🎉 ¡Notificaciones funcionando correctamente!',
      { requireInteraction: false }
    );
  }
}

// Exportar instancia única (singleton)
export const notificationService = new NotificationService();

// Funciones helper para uso directo
export const initNotifications = () => notificationService.initialize();
export const requestNotificationPermission = () => notificationService.requestPermission();
export const showNotification = (type, message, options) => notificationService.show(type, message, options);
export const scheduleNotifications = (types) => notificationService.scheduleAutoNotifications(types);
export const stopNotifications = () => notificationService.stopAutoNotifications();
export const testNotification = () => notificationService.test();

export default notificationService;
