import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { History, Trash2, User, Calendar, MapPin, FileText, Download, Search, Filter } from 'lucide-react';
import { useDexieDB, PatientEvaluation } from '@/hooks/useDexieDB';
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
  const { evaluations, deleteEvaluation, searchEvaluations, getEvaluationsByScoreRange, exportAllData } = useDexieDB();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvaluations, setFilteredEvaluations] = useState<PatientEvaluation[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [minScore, setMinScore] = useState<number | ''>('');
  const [maxScore, setMaxScore] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const displayEvaluations = filteredEvaluations.length > 0 ? filteredEvaluations : evaluations;

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredEvaluations([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchEvaluations(searchQuery);
      setFilteredEvaluations(results);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      toast({
        title: "Error de búsqueda",
        description: "No se pudo realizar la búsqueda",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScoreFilter = async () => {
    if (minScore === '' || maxScore === '') {
      toast({
        title: "Filtro incompleto",
        description: "Ingrese valores mínimo y máximo",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const results = await getEvaluationsByScoreRange(Number(minScore), Number(maxScore));
      setFilteredEvaluations(results);
    } catch (error) {
      console.error('Error en filtro:', error);
      toast({
        title: "Error de filtro",
        description: "No se pudo aplicar el filtro",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilteredEvaluations([]);
    setMinScore('');
    setMaxScore('');
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteEvaluation(id);
      toast({
        title: "Evaluación eliminada",
        description: "La evaluación se ha eliminado correctamente"
      });
      setFilteredEvaluations(prev => prev.filter(evalu => evalu.id !== id));
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

  const exportToCSV = async () => {
    try {
      const allData = await exportAllData();
      
      if (allData.length === 0) {
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

      const csvData = allData.map(evaluation => [
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
    } catch (error) {
      console.error('Error al exportar:', error);
      toast({
        title: "Error de exportación",
        description: "No se pudo exportar los datos",
        variant: "destructive"
      });
    }
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
          {/* Búsqueda y filtros */}
          <div className="space-y-3 mb-4">
            <div className="flex gap-2">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Buscar por nombre, ID, ubicación..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading} size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {showFilters && (
              <div className="flex gap-2 items-end p-3 bg-slate-50 rounded">
                <div>
                  <label className="text-xs text-slate-600">Puntaje mín.</label>
                  <Input
                    type="number"
                    min="3"
                    max="15"
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value ? Number(e.target.value) : '')}
                    className="w-20"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600">Puntaje máx.</label>
                  <Input
                    type="number"
                    min="3"
                    max="15"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value ? Number(e.target.value) : '')}
                    className="w-20"
                  />
                </div>
                <Button onClick={handleScoreFilter} disabled={loading} size="sm">
                  Filtrar
                </Button>
                <Button onClick={clearFilters} variant="outline" size="sm">
                  Limpiar
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-slate-600">
              {displayEvaluations.length} evaluación(es)
              {filteredEvaluations.length > 0 && ' (filtradas)'}
            </span>
            
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
              Procesando...
            </div>
          ) : displayEvaluations.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {filteredEvaluations.length === 0 && searchQuery ? 
                'No se encontraron resultados' : 
                'No hay evaluaciones guardadas'
              }
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {displayEvaluations.map((evaluation) => (
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
