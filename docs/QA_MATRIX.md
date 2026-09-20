# PlantGuard AI — Mobile QA Test Matrix

**Version**: 1.0.0  
**Target OS**: Android 10..15, iOS 16..18, Mobile Web (Chrome / Safari)  
**Date**: September 2026

---

## 1. Test Matrix Overview

| Area ID | Feature Area | Primary Device Focus | Automation Status |
|---|---|---|---|
| **QA-01** | First Launch & Onboarding | Small (360×640), Medium (390×844), Large (430×932) | Manual / E2E |
| **QA-02** | Camera Viewfinder & Photo Capture | Real Hardware Camera / Permissions | Manual Device |
| **QA-03** | Gallery Image Picker | Android Scoped Storage / iOS Photos | Unit + Manual |
| **QA-04** | Photo Preview & Crop Selection | All form factors | Unit + Manual |
| **QA-05** | Offline DEMO Analysis Flow | Airplane Mode (no network) | Jest Automated + Manual |
| **QA-06** | AI Mode & Cloud Backend Requests | Online WiFi / 4G / Offline failure | Jest Automated + Manual |
| **QA-07** | Result Display & Visual Diagnosis Limits | All screen sizes & Font scaling | Unit + Manual |
| **QA-08** | Recommendations & Similar Diseases | Interaction & Modals | Unit + Manual |
| **QA-09** | History Storage & Orphan File Cleanup | Filesystem persistence & deletion | Jest Automated + Device |
| **QA-10** | Settings, Mode Switch & Email Feedback | Linking to native mail / URL check | Jest Automated + Device |

---

## 2. Test Cases Specification

### QA-01: First Launch & Onboarding
- **Preconditions**: Fresh install or app data cleared.
- **Steps**:
  1. Launch application.
  2. Verify Splash/Onboarding screen displays with correct branding and illustration.
  3. Tap «Начать».
- **Expected Outcome**: Transitions to Home Screen tab without crash or layout shift.

### QA-02: Camera Capture
- **Preconditions**: Device camera enabled.
- **Steps**:
  1. Tap «Проверить растение» on Home Screen.
  2. If prompt appears, tap «Разрешить» for Camera.
  3. Align leaf within target reticle.
  4. Press shutter button.
- **Expected Outcome**: Photo captured, displayed in Preview screen with correct orientation.

### QA-03: Camera Denial Fallback
- **Preconditions**: Camera permission denied by user.
- **Steps**:
  1. Open Camera screen.
  2. Deny camera permission.
- **Expected Outcome**: Polite notification displayed explaining camera is required, with accessible button to choose photo from Gallery instead.

### QA-04: Airplane Mode / Offline DEMO Analysis
- **Preconditions**: Device in Airplane Mode (WiFi and Cellular OFF).
- **Steps**:
  1. Ensure app is in «Демо-режим».
  2. Select bundled scenario (e.g. «Возможная ранняя пятнистость»).
  3. Tap «Анализировать».
- **Expected Outcome**: Process screen runs real validation without network, transitions to Result with «Учебный сценарий (офлайн)» badge.

### QA-05: Arbitrary User Photo in DEMO Mode (Honesty Rule)
- **Preconditions**: In «Демо-режим».
- **Steps**:
  1. Pick an arbitrary photo of a non-scenario leaf or household object.
  2. Tap «Анализировать».
- **Expected Outcome**: Result screen displays status `model_not_connected` («Модель не подключена»), NO fake disease label, NO fake confidence percentage, and polite educational message.

### QA-06: File Deletion & Orphan Cleanup
- **Preconditions**: At least 2 analyses saved in History with captured photos.
- **Steps**:
  1. Note image file exists in `Paths.document/plantguard-photos/`.
  2. Delete one item from History.
  3. Confirm deletion in dialog.
- **Expected Outcome**: Record is removed from list. Associated physical image file is unlinked and deleted from storage.

### QA-07: AI Mode Privacy Consent Guard
- **Preconditions**: App configured in «AI-режим» with valid server URL.
- **Steps**:
  1. Select a photo in Preview screen.
  2. Tap «Анализировать».
- **Expected Outcome**: Native alert modal prompts user: *«Фотография будет отправлена на сервер для анализа моделью. Персональные данные не передаются»*. Photo is not transmitted until user taps «Согласен, анализировать».
