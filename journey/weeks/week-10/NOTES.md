# Week 10 Live Notes — Mobile Production Deployment

*Escribe aquí las ideas, patrones, y preguntas que surgen mientras preparas app para App Store y Google Play. No tiene que estar pulido.*

---

## Day 1 — iOS App Store Preparation

**Concepto**: Proceso de submission a Apple App Store. Requiere certificados, entitlements, revisión manual.

```typescript
// app.json (iOS configuration)
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "deploymentTarget": "13.0"
          }
        }
      ]
    ],
    "ios": {
      "bundleIdentifier": "com.example.myapp",
      "buildNumber": "1",
      "supportsTabletMode": true,
      "infoPlist": {
        "NSCameraUsageDescription": "We need access to your camera for photos",
        "NSPhotoLibraryUsageDescription": "We need access to your photos",
        "NSLocationWhenInUseUsageDescription": "We need your location"
      }
    }
  }
}

// Certificados
// 1. Crear certificate signing request (CSR)
// 2. Upload a Apple Developer account
// 3. Download certificate (.cer)
// 4. Create provisioning profile
```

**Patrón observado**: iOS = strict review process. Documentación clara importante.

**Pregunta que surgió**: ¿Cuánto tiempo toma review? Respuesta: 24 horas típico, a veces 48.

---

## Day 2 — Google Play Store Preparation

**Concepto**: Android Play Store es más permisivo que App Store. Pero requiere APK/AAB.

```bash
# Generar APK con Expo
eas build --platform android --local

# O usando Android Studio
./gradlew bundleRelease

# app.json (Android configuration)
{
  "expo": {
    "android": {
      "package": "com.example.myapp",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "ACCESS_FINE_LOCATION",
        "READ_EXTERNAL_STORAGE"
      ]
    }
  }
}

# Sign APK with keystore
keytool -genkey -v -keystore release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias upload-key
```

**Patrón**: Android = APK (immediato) o AAB (bundled, recomendado).

---

## Day 3 — CI/CD for Mobile (EAS Build)

**Concepto**: Expo Application Services (EAS) automatiza compilación en la nube.

```yaml
# eas.json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      },
      "ios": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccount": "@env APP_GOOGLE_SERVICE_ACCOUNT"
      },
      "ios": {
        "appleId": "@env APPLE_ID"
      }
    }
  }
}

# Build desde CI
eas build --platform all --auto-submit
```

**Patrón**: EAS Build + auto-submit = uno-click submission.

---

## Day 4 — Performance Testing & Optimization

**Concepto**: Testing en producción. Monitorea real user performance.

```typescript
import * as Sentry from "sentry-expo";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enableInExpoDevelopment: true,
  tracesSampleRate: 1.0,
});

// Performance monitoring
import { Integrations } from "@sentry/react-native";

// Capture slow transactions
Sentry.captureMessage('Startup took 5s', 'warning');

// Memory monitoring
import { Platform } from 'react-native';
import { DeviceMemory } from 'react-native-device-info';

export function logMemory() {
  if (Platform.OS === 'ios') {
    // iOS memory usage
  } else {
    // Android memory usage
  }
}

// Battery monitoring
import { getBatteryLevel } from 'react-native-device-info';

const batteryLevel = await getBatteryLevel();
if (batteryLevel < 0.1) {
  enableBatteryOptimization();
}
```

**Patrón**: Sentry para error tracking. DeviceInfo para system metrics.

---

## Day 5 — Launch & Monitoring

**Concepto**: App en producción. Ahora monitorealo, responde a issues, itera.

```typescript
// Crashlytics + Firebase
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Track events
logEvent(analytics, 'app_launch', { version: '1.0.0' });
logEvent(analytics, 'feature_used', { feature: 'photo_upload' });

// Herramientas de monitoreo
// - Firebase Crashlytics: crashes, ANRs
// - Firebase Performance: slow screens, network latency
// - Google Analytics: user behavior, funnels
// - Apple Analytics: App Store analytics

// Actualizar app over-the-air (EAS Updates)
import * as Updates from 'expo-updates';

export async function checkForUpdates() {
  try {
    const update = await Updates.checkAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (error) {
    console.error('Failed to fetch update', error);
  }
}
```

**Patrón**: Monitoring + OTA updates = rápida iteration sin App Store submission.

---

## Patrones descubiertos

**Pattern 1: Staged Rollout**
Release a 1% de usuarios primero. Monitor. Luego 5%, 10%, etc.

**Pattern 2: Feature Flags**
Controla características desde el servidor. Rollback sin new build.

**Pattern 3: Beta Testing**
TestFlight (iOS), Google Play Testing (Android) antes de launch.

---

## Conexión con background

**De Auditoría**: App en producción = compliance. GDPR, privacy, data protection.

**De QBP**: Launch costs. Infrastructure, marketing, support.

**De Ventas**: Launch day = marketing event. Users = vanity metric at first.

---

## Notas Adicionales

- iOS review = strict, pero rápido
- Android release = inmediato, pero loose moderation
- EAS Build = fastest path to App Store
- OTA updates = iterate without app store

---

**Última entrada**: 2026-06-04
**Próxima sesión**: 2026-06-05
