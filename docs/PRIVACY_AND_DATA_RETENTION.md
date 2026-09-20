# PlantGuard AI — Privacy & Data Retention Policy

**Effective Date**: September 2026  
**Document Version**: 1.0  
**Scope**: Mobile Client (iOS / Android) and Backend Diagnostic Services

---

## 1. Fundamental Principles

PlantGuard AI is designed with a **Privacy-First, Local-First** philosophy. We recognize that farmers, agronomists, and hobby gardeners value their operational privacy.

1. **No Hidden Tracking**: The application contains **zero** third-party advertising trackers, profiling SDKs, or background telemetry.
2. **Explicit Consent**: Images are NEVER transmitted over the internet without the user's active initiation and consent.
3. **Sandbox Storage & Clean Deletion**: Stored photos live strictly within the private app sandbox and are physically wiped when removed from history.

---

## 2. On-Device Image Lifecycle

### 2.1 Storage Location
- Captured or gallery-imported photos are persisted inside the application's private document directory:
  `Paths.document/plantguard-photos/photo-{timestamp}-{random}.jpg`
- This location is sandboxed by the mobile operating system (iOS Data Protection / Android Scoped Storage) and cannot be read by other installed applications.

### 2.2 Physical File Cleanup (No Orphan Accumulation)
- When a user deletes a single record from the history list, the associated image file on disk is deleted via `deletePersistedImage()`.
- When the user selects **«Очистить историю»** in settings, all persisted image files in `plantguard-photos/` are unlinked and permanently deleted.
- Clearing app data or uninstalling the app deletes all stored photographs immediately.

---

## 3. Network Transmission in AI Mode

### 3.1 DEMO Mode (Default)
- Operates **100% offline**.
- No network requests are made.
- No device telemetry or usage statistics are transmitted.

### 3.2 AI Mode (Cloud Inference)
- **User Confirmation**: Before any photo is sent to the backend, the user receives an explicit notice:  
  *«Фотография будет отправлена на сервер для анализа моделью. Персональные данные не передаются».*
- **Transmitted Data**:
  - Binary image payload (`leaf.jpg`).
  - Target crop identifier (`crop: "tomato"`).
  - Standard HTTP headers (e.g. client app version).
- **Excluded Data**:
  - **No** GPS coordinates or location metadata (EXIF GPS tags are stripped).
  - **No** user identifiers, names, phone numbers, or email addresses.
  - **No** device IMEI, MAC address, or contact lists.

---

## 4. Server-Side Data Retention Policy

When requests reach the backend diagnosis server:

1. **Ephemeral Inference**:
   - The image is loaded into GPU memory, analyzed by the model, and the structured JSON response is returned to the client.
   - The image payload is purged from volatile memory immediately after response delivery.
2. **No Persistent Image Storage**:
   - The backend does **not** write user photos to permanent disk or cloud buckets by default.
3. **Opt-In Training Data**:
   - Images are NEVER included in future model re-training datasets without an explicit, separate opt-in consent flow with cryptographic signature.
4. **Server Logs**:
   - Standard access logs retain only timestamp, HTTP status code, request duration, and anonymous request ID for 14 days for system reliability and DDoS mitigation. Logs do not retain image binaries.

---

## 5. User Rights & Contact

Users have complete autonomy over their data:
- Immediate local data erasure via the **«Очистить историю»** button in Settings.
- Inquiries regarding privacy governance may be directed to:  
  `support@plantguard.ai` (subject: *PlantGuard Privacy*).
