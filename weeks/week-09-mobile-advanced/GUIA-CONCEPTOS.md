# SEMANA 09 — Guía de Conceptos

## Push Notification Lifecycle

### Componentes del Sistema
```
Backend (EHR) 
    → Sends APNs/FCM payload
       → Device APNs/FCM server
          → iOS/Android OS
             → Expo Notifications
                → App (foreground/background)
                   → UI or Handler
                      → Deep Link Router
```

### Tipos de Notificaciones
1. **Local**: Generated on device (testing, offline reminders)
2. **Remote**: From backend via APNs (Apple) / FCM (Google)
3. **Silent**: Background updates, no user notification

### HIPAA Compliance in Notifications
- **Never include PHI in notification body**
- Use encrypted tokens in deep links
- Log all notification events
- Respect user permission choices
- Encrypt data in transit (APNs/FCM)

---

## Camera & Media Management

### Permission Flow (iOS vs Android)
| Aspect | iOS | Android |
|--------|-----|---------|
| Permission Type | Info.plist NSCameraUsageDescription | AndroidManifest + runtime |
| Request Timing | First access + one-time | Explicit runtime request |
| User Revocation | App Settings > Camera | App Settings > Permissions |

### Image Quality Metrics
- **Resolution**: 1200x800 minimum for OCR
- **Brightness**: 0.3-0.95 (normalized scale)
- **Contrast**: 0.2+ minimum for text recognition
- **File Size**: <2MB for efficient transmission

### EXIF Data Concerns
- Location: GPS coordinates of where photo was taken
- Device: Camera model, serial number
- Timing: Exact timestamp of capture
- **HIPAA Impact**: Location + timestamp could identify hospital

---

## Deep Linking Patterns

### Universal Links (iOS) vs Deep Links (Android)
```json
iOS:
{
  "applinks": {
    "details": [
      {
        "appID": "TEAM_ID.com.yourapp",
        "paths": ["/results/*", "/appointments/*"]
      }
    ]
  }
}

Android:
{
  "scheme": "https://yourapp.com",
  "android": {
    "intentFilters": [
      {
        "action": "android.intent.action.VIEW",
        "data": { "scheme": "https" }
      }
    ]
  }
}
```

### Authentication in Deep Links
- User clicks notification with deep link
- App receives link while logged out
- Redirect to login screen
- Store pending deep link
- After login, retry original deep link
- Navigate to secure resource

---

## React Native Performance

### JS Thread vs Native Thread
- **JS Thread**: JavaScript execution (React, business logic)
- **Native Thread**: Rendering, animations, native calls
- **Problem**: Blocking JS thread blocks UI updates
- **Solution**: Move heavy work to Native Modules or Workers

### Performance Targets
- **Frame Rate**: 60 FPS (16.67ms per frame)
- **Memory**: <200MB for healthcare app
- **Bundle Size**: <50MB
- **Startup Time**: <2 seconds

### Optimization Techniques
1. FlatList with `removeClippedSubviews`
2. `useMemo` / `useCallback` for expensive calculations
3. Lazy loading screens
4. Image optimization
5. Code splitting

---

## App Store Submission

### Healthcare-Specific Requirements
- Medical Claims: Must be backed by clinical evidence
- Privacy Policy: Must address HIPAA if handling health data
- Medical Device: Declare if app is medical device
- Safety Warnings: "Not a substitute for professional diagnosis"

### Review Process Timeline
- **iOS**: 1-3 days typically
- **Android**: 24 hours typically
- Common rejection reasons for healthcare:
  - Unsubstantiated medical claims
  - Missing privacy policy
  - Unclear data handling practices

---

## Azure OpenAI vs OpenAI API

### Comparison Table
| Criterion | Azure OpenAI | OpenAI API |
|-----------|--------------|-----------|
| **Data Residency** | EU/US/Asia | US-based |
| **Data Encryption** | AES-256 at rest | Encrypted in transit |
| **HIPAA Eligible** | Yes (with BAA) | No |
| **Audit Logging** | Full Azure Monitor | API request logs |
| **Pricing** | Per-token + compute | Per-token only |
| **Rate Limits** | Configurable | Tiered by account |
| **Healthcare Use** | Enterprise hospitals | Consumer apps |

### Healthcare Decision Framework
```
If enterprise HIPAA compliance needed → Azure OpenAI
If rapid prototyping + cost-sensitive → OpenAI API
If hybrid? → Use both (Azure for sensitive, OpenAI for non-PHI)
```

---

## Responsible AI in Healthcare

### Azure Responsible AI Principles
1. **Fairness**: AI doesn't discriminate against patient groups
2. **Reliability & Safety**: AI output is accurate, safe for clinical use
3. **Privacy & Security**: Patient data protected
4. **Inclusiveness**: Works for all patient populations
5. **Transparency**: Clinician understands AI reasoning

### Clinical Decision Support Workflow
```
Patient Data 
   → AI Analysis 
      → Confidence Score 
         → [> 0.8] Show result + source evidence
         → [< 0.8] Show as "research only, consult clinician"
            → Clinician Reviews 
               → Clinician Decides 
                  → Clinical Action
```

---

## HIPAA Audit Trail Requirements

### Events to Log
- Notification sent (timestamp, user ID, channel)
- Permission granted/denied
- Document scanned (file size, quality metrics)
- File encrypted/stored (location, encryption key version)
- Deep link followed (timestamp, destination)
- Data accessed (user, timestamp, purpose)

### Log Entry Format
```json
{
  "timestamp": "2026-04-02T14:23:45.123Z",
  "event_type": "notification_sent",
  "user_id": "[encrypted_id]",
  "details": {
    "notification_id": "...",
    "channel": "urgent_alerts",
    "phi_present": false
  },
  "outcome": "success"
}
```

