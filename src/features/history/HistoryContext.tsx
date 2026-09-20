import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { DiagnosisRecord } from '../../types';
import { HistoryStorageError, historyRepository } from './repository';

interface HistoryState {
  records: DiagnosisRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addRecord: (record: DiagnosisRecord) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const HistoryContext = createContext<HistoryState | null>(null);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await historyRepository.list();
      setRecords(list);
    } catch {
      setError('Не удалось загрузить историю');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await historyRepository.list();
        if (active) {
          setRecords(list);
          setError(null);
        }
      } catch {
        if (active) {
          setError('Не удалось загрузить историю');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const addRecord = useCallback(async (record: DiagnosisRecord) => {
    const next = await historyRepository.add(record);
    setRecords(next);
  }, []);

  const removeRecord = useCallback(async (id: string) => {
    const next = await historyRepository.remove(id);
    setRecords(next);
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await historyRepository.clear();
      setRecords([]);
      setError(null);
    } catch (storageError) {
      if (storageError instanceof HistoryStorageError) {
        setError('Не удалось очистить историю');
      }
    }
  }, []);

  return (
    <HistoryContext.Provider
      value={{ records, loading, error, refresh, addRecord, removeRecord, clearAll }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory(): HistoryState {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within HistoryProvider');
  }
  return context;
}
