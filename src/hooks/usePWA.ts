
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [swRegistration, setSWRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Detectar si ya está instalada
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isIOSStandalone = (window.navigator as any).standalone === true;
      
      setIsInstalled(isStandalone || (isIOS && isIOSStandalone));
    };

    checkIfInstalled();

    // Solicitar permisos de notificación
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Permiso de notificación:', permission);
      });
    }

    // Registrar Service Worker con manejo mejorado
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })
        .then((registration) => {
          console.log('Service Worker registrado exitosamente:', registration);
          setSWRegistration(registration);
          
          // Verificar actualizaciones cada 60 segundos
          setInterval(() => {
            registration.update();
          }, 60000);
        })
        .catch((error) => {
          console.error('Error al registrar Service Worker:', error);
        });
    }

    // Manejar cambios de conectividad
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Conexión restaurada",
        description: "La aplicación está ahora en línea",
        duration: 3000
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Sin conexión",
        description: "La aplicación funciona completamente offline",
        duration: 5000
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Manejar prompt de instalación
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      setShowInstallPrompt(true);
      
      console.log('Prompt de instalación disponible');
    };

    // Detectar instalación completada
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      
      toast({
        title: "¡Aplicación instalada!",
        description: "La calculadora Glasgow está ahora en su dispositivo",
        duration: 5000
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Manejar actualizaciones de Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        toast({
          title: "Aplicación actualizada",
          description: "Se ha instalado una nueva versión",
          duration: 3000
        });
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Para iOS, mostrar instrucciones manuales
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        toast({
          title: "Instalar en iOS",
          description: "Toca el botón 'Compartir' y selecciona 'Añadir a pantalla de inicio'",
          duration: 8000
        });
        return;
      }
      
      toast({
        title: "Instalación no disponible",
        description: "La aplicación ya está instalada o no es compatible",
        variant: "destructive"
      });
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('Usuario aceptó la instalación');
      } else {
        console.log('Usuario rechazó la instalación');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error durante la instalación:', error);
      toast({
        title: "Error de instalación",
        description: "No se pudo completar la instalación",
        variant: "destructive"
      });
    }
  };

  const dismissInstall = () => {
    setShowInstallPrompt(false);
    toast({
      title: "Recordatorio pospuesto",
      description: "Puedes instalar la aplicación más tarde desde el menú del navegador",
      duration: 4000
    });
  };

  // Función para verificar si hay actualizaciones
  const checkForUpdates = async () => {
    if (swRegistration) {
      try {
        await swRegistration.update();
        console.log('Verificación de actualización completada');
      } catch (error) {
        console.error('Error al verificar actualizaciones:', error);
      }
    }
  };

  // Función para enviar notificación (si está soportado)
  const sendNotification = (title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/lovable-uploads/1edfcd9a-b617-430e-a97f-c120b6840015.png',
        badge: '/lovable-uploads/43c6f307-9318-403d-bd45-5ce621f2ddd5.png',
        ...options
      });
    }
  };

  return {
    isOnline,
    showInstallPrompt,
    isInstalled,
    swRegistration,
    handleInstallClick,
    dismissInstall,
    checkForUpdates,
    sendNotification
  };
};
