import type { CropId, SymptomHotspot } from '../types';

/**
 * Bundled demo scenarios (offline). Mirrors SPEC/DEMO_SCENARIOS.json and
 * extends it with a stable status mapping and a safe "avoid" list.
 *
 * These outcomes are ONLY produced when the user explicitly picks a scenario
 * in the demo-examples screen. Arbitrary user photos never receive them.
 */
export interface DemoScenario {
  id: string;
  cropId: CropId;
  crop: string;
  label: string;
  latinName?: string;
  confidence: number | null;
  description: string;
  symptoms: string[];
  recommendations: string[];
  avoid: string[];
  symptomHotspots?: SymptomHotspot[];
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'tomato-healthy-demo',
    cropId: 'tomato',
    crop: 'Томат',
    label: 'Здоровый лист',
    confidence: 0.96,
    description:
      'Учебный пример для демонстрации интерфейса. Это не результат анализа пользовательской фотографии.',
    symptoms: ['На примере нет заметных характерных пятен'],
    recommendations: [
      'Продолжайте регулярный визуальный осмотр',
      'Повторите фото при появлении изменений',
    ],
    avoid: ['Не удаляйте здоровые побеги — сначала осмотрите растение целиком'],
    symptomHotspots: [],
  },
  {
    id: 'tomato-early-blight-demo',
    cropId: 'tomato',
    crop: 'Томат',
    label: 'Возможная ранняя пятнистость',
    latinName: 'Alternaria solani',
    confidence: 0.88,
    description:
      'Учебный пример результата классификатора; признаки требуют проверки специалистом.',
    symptoms: ['Возможны округлые тёмные пятна', 'Иногда заметны концентрические зоны'],
    recommendations: [
      'Осмотрите соседние листья',
      'Сделайте несколько чётких снимков при дневном свете',
      'При распространении симптомов обратитесь к агроному',
    ],
    avoid: [
      'Не применяйте препараты без рекомендации агронома',
      'Не удаляйте растение до уточнения причины повреждений',
    ],
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
      {
        label: 'Краевой ожог',
        x: 32,
        y: 62,
        type: 'lesion',
        description: 'Усыхание края листовой пластинки',
        radius: 10,
      },
    ],
  },
  {
    id: 'tomato-late-blight-demo',
    cropId: 'tomato',
    crop: 'Томат',
    label: 'Возможная поздняя пятнистость',
    latinName: 'Phytophthora infestans',
    confidence: 0.84,
    description: 'Учебный пример. По одной фотографии нельзя подтвердить диагноз.',
    symptoms: [
      'Возможны крупные неправильные тёмные участки',
      'Внешний вид зависит от условий съёмки',
    ],
    recommendations: [
      'Осмотрите растение целиком',
      'Избегайте переноса влаги и растительных остатков между участками',
      'Попросите агронома подтвердить причину',
    ],
    avoid: [
      'Не поливайте по листьям до уточнения причины',
      'Не применяйте препараты без рекомендации агронома',
    ],
    symptomHotspots: [
      {
        label: 'Водянистый некроз',
        x: 46,
        y: 36,
        type: 'necrosis',
        description: 'Крупное мокнущее бурое пятно Phytophthora',
        radius: 18,
      },
      {
        label: 'Зона спороношения',
        x: 60,
        y: 56,
        type: 'mildew',
        description: 'Светлый край активного мицелия и спор',
        radius: 14,
      },
    ],
  },
  {
    id: 'tomato-uncertain-demo',
    cropId: 'tomato',
    crop: 'Томат',
    label: 'Недостаточно данных',
    confidence: null,
    description: 'Пример безопасного отказа от уверенного вывода.',
    symptoms: [],
    recommendations: [
      'Сфотографируйте лист целиком и крупным планом',
      'Используйте равномерное освещение',
      'Убедитесь, что лист находится в фокусе',
    ],
    avoid: ['Не делайте поспешных выводов по одному снимку'],
    symptomHotspots: [],
  },
];

/** Text used when the user analyzes an arbitrary photo in demo mode. */
export const DEMO_NOT_CONNECTED = {
  explanation:
    'Реальная модель распознавания ещё не подключена, поэтому приложению нечего сообщить об этой фотографии. Загруженное фото не получает никаких выдуманных признаков.',
  recommendations: [
    'Ознакомьтесь с демонстрационными примерами — они показывают, как будет выглядеть результат',
    'Сделайте чёткий снимок при дневном свете и сохраните его для будущей проверки',
    'При серьёзных повреждениях обратитесь к агроному',
  ],
  avoid: ['Не делайте выводов о состоянии растения по этой фотографии'],
} as const;

export const DEMO_MODEL_VERSION = 'demo-scenarios 1.0';
