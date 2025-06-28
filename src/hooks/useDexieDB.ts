
import { useLiveQuery } from 'dexie-react-hooks';
import { Dexie, Table } from 'dexie';

export interface PatientEvaluation {
  id?: number;
  patientName?: string;
  patientAge?: number;
  patientId?: string;
  location?: string;
  evaluator?: string;
  notes?: string;
  scores: {
    ocular: number | null;
    verbal: number | null;
    motora: number | null;
  };
  totalScore: number;
  interpretation: string;
  timestamp: number;
}

export class GlasgowDB extends Dexie {
  evaluations!: Table<PatientEvaluation>;

  constructor() {
    super('GlasgowCalculatorDB');
    
    this.version(1).stores({
      evaluations: '++id, timestamp, patientName, totalScore, patientId, location, evaluator'
    });
  }
}

export const db = new GlasgowDB();

export const useDexieDB = () => {
  // Live query que se actualiza automáticamente
  const evaluations = useLiveQuery(
    () => db.evaluations.orderBy('timestamp').reverse().toArray()
  );

  const saveEvaluation = async (evaluation: Omit<PatientEvaluation, 'id'>): Promise<number> => {
    return await db.evaluations.add(evaluation);
  };

  const getEvaluations = async (): Promise<PatientEvaluation[]> => {
    return await db.evaluations.orderBy('timestamp').reverse().toArray();
  };

  const deleteEvaluation = async (id: number): Promise<void> => {
    await db.evaluations.delete(id);
  };

  const getEvaluationsByPatient = async (patientName: string): Promise<PatientEvaluation[]> => {
    return await db.evaluations
      .where('patientName')
      .equals(patientName)
      .reverse()
      .sortBy('timestamp');
  };

  const searchEvaluations = async (query: string): Promise<PatientEvaluation[]> => {
    const lowerQuery = query.toLowerCase();
    return await db.evaluations
      .filter(evaluation => 
        evaluation.patientName?.toLowerCase().includes(lowerQuery) ||
        evaluation.patientId?.toLowerCase().includes(lowerQuery) ||
        evaluation.location?.toLowerCase().includes(lowerQuery) ||
        evaluation.evaluator?.toLowerCase().includes(lowerQuery) ||
        evaluation.notes?.toLowerCase().includes(lowerQuery)
      )
      .reverse()
      .sortBy('timestamp');
  };

  const getEvaluationsByScoreRange = async (minScore: number, maxScore: number): Promise<PatientEvaluation[]> => {
    return await db.evaluations
      .where('totalScore')
      .between(minScore, maxScore, true, true)
      .reverse()
      .sortBy('timestamp');
  };

  const clearAllEvaluations = async (): Promise<void> => {
    await db.evaluations.clear();
  };

  const exportAllData = async (): Promise<PatientEvaluation[]> => {
    return await db.evaluations.toArray();
  };

  const importData = async (data: Omit<PatientEvaluation, 'id'>[]): Promise<void> => {
    await db.evaluations.bulkAdd(data);
  };

  return {
    isReady: true, // Dexie está siempre listo
    evaluations: evaluations || [], // Array reactivo que se actualiza automáticamente
    saveEvaluation,
    getEvaluations,
    deleteEvaluation,
    getEvaluationsByPatient,
    searchEvaluations,
    getEvaluationsByScoreRange,
    clearAllEvaluations,
    exportAllData,
    importData
  };
};
