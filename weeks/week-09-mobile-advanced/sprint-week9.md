# WEEK 09 SPRINT — Day-by-Day Breakdown

## DÍA 1: Push Notifications Lifecycle & HIPAA Compliance

### Morning (9am-1pm): Theory & Setup
- **Objective:** Understand push notification flow, HIPAA requirements, permission models
- **El problema:** Healthcare apps must send timely alerts (new lab results, appointment reminders) WITHOUT exposing patient data
- **Con Expo Notifications:** Unified API for iOS/Android, background handling, deep linking
- **Aplicación Healthcare:** Clinic sends "New lab result available" (no patient name, no values) → user taps → app opens to secure result view

#### Tasks
1. Review Expo Notifications documentation (permission models, local vs remote)
2. Study HIPAA Notification Rule: never include PHI in notification body
3. Set up Expo Notifications in your project:
   ```bash
   expo install expo-notifications
   ```
4. Research: How do enterprise healthcare apps handle urgent alerts? (Answer: encrypted tokens in notifications)

### Afternoon (2pm-6pm): Implementation
- **Create:** `src/notifications/push-handler.ts` (see file details below)
- **Test:** Local notifications first (simpler), then push service setup
- **Debug:** Use Expo Notifications testing tools to verify delivery

#### Exercises
1. Send a local notification with deep link. Tap it and verify routing works.
2. Design a notification payload structure that passes HIPAA audit: no PHI in body.
3. Implement notification permission request with healthcare context.

---

## DÍA 2: Camera & Document Scanner Implementation

### Morning (9am-1pm): Camera Permissions & Image Capture
- **Objective:** Implement camera module with proper permissions and image quality validation
- **El problema:** Medical documents (lab reports, prescriptions) must be scanned at high quality for OCR processing
- **Con React Native Camera:** Native performance for real-time preview, fast capture
- **Aplicación Healthcare:** Patient photographs lab report on iPhone → app compresses intelligently → sends to backend OCR service

#### Tasks
1. Review iOS/Android camera permission differences
   - iOS: Info.plist NSCameraUsageDescription
   - Android: AndroidManifest.xml camera permission + runtime request
2. Set up `expo-camera` module:
   ```bash
   expo install expo-camera expo-file-system
   ```
3. Design image quality thresholds: minimum 1200x800, max file size 2MB

### Afternoon (2pm-6pm): Document Scanner Feature
- **Create:** `src/camera/document-scanner.ts` (see file details below)
- **Implement:** File size validation, image quality checks, OCR readiness
- **Test:** Real document scanning on simulator + device

#### Exercises
1. Capture a document image and validate: sharpness, orientation, file size
2. Add EXIF data stripping (privacy requirement)
3. Implement retry logic: "Document too dark, please retry"

---

## DÍA 3: Deep Linking & Universal Navigation

### Morning (9am-1pm): Deep Linking Architecture
- **Objective:** Implement universal links for iOS and deep links for Android
- **El problema:** User receives notification about lab result → must route to correct screen with result ID
- **Con React Navigation:** Deep link integration, linking module
- **Aplicación Healthcare:** Push notification contains deep link: `myclinic://results/lab-id-12345` → app opens directly to result detail view

#### Tasks
1. Configure app.json deep link settings:
   ```json
   {
     "scheme": "myclinic",
     "android": {
       "intentFilters": [
         {
           "action": "android.intent.action.VIEW",
           "data": { "scheme": "myclinic" }
         }
       ]
     }
   }
   ```
2. Set up iOS universal links (HTTPS domain + apple-app-site-association)
3. Implement React Navigation linking configuration

### Afternoon (2pm-6pm): Testing & Integration
- **Test deep links:** notification → deep link → correct screen
- **Handle edge cases:** app not installed, deep link invalid, user not authenticated
- **Create fallback:** deep link with no match → home screen

#### Exercises
1. Send notification with deep link to lab result
2. Test deep link from external app (Notes, Messages)
3. Implement auth check: deep link to secured resource while logged out → redirect to login → retry deep link

---

## DÍA 4: React Native Performance Optimization

### Morning (9am-1pm): Performance Profiling
- **Objective:** Measure performance bottlenecks, understand JS thread vs Native thread
- **El problema:** Healthcare apps must be responsive (60 FPS) and use minimal memory (devices may have 2GB RAM)
- **Con React Native Performance Tools:** Chrome DevTools, Flipper, native profilers
- **Aplicación Healthcare:** EHR app loading patient list should be instant, scrolling smooth even with 1000+ records

