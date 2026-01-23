/**
 * Script de ayuda para desarrolladores
 * Ejecutar en la consola del navegador
 */

// Función para resetear el onboarding y ver el tutorial de nuevo
window.resetOnboarding = () => {
  console.log('🔄 Reseteando tutorial de onboarding...');
  localStorage.removeItem('confirmacion2026_onboarding_completed');
  localStorage.removeItem('notifications_pulse_shown');
  console.log('✅ Tutorial reseteado');
  console.log('🔄 Recargando página...');
  setTimeout(() => window.location.reload(), 500);
};

// Función para completar el onboarding sin verlo
window.completeOnboarding = () => {
  console.log('✅ Marcando onboarding como completado...');
  localStorage.setItem('confirmacion2026_onboarding_completed', 'true');
  console.log('✅ Onboarding completado');
  console.log('💡 Recarga la página para ver el cambio');
};

// Función para mostrar el estado actual
window.checkOnboardingStatus = () => {
  const completed = localStorage.getItem('confirmacion2026_onboarding_completed');
  const pulseShown = localStorage.getItem('notifications_pulse_shown');
  
  console.log('📊 Estado del Onboarding:');
  console.log('  Tutorial completado:', completed === 'true' ? '✅ Sí' : '❌ No');
  console.log('  Efecto de pulso mostrado:', pulseShown === 'true' ? '✅ Sí' : '❌ No');
  console.log('  Debe mostrar tutorial:', completed !== 'true' ? '✅ Sí' : '❌ No');
  
  return {
    completed: completed === 'true',
    pulseShown: pulseShown === 'true',
    shouldShow: completed !== 'true'
  };
};

// Función para ver todas las claves relacionadas
window.checkAllStorage = () => {
  console.log('📦 Todo el localStorage relacionado con Confirmación 2026:');
  
  const keys = Object.keys(localStorage);
  const relevant = keys.filter(key => 
    key.includes('confirmacion') || 
    key.includes('notification') || 
    key.includes('onboarding')
  );
  
  if (relevant.length === 0) {
    console.log('  (vacío)');
  } else {
    relevant.forEach(key => {
      console.log(`  ${key}:`, localStorage.getItem(key));
    });
  }
};

// Función para limpiar todo el almacenamiento local
window.clearAllConfirmacionData = () => {
  if (confirm('⚠️ Esto borrará TODOS los datos locales de Confirmación 2026. ¿Continuar?')) {
    console.log('🗑️ Limpiando datos...');
    
    const keys = Object.keys(localStorage);
    const relevant = keys.filter(key => 
      key.includes('confirmacion') || 
      key.includes('notification') || 
      key.includes('onboarding') ||
      key.includes('attendance') ||
      key.includes('savedAccounts')
    );
    
    relevant.forEach(key => {
      localStorage.removeItem(key);
      console.log(`  ✅ Eliminado: ${key}`);
    });
    
    console.log('✅ Limpieza completada');
    console.log('🔄 Recargando página...');
    setTimeout(() => window.location.reload(), 500);
  }
};

// Mensaje de ayuda
console.log(`
╔════════════════════════════════════════════════════════════╗
║          🎓 Scripts de Ayuda - Tutorial Onboarding          ║
╚════════════════════════════════════════════════════════════╝

Funciones disponibles:

📋 checkOnboardingStatus()
   Ver el estado actual del tutorial

🔄 resetOnboarding()
   Resetear y volver a ver el tutorial

✅ completeOnboarding()
   Marcar tutorial como completado sin verlo

📦 checkAllStorage()
   Ver todos los datos guardados

🗑️  clearAllConfirmacionData()
   Borrar TODOS los datos locales (requiere confirmación)

Ejemplo:
  > checkOnboardingStatus()
  > resetOnboarding()
`);
