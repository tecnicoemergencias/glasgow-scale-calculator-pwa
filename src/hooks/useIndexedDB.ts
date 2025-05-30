
import { useState, useEffect } from 'react';

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

const DB_NAME = 'GlasgowCalculatorDB';
const DB_VERSION = 1;
const STORE_NAME = 'evaluations';

export const useIndexedDB = () => {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { 
              keyPath: 'id', 
              autoIncrement: true 
            });
            
            // Crear índices para búsqueda eficiente
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('patientName', 'patientName', { unique: false });
            store.createIndex('totalScore', 'totalScore', { unique: false });
          }
        };
      });
    };

    initDB()
      .then(database => {
        setDb(database);
        setIsReady(true);
        console.log('IndexedDB inicializada correctamente');
      })
      .catch(error => {
        console.error('Error al inicializar IndexedDB:', error);
      });
  }, []);

  const saveEvaluation = async (evaluation: Omit<PatientEvaluation, 'id'>): Promise<number> => {
    if (!db) throw new Error('Base de datos no disponible');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(evaluation);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  };

  const getEvaluations = async (): Promise<PatientEvaluation[]> => {
    if (!db) throw new Error('Base de datos no disponible');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => {
        const results = request.result.sort((a, b) => b.timestamp - a.timestamp);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  };

  const deleteEvaluation = async (id: number): Promise<void> => {
    if (!db) throw new Error('Base de datos no disponible');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const getEvaluationsByPatient = async (patientName: string): Promise<PatientEvaluation[]> => {
    if (!db) throw new Error('Base de datos no disponible');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('patientName');
      const request = index.getAll(patientName);

      request.onsuccess = () => {
        const results = request.result.sort((a, b) => b.timestamp - a.timestamp);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  };

  return {
    isReady,
    saveEvaluation,
    getEvaluations,
    deleteEvaluation,
    getEvaluationsByPatient
  };
};
