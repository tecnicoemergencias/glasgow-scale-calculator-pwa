import React, { useState, useEffect } from 'react';
import { Brain, Eye, MessageCircle, Hand, Wifi, WifiOff, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import LanguageSelector from '@/components/LanguageSelector';
import MedicalAlert from '@/components/MedicalAlert';
import MedicalProtocol from '@/components/MedicalProtocol';

const Index = () => {
  const { t } = useLanguage();
  
  // Estados de la aplicación
  const [scores, setScores] = useState({
    ocular: null as number | null,
    verbal: null as number | null,
    motora: null as number | null
  });
  
  const [errors, setErrors] = useState({
    ocular: '',
    verbal: '',
    motora: ''
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Calcular puntaje total
  const totalScore = Object.values(scores).reduce((sum, score) => sum + (score || 0), 0);

  // Interpretación del puntaje
  const getScoreInterpretation = (score: number) => {
    if (score === 0) return { level: 'incomplete', text: t.score.interpretation.incomplete, class: 'score-display' };
    if (score >= 13) return { level: 'normal', text: t.score.interpretation.mild, class: 'score-display score-normal' };
    if (score >= 9) return { level: 'mild', text: t.score.interpretation.moderate, class: 'score-display score-mild' };
    if (score >= 3) return { level: 'moderate', text: t.score.interpretation.severe, class: 'score-display score-moderate' };
    return { level: 'severe', text: t.score.interpretation.critical, class: 'score-display score-severe' };
  };

  const interpretation = getScoreInterpretation(totalScore);

  // Manejar selección de puntaje
  const handleScoreChange = (category: keyof typeof scores, value: number) => {
    setScores(prev => ({ ...prev, [category]: value }));
    setErrors(prev => ({ ...prev, [category]: '' }));
    
    console.log(`Puntaje ${category} cambiado a:`, value);
    toast({
      title: `${t.alerts.updated}`,
      description: `${category.charAt(0).toUpperCase() + category.slice(1)}: ${value} puntos`,
      duration: 2000
    });
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {
      ocular: scores.ocular === null ? t.errors.selectOcular : '',
      verbal: scores.verbal === null ? t.errors.selectVerbal : '',
      motora: scores.motora === null ? t.errors.selectMotor : ''
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  // Resetear formulario
  const resetForm = () => {
    setScores({ ocular: null, verbal: null, motora: null });
    setErrors({ ocular: '', verbal: '', motora: '' });
    toast({
      title: "Formulario reiniciado",
      description: "Todos los valores han sido limpiados",
    });
  };

  // Solicitar permisos de notificación
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Efectos para PWA
  useEffect(() => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado exitosamente:', registration);
        })
        .catch((error) => {
          console.error('Error al registrar Service Worker:', error);
        });
    }

    // Manejar estado de conexión
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Manejar prompt de instalación
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Instalar PWA
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "¡Aplicación instalada!",
          description: "La calculadora Glasgow se ha instalado en su dispositivo",
        });
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  // Renderizar sección de respuesta con accesibilidad mejorada
  const renderSection = (
    category: keyof typeof scores, 
    icon: React.ReactNode, 
    title: string, 
    options: string[],
    descriptions: string[]
  ) => (
    <Card className="medical-card">
      <div className="section-header">
        {icon}
        {title}
      </div>
      
      <fieldset>
        <legend className="sr-only">{title}</legend>
        <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-labelledby={`${category}-title`}>
          {options.map((option, index) => {
            const value = index + 1;
            const isSelected = scores[category] === value;
            return (
              <button
                key={value}
                onClick={() => handleScoreChange(category, value)}
                className={`glasgow-button ${isSelected ? 'selected' : ''}`}
                role="radio"
                aria-checked={isSelected}
                aria-labelledby={`${category}-${value}-label`}
                aria-describedby={`${category}-${value}-desc`}
                tabIndex={isSelected ? 0 : -1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleScoreChange(category, value);
                  }
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="text-left">
                    <div id={`${category}-${value}-label`} className="font-semibold">
                      {value}. {option}
                    </div>
                    <div id={`${category}-${value}-desc`} className="text-xs opacity-75 mt-1">
                      {descriptions[index]}
                    </div>
                  </div>
                  <div className="ml-2 font-bold text-lg" aria-hidden="true">{value}</div>
                </div>
                {isSelected && (
                  <span className="sr-only">{t.accessibility.currentSelection}</span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>
      
      {errors[category] && (
        <div className="error-message" role="alert" aria-live="polite">
          {errors[category]}
        </div>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      {/* Indicador de conexión */}
      {!isOnline && (
        <div className="offline-indicator">
          <WifiOff className="w-4 h-4 inline mr-2" />
          Modo sin conexión
        </div>
      )}

      {/* Prompt de instalación */}
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
              onClick={() => setShowInstallPrompt(false)}
              className="ml-2 text-slate-400 hover:text-slate-600"
              aria-label="Cerrar prompt de instalación"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex gap-2 mt-3">
            <Button onClick={handleInstallClick} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Instalar
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header con selector de idioma */}
        <div className="text-center mb-8">
          <div className="flex justify-end mb-4">
            <LanguageSelector />
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
              {t.title}
            </h1>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Alertas médicas */}
        <MedicalAlert 
          score={totalScore} 
          onAlert={(message) => {
            toast({
              title: "Alerta Médica",
              description: message,
              variant: "destructive",
              duration: 5000
            });
          }}
        />

        {/* Puntaje Total */}
        <Card className={interpretation.class}>
          <div className="text-center">
            <div 
              className="text-sm font-medium opacity-75 mb-2"
              aria-label={t.accessibility.totalScore}
            >
              {t.score.total}
            </div>
            <div className="text-5xl font-bold mb-2" role="status" aria-live="polite">
              {totalScore}/15
            </div>
            <div className="text-lg font-semibold">{interpretation.text}</div>
            {totalScore > 0 && (
              <div className="text-sm opacity-75 mt-2">
                {t.ocular.title.split(' ')[1]}: {scores.ocular || 0} + {t.verbal.title.split(' ')[1]}: {scores.verbal || 0} + {t.motor.title.split(' ')[1]}: {scores.motora || 0}
              </div>
            )}
          </div>
        </Card>

        {/* Protocolo médico */}
        <MedicalProtocol score={totalScore} />

        {/* Secciones de evaluación */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {renderSection(
            'ocular',
            <Eye className="w-5 h-5 text-blue-600" />,
            t.ocular.title,
            t.ocular.options,
            t.ocular.descriptions
          )}
          
          {renderSection(
            'verbal',
            <MessageCircle className="w-5 h-5 text-green-600" />,
            t.verbal.title,
            t.verbal.options,
            t.verbal.descriptions
          )}
          
          {renderSection(
            'motora',
            <Hand className="w-5 h-5 text-orange-600" />,
            t.motor.title,
            t.motor.options,
            t.motor.descriptions
          )}
        </div>

        {/* Controles */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={validateForm}
            className="px-8 py-3"
            disabled={totalScore === 0}
            aria-describedby="validate-help"
          >
            {t.buttons.validate}
          </Button>
          
          <Button
            onClick={resetForm}
            variant="outline"
            className="px-8 py-3"
            disabled={totalScore === 0}
          >
            {t.buttons.clear}
          </Button>
        </div>

        {/* Información adicional */}
        <Card className="medical-card mt-8">
          <h3 className="font-semibold text-slate-800 mb-4">Interpretación de Resultados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-green-700">13-15 puntos: {t.score.interpretation.mild}</div>
              <div className="text-slate-600">Traumatismo craneal leve</div>
            </div>
            <div>
              <div className="font-medium text-yellow-700">9-12 puntos: {t.score.interpretation.moderate}</div>
              <div className="text-slate-600">Traumatismo craneal moderado</div>
            </div>
            <div>
              <div className="font-medium text-orange-700">3-8 puntos: {t.score.interpretation.severe}</div>
              <div className="text-slate-600">Traumatismo craneal severo</div>
            </div>
            <div>
              <div className="font-medium text-red-700">≤ 8 puntos: {t.score.interpretation.critical}</div>
              <div className="text-slate-600">Indica coma, requiere intubación</div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>Calculadora Escala de Glasgow v1.0.0</p>
          <p>Para uso por profesionales médicos capacitados</p>
          {!isOnline && <p className="text-orange-600 font-medium">✓ Funcionando sin conexión</p>}
        </div>
      </div>
    </div>
  );
};

export default Index;
