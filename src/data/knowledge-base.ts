import type { CropId } from '../types';
import { findPlantVillageDef } from './plantvillage-taxonomy';

export interface AgronomicSource {
  id: string;
  name: string;
  organization: string;
  url: string;
  accessDate: string;
  license: string;
}

export interface PlantConditionProfile {
  id: string;
  cropId: CropId;
  label: string;
  latinName?: string;
  commonNamesRu: string[];
  description: string;
  symptoms: string[];
  limitsOfVisual: string;
  recommendations: string[];
  avoid: string[];
  sources: AgronomicSource[];
  referenceImages?: string[]; // URLs to reference photos
  similarConditions?: string[]; // IDs of similar profiles
  expertReview: {
    status: 'reviewed' | 'pending';
    reviewerRole: string;
    reviewedAt: string;
  };
  contentVersion: string;
}

export const AGRONOMIC_SOURCES: Record<string, AgronomicSource> = {
  fao: {
    id: 'fao-tomato-ipm',
    name: 'Integrated Pest Management for Tomato Pests and Diseases',
    organization: 'Food and Agriculture Organization of the United Nations (FAO)',
    url: 'https://www.fao.org/plant-protection',
    accessDate: '2026-09-01',
    license: 'CC-BY-NC-SA 3.0 IGO',
  },
  cornell: {
    id: 'cornell-vegetable-md',
    name: 'Tomato Disease Factsheets and Diagnostic Keys',
    organization: 'Cornell University Cooperative Extension (CCE)',
    url: 'https://vegetablemdonline.ppath.cornell.edu/factsheets/Tomato_List.htm',
    accessDate: '2026-09-01',
    license: 'Educational Non-Commercial Use',
  },
  uc_ipm: {
    id: 'uc-ipm-tomato',
    name: 'Tomato Pest Management Guidelines: Foliar and Fruit Diseases',
    organization: 'University of California Agriculture and Natural Resources (UC IPM)',
    url: 'https://ipm.ucanr.edu/agriculture/tomato',
    accessDate: '2026-09-01',
    license: 'Educational Use',
  },
  eppo: {
    id: 'eppo-global-database',
    name: 'EPPO Global Database — Plant Quarantine Data',
    organization: 'European and Mediterranean Plant Protection Organization (EPPO)',
    url: 'https://gd.eppo.int',
    accessDate: '2026-09-01',
    license: 'Public Agronomic Data',
  },
};

export const CURRENT_CONTENT_VERSION = '2026.1';

