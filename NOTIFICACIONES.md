# Sistema de Notificaciones Push PWA 🔔

## ✨ Características Implementadas

### 1. **Múltiples Tipos de Notificaciones**
- ✅ **Recordatorio de Asistencia**: Jueves 5:05 PM
- 💰 **Recordatorio de Pagos**: Lunes 9:00 AM
- 📄 **Documentos Pendientes**: Miércoles 10:00 AM
- ⚠️ **Alerta Asistencia Baja**: Cuando un estudiante <70% asistencia
- 📅 **Eventos Próximos**: 24 horas antes del evento
- 👨‍🏫 **Recordatorio Catequistas**: Jueves 4:00 PM

### 2. **Panel de Configuración Completo**
- Toggle individual para cada tipo de notificación
- Historial de notificaciones con contador de no leídas
- Indicadores visuales de estado (activas/inactivas)
- Botón de prueba para verificar funcionamiento
- Limpieza de historial

### 3. **Notificaciones Inteligentes**
- Detección automática de baja asistencia
- Alertas de pagos pendientes
- Recordatorios de documentos faltantes
- Notificaciones contextuales según el módulo

### 4. **PWA Mejorada**
- Service Worker optimizado
- Soporte offline básico
- Background sync preparado
- Atajos de aplicación (shortcuts)

## 🚀 Cómo Usar

### Para Usuarios

1. **Activar Notificaciones**
   - Haz clic en el icono de campana (🔔) en el header
   - Se abrirá el panel de configuración
   - Activa los tipos de notificación que desees
   - Acepta los permisos en el navegador

2. **Configurar Preferencias**
   - Pestaña "Configuración": Activa/desactiva tipos específicos
   - Pestaña "Historial": Ve todas las notificaciones recibidas
   - Badge de contador muestra notificaciones no leídas

3. **Probar Notificaciones**
   - En la pestaña "Configuración"
   - Clic en "Enviar Notificación de Prueba"
   - Verifica que aparezca la notificación

### Para Desarrolladores

#### Uso Básico

```javascript
import { useNotifications } from '@/hooks/useNotifications';

function MiComponente() {
  const { showNotification, NOTIFICATION_TYPES } = useNotifications();
  
  const enviarNotificacion = async () => {
    await showNotification(
      NOTIFICATION_TYPES.GENERAL,
      'Tu mensaje aquí',
      { requireInteraction: false }
    );
  };
}
```

#### Notificaciones Automáticas

```javascript
import { 
  notifyPaymentSuccess,
  checkAndNotifyLowAttendance 
} from '@/utils/notificationHelpers';

// Al registrar un pago
await notifyPaymentSuccess(nombre, monto);

// Al actualizar asistencia
await checkAndNotifyLowAttendance(estudianteId, grupo);
```

#### Hook Completo

```javascript
const {
  // Estado
  permission,           // 'granted' | 'denied' | 'default'
  isEnabled,           // boolean
  enabledTypes,        // array de tipos activos
  unreadCount,         // número de no leídas
  history,             // array de notificaciones
  
  // Acciones
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
} = useNotifications();
```

## 📋 Tipos de Notificaciones

```javascript
NOTIFICATION_TYPES = {
  ATTENDANCE_REMINDER: 'attendance_reminder',
  PAYMENT_REMINDER: 'payment_reminder',
  DOCUMENT_REMINDER: 'document_reminder',
  LOW_ATTENDANCE_ALERT: 'low_attendance_alert',
  UPCOMING_EVENT: 'upcoming_event',
  CATECHIST_REMINDER: 'catechist_reminder',
  GENERAL: 'general'
}
```

## 🛠️ Archivos Creados/Modificados

### Nuevos Archivos
- `src/utils/notifications.js` - Servicio principal de notificaciones
- `src/hooks/useNotifications.js` - Hook personalizado
- `src/components/NotificationSettings.jsx` - Panel de configuración
- `src/utils/notificationHelpers.js` - Utilidades inteligentes

### Archivos Modificados
- `src/components/NotificationManager.jsx` - Completamente renovado
- `public/service-worker.js` - Mejorado con más funcionalidades
- `vite.config.js` - Manifest PWA mejorado con shortcuts
- `src/main.jsx` - Inicialización del servicio

## 🔧 Próximos Pasos (Opcional)

1. **Integración con Supabase**
   - Guardar preferencias de notificaciones en la BD
   - Sincronizar entre dispositivos
   - Notificaciones push desde servidor

2. **Analytics**
   - Rastrear qué notificaciones se abren
   - Estadísticas de engagement
   - Optimizar horarios de envío

3. **Notificaciones Avanzadas**
   - Notificaciones agrupadas
   - Sonidos personalizados
   - Acciones inline (responder directamente)

## 🐛 Solución de Problemas

### Las notificaciones no aparecen
1. Verifica que los permisos estén concedidos en el navegador
2. Asegúrate de tener al menos un tipo activado
3. Revisa la consola del navegador para errores
4. Usa el botón de prueba para verificar

### Service Worker no funciona
1. Debe estar en HTTPS (o localhost en desarrollo)
2. Limpia la cache del navegador
3. Desregistra y vuelve a registrar el SW
4. Verifica en DevTools > Application > Service Workers

### Notificaciones no llegan a la hora programada
1. La app debe estar abierta o el SW activo
2. Verifica la zona horaria (Costa Rica UTC-6)
3. Revisa que el intervalo no se haya detenido
4. Mira el localStorage para debugging

## 📱 Compatibilidad

- ✅ Chrome/Edge (Desktop & Android)
- ✅ Firefox (Desktop & Android)
- ✅ Safari 16+ (Desktop & iOS 16.4+)
- ✅ Opera
- ⚠️ iOS Safari requiere agregar a pantalla de inicio

## 🎯 Mejoras Implementadas

- **UX Mejorada**: Panel visual intuitivo con tabs
- **Feedback Inmediato**: Contador de no leídas en tiempo real
- **Personalización**: Control granular por tipo
- **Historial**: Registro completo de notificaciones
- **Smart Timing**: Horarios optimizados según contexto
- **Progressive Enhancement**: Funciona incluso sin notificaciones
