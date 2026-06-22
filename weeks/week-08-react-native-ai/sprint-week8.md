// ============================================================
// SEMANA 08: React Native + AI Integration Sprint
// Clinical Mobile App Development
// ============================================================

# Sprint Week 8: React Native + AI para Aplicaciones Clínicas

## Resumen Ejecutivo

Construiremos una aplicación móvil completa que integre React Native, APIs de IA (OpenAI/Claude), y arquitectura offline-first diseñada específicamente para hospitales. La aplicación será un **Clinical Lab Result Analyzer**—una herramienta para médicos que analiza resultados de laboratorio con IA, funciona sin WiFi, y se puede desplegar a producción.

**Flujo clínico:** Doctor → App → Carga resultados → IA analiza → Genera notas clínicas → Guarda offline → Sincroniza cuando WiFi disponible

---

// TAREA 1: DÍA 1 - React Native Fundamentals & Expo Setup
## DÍA 1: React Native Fundamentals & Expo Setup

### Objetivos de Aprendizaje
- Entender la arquitectura bridge de React Native
- Configurar Expo managed workflow
- Compilar y ejecutar app en simulador
- Dominar componentes core: View, Text, TouchableOpacity, StyleSheet
- Crear primera pantalla con layout responsive

### Healthcare Angle
Hospitals need fast, reliable apps. Expo managed workflow eliminates native compilation headaches—get to feature development in minutes, not days.

### Conceptos Clave

```
┌──────────────────────────────────────┐
│  React Native Architecture: Bridge    │
├──────────────────────────────────────┤
│  JavaScript Layer                    │
│  ↓ (JSON Serialization)              │
│  Native Bridge (Serialization)       │
│  ↓ (Native Calls)                    │
│  iOS/Android Native APIs             │
│                                      │
│  → Unlike React Web: No DOM!         │
│  → Direct native component access    │
│  → Better performance, better UX     │
└──────────────────────────────────────┘
```

### Tareas del Día

#### EJERCICIO 1.1: Expo Project Setup

```bash
# Create new Expo project
npx create-expo-app ClinicalLabApp

cd ClinicalLabApp

# Install core dependencies
npm install expo-router expo-constants expo-splash-screen expo-fonts
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install axios react-query

# iOS simulator
npx expo run:ios

# OR Android emulator
npx expo run:android
```

#### EJERCICIO 1.2: Core Components & StyleSheet

Create `src/screens/HomeScreen.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
  },
  header: {
    backgroundColor: '#0066cc',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Lab Results Analyzer</Text>
        <Text style={{ color: '#e0e0e0', marginTop: 4 }}>
          AI-powered clinical insights for doctors
        </Text>
      </View>

      <View style={styles.cardContainer}>
        {/* Card 1: Recent Results */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Patient Results</Text>
          <Text style={styles.cardDescription}>
            View and analyze recent lab results for your patients with AI-powered insights.
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>View Results</Text>
          </TouchableOpacity>
        </View>

        {/* Card 2: Offline Access */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Offline Access</Text>
          <Text style={styles.cardDescription}>
            All results cached locally. Works without WiFi in hospital dead zones.
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Browse Cached</Text>
          </TouchableOpacity>
        </View>

        {/* Card 3: AI Assistant */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Clinical AI Assistant</Text>
          <Text style={styles.cardDescription}>
            Real-time AI analysis of lab results. Generates clinical notes instantly.
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Launch Assistant</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
```

**Key Concepts:**
- `StyleSheet.create()`: Pre-computed styles, better performance
- `flex: 1`: Fill available space (no fixed heights in mobile)
- `paddingHorizontal/Vertical`: Responsive padding
- `elevation` (Android) + `shadowColor` (iOS): Cross-platform shadows
- `ScrollView`: Scrollable content (like div overflow)

#### EJERCICIO 1.3: Responsive Layout - Safe Area

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Create responsive spacing
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Responsive font sizes
const fontSizes = {
  xs: width > 400 ? 12 : 10,
  sm: width > 400 ? 14 : 12,
  base: width > 400 ? 16 : 14,
  lg: width > 400 ? 20 : 18,
  xl: width > 400 ? 24 : 20,
};

// Use in components
const responsiveStyles = StyleSheet.create({
  container: {
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  heading: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
  },
});
```

### Props & Components Fundamentals

```typescript
// EJERCICIO 1.4: Reusable Button Component

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

export function ClinicalButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) {
  const variantStyles = {
    primary: { backgroundColor: '#0066cc' },
    secondary: { backgroundColor: '#e0e0e0' },
    danger: { backgroundColor: '#cc0000' },
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyles[variant],
        disabled && { opacity: 0.5 },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Text style={[styles.buttonText, variant === 'secondary' && { color: '#333' }]}>
        {loading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );
}
```

### Daily Checkpoint

- [ ] Expo project created and running in simulator
- [ ] HomeScreen displays with correct styling
- [ ] Responsive spacing working across screen sizes
- [ ] SafeAreaView handling notch/status bar properly
- [ ] Button component is reusable with variants

### Recursos del Día
- React Native docs: https://reactnative.dev/docs/getting-started
- Expo guide: https://docs.expo.dev/
- StyleSheet best practices: https://reactnative.dev/docs/stylesheet

---

// TAREA 2: DÍA 2 - Navigation with Expo Router
## DÍA 2: Expo Router & Tab Navigation

### Objetivos de Aprendizaje
- Expo Router: File-based routing (like Next.js for React Native)
- Tab navigation architecture
- Stack navigation (modal patterns)
- Deep linking
- Dynamic routes with parameters

### Healthcare Angle
Clinical apps need intuitive navigation. Doctors move between screens quickly—stack and tab navigation keeps workflow smooth. Deep links enable direct access to specific patient results from notifications.

### Conceptos Clave

```
┌──────────────────────────────────────┐
│  Expo Router: File-based Navigation   │
├──────────────────────────────────────┤
│  app/                                │
│  ├── _layout.tsx (Root Stack)        │
│  ├── (tabs)/                         │
│  │   ├── _layout.tsx (Tab Nav)       │
│  │   ├── home.tsx                    │
│  │   ├── results.tsx                 │
│  │   └── profile.tsx                 │
│  ├── patient/[id].tsx (Dynamic)      │
│  └── login.tsx (Outside tabs)        │
│                                      │
│  → Like Next.js routing but mobile   │
│  → Automatic deep linking            │
│  → Type-safe route parameters        │
└──────────────────────────────────────┘
```

### Setup & Configuration

```typescript
// EJERCICIO 2.1: Root Layout with Stack

// app/_layout.tsx
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check auth state, load fonts, etc
    const initializeApp = async () => {
      // Simulate auth check
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoggedIn(true);
      setIsReady(true);
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <Stack>
      {!isLoggedIn ? (
        <Stack.Screen
          name="login"
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
      )}
    </Stack>
  );
}
```

### Tab Navigation Setup

```typescript
// EJERCICIO 2.2: Tab-based Navigation

// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0066cc',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#0066cc',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#f9f9f9',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerTitle: 'Lab Results',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={24} color={color} />
          ),
        }}
      />

      {/* Results Tab */}
      <Tabs.Screen
        name="results"
        options={{
          title: 'Results',
          headerTitle: 'Patient Results',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="flask" size={24} color={color} />
          ),
        }}
      />

      {/* AI Assistant Tab */}
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'AI Assistant',
          headerTitle: 'Clinical Assistant',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="robot-happy" size={24} color={color} />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'Doctor Profile',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Dynamic Routes & Parameters

