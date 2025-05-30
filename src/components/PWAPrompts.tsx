
import React from 'react';
import { Button } from '@/components/ui/button';
import { WifiOff, Download, X } from 'lucide-react';

interface PWAPromptsProps {
  isOnline: boolean;
  showInstallPrompt: boolean;
  onInstallClick: () => void;
  onDismissInstall: () => void;
}

const PWAPrompts: React.FC<PWAPromptsProps> = ({
  isOnline,
  showInstallPrompt,
  onInstallClick,
  onDismissInstall
}) => {
  return (
    <>
      {!isOnline && (
        <div className="offline-indicator">
          <WifiOff className="w-4 h-4 inline mr-2" />
          Modo sin conexión
        </div>
      )}

      {showInstallPrompt && (
        <div className="install-prompt">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800">Instalar Aplicación</h3>
              <p className="text-sm text-slate-600 mt-1">
                Instale la calculadora Glasgow para acceso rápido y uso sin conexión
              </p>
            </div>
            <button
              onClick={onDismissInstall}
              className="ml-2 text-slate-400 hover:text-slate-600"
              aria-label="Cerrar prompt de instalación"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex gap-2 mt-3">
            <Button onClick={onInstallClick} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Instalar
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAPrompts;
