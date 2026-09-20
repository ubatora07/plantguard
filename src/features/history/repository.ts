import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  CropId,
  DiagnosisRecord,
  DiagnosisStatus,
  ProviderMode,
  ResultOrigin,
} from '../../types';
import { deletePersistedImage } from '../../utils/images';

const HISTORY_KEY = 'plantguard.history.v1';

export class HistoryStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HistoryStorageError';
  }
}

const VALID_STATUSES: DiagnosisStatus[] = [
  'idle',
  'image_selected',
  'validating_image',
  'ready',
  'processing',
  'prediction',
  'no_signs',
  'insufficient_data',
  'insufficient_quality',
  'uncertain',
  'unsupported_crop',
  'model_not_connected',
  'model_not_configured',
  'network_error',
  'server_error',
  'cancelled',
  'not_plant',
  'queued',
  'analysis_failed',
];

const VALID_CROPS: CropId[] = [
  'apple',
  'blueberry',
  'cherry',
  'corn',
  'grape',
  'orange',
  'peach',
  'pepper',
  'potato',
  'raspberry',
  'soybean',
  'squash',
  'strawberry',
  'tomato',
  'weed',
];

const VALID_MODES: ProviderMode[] = ['demo', 'ai'];
const VALID_ORIGINS: ResultOrigin[] = ['demo_sample', 'model_prediction', 'no_prediction'];

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Strict runtime validation for a stored record. Malformed entries are
 * dropped instead of crashing the app (SPEC/ARCHITECTURE.md).
 */
export function parseStoredRecord(value: unknown): DiagnosisRecord | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;

  if (!isString(raw.id) || raw.id.length === 0) return null;
  if (!isString(raw.createdAt) || Number.isNaN(Date.parse(raw.createdAt))) return null;
  if (!VALID_CROPS.includes(raw.cropId as CropId)) return null;
  if (!isString(raw.crop) || raw.crop.length === 0) return null;
  if (!isString(raw.imageUri)) return null;
  if (!VALID_STATUSES.includes(raw.status as DiagnosisStatus)) return null;
  if (!VALID_MODES.includes(raw.providerMode as ProviderMode)) return null;
  if (!isString(raw.explanation)) return null;
  if (!isStringArray(raw.symptoms)) return null;
  if (!isStringArray(raw.recommendations)) return null;
  if (!isStringArray(raw.avoid)) return null;
  if (typeof raw.isDemoScenario !== 'boolean') return null;
  if (
    raw.confidence !== undefined &&
    (typeof raw.confidence !== 'number' || raw.confidence < 0 || raw.confidence > 1)
  ) {
    return null;
  }
  if (raw.diagnosisClass !== undefined && !isString(raw.diagnosisClass)) return null;
  if (raw.diagnosisClassLatin !== undefined && !isString(raw.diagnosisClassLatin)) return null;
  if (raw.modelVersion !== undefined && !isString(raw.modelVersion)) return null;
  if (raw.scenarioId !== undefined && !isString(raw.scenarioId)) return null;

  let resultOrigin: ResultOrigin = 'no_prediction';
  if (isString(raw.resultOrigin) && VALID_ORIGINS.includes(raw.resultOrigin as ResultOrigin)) {
    resultOrigin = raw.resultOrigin as ResultOrigin;
  } else if (raw.isDemoScenario === true) {
    resultOrigin = 'demo_sample';
  } else if (raw.status === 'prediction') {
    resultOrigin = 'model_prediction';
  }

  const contentVersion = isString(raw.contentVersion) ? raw.contentVersion : undefined;
  const limitsOfVisual = isString(raw.limitsOfVisual) ? raw.limitsOfVisual : undefined;
  const failureCode = isString(raw.failureCode) ? raw.failureCode : undefined;

  let symptomHotspots: DiagnosisRecord['symptomHotspots'] = undefined;
  if (Array.isArray(raw.symptomHotspots)) {
    symptomHotspots = raw.symptomHotspots
      .filter((h): h is Record<string, any> => typeof h === 'object' && h !== null)
      .map((h) => ({
        label: isString(h.label) ? h.label : 'Очаг симптома',
        x: typeof h.x === 'number' ? h.x : 50,
        y: typeof h.y === 'number' ? h.y : 50,
        type: h.type,
        description: isString(h.description) ? h.description : undefined,
        radius: typeof h.radius === 'number' ? h.radius : undefined,
      }));
  }

  return {
    id: raw.id,
    createdAt: raw.createdAt,
    cropId: raw.cropId as CropId,
    crop: raw.crop,
    imageUri: raw.imageUri,
    status: raw.status as DiagnosisStatus,
    resultOrigin,
    plantVillageClass: isString(raw.plantVillageClass) ? raw.plantVillageClass : undefined,
    diagnosisClass: raw.diagnosisClass,
    diagnosisClassLatin: raw.diagnosisClassLatin,
    confidence: raw.confidence,
    severity: typeof raw.severity === 'string' ? (raw.severity as any) : undefined,
    isAutoDetectedCrop: typeof raw.isAutoDetectedCrop === 'boolean' ? raw.isAutoDetectedCrop : undefined,
    detectedCropName: isString(raw.detectedCropName) ? raw.detectedCropName : undefined,
    explanation: raw.explanation,
    symptoms: raw.symptoms,
    recommendations: raw.recommendations,
    avoid: raw.avoid,
    providerMode: raw.providerMode as ProviderMode,
    modelVersion: raw.modelVersion,
    contentVersion,
    limitsOfVisual,
    failureCode,
    symptomHotspots,
    differentialDiagnosis: Array.isArray(raw.differentialDiagnosis) ? (raw.differentialDiagnosis as any) : undefined,
    economicImpact: typeof raw.economicImpact === 'object' && raw.economicImpact !== null ? (raw.economicImpact as any) : undefined,
    isDemoScenario: raw.isDemoScenario,
    scenarioId: raw.scenarioId,
  };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => isString(item));
}

