import { offlineQueue } from '../src/features/diagnosis/offline-queue';
import { historyRepository } from '../src/features/history/repository';
import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('expo-network');
jest.mock('../src/providers', () => ({
  createProvider: jest.fn(() => ({
    analyze: jest.fn().mockResolvedValue({
      status: 'prediction',
      diagnosisClass: 'Тест',
    }),
  })),
}));

describe('offlineQueue', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('enqueues a job and saves to storage', async () => {
    (Network.getNetworkStateAsync as jest.Mock).mockResolvedValue({ isConnected: false });
    
    await offlineQueue.enqueue('rec-1', { imageUri: 'test.jpg', cropId: 'tomato' });
    
    const queue = await offlineQueue.getQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].id).toBe('rec-1');
  });

  it('processes queue when network is available', async () => {
    (Network.getNetworkStateAsync as jest.Mock).mockResolvedValue({ isConnected: true });
    
    // Подготовка: создаем запись в истории и добавляем в очередь
    await historyRepository.add({
      id: 'rec-1',
      status: 'queued',
      createdAt: '2026',
      cropId: 'tomato',
      crop: 'Томат',
      imageUri: 'test',
      resultOrigin: 'model_prediction',
      explanation: '',
      symptoms: [],
      recommendations: [],
      avoid: [],
      providerMode: 'ai',
      isDemoScenario: false,
    });

    await offlineQueue.enqueue('rec-1', { imageUri: 'test.jpg', cropId: 'tomato' });
    
    // processQueue вызывается автоматически внутри enqueue
    // Подождем немного для выполнения промисов
    await new Promise(r => setTimeout(r, 50));

    const history = await historyRepository.list();
    const record = history.find((r) => r.id === 'rec-1');
    expect(record?.status).toBe('prediction');
    expect(record?.diagnosisClass).toBe('Тест');

    const queue = await offlineQueue.getQueue();
    expect(queue).toHaveLength(0);
  });
});
