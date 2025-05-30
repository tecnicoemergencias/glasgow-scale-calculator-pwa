
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Trash2, User, Calendar, MapPin, FileText, Download } from 'lucide-react';
import { useIndexedDB, PatientEvaluation } from '@/hooks/useIndexedDB';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';

interface EvaluationHistoryProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onLoadEvaluation?: (evaluation: PatientEvaluation) => void;
}

const EvaluationHistory: React.FC<EvaluationHistoryProps> = ({
  isExpanded,
  onToggleExpanded,
  onLoadEvaluation
}) => {
  const { t } = useLanguage();
  const { isReady, getEvaluations, deleteEvaluation } = useIndexedDB();
  const [evaluations, setEvaluations] = useState<PatientEvaluation[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEvaluations = async () => {
    if (!isReady) return;
    
    setLoading(true);
    try {
      const data = await getEvaluations();
      setEvaluations(data);
    } catch (error) {
      console.error('Error al cargar evaluaciones:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las evaluaciones guardadas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded && isReady) {
      loadEvaluations();
    }
  }, [isExpanded, isReady]);

  const handleDelete = async (id: number) => {
    try {
      await deleteEvaluation(id);
      await loadEvaluations();
      toast({
        title: "Evaluación eliminada",
        description: "La evaluación se ha eliminado correctamente"
      });
    } catch (error) {
      console.error('Error al eliminar evaluación:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la evaluación",
        variant: "destructive"
      });
    }
  };

  const handleLoad = (evaluation: PatientEvaluation) => {
    onLoadEvaluation?.(evaluation);
    toast({
      title: "Evaluación cargada",
      description: "Los datos se han cargado en el formulario"
    });
  };

  const exportToCSV = () => {
    if (evaluations.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay evaluaciones para exportar",
        variant: "destructive"
      });
      return;
    }

    const headers = [
      'Fecha', 'Paciente', 'Edad', 'ID', 'Ubicación', 'Evaluador',
      'Ocular', 'Verbal', 'Motora', 'Total', 'Interpretación', 'Observaciones'
    ];

    const csvData = evaluations.map(evaluation => [
      new Date(evaluation.timestamp).toLocaleString(),
      evaluation.patientName || '',
      evaluation.patientAge || '',
      evaluation.patientId || '',
      evaluation.location || '',
      evaluation.evaluator || '',
      evaluation.scores.ocular || '',
      evaluation.scores.verbal || '',
      evaluation.scores.motora || '',
      evaluation.totalScore,
      evaluation.interpretation,
      evaluation.notes || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `glasgow_evaluations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 13) return 'text-green-700';
    if (score >= 9) return 'text-yellow-700';
    if (score >= 3) return 'text-orange-700';
    return 'text-red-700';
  };

  return (
    <Card className="medical-card mb-6">
      <button
        onClick={onToggleExpanded}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="history-content"
      >
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-slate-800">
            Historial de Evaluaciones
          </h3>
          <span className="text-sm text-slate-500">
            ({evaluations.length})
          </span>
        </div>
        <span className="text-slate-400">
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {isExpanded && (
        <div id="history-content" className="px-4 pb-4">
          <div className="flex justify-between items-center mb-4">
            <Button
              onClick={loadEvaluations}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Actualizar'}
            </Button>
            
            {evaluations.length > 0 && (
              <Button
                onClick={exportToCSV}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-500">
              Cargando evaluaciones...
            </div>
          ) : evaluations.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No hay evaluaciones guardadas
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {evaluations.map((evaluation) => (
                <div
                  key={evaluation.id}
                  className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium">
                          {formatDate(evaluation.timestamp)}
                        </span>
                        <span className={`font-bold ${getScoreColor(evaluation.totalScore)}`}>
                          {evaluation.totalScore}/15
                        </span>
                      </div>
                      
                      {evaluation.patientName && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User className="w-3 h-3" />
                          {evaluation.patientName}
                          {evaluation.patientAge && ` (${evaluation.patientAge} años)`}
                        </div>
                      )}
                      
                      {evaluation.location && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-3 h-3" />
                          {evaluation.location}
                        </div>
                      )}
                      
                      <div className="text-xs text-slate-500 mt-1">
                        O:{evaluation.scores.ocular} V:{evaluation.scores.verbal} M:{evaluation.scores.motora}
                      </div>
                    </div>
                    
                    <div className="flex gap-1 ml-2">
                      <Button
                        onClick={() => handleLoad(evaluation)}
                        variant="outline"
                        size="sm"
                        className="px-2 py-1 h-auto text-xs"
                      >
                        Cargar
                      </Button>
                      <Button
                        onClick={() => evaluation.id && handleDelete(evaluation.id)}
                        variant="outline"
                        size="sm"
                        className="px-2 py-1 h-auto text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {evaluation.notes && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded mt-2">
                      <FileText className="w-3 h-3 inline mr-1" />
                      {evaluation.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default EvaluationHistory;