export const INITIAL_DEMO_RECORD: DiagnosisRecord = {
  id: 'demo-initial-1',
  createdAt: '2025-06-12T14:32:00.000Z',
  cropId: 'tomato',
  crop: 'Томат',
  imageUri: '',
  status: 'prediction',
  resultOrigin: 'demo_sample',
  diagnosisClass: 'Ранняя пятнистость',
  diagnosisClassLatin: 'Alternaria solani',
  confidence: 0.87,
  plantVillageClass: 'Tomato___Early_blight',
  explanation:
    'Ранняя пятнистость — распространённое грибковое заболевание томатов. Проявляется в виде тёмных пятен с концентрическими кольцами на листьях.',
  symptoms: [
    'Тёмные округлые пятна',
    'Концентрические кольца',
    'Чаще на нижних листьях',
    'Постепенное пожелтение листьев',
  ],
  recommendations: [
    'Удалите сильно поражённые листья',
    'Обеспечьте хорошую вентиляцию',
    'Избегайте избыточного полива',
    'Примените фунгициды (по рекомендации агронома)',
  ],
  avoid: [
    'Не поливайте по листьям',
    'Не используйте препараты без консультации со специалистом',
  ],
  providerMode: 'demo',
  modelVersion: 'demo-scenarios 1.0',
  contentVersion: '2026.1',
  limitsOfVisual:
    'Раннее проявление трудно отличимо от септориоза и бактериальной пятнистости на начальной стадии без микроскопирования.',
  symptomHotspots: [
    {
      label: 'Очаг некроза (мишень)',
      x: 44,
      y: 40,
      type: 'necrosis',
      description: 'Концентрические кольца Alternaria solani',
      radius: 12,
    },
    {
      label: 'Хлоротичный ореол',
      x: 58,
      y: 50,
      type: 'halo',
      description: 'Желтеющая кайма хлороза вокруг первичного очага',
      radius: 16,
    },
  ],
  isDemoScenario: true,
  scenarioId: 'tomato-early-blight-demo',
};