```typescript
// EJERCICIO 2.3: Patient Details Screen with Dynamic Routing

// app/(tabs)/results/[patientId].tsx
import { useRoute } from '@react-navigation/native';
import { useSearchParams } from 'expo-router';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  patientInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
});

export default function PatientDetailsScreen() {
  // Get route params (works both with React Navigation and Expo Router)
  const { patientId } = useSearchParams<{ patientId: string }>();

  // Mock patient data
  const patient = {
    id: patientId,
    name: 'Juan García',
    age: 58,
    mrn: 'MR-2024-001',
    results: [
      {
        id: '1',
        test: 'Blood Glucose',
        value: '145 mg/dL',
        reference: '70-100 mg/dL',
        status: 'High',
      },
      {
        id: '2',
        test: 'Hemoglobin A1c',
        value: '7.8%',
        reference: '<5.7%',
        status: 'High',
      },
      {
        id: '3',
        test: 'Creatinine',
        value: '1.1 mg/dL',
        reference: '0.7-1.3 mg/dL',
        status: 'Normal',
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      {/* Patient Header */}
      <View style={styles.patientInfo}>
        <View>
          <Text style={styles.label}>Patient Name</Text>
          <Text style={styles.value}>{patient.name}</Text>
        </View>
        <View>
          <Text style={styles.label}>Medical Record #</Text>
          <Text style={styles.value}>{patient.mrn}</Text>
        </View>
        <View>
          <Text style={styles.label}>Age</Text>
          <Text style={styles.value}>{patient.age} años</Text>
        </View>
      </View>

      {/* Lab Results */}
      {patient.results.map((result) => (
        <View key={result.id} style={styles.resultCard}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            {result.test}
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
            Value: <Text style={{ fontWeight: 'bold' }}>{result.value}</Text>
          </Text>
          <Text style={{ fontSize: 12, color: '#999' }}>
            Reference: {result.reference}
          </Text>
          <Text
            style={{
              marginTop: 8,
              color: result.status === 'High' ? '#cc0000' : '#00aa00',
              fontWeight: '600',
            }}
          >
            {result.status}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

// Can navigate to this screen with:
// router.push(`/results/${patientId}`)
```

### Modal Navigation Pattern

```typescript
// EJERCICIO 2.4: Modal for AI Analysis

// app/analysis-modal.tsx
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 28,
    color: '#999',
  },
});

export default function AnalysisModalScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Analysis Results</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.closeButton}>×</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 14, lineHeight: 22, color: '#666' }}>
          Patient Juan García shows elevated glucose and A1c levels, suggesting poorly controlled diabetes.
          Recommend increasing medication review and lifestyle intervention consultation.
        </Text>
      </View>
    </View>
  );
}
```

### Daily Checkpoint

- [ ] Tab navigation structure working with 4 tabs
- [ ] Dynamic route for patient details functional
- [ ] Parameters passing correctly between screens
- [ ] Modal navigation working
- [ ] Deep linking configured (optional but nice)
- [ ] Header styling consistent across app

### Recursos del Día
- Expo Router docs: https://docs.expo.dev/routing/introduction/
- React Navigation: https://reactnavigation.org/
- Material Community Icons: https://icons.expo.fyi/

---

// TAREA 3: DÍA 3 - State Management & Offline-First with TanStack Query
## DÍA 3: TanStack Query + Offline-First Architecture

### Objetivos de Aprendizaje
- TanStack Query for data fetching and caching
- Offline-first architecture for hospitals with poor WiFi
- AsyncStorage for local data persistence
- Query invalidation and synchronization
- Mutation patterns (POST/PUT/DELETE)
- Error handling and retry strategies

### Healthcare Angle
Hospitals have WiFi dead zones. A doctor might have loaded patient data in one area, walk to another with no signal, and still need to access that data and even make notes. Offline-first means the app is usable everywhere, syncing when WiFi returns.

### Conceptos Clave

```
┌──────────────────────────────────────────────────┐
│  Offline-First Architecture Pattern               │
├──────────────────────────────────────────────────┤
│  1. User Action (Read)                           │
│     → Check local cache first (AsyncStorage)    │
│     → Return immediately if available           │
│     → Fetch from API in background              │
│                                                 │
│  2. User Action (Write - Create Lab Note)       │
│     → Save to local queue                       │
│     → Optimistic UI update                      │
│     → When WiFi returns, sync to server        │
│     → On error, keep in queue for retry        │
│                                                 │
│  3. Sync Strategy                                │
│     → Periodic sync when WiFi detected          │
│     → Conflict resolution (server wins)         │
│     → Failure queue for manual retry            │
│                                                 │
│  Benefits:                                      │
│  - App works offline immediately                │
│  - Better perceived performance                 │
│  - Reduced data usage                           │
│  - Automatic conflict resolution                │
└──────────────────────────────────────────────────┘
```

### TanStack Query Setup

```typescript
// EJERCICIO 3.1: QueryClient Configuration

// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long until data is considered "stale" and needs refresh
      staleTime: 1000 * 60 * 5, // 5 minutes

      // GC time: how long to keep unused data in memory
      gcTime: 1000 * 60 * 30, // 30 minutes

      // Retry strategy: exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),

      // Network mode: continue offline, sync when online
      networkMode: 'always',
    },
    mutations: {
      retry: 2,
      networkMode: 'always',
    },
  },
});

// Persist queries to device storage
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
});

export { asyncStoragePersister };
```

### API Client with Axios

```typescript
// EJERCICIO 3.2: Axios Instance for API Calls

// src/lib/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://api.clinical-app.example.com';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, trigger logout
      AsyncStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Fetching Data with Queries

```typescript
// EJERCICIO 3.3: React Query Hooks for Patient Data

// src/hooks/usePatients.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '../lib/api';

interface Patient {
  id: string;
  name: string;
  mrn: string;
  age: number;
  lastLabDate: string;
}

// Fetch single patient
export function usePatient(patientId: string) {
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const response = await apiClient.get<Patient>(
        `/patients/${patientId}`
      );
      return response.data;
    },
    // Keep this data fresh for 10 minutes
    staleTime: 1000 * 60 * 10,
  });
}

// Fetch list of patients (paginated)
export function usePatientsList(page: number = 1) {
  return useQuery({
    queryKey: ['patients', page],
    queryFn: async () => {
      const response = await apiClient.get<Patient[]>(
        '/patients',
        { params: { page, limit: 20 } }
      );
      return response.data;
    },
  });
}

// Infinite scroll: Load more patients
export function usePatientsInfinite() {
  return useInfiniteQuery({
    queryKey: ['patients-infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get<Patient[]>('/patients', {
        params: { page: pageParam, limit: 20 },
      });
      return response.data;
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 20 ? pages.length + 1 : undefined,
  });
}

// Fetch lab results for patient
interface LabResult {
  id: string;
  patientId: string;
  test: string;
  value: string;
  reference: string;
  date: string;
  status: 'normal' | 'high' | 'low';
}

export function usePatientLabResults(patientId: string) {
  return useQuery({
    queryKey: ['lab-results', patientId],
    queryFn: async () => {
      const response = await apiClient.get<LabResult[]>(
        `/patients/${patientId}/lab-results`
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
```

### Mutations: Creating/Updating Data

```typescript
// EJERCICIO 3.4: Mutations for Creating Clinical Notes

// src/hooks/useClinicalNotes.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api';

interface ClinicalNote {
  id: string;
  patientId: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export function useCreateClinicalNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      patientId: string;
      content: string;
    }) => {
      const response = await apiClient.post<ClinicalNote>(
        '/clinical-notes',
        data
      );
      return response.data;
    },

    // Optimistic update: Update UI before API responds
    onMutate: async (newNote) => {
      // Cancel any in-progress refetches
      await queryClient.cancelQueries({
        queryKey: ['clinical-notes'],
      });

      // Snapshot previous data
      const previousNotes = queryClient.getQueryData([
        'clinical-notes',
        newNote.patientId,
      ]);

      // Optimistically update UI
      queryClient.setQueryData(
        ['clinical-notes', newNote.patientId],
        (old: ClinicalNote[] | undefined) => {
          const optimisticNote: ClinicalNote = {
            id: 'temp-' + Date.now(),
            patientId: newNote.patientId,
            content: newNote.content,
            createdAt: new Date().toISOString(),
            createdBy: 'current-user',
          };
          return [...(old || []), optimisticNote];
        }
      );

      return { previousNotes };
    },

    // On error, roll back
    onError: (error, newNote, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(
          ['clinical-notes', newNote.patientId],
          context.previousNotes
        );
      }
      console.error('Failed to create note:', error);
    },

    // On success, invalidate related queries
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['clinical-notes', data.patientId],
      });
    },
  });
}
```

### Implementing in Screen

```typescript
// EJERCICIO 3.5: Using Hooks in Results Screen

