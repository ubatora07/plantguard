# PlantGuard AI — Backend API Contract v1

**Version**: 1.0.0  
**Base URL**: `https://api.plantguard.ai` (configured via `EXPO_PUBLIC_API_BASE_URL`)  
**Date**: September 2026  
**Status**: Stable specification for production ML backend integration

---

## 1. Overview

This document specifies the exact contract between the PlantGuard AI mobile client (React Native / Expo) and the inference backend server.

### Core Principles
1. **Honesty**: When the image quality or confidence is below calibrated operational thresholds, the backend MUST return `status: "insufficient_data"` or `status: "uncertain"` instead of guessing or returning a low-confidence false positive.
2. **Safety**: Recommendations must adhere strictly to integrated pest management (IPM) standards (cultural, sanitizing, and advisory). No specific chemical dosages or commercial brand names may be returned.
3. **No Phantom Confidence**: Confidence must be calibrated probability \(P \in [0.0, 1.0]\).

---

## 2. Endpoints

### 2.1 Health Check

```http
GET /v1/health
```

#### Response: `200 OK`
```json
{
  "status": "healthy",
  "modelVersion": "plantguard-tomato-v1.2",
  "contentVersion": "2026.1",
  "supportedCrops": ["tomato"]
}
```

---

### 2.2 Submit Image for Diagnosis

```http
POST /v1/diagnosis
Content-Type: multipart/form-data
```

#### Request Headers
| Header | Type | Required | Description |
|---|---|---|---|
| `Accept` | string | Yes | `application/json` |
| `User-Agent` | string | Optional | Client identifier e.g. `PlantGuard-App/1.0.0 (Android 14; Pixel 8)` |
| `X-Request-Id` | string | Optional | Client-generated UUID for distributed request tracing |

#### Multipart Form Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `image` | binary / file | **Yes** | Photo of the leaf. Accepted formats: `image/jpeg`, `image/png`, `image/webp`, `image/heic`. Max size: 10 MB. Min dimension: 224×224 px. |
| `crop` | string | **Yes** | Target crop identifier. Currently supported: `"tomato"`. |
| `clientVersion` | string | Optional | Version of the mobile application (e.g. `"1.0.0"`). |

---

## 3. Response Schema

### 3.1 Successful Prediction (`200 OK`)

```json
{
  "requestId": "req-98e3b2a1-54c7-4389-9a22-d76a218f0c3d",
  "status": "prediction",
  "predictedClass": "Ранняя пятнистость (Альтернариоз)",
  "predictedClassLatin": "Alternaria solani",
  "confidence": 0.89,
  "explanation": "Обнаружены выраженные концентрические тёмно-бурые некротические пятна, типичные для грибковой инфекции Alternaria solani.",
  "symptoms": [
    "Округлые тёмно-бурые пятна с концентрическими кругами",
    "Хлоротичный желтоватый ореол вокруг повреждений",
    "Преимущественное поражение нижнего яруса листьев"
  ],
  "recommendations": [
    "Аккуратно удалите и изолируйте сильно поражённые листья",
    "Обеспечьте свободную циркуляцию воздуха между рядами",
    "Переведите полив строго под корень (капельный полив)",
    "При массовом распространении покажите образец листа агроному"
  ],
  "avoid": [
    "Не проводите полив по листьям",
    "Не компостируйте поражённую ботву на открытом участке",
    "Не используйте химические средства без консультации специалиста"
  ],
  "limitsOfVisual": "Ранние очаги трудно отличимы от септориоза без микроскопии спороношения.",
  "modelVersion": "plantguard-tomato-v1.2",
  "contentVersion": "2026.1",
  "processingTimeMs": 342
}
```

### 3.2 Healthy Leaf (`200 OK`)

```json
{
  "requestId": "req-4a21e69b-8bc0-429a-9e12-b3614917a80b",
  "status": "no_signs",
  "predictedClass": "Здоровый лист",
  "confidence": 0.95,
  "explanation": "Листовая пластинка томата с равномерной зелёной окраской без видимых очагов инфекций или деформаций.",
  "symptoms": [
    "Равномерная окраска листовой пластины",
    "Отсутствие некрозов и хлорозов"
  ],
  "recommendations": [
    "Продолжайте регулярный осмотр посадок 1–2 раза в неделю",
    "Поддерживайте рекомендованную влажность и проветривание"
  ],
  "avoid": [
    "Не проводите профилактических обработок препаратами «на всякий случай»"
  ],
  "limitsOfVisual": "Визуальный осмотр не исключает скрытый инкубационный период патогенов.",
  "modelVersion": "plantguard-tomato-v1.2",
  "contentVersion": "2026.1",
  "processingTimeMs": 280
}
```

### 3.3 Insufficient Quality or Uncertainty (`200 OK`)

When the photo is blurry, dark, or out of domain:

```json
{
  "requestId": "req-0fa4b12c-396a-4d76-90b1-3e4a90518342",
  "status": "insufficient_data",
  "failureCode": "insufficient_quality",
  "confidence": null,
  "explanation": "Качество снимка (резкость или освещение) не позволяет надёжно определить состояние растения.",
  "symptoms": [],
  "recommendations": [
    "Сделайте новый снимок при дневном равномерном освещении",
    "Поместите один лист в центр кадра так, чтобы он занимал не менее 70% площади",
    "Убедитесь, что камера сфокусирована на границе повреждения"
  ],
  "avoid": [
    "Не делайте поспешных выводов и не проводите обработок по нерезкому снимку"
  ],
  "limitsOfVisual": "Алгоритм требует чёткого изображения листовой пластинки в фокусе.",
  "modelVersion": "plantguard-tomato-v1.2",
  "contentVersion": "2026.1",
  "processingTimeMs": 195
}
```

---

## 4. Error Responses

| HTTP Status | Error Code | Client Handling |
|---|---|---|
| `400 Bad Request` | `invalid_request` | Display message: "Некорректный запрос". Check form parameters. |
| `413 Payload Too Large` | `payload_too_large` | Display message: "Размер фото превышает 10 МБ. Уменьшите размер". |
| `415 Unsupported Media Type` | `unsupported_media_type` | Display message: "Формат файла не поддерживается (используйте JPG или PNG)". |
| `422 Unprocessable Entity` | `unsupported_crop` | Display message: "Выбранная культура пока не поддерживается сервером". |
| `429 Too Many Requests` | `rate_limited` | Display message: "Слишком много запросов. Подождите минуту". |
| `500 Internal Server Error` | `server_error` | Display message: "Ошибка сервера. Попробуйте позже". |
| `503 Service Unavailable` | `service_unavailable` | Display message: "Сервис временно недоступен. Ведутся технические работы". |

### Standard Error Body
```json
{
  "error": {
    "code": "unsupported_media_type",
    "message": "Uploaded file is not a supported image format. Supported formats: jpeg, png, webp, heic."
  }
}
```

---

## 5. Performance & SLA Budgets

- **Timeout**: 30 seconds (client aborts after 30,000 ms).
- **Latency Target**:
  - `p50 < 800 ms`
  - `p95 < 2500 ms`
  - `p99 < 5000 ms`
- **Max Image Payload**: 10 MB.
- **Min Model Input Resolution**: 224×224 px (resized server-side to model architecture requirement).
