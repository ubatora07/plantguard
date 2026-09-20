# PlantGuard AI — Production Release Checklist

**App Version**: 1.0.0  
**Target Runtimes**: iOS (App Store), Android (Google Play), PWA / Mobile Web  
**Framework**: Expo SDK 57, React Native 0.86, React 19

---

## Pre-Flight Quality Gates

Before tagging any release commit or creating a production build:

### 1. Code Integrity & Static Analysis
- [ ] **Typecheck**: `npm run typecheck` passes with 0 errors (`tsc --noEmit`).
- [ ] **Linter**: `npm run lint` passes with 0 warnings/errors (`eslint .`).
- [ ] **Unit & Integration Tests**: `npm test` passes 100% of test suites.
- [ ] **Dependency Audit**: `npm audit` reports 0 high or critical vulnerabilities.
- [ ] **Expo Doctor**: `npx expo-doctor` passes all 21 diagnostics cleanly.
- [ ] **Export Verification**: `npx expo export` builds standard JS bundles and static assets with zero missing module errors.

---

### 2. Security & Credentials
- [ ] **No Hardcoded Secrets**: Ensure `.env`, API keys, certificates, or tokens are NOT committed to source control.
- [ ] **Backend URL Configuration**: Verify `EXPO_PUBLIC_API_BASE_URL` points to the HTTPS production API gateway.
- [ ] **No Development Endpoints**: Ensure `localhost`, `10.0.2.2`, or `http://` non-secure URLs are not present in release builds.

---

### 3. Offline & DEMO Mode Verification (Honesty Audit)
- [ ] **Airplane Mode Test**: Put device in Airplane Mode (WiFi and Cellular OFF).
  - Launch app. Verify home screen, navigation, history, crops catalog, and photo guide function without crashes or network spinners.
  - Test bundled demo scenarios (`tomato-healthy-demo`, `tomato-early-blight-demo`, `tomato-late-blight-demo`, `tomato-uncertain-demo`).
  - Verify they display honest scenario labels: `Учебный сценарий (офлайн)`.
  - Pick an arbitrary photo from device gallery in DEMO mode.
  - Verify result is honest `model_not_connected` («Модель не подключена»), with **no** fake diagnosis, **no** fake confidence score, and **no** invented pathogen symptoms.

---

### 4. AI Mode & Cloud Backend Verification
- [ ] **Connection Guard**: Switch to AI mode when `EXPO_PUBLIC_API_BASE_URL` is empty. Verify friendly dialog alerts the user that backend URL is required.
- [ ] **Consent Dialog**: With backend configured, tap «Анализировать». Verify explicit privacy consent warning appears before any network byte is sent.
- [ ] **Network Failure Grace**: Simulate server 500 or network drop during request. Verify app displays polite Russian error message with back/retry CTA without crashing.
- [ ] **Timeout Handling**: Requests exceeding 30s abort cleanly with clear timeout notification.

---

### 5. Storage & Lifecycle Cleanliness
- [ ] **History Persistence**: Records survive app close and relaunch.
- [ ] **Orphan File Removal**: Add 3 analyses with photos. Delete 1 analysis. Verify corresponding photo in `plantguard-photos/` is deleted from disk.
- [ ] **Clear All**: Tap «Очистить историю». Verify all records are deleted and sandbox photo directory is emptied.

---

### 6. UI, UX & Responsiveness
- [ ] **Safe Area Handling**: Check on notched devices (iPhone 14/15/16 Pro Dynamic Island, Pixel 8 punch-hole). Verify header and bottom tab bars do not overlap status bar or navigation pill.
- [ ] **Small Screen Test**: Test on 360×640 dp screen. Verify cards, modals, and buttons do not clip text.
- [ ] **No Fake Badges**: Verify no decorative "PRO" or "VIP" subscription badges exist.
- [ ] **Real Feedback Action**: Tap «Обратная связь» in Profile. Verify it invokes system mail client with pre-addressed email `support@plantguard.ai`.

---

### 7. Performance & Bundle Size
- [ ] **Assets Footprint**: App bundled assets (SVGs/images) should remain under 10 MB total.
- [ ] **Cold Start**: App reaches interactive home screen in `< 1.8 s` on mid-tier hardware.
- [ ] **Smooth Animations**: Animated leaf spinner and transitions render at steady 60 fps.
