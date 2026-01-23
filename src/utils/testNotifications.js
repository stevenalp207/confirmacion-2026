/**
 * Script de prueba para notificaciones en consola
 * Copia y pega este código en la consola del navegador para probar
 */

// Importar el servicio de notificaciones
import notificationService, { NOTIFICATION_TYPES } from './utils/notifications';

// Función de prueba completa
async function testNotificationFlow() {
  console.log('🧪 Iniciando prueba de notificaciones...\n');
  
  // 1. Inicializar servicio
  console.log('1️⃣ Inicializando servicio...');
  const initialized = await notificationService.initialize();
  console.log(`   ${initialized ? '✅' : '❌'} Servicio inicializado: ${initialized}\n`);
  
  if (!initialized) {
    console.error('❌ No se pudo inicializar el servicio');
    return;
  }
  
  // 2. Verificar permisos
  console.log('2️⃣ Verificando permisos...');
  const hasPermission = notificationService.permission === 'granted';
  console.log(`   ${hasPermission ? '✅' : '⚠️'} Permisos: ${notificationService.permission}\n`);
  
  if (!hasPermission) {
    console.log('   Solicitando permisos...');
    const granted = await notificationService.requestPermission();
    console.log(`   ${granted ? '✅' : '❌'} Permisos concedidos: ${granted}\n`);
    
    if (!granted) {
      console.error('❌ Permisos denegados. No se pueden enviar notificaciones.');
      return;
    }
  }
  
  // 3. Enviar notificación de prueba simple
  console.log('3️⃣ Enviando notificación de prueba...');
  const sent = await notificationService.show(
    NOTIFICATION_TYPES.GENERAL,
    '🎉 ¡Sistema de notificaciones funcionando correctamente!',
    { requireInteraction: false }
  );
  console.log(`   ${sent ? '✅' : '❌'} Notificación enviada: ${sent}\n`);
  
  // 4. Enviar notificación con URL
  console.log('4️⃣ Enviando notificación con navegación...');
  await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2s
  
  const sentWithUrl = await notificationService.show(
    NOTIFICATION_TYPES.ATTENDANCE_REMINDER,
    '📋 Haz clic en "Ver" para ir al módulo de asistencia',
    { 
      requireInteraction: true,
      url: '/?module=asistencia'
    }
  );
  console.log(`   ${sentWithUrl ? '✅' : '❌'} Notificación con URL enviada: ${sentWithUrl}\n`);
  
  // 5. Verificar historial
  console.log('5️⃣ Verificando historial...');
  const history = notificationService.getHistory();
  const unread = notificationService.getUnreadCount();
  console.log(`   📜 Total en historial: ${history.length}`);
  console.log(`   🔵 No leídas: ${unread}\n`);
  
  // 6. Verificar tipos habilitados
  console.log('6️⃣ Tipos de notificaciones habilitadas:');
  const enabled = notificationService.getEnabledNotifications();
  if (enabled.length === 0) {
    console.log('   ⚠️ No hay tipos habilitados automáticamente');
    console.log('   💡 Actívalos desde el panel de notificaciones (icono 🔔)\n');
  } else {
    enabled.forEach(type => {
      console.log(`   ✅ ${type}`);
    });
    console.log('');
  }
  
  console.log('✅ Prueba completada!\n');
  console.log('📱 Para probar en móvil:');
  console.log('   1. Abre la app en tu teléfono');
  console.log('   2. Activa notificaciones desde el icono 🔔');
  console.log('   3. Envía una notificación de prueba');
  console.log('   4. Haz clic en "Ver" en la notificación');
  console.log('   5. Deberías navegar al módulo correspondiente\n');
  
  return true;
}

// Exportar para uso en consola
window.testNotifications = testNotificationFlow;

console.log('💡 Para probar las notificaciones, ejecuta: testNotifications()');