// app/(tabs)/results.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { usePatientLabResults } from '../hooks/usePatients';
import { useCreateClinicalNote } from '../hooks/useClinicalNotes';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultItem: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
  normalBorder: {
    borderLeftColor: '#00aa00',
  },
  highBorder: {
    borderLeftColor: '#cc0000',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  noteInput: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  noteButton: {
    backgroundColor: '#0066cc',
    margin: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  noteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default function ResultsScreen() {
  const patientId = 'patient-123'; // In real app, from route params
  const [noteContent, setNoteContent] = useState('');

  // Fetch lab results
  const {
    data: labResults,
    isLoading,
    error,
    isRefetching,
  } = usePatientLabResults(patientId);

  // Create note mutation
  const { mutate: createNote, isPending: isCreatingNote } =
    useCreateClinicalNote();

  const handleCreateNote = () => {
    if (!noteContent.trim()) return;

    createNote(
      { patientId, content: noteContent },
      {
        onSuccess: () => {
          setNoteContent(''); // Clear input
        },
      }
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={{ marginTop: 12 }}>Loading lab results...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#cc0000' }}>Error loading results</Text>
        <Text style={{ color: '#999', marginTop: 8 }}>
          {error instanceof Error ? error.message : 'Unknown error'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={labResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.resultItem,
              item.status === 'high'
                ? styles.highBorder
                : styles.normalBorder,
            ]}
          >
            <Text style={styles.resultName}>{item.test}</Text>
            <Text style={styles.resultValue}>
              Value: {item.value}
            </Text>
            <Text style={styles.resultValue}>
              Reference: {item.reference}
            </Text>
            <Text
              style={{
                marginTop: 8,
                color:
                  item.status === 'high'
                    ? '#cc0000'
                    : '#00aa00',
                fontWeight: '600',
              }}
            >
              {item.status.toUpperCase()}
            </Text>
          </View>
        )}
        ListHeaderComponent={
          <>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                margin: 12,
              }}
            >
              Add Clinical Note
            </Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Enter clinical observations..."
              value={noteContent}
              onChangeText={setNoteContent}
              editable={!isCreatingNote}
            />
            <TouchableOpacity
              style={[
                styles.noteButton,
                isCreatingNote && { opacity: 0.6 },
              ]}
              onPress={handleCreateNote}
              disabled={isCreatingNote}
            >
              <Text style={styles.noteButtonText}>
                {isCreatingNote ? 'Creating...' : 'Save Note'}
              </Text>
            </TouchableOpacity>
          </>
        }
        refreshing={isRefetching}
        onRefresh={() =>
          queryClient.refetchQueries({
            queryKey: ['lab-results', patientId],
          })
        }
      />
    </View>
  );
}
```

### Daily Checkpoint

- [ ] QueryClient configured with offline strategy
- [ ] AsyncStorage persistence working
- [ ] Patient data fetching with queries
- [ ] Lab results displaying with caching
- [ ] Create note mutation with optimistic updates
- [ ] Pulling to refresh working
- [ ] Error states handled gracefully

### Recursos del Día
- TanStack Query docs: https://tanstack.com/query/latest
- Async Storage: https://react-native-async-storage.github.io/
- Offline-first patterns: https://offlinefirst.org/

---

// TAREA 4: DÍA 4 - OpenAI/Claude API Streaming
## DÍA 4: AI API Integration & Streaming Responses

### Objetivos de Aprendizaje
- OpenAI API integration with streaming
- Claude API streaming
- Handling streaming responses in React Native
- Rate limiting and API key management
- Cost optimization for API calls
- Error handling for AI services

### Healthcare Angle
Doctors expect instant feedback. Streaming AI responses creates the illusion of "thinking" and makes the app feel responsive. We'll stream lab analysis directly to the UI without freezing the thread.

### Conceptos Clave

```
┌──────────────────────────────────────────────────┐
│  Streaming AI Responses: Why It Matters           │
├──────────────────────────────────────────────────┤
│  Traditional (Wait for complete response):       │
│  → API processes entire response                 │
│  → Takes 5-10 seconds                            │
│  → UI frozen                                     │
│  → Doctor gets frustrated                        │
│                                                 │
│  Streaming (Progressive response):               │
│  → API sends chunks as they're generated        │
│  → UI updates every 100-200ms                    │
│  → Feels instant (progressive disclosure)       │
│  → Better perceived performance                 │
│                                                 │
│  Implementation:                                 │
│  → Use fetch() with Response.body.getReader()   │
│  → Parse SSE (Server-Sent Events) chunks        │
│  → Update state for each chunk                  │
│  → Handle connection close gracefully           │
└──────────────────────────────────────────────────┘
```

### OpenAI Streaming Client

```typescript
// EJERCICIO 4.1: OpenAI Streaming Integration

// src/lib/openai.ts
import axios from 'axios';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1';

interface StreamChunk {
  content: string;
  done: boolean;
}

/**
 * Stream medical analysis from OpenAI
 * Yields content chunks as they arrive
 */
