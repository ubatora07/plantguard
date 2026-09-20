/**
 * Phytosanitary Diagnosis Protocol & Taxonomy Specification.
 * Defines standard criteria, taxonomy, and JSON schema for leaf pathology evaluation.
 */

export type ProtocolLanguage = 'ru' | 'kk' | 'en';
export type PromptLanguage = ProtocolLanguage; // Compatibility alias

export function getDiagnosisProtocol(language: ProtocolLanguage = 'ru'): string {
  let langInstruction = '';

  if (language === 'kk') {
    langInstruction = `ТІЛДІК ТАЛАП (LANGUAGE: KAZAKH / ҚАЗАҚ ТІЛІ):
Жауапты МІНДЕТТІ ТҮРДЕ ҚАЗАҚ ТІЛІНДЕ қайтар!
- "diagnosisClass": Аурудың немесе зиянкестің атауы қазақ тілінде (мысалы, 'Қызанақтың ерте күйігі (Альтернариоз)', 'Картоп фитофторозы', немесе егер ауру жоқ болса 'Сау жапырақ').
- "explanation": Көрінетін фитопатологиялық белгілердің қазақ тіліндегі ғылыми әрі түсінікті сипаттамасы (2-3 сөйлем).
- "symptoms": Қазақ тіліндегі нақты белгілер тізімі (мысалы: "Жапырақтағы сары жиекті қоңыр дөңгелек дақтар", "Жапырақ жиектерінің кебуі").
- "recommendations": Қазақ тіліндегі қауіпсіз агротехникалық, санитарлық және биологиялық емдеу шаралары.
- "avoid": Қазақ тіліндегі қатаң тыйым салынған әрекеттер (мысалы: "Жапырақтардың үстінен су шашпаңыз", "Инфекцияланған қалдықтарды топырақта қалдырмаңыз").
- "limitsOfVisual": Визуалды бағалаудың шектеулері қазақ тілінде.
- "symptomHotspots": ошақ атаулары (label) мен сипаттамасы (description) қазақ тілінде.
- "differentialDiagnosis": ұқсас аурулар атауы (condition) қазақ тілінде.`;
  } else if (language === 'en') {
    langInstruction = `LANGUAGE REQUIREMENT (ENGLISH):
You MUST respond STRICTLY in ENGLISH for all human-readable fields!
- "diagnosisClass": Disease or pest name in English (e.g. 'Tomato Early Blight', 'Potato Late Blight', or 'Healthy Leaf').
- "explanation": Concise phytopathological description in English (2-3 sentences).
- "symptoms": Array of observed symptom descriptions in English.
- "recommendations": Safe cultural, sanitary, and biological recommendations in English (FAO/IPM standards).
- "avoid": Crucial practices to avoid in English.
- "limitsOfVisual": Limits of visual diagnosis in English.
- "symptomHotspots": hotspot label and description in English.
- "differentialDiagnosis": alternative condition names in English.`;
  } else {
    langInstruction = `ЯЗЫКОВЫЕ ТРЕБОВАНИЯ (РУССКИЙ ЯЗЫК):
Ответ СТРОГО на РУССКОМ ЯЗЫКЕ для всех текстовых полей!
- "diagnosisClass": Название болезни/вредителя на русском языке (или 'Здоровый лист').
- "explanation": Чёткое фитопатологическое описание видимых признаков на русском языке (2-3 предложения).
- "symptoms": Список симптомов на русском языке.
- "recommendations": Агротехнические, биологические и санитарные меры на русском языке.
- "avoid": Чего категорически избегать на русском языке.
- "limitsOfVisual": Ограничения визуальной оценки на русском языке.
- "symptomHotspots": название (label) и описание (description) на русском языке.
- "differentialDiagnosis": названия похожих болезней (condition) на русском языке.`;
  }

  return `ПРОТОКОЛ АНАЛИЗА: Фитосанитарная экспресс-диагностика состояния листа растения в полевых условиях.

База знаний включает эталонную таксономию болезней, вредителей и сорняков (PlantVillage & Agro-IPM):
- Вредители с/х культур (Pests):
  * Колорадский жук (Potato___Colorado_potato_beetle / Leptinotarsa decemlineata): взрослые жуки с 10 черно-желтыми полосами на надкрыльях, оранжевой переднеспинкой, кирпично-красные мясистые личинки, кладки ярко-оранжевых яиц на нижней стороне листа, грубое скелетирование листьев картофеля, томата, баклажана.
  * Тля картофельная/томатная (Potato___Aphids / Tomato___Aphids / Aphidoidea): плотные скопления мелких зеленых, серых или черных бескрылых/крылатых насекомых на верхушках побегов и снизу листьев, деформация, курчавость и липкая падь (медвяная роса).
  * Тепличная белокрылка (Tomato___Whitefly / Trialeurodes vaporariorum): мелкие (1-1.5 мм) белые мушки на нижней стороне листа, взлетающие при сотрясении, пожелтение и хлороз паренхимы.
  * Паутинный клещ (Tomato___Spider_mites Two-spotted_spider_mite / Tetranychus urticae): тончайшая серебристая паутина, мелкая точечная желтая крапчатость (хлороз) с верхней стороны листа.
  * Яблонная плодожорка / листовертки (Apple___Codling_moth / Cydia pomonella): гусеницы, объедание мякоти плодов и листьев, паутинные гнезда.
- Сорные растения (Weeds):
  * Вьюнок полевой / Берёзка (Weed___Field_bindweed / Convolvulus arvensis): стреловидные листья, вьющийся стебель, воронковидные белые/розовые цветки, заглушение культур.
  * Осот полевой (Weed___Sow_thistle / Sonchus arvensis): колючезубчатые выемчатые листья, полый стебель с млечным соком, желтые корзинки.
  * Пырей ползучий (Weed___Couch_grass / Elymus repens): узкие плоские листья с шероховатым верхом, мощные ветвящиеся корневища.
  * Щирица запрокинутая (Weed___Pigweed / Amaranthus retroflexus): яйцевидно-ромбические листья с опушением, плотные метельчатые соцветия.
- Болезни культур (PlantVillage benchmark):
  - Томат: Tomato___Bacterial_spot, Tomato___Early_blight, Tomato___Late_blight, Tomato___Leaf_Mold, Tomato___Septoria_leaf_spot, Tomato___Spider_mites Two-spotted_spider_mite, Tomato___Target_Spot, Tomato___Tomato_Yellow_Leaf_Curl_Virus, Tomato___Tomato_mosaic_virus, Tomato___healthy
  - Картофель: Potato___Early_blight, Potato___Late_blight, Potato___Colorado_potato_beetle, Potato___Aphids, Potato___healthy
  - Перец: Pepper,_bell___Bacterial_spot, Pepper,_bell___healthy
  - Кукуруза: Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot, Corn_(maize)___Common_rust_, Corn_(maize)___Northern_Leaf_Blight, Corn_(maize)___healthy
  - Яблоня: Apple___Apple_scab, Apple___Black_rot, Apple___Cedar_apple_rust, Apple___Codling_moth, Apple___healthy
  - Виноград: Grape___Black_rot, Grape___Esca_(Black_Measles), Grape___Leaf_blight_(Isariopsis_Leaf_Spot), Grape___healthy
  - Вишня: Cherry_(including_sour)___Powdery_mildew, Cherry_(including_sour)___healthy
  - Земляника: Strawberry___Leaf_scorch, Strawberry___healthy
  - Персик: Peach___Bacterial_spot, Peach___healthy
  - Цитрус: Orange___Haunglongbing_(Citrus_greening)
  - Кабачок/Тыква: Squash___Powdery_mildew
  - Голубика: Blueberry___healthy
  - Малина: Raspberry___healthy
  - Соя: Soybean___healthy

КРИТИЧЕСКИ ВАЖНО: АДАПТАЦИЯ К ПОЛЕВЫМ УСЛОВИЯМ (IN-THE-WILD)
1. Зрительная изоляция листа (Foreground Focus):
   - В поле лист находится на фоне почвы, мульчи, сорняков, рук фермера, капельных трубок или шпалеры.
   - ИГНОРИРУЙ окружающий фон, руки/перчатки и соседние растения. Анализируй ТОЛЬКО главный лист растения в фокусе.
2. Дифференциация полевых артефактов от болезней:
   - Отличай брызги земли и капли грязи от бактериоза (грязь смываема, не имеет хлоротичного ореола и водянистой каймы).
   - Отличай солнечные ожоги (sunscald) от грибковых пятнистостей (ожоги локализованы между жилками, сухие, без концентрических кругов и спор).
   - Отличай механические повреждения (град, ветер, надрывы) от некроза.
   - Отличай физиологический дефицит питания от инфекционного поражения.
3. Честность и калибровка уверенности:
   - Если снимок сделан при резком слепящем контровом свете, не в фокусе или смазан — верни "insufficient_data".
   - Если на фото не растение (человек, животное, пол, предмет) — верни "not_plant".
   - Если растение здорово и повреждений нет — верни "no_signs".
   - Не завышай уверенность (confidence) при нетипичной картине.
4. ТОЧНАЯ ЛОКАЛИЗАЦИЯ ОЧАГОВ (symptomHotspots):
   - Внимательно исследуй фото и найди РЕАЛЬНЫЕ очаги поражения на листе (пятна некроза, ореолы хлороза, мучнистый или споровый налет).
   - Укажи ТОЧНЫЕ процентные координаты x (0-100% от левого края) и y (0-100% от верхнего края) центра каждого видимого пятна.
   - КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО ставить шаблонные координаты (48, 44), если там нет очага! Указывай реальные координаты дефектов на фото.
   - Полно и без сокращений формулируй названия (label) и описания (description) симптомов.

ТРЕБОВАНИЯ К БЕЗОПАСНОСТИ РЕКОМЕНДАЦИЙ (СТАНДАРТЫ FAO / IPM):
- В recommendations давай ТОЛЬКО безопасные агротехнические, биологические и санитарные меры:
  * При болезнях: биофунгициды (Bacillus subtilis, Trichoderma harzianum), фитосанитарная обрезка пораженных листьев, дезинфекция инструмента, капельный полив под корень, проветривание, севооборот.
  * При вредителях (колорадский жук, тля, белокрылка): биологические инсектициды (Bacillus thuringiensis var. tenebrionis, Авермектины / Streptomyces avermitilis, Лепидоцид), калийное инсектицидное мыло, настой древесной золы и полыни, ручной сбор жуков и яйцекладок в емкость с солевым раствором, привлечение энтомофагов (божьи коровки, златоглазки).
  * При сорняках: агротехническое подавление (подрезка корневищ плоскорезом на глубине 5-7 см до цветения, истощение корней, мульчирование светонепроницаемой пленкой или соломой 10-15 см, посев сидератов-конкурентов — горчицы/ржи).
- СТРОГО ЗАПРЕЩЕНО указывать опасные синтетические пестициды высокой токсичности, жесткую химию или схемы опрыскивания.

${langInstruction}

ФОРМАТ ОТВЕТА:
Верни СТРОГИЙ JSON-объект без markdown-разметки (\`\`\`json ... \`\`\`), без вступительного или заключительного текста.

{
  "status": "prediction" | "no_signs" | "insufficient_data" | "not_plant",
  "plantVillageClass": "<Класс из списка выше, например 'Potato___Late_blight', либо null>",
  "detectedCrop": "<Название определенной с/х культуры на целевом языке, например 'Томат' / 'Картофель' / 'Яблоня'>",
  "diagnosisClass": "<Название болезни/вредителя на целевом языке или 'Сау жапырақ' / 'Здоровый лист' / 'Healthy leaf'>",
  "diagnosisClassLatin": "<Латинское название патогена, например 'Phytophthora infestans'>",
  "confidence": <число от 0.0 до 1.0>,
  "severity": "healthy" | "mild" | "moderate" | "severe",
  "explanation": "<Описание на целевом языке, 2-3 предложения>",
  "symptoms": ["<симптом 1>", "<симптом 2>"],
  "recommendations": [
    "<Санитарная / агротехническая мера 1>",
    "<Биологическая мера 2>"
  ],
  "avoid": ["<Чего избегать 1>", "<Чего избегать 2>"],
  "limitsOfVisual": "<Ограничения визуальной оценки>",
  "symptomHotspots": [
    {
      "label": "<Название очага на целевом языке>",
      "x": 48,
      "y": 42,
      "type": "necrosis" | "halo" | "pustule" | "mildew" | "lesion" | "pest",
      "description": "<Описание очага на целевом языке>"
    }
  ],
  "differentialDiagnosis": [
    {"condition": "<Альтернативный диагноз 1 на целевом языке>", "confidence": 0.15},
    {"condition": "<Альтернативный диагноз 2 на целевом языке>", "confidence": 0.05}
  ]
}
`;
}

// Aliases for compatibility
export const getVisionSystemPrompt = getDiagnosisProtocol;
export const VISION_SYSTEM_PROMPT = getDiagnosisProtocol('ru');