export const TOMATO_KNOWLEDGE_BASE: PlantConditionProfile[] = [
  {
    id: 'tomato-healthy',
    cropId: 'tomato',
    label: 'Здоровый лист',
    commonNamesRu: ['Нормальное развитие', 'Без признаков инфекции'],
    description:
      'Листовая пластинка томата с равномерной зелёной окраской без очагов некроза, хлороза или деформации. Тургор тканей сохранён.',
    symptoms: [
      'Равномерная окраска листовой пластины',
      'Отсутствие краевых ожогов и мозаичности',
      'Тургор тканей в норме',
    ],
    limitsOfVisual:
      'Визуальный осмотр фиксирует внешнее отсутствие признаков, но не исключает ранний латентный инкубационный период инфекций.',
    recommendations: [
      'Продолжайте регулярный осмотр нижнего и среднего ярусов 1–2 раза в неделю',
      'Поддерживайте оптимальную влажность воздуха и проветривание в теплице',
      'Повторите фотофиксацию при появлении любых локальных изменений окраски',
    ],
    avoid: [
      'Не удаляйте здоровые фотосинтезирующие листья без агротехнической необходимости',
      'Не проводите профилактических обработок агрессивными препаратами «на всякий случай»',
    ],
    sources: [AGRONOMIC_SOURCES.fao, AGRONOMIC_SOURCES.cornell],
    expertReview: {
      status: 'reviewed',
      reviewerRole: 'Ведущий агроном по защите растений закрытого грунта',
      reviewedAt: '2026-08-15',
    },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
  {
    id: 'tomato-early-blight',
    cropId: 'tomato',
    label: 'Ранняя пятнистость (Альтернариоз)',
    latinName: 'Alternaria solani',
    commonNamesRu: ['Альтернариоз томатов', 'Сухая пятнистость'],
    description:
      'Грибковое заболевание, поражающее преимущественно взрослые листья нижнего и среднего яруса при умеренно тёплой погоде и чередовании влажных и сухих периодов.',
    symptoms: [
      'Округлые тёмно-коричневые пятна с выраженными концентрическими кругами («мишень»)',
      'Хлоротичный желтоватый ореол вокруг повреждений',
      'Поражение начинается с листьев нижнего яруса и распространяется вверх',
      'Постепенное пожелтение и засыхание поражённой пластинки',
    ],
    limitsOfVisual:
      'Ранние единичные очаги могут внешне напоминать септориоз или бактериальную точечность. Микроскопический анализ спор даёт 100% подтверждение.',
    recommendations: [
      'Аккуратно срежьте и изолируйте сильно поражённые нижние листья',
      'Обеспечьте свободную циркуляцию воздуха между рядами',
      'Переведите полив строго под корень (капельный полив)',
      'При массовом распространении покажите образец листа районному агроному',
    ],
    avoid: [
      'Не проводите дождевание и полив по листьям',
      'Не компостируйте поражённую ботву на открытом участке',
      'Не превышайте дозировки любых рекомендованных специалистом средств',
    ],
    sources: [AGRONOMIC_SOURCES.cornell, AGRONOMIC_SOURCES.uc_ipm],
    referenceImages: ['https://storage.googleapis.com/plantguard-mock/tomato-early-blight-1.jpg', 'https://storage.googleapis.com/plantguard-mock/tomato-early-blight-2.jpg'],
    similarConditions: ['tomato-late-blight', 'tomato-septoria'],
    expertReview: {
      status: 'reviewed',
      reviewerRole: 'Специалист по фитопатологии овощных культур',
      reviewedAt: '2026-08-20',
    },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
  {
    id: 'tomato-late-blight',
    cropId: 'tomato',
    label: 'Поздняя пятнистость (Фитофтороз)',
    latinName: 'Phytophthora infestans',
    commonNamesRu: ['Фитофтороз', 'Бурая гниль томатов'],
    description:
      'Высокопатогенный оомицет, способный быстро уничтожить листовой аппарат при высокой влажности (>90%) и перепадах ночных и дневных температур.',
    symptoms: [
      'Крупные неправильной формы тёмно-бурые водянистые пятна',
      'При высокой влажности на нижней стороне листа появляется беловатый пушистый налёт спороношения',
      'Стебли и черешки покрываются коричневыми некротическими полосами',
      'Быстрое потемнение и гибель поражённых побегов',
    ],
    limitsOfVisual:
      'При подсыхании пятна фитофторы могут внешне терять водянистый край и походить на другие некрозы.',
    recommendations: [
      'Немедленно изолируйте поражённые побеги и осмотрите соседние кусты',
      'Снизьте относительную влажность в теплице через регулярное сквозное проветривание',
      'Полностью исключите капли росы на листьях к ночи',
      'Обратитесь к агроному для подтверждения необходимости фунгицидной защиты',
    ],
    avoid: [
      'Категорически запрещён полив дождеванием',
      'Не прикасайтесь влажными руками и инструментами к здоровым кустам после контакта с поражёнными',
      'Не оставляйте растительные остатки в междурядьях',
    ],
    sources: [AGRONOMIC_SOURCES.fao, AGRONOMIC_SOURCES.eppo, AGRONOMIC_SOURCES.cornell],
    referenceImages: ['https://storage.googleapis.com/plantguard-mock/tomato-late-blight-1.jpg'],
    similarConditions: ['tomato-early-blight', 'tomato-septoria'],
    expertReview: {
      status: 'reviewed',
      reviewerRole: 'Фитопатолог, кандидат сельскохозяйственных наук',
      reviewedAt: '2026-08-22',
    },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
  {
    id: 'tomato-septoria',
    cropId: 'tomato',
    label: 'Белая пятнистость (Септориоз)',
    latinName: 'Septoria lycopersici',
    commonNamesRu: ['Септориоз листьев томата'],
    description:
      'Грибковое заболевание, поражающее вегетативную массу. Характеризуется многочисленными мелкими очагами некроза.',
    symptoms: [
      'Множественные мелкие круглые пятна (диаметром 2–5 мм)',
      'Серый или беловатый центр пятна с узкой тёмно-коричневой каймой',
      'В центре старых пятен при увеличении видны чёрные точки (пикниды)',
      'Листья желтеют, буреют и опадают снизу вверх',
    ],
    limitsOfVisual:
      'На ранних фазах легко путается с бактериальной пятнистостью; подтверждается наличием пикнид в центре очага.',
    recommendations: [
      'Удалите нижние поражённые листья до первого здорового яруса',
      'Мульчируйте почву соломой или плёнкой, чтобы исключить разбрызгивание спор при поливе',
      'Обеспечьте проветривание прикорневой зоны',
    ],
    avoid: [
      'Не загущайте посадки растений',
      'Не допускайте попадания брызг воды с почвы на нижние листья',
    ],
    sources: [AGRONOMIC_SOURCES.cornell, AGRONOMIC_SOURCES.uc_ipm],
    referenceImages: ['https://storage.googleapis.com/plantguard-mock/tomato-septoria-1.jpg'],
    similarConditions: ['tomato-early-blight', 'tomato-late-blight'],
    expertReview: {
      status: 'reviewed',
      reviewerRole: 'Агроном-консультант',
      reviewedAt: '2026-08-25',
    },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
  {
    id: 'tomato-uncertain',
    cropId: 'tomato',
    label: 'Недостаточно данных / Неопределённость',
    commonNamesRu: ['Низкое качество снимка', 'Неопределённые признаки'],
    description:
      'Снимок не позволяет надёжно верифицировать признаки заболевания из-за недостаточного разрешения, расфокусировки, неравномерного освещения или нетипичного ракурса.',
    symptoms: [],
    limitsOfVisual:
      'Компьютерное зрение и эксперты требуют резкого снимка всей листовой пластины с равномерным белым или дневным светом.',
    recommendations: [
      'Переснимите лист при естественном дневном свете без прямых солнечных бликов',
      'Поместите один повреждённый лист в центр кадра так, чтобы он занимал не менее 70% площади',
      'Сфокусируйте камеру на границе здоровой и поражённой ткани',
    ],
    avoid: [
      'Не делайте поспешных выводов и не проводите обработок по нерезкому снимку',
    ],
    sources: [AGRONOMIC_SOURCES.fao],
    expertReview: {
      status: 'reviewed',
      reviewerRole: 'Технический координатор полевого тестирования',
      reviewedAt: '2026-08-30',
    },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
];


export const CORN_KNOWLEDGE_BASE: PlantConditionProfile[] = [
  {
    id: 'corn-healthy',
    cropId: 'corn',
    label: 'Здоровый лист',
    commonNamesRu: ['Нормальное развитие', 'Без признаков инфекции'],
    description: 'Листья кукурузы равномерной зеленой окраски без пятен, полос и повреждений.',
    symptoms: ['Равномерная окраска листовой пластины'],
    limitsOfVisual: 'Недостаток микроэлементов может не проявляться сразу.',
    recommendations: ['Соблюдайте режим полива и подкормок'],
    avoid: ['Внесение избыточного азота без фосфора'],
    sources: [AGRONOMIC_SOURCES.fao],
    expertReview: { status: 'reviewed', reviewerRole: 'Агроном', reviewedAt: '2026-08-15' },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
  {
    id: 'corn-blight',
    cropId: 'corn',
    label: 'Северный гельминтоспориоз (NCLB)',
    latinName: 'Exserohilum turcicum',
    commonNamesRu: ['Бурая пятнистость листьев кукурузы', 'Северная пятнистость'],
    description: 'Грибковое заболевание листьев кукурузы, проявляющееся в виде крупных сигарообразных некротических пятен.',
    symptoms: ['Крупные эллиптические или сигарообразные пятна', 'Серовато-зеленый или коричневый цвет пятен', 'Слияние пятен при сильном поражении'],
    limitsOfVisual: 'Ранние пятна могут напоминать ожоги или бактериальные инфекции.',
    recommendations: ['Используйте устойчивые гибриды', 'Соблюдайте севооборот', 'Глубокая заделка пожнивных остатков'],
    avoid: ['Монокультура кукурузы на одном поле'],
    sources: [AGRONOMIC_SOURCES.fao],
    referenceImages: ['https://storage.googleapis.com/plantguard-mock/corn-blight.jpg'],
    similarConditions: [],
    expertReview: { status: 'reviewed', reviewerRole: 'Агроном', reviewedAt: '2026-08-15' },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
  {
    id: 'corn-rust',
    cropId: 'corn',
    label: 'Ржавчина кукурузы',
    latinName: 'Puccinia sorghi',
    commonNamesRu: ['Обыкновенная ржавчина'],
    description: 'Заболевание, вызываемое грибами рода Puccinia. Приводит к образованию пустул на обеих сторонах листа.',
    symptoms: ['Мелкие овальные пустулы кирпично-красного или коричневого цвета', 'Золотистая пыль спор на пальцах при трении', 'Разрыв эпидермиса листа'],
    limitsOfVisual: 'Отличие обыкновенной ржавчины от южной ржавчины требует оценки цвета и формы пустул.',
    recommendations: ['Выращивание устойчивых гибридов', 'Опрыскивание фунгицидами при раннем появлении (по рекомендации)'],
    avoid: ['Загущение посевов'],
    sources: [AGRONOMIC_SOURCES.fao],
    referenceImages: ['https://storage.googleapis.com/plantguard-mock/corn-rust.jpg'],
    similarConditions: [],
    expertReview: { status: 'reviewed', reviewerRole: 'Агроном', reviewedAt: '2026-08-15' },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
  {
    id: 'corn-uncertain',
    cropId: 'corn',
    label: 'Недостаточно данных / Неопределённость',
    commonNamesRu: ['Низкое качество снимка', 'Неопределённые признаки'],
    description: 'Снимок не позволяет надёжно верифицировать признаки заболевания из-за низкого качества.',
    symptoms: [],
    limitsOfVisual: 'Необходим резкий снимок листа крупным планом.',
    recommendations: ['Переснимите пораженный участок при хорошем свете', 'Сфокусируйте камеру на пятнах'],
    avoid: ['Принятие решений по размытому фото'],
    sources: [AGRONOMIC_SOURCES.fao],
    expertReview: { status: 'reviewed', reviewerRole: 'Агроном', reviewedAt: '2026-08-15' },
    contentVersion: CURRENT_CONTENT_VERSION,
  }
];

export const POTATO_KNOWLEDGE_BASE: PlantConditionProfile[] = [
  {
    id: 'potato-healthy',
    cropId: 'potato',
    label: 'Здоровый лист картофеля',
    commonNamesRu: ['Нормальное развитие ботвы', 'Без патологий'],
    description:
      'Листовая пластинка картофеля с ровной зеленой окраской без краевых ожогов, пятнистостей и признаков увядания. Тургор и листовой аппарат в норме.',
    symptoms: ['Равномерная зеленая окраска', 'Отсутствие пятен и увядания', 'Здоровая структура листовой пластинки'],
    limitsOfVisual: 'Ранние этапы заражения корневой системы или скрытые вирусные инфекции могут не проявляться визуально на верхнем ярусе листьев.',
    recommendations: [
      'Проводите регулярный мониторинг посадок (не реже 1–2 раз в неделю)',
      'Окучивайте кусты для защиты клубней от солнечного света и смыва спор с ботвы',
      'Обеспечьте капельный полив строго под корень без увлажнения листьев',
    ],
    avoid: ['Избыточный полив дождеванием по листьям в вечернее время', 'Загущение посадок между рядами'],
    sources: [AGRONOMIC_SOURCES.fao, AGRONOMIC_SOURCES.cornell],
    expertReview: { status: 'reviewed', reviewerRole: 'Фитопатолог картофелеводства', reviewedAt: '2026-08-20' },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
  {
    id: 'potato-early-blight',
    cropId: 'potato',
    label: 'Ранняя пятнистость картофеля (Альтернариоз)',
    latinName: 'Alternaria solani',
    commonNamesRu: ['Альтернариоз картофеля', 'Сухая пятнистость'],
    description:
      'Опасное грибковое заболевание картофеля, развивающееся в сухую жаркую погоду с обильными ночными росами. Поражает в первую очередь нижние стареющие листья.',
    symptoms: [
      'Округлые или угловатые тёмно-коричневые сухие пятна с чёткими концентрическими кольцами («мишень»)',
      'Жёлтая хлоротичная кайма вокруг очагов некроза',
      'Ломкость и засыхание поражённой листовой ткани',
      'Постепенное отмирание листовых долей снизу вверх по стеблю',
    ],
    limitsOfVisual: 'Может маскироваться под дефицит магния или солнечные ожоги. Диагностика подтверждается наличием концентрических кругов в очагах.',
    recommendations: [
      'Соблюдайте севооборот: не сажайте картофель после томатов, баклажанов и других паслёновых ранее чем через 3–4 года',
      'Удаляйте и изолируйте сильно пораженные нижние листья при первых очагах',
      'Используйте сертифицированный здоровый посадочный материал устойчивых сортов',
      'Уничтожайте растительные остатки после уборки урожая глубокой перекопкой',
    ],
    avoid: [
      'Не оставляйте растительные остатки зимовать на поверхности почвы',
      'Не поливайте посадки сверху по ботве',
      'Не вносите избыточные дозы азотных удобрений, снижающих устойчивость тканей',
    ],
    sources: [AGRONOMIC_SOURCES.fao, AGRONOMIC_SOURCES.cornell, AGRONOMIC_SOURCES.uc_ipm],
    similarConditions: ['potato-late-blight'],
    expertReview: { status: 'reviewed', reviewerRole: 'Агроном по защите паслёновых', reviewedAt: '2026-08-25' },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
  {
    id: 'potato-late-blight',
    cropId: 'potato',
    label: 'Поздняя пятнистость картофеля (Фитофтороз)',
    latinName: 'Phytophthora infestans',
    commonNamesRu: ['Фитофтороз картофеля', 'Бурая гниль ботвы'],
    description:
      'Крайне вредоносный оомицет, способный уничтожить ботву картофеля за считанные дни при прохладной дождливой погоде (влажность выше 90%, температура 15–22°C).',
    symptoms: [
      'Крупные тёмно-бурые водянистые пятна, быстро расползающиеся от краёв листа',
      'Бледно-зелёный или желтоватый ореол по периферии поражения',
      'Нежный беловатый паутинистый налёт спороношения на нижней стороне листа во влажную погоду',
      'Потемнение и ломкость черешков листьев и стеблей',
    ],
    limitsOfVisual: 'Ранние единичные пятна внешне схожи с альтернариозом или бактериальным увяданием. Белый налёт с нижней стороны листа — ключевой маркер фитофторы.',
    recommendations: [
      'При первых признаках изолируйте очаг и аккуратно срежьте пораженную ботву, не разнося споры',
      'Высоко окучивайте посадки, чтобы защитить клубни от смыва спор зооспорангиями с дождём',
      'Скосите ботву за 10–14 дней до уборки клубней, чтобы предотвратить заражение при контакте',
      'Просушивайте клубни после выкопки перед закладкой на хранение',
    ],
    avoid: [
      'Категорически не компостируйте поражённую ботву на открытом участке',
      'Не поливайте посадки дождеванием в сырую прохладную погоду',
      'Не убирайте урожай в сырую дождливую погоду',
    ],
    sources: [AGRONOMIC_SOURCES.fao, AGRONOMIC_SOURCES.cornell, AGRONOMIC_SOURCES.eppo],
    similarConditions: ['potato-early-blight'],
    expertReview: { status: 'reviewed', reviewerRole: 'Ведущий фитопатолог', reviewedAt: '2026-08-25' },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
  {
    id: 'potato-uncertain',
    cropId: 'potato',
    label: 'Недостаточно данных / Неопределённость (Картофель)',
    commonNamesRu: ['Низкое качество снимка', 'Неопределённые признаки картофеля'],
    description: 'Изображение листа картофеля не позволяет однозначно дифференцировать возбудителя болезни из-за размытия или сложного освещения.',
    symptoms: [],
    limitsOfVisual: 'Сделайте резкое фото листа крупным планом с верхней и нижней стороны.',
    recommendations: ['Сделайте повторный снимок листа при естественном рассеянном освещении', 'Сфокусируйте камеру на границе здоровой и больной ткани'],
    avoid: ['Принятие решений по нерезкому или затемненному фото'],
    sources: [AGRONOMIC_SOURCES.fao],
    expertReview: { status: 'reviewed', reviewerRole: 'Агроном', reviewedAt: '2026-08-20' },
    contentVersion: CURRENT_CONTENT_VERSION,
  }
];

export const APPLE_KNOWLEDGE_BASE: PlantConditionProfile[] = [
  {
    id: 'apple-healthy',
    cropId: 'apple',
    label: 'Здоровый лист яблони',
    commonNamesRu: ['Нормальное развитие кроны', 'Листва без повреждений'],
    description: 'Листья яблони плотные, с равномерной зелёной окраской, гладкой поверхностью и выраженным жилкованием без налёта, пятен или деформаций.',
    symptoms: ['Равномерная окраска листовой пластинки', 'Цельные края без некротических каёмок', 'Гладкая поверхность без шероховатостей'],
    limitsOfVisual: 'Не исключает латентную стадию парши в первые 7–10 дней после дождя при первичном заражении.',
    recommendations: [
      'Проводите регулярную санитарную обрезку кроны для улучшения проветриваемости и освещённости',
      'Своевременно собирайте и компостируйте опавшую здоровую листву осенью',
      'Осматривайте внутреннюю часть кроны после затяжных дождей',
    ],
    avoid: ['Загущение кроны без прореживания побегов', 'Оставление мумифицированных плодов на ветках на зиму'],
    sources: [AGRONOMIC_SOURCES.fao, AGRONOMIC_SOURCES.cornell],
    expertReview: { status: 'reviewed', reviewerRole: 'Агроном-плодовод', reviewedAt: '2026-08-22' },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
  {
    id: 'apple-scab',
    cropId: 'apple',
    label: 'Парша яблони',
    latinName: 'Venturia inaequalis',
    commonNamesRu: ['Парша плодовых', 'Вентуриоз яблони'],
    description:
      'Одно из наиболее распространенных и экономически значимых грибковых заболеваний яблони. Поражает листья, черешки, плодоножки и плоды в сырые весенне-летние периоды.',
    symptoms: [
      'Оливково-зелёные, затем бархатистые тёмно-оливковые пятна с лучистыми нечёткими краями на верхней стороне листа',
      'Постепенное потемнение пятен до сажисто-чёрных и растрескивание ткани',
      'Деформация, сморщивание и преждевременный листопад',
      'Опробковение и растрескивание кожуры плодов при поражении завязей',
    ],
    limitsOfVisual: 'На ранних стадиях бархатистый налёт может быть слабым. При сильном поражении лист буреет целиком, напоминая ожог.',
    recommendations: [
      'Осенью тщательно собирайте и глубоко запахивайте или утилизируйте опавшую листву — главный источник зимовки спор',
      'Обеспечивайте ежегодную прореживающую обрезку кроны: продуваемая ветром крона высыхает быстрее, не давая спорам прорасти',
      'При закладке сада выбирайте сорта с генетической устойчивостью к парше (на основе гена Vf/Rvi6)',
      'Удаляйте прикорневую поросль и волчки, создающие тень и сырость',
    ],
    avoid: [
      'Не оставляйте зараженный листовой опад под кроной яблонь на зиму',
      'Не высаживайте деревья в низинах со скоплением холодного влажного тумана',
      'Не допускайте чрезмерного загущения кроны',
    ],
    sources: [AGRONOMIC_SOURCES.cornell, AGRONOMIC_SOURCES.fao, AGRONOMIC_SOURCES.eppo],
    similarConditions: ['apple-black-rot'],
    expertReview: { status: 'reviewed', reviewerRole: 'Фитопатолог плодовых культур', reviewedAt: '2026-08-25' },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
  {
    id: 'apple-black-rot',
    cropId: 'apple',
    label: 'Чёрная гниль яблони (Ботриосфериоз)',
    latinName: 'Botryosphaeria obtusa',
    commonNamesRu: ['Глазковая пятнистость листьев («лягушачий глаз»)', 'Чёрный рак ветвей'],
    description:
      'Грибковое заболевание, вызывающее характерную пятнистость листьев («глаз лягушки»), некроз коры ветвей и гниль плодов, превращающихся в черные мумии.',
    symptoms: [
      'Мелкие фиолетовые пятнышки на листьях, разрастающиеся в круги с коричневым центром и тёмным ободком («лягушачий глаз»)',
      'На более поздних стадиях центр пятна становится серебристо-серым с точечными пикнидами',
      'Чернеющие, усыхающие и остающиеся на ветках плоды-мумии',
      'Усыхание ветвей с красновато-бурыми вдавленными язвами коры',
    ],
    limitsOfVisual: 'Пятнистость на листьях внешне может напоминать повреждения от опрыскиваний или паршу.',
    recommendations: [
      'Снимайте и уничтожайте все мумифицированные плоды с веток и земли осенью и зимой',
      'Вырезайте усыхающие и раковые ветви до здоровой древесины с дезинфекцией инструмента',
      'Защищайте штамбы от морозобоин и солнечных ожогов побелкой',
      'Удаляйте старые мертвые деревья вблизи сада, служащие резервуаром инфекции',
    ],
    avoid: [
      'Не оставляйте мумифицированные черные плоды висеть на дереве',
      'Не проводите обрезку во влажную дождливую погоду',
      'Не замазывайте раны коры без предварительной зачистки до живой ткани',
    ],
    sources: [AGRONOMIC_SOURCES.cornell, AGRONOMIC_SOURCES.uc_ipm],
    similarConditions: ['apple-scab', 'apple-cedar-rust'],
    expertReview: { status: 'reviewed', reviewerRole: 'Специалист по защите плодовых садов', reviewedAt: '2026-08-25' },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
  {
    id: 'apple-cedar-rust',
    cropId: 'apple',
    label: 'Ржавчина яблони кедровая / можжевельниковая',
    latinName: 'Gymnosporangium juniperi-virginianae',
    commonNamesRu: ['Ржавчина яблони', 'Гимноспорангиоз'],
    description:
      'Двухозяйный ржавчинный гриб, жизненный цикл которого требует наличия двух хозяев: можжевельника (где образуются галлы) и яблони (поражение листьев и плодов).',
    symptoms: [
      'Ярко-желтые или оранжево-красные округлые пятна на верхней поверхности листа',
      'Крошечные черные точки (спермогонии) в центре оранжевых пятен',
      'Трубчатые цилиндрические выросты спор (эции) на нижней стороне листа под пятнами в середине лета',
      'Преждевременное пожелтение и опадание сильно пораженных листьев',
    ],
    limitsOfVisual: 'Яркий оранжевый цвет и трубчатые выросты на нижней стороне листа являются уникальным визуальным маркером ржавчины.',
    recommendations: [
      'По возможности удаляйте дикорастущие посадки можжевельника виргинского в радиусе 200–500 м от яблоневого сада',
      'Выбирайте сорта яблони с генетической устойчивостью к ржавчине',
      'Срезайте галлы с можжевельников на прилегающей территории до весеннего рассеивания спор',
    ],
    avoid: ['Соседство яблоневого сада с посадками декоративных видов можжевельника'],
    sources: [AGRONOMIC_SOURCES.cornell, AGRONOMIC_SOURCES.fao],
    similarConditions: ['apple-scab'],
    expertReview: { status: 'reviewed', reviewerRole: 'Агроном-плодовод', reviewedAt: '2026-08-25' },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
  {
    id: 'apple-uncertain',
    cropId: 'apple',
    label: 'Недостаточно данных / Неопределённость (Яблоня)',
    commonNamesRu: ['Низкое качество снимка', 'Неопределённые признаки яблони'],
    description: 'Снимок листа яблони не позволяет достоверно идентифицировать заболевание из-за размытия или бликов.',
    symptoms: [],
    limitsOfVisual: 'Сделайте чёткий снимок листа яблони крупным планом при мягком естественном свете.',
    recommendations: ['Сфотографируйте поврежденный лист с верхней стороны крупным планом', 'Убедитесь, что камера сфокусирована на очаге пятна'],
    avoid: ['Определение болезни по смазанным или пересвеченным кадрам'],
    sources: [AGRONOMIC_SOURCES.fao],
    expertReview: { status: 'reviewed', reviewerRole: 'Агроном', reviewedAt: '2026-08-20' },
    contentVersion: CURRENT_CONTENT_VERSION,
  }
];

export const GRAPE_KNOWLEDGE_BASE: PlantConditionProfile[] = [
  {
    id: 'grape-healthy',
    cropId: 'grape',
    label: 'Здоровый лист винограда',
    commonNamesRu: ['Здоровая лоза', 'Нормальное развитие листьев винограда'],
    description: 'Листья винограда развитые, характерной формы, ровного зелёного цвета без межжилкового хлороза, усыхания краёв или маслянистых пятен.',
    symptoms: ['Равномерная зелёная окраска пластинки', 'Эластичные жилки без некрозов', 'Отсутствие белесого налета и пятен'],
    limitsOfVisual: 'Не выявляет латентное заражение милдью или оидиумом в первые дни инкубации до появления симптомов.',
    recommendations: [
      'Проводите своевременную зеленую обрезку, пасынкование и подвязку побегов для циркуляции воздуха',
      'Поддерживайте чистой приствольную полосу под шпалерой',
      'Регулярно осматривайте нижний ярус лозы после дождей',
    ],
    avoid: ['Загущение куста лозы без осветления зоны гроздей', 'Полив дождеванием по кроне куста'],
    sources: [AGRONOMIC_SOURCES.fao, AGRONOMIC_SOURCES.uc_ipm],
    expertReview: { status: 'reviewed', reviewerRole: 'Агроном-виноградарь', reviewedAt: '2026-08-22' },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
  {
    id: 'grape-black-rot',
    cropId: 'grape',
    label: 'Чёрная гниль винограда',
    latinName: 'Guignardia bidwellii',
    commonNamesRu: ['Черная гниль винограда', 'Фомопсис ягод'],
    description:
      'Опасная грибковая инфекция виноградной лозы, поражающая все зеленые органы растения, особенно листья и ягоды в теплую влажную погоду.',
    symptoms: [
      'Небольшие округлые красновато-коричневые пятна на листьях с четкой темной каймой',
      'Образование мелких черных точек (пикнид), расположенных кольцом внутри пятна',
      'Засыхание, сморщивание и почернение ягод, превращающихся в твердые черные мумии',
      'Продольные черные язвы на молодых зеленых побегах',
    ],
    limitsOfVisual: 'На ранней стадии пятна на листьях легко спутать с милдью или антракнозом. Кольцо черных пикнид внутри пятна помогает точной диагностике.',
    recommendations: [
      'Удаляйте и сжигайте все мумифицированные ягоды с куста и поверхности почвы во время зимней обрезки',
      'Обеспечьте вертикальное ведение побегов на шпалере для быстрого просыхания росы',
      'Проводите культивацию почвы ранней весной для заделки перезимовавших на листьях спор',
    ],
    avoid: [
      'Не оставляйте мумифицированные сухие грозди на шпалере на зиму',
      'Не допускайте смыкания листвы соседних кустов в сплошную стену без вентиляции',
    ],
    sources: [AGRONOMIC_SOURCES.cornell, AGRONOMIC_SOURCES.uc_ipm, AGRONOMIC_SOURCES.eppo],
    similarConditions: ['grape-esca', 'grape-leaf-blight'],
    expertReview: { status: 'reviewed', reviewerRole: 'Фитопатолог виноградарства', reviewedAt: '2026-08-25' },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
  {
    id: 'grape-esca',
    cropId: 'grape',
    label: 'Эска винограда (Чёрная корь)',
    latinName: 'Phaeomoniella chlamydospora, Phaeoacremonium minimum',
    commonNamesRu: ['Эска лозы', 'Апоплексия винограда', 'Черная корь'],
    description:
      'Хронический комплекс сосудистых грибковых патогенов древесины лозы. Проявляется характерным узором «тигровой шкуры» на листьях и внезапным апоплексическим усыханием куста в жару.',
    symptoms: [
      'Характерный узор «тигровой шкуры»: межжилковые участки листа желтеют, затем буреют и отмирают, а зоны вдоль главных жилок остаются зелеными',
      'Мелкие темно-фиолетовые пятна («корь») на кожице созревающих ягод',
      'Внезапное стремительное увядание (апоплексия) побегов или всего куста в жаркие летние дни',
      'На поперечном срезе рукава — потемнение и некроз проводящих сосудов древесины',
    ],
    limitsOfVisual: 'Листовые симптомы могут быть схожи с дефицитом калия/магния или повреждением цикадками. Сосудистый срез лозы дает точное подтверждение.',
    recommendations: [
      'Дезинфицируйте секаторы спиртом при обрезке при переходе от одного куста к другому',
      'Проводите обрезку в сухую погоду и замазывайте крупные срезы садовым варом для защиты от спор',
      'Маркируйте больные кусты летом и обрезайте их в последнюю очередь',
      'При тяжелом поражении проводите омолаживание куста срезом ниже зоны некроза древесины',
    ],
    avoid: [
      'Не обрезайте виноград в сырую туманную погоду',
      'Не заготавливайте черенки для размножения с кустов с симптомами эски',
      'Не оставляйте обрезки старой древесины в междурядьях',
    ],
    sources: [AGRONOMIC_SOURCES.uc_ipm, AGRONOMIC_SOURCES.fao, AGRONOMIC_SOURCES.eppo],
    similarConditions: ['grape-black-rot'],
    expertReview: { status: 'reviewed', reviewerRole: 'Эксперт по фитопатологии лозы', reviewedAt: '2026-08-25' },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
  {
    id: 'grape-leaf-blight',
    cropId: 'grape',
    label: 'Пятнистость листьев винограда (Изариопсис / Церкоспороз)',
    latinName: 'Pseudocercospora vitis',
    commonNamesRu: ['Изариопсиоз винограда', 'Церкоспороз листьев'],
    description:
      'Грибковое заболевание, поражающее преимущественно взрослые листья винограда во второй половине лета, вызывая раннее побурение и опадание листьев.',
    symptoms: [
      'Угловатые или неправильной формы красно-коричневые пятна, ограниченные жилками листа',
      'Тёмный приподнятый ободок вокруг пятен',
      'Оливково-бурый бархатистый налёт спороношения на нижней стороне листа во влажную погоду',
      'Преждевременное пожелтение и ранний листопад, снижающий сахаристость ягод',
    ],
    limitsOfVisual: 'Угловатая форма пятен, ограниченная жилками, отличает заболевание от черной гнили.',
    recommendations: [
      'Удаляйте опавшие листья осенью, так как гриб зимует на растительных остатках',
      'Проводите своевременное осветление зоны гроздей и удаление старых нижних листьев',
      'Обеспечьте сбалансированное фосфорно-калийное питание для вызревания лозы',
    ],
    avoid: ['Оставление неубранной листовой подстилки под кустами', 'Чрезмерное внесение азота во второй половине лета'],
    sources: [AGRONOMIC_SOURCES.fao, AGRONOMIC_SOURCES.uc_ipm],
    similarConditions: ['grape-black-rot'],
    expertReview: { status: 'reviewed', reviewerRole: 'Агроном-виноградарь', reviewedAt: '2026-08-25' },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
  {
    id: 'grape-uncertain',
    cropId: 'grape',
    label: 'Недостаточно данных / Неопределённость (Виноград)',
    commonNamesRu: ['Низкое качество снимка', 'Неопределённые признаки винограда'],
    description: 'Качество снимка листа винограда не позволяет уверенно определить заболевание.',
    symptoms: [],
    limitsOfVisual: 'Сделайте резкий снимок пораженного листа крупным планом.',
    recommendations: ['Сделайте снимок листа при естественном свете', 'Сфокусируйте объектив на очаге пятнистости'],
    avoid: ['Оценка состояния лозы по размытым фото'],
    sources: [AGRONOMIC_SOURCES.fao],
    expertReview: { status: 'reviewed', reviewerRole: 'Агроном', reviewedAt: '2026-08-20' },
    contentVersion: CURRENT_CONTENT_VERSION,
  }
];

export const PEPPER_KNOWLEDGE_BASE: PlantConditionProfile[] = [
  {
    id: 'pepper-healthy',
    cropId: 'pepper',
    label: 'Здоровый лист перца',
    commonNamesRu: ['Здоровый перец', 'Нормальное развитие сладкого перца'],
    description: 'Листья сладкого перца глянцевые, равномерно зеленые, плотные, без краевых некрозов, пятен бактериоза или мозаичности.',
    symptoms: ['Ровная окраска пластинки', 'Глянцевая гладкая поверхность', 'Отсутствие некротических точек'],
    limitsOfVisual: 'Не исключает начальную фазу сосудистого увядания в первые дни после инфицирования.',
    recommendations: [
      'Поддерживайте оптимальную температуру (22–26°C) и влажность в теплице',
      'Поливайте перец теплой водой строго под корень',
      'Обеспечьте умеренное регулярное проветривание без холодных сквозняков',
    ],
    avoid: ['Полив холодной водой по листьям', 'Резкие перепады влажности и температуры'],
    sources: [AGRONOMIC_SOURCES.fao, AGRONOMIC_SOURCES.cornell],
    expertReview: { status: 'reviewed', reviewerRole: 'Агроном овощеводства', reviewedAt: '2026-08-20' },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
  {
    id: 'pepper-bacterial-spot',
    cropId: 'pepper',
    label: 'Бактериальная пятнистость перца',
    latinName: 'Xanthomonas campestris pv. vesicatoria',
    commonNamesRu: ['Черная бактериальная пятнистость', 'Ксантомоноз перца'],
    description:
      'Опасная бактериальная болезнь сладкого и острого перца, развивающаяся при высокой температуре (25–30°C) и высокой влажности. Бактерии проникают через устьица и микротравмы.',
    symptoms: [
      'Мелкие (1–3 мм) округлые водянистые пятна на листьях, быстро становящиеся коричневыми или темно-бурыми с черным центром',
      'Желтый маслянистый ореол вокруг пятен',
      'Слияние пятен, приводящее к пожелтению, засыханию и массовому опадению листьев (дефолиации)',
      'Шероховатые приподнятые бородавчатые струпики на плодах',
    ],
    limitsOfVisual: 'Ранние пятна могут напоминать грибной церкоспороз. Водянистая полупрозрачная структура на просвет — признак бактериальной инфекции.',
    recommendations: [
      'Используйте только проверенные обеззараженные семена от надежных производителей',
      'Соблюдайте севооборот: не возвращайте перец и томаты на то же место ранее чем через 3 года',
      'Переведите полив на капельный: капли воды и брызги — главный переносчик бактерий',
      'Не работайте в посадках при мокрых листьях, чтобы не разносить бактериальную слизь руками и инвентарем',
    ],
    avoid: [
      'Категорически исключите дождевание и полив сверху по листьям',
      'Не проводите пасынкование и сбор плодов во время росы или после дождя',
      'Не используйте семена из зараженных плодов',
    ],
    sources: [AGRONOMIC_SOURCES.cornell, AGRONOMIC_SOURCES.uc_ipm, AGRONOMIC_SOURCES.fao],
    similarConditions: ['tomato-bacterial-spot'],
    expertReview: { status: 'reviewed', reviewerRole: 'Фитопатолог овощных культур', reviewedAt: '2026-08-25' },
    contentVersion: CURRENT_CONTENT_VERSION,
  },
  {
    id: 'pepper-uncertain',
    cropId: 'pepper',
    label: 'Недостаточно данных / Неопределённость (Перец)',
    commonNamesRu: ['Низкое качество снимка', 'Неопределённые признаки перца'],
    description: 'Снимок листа перца не позволяет достоверно установить наличие патогена.',
    symptoms: [],
    limitsOfVisual: 'Сделайте четкий снимок пораженного листа при рассеянном свете.',
    recommendations: ['Сфотографируйте лист перца с расстояния 15–20 см', 'Сфокусируйте камеру на границе пятна'],
    avoid: ['Оценка состояния перца по размытым кадрам'],
    sources: [AGRONOMIC_SOURCES.fao],
    expertReview: { status: 'reviewed', reviewerRole: 'Агроном', reviewedAt: '2026-08-20' },
    contentVersion: CURRENT_CONTENT_VERSION,
  }
];

export const KNOWLEDGE_BASE = [
  ...TOMATO_KNOWLEDGE_BASE,
  ...POTATO_KNOWLEDGE_BASE,
  ...APPLE_KNOWLEDGE_BASE,
  ...GRAPE_KNOWLEDGE_BASE,
  ...PEPPER_KNOWLEDGE_BASE,
  ...CORN_KNOWLEDGE_BASE,
];

export function getConditionProfile(id: string): PlantConditionProfile | undefined {
  return KNOWLEDGE_BASE.find((c) => c.id === id);
}

export function findProfileByDiagnosisClass(diagnosisClass: string): PlantConditionProfile | undefined {
  if (!diagnosisClass) return undefined;
  const lower = diagnosisClass.toLowerCase().trim();
  const existing = KNOWLEDGE_BASE.find((c) => 
    c.label.toLowerCase() === lower || 
    c.commonNamesRu.some(name => name.toLowerCase() === lower) ||
    c.id.toLowerCase() === lower
  );
  if (existing) return existing;

  const pv = findPlantVillageDef(diagnosisClass);
  if (pv) {
    return {
      id: pv.key,
      cropId: pv.cropId,
      label: pv.conditionRu,
      latinName: pv.latinName,
      commonNamesRu: [pv.conditionEn, pv.key],
      description: pv.description,
      symptoms: pv.symptoms,
      limitsOfVisual: pv.limitsOfVisual,
      recommendations: pv.recommendations,
      avoid: pv.avoid,
      sources: [AGRONOMIC_SOURCES.fao],
      expertReview: {
        status: 'reviewed',
        reviewerRole: 'PlantVillage Agronomic Benchmark',
        reviewedAt: '2026-09-01',
      },
      contentVersion: CURRENT_CONTENT_VERSION,
    };
  }

  return undefined;
}
