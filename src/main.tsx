
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Función para mostrar indicador de carga mejorado
const showAppLoadingState = () => {
  const loadingEl = document.getElementById('app-loading');
  if (loadingEl) {
    loadingEl.style.display = 'flex';
  }
};

const hideAppLoadingState = () => {
  const loadingEl = document.getElementById('app-loading');
  if (loadingEl) {
    loadingEl.style.opacity = '0';
    setTimeout(() => {
      if (loadingEl.parentNode) {
        loadingEl.parentNode.removeChild(loadingEl);
      }
    }, 300);
  }
};

// Manejo de errores global
window.addEventListener('error', (event) => {
  console.error('Error global capturado:', event.error);
  // En producción, podrías enviar esto a un servicio de logging
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rechazada sin manejar:', event.reason);
  event.preventDefault();
});

// Registrar Service Worker con manejo de errores robusto
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      console.log('SW registrado: ', registration);

      // Manejar actualizaciones del Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Nueva versión disponible
                console.log('Nueva versión del SW disponible');
                
                // Mostrar notificación de actualización disponible
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('Actualización disponible', {
                    body: 'Una nueva versión de la aplicación está lista.',
                    icon: '/icon-192x192.png',
                    tag: 'update-available'
                  });
                }
              } else {
                // Primera instalación
                console.log('SW instalado por primera vez');
              }
            }
          });
        }
      });

    } catch (registrationError) {
      console.warn('Fallo en registro de SW:', registrationError);
      // La aplicación seguirá funcionando sin SW
    }
  });

  // Recargar cuando el SW tome control
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('SW actualizado, recargando...');
    window.location.reload();
  });
}

// Configuración de performance y métricas
if ('performance' in window && 'measure' in performance) {
  // Marcar inicio de la aplicación
  performance.mark('app-start');
  
  window.addEventListener('load', () => {
    performance.mark('app-loaded');
    performance.measure('app-load-time', 'app-start', 'app-loaded');
    
    const loadTime = performance.getEntriesByName('app-load-time')[0];
    console.log(`Tiempo de carga de la aplicación: ${loadTime.duration.toFixed(2)}ms`);
  });
}

// Función para verificar capacidades PWA
const checkPWACapabilities = () => {
  const capabilities = {
    serviceWorker: 'serviceWorker' in navigator,
    indexedDB: 'indexedDB' in window,
    notifications: 'Notification' in window,
    cache: 'caches' in window,
    fetch: 'fetch' in window,
    Promise: 'Promise' in window
  };
  
  console.log('Capacidades PWA:', capabilities);
  
  const missingFeatures = Object.entries(capabilities)
    .filter(([_, supported]) => !supported)
    .map(([feature]) => feature);
    
  if (missingFeatures.length > 0) {
    console.warn('Características PWA no soportadas:', missingFeatures);
  }
  
  return capabilities;
};

// Verificar capacidades al cargar
checkPWACapabilities();

// Optimización para dispositivos móviles
const optimizeForMobile = () => {
  // Prevenir zoom en inputs en iOS
  const viewport = document.querySelector('meta[name=viewport]');
  if (viewport && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
    viewport.setAttribute('content', 
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    );
  }
  
  // Mejoras de rendimiento para móviles
  if ('deviceMemory' in navigator && (navigator as any).deviceMemory < 4) {
    console.log('Dispositivo con memoria limitada detectado, aplicando optimizaciones');
    // Aquí se pueden aplicar optimizaciones específicas
  }
};

optimizeForMobile();

// Renderizar la aplicación
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Elemento root no encontrado');
}

const root = createRoot(rootElement);

// Renderizar con manejo de errores
try {
  showAppLoadingState();
  
  root.render(<App />);
  
  // Ocultar loading después de que React haya renderizado
  setTimeout(hideAppLoadingState, 100);
  
} catch (error) {
  console.error('Error al renderizar la aplicación:', error);
  
  // Mostrar página de error básica
  rootElement.innerHTML = `
    <div style="
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      padding: 20px; 
      text-align: center;
      font-family: Inter, sans-serif;
    ">
      <h1 style="color: #dc2626; margin-bottom: 16px;">Error de Aplicación</h1>
      <p style="color: #64748b; margin-bottom: 24px;">
        Ha ocurrido un error al cargar la aplicación. 
        Por favor, recargue la página.
      </p>
      <button 
        onclick="window.location.reload()" 
        style="
          background: #2563eb; 
          color: white; 
          border: none; 
          padding: 12px 24px; 
          border-radius: 6px; 
          cursor: pointer;
          font-weight: 500;
        "
      >
        Recargar Página
      </button>
    </div>
  `;
}