export const INITIAL_DEMO_RECORDS: DiagnosisRecord[] = [
  INITIAL_DEMO_RECORD,
  {
    id: 'demo-initial-2',
    createdAt: '2025-06-08T09:15:00.000Z',
    cropId: 'tomato',
    crop: 'Томат',
    imageUri: '',
    status: 'no_signs',
    resultOrigin: 'demo_sample',
    diagnosisClass: 'Здоровый лист',
    diagnosisClassLatin: 'Solanum lycopersicum (Healthy)',
    confidence: 0.95,
    plantVillageClass: 'Tomato___healthy',
    explanation:
      'Листовая пластина чистая, пигментация равномерная. Признаков инфекционных заболеваний или дефицита микроэлементов не обнаружено.',
    symptoms: [
      'Тургор листа в норме',
      'Равномерная зелёная окраска',
      'Отсутствие хлороза и некроза',
    ],
    recommendations: [
      'Продолжайте регулярный мониторинг влажности почвы',
      'Проводите плановые листовые подкормки кальцием',
      'Проветривайте теплицу в утренние часы',
    ],
    avoid: [
      'Не допускайте резких перепадов температуры',
      'Не переувлажняйте прикорневую зону',
    ],
    providerMode: 'demo',
    modelVersion: 'demo-scenarios 1.0',
    contentVersion: '2026.1',
    isDemoScenario: true,
    scenarioId: 'tomato-healthy-demo',
  },
  {
    id: 'demo-initial-3',
    createdAt: '2025-06-05T11:05:00.000Z',
    cropId: 'apple',
    crop: 'Яблоня',
    imageUri: '',
    status: 'prediction',
    resultOrigin: 'demo_sample',
    diagnosisClass: 'Мучнистая роса',
    diagnosisClassLatin: 'Podosphaera leucotricha',
    confidence: 0.89,
    plantVillageClass: 'Apple___Cedar_apple_rust',
    explanation:
      'Грибковое поражение побегов и листьев яблони белым войлочным налётом, вызывающее скручивание и усыхание верхушек.',
    symptoms: [
      'Белый мучнистый налёт',
      'Деформация молодых побегов',
      'Скручивание краев листа',
    ],
    recommendations: [
      'Вырежьте и уничтожьте поражённые верхушки побегов',
      'Проведите обработку серосодержащими фунгицидами',
      'Улучшите инсоляцию кроны санитарной обрезкой',
    ],
    avoid: [
      'Не злоупотребляйте азотными удобрениями в фазу роста',
    ],
    providerMode: 'demo',
    modelVersion: 'demo-scenarios 1.0',
    contentVersion: '2026.1',
    isDemoScenario: true,
    scenarioId: 'apple-powdery-mildew-demo',
  },
  {
    id: 'demo-initial-4',
    createdAt: '2025-05-28T16:40:00.000Z',
    cropId: 'potato',
    crop: 'Картофель',
    imageUri: '',
    status: 'prediction',
    resultOrigin: 'demo_sample',
    diagnosisClass: 'Фитофтороз картофеля',
    diagnosisClassLatin: 'Phytophthora infestans',
    confidence: 0.92,
    plantVillageClass: 'Potato___Late_blight',
    explanation:
      'Опаснейшее заболевание паслёновых. На листьях появляются мокнущие тёмно-бурые пятна со светлым ореолом и белесым налётом спороношения снизу.',
    symptoms: [
      'Крупные тёмно-бурые водянистые пятна',
      'Белесый налёт во влажную погоду',
      'Быстрое почернение ботвы',
    ],
    recommendations: [
      'Проведите экстренную обработку медьсодержащими препаратами',
      'Уничтожьте первичные очаги поражения',
      'Обеспечьте просыхание гребней после полива',
    ],
    avoid: [
      'Не проводите полив дождеванием во второй половине дня',
    ],
    providerMode: 'demo',
    modelVersion: 'demo-scenarios 1.0',
    contentVersion: '2026.1',
    isDemoScenario: true,
    scenarioId: 'potato-late-blight-demo',
  },
];

function parseHistoryPayload(payload: string | null): DiagnosisRecord[] {
  if (payload === null) return INITIAL_DEMO_RECORDS;
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    // Corrupted storage — treat as empty instead of crashing.
    console.warn('[history] stored history is malformed, starting empty');
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map(parseStoredRecord)
    .filter((record): record is DiagnosisRecord => record !== null);
}

async function writeHistory(records: DiagnosisRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(records));
  } catch {
    throw new HistoryStorageError('Не удалось сохранить историю анализов');
  }
}

/** Local history repository backed by AsyncStorage. */
export const historyRepository = {
  async list(): Promise<DiagnosisRecord[]> {
    try {
      const payload = await AsyncStorage.getItem(HISTORY_KEY);
      if (payload === null) {
        await writeHistory(INITIAL_DEMO_RECORDS);
        return INITIAL_DEMO_RECORDS;
      }
      return parseHistoryPayload(payload);
    } catch {
      return [];
    }
  },

  async get(id: string): Promise<DiagnosisRecord | null> {
    const records = await this.list();
    return records.find((record) => record.id === id) ?? null;
  },

  /** Updates an existing record by id and returns the updated list. */
  async update(id: string, partialUpdate: Partial<DiagnosisRecord>): Promise<DiagnosisRecord[]> {
    const records = await this.list();
    const index = records.findIndex((r) => r.id === id);
    if (index >= 0) {
      records[index] = { ...records[index], ...partialUpdate };
      await writeHistory(records);
    }
    return records;
  },

  /** Adds a record at the top of the list and returns the updated list. */
  async add(record: DiagnosisRecord): Promise<DiagnosisRecord[]> {
    const records = await this.list();
    const next = [record, ...records];
    await writeHistory(next);
    return next;
  },

  async remove(id: string): Promise<DiagnosisRecord[]> {
    const records = await this.list();
    const target = records.find((record) => record.id === id);
    if (target?.imageUri) {
      await deletePersistedImage(target.imageUri);
    }
    const next = records.filter((record) => record.id !== id);
    await writeHistory(next);
    return next;
  },

  async clear(): Promise<void> {
    const records = await this.list();
    for (const record of records) {
      if (record.imageUri) {
        await deletePersistedImage(record.imageUri);
      }
    }
    await writeHistory([]);
  },
};