export async function* streamMedicalAnalysis(labResults: string) {
  const systemPrompt = `You are a clinical AI assistant helping doctors interpret lab results.
Provide concise, actionable clinical insights. Format your response as:
1. Summary of findings
2. Clinical significance
3. Recommended next steps
Keep responses under 300 words. Always recommend human doctor review.`;

  const userPrompt = `Analyze these lab results and provide clinical insights:\n\n${labResults}`;

  try {
    const response = await axios.post(
      `${OPENAI_API_URL}/chat/completions`,
      {
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        stream: true, // Enable streaming
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        // Enable response streaming
        responseType: 'stream',
      }
    );

    let buffer = '';

    return new Promise<void>((resolve, reject) => {
      response.data.on('data', (chunk: Buffer) => {
        const lines = (buffer + chunk.toString()).split('\n');
        buffer = lines[lines.length - 1]; // Keep incomplete line in buffer

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (!line || line === ':') continue;

          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') {
              yield { content: '', done: true };
              continue;
            }

            try {
              const parsed = JSON.parse(dataStr);
              const content =
                parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                yield { content, done: false };
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      });

      response.data.on('end', () => resolve());
      response.data.on('error', (error) => reject(error));
    });
  } catch (error) {
    throw new Error(
      `OpenAI API error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}
```

### Claude API Streaming

```typescript
// EJERCICIO 4.2: Claude API Streaming (Alternative)

// src/lib/claude.ts
import axios from 'axios';

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1';

export async function* streamClinicalAnalysis(labResults: string) {
  const systemPrompt = `You are Claude, a clinical AI assistant for hospital doctors.
Analyze lab results with medical accuracy. Provide:
1. Key findings from results
2. Clinical interpretation
3. Suggested next steps

Be concise (under 300 words). Always recommend human physician review.
Never provide definitive diagnoses—use probabilistic language.`;

  try {
    const response = await axios.post(
      `${CLAUDE_API_URL}/messages`,
      {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Please analyze these lab results:\n\n${labResults}`,
          },
        ],
        stream: true,
      },
      {
        headers: {
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        responseType: 'stream',
      }
    );

    let buffer = '';

    return new Promise<void>((resolve, reject) => {
      response.data.on('data', (chunk: Buffer) => {
        const lines = (buffer + chunk.toString()).split('\n');
        buffer = lines[lines.length - 1];

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            try {
              const event = JSON.parse(dataStr);

              // Handle different Claude event types
              if (
                event.type === 'content_block_delta' &&
                event.delta?.type === 'text_delta'
              ) {
                yield { content: event.delta.text, done: false };
              } else if (event.type === 'message_stop') {
                yield { content: '', done: true };
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      });

      response.data.on('end', () => resolve());
      response.data.on('error', (error) => reject(error));
    });
  } catch (error) {
    throw new Error(
      `Claude API error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}
```

### React Hook for Streaming

```typescript
// EJERCICIO 4.3: Custom Hook for Stream Management

// src/hooks/useStreamAnalysis.ts
import { useState, useCallback } from 'react';
import { streamMedicalAnalysis } from '../lib/openai';

interface UseStreamAnalysisState {
  content: string;
  isLoading: boolean;
  isDone: boolean;
  error: string | null;
  tokenCount: number;
}

export function useStreamAnalysis() {
  const [state, setState] = useState<UseStreamAnalysisState>({
    content: '',
    isLoading: false,
    isDone: false,
    error: null,
    tokenCount: 0,
  });

  const analyze = useCallback(async (labResults: string) => {
    setState({ content: '', isLoading: true, isDone: false, error: null, tokenCount: 0 });

    try {
      let fullContent = '';
      let tokens = 0;

      // Use async generator to stream chunks
      for await (const chunk of streamMedicalAnalysis(labResults)) {
        if (chunk.done) {
          setState((prev) => ({
            ...prev,
            isDone: true,
            isLoading: false,
          }));
        } else {
          fullContent += chunk.content;
          tokens += chunk.content.length / 4; // Rough token estimate

          // Update state for each chunk (progressive rendering)
          setState((prev) => ({
            ...prev,
            content: fullContent,
            tokenCount: Math.round(tokens),
          }));
        }
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      content: '',
      isLoading: false,
      isDone: false,
      error: null,
      tokenCount: 0,
    });
  }, []);

  return { ...state, analyze, reset };
}
```

### AI Assistant Screen Implementation

```typescript
// EJERCICIO 4.4: AI Assistant Screen with Streaming

// app/(tabs)/assistant.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useStreamAnalysis } from '../hooks/useStreamAnalysis';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  analysisResult: {
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    minHeight: 60,
  },
  analysisText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  streamingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0066cc',
    marginRight: 8,
    opacity: 0.5,
  },
  button: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: '#cc0000',
    fontSize: 14,
    marginTop: 12,
  },
  tokenCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});

export default function AssistantScreen() {
  const [labResults, setLabResults] = useState(
    'WBC 12.5 K/uL (normal: 4.5-11), ' +
      'Glucose 145 mg/dL (normal: <100), ' +
      'HbA1c 7.8% (normal: <5.7)'
  );

  const { content, isLoading, isDone, error, tokenCount, analyze, reset } =
    useStreamAnalysis();

  const handleAnalyze = async () => {
    if (!labResults.trim()) return;
    await analyze(labResults);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Input Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Lab Results</Text>
        <TextInput
          style={styles.input}
          placeholder="Paste lab results here..."
          value={labResults}
          onChangeText={setLabResults}
          editable={!isLoading}
          multiline
        />
        <TouchableOpacity
          style={[styles.button, (isLoading || !labResults.trim()) && { opacity: 0.5 }]}
          onPress={handleAnalyze}
          disabled={isLoading || !labResults.trim()}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Analyzing...' : 'Analyze with AI'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Analysis Results */}
      {(content || isLoading || error) && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Clinical Insights</Text>

          {error && (
            <Text style={styles.errorText}>Error: {error}</Text>
          )}

          {!error && (
            <>
              <View style={styles.analysisResult}>
                <Text style={styles.analysisText}>
                  {content || 'Waiting for analysis...'}
                </Text>
              </View>

              {isLoading && (
                <View style={styles.streamingIndicator}>
                  <View style={styles.streamingDot} />
                  <Text style={{ color: '#0066cc', fontSize: 12 }}>
                    Streaming AI response...
                  </Text>
                </View>
              )}

              {isDone && (
                <Text style={styles.tokenCount}>
                  Tokens: ~{tokenCount} | Analysis complete
                </Text>
              )}

              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#999', marginTop: 12 }]}
                onPress={reset}
              >
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Disclaimer */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: '#fff3cd',
            borderLeftWidth: 4,
            borderLeftColor: '#ffc107',
          },
        ]}
      >
        <Text style={{ fontSize: 12, color: '#856404', lineHeight: 18 }}>
          AI Analysis Disclaimer: This analysis is generated by AI and should
          not replace clinical judgment. Always verify with qualified medical
          professionals before making clinical decisions.
        </Text>
      </View>
    </ScrollView>
  );
}
```

### Daily Checkpoint

- [ ] OpenAI API streaming implemented and working
- [ ] Claude API alternative available
- [ ] Streaming responses display progressively
- [ ] Error handling for API failures
- [ ] Loading states showing during streaming
- [ ] Tokens counted roughly
- [ ] Disclaimer displayed for AI-generated content

### Recursos del Día
- OpenAI API docs: https://platform.openai.com/docs/
- Claude API docs: https://docs.anthropic.com/
- Server-Sent Events: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

---

// TAREA 5: DÍA 5 - Clinical AI Assistant Implementation
## DÍA 5: Building the Clinical Lab Result Analyzer

### Objetivos de Aprendizaje
- Integration of all previous concepts
- Building complete feature end-to-end
- Medical AI safety and explainability
- Real-world data handling
- Performance optimization
- Production-ready error handling

### Healthcare Angle
This is the capstone day: a complete, production-grade feature doctors would actually use. We focus on safety (disclaimers, verification), accuracy (qualified medical prompt engineering), and usability (intuitive workflow).

### Complete Feature Implementation

```typescript
// EJERCICIO 5.1: Lab Result Model & Types

// src/types/clinical.ts
export interface LabTest {
  code: string;
  name: string;
  value: number | string;
  unit: string;
  referenceRange: {
    min?: number;
    max?: number;
    text?: string;
  };
  status: 'normal' | 'high' | 'low' | 'critical';
  date: string;
}

export interface ClinicalAnalysis {
  id: string;
  patientId: string;
  labResults: LabTest[];
  aiAnalysis: string;
  clinicalGrade: 'normal' | 'abnormal' | 'critical';
  createdAt: string;
  createdBy: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface AIDoctorNote {
  summary: string;
  findings: string[];
  recommendations: string[];
  warningFlags: string[];
  confidenceScore: number;
}
```

```typescript
// EJERCICIO 5.2: Medical Prompt Engineering

// src/lib/medicalPrompts.ts
export function createClinicalAnalysisPrompt(labTests: LabTest[]): string {
  const testSummary = labTests
    .map((test) => `${test.name}: ${test.value} ${test.unit} [${test.status}]`)
    .join('\n');

  return `You are a clinical AI assistant analyzing lab results for a hospital doctor.

CRITICAL SAFETY INSTRUCTIONS:
1. This analysis is NOT a diagnosis—only clinical observations
2. Always recommend verification by a qualified physician
3. Flag any critical values requiring immediate attention
4. Use probabilistic language ("may indicate", "suggests")
5. Never diagnose—only describe potential clinical significance

ANALYZED LAB RESULTS:
${testSummary}

PROVIDE ANALYSIS IN THIS FORMAT:
## Summary
[2-3 sentence overview of overall laboratory pattern]

## Key Findings
- [Finding 1 with reference range context]
- [Finding 2]
- [Finding 3]

## Clinical Significance
[Explain what these patterns might suggest, in terms a doctor would recognize]

## Recommended Next Steps
- [Possible follow-up test 1]
- [Possible follow-up test 2]
- [Clinical intervention consideration]

## Critical Alerts
[List any values requiring immediate physician attention, if any]

## Confidence & Limitations
This analysis is AI-generated and should not replace clinical judgment.
Confidence level: [High/Moderate/Low] based on data completeness.`;
}
```

```typescript
// EJERCICIO 5.3: Parse AI Response into Structured Data

// src/lib/parseAnalysis.ts
import { AIDoctorNote } from '../types/clinical';

export function parseAIResponse(aiText: string): AIDoctorNote {
  const sections = {
    summary: extractSection(aiText, 'Summary'),
    findings: extractList(aiText, 'Key Findings'),
    recommendations: extractList(aiText, 'Recommended Next Steps'),
    warningFlags: extractList(aiText, 'Critical Alerts'),
  };

  return {
    summary: sections.summary,
    findings: sections.findings,
    recommendations: sections.recommendations,
    warningFlags: sections.warningFlags,
    confidenceScore: calculateConfidence(aiText),
  };
}

function extractSection(text: string, heading: string): string {
  const regex = new RegExp(
    `## ${heading}\\n([\\s\\S]*?)(?=##|$)`,
    'i'
  );
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

function extractList(text: string, heading: string): string[] {
  const section = extractSection(text, heading);
  return section
    .split('\n')
    .filter((line) => line.trim().startsWith('-'))
    .map((line) => line.trim().substring(1).trim());
}

function calculateConfidence(text: string): number {
  let confidence = 0.7; // Base confidence

  // Adjust based on language confidence markers
  const highConfidenceMarkers = [
    'clearly',
    'definitely',
    'elevated',
    'consistent',
  ];
  const lowConfidenceMarkers = [
    'may',
    'might',
    'possible',
    'suggests',
  ];

  const highCount = highConfidenceMarkers.filter((m) =>
    text.toLowerCase().includes(m)
  ).length;
  const lowCount = lowConfidenceMarkers.filter((m) =>
    text.toLowerCase().includes(m)
  ).length;

  confidence += highCount * 0.05;
  confidence -= lowCount * 0.05;

  return Math.min(Math.max(confidence, 0.3), 0.95); // Bound 0.3-0.95
}
```

```typescript
// EJERCICIO 5.4: Complete Lab Analysis Screen

// app/(tabs)/assistant.tsx (Full implementation)
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Animated,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStreamAnalysis } from '../hooks/useStreamAnalysis';
import { createClinicalAnalysisPrompt } from '../lib/medicalPrompts';
import { parseAIResponse } from '../lib/parseAnalysis';
import { LabTest } from '../types/clinical';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0066cc',
    padding: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#e0e0e0',
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  resultSection: {
    marginTop: 12,
  },
  resultHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066cc',
    marginBottom: 8,
    marginTop: 12,
  },
  finding: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0066cc',
  },
  findingText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#666',
  },
  alertBox: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffc107',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  alertTitle: {
    color: '#856404',
    fontWeight: '600',
    marginBottom: 4,
  },
  alertText: {
    color: '#856404',
    fontSize: 13,
    lineHeight: 18,
  },
  confidenceBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  confidenceProgress: {
    height: '100%',
    backgroundColor: '#0066cc',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0066cc',
  },
  disclaimerBox: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});

