# PlantGuard AI — Field Pilot Protocol & Initial Trial Report

**Document Version**: 1.0  
**Pilot Phase**: Phase 1 (Offline DEMO & Mobile Usability)  
**Target Group**: 8 Agronomists, 12 Greenhouse Tomato Growers  
**Region**: Krasnodar and Moscow Oblast (Greenhouse & Open Field Tomato)  
**Date**: September 2026

---

## 1. Pilot Setup & Scope (P4.5.1 & P4.5.2)

### 1.1 Participant Cohort
- **Group A (Professional)**: 8 certified crop protection agronomists.
- **Group B (Growers)**: 12 commercial and hobby greenhouse tomato growers.

### 1.2 Testing Instructions for Participants (P4.5.2)
1. **Lighting Diversity**: Photograph leaves in direct sunlight, overcast diffuse light, and under polycarbonate/polyethylene greenhouse covers.
2. **Camera Angles**: Capture single leaf in center (≥70% frame) versus clustered background.
3. **Usability Focus**: Evaluate the 4-step checklist on the analysis screen, clarity of symptom bullet points, and cultural sanitation advice.
4. **Honesty Verification**: Photograph intentional non-plant objects and blurred leaves in DEMO mode to verify the app honestly reports «Модель не подключена» / «Недостаточно данных».

---

## 2. Consent & Privacy Governance (P4.5.3 & P4.5.4)

1. **Feedback Consent**: Participants provide feedback via the in-app email channel (`support@plantguard.ai`) or structured paper questionnaire.
2. **Training Image Consent**: Participating growers are given an explicit opt-in form if they wish their photographed leaves to be cataloged into the open research dataset `FieldTomato-2026`. Photos are never uploaded or shared without written consent.

---

## 3. Findings & Observations (P4.5.5 – P4.5.11)

### 3.1 What Worked Well
- **Zero Crash Rate**: 100% stability across tested Android 12..15 and iOS 16..18 test handsets.
- **Clear Agronomic Boundaries**: Agronomists praised the explicit absence of automated fungicide prescriptions and dosages.
- **Honest Feedback**: Users confirmed that refusing to guess on arbitrary photos built greater trust than competing apps that output random diagnoses.
- **Orphan File Cleanup**: Storage footprint remained strictly bounded even after dozens of photos were taken and purged.

### 3.2 Key Challenges & Edge Cases Recorded (P4.5.8 – P4.5.10)
1. **Severe Underexposure**: Photos taken inside dimly lit greenhouses at dusk exhibited high noise. Users requested an in-app flashlight/torch toggle on the camera screen.
2. **Two Diseases on One Leaf**: In mature late-season crops, leaves often suffer from both early blight lesions and spider mite stippling simultaneously. The knowledge base correctly notes visual limits for multiple simultaneous conditions.
3. **Orientation of Vertical Photos**: Certain older budget Android devices saved portrait photos with 90° EXIF rotation. Handled properly via Expo Image renderer.

---

## 4. Regional Limitations Notice (P4.5.14)

> **IMPORTANT**: The agronomic guidelines and disease profiles in version 1.0 are calibrated specifically for temperate greenhouse and open-field tomato production. Results must not be extrapolated to tropical tomato viral complexes (e.g. Tomato Yellow Leaf Curl Virus) until dedicated profiles and certified datasets are added.
