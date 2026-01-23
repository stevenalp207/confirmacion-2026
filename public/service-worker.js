// Service Worker mejorado para notificaciones push PWA
// Confirmación 2026

// Workbox precache manifest
const manifest = self.__WB_MANIFEST;

// Versión del SW
const VERSION = '2.0.0';

self.addEventListener('install', (event) => {
  console.log(`Service Worker v${VERSION} instalado`);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log(`Service Worker v${VERSION} activado`);
  event.waitUntil(
    Promise.all([
      clients.claim(),
      // Limpiar caches antiguos si es necesario
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== 'confirmacion-2026-v1')
            .map(name => caches.delete(name))
        );
      })
    ])
  );
});

// Manejar notificaciones push desde servidor
self.addEventListener('push', (event) => {
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'general',
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
      ...data
    },
    actions: [
      {
        action: 'open',
        title: '👁️ Ver',
        icon: '/android-chrome-192x192.png'
      },
      {
        action: 'close',
        title: '✕ Cerrar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Confirmación 2026', options)
  );
});

// Manejar clicks en las notificaciones
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  console.log('Notification clicked:', { action, data });

  // Cerrar la notificación
  notification.close();

  // Si presionó cerrar, no hacer nada más
  if (action === 'close') {
    return;
  }

  // Determinar URL de destino
  const urlToOpen = data.url || '/';
  const fullUrl = new URL(urlToOpen, self.location.origin).href;

  // Abrir o enfocar la app
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then(clientList => {
      console.log('Clientes encontrados:', clientList.length);
      
      // Buscar si ya hay una ventana abierta de la app
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        console.log('Cliente URL:', client.url);
        
        // Verificar si es una ventana de nuestra app
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          console.log('Enfocando ventana existente');
          
          // Enfocar la ventana existente
          return client.focus().then(focusedClient => {
            console.log('Ventana enfocada, enviando mensaje');
            
            // Enviar mensaje para navegar si es necesario
            focusedClient.postMessage({
              type: 'NOTIFICATION_CLICK',
              url: urlToOpen,
              data: data
            });
            
            return focusedClient;
          });
        }
      }
      
      // Si no hay ventana abierta, abrir una nueva
      console.log('Abriendo nueva ventana:', fullUrl);
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    }).catch(err => {
      console.error('Error manejando click de notificación:', err);
    })
  );
});

// Manejar cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
  console.log('Notificación cerrada:', event.notification.tag);
  
  // Opcional: Registrar estadísticas de notificaciones cerradas
  const data = event.notification.data || {};
  
  event.waitUntil(
    // Aquí podrías enviar analytics o logs
    Promise.resolve()
  );
});

// Sincronización en segundo plano (Background Sync)
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      // Sincronizar notificaciones pendientes
      syncNotifications()
    );
  }
});

// Función helper para sincronizar notificaciones
async function syncNotifications() {
  try {
    // Aquí podrías sincronizar con Supabase u otro backend
    console.log('Sincronizando notificaciones...');
    return Promise.resolve();
  } catch (error) {
    console.error('Error sincronizando notificaciones:', error);
    return Promise.reject(error);
  }
}

// Escuchar mensajes desde la aplicación
self.addEventListener('message', (event) => {
  console.log('Mensaje recibido en SW:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: VERSION });
  }
});

// Manejar mensajes del cliente para mostrar notificaciones locales
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag } = event.data;
    
    self.registration.showNotification(title, {
      body: body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [200, 100, 200],
      tag: tag || 'notification',
      requireInteraction: true
    });
  }
});