#### Tasks
1. Install Flipper (React Native debugger) and set up performance profiling
2. Profile your app with Chrome DevTools:
   - JS thread utilization (target: <16ms per frame for 60 FPS)
   - Memory usage (identify leaks)
   - Bundle size breakdown
3. Identify slow operations:
   - Unnecessary re-renders
   - Unoptimized lists
   - Heavy synchronous operations on JS thread

### Afternoon (2pm-6pm): Optimization Implementation
- **Optimize lists:** FlatList with optimizations, remove unnecessary renders
- **Reduce bundle:** tree-shake unused code, lazy load screens
- **Memory profiling:** identify memory leaks in navigation

#### Exercises
1. Profile app with 100+ patient records → identify bottleneck
2. Implement useMemo/useCallback optimization → re-measure performance
3. Reduce bundle size by 10% (measure before/after)

---

## DÍA 5: App Store Submission Preparation

### Morning (9am-1pm): Store Console Setup
- **Objective:** Create App Store Connect and Play Store accounts, prepare metadata
- **El problema:** Healthcare app submissions have stricter requirements (privacy, medical claims)
- **Con Apple App Store + Google Play:** Different review processes, different requirements
- **Aplicación Healthcare:** Clinical decision support app must declare medical device status, privacy policy

#### Tasks
1. Set up App Store Connect:
   - Create bundle ID (reverse domain: com.yourcompany.clinic)
   - Create app record
   - Prepare signing certificates + provisioning profiles
2. Set up Google Play Console:
   - Create app entry
   - Configure content rating questionnaire
   - Set up Play app signing

### Afternoon (2pm-6pm): Assets & Metadata
- **Create:** Screenshots (6-8 per language, showing key features)
- **Write:** App description, privacy policy, healthcare disclaimers
- **Prepare:** Version release notes, support URLs

#### Exercises
1. Write 3-4 screenshots with captions showing notification → deep link → result viewing
2. Draft privacy policy highlighting: no data storage, encrypted transmission, HIPAA compliance
3. Create healthcare disclaimer: "This app is for informational purposes. Always consult your healthcare provider."

---

## DÍA 6: Azure AI Fundamentals Study

### Morning (9am-1pm): Azure OpenAI Service Deep Dive
- **Objective:** Understand Azure OpenAI vs OpenAI API for healthcare AI features
- **Azure specialization:** Enterprise security, data privacy (European data centers available)
- **OpenAI API:** General availability, lowest latency, highest rate limits

#### Key Comparisons
| Aspect | Azure OpenAI | OpenAI API |
|--------|--------------|-----------|
| Data residency | EU/US regions | US-based |
| Audit trail | Full logging | Limited |
| Cost | Per-token (higher) | Per-token (lower) |
| Models | Latest + custom | Latest |
| Healthcare compliance | HIPAA-eligible | Consumer-grade |

#### Tasks
1. Read: Azure OpenAI Service documentation
2. Understand: How Azure OpenAI encrypts data in-transit and at-rest
3. Research: HIPAA compliance certification for Azure (BAA available)
4. Study: Token usage calculation and cost estimation

### Afternoon (2pm-6pm): Responsible AI for Healthcare
- **Learn:** Azure Responsible AI principles
- **Apply:** How to use AI in clinical decision support without liability
- **Healthcare use case:** AI flags potential drug interactions → always shows source evidence → clinician makes final decision

#### Exercises
1. Calculate Azure OpenAI cost for clinical decision support: 1000 users × 50 requests/day × 500 tokens = ?
2. Design responsible AI workflow: input → AI analysis → human review → clinical action
3. Compare privacy models: Azure OpenAI + VNet vs OpenAI API + encryption

---

## DÍA 7: Integration Sprint & Azure Quiz

### Morning (9am-1pm): Full Feature Integration
- **Objective:** Connect all Week 09 features into one cohesive flow
- **Flow:** User receives push notification → taps → deep links to app → document scanner opens → captures prescription → submits → AI analyzes

#### Integration Checklist
1. Notification with deep link to document scanner screen
2. Document scanner with camera + file validation
3. File upload with Azure AI integration (if testing API)
4. Results display with deep link from notification

### Afternoon (2pm-6pm): Azure AI Fundamentals Quiz
- **Duration:** 90 minutes
- **Target score:** 70%+
- **Topics:** Azure services, responsible AI, HIPAA compliance, cost optimization
- **Success:** Pass quiz, review missed questions, plan Week 10 deep dive

#### End-of-Week Deliverables
- [ ] Push notification system (local + remote, HIPAA-compliant)
- [ ] Document scanner with camera integration
- [ ] Deep linking implementation
- [ ] Performance audit report
- [ ] App Store + Play Store metadata ready
- [ ] Azure AI quiz: 70%+ score

