import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  historyRepository,
  parseStoredRecord,
  INITIAL_DEMO_RECORD,
} from '../src/features/history/repository';
import type { DiagnosisRecord } from '../src/types';

describe('History repository & validation', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('validates a correct stored record', () => {
    const valid = parseStoredRecord(INITIAL_DEMO_RECORD);
    expect(valid).not.toBeNull();
    expect(valid?.id).toBe(INITIAL_DEMO_RECORD.id);
  });

  it('rejects malformed records with invalid confidence (> 1 or < 0)', () => {
    const overOne = { ...INITIAL_DEMO_RECORD, confidence: 1.5 };
    expect(parseStoredRecord(overOne)).toBeNull();

    const negative = { ...INITIAL_DEMO_RECORD, confidence: -0.1 };
    expect(parseStoredRecord(negative)).toBeNull();
  });

  it('rejects records with invalid status or unsupported crop', () => {
    const badStatus = { ...INITIAL_DEMO_RECORD, status: 'unknown_xyz' };
    expect(parseStoredRecord(badStatus)).toBeNull();

    const badCrop = { ...INITIAL_DEMO_RECORD, cropId: 'banana' };
    expect(parseStoredRecord(badCrop)).toBeNull();
  });

  it('seeds INITIAL_DEMO_RECORDS on empty storage and allows adding new records', async () => {
    const initial = await historyRepository.list();
    expect(initial.length).toBe(4);
    expect(initial[0].id).toBe('demo-initial-1');

    const newRecord: DiagnosisRecord = {
      ...INITIAL_DEMO_RECORD,
      id: 'test-rec-2',
      diagnosisClass: 'Новая проверка',
    };

    const updated = await historyRepository.add(newRecord);
    expect(updated.length).toBe(5);
    expect(updated[0].id).toBe('test-rec-2');

    const found = await historyRepository.get('test-rec-2');
    expect(found?.diagnosisClass).toBe('Новая проверка');
  });

  it('validates and parses resultOrigin correctly', () => {
    const valid = parseStoredRecord(INITIAL_DEMO_RECORD);
    expect(valid?.resultOrigin).toBe('demo_sample');

    // Backward compatibility: old record without resultOrigin
    const oldRecord = { ...INITIAL_DEMO_RECORD };
    delete (oldRecord as Record<string, unknown>).resultOrigin;
    const parsed = parseStoredRecord(oldRecord);
    expect(parsed?.resultOrigin).toBe('demo_sample');
  });

  it('removes a record by id and unlinks associated image file', async () => {
    await historyRepository.list(); // seeds demo
    const recordWithPhoto: DiagnosisRecord = {
      ...INITIAL_DEMO_RECORD,
      id: 'photo-rec-1',
      imageUri: 'file:///path/to/plantguard-photos/photo-1.jpg',
    };
    await historyRepository.add(recordWithPhoto);

    const afterRemove = await historyRepository.remove('photo-rec-1');
    expect(afterRemove.some((r) => r.id === 'photo-rec-1')).toBe(false);

    const found = await historyRepository.get('photo-rec-1');
    expect(found).toBeNull();
  });

  it('clears all records completely and handles photo cleanup', async () => {
    await historyRepository.list(); // seeds demo
    await historyRepository.add({
      ...INITIAL_DEMO_RECORD,
      id: 'photo-rec-2',
      imageUri: 'file:///path/to/plantguard-photos/photo-2.jpg',
    });
    await historyRepository.clear();
    const list = await historyRepository.list();
    expect(list).toEqual([]);
  });

  it('recovers gracefully from corrupted JSON payload', async () => {
    await AsyncStorage.setItem('plantguard.history.v1', '{ broken-json :::');
    const list = await historyRepository.list();
    expect(list).toEqual([]);
  });

  it('persists and restores XAI symptomHotspots in history records', async () => {
    const recordWithHotspots: DiagnosisRecord = {
      ...INITIAL_DEMO_RECORD,
      id: 'hotspot-rec-1',
      symptomHotspots: [
        { label: 'Очаг некроза', x: 44, y: 40, type: 'necrosis', description: 'Кольца Alternaria' },
        { label: 'Хлоротичный ореол', x: 58, y: 50, type: 'halo' },
      ],
    };

    await historyRepository.add(recordWithHotspots);
    const retrieved = await historyRepository.get('hotspot-rec-1');
    expect(retrieved?.symptomHotspots).toBeDefined();
    expect(retrieved?.symptomHotspots?.length).toBe(2);
    expect(retrieved?.symptomHotspots?.[0].label).toBe('Очаг некроза');
    expect(retrieved?.symptomHotspots?.[0].type).toBe('necrosis');
    expect(retrieved?.symptomHotspots?.[0].x).toBe(44);
    expect(retrieved?.symptomHotspots?.[0].description).toBe('Кольца Alternaria');
  });
});

