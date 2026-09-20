import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { AppState } from 'react-native';
import { AnalyzeRequest, DiagnosisRecord } from '../../types';
import { createProvider } from '../../providers';
import { historyRepository } from '../history/repository';
import { appConfig } from '../../config';

const QUEUE_STORAGE_KEY = '@plantguard_offline_queue';

export interface QueuedJob {
  id: string; // Refers to the DiagnosisRecord id
  request: AnalyzeRequest;
  createdAt: number;
}

class OfflineQueueService {
  private isProcessing = false;

  constructor() {
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        this.processQueue();
      }
    });
  }

  async enqueue(recordId: string, request: AnalyzeRequest) {
    const queue = await this.getQueue();
    queue.push({ id: recordId, request, createdAt: Date.now() });
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    
    // Attempt processing immediately in case network just flipped
    this.processQueue();
  }

  async getQueue(): Promise<QueuedJob[]> {
    try {
      const data = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const state = await Network.getNetworkStateAsync();
      if (!state.isConnected) {
        this.isProcessing = false;
        return;
      }

      let queue = await this.getQueue();
      if (queue.length === 0) {
        this.isProcessing = false;
        return;
      }

      // Sort older first
      queue.sort((a, b) => a.createdAt - b.createdAt);

      const provider = createProvider(appConfig.configuredMode);

      for (const job of queue) {
        try {
          const result = await provider.analyze(job.request);
          
          await historyRepository.update(job.id, result);

          // Remove from queue upon success
          queue = queue.filter((q: QueuedJob) => q.id !== job.id);
          await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
        } catch (e) {
          // If a job fails, we stop processing the queue for now and will retry later
          console.warn('[OfflineQueue] Job failed', e);
          break;
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }
}

export const offlineQueue = new OfflineQueueService();
