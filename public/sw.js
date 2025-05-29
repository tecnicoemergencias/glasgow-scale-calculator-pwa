
// Service Worker para Glasgow Scale Calculator PWA
const CACHE_NAME = 'glasgow-scale-v1.0.0';
const STATIC_CACHE = 'glasgow-static-v1';
const DYNAMIC_CACHE = 'glasgow-dynamic-v1';

// Archivos estáticos a cachear
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/icon-192x192.png',
  '/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Cacheando archivos estáticos');
        return cache.addAll(STATIC_FILES);
      })
      .catch((error) => {
        console.error('Error al cachear archivos estáticos:', error);
      })
  );
  self.skipWaiting();
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Eliminando caché antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
  self.clients.claim();
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  // Solo cachear requests GET
  if (event.request.method !== 'GET') return;
  
  // Estrategia Cache First para archivos estáticos
  if (STATIC_FILES.some(file => event.request.url.includes(file))) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
        .catch(() => {
          // Fallback para navegación offline
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        })
    );
    return;
  }

  // Estrategia Network First para contenido dinámico
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cachear respuestas exitosas
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Fallback al caché
        return caches.match(event.request)
          .then((response) => {
            return response || caches.match('/index.html');
          });
      })
  );
});

// Notificaciones push (opcional para futuras funcionalidades)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png'
    });
  }
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
