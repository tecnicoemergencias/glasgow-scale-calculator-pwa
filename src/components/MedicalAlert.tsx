
import React, { useEffect } from 'react';
import { AlertTriangle, Bell } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/hooks/useLanguage';

interface MedicalAlertProps {
  score: number;
  onAlert?: (message: string) => void;
}

const MedicalAlert: React.FC<MedicalAlertProps> = ({ score, onAlert }) => {
  const { t } = useLanguage();

  useEffect(() => {
    if (score <= 8 && score > 0) {
      const message = t.alerts.critical;
      onAlert?.(message);
      
      // Notificación del navegador si está soportada
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Glasgow Scale - Alerta Crítica', {
          body: message,
          icon: '/icon-192x192.png',
          tag: 'glasgow-critical'
        });
      }
    } else if (score >= 3 && score <= 8) {
      const message = t.alerts.severe;
      onAlert?.(message);
    }
  }, [score, onAlert, t]);

  if (score === 0) return null;

  const getAlertType = () => {
    if (score <= 8) return 'critical';
    if (score <= 12) return 'severe';
    return null;
  };

  const alertType = getAlertType();
  if (!alertType) return null;

  return (
    <Alert 
      variant="destructive" 
      className="mb-6 border-red-500 bg-red-50"
      role="alert"
      aria-live="assertive"
    >
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="font-medium">
        {alertType === 'critical' ? t.alerts.critical : t.alerts.severe}
      </AlertDescription>
    </Alert>
  );
};

export default MedicalAlert;