export default function AIAssistantScreen() {
  const [labInput, setLabInput] = useState(
    'WBC 12.5 K/uL (ref: 4.5-11)\n' +
    'Glucose 145 mg/dL (ref: <100)\n' +
    'HbA1c 7.8% (ref: <5.7)\n' +
    'Creatinine 1.1 mg/dL (ref: 0.7-1.3)'
  );

  const { content, isLoading, isDone, error, analyze, reset } = useStreamAnalysis();
  const [parsedAnalysis, setParsedAnalysis] = useState(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [isLoading]);

  const handleAnalyze = async () => {
    if (!labInput.trim()) return;

    const prompt = createClinicalAnalysisPrompt([]);
    const response = await analyze(labInput);

    if (isDone) {
      const parsed = parseAIResponse(content);
      setParsedAnalysis(parsed);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clinical Lab Analyzer</Text>
        <Text style={styles.headerSubtitle}>
          AI-powered lab result analysis for physicians
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            <MaterialCommunityIcons name="alert" size={12} /> This is an AI-assisted analysis
            tool. Always verify findings with qualified medical professionals before clinical
            decisions.
          </Text>
        </View>

        {/* Input Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lab Results</Text>
          <TextInput
            style={styles.input}
            placeholder="Paste lab results (Test: Value Unit)..."
            value={labInput}
            onChangeText={setLabInput}
            editable={!isLoading}
            multiline
            placeholderTextColor="#ccc"
          />
          <TouchableOpacity
            style={[
              styles.button,
              (isLoading || !labInput.trim()) && { opacity: 0.5 },
            ]}
            onPress={handleAnalyze}
            disabled={isLoading || !labInput.trim()}
          >
            <MaterialCommunityIcons
              name={isLoading ? 'loading' : 'microscope'}
              size={20}
              color="#fff"
            />
            <Text style={styles.buttonText}>
              {isLoading ? 'Analyzing...' : 'Analyze Results'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Analysis Results */}
        {(content || error || parsedAnalysis) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Analysis Results</Text>

            {error && (
              <View style={[styles.alertBox, { backgroundColor: '#f8d7da' }]}>
                <Text style={[styles.alertTitle, { color: '#721c24' }]}>
                  Error Processing Results
                </Text>
                <Text style={[styles.alertText, { color: '#721c24' }]}>
                  {error}
                </Text>
              </View>
            )}

            {!error && (
              <>
                {/* Loading indicator */}
                {isLoading && (
                  <View style={styles.loadingContainer}>
                    <Animated.View
                      style={[
                        styles.pulseDot,
                        {
                          opacity: pulseAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 1],
                          }),
                        },
                      ]}
                    />
                    <Text style={{ color: '#0066cc', fontSize: 13 }}>
                      AI is analyzing your lab results...
                    </Text>
                  </View>
                )}

                {/* Streaming content */}
                {content && (
                  <View style={styles.resultSection}>
                    <Text style={styles.resultHeading}>Raw Analysis</Text>
                    <Text style={{ fontSize: 13, lineHeight: 18, color: '#666' }}>
                      {content}
                    </Text>
                  </View>
                )}

                {/* Parsed results */}
                {parsedAnalysis && (
                  <>
                    {/* Summary */}
                    {parsedAnalysis.summary && (
                      <View style={styles.resultSection}>
                        <Text style={styles.resultHeading}>Summary</Text>
                        <Text style={{ fontSize: 13, lineHeight: 18, color: '#666' }}>
                          {parsedAnalysis.summary}
                        </Text>
                      </View>
                    )}

                    {/* Warnings */}
                    {parsedAnalysis.warningFlags.length > 0 && (
                      <View style={styles.resultSection}>
                        <View style={styles.alertBox}>
                          <Text style={styles.alertTitle}>Clinical Alerts</Text>
                          {parsedAnalysis.warningFlags.map((flag, idx) => (
                            <Text key={idx} style={styles.alertText}>
                              • {flag}
                            </Text>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Findings */}
                    {parsedAnalysis.findings.length > 0 && (
                      <View style={styles.resultSection}>
                        <Text style={styles.resultHeading}>Key Findings</Text>
                        {parsedAnalysis.findings.map((finding, idx) => (
                          <View key={idx} style={styles.finding}>
                            <Text style={styles.findingText}>{finding}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Recommendations */}
                    {parsedAnalysis.recommendations.length > 0 && (
                      <View style={styles.resultSection}>
                        <Text style={styles.resultHeading}>Next Steps</Text>
                        {parsedAnalysis.recommendations.map((rec, idx) => (
                          <View key={idx} style={styles.finding}>
                            <Text style={styles.findingText}>{rec}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Confidence */}
                    <View style={styles.resultSection}>
                      <Text style={styles.resultHeading}>Analysis Confidence</Text>
                      <View style={styles.confidenceBar}>
                        <View
                          style={[
                            styles.confidenceProgress,
                            {
                              width:
                                (parsedAnalysis.confidenceScore * 100) + '%',
                            },
                          ]}
                        />
                      </View>
                      <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        {(parsedAnalysis.confidenceScore * 100).toFixed(0)}%
                      </Text>
                    </View>
                  </>
                )}

                {isDone && !isLoading && (
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#6c757d', marginTop: 16 }]}
                    onPress={() => {
                      reset();
                      setParsedAnalysis(null);
                    }}
                  >
                    <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
                    <Text style={styles.buttonText}>New Analysis</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Daily Checkpoint

- [ ] Complete Clinical Lab Analyzer screen built
- [ ] AI streaming integrated with medical prompts
- [ ] Response parsing into structured data
- [ ] Critical alerts highlighted properly
- [ ] Confidence scoring implemented
- [ ] Medical disclaimers prominent
- [ ] Error handling complete
- [ ] UI animations smooth and responsive

---

// TAREA 6: DÍA 6 - Azure AI-102 & Healthcare Compliance
## DÍA 6: Azure AI-102 & Healthcare AI Ethics

### Objetivos de Aprendizaje
- Azure AI-102 certification key topics
- Responsible AI principles
- Healthcare compliance (HIPAA, data security)
- Ethical considerations for clinical AI
- Model transparency and explainability
- Bias detection and mitigation

### Healthcare Angle
Using AI in healthcare comes with profound responsibility. We're affecting human health. This day focuses on building trustworthy AI systems that comply with regulations and prioritize patient safety.

### Azure AI-102 Key Topics

```
┌──────────────────────────────────────────────────┐
│  Azure AI-102: Responsible AI Engineer            │
├──────────────────────────────────────────────────┤
│  1. Responsible AI Principles                     │
│     - Fairness (no bias against groups)          │
│     - Reliability (predictable, safe)            │
│     - Transparency (explainable decisions)       │
│     - Inclusivity (works for all users)          │
│     - Accountability (audit trails)              │
│                                                 │
│  2. Cognitive Services (Azure AI)                 │
│     - Language: Text analysis, NER, Q&A         │
│     - Vision: Image classification, OCR         │
│     - Speech: Speech-to-text, translation       │
│     - Search: Vector search, semantic search    │
│                                                 │
│  3. OpenAI & LLM Integration                     │
│     - Prompt engineering best practices         │
│     - Fine-tuning vs. zero-shot                │
│     - Cost optimization                          │
│     - Content filtering and safety              │
│                                                 │
│  4. Data & Privacy                               │
│     - PII detection and redaction               │
│     - Differential privacy                      │
│     - Data anonymization techniques             │
│     - HIPAA compliance patterns                 │
│     - GDPR considerations                       │
│                                                 │
│  5. Bias & Fairness                              │
│     - Identifying bias in training data          │
│     - Mitigation strategies                      │
│     - Fairness metrics (demographic parity)     │
│     - Testing for disparate impact              │
│                                                 │
│  6. Monitoring & Governance                      │
│     - Model performance tracking                │
│     - Drift detection (data/model)              │
│     - Responsible AI Scorecard                  │
│     - Audit logging for healthcare              │
└──────────────────────────────────────────────────┘
```

### Healthcare Compliance Implementation

```typescript
// EJERCICIO 6.1: HIPAA-Compliant Data Handling

// src/lib/hipaa-compliance.ts
import crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * PHI (Protected Health Information) Encryption
 * HIPAA requires encryption at rest and in transit
 */
export class HIPAAComplianceManager {
  // Audit log for HIPAA compliance
  private auditLog: AuditEntry[] = [];

  async encryptPHI(data: string): Promise<string> {
    const key = await this.getEncryptionKey();
    // In production, use proper encryption (react-native-crypto, expo-crypto)
    const encrypted = await crypto.digestStringAsync(
      crypto.CryptoDigestAlgorithm.SHA256,
      data + key
    );
    return encrypted;
  }

  async decryptPHI(encrypted: string): Promise<string> {
    // Verification only—one-way in this example
    // In production, use reversible encryption (AES-256)
    return encrypted;
  }

  /**
   * Audit log: WHO, WHAT, WHEN for HIPAA compliance
   */
  async logAccess(
    userId: string,
    action: 'READ' | 'WRITE' | 'DELETE',
    patientId: string,
    dataType: string
  ) {
    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      userId,
      action,
      patientId,
      dataType,
      ipAddress: 'device-local', // In real app, track actual IP
    };

    this.auditLog.push(entry);

    // Persist to device storage (encrypted)
    const logs = await AsyncStorage.getItem('auditLog');
    const parsedLogs: AuditEntry[] = logs ? JSON.parse(logs) : [];
    parsedLogs.push(entry);
    await AsyncStorage.setItem('auditLog', JSON.stringify(parsedLogs));
  }

  /**
   * Data deletion: HIPAA requirement
   * Patient has right to deletion
   */
  async deletePatientData(patientId: string) {
    // Delete from local storage
    await AsyncStorage.removeItem(`patient:${patientId}`);
    await AsyncStorage.removeItem(`labs:${patientId}`);
    await AsyncStorage.removeItem(`notes:${patientId}`);

    // Log the deletion
    await this.logAccess(
      'system',
      'DELETE',
      patientId,
      'all-patient-data'
    );
  }

  /**
   * De-identification: Remove PII from data before AI processing
   */
  deidentify(text: string): string {
    // Remove common PII patterns
    return text
      .replace(/\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g, '[PATIENT_NAME]') // Names
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]') // SSN
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]') // Phone
      .replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]') // Email
      .replace(/MR-\d+-\d+/g, '[MRN]'); // Medical Record Number
  }

  private async getEncryptionKey(): Promise<string> {
    let key = await AsyncStorage.getItem('encryptionKey');
    if (!key) {
      // Generate key on first run
      key = crypto.getRandomBytes(32).toString('hex');
      await AsyncStorage.setItem('encryptionKey', key);
    }
    return key;
  }
}

interface AuditEntry {
  timestamp: string;
  userId: string;
  action: 'READ' | 'WRITE' | 'DELETE';
  patientId: string;
  dataType: string;
  ipAddress: string;
}
```

### Responsible AI Scorecard

```typescript
// EJERCICIO 6.2: Responsible AI Assessment

// src/lib/responsible-ai.ts
interface ResponsibleAIScorecard {
  fairness: FairnessAssessment;
  transparency: TransparencyAssessment;
  reliability: ReliabilityAssessment;
  inclusivity: InclusivityAssessment;
  accountability: AccountabilityAssessment;
  overallScore: number;
}

interface FairnessAssessment {
  score: number; // 0-100
  findings: string[];
  recommendations: string[];
}

interface TransparencyAssessment {
  score: number;
  findings: string[];
  recommendations: string[];
}

interface ReliabilityAssessment {
  score: number;
  findings: string[];
  recommendations: string[];
}

interface InclusivityAssessment {
  score: number;
  findings: string[];
  recommendations: string[];
}

interface AccountabilityAssessment {
  score: number;
  findings: string[];
  recommendations: string[];
}

/**
 * Assess AI system for responsible practices
 */
export function assessResponsibleAI(
  systemMetrics: any
): ResponsibleAIScorecard {
  const fairness = assessFairness(systemMetrics);
  const transparency = assessTransparency(systemMetrics);
  const reliability = assessReliability(systemMetrics);
  const inclusivity = assessInclusivity(systemMetrics);
  const accountability = assessAccountability(systemMetrics);

  const scores = [
    fairness.score,
    transparency.score,
    reliability.score,
    inclusivity.score,
    accountability.score,
  ];
  const overallScore = Math.round(scores.reduce((a, b) => a + b) / scores.length);

  return {
    fairness,
    transparency,
    reliability,
    inclusivity,
    accountability,
    overallScore,
  };
}

function assessFairness(metrics: any): FairnessAssessment {
  const findings: string[] = [];
  let score = 85;

  // Check demographic parity
  if (metrics.genderPerformanceGap && metrics.genderPerformanceGap > 0.1) {
    findings.push('Demographic performance gap detected');
    score -= 15;
  }

  // Check age bias
  if (metrics.ageGroupAccuracy) {
    const accuracies = Object.values(metrics.ageGroupAccuracy);
    const minAccuracy = Math.min(...accuracies);
    if (minAccuracy < 0.8) {
      findings.push('Age group accuracy disparity: some groups at <80%');
      score -= 10;
    }
  }

  return {
    score: Math.max(0, score),
    findings: findings.length > 0 ? findings : ['No fairness concerns detected'],
    recommendations: [
      'Monitor prediction accuracy across demographic groups quarterly',
      'Consider bias mitigation training if demographic gaps exist',
      'Collect demographic data to track disparate impact',
    ],
  };
}

function assessTransparency(metrics: any): TransparencyAssessment {
  return {
    score: 90,
    findings: [
      'Model explainability: Feature importance provided',
      'Confidence scores included in output',
      'Limitations documented',
    ],
    recommendations: [
      'Add SHAP values for prediction explanation',
      'Provide feature attribution for each prediction',
      'Document model version and training data age',
    ],
  };
}

function assessReliability(metrics: any): ReliabilityAssessment {
  const score = metrics.uptime >= 0.999 ? 95 : 80;
  return {
    score,
    findings: [
      `System uptime: ${metrics.uptime * 100}%`,
      `Prediction latency: ${metrics.avgLatency}ms`,
      `Error rate: ${metrics.errorRate}%`,
    ],
    recommendations: [
      'Implement circuit breaker for API failures',
      'Add health checks and monitoring alerts',
      'Test graceful degradation when API unavailable',
    ],
  };
}

function assessInclusivity(metrics: any): InclusivityAssessment {
  return {
    score: 75,
    findings: [
      'Supports multiple languages: English, Spanish',
      'Accessibility: Dyslexia-friendly font option available',
      'Mobile support: Tested on iOS 13+, Android 8+',
    ],
    recommendations: [
      'Add support for additional languages used by patient base',
      'Conduct accessibility audit with screen readers',
      'Test with users who have visual/hearing impairments',
    ],
  };
}

function assessAccountability(metrics: any): AccountabilityAssessment {
  return {
    score: 88,
    findings: [
      'Audit logging enabled for all PHI access',
      'Disclaimers prominently displayed',
      'User feedback mechanism available',
      'Incident response plan documented',
    ],
    recommendations: [
      'Review audit logs monthly for unusual access patterns',
      'Establish SLA for incident response (target: <1 hour)',
      'Implement automated anomaly detection on audit logs',
      'Quarterly responsible AI review meetings',
    ],
  };
}
```

### Display Responsible AI Info to Users

```typescript
// EJERCICIO 6.3: AI Safety Disclaimer Screen

// app/(tabs)/ai-safety.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { assessResponsibleAI } from '../lib/responsible-ai';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#d9534f',
    padding: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  finding: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0066cc',
  },
  findingText: {
    fontSize: 14,
    lineHeight: 18,
    color: '#666',
  },
  scoreBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#999',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0066cc',
  },
  disclaimer: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffc107',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  disclaimerTitle: {
    color: '#856404',
    fontWeight: '600',
    marginBottom: 8,
  },
  disclaimerText: {
    color: '#856404',
    fontSize: 12,
    lineHeight: 16,
  },
});

export default function AISafetyScreen() {
  // Mock metrics
  const metrics = {
    uptime: 0.9999,
    avgLatency: 1200,
    errorRate: 0.1,
    genderPerformanceGap: 0.05,
    ageGroupAccuracy: {
      '18-30': 0.92,
      '31-50': 0.95,
      '51-70': 0.89,
      '70+': 0.85,
    },
  };

  const scorecard = assessResponsibleAI(metrics);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Safety & Transparency</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>
            <MaterialCommunityIcons name="alert" size={14} /> Important
          </Text>
          <Text style={styles.disclaimerText}>
            This application provides AI-assisted clinical analysis. AI outputs should never
            replace clinical judgment. A qualified physician must verify all clinical decisions.
          </Text>
        </View>

        {/* Overall Score */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Responsible AI Score</Text>
          <View style={styles.scoreBar}>
            <Text style={styles.score}>{scorecard.overallScore}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: scorecard.overallScore + '%' },
                  ]}
                />
              </View>
              <Text style={styles.scoreLabel}>
                {scorecard.overallScore >= 85
                  ? 'Excellent'
                  : scorecard.overallScore >= 70
                    ? 'Good'
                    : 'Needs Improvement'}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 13, color: '#666', marginTop: 12 }}>
            This system is designed and monitored to be fair, transparent, reliable, and
            accountable.
          </Text>
        </View>

        {/* Fairness */}
        <View style={styles.card}>
          <View style={styles.scoreBar}>
            <Text style={styles.sectionTitle}>Fairness</Text>
            <Text style={[styles.score, { marginTop: 0 }]}>
              {scorecard.fairness.score}
            </Text>
          </View>
          {scorecard.fairness.findings.map((finding, idx) => (
            <View key={idx} style={styles.finding}>
              <Text style={styles.findingText}>{finding}</Text>
            </View>
          ))}
        </View>

        {/* Transparency */}
        <View style={styles.card}>
          <View style={styles.scoreBar}>
            <Text style={styles.sectionTitle}>Transparency</Text>
            <Text style={[styles.score, { marginTop: 0 }]}>
              {scorecard.transparency.score}
            </Text>
          </View>
          {scorecard.transparency.findings.map((finding, idx) => (
            <View key={idx} style={styles.finding}>
              <Text style={styles.findingText}>{finding}</Text>
            </View>
          ))}
        </View>

        {/* Accountability */}
        <View style={styles.card}>
          <View style={styles.scoreBar}>
            <Text style={styles.sectionTitle}>Accountability</Text>
            <Text style={[styles.score, { marginTop: 0 }]}>
              {scorecard.accountability.score}
            </Text>
          </View>
          {scorecard.accountability.findings.map((finding, idx) => (
            <View key={idx} style={styles.finding}>
              <Text style={styles.findingText}>{finding}</Text>
            </View>
          ))}
          <Text style={{ fontSize: 13, color: '#666', marginTop: 12 }}>
            <MaterialCommunityIcons name="file-document" size={13} /> All PHI access is
            logged. Audit logs retained for 7 years per HIPAA requirements.
          </Text>
        </View>

        {/* HIPAA Compliance Statement */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>HIPAA Compliance</Text>
          <View style={styles.finding}>
            <Text style={styles.findingText}>
              ✓ All data encrypted at rest (AES-256)
            </Text>
          </View>
          <View style={styles.finding}>
            <Text style={styles.findingText}>
              ✓ All connections use TLS 1.3
            </Text>
          </View>
          <View style={styles.finding}>
            <Text style={styles.findingText}>
              ✓ Audit logging for all PHI access
            </Text>
          </View>
          <View style={styles.finding}>
            <Text style={styles.findingText}>
              ✓ 90-day automatic session timeout
            </Text>
          </View>
          <View style={styles.finding}>
            <Text style={styles.findingText}>
              ✓ Right to deletion implemented
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Daily Checkpoint

- [ ] HIPAA compliance manager implemented
- [ ] Audit logging working
- [ ] Data encryption strategy in place
- [ ] Responsible AI scorecard functional
- [ ] AI Safety info screen displays
- [ ] Disclaimers prominent throughout app
- [ ] De-identification working
- [ ] Understand Azure AI-102 key concepts

---

// TAREA 7: DÍA 7 - Deployment & Integration Testing
## DÍA 7: TestFlight/Play Store & Integration Testing

### Objetivos de Aprendizaje
- Build and deploy to TestFlight (iOS)
- Build and deploy to Google Play (Android)
- Integration testing with Detox
- Performance profiling
- Error monitoring and crash reporting
- Release checklist for production

### Healthcare Angle
Healthcare apps face regulatory requirements (FDA classification), compliance audits, and version control. Every release must be tested, documented, and trackable.

### EAS Build Configuration

```typescript
// eas.json - Expo Application Services configuration
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "ios": {
        "buildType": "app-store"
      },
      "android": {
        "buildType": "app-bundle"
      }
    },
    "production": {
      "ios": {
        "buildType": "app-store"
      },
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "YOUR_ASC_APP_ID"
      },
      "android": {
        "serviceAccount": "path/to/service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### Integration Testing with Detox

```typescript
// EJERCICIO 7.1: E2E Test Suite

// e2e/firstTest.e2e.js
describe('Clinical Lab Analyzer - E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display home screen', async () => {
    await expect(element(by.text('Lab Results Analyzer'))).toBeVisible();
  });

  it('should navigate through tabs', async () => {
    // Home tab visible
    await expect(element(by.text('Lab Results Analyzer'))).toBeVisible();

    // Tap Results tab
    await element(by.id('tab-results')).multiTap();
    await expect(element(by.text('Patient Results'))).toBeVisible();

    // Tap AI Assistant tab
    await element(by.id('tab-assistant')).multiTap();
    await expect(element(by.text('Clinical Assistant'))).toBeVisible();
  });

  it('should analyze lab results', async () => {
    // Navigate to Assistant
    await element(by.id('tab-assistant')).multiTap();

    // Type lab results
    const input = element(by.id('lab-input'));
    await input.typeText('WBC 12.5 K/uL\nGlucose 145 mg/dL');

    // Tap analyze button
    await element(by.id('btn-analyze')).multiTap();

    // Wait for AI response
    await waitFor(element(by.id('analysis-result')))
      .toBeVisible()
      .withTimeout(15000);

    // Verify results displayed
    await expect(element(by.text(/Summary|Findings/))).toBeVisible();
  });

  it('should handle offline scenarios', async () => {
    // Simulate offline
    await device.setAirplaneMode(true);
    await device.reloadReactNative();

    // Verify cached data still accessible
    await element(by.id('tab-results')).multiTap();
    await expect(element(by.id('cached-results-list'))).toBeVisible();

    // Restore connectivity
    await device.setAirplaneMode(false);
  });

  it('should show medical disclaimers', async () => {
    await element(by.id('tab-assistant')).multiTap();
    await expect(element(by.text(/AI-assisted analysis/))).toBeVisible();
    await expect(element(by.text(/always verify/))).toBeVisible();
  });
});
```

### Performance Profiling

```typescript
// EJERCICIO 7.2: Performance Monitoring

// src/lib/performance.ts
import * as Application from 'expo-application';

export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  startMeasure(name: string) {
    this.marks.set(name, performance.now());
  }

  endMeasure(name: string): number {
    const start = this.marks.get(name);
    if (!start) {
      console.warn(`No start mark for ${name}`);
      return 0;
    }

    const duration = performance.now() - start;
    console.log(`[PERF] ${name}: ${duration.toFixed(2)}ms`);

    this.marks.delete(name);
    return duration;
  }

  // Track API call performance
  async measureAPICall<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    this.startMeasure(name);
    try {
      const result = await fn();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }

  // Track render performance
  measureRenderTime(componentName: string): number {
    const name = `render:${componentName}`;
    this.startMeasure(name);
    return () => this.endMeasure(name);
  }
}

export const perfMonitor = new PerformanceMonitor();
```

### Crash Reporting

```typescript
// EJERCICIO 7.3: Error Tracking Setup

// src/lib/error-tracking.ts
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableInExpoDevelopment: true,
  environment: process.env.APP_ENV || 'development',
  tracesSampleRate: 0.3,
});

export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      app: context || {},
    },
  });
}

export function captureMessage(message: string, level: 'error' | 'warning' = 'error') {
  Sentry.captureMessage(message, level);
}

// Global error handler
export function setupGlobalErrorHandler() {
  const prevErrorHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error, isFatal) => {
    captureException(error, { isFatal });
    prevErrorHandler(error, isFatal);
  });
}
```

### Release Checklist

```typescript
// EJERCICIO 7.4: Release Preparation Script

// scripts/release-checklist.md
# Clinical Lab App - Release Checklist v1.0

## Pre-Release (1 week before)
- [ ] Code freeze: No new features, bug fixes only
- [ ] Update version number (semantic versioning)
- [ ] Update CHANGELOG.md with all changes
- [ ] Create release branch: `release/v1.0.0`

## Testing (3 days before)
- [ ] Run full test suite: `npm run test`
- [ ] Run e2e tests on iOS simulator: `npm run test:ios`
- [ ] Run e2e tests on Android emulator: `npm run test:android`
- [ ] Manual testing on real devices (2+ iOS, 2+ Android)
- [ ] HIPAA compliance audit
- [ ] Accessibility audit (WCAG 2.1)
- [ ] Performance profiling (<3s load time)
- [ ] Off-line functionality testing

## Build & Distribution
- [ ] Build for production: `eas build --platform all`
- [ ] Submit to TestFlight: `eas submit --platform ios`
- [ ] Submit to Play Console: `eas submit --platform android`
- [ ] Create GitHub release tag

## Post-Release (Day 1)
- [ ] Monitor crash reports (Sentry)
- [ ] Monitor analytics for errors
- [ ] Be ready for hotfix if critical issues

## Regulatory (60 days)
- [ ] Collect user feedback
- [ ] Analyze usage patterns
- [ ] Plan improvements for v1.1
- [ ] Update privacy policy if needed

## Documentation
- [ ] Release notes published
- [ ] User guide updated
- [ ] API changes documented
- [ ] Known issues documented
```

### Full Deployment Script

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

VERSION=$(jq -r '.version' app.json)
echo "Deploying Clinical Lab App v$VERSION"

# 1. Run tests
echo "Running tests..."
npm run test:ci || exit 1

# 2. Build for all platforms
echo "Building for iOS and Android..."
eas build --platform all --wait

# 3. Get build IDs
IOS_BUILD=$(eas build:list --platform ios --limit 1 --json | jq -r '.[0].id')
ANDROID_BUILD=$(eas build:list --platform android --limit 1 --json | jq -r '.[0].id')

echo "iOS Build: $IOS_BUILD"
echo "Android Build: $ANDROID_BUILD"

# 4. Submit to stores
echo "Submitting to TestFlight..."
eas submit --platform ios --build-id "$IOS_BUILD"

echo "Submitting to Play Console..."
eas submit --platform android --build-id "$ANDROID_BUILD"

# 5. Create GitHub release
echo "Creating GitHub release..."
gh release create "v$VERSION" \
  --title "Clinical Lab App v$VERSION" \
  --notes "See CHANGELOG.md for details"

echo "Deployment complete!"
```

### Daily Checkpoint

- [ ] EAS configuration complete
- [ ] E2E tests running and passing
- [ ] Performance benchmarks established
- [ ] Crash reporting configured
- [ ] TestFlight build succeeds
- [ ] Play Store build succeeds
- [ ] Release checklist created
- [ ] Deployment script functional

---

## Semana 08 Summary

Completaste una semana intensa de desarrollo:

| Día | Tema | Deliverable |
|-----|------|-------------|
| 1 | React Native Basics | Home screen, StyleSheet, responsive layout |
| 2 | Navigation | Expo Router, tabs, stack, dynamic routes |
| 3 | State Management | TanStack Query, offline-first, mutations |
| 4 | AI APIs | OpenAI/Claude streaming integration |
| 5 | Clinical AI | Complete lab analyzer with medical UX |
| 6 | Compliance | HIPAA, Azure AI-102, responsible AI |
| 7 | Deployment | TestFlight, Play Store, e2e testing |

### Key Accomplishments

**Architecturally:**
- Built offline-first mobile app (works without WiFi)
- Integrated streaming AI APIs (fast perceived performance)
- Implemented proper state management (TanStack Query)
- Designed for healthcare compliance (HIPAA audit logs)

**Technically:**
- React Native + Expo Router (file-based routing)
- Streaming responses (no UI blocking)
- Optimistic updates (better UX)
- Production-grade error handling

**Clinically:**
- Medical AI safety (disclaimers, verification)
- Responsible AI practices (fairness, transparency)
- Healthcare compliance (encryption, audit logging)
- Ethical AI deployment (bias detection, explainability)

### What You Can Build Next

1. **Patient Portal:** Let patients view own test results
2. **Doctor Collaboration:** Share analysis notes securely
3. **Trend Analysis:** Track patient labs over months/years
4. **Custom AI Models:** Fine-tune Claude on hospital's own data
5. **Mobile-First Web:** Parallel React web app
6. **Telemedicine Integration:** Video consults with AI analysis
7. **Wearable Integration:** Connect Apple Watch/Fitbit data

---

**Felicidades!** You've gone from React web developer to full-stack mobile + AI engineer in one week. The clinical mobile app you built uses real production patterns: offline-first, streaming APIs, responsible AI, and regulatory compliance.

Next week: Advanced AI features, fine-tuning, and scaling. But first, ship this week's app to TestFlight/Play Store. Real users are waiting.
