import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/animations.css'
import App from './App.jsx'
import { initNotifications } from './utils/notifications'

// Cargar helpers de desarrollo en modo dev
if (import.meta.env.DEV) {
  import('./utils/devHelpers.js').catch(() => {});
}

// Inicializar servicio de notificaciones al cargar la app
initNotifications().then(() => {
  console.log('✅ Servicio de notificaciones inicializado');
}).catch(err => {
  console.warn('⚠️ No se pudo inicializar notificaciones:', err);
});

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('✅ Service Worker registrado'))
      .catch(err => console.warn('⚠️ Error registrando SW:', err));
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
