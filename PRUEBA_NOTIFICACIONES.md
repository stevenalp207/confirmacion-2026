# 🔔 Guía de Prueba - Notificaciones Push

## ✅ Checklist de Prueba

### En Desktop (Desarrollo)

1. **Abrir la aplicación**
   ```
   npm run dev
   ```
   Navega a http://localhost:5173

2. **Iniciar sesión**
   - Usa cualquier usuario válido

3. **Abrir panel de notificaciones**
   - Haz clic en el icono de campana 🔔 en el header
   - Se abrirá el panel de configuración

4. **Activar un tipo de notificación**
   - Activa "Recordatorio de Asistencia"
   - Acepta los permisos cuando el navegador lo solicite
   - Verás que el icono cambia a azul

5. **Probar notificación inmediata**
   - En el panel, haz clic en "🔔 Enviar Notificación de Prueba"
   - Deberías ver una notificación del sistema
   - La notificación debe aparecer en tu escritorio

6. **Probar botón "Ver"**
   - Cuando aparezca la notificación
   - Haz clic en el botón "Ver"
   - La app debería enfocarse o abrirse
   - Si es una notificación con módulo específico, debería navegar allí

### En Móvil (Android/iOS)

1. **Abrir en navegador móvil**
   - Chrome/Edge en Android
   - Safari en iOS 16.4+ (debe agregarse a pantalla de inicio)

2. **Agregar a pantalla de inicio** (Recomendado)
   - Android: Menu → "Agregar a pantalla de inicio"
   - iOS: Compartir → "Agregar a pantalla de inicio"

3. **Activar notificaciones**
   - Abre la app desde el icono
   - Toca el icono 🔔
   - Activa un tipo de notificación
   - Acepta permisos

4. **Enviar notificación de prueba**
   - Toca "Enviar Notificación de Prueba"
   - La notificación aparecerá como notificación nativa

5. **Probar navegación desde notificación**
   - Cuando llegue una notificación
   - Toca "Ver" o la notificación misma
   - La app debe abrirse/enfocarse
   - Si tiene módulo asociado, navegará automáticamente

## 🐛 Solución de Problemas

### El botón "Ver" no funciona

**Síntoma**: Al hacer clic en "Ver" no pasa nada

**Causas comunes**:
1. Service Worker no registrado correctamente
2. App no está escuchando mensajes del SW
3. Permisos de notificación denegados

**Soluciones**:

```javascript
// 1. Verificar Service Worker en DevTools
// Chrome DevTools → Application → Service Workers
// Debe mostrar: "activated and is running"

// 2. Verificar en consola:
navigator.serviceWorker.ready.then(reg => {
  console.log('SW activo:', reg.active);
});

// 3. Verificar permisos:
console.log('Permisos:', Notification.permission);
// Debe ser: "granted"

// 4. Forzar actualización del SW:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
// Luego recarga la página
```

### Las notificaciones no aparecen

**Verifica**:
1. ✅ Permisos concedidos: `Notification.permission === 'granted'`
2. ✅ HTTPS o localhost (requerido para PWA)
3. ✅ Service Worker activo
4. ✅ No está en modo "No molestar" del sistema

### La navegación no funciona en móvil

**iOS Safari**:
- La app DEBE estar agregada a la pantalla de inicio
- Safari normal tiene limitaciones con PWA

**Android Chrome**:
- Funciona en navegador normal
- Mejor experiencia si se agrega a pantalla de inicio

## 📱 Probar Notificaciones Programadas

### Asistencia (Jueves 5:05 PM)

```javascript
// Simular la hora en localStorage
const now = new Date();
const thursday = new Date(now);
thursday.setDate(now.getDate() + ((4 + 7 - now.getDay()) % 7)); // Próximo jueves
thursday.setHours(17, 5, 0);

// O cambiar la hora del sistema temporalmente
```

### Prueba Rápida de Horarios

Edita temporalmente `src/utils/notifications.js`:

```javascript
// Línea ~206 - Cambiar:
if (currentDay === day && currentHour === hour && currentMinute === minute) {

// A (para probar en 1 minuto):
const testMinute = (currentMinute + 1) % 60;
if (currentMinute === testMinute) {
```

## 🎯 Escenarios de Prueba

### Caso 1: Recordatorio Simple
- [x] Activar "Recordatorio de Asistencia"
- [x] Esperar notificación o usar botón de prueba
- [x] Click en "Ver"
- [x] Verifica que abre/enfoca la app

### Caso 2: Navegación a Módulo
- [x] Activar "Recordatorio de Pagos"
- [x] Enviar notificación de prueba
- [x] Click en "Ver"
- [x] Verifica que navega a módulo de pagos

### Caso 3: Múltiples Notificaciones
- [x] Activar 3+ tipos
- [x] Enviar varias notificaciones de prueba
- [x] Ver historial en el panel
- [x] Verificar contador de no leídas

### Caso 4: Cerrar y Reabrir
- [x] Configurar notificaciones
- [x] Cerrar app completamente
- [x] Reabrir
- [x] Verificar que configuración persiste

## 📊 Métricas de Éxito

| Métrica | Esperado | ✅/❌ |
|---------|----------|-------|
| Permisos se solicitan correctamente | ✅ | |
| Notificación de prueba aparece | ✅ | |
| Botón "Ver" abre la app | ✅ | |
| Navegación a módulo funciona | ✅ | |
| Historial se guarda | ✅ | |
| Configuración persiste | ✅ | |
| Funciona en móvil | ✅ | |

## 🔍 Debugging Avanzado

### Ver logs del Service Worker

```javascript
// En DevTools → Application → Service Workers
// Click en "inspect" bajo el Service Worker activo
// Verás la consola del SW
```

### Simular notificación desde consola

```javascript
// En la consola del navegador:
import { showNotification, NOTIFICATION_TYPES } from './src/utils/notifications';

await showNotification(
  NOTIFICATION_TYPES.ATTENDANCE_REMINDER,
  'Prueba de navegación',
  { url: '/?module=asistencia', requireInteraction: true }
);
```

### Ver mensajes entre SW y App

```javascript
// Agregar en src/App.jsx temporalmente:
navigator.serviceWorker.addEventListener('message', event => {
  console.log('🔵 Mensaje del SW:', event.data);
});
```

## ✅ Confirmación Final

Después de todas las pruebas, deberías poder:

- ✅ Activar/desactivar notificaciones fácilmente
- ✅ Recibir notificaciones del sistema
- ✅ Hacer clic en "Ver" y que la app se abra
- ✅ Navegar automáticamente al módulo correspondiente
- ✅ Ver historial de notificaciones
- ✅ Configuración persiste entre sesiones
- ✅ Funciona tanto en desktop como móvil

---

**¿Problemas?** Revisa la consola del navegador y la del Service Worker para logs detallados.
