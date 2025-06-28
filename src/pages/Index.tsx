import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { useDexieDB, PatientEvaluation } from '@/hooks/useDexieDB';
import { usePWA } from '@/hooks/usePWA';
import LanguageSelector from '@/components/LanguageSelector';
import MedicalAlert from '@/components/MedicalAlert';
import MedicalProtocol from '@/components/MedicalProtocol';
import PatientForm from '@/components/PatientForm';
import EvaluationHistory from '@/components/EvaluationHistory';
import GlasgowEvaluationForm from '@/components/GlasgowEvaluationForm';
import ScoreDisplay from '@/components/ScoreDisplay';
import ActionButtons from '@/components/ActionButtons';
import PWAPrompts from '@/components/PWAPrompts';
import InformationCard from '@/components/InformationCard';

const Index = () => {
  const { t } = useLanguage();
  const { isReady, saveEvaluation } = useDexieDB();
  const { isOnline, showInstallPrompt, handleInstallClick, dismissInstall } = usePWA();
  
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

  // Calcular puntaje total
  const totalScore = Object.values(scores).reduce((sum, score) => sum + (score || 0), 0);

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

  // Guardar evaluación con Dexie
  const saveCurrentEvaluation = async () => {
    if (!validateForm()) {
      toast({
        title: "Formulario incompleto",
        description: "Complete todos los campos de evaluación antes de guardar",
        variant: "destructive"
      });
      return;
    }

    try {
      const evaluation: Omit<PatientEvaluation, 'id'> = {
        patientName: patientData.patientName || undefined,
        patientAge: patientData.patientAge,
        patientId: patientData.patientId || undefined,
        location: patientData.location || undefined,
        evaluator: patientData.evaluator || undefined,
        notes: patientData.notes || undefined,
        scores,
        totalScore,
        interpretation: '',
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

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <PWAPrompts
        isOnline={isOnline}
        showInstallPrompt={showInstallPrompt}
        onInstallClick={handleInstallClick}
        onDismissInstall={dismissInstall}
      />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
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
        <ScoreDisplay totalScore={totalScore} scores={scores} />

        {/* Protocolo médico */}
        <MedicalProtocol score={totalScore} />

        {/* Secciones de evaluación */}
        <GlasgowEvaluationForm
          scores={scores}
          errors={errors}
          onScoreChange={handleScoreChange}
        />

        {/* Controles */}
        <ActionButtons
          totalScore={totalScore}
          isReady={isReady}
          onValidate={validateForm}
          onSave={saveCurrentEvaluation}
          onReset={resetForm}
        />

        {/* Información adicional */}
        <InformationCard />

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
