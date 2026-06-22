# WEEK 09 — Advanced Mobile (React Native)
## Sprint Overview: Push Notifications, Camera/Media, Deep Linking & Performance

**Duration:** 7 days  
**Primary Focus:** Production-ready React Native features for healthcare mobile apps  
**Azure Study:** 50% integration with daily practice  
**Target:** Deploy all features + score 70%+ on Azure AI fundamentals quiz

---

## Sprint Goals

### 1. Push Notifications (Days 1-2)
- Implement HIPAA-compliant push notification system with Expo Notifications
- Handle notification types: local alerts, remote push, silent background updates
- Critical: **Never include PHI (Protected Health Information) in notification body**
- Real-world case: Clinic appointment reminders without patient name/condition
- Learning: notification lifecycle, permission handling, deep linking from notifications

### 2. Camera & Media Management (Day 2-3)
- Build document scanner for clinical documents (prescriptions, lab reports)
- Image quality validation for OCR processing
- Permission workflows (iOS/Android camera access)
- File size optimization for HIPAA-compliant storage
- Learning: media pipeline, performance implications

### 3. Deep Linking & Navigation (Day 3-4)
- Implement universal deep links for appointment booking, lab result viewing
- Handle web + app routing unification
- Testing deep link flows end-to-end
- Learning: URL scheme handling, state management across deep links

### 4. React Native Performance Optimization (Day 4-5)
- JS thread vs Native thread profiling
- Memory profiling and leak detection
- Animation performance (60 FPS target)
- Bundle size reduction strategies
- Learning: Chrome DevTools integration, Flipper debugging

### 5. App Store Submission Preparation (Day 5-6)
- App Store Connect setup and metadata
- Play Store console configuration
- Healthcare app declaration (if applicable)
- Screenshot + asset preparation
- Privacy policy + HIPAA documentation
- Learning: submission review process, common rejection reasons

### 6. Azure AI Integration Study (Days 1-7, ~50%)
- Azure OpenAI Service vs OpenAI API comparison
- Token usage and cost optimization
- Responsible AI principles for healthcare
- Week 11 exam prep: start Azure AI fundamentals

---

## Daily Schedule

| Day | Topic | Duration | Deliverables |
|-----|-------|----------|--------------|
| 1 | Push Notifications Setup | 4h | Push handler with local/remote tests |
| 2 | Camera & Document Scanner | 4h | Working document scanner + permission flow |
| 3 | Deep Linking Integration | 3h | Universal links configured + tested |
| 4 | RN Performance Profiling | 3h | Performance audit report + optimizations |
| 5 | App Store Assets & Submission | 3h | Screenshots, description, privacy policy |
| 6 | Azure AI Fundamentals | 5h | Azure OpenAI vs OpenAI comparison doc |
| 7 | Integration Sprint | 5h | Full flow test: notification → deep link → clinical feature |

---

## Learning Outcomes

By end of Week 09, you'll understand:
- ✅ How to build HIPAA-compliant notification systems (healthcare critical)
- ✅ Camera permission flows across iOS/Android
- ✅ Deep linking architecture for clinical decision-support apps
- ✅ React Native performance optimization with Flipper
- ✅ App Store/Play Store submission process for healthcare apps
- ✅ Azure OpenAI vs OpenAI API for healthcare AI features

---

## Your Background Angle

**From QBP Biology:** You understand HIPAA data sensitivity. Use this knowledge to design notification systems that protect patient data while keeping the app responsive. Example: "My biology background means I understand why we never show patient names in notifications—it's like protecting patient privacy is a cellular membrane."

**From Auditing:** You'll appreciate the audit trails needed for app store submissions, user consent logging, and healthcare app compliance documentation.

---

## Week 09 Resources

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [HIPAA Guidelines for Mobile Apps (HHS)](https://www.hhs.gov/hipaa/for-professionals/faq/index.html)
- [React Native Performance Debugging](https://reactnative.dev/docs/profiling)
- [App Store Review Guidelines - Health Category](https://developer.apple.com/app-store/review/guidelines/#health-and-fitness)
- [Azure OpenAI Service Pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/)

---

## Success Criteria

- [ ] Push notifications working (local + remote) with HIPAA compliance
- [ ] Document scanner functional with file validation
- [ ] Deep links routing correctly from notification → clinical feature
- [ ] Performance metrics: bundle < 50MB, JS thread < 16ms per frame
- [ ] App Store/Play Store metadata 100% complete
- [ ] Azure AI fundamentals quiz score: 70%+

