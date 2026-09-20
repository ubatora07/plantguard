# PlantGuard AI — Pilot Readiness Report

**Date**: September 2026  
**Auditor**: Mobile QA Lead  
**Overall Verdict**: **ГОТОВ С ОГРАНИЧЕНИЯМИ (Ready with Restrictions)**

---

## 1. Executive Summary

Mobile client version 1.0.0 is thoroughly tested, structurally sound, and enforces complete data honesty.
- **Offline Pilot Readiness**: **100% READY**. Agronomists and growers can test the UI, camera capture, photo guidance, history management, and verified Tomato knowledge base offline without any network dependence.
- **Cloud ML Inference Readiness**: **STAGING SERVER REQUIRED**. The mobile client implements the full `POST /v1/diagnosis` contract, timeout handling, error recovery, and consent flow, but is currently pointed to an empty `EXPO_PUBLIC_API_BASE_URL`.

---

## 2. P4.0 Verification Matrix

| Check ID | Criterion | Actual Finding | Result |
|---|---|---|---|
| **P4.0.1** | Real backend existence | `EXPO_PUBLIC_API_BASE_URL` in `.env` is empty. Backend server is not yet deployed to a public URL. | ⚠️ Ограничение |
| **P4.0.2** | ML Model vs Mock | `DemoProvider` (scenarios) and `ModelProvider` (HTTP client) are separated. Mock prediction that invents fake diagnoses on user photos does NOT exist. | ✅ Проверено |
| **P4.0.3** | Detectable Disease Classes | Tomato is strictly bounded to 4 condition classes: Healthy, Early Blight (*A. solani*), Late Blight (*P. infestans*), Septoria Leaf Spot (*S. lycopersici*), plus Uncertain. | ✅ Проверено |
| **P4.0.4** | Sync with `knowledge-base.ts` | 100% match across `knowledge-base.ts`, `demo-scenarios.ts`, and `API_CONTRACT.md`. | ✅ Проверено |
| **P4.0.5** | Unsupported Crop Handling | Selecting or submitting an unsupported crop raises typed `unsupported_crop` error; malformed history entries are rejected. | ✅ Проверено |
| **P4.0.6** | Unreachable Backend Handling | Throws typed `model_not_configured` or `network_error`; UI displays polite message with back CTA; switching to AI mode without URL is blocked. | ✅ Проверено |
| **P4.0.7** | DEMO vs AI Separation | Distinct UI badges (`Демо-режим` vs `AI-режим`, `Учебный сценарий (офлайн)` vs `Предсказание ML-модели`), distinct radio options. | ✅ Проверено |
| **P4.0.8** | Honest Arbitrary Photo in DEMO | Returns `model_not_connected`, `resultOrigin: 'no_prediction'`, no class, no confidence, no invented symptoms. Verified by unit test. | ✅ Проверено |
| **P4.0.9** | Available Pilot Features | Camera capture, guidance tips, offline scenarios, local history, sandbox file unlinking, IPM recommendations, email feedback. | ✅ Проверено |
| **P4.0.10** | Readiness Verdict | **Готов к ограниченному пилоту (DEMO & UX phase)**. Допуск к сетевому AI-тестированию — после развёртывания staging-сервера. | ✅ Проверено |

---

## 3. Scope of the Immediate Pilot (Phase 1)

During Phase 1 of the field pilot:
1. Agronomists evaluate leaf photography usability under natural field and greenhouse lighting conditions.
2. Growers evaluate clarity of educational scenarios and IPM cultural recommendations.
3. Field testers verify that no crashes, photo file leaks, or UI clipping occur on target Android and iOS handsets.
4. Testers collect diverse field photos across cultivars for the validation test set.
