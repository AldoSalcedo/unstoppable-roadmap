# Week 9 Live Notes — Advanced Mobile Features

*Escribe aquí las ideas, patrones, y preguntas que surgen mientras implementas notificaciones, camera, deep links, y offline. No tiene que estar pulido.*

---

## Day 1 — Push Notifications with Expo

**Concepto**: Push notifications llegan a usuarios incluso con app cerrada. Expo maneja los detalles.

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configurar handler para notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Registrar para push notifications
export async function registerForPushNotifications() {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Failed to get push notification permission');
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PROJECT_ID,
  });

  return token.data;
}

// Enviar notificación desde servidor
import { Expo } from 'expo-server-sdk';

const expo = new Expo();

export async function sendPushNotification(pushToken: string, title: string, body: string) {
  await expo.sendPushNotificationsAsync([
    {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data: { screen: 'Details', id: '123' },
    },
  ]);
}
```

**Patrón observado**: Push tokens = identidad única del dispositivo. Almacena en DB.

**Pregunta que surgió**: ¿Cómo manejo push al usuario que desinstaló app? Respuesta: Try/catch en servidor.

---

## Day 2 — Camera Integration

**Concepto**: Acceder a cámara del dispositivo para fotos y video.

```typescript
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';

// Simple: foto con picker
export function PhotoSelector() {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  return <TouchableOpacity onPress={pickImage}><Text>Pick Photo</Text></TouchableOpacity>;
}

// Advanced: cámara en vivo
export function LiveCamera() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<Camera.CameraType>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      uploadImage(photo.uri);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Camera ref={cameraRef} style={{ flex: 1 }} />
      <TouchableOpacity onPress={takePicture}>
        <Text>Capture</Text>
      </TouchableOpacity>
    </View>
  );
}
```

**Patrón**: ImagePicker para selector. Camera para captura en vivo.

---

## Day 3 — Deep Linking

**Concepto**: URLs que abren app en pantalla específica. Ej: myapp://users/123.

```typescript
import * as Linking from 'expo-linking';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';

// Configurar deep linking
const linking: LinkingOptions = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      Home: '',
      UserDetails: 'users/:id',
      Settings: 'settings',
    },
  },
};

// En Navigation
export function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="UserDetails"
          component={UserDetailsScreen}
          initialParams={{ id: '' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Abrir app con deep link
Linking.openURL('myapp://users/123');

// Desde notificación
Notifications.addNotificationResponseReceivedListener(response => {
  const { screen, id } = response.notification.request.content.data;
  navigate(screen, { id });
});
```

**Patrón**: Deep links conectan notificaciones a pantallas específicas.

---

## Day 4 — Offline-First Architecture

**Concepto**: App funciona sin conexión. Syncs cuando conecta.

```typescript
import NetInfo from '@react-native-community/netinfo';
import { useOnlineManager } from '@tanstack/react-query';

// TanStack Query awareness
useOnlineManager(() => {
  return NetInfo.fetch().then(state => state.isConnected ?? false);
});

// Local persistence con SQLite
import * as SQLite from 'expo-sqlite';

const db = await SQLite.openDatabaseAsync('myapp.db');

export async function syncDataWhenOnline() {
  const isOnline = await NetInfo.fetch().then(state => state.isConnected);

  if (!isOnline) {
    // Store localmente
    await db.execAsync(`
      INSERT INTO offline_queue (action, payload, created_at)
      VALUES (?, ?, ?)
    `, ['create_user', JSON.stringify(userData), new Date().toISOString()]);
    return;
  }

  // Enviar queue pendiente
  const queue = await db.execAsync(`
    SELECT * FROM offline_queue ORDER BY created_at
  `);

  for (const item of queue) {
    await sendToServer(item.action, item.payload);
    await db.execAsync(`DELETE FROM offline_queue WHERE id = ?`, [item.id]);
  }
}

// Conflict resolution: last-write-wins
const localVersion = await getLocalData(id);
const serverVersion = await getServerData(id);

const merged = localVersion.updatedAt > serverVersion.updatedAt
  ? localVersion
  : serverVersion;
```

**Patrón**: SQLite + TanStack Query = offline-first.

---

## Day 5 — Performance & Distribution

**Concepto**: App debe ser rápido y pequeño. Monitorea performance en producción.

```typescript
import * as Analytics from 'expo-analytics';
import { PerformanceObserver, performance } from 'perf_hooks';

// Medir time-to-interactive
const measureNavigation = () => {
  const startMark = 'nav-start';
  const endMark = 'nav-end';

  performance.mark(startMark);

  // Navigate...

  performance.mark(endMark);
  const measure = performance.measure('nav-time', startMark, endMark);

  Analytics.logEvent('navigation_time', {
    duration_ms: measure.duration,
    screen: 'Details',
  });
};

// Code splitting en Expo
const UserDetails = lazy(() => import('./UserDetails'));

// Reducir tamaño
// - Remove dev dependencies
// - Tree shake unused code
// - Optimize images (WebP, srcset)
```

**Patrón**: Monitorea key metrics. LCP, TTI, memory usage.

---

## Patrones descubiertos

**Pattern 1: Permission Gates**
Pedir permisos cuando necesites, no al inicio.

**Pattern 2: Background Tasks**
Expo Task Scheduler para tareas en background (sync, etc).

**Pattern 3: Network Resilience**
Retry con exponential backoff. Graceful degradation.

---

## Conexión con background

**De Auditoría**: Permisos = audit trail. Sé qué datos accedes.

**De QBP**: Ofline = disponibilidad. Usuarios en mercados con poca cobertura.

**De Ventas**: Engagement = push notifications = retention.

---

## Notas Adicionales

- Push notifications = alta engagement (si no abusas)
- Deep linking = critical for retention
- Offline-first = differentiator en mercados emergentes

---

**Última entrada**: 2026-05-28
**Próxima sesión**: 2026-05-29
