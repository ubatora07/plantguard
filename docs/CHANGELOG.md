# PlantGuard AI — Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-09-18

### Changed
- **AGRO-SCAN Design System**: Theme tokens realigned to the botanical spec — primary `#1A4D2E` (9.2:1 on surface), background `#F8FAF7`, border `#E2E8E0`, text `#131E14`/`#4A554B`; typography scale (display 32/40 … metric 12/16), radii 6/12/20/pill, green-tinted soft shadows.
- **Phytosanitary Severity Scale**: New `severityForRecord()` maps verified classes/statuses to healthy/mild/moderate/severe tokens; severity badge shown on the result card.
- **Result Screen**: Photo-first layout, radial SVG confidence gauge (large tabular percentage, emerald ≥80% / amber 50–79% / terracotta <50%), crop chip, Latin name, origin + severity badges, amber ambiguity banner when confidence < 0.75.
- **Camera HUD**: Shutter per spec (72pt trigger, white ring, botanical center, 0.92 press scale), working flash toggle wired to `CameraView.flash`, pill-shaped framing banner.
- **Processing Screen**: Real analyzed photo (or demo visual) with a looping scanline sweep; step list remains tied to actual pipeline stages.
- **Component Polish**: Amber demo badges, pill filter chips, unified 12px thumbnails, updated onboarding/guide/crops/recommendations/profile colors.

### Fixed
- Guide screen header title no longer truncates ("Как фотографировать").

### Notes
- Visual acceptance: 12 screens rendered via web export and judged; 10 passed outright, guide-title truncation fixed, "листвев" flag on crops screen disproved against DOM text (correct "листьев", raster artifact of 13px capture).

---

## [1.0.0] - 2026-09-18

### Added
- **Verified Knowledge Base**: Integrated 5 verified tomato condition profiles (`tomato-healthy`, `tomato-early-blight`, `tomato-late-blight`, `tomato-septoria`, `tomato-uncertain`) cited from FAO, Cornell CCE, UC IPM, and EPPO.
- **Data Provenance**: Added `ResultOrigin` (`demo_sample` | `model_prediction` | `no_prediction`) and content versioning (`2026.1`).
- **Orphan File Cleanup**: Implemented physical image unlinking in `historyRepository.remove()` and `historyRepository.clear()`.
- **Privacy Consent**: Added user consent prompt before transmitting photos in AI mode.
- **Academic Citation Registry**: Documented all agronomic sources in `docs/CONTENT_SOURCES.md`.
- **Backend API Contract**: Full OpenAPI/REST specification in `docs/API_CONTRACT.md`.
- **ML Governance**: Detailed dataset and calibration requirements in `docs/ML_REQUIREMENTS.md`.
- **Quality Assurance**: Added `docs/QA_MATRIX.md`, `docs/UX_FLOWS.md`, `docs/DATA_DICTIONARY.md`, and `docs/RELEASE_CHECKLIST.md`.
- **Automated Tests**: Added `tests/knowledge-base.test.ts` (suite expanded to 5 suites, 34 passing tests).

### Changed
- **Honesty First**: Removed decorative "PRO" badge from home screen, replaced with honest "Базовая версия".
- **Real Timing**: Removed simulated `setTimeout` delays in `process.tsx`; analysis executes at real provider speed.
- **Real Feedback Action**: Replaced text alert in Profile with native `mailto:support@plantguard.ai` via `Linking`.

### Fixed
- **History Leaks**: Eliminated disk accumulation of orphan photo files when deleting history entries.
- **DEMO Integrity**: Arbitrary user photos in DEMO mode are honestly marked as `model_not_connected` without fake confidence.
