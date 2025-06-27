
// Service Worker mejorado para PWA completa
const CACHE_NAME = 'glasgow-scale-v2.0.0';
const STATIC_CACHE = 'glasgow-static-v2';
const DYNAMIC_CACHE = 'glasgow-dynamic-v2';
const RUNTIME_CACHE = 'glasgow-runtime-v2';

// Archivos críticos para funcionamiento offline
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/43c6f307-9318-403d-bd45-5ce621f2ddd5.png',
  '/lovable-uploads/81c84fe7-0c76-4dee-993c-d898e80745d1.png',
  '/lovable-uploads/e26c19ba-90be-4aad-ac98-42b2c709ecb4.png',
  '/lovable-uploads/a3b0f94a-9763-453a-9316-4b1ec28bf475.png',
  '/lovable-uploads/660bf743-7693-4ffa-9e99-cd144b3df7c3.png',
  '/lovable-uploads/edad59fb-53f1-40b5-9258-9c30a3007a33.png',
  '/lovable-uploads/1edfcd9a-b617-430e-a97f-c120b6840015.png',
  '/lovable-uploads/27d7585f-4797-4b60-b021-b51a5a7d3fe0.png',
  '/lovable-uploads/1263d9be-2858-476b-8efc-6730c421556c.png',
  '/lovable-uploads/7b073f25-50be-4155-bc7e-d27373c923ab.png',
  '/favicon.ico'
];

// URLs externas críticas
const EXTERNAL_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('SW: Instalando versión 2.0.0...');
  event.waitUntil(
    Promise.all([
      // Cache archivos estáticos
      caches.open(STATIC_CACHE).then(cache => {
        console.log('SW: Cacheando archivos estáticos');
        return cache.addAll(STATIC_FILES);
      }),
      // Cache recursos externos críticos
      caches.open(RUNTIME_CACHE).then(cache => {
        console.log('SW: Cacheando recursos externos');
        return Promise.allSettled(
          EXTERNAL_RESOURCES.map(url => 
            fetch(url).then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
            }).catch(err => console.log('No se pudo cachear:', url))
          )
        );
      })
    ])
  );
  self.skipWaiting();
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('SW: Activando...');
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== RUNTIME_CACHE) {
              console.log('SW: Eliminando caché antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar control de clientes existentes
      self.clients.claim()
    ])
  );
});

// Estrategia de cache mejorada
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar requests GET
  if (request.method !== 'GET') return;

  // Recursos estáticos - Cache First
  if (STATIC_FILES.some(file => url.pathname === file) || 
      request.destination === 'manifest') {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(fetchResponse => {
          const responseClone = fetchResponse.clone();
          caches.open(STATIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return fetchResponse;
        });
      }).catch(() => {
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
    );
    return;
  }

  // Recursos externos (fonts, APIs) - Stale While Revalidate
  if (url.origin !== location.origin) {
    event.respondWith(
      caches.match(request).then(response => {
        const fetchPromise = fetch(request).then(fetchResponse => {
          if (fetchResponse.ok) {
            const responseClone = fetchResponse.clone();
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return fetchResponse;
        }).catch(() => response);

        return response || fetchPromise;
      })
    );
    return;
  }

  // Contenido dinámico - Network First
  event.respondWith(
    fetch(request).then(response => {
      if (response.ok) {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then(cache => {
          cache.put(request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      return caches.match(request).then(response => {
        return response || caches.match('/index.html');
      });
    })
  );
});

// Manejo de mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: '2.0.0' });
  }
});

// Sincronización en background (cuando vuelva la conexión)
self.addEventListener('sync', (event) => {
  console.log('SW: Sincronización en background:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aquí se pueden sincronizar datos guardados offline
      console.log('Sincronizando datos offline...')
    );
  }
});

// Notificaciones Push mejoradas
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nueva notificación de Glasgow Scale',
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Abrir aplicación',
          icon: '/icon-72x72.png'
        },
        {
          action: 'close',
          title: 'Cerrar',
          icon: '/icon-72x72.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Glasgow Scale', options)
    );
  }
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Click en notificación:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        for (let client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Limpieza periódica de caché
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then(cache => {
        return cache.keys().then(requests => {
          const oldRequests = requests.filter(request => {
            const url = new URL(request.url);
            return Date.now() - url.searchParams.get('timestamp') > 7 * 24 * 60 * 60 * 1000; // 7 días
          });
          
          return Promise.all(
            oldRequests.map(request => cache.delete(request))
          );
        });
      })
    );
  }
});
