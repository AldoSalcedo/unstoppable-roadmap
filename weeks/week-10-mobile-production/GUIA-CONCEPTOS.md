# Conceptos Week 10

## App Store Review Process

### Timeline
- iOS: 1-3 days average
- Android: 24 hours average

### Common Rejection Reasons (Healthcare)
1. Unsubstantiated medical claims
2. Missing or incomplete privacy policy
3. Unclear data handling
4. No mention of HIPAA compliance
5. Medical device claims without proper disclaimer

### Submission Checklist
- [ ] App name and description accurate
- [ ] Privacy policy addresses data handling
- [ ] Healthcare disclaimer if applicable
- [ ] Screenshots show actual app features
- [ ] Version history documented
- [ ] Contact support information provided

---

## Code Signing & Certificates

### iOS Code Signing
- **Signing Certificate:** Proves app origin (created in Apple Developer account)
- **Provisioning Profile:** Links certificate + app ID + devices
- **Entitlements:** Special permissions (Push Notifications, HealthKit)
- **Renewal:** Certificates expire yearly, must renew

### Android Code Signing
- **Keystore:** Private key for signing apps
- **App Signing:** Google Play handles signing after upload (for security)
- **Release Key:** Keep safe, never share
- **Key Alias:** Identifies which key in keystore

---

## Expo Application Services (EAS) Build

### Build Profiles
```json
{
  "build": {
    "development": {
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "distribution": "store",
      "ios": { "simulator": false }
    }
  }
}
```

### Build Caching & Optimization
- Dependencies cached between builds
- Parallel compilation enabled
- Incremental builds when possible
- Estimated build time: 10-15 minutes

---

## E2E Testing with Detox

### Test Structure
```javascript
describe('User Journey', () => {
  beforeAll(async () => { await device.launchApp(); });
  
  it('should navigate through notification', async () => {
    // Arrange
    // Act: Simulate user action
    // Assert: Verify outcome
  });
});
```

### Healthcare-Specific Tests
1. Notification permission request flow
2. Deep link navigation from notification
3. Document scanner workflow
4. Form validation and submission
5. Error handling and retry logic

---

## OTA Updates Strategy

### Version Management
- Major.Minor.Patch (1.2.3)
- OTA updates for bug fixes and minor features
- Major releases require App Store submission

### Rollback Procedure
1. If new OTA breaks app
2. Disable update via EAS Updates dashboard
3. Users fall back to previous version
4. Deploy fixed version
5. Resume rollout

---

## Azure AI-102 Exam Domains

### Domain 1: Azure OpenAI Service (20%)
- Service setup and management
- Deploying models
- Monitoring and logging

### Domain 2: Azure AI Content Safety (15%)
- Content moderation
- Hate speech and bias detection
- Healthcare content compliance

### Domain 3: Responsible AI (15%)
- Fairness and bias
- Transparency and interpretability
- Privacy and security

### Domain 4: Custom Models (20%)
- Fine-tuning
- Custom training
- Evaluation metrics

### Domain 5: Integration Patterns (30%)
- API integration
- Authentication and security
- Healthcare-specific patterns

