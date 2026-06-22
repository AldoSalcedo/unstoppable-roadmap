# App Store Submission Checklist — Healthcare Edition

## Pre-Submission (1 week before)

### App Metadata
- [ ] App name (60 chars max)
- [ ] Subtitle (30 chars max, iOS only)
- [ ] Description (4000 chars, cover key features)
- [ ] Keywords (relevant health/clinical terms)
- [ ] Support URL (active support page)
- [ ] Privacy Policy URL (addresses HIPAA, data handling, retention)

### Screenshots & Preview
- [ ] 2-5 screenshots per language (show actual app)
- [ ] Preview video (30 seconds, demonstrates key feature)
- [ ] App icon (1024x1024, healthcare professional/patient)
- [ ] Watch screenshots if watchOS version exists

### Content Rating
- [ ] Complete rating questionnaire (iOS)
- [ ] Content rating category selected
- [ ] Healthcare data handling disclosed

### Release Notes
- [ ] Version history documented
- [ ] Bug fixes listed
- [ ] New features described
- [ ] Performance improvements noted

---

## Healthcare Specific

### Medical Claims & Disclaimers
- [ ] **CRITICAL:** If app makes medical claims, add disclaimer:
  ```
  "This app is for informational purposes only. 
  It is not a substitute for professional medical advice, 
  diagnosis, or treatment."
  ```
- [ ] All medical claims supported by clinical evidence
- [ ] No promises of diagnosis or treatment
- [ ] No replacement for consulting healthcare provider

### HIPAA Compliance
- [ ] Privacy policy mentions HIPAA compliance
- [ ] Data handling explained (encryption, storage, transmission)
- [ ] User can delete data anytime
- [ ] No sharing with third parties without consent
- [ ] Audit trail available if required by HIPAA

### Data Handling
- [ ] Encryption at rest described (AES-256 or equivalent)
- [ ] Encryption in transit described (HTTPS/TLS)
- [ ] Retention policy stated (e.g., "data deleted after 90 days")
- [ ] Backup policy explained
- [ ] No medical data in crash logs/analytics

### User Consent
- [ ] Terms of Service provided
- [ ] Privacy Policy accepted before data collection
- [ ] Camera/location permissions explained
- [ ] Notification permissions justified

---

## Build & Testing

### App Build
- [ ] No debug code in production
- [ ] No test accounts or credentials embedded
- [ ] Version number incremented
- [ ] Build number incremented
- [ ] All dependencies updated
- [ ] No known crashes in testing

### Device Testing
- [ ] Tested on iOS 16+ (minimum supported)
- [ ] Tested on Android 8+ (minimum supported)
- [ ] Landscape orientation tested
- [ ] Dark mode tested
- [ ] Large text accessibility tested
- [ ] Voice control tested

### Functionality
- [ ] All buttons functional
- [ ] All forms validate correctly
- [ ] Deep links work
- [ ] Push notifications work
- [ ] Camera/media features functional
- [ ] Network errors handled gracefully

---

## App Store Connect (iOS)

### Before Submission
- [ ] Developer account active (Apple Developer Program)
- [ ] Bundle ID matches provisioning profile
- [ ] Signing certificate valid (not expired)
- [ ] Provisioning profile valid
- [ ] App SKU entered (unique identifier)
- [ ] Primary language selected

### Pricing & Availability
- [ ] Pricing tier selected ($0 for free, $0.99+ for paid)
- [ ] Availability countries selected (US +)
- [ ] Release date set
- [ ] App review information completed:
  ```
  - Demo account credentials (if needed)
  - Notes for reviewer
  - Sign-in required for full app access?
  - Healthcare app with special review needs?
  ```

### Rights & Addresses
- [ ] Contact information provided
- [ ] Support URL provided
- [ ] Privacy Policy URL provided
- [ ] App license agreement (if applicable)

---

## Google Play Console (Android)

### Before Submission
- [ ] Google Play Developer account active
- [ ] App fully completed in Play Console
- [ ] Bundle ID matches package name
- [ ] Signed keystore configured
- [ ] Content rating questionnaire completed

### Play Store Listing
- [ ] App title (50 chars max)
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Screenshots (2-8 images)
- [ ] Feature graphic (1024x500)
- [ ] Icon (512x512)
- [ ] Category selected (Health & Fitness for healthcare)

### Content Rating
- [ ] IARC rating questionnaire completed
- [ ] Healthcare data handling disclosed
- [ ] Appropriate rating assigned
- [ ] Sensitive health data flagged if applicable

### Data & Privacy
- [ ] Privacy policy uploaded
- [ ] Data collection disclosed
- [ ] Permission justification provided
- [ ] Healthcare data handling explained
- [ ] User can delete data easily

---

## Final Checks (Day of Submission)

### iOS (App Store)
- [ ] Build uploaded to App Store Connect
- [ ] TestFlight testing completed successfully
- [ ] No crashes or major issues
- [ ] Submit for review button clicked
- [ ] Confirm submission

### Android (Google Play)
- [ ] APK/AAB uploaded
- [ ] Play Console review completed
- [ ] No policy violations
- [ ] Submit for review
- [ ] Confirm submission

---

## Post-Submission Monitoring

### Week 1
- [ ] Check status daily in App Store Connect / Play Console
- [ ] Monitor for reviewer questions (respond within 24h)
- [ ] Prepare response to rejection (if any)

### After Approval
- [ ] App visible in search results
- [ ] User reviews monitored
- [ ] Crash reports reviewed
- [ ] Update submission notes with lessons learned

---

## Healthcare-Specific Red Flags

### Will cause rejection:
- Claiming to diagnose medical conditions
- Promising treatment or cure
- No privacy policy or inadequate policy
- Sharing PHI without explicit consent
- Storing medical data in plain text
- No mention of HIPAA compliance (if handling health data)

### Will delay review:
- Healthcare claims without evidence
- Unclear data handling practices
- Missing medical device disclaimer
- Inadequate testing evidence
- Complex permission requirements without justification

