import React, { useState, useEffect } from 'react';
import { Brain, Eye, MessageCircle, Hand, Wifi, WifiOff, Download, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { useIndexedDB, PatientEvaluation } from '@/hooks/useIndexedDB';
import LanguageSelector from '@/components/LanguageSelector';
import MedicalAlert from '@/components/MedicalAlert';
import MedicalProtocol from '@/components/MedicalProtocol';
import PatientForm from '@/components/PatientForm';
import EvaluationHistory from '@/components/EvaluationHistory';

const Index = () => {
  const { t } = useLanguage();
  const { isReady, saveEvaluation } = useIndexedDB();
  
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

  const [patientData, setPatientData] = useState({
    patientName: '',
    patientAge: undefined as number | undefined,
    patientId: '',
    location: '',
    evaluator: '',
    notes: ''
  });

  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
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

  // Guardar evaluación
  const saveCurrentEvaluation = async () => {
    if (!validateForm()) {
      toast({
        title: "Formulario incompleto",
        description: "Complete todos los campos de evaluación antes de guardar",
        variant: "destructive"
      });
      return;
    }

    if (!isReady) {
      toast({
        title: "Base de datos no disponible",
        description: "Espere un momento e intente de nuevo",
        variant: "destructive"
      });
      return;
    }

    try {
      const evaluation: Omit<PatientEvaluation, 'id'> = {
        ...patientData,
        scores,
        totalScore,
        interpretation: interpretation.text,
        timestamp: Date.now()
      };

      const id = await saveEvaluation(evaluation);
      
      toast({
        title: "Evaluación guardada",
        description: `Evaluación #${id} guardada correctamente`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error al guardar evaluación:', error);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la evaluación",
        variant: "destructive"
      });
    }
  };

  // Cargar evaluación desde historial
  const loadEvaluation = (evaluation: PatientEvaluation) => {
    setScores(evaluation.scores);
    setPatientData({
      patientName: evaluation.patientName || '',
      patientAge: evaluation.patientAge,
      patientId: evaluation.patientId || '',
      location: evaluation.location || '',
      evaluator: evaluation.evaluator || '',
      notes: evaluation.notes || ''
    });
    setShowHistory(false);
  };

  // Resetear formulario
  const resetForm = () => {
    setScores({ ocular: null, verbal: null, motora: null });
    setErrors({ ocular: '', verbal: '', motora: '' });
    setPatientData({
      patientName: '',
      patientAge: undefined,
      patientId: '',
      location: '',
      evaluator: '',
      notes: ''
    });
    toast({
      title: "Formulario reiniciado",
      description: "Todos los valores han sido limpiados",
    });
  };

  // Efectos para PWA
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado exitosamente:', registration);
        })
        .catch((error) => {
          console.error('Error al registrar Service Worker:', error);
        });
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

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

        {/* Formulario de paciente */}
        <PatientForm
          patientData={patientData}
          onPatientDataChange={setPatientData}
          isExpanded={showPatientForm}
          onToggleExpanded={() => setShowPatientForm(!showPatientForm)}
        />

        {/* Historial de evaluaciones */}
        <EvaluationHistory
          isExpanded={showHistory}
          onToggleExpanded={() => setShowHistory(!showHistory)}
          onLoadEvaluation={loadEvaluation}
        />

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

        {/* Controles actualizados con botón de guardar */}
        <div className="flex gap-4 justify-center mb-8">
          <Button
            onClick={validateForm}
            className="px-8 py-3"
            disabled={totalScore === 0}
            aria-describedby="validate-help"
          >
            {t.buttons.validate}
          </Button>
          
          <Button
            onClick={saveCurrentEvaluation}
            variant="outline"
            className="px-8 py-3 flex items-center gap-2"
            disabled={totalScore === 0 || !isReady}
          >
            <Save className="w-4 h-4" />
            Guardar
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
          <p>Calculadora Escala de Glasgow v2.0.0</p>
          <p>Para uso por profesionales médicos capacitados</p>
          {!isOnline && <p className="text-orange-600 font-medium">✓ Funcionando sin conexión</p>}
          {isReady && <p className="text-green-600 font-medium">✓ Base de datos local disponible</p>}
        </div>
      </div>
    </div>
  );
};

export default Index;
