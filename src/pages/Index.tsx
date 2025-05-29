
import React, { useState, useEffect } from 'react';
import { Brain, Eye, MessageCircle, Hand, Wifi, WifiOff, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

// Datos de la Escala de Glasgow
const glasgowData = {
  ocular: [
    { value: 4, label: "Espontánea", description: "Abre los ojos espontáneamente" },
    { value: 3, label: "Al habla", description: "Abre los ojos cuando se le habla" },
    { value: 2, label: "Al dolor", description: "Abre los ojos solo ante estímulo doloroso" },
    { value: 1, label: "No responde", description: "No abre los ojos ante ningún estímulo" }
  ],
  verbal: [
    { value: 5, label: "Orientada", description: "Conversación normal, orientado en tiempo y espacio" },
    { value: 4, label: "Confusa", description: "Conversa pero está desorientado" },
    { value: 3, label: "Inapropiada", description: "Palabras inapropiadas, no mantiene conversación" },
    { value: 2, label: "Incomprensible", description: "Sonidos incomprensibles, gemidos" },
    { value: 1, label: "No responde", description: "No emite sonidos" }
  ],
  motora: [
    { value: 6, label: "Obedece órdenes", description: "Obedece órdenes simples" },
    { value: 5, label: "Localiza dolor", description: "Localiza estímulos dolorosos" },
    { value: 4, label: "Retirada", description: "Retirada ante el dolor" },
    { value: 3, label: "Flexión anormal", description: "Flexión anormal (decorticación)" },
    { value: 2, label: "Extensión", description: "Extensión anormal (descerebración)" },
    { value: 1, label: "No responde", description: "No hay respuesta motora" }
  ]
};

const Index = () => {
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
    if (score === 0) return { level: 'incomplete', text: 'Incompleto', class: 'score-display' };
    if (score >= 13) return { level: 'normal', text: 'Leve', class: 'score-display score-normal' };
    if (score >= 9) return { level: 'mild', text: 'Moderado', class: 'score-display score-mild' };
    if (score >= 3) return { level: 'moderate', text: 'Severo', class: 'score-display score-moderate' };
    return { level: 'severe', text: 'Crítico', class: 'score-display score-severe' };
  };

  const interpretation = getScoreInterpretation(totalScore);

  // Manejar selección de puntaje
  const handleScoreChange = (category: keyof typeof scores, value: number) => {
    setScores(prev => ({ ...prev, [category]: value }));
    setErrors(prev => ({ ...prev, [category]: '' }));
    
    console.log(`Puntaje ${category} cambiado a:`, value);
    toast({
      title: "Puntaje actualizado",
      description: `${category.charAt(0).toUpperCase() + category.slice(1)}: ${value} puntos`,
      duration: 2000
    });
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {
      ocular: scores.ocular === null ? 'Seleccione una respuesta ocular' : '',
      verbal: scores.verbal === null ? 'Seleccione una respuesta verbal' : '',
      motora: scores.motora === null ? 'Seleccione una respuesta motora' : ''
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

  // Renderizar sección de respuesta
  const renderSection = (category: keyof typeof scores, icon: React.ReactNode, title: string, data: any[]) => (
    <Card className="medical-card">
      <div className="section-header">
        {icon}
        {title}
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {data.map((item) => (
          <button
            key={item.value}
            onClick={() => handleScoreChange(category, item.value)}
            className={`glasgow-button ${scores[category] === item.value ? 'selected' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div className="text-left">
                <div className="font-semibold">{item.value}. {item.label}</div>
                <div className="text-xs opacity-75 mt-1">{item.description}</div>
              </div>
              <div className="ml-2 font-bold text-lg">{item.value}</div>
            </div>
          </button>
        ))}
      </div>
      
      {errors[category] && (
        <div className="error-message">{errors[category]}</div>
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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
              Escala de Coma de Glasgow
            </h1>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Herramienta profesional para la evaluación del nivel de consciencia. 
            Funciona sin conexión y se puede instalar en su dispositivo.
          </p>
        </div>

        {/* Puntaje Total */}
        <Card className={interpretation.class}>
          <div className="text-center">
            <div className="text-sm font-medium opacity-75 mb-2">PUNTAJE TOTAL</div>
            <div className="text-5xl font-bold mb-2">{totalScore}/15</div>
            <div className="text-lg font-semibold">{interpretation.text}</div>
            {totalScore > 0 && (
              <div className="text-sm opacity-75 mt-2">
                Ocular: {scores.ocular || 0} + Verbal: {scores.verbal || 0} + Motora: {scores.motora || 0}
              </div>
            )}
          </div>
        </Card>

        {/* Secciones de evaluación */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {renderSection(
            'ocular',
            <Eye className="w-5 h-5 text-blue-600" />,
            'Respuesta Ocular (1-4)',
            glasgowData.ocular
          )}
          
          {renderSection(
            'verbal',
            <MessageCircle className="w-5 h-5 text-green-600" />,
            'Respuesta Verbal (1-5)',
            glasgowData.verbal
          )}
          
          {renderSection(
            'motora',
            <Hand className="w-5 h-5 text-orange-600" />,
            'Respuesta Motora (1-6)',
            glasgowData.motora
          )}
        </div>

        {/* Controles */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={validateForm}
            className="px-8 py-3"
            disabled={totalScore === 0}
          >
            Validar Evaluación
          </Button>
          
          <Button
            onClick={resetForm}
            variant="outline"
            className="px-8 py-3"
            disabled={totalScore === 0}
          >
            Limpiar
          </Button>
        </div>

        {/* Información adicional */}
        <Card className="medical-card mt-8">
          <h3 className="font-semibold text-slate-800 mb-4">Interpretación de Resultados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-green-700">13-15 puntos: Leve</div>
              <div className="text-slate-600">Traumatismo craneal leve</div>
            </div>
            <div>
              <div className="font-medium text-yellow-700">9-12 puntos: Moderado</div>
              <div className="text-slate-600">Traumatismo craneal moderado</div>
            </div>
            <div>
              <div className="font-medium text-orange-700">3-8 puntos: Severo</div>
              <div className="text-slate-600">Traumatismo craneal severo</div>
            </div>
            <div>
              <div className="font-medium text-red-700">≤ 8 puntos: Crítico</div>
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
