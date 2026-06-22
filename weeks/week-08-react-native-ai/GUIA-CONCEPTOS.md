// ============================================================
// GUÍA DE CONCEPTOS: React Native + AI para Aplicaciones Clínicas
// Arquitectura, Patrones, y Mejores Prácticas
// ============================================================

# Guía Conceptual: React Native + AI Architecture

## Tabla de Contenidos
1. React Native vs React Web
2. Expo: Managed vs Bare Workflow
3. TanStack Query: Estrategias de Cache Offline
4. Streaming de APIs en Mobile
5. Azure AI-102 Key Topics
6. Pipeline de Despliegue Mobile
7. Patrones de Arquitectura para Healthcare

---

## 1. React Native vs React Web

### La Brecha: Por Qué No Es "Just JavaScript"

```
┌─────────────────────────────────────────────────────────┐
│  React Web                React Native                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  DOM-based                 Native Components            │
│  (HTML elements)           (iOS UIViewController, etc)  │
│                                                         │
│  CSS Styling               StyleSheet (similar to CSS)  │
│  box-model: border,        But: no cascading,           │
│  padding, margin           no specificity wars          │
│                                                         │
│  Layout: Flexbox           Layout: Flexbox              │
│  (browser handles)         (React Native handles)       │
│                                                         │
│  Responsive: media         Responsive: Dimensions API  │
│  queries, window resize    or useWindowDimensions hook │
│                                                         │
│  Performance:              Performance:                 │
│  Virtual DOM, diffing      Native rendering,           │
│                            60 FPS required              │
│                                                         │
│  DevTools: Chrome,         DevTools: Flipper,          │
│  Redux DevTools            React DevTools              │
│                                                         │
│  Debugging: console.log    Debugging: Xcode/Android    │
│  in browser                Studio + React logs          │
│                                                         │
│  Deployment:               Deployment:                 │
│  npm deploy, Vercel        App Store, Play Store,      │
│                            TestFlight, internal builds  │
└─────────────────────────────────────────────────────────┘
```

### The Bridge Architecture

React Native's magic is the **bridge**—a layer that translates JavaScript into native code.

```
┌──────────────────────────────────────────────────────────┐
│  How React Native Works (Bridge Pattern)                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐                                   │
│  │  JavaScript      │                                   │
│  │  React Component │                                   │
│  │  (Main thread)   │                                   │
│  └────────┬─────────┘                                   │
│           │                                             │
│           │ Serialize to JSON                           │
│           ▼                                             │
│  ┌──────────────────┐                                   │
│  │  BRIDGE          │                                   │
│  │  (IPC layer)     │                                   │
│  └────────┬─────────┘                                   │
│           │                                             │
│           │ Native Method Calls                         │
│           ▼                                             │
│  ┌──────────────────────────────────┐                   │
│  │  Native Layer                    │                   │
│  │  iOS: UIView, UIViewController   │                   │
│  │  Android: View, Activity         │                   │
│  └──────────────────────────────────┘                   │
│                                                          │
│  Performance implications:                              │
│  • Bridge serialization (1-5ms per call)               │
│  • Don't update state 60x/sec (throttle to 16ms)      │
│  • Avoid large data transfers across bridge            │
│  • Native modules for heavy lifting                    │
└──────────────────────────────────────────────────────────┘
```

### Key Differences in Practice

#### 1. No CSS Cascading
```typescript
// React Web: Cascading works
const styles = `
  button { color: red; }
  .primary { color: blue; } /* Overrides button */
`;

// React Native: Specificity doesn't work
const styles = StyleSheet.create({
  button: { color: 'red' },
  primaryButton: { color: 'blue' }, // Use different class!
});

// Good: Use separate style objects
<Button style={[styles.button, styles.primary]} />
```

#### 2. No DOM Events
```typescript
// React Web: Event bubbling, capturing phase
<div onClick={handleClick}>
  <button onClick={handleButtonClick} /> {/* Bubbles to div */}
</div>

// React Native: No bubbling! Must handle explicitly
<View onPress={handleView}>
  <TouchableOpacity onPress={handleButton} /> {/* Doesn't bubble */}
</View>
```

#### 3. Responsive Design Pattern
```typescript
// React Web: CSS media queries
const styles = `
  @media (max-width: 768px) {
    .container { padding: 8px; }
  }
  @media (min-width: 769px) {
    .container { padding: 16px; }
  }
`;

// React Native: Dimensions API
import { Dimensions, useWindowDimensions } from 'react-native';

const MyComponent = () => {
  const { width, height } = useWindowDimensions();

  return (
    <View style={{
      padding: width < 768 ? 8 : 16,
    }} />
  );
};
```

#### 4. Performance Model
```typescript
// React Web:
// ✓ Virtual DOM handles updates efficiently
// ✓ 30 FPS is acceptable (web standard)
// ✓ DevTools: React Profiler shows component render times

// React Native:
// ✗ No Virtual DOM! Direct bridge calls
// ✓ 60 FPS required (matches phone refresh rate)
// ✓ DevTools: Flipper profiler shows bridge traffic

// Healthcare context: Animations must be smooth for
// clinical feedback (progress bars, streaming text)
const AnimatedExample = () => {
  const [text, setText] = useState('');

  // WRONG: Updates state 50x/sec (bridge overload)
  const handleStream = (chunk) => setText(t => t + chunk);

  // CORRECT: Batch updates or use Animated API
  const handleStream = (chunks) => {
    setText(prev => prev + chunks.join(''));
  };
};
```

---

## 2. Expo: Managed vs Bare Workflow

### Choosing Your Path

```
┌──────────────────────────────────────────────────────┐
│  EXPO MANAGED (Recommended for startups/healthcare)   │
├──────────────────────────────────────────────────────┤
│  • No native code to write                            │
│  • Built-in OTA (Over-The-Air) updates               │
│  • Expo CLI handles all build complexity             │
│  • Built-in EAS Build (compile in cloud)            │
│  • Limited to Expo SDK modules (~50)                │
│  • Can access most native APIs via Expo modules     │
│                                                      │
│  When to use:                                        │
│  ✓ Building quickly (startup mentality)             │
│  ✓ Don't need custom native code                    │
│  ✓ Healthcare app (Expo upgrades security patches) │
│  ✓ Smaller team (less native expertise needed)      │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  BARE WORKFLOW (For advanced needs)                   │
├──────────────────────────────────────────────────────┤
│  • Write custom Objective-C/Swift code (iOS)         │
│  • Write custom Java/Kotlin code (Android)          │
│  • Access 100% of native APIs                        │
│  • Slower development (native compilation)         │
│  • Requires Xcode + Android Studio                  │
│  • Team needs native expertise                      │
│                                                      │
│  When to use:                                        │
│  ✓ Need custom native modules                       │
│  ✓ Integrating with existing native code            │
│  ✓ Legacy enterprise dependencies                   │
│  ✗ For healthcare startups (usually overkill)       │
└──────────────────────────────────────────────────────┘
```

### Managed Workflow Architecture

```typescript
// EJERCICIO: Understanding Expo's Build Process

// 1. LOCAL DEVELOPMENT (eas update)
// → Changes synced over-the-air without app store review
// → Users get updates in minutes

// 2. EAS BUILD (Cloud compilation)
// → Expo servers compile your JS + native base
// → No Xcode/Android Studio needed
// → Builds cached for faster rebuilds

// 3. EAS SUBMIT (App store distribution)
// → Automatically submits to TestFlight/Play Store
// → Handles certificates, provisioning profiles
// → Reduces 10-hour process to 10 minutes

// Example configuration: app.json
{
  "expo": {
    "name": "Clinical Lab App",
    "version": "1.0.0",
    "slug": "clinical-lab",
    "platforms": ["ios", "android"],

    // OTA Updates
    "updates": {
      "enabled": true,
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 1000 // 1 second wait for update
    },

    // Plugins (Expo modules)
    "plugins": [
      "expo-camera",
      "expo-location",
      "@react-native-async-storage/async-storage",
      [
        "expo-notifications",
        {
          "sounds": ["default"]
        }
      ]
    ],

    // iOS specific
    "ios": {
      "bundleIdentifier": "com.hospital.clinicallab",
      "supportsTabletMode": true,
      "infoPlist": {
        "NSCameraUsageDescription": "Upload photos of lab results"
      }
    },

    // Android specific
    "android": {
      "package": "com.hospital.clinicallab",
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

### OTA Updates (Over-The-Air)

Critical for healthcare apps:

```typescript
// EJERCICIO: OTA Update Flow

// app/_layout.tsx
import * as Updates from 'expo-updates';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    const checkUpdates = async () => {
      try {
        // Check for updates
        const update = await Updates.checkAsync();

        if (update.isAvailable) {
          // Download silently
          await Updates.fetchUpdateAsync();

          // Notify user (or auto-apply on next launch)
          Alert.alert(
            'Update Available',
            'A new version of the app is available. Restart to apply.',
            [
              { text: 'Later', onPress: () => {} },
              {
                text: 'Restart',
                onPress: () => Updates.reloadAsync(),
              },
            ]
          );
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    };

    // Check for updates on app launch
    checkUpdates();
  }, []);

  return (
    // Your app...
  );
}

// Benefits for healthcare:
// • HIPAA compliance: Can push security patches immediately
// • No app store review delays
// • Instant bug fixes
// • Rollback capability if issues
```

---

## 3. TanStack Query: Cache Strategies for Offline

### The Problem: Poor Connectivity in Hospitals

```
Typical Hospital WiFi:
• Operating room: 0 bars (Faraday cage)
• ICU: 1 bar (interference from monitors)
• Hallways: 2-3 bars
• Data loss on roaming between networks

Solution: Offline-first with TanStack Query
```

### Cache Strategy Architecture

```
┌────────────────────────────────────────────────────────┐
│  TanStack Query Cache Layers (for healthcare)          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Layer 1: Memory Cache                                 │
│  ├─ Fresh: Just fetched (<5 min)                      │
│  ├─ Stale: Old but usable (5-30 min)                 │
│  └─ Invalidated: Must refetch on WiFi                │
│                                                        │
│  Layer 2: Disk Cache (AsyncStorage)                   │
│  ├─ Persists across app restarts                     │
│  ├─ 100KB - 10MB per query (depends on device)       │
│  └─ 24 hour expiration (configurable)                │
│                                                        │
│  Layer 3: Sync Queue                                   │
│  ├─ Failed mutations queued locally                   │
│  ├─ Retry when WiFi returns                          │
│  └─ Optimistic updates show immediately              │
│                                                        │
│  User Experience Flow:                                 │
│  1. User opens app (no WiFi)                          │
│  2. App shows cached patient data (instant)           │
│  3. In background, tries to sync                      │
│  4. WiFi appears → automatic sync                     │
│  5. Any failures → retry queue                        │
└────────────────────────────────────────────────────────┘
```

### Offline-First Implementation Pattern

```typescript
// EJERCICIO: Implementing Offline-First with TanStack Query

// src/lib/offlineStrategy.ts
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Step 1: STALE TIMING
      staleTime: 1000 * 60 * 5, // 5 min until query considered stale
      gcTime: 1000 * 60 * 30, // Keep for 30 min in memory

      // Step 2: NETWORK STRATEGY
      networkMode: 'always', // Try even when offline
      retry: (failureCount, error: any) => {
        // Retry failed queries 3 times with exponential backoff
        if (failureCount > 3) return false;
        return true;
      },
      retryDelay: (attemptIndex) => {
        // exponential: 1s, 2s, 4s, 8s
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },

      // Step 3: PERSISTENCE
      // Automatically persist queries to disk
      // (configured below with persister)
    },

    mutations: {
      // Mutations should ALWAYS retry
      networkMode: 'always',
      retry: 3,
    },
  },
});

// Persist queries to AsyncStorage
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  maxAge: 1000 * 60 * 60 * 24, // Keep for 24 hours
});

// Wrap provider with persister
export function PersistentQueryClientProvider({ children }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
```

### Cache Invalidation Strategies

```typescript
// EJERCICIO: Smart Invalidation for Healthcare Data

// Scenario: Doctor views patient results, then creates clinical note
// After creating note, we want fresh data but keep UI responsive

// src/hooks/useClinicalNotes.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateClinicalNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateNoteData) => {
      // Create note on server
      return apiClient.post('/clinical-notes', data);
    },

    // OPTIMISTIC UPDATE: Update UI immediately
    onMutate: async (newNote) => {
      // Cancel any in-progress refetches
      await queryClient.cancelQueries({
        queryKey: ['notes', newNote.patientId],
      });

      // Snapshot previous data for rollback
      const previousNotes = queryClient.getQueryData([
        'notes',
        newNote.patientId,
      ]);

      // Show new note immediately in UI
      queryClient.setQueryData(
        ['notes', newNote.patientId],
        (old) => [...(old || []), newNote]
      );

      return { previousNotes };
    },

    // If API succeeds, sync with server data
    onSuccess: (data, variables) => {
      // Invalidate all note queries for this patient
      // Next render will refetch from server
      queryClient.invalidateQueries({
        queryKey: ['notes', variables.patientId],
      });

      // Also invalidate lab analysis (depends on notes)
      queryClient.invalidateQueries({
        queryKey: ['analysis', variables.patientId],
      });
    },

    // If API fails, rollback optimistic update
    onError: (error, variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(
          ['notes', variables.patientId],
          context.previousNotes
        );
      }
    },
  });
}

// Usage:
// const { mutate: createNote } = useCreateClinicalNote();
//
// User sees note appear immediately ✓
// Server receives request in background
// If success: refresh data from server
// If error: note disappears, can retry
```

### Background Sync Pattern

```typescript
// EJERCICIO: Periodic Background Sync

// src/lib/backgroundSync.ts
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { queryClient } from './queryClient';

const SYNC_TASK = 'sync-offline-mutations';

// Register background task
TaskManager.defineTask(SYNC_TASK, async () => {
  try {
    // When device gets WiFi, automatically sync pending mutations
    await queryClient.refetchQueries({
      queryKey: ['pending-sync'],
      type: 'active',
    });

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register for background updates
export async function registerBackgroundSync() {
  try {
    // Sync every 30 minutes when WiFi available
    await BackgroundFetch.registerTaskAsync(SYNC_TASK, {
      minimumInterval: 60 * 30, // 30 minutes
      stopOnTerminate: false, // Continue even if app closed
      startOnBoot: true, // Start on device reboot
    });
  } catch (error) {
    console.error('Failed to register background sync:', error);
  }
}
```

### Measuring Cache Effectiveness

```typescript
// EJERCICIO: Monitor offline cache performance

// src/lib/cacheMetrics.ts
export class CacheMetrics {
  private hits = 0;
  private misses = 0;
  private diskHits = 0;

  recordQueryHit(source: 'memory' | 'disk') {
    if (source === 'memory') {
      this.hits++;
    } else {
      this.diskHits++;
    }
  }

  recordQueryMiss() {
    this.misses++;
  }

  getMetrics() {
    const total = this.hits + this.diskHits + this.misses;
    return {
      cacheHitRate: ((this.hits + this.diskHits) / total * 100).toFixed(1),
      memoryHitRate: (this.hits / (this.hits + this.misses) * 100).toFixed(1),
      diskHitRate: (this.diskHits / (this.hits + this.diskHits + this.misses) * 100).toFixed(1),
      totalRequests: total,
    };
  }
}

// For healthcare context:
// ✓ 80%+ cache hit rate = users aren't waiting for network
// ✓ 60%+ disk hit rate = offline access working
// ✓ <2% miss rate = good data persistence
```

---

## 4. Streaming AI APIs in Mobile

### Why Streaming Matters for Perceived Performance

```
┌──────────────────────────────────────────────────────┐
│  Streaming vs Non-Streaming (Healthcare UX)          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  TRADITIONAL (Wait):                                 │
│  t=0s    POST request                               │
│  t=3s    [Processing...]                            │
│  t=5s    Complete response displays                │
│  t=7s    Ready for action                          │
│  User feels: SLOW (7 second wait)                   │
│                                                      │
│  STREAMING (Progressive):                           │
│  t=0s    POST request                               │
│  t=0.2s  "Patient shows..."                        │
│  t=0.4s  "elevated glucose and A1c levels"        │
│  t=0.6s  "suggesting poorly controlled diabetes"   │
│  t=1.2s  "Recommend increasing medication..."     │
│  t=1.8s  Complete analysis                         │
│  User feels: FAST (appears to process in real-time)│
│                                                      │
│  Psychological principle:                           │
│  Progressive disclosure > waiting for completion   │
│  Even if total time is same (5s), streaming        │
│  feels 2-3x faster because user sees progress      │
└──────────────────────────────────────────────────────┘
```

### Streaming Implementation Architecture

```typescript
// EJERCICIO: Implementing Streaming in React Native

// src/lib/streaming.ts

/**
 * Fetch API wrapper that handles streaming responses
 * Works in React Native via axios + stream handling
 */
export async function* streamOpenAI(prompt: string) {
  const response = await fetch(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
        stream: true, // CRITICAL: Enable streaming
        temperature: 0.7,
      }),
    }
  );

  // response.body is a ReadableStream
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No readable stream');

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Parse any remaining buffer
        if (buffer.trim()) {
          yield { content: '', done: true };
        }
        break;
      }

      // Decode chunk and append to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete lines (SSE format: "data: {...}")
      const lines = buffer.split('\n');
      buffer = lines[lines.length - 1]; // Keep incomplete line

      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (!line || line === ':') continue;

        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { content: '', done: true };
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';

            // Yield each token as it arrives
            if (content) {
              yield { content, done: false };
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// Usage in React:
export function useStreamedAnalysis() {
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const analyze = useCallback(async (prompt: string) => {
    setIsStreaming(true);
    setResponse('');

    try {
      for await (const chunk of streamOpenAI(prompt)) {
        if (chunk.done) {
          setIsStreaming(false);
        } else {
          // Update state progressively
          setResponse(prev => prev + chunk.content);
        }
      }
    } catch (error) {
      console.error('Streaming failed:', error);
    }
  }, []);

  return { response, isStreaming, analyze };
}
```

### Chunked Streaming for Better Performance

```typescript
// EJERCICIO: Optimize streaming for mobile performance

// The problem: Updating state on every token causes re-renders
// Solution: Buffer tokens and update in batches

export class StreamBuffer {
  private buffer = '';
  private flushInterval = 100; // ms
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(
    private onFlush: (text: string) => void
  ) {}

  add(text: string) {
    this.buffer += text;

    // Reset timer
    if (this.timeoutId) clearTimeout(this.timeoutId);

    // Flush on timeout
    this.timeoutId = setTimeout(() => this.flush(), this.flushInterval);
  }

  flush() {
    if (this.buffer) {
      this.onFlush(this.buffer);
      this.buffer = '';
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  // Manual flush
  forceFlush() {
    this.flush();
  }
}

// Usage:
const buffer = new StreamBuffer((text) => {
  // This runs max 10x per second instead of 100x/token
  setResponse(prev => prev + text);
});

for await (const chunk of streamOpenAI(prompt)) {
  if (chunk.done) {
    buffer.forceFlush();
  } else {
    buffer.add(chunk.content);
  }
}
```

### Handling Connection Loss During Streaming

```typescript
// EJERCICIO: Resilient streaming with retry

export async function* streamWithRetry(
  prompt: string,
  maxRetries = 3
) {
  let lastIndex = 0;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      let index = 0;
      for await (const chunk of streamOpenAI(prompt)) {
        if (index >= lastIndex) {
          yield chunk;
          lastIndex = index;
        }
        index++;
      }
      // Success
      return;
    } catch (error) {
      if (attempt < maxRetries - 1) {
        // Exponential backoff
        await new Promise(resolve =>
          setTimeout(resolve, 1000 * Math.pow(2, attempt))
        );
      } else {
        throw error;
      }
    }
  }
}
```

---

## 5. Azure AI-102: Key Concepts for Healthcare

### Responsible AI Framework

```
┌─────────────────────────────────────────────────────┐
│  Azure AI-102: Responsible AI Principles             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. FAIRNESS (No algorithmic bias)                  │
│     • Does AI treat all patient groups equally?    │
│     • Example: Does diagnosis accuracy vary by age?│
│     • Measurement: Demographic parity metrics      │
│     • Healthcare: Disparate impact on minorities   │
│                                                     │
│  2. RELIABILITY (Consistent, predictable)          │
│     • Does AI work reliably in production?        │
│     • Example: Fails gracefully with bad inputs    │
│     • Measurement: Uptime, error rates, SLAs      │
│     • Healthcare: Critical for life-or-death data │
│                                                     │
│  3. TRANSPARENCY (Explainable decisions)           │
│     • Can doctor understand WHY AI suggested X?   │
│     • Example: "High glucose + A1c → diabetes"    │
│     • Measurement: Feature importance, SHAP values│
│     • Healthcare: FDA requires explainability     │
│                                                     │
│  4. INCLUSIVITY (Works for all users)              │
│     • Does app work for visually impaired doctors? │
│     • Example: Text-to-speech for analysis        │
│     • Measurement: Accessibility audit (WCAG)     │
│     • Healthcare: Legal requirement (ADA)         │
│                                                     │
│  5. ACCOUNTABILITY (Audit trails, responsibility)  │
│     • Who used the AI? When? For what?            │
│     • Example: Audit log of every analysis        │
│     • Measurement: HIPAA compliance, logging      │
│     • Healthcare: Non-negotiable for litigation   │
└─────────────────────────────────────────────────────┘
```

### Azure Cognitive Services for Healthcare

```typescript
// EJERCICIO: Using Azure Cognitive Services in Healthcare

// 1. Azure Language (NLP)
// • Named Entity Recognition (extract patient names, tests, values)
// • Text Classification (categorize lab result notes)
// • Sentiment Analysis (detect concerning language)

import { TextAnalyticsClient, AzureKeyCredential } from "@azure/ai-text-analytics";

const client = new TextAnalyticsClient(
  "https://<resource-name>.cognitiveservices.azure.com/",
  new AzureKeyCredential(AZURE_API_KEY)
);

// Extract medical entities
const entities = await client.recognizeEntities(
  "Patient John Smith has HbA1c of 7.8% and glucose of 145 mg/dL"
);

// Output:
// { text: "John Smith", category: "Person" }
// { text: "HbA1c", category: "HealthCondition" }
// { text: "7.8%", category: "Quantity" }

// 2. Azure Vision (Image Analysis)
// • OCR: Extract text from lab reports (images)
// • Image classification: Categorize X-rays
// • Object detection: Find abnormalities

// 3. Azure Search (Vector Search)
// • Semantic search: Find similar lab results
// • "Patients with similar profiles to John"
// • Uses embeddings (vector representations)

// 4. OpenAI Integration via Azure
// • Azure OpenAI Service: GPT-4 + safety features
// • Responsible AI monitoring built-in
// • HIPAA compliance
// • Higher security than public OpenAI

const azureOpenAI = new OpenAIClient(
  "https://<resource-name>.openai.azure.com/",
  new AzureKeyCredential(AZURE_API_KEY)
);

const completion = await azureOpenAI.getChatCompletions(
  "deployment-name",
  [
    {
      role: "system",
      content: "You are a clinical AI assistant. Analyze lab results.",
    },
    {
      role: "user",
      content: labResults,
    },
  ]
);
```

### Fairness & Bias Detection

```typescript
// EJERCICIO: Detecting Bias in AI Models

// Healthcare context: Does AI diagnose differently based on patient demographics?

interface PatientGroup {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

const performanceByDemographic: PatientGroup[] = [
  { name: "Male", accuracy: 0.92, precision: 0.90, recall: 0.94, f1Score: 0.92 },
  { name: "Female", accuracy: 0.88, precision: 0.86, recall: 0.90, f1Score: 0.88 },
  { name: "Age <50", accuracy: 0.94, precision: 0.93, recall: 0.95, f1Score: 0.94 },
  { name: "Age 50+", accuracy: 0.85, precision: 0.82, recall: 0.88, f1Score: 0.85 },
];

// Calculate fairness metrics
function detectBias(groups: PatientGroup[]) {
  const accuracies = groups.map(g => g.accuracy);
  const maxAccuracy = Math.max(...accuracies);
  const minAccuracy = Math.min(...accuracies);

  const disparity = maxAccuracy - minAccuracy;

  return {
    disparityPercentage: (disparity * 100).toFixed(1),
    isBiased: disparity > 0.05, // >5% difference = potential bias
    recommendation:
      disparity > 0.05
        ? "Model shows demographic bias. Consider retraining or adjusting decision thresholds."
        : "No significant demographic bias detected.",
  };
}

// Output:
// {
//   disparityPercentage: "9.0",
//   isBiased: true,
//   recommendation: "Model shows demographic bias..."
// }

// Mitigation strategies:
// 1. Retrain with balanced dataset
// 2. Use threshold tuning per demographic
// 3. Add fairness constraints during training
// 4. Monitor ongoing performance per group
```

### Prompt Engineering for Responsible AI

```typescript
// EJERCICIO: Writing Safe, Responsible Prompts

// BAD: Uncontrolled, biased prompt
const badPrompt = `Analyze these lab results and tell me what disease the patient has`;

// PROBLEMS:
// • Doesn't acknowledge uncertainty
// • May overstate confidence
// • No disclaimer
// • Could provide incorrect diagnosis

// GOOD: Responsible prompt engineering
const goodPrompt = `
You are a clinical decision support AI assistant. Your role is to help doctors
interpret lab results, NOT to diagnose.

CRITICAL INSTRUCTIONS:
1. Always use probabilistic language ("may suggest", "could indicate")
2. NEVER provide definitive diagnoses
3. Always recommend physician verification
4. Flag any values requiring immediate attention
5. Acknowledge limitations in AI analysis
6. Suggest relevant follow-up tests
7. Never comment on treatments or medications

ANALYSIS REQUEST:
Analyze these lab results and provide clinical insights:
[lab results here]

Format your response as:
- Summary of findings
- Potential clinical significance
- Recommended follow-up
- Important limitations
`;

// Healthcare principle:
// Doctor is responsible for clinical decisions.
// AI is a tool to augment, not replace, human judgment.

// Example responsible output:
const example = `
SUMMARY: Elevated fasting glucose and HbA1c suggest possible glycemic dysregulation.

CLINICAL SIGNIFICANCE: This pattern may indicate impaired glucose metabolism,
possibly consistent with prediabetes or diabetes. However, AI analysis is not
diagnostic.

FOLLOW-UP: Consider:
• Fasting glucose recheck
• Oral glucose tolerance test (OGTT)
• Consultation with endocrinology

LIMITATIONS: This analysis is AI-generated based on lab values alone.
Clinical context (symptoms, medications, family history) is critical and
not included in this analysis. A qualified physician must interpret these
results in the full clinical context.
`;
```

---

## 6. Mobile App Deployment Pipeline

### Build Pipeline for Healthcare

```
┌─────────────────────────────────────────────────────────┐
│  Deployment Pipeline: Development → Production          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PHASE 1: Local Development                            │
│  ├─ npm install, npm run dev                           │
│  ├─ Test on local simulator                            │
│  └─ eas build --platform ios --profile development    │
│                                                         │
│  PHASE 2: Internal Testing (QA)                        │
│  ├─ eas build --platform ios --profile preview       │
│  ├─ eas build --platform android --profile preview   │
│  ├─ Distribute via EAS internal build                 │
│  ├─ Team tests on real devices                        │
│  ├─ HIPAA compliance audit                            │
│  └─ Security review                                   │
│                                                         │
│  PHASE 3: Beta (TestFlight/Play Store)                │
│  ├─ eas build --platform ios --profile production    │
│  ├─ eas build --platform android --profile production │
│  ├─ eas submit --platform ios                        │
│  ├─ eas submit --platform android (internal track)   │
│  ├─ Limited user testing (100-1000 users)            │
│  └─ Crash monitoring (Sentry)                        │
│                                                         │
│  PHASE 4: Production Release                          │
│  ├─ App Store review (iOS): 24-48 hours              │
│  ├─ Play Store review (Android): 2-4 hours           │
│  ├─ Version control: semantic versioning             │
│  ├─ Release notes published                          │
│  └─ Monitor crash reports, analytics                 │
│                                                         │
│  PHASE 5: Post-Release                                │
│  ├─ Real user monitoring                             │
│  ├─ Collect feedback                                 │
│  ├─ Plan next release (v1.0.1, v1.1.0)             │
│  └─ Security patches as needed                       │
└─────────────────────────────────────────────────────────┘
```

### Configuration Profiles

```json
{
  "eas": {
    "build": {
      "development": {
        "developmentClient": true,
        "distribution": "internal"
      },
      "preview": {
        "distribution": "internal"
      },
      "production": {
        "distribution": "store"
      }
    }
  }
}
```

### Environment Management

```typescript
// Different configs for different environments

// .env.development
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_LOG_LEVEL=debug
EXPO_PUBLIC_SENTRY_ENABLED=false

// .env.production
EXPO_PUBLIC_API_URL=https://api.clinical-app.example.com
EXPO_PUBLIC_LOG_LEVEL=error
EXPO_PUBLIC_SENTRY_ENABLED=true
EXPO_PUBLIC_SENTRY_DSN=https://...
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
EXPO_PUBLIC_AZURE_API_KEY=...

// Usage in code:
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const isSentryEnabled = process.env.EXPO_PUBLIC_SENTRY_ENABLED === 'true';
```

### Version Management for Healthcare

```typescript
// Healthcare apps require careful versioning

// app.json version strategy
{
  "expo": {
    "version": "1.0.0", // Semantic: MAJOR.MINOR.PATCH
    "ios": {
      "buildNumber": "2024001" // YYYYDDD (year + day of year)
    },
    "android": {
      "versionCode": 2024001
    }
  }
}

// Version semantics for healthcare:
// 1.0.0 - Initial release (FDA cleared for specific use)
// 1.0.1 - Security patch (HIPAA related, distributed immediately)
// 1.1.0 - New feature release (requires new FDA clearance)
// 2.0.0 - Major refactor (full validation required)

// Release process:
// 1. Bump version in app.json
// 2. Run full test suite
// 3. Update CHANGELOG.md
// 4. Git commit + tag
// 5. Build on EAS
// 6. Submit to app stores
// 7. Monitor crash reports for first 48h
```

---

## 7. Healthcare-Specific Architecture Patterns

### HIPAA-Compliant Data Flow

```
┌────────────────────────────────────────────────────────────┐
│  Compliant Data Flow for Healthcare Apps                  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  USER INPUT                                               │
│  ├─ Enters patient info (name, MRN, lab results)         │
│  ├─ Local validation (required fields)                   │
│  └─ Does NOT transmit yet                                │
│                                                            │
│  LOCAL STORAGE (Encrypted)                               │
│  ├─ AsyncStorage with AES-256 encryption                │
│  ├─ SQLite for structured data (queries)                │
│  └─ Device biometric auth (Face ID, fingerprint)         │
│                                                            │
│  API TRANSMISSION (TLS 1.3)                              │
│  ├─ Only encrypted data sent                            │
│  ├─ Mutually authenticated (cert pinning)               │
│  ├─ Rate limiting (prevent brute force)                 │
│  └─ Request signing (prevent tampering)                 │
│                                                            │
│  SERVER PROCESSING                                       │
│  ├─ Decrypt with hardware keys (HSM)                    │
│  ├─ Access controls (role-based)                        │
│  ├─ Audit logging (who, what, when, where)             │
│  └─ Tokenize sensitive data (PII removal)              │
│                                                            │
│  AI/ANALYTICS (De-identified)                           │
│  ├─ Remove PII before AI processing                     │
│  ├─ Use only necessary data                             │
│  ├─ No storing of PHI in logs                          │
│  └─ Separate training data (never patient data)        │
│                                                            │
│  DATA RETENTION                                          │
│  ├─ Retain per policy (usually 6-10 years)            │
│  ├─ Secure deletion (cryptographic erasure)            │
│  ├─ Right to deletion honored within 30 days           │
│  └─ Audit trail of deletions                           │
└────────────────────────────────────────────────────────────┘
```

### Error Handling for Production

```typescript
// EJERCICIO: Production-grade error handling for healthcare

// src/lib/errors.ts
export class HealthcareError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'info' | 'warning' | 'error' | 'critical',
    public userMessage: string
  ) {
    super(message);
  }
}

// Categorized errors
export const Errors = {
  // Network errors
  NetworkOffline: new HealthcareError(
    'No internet connection',
    'NETWORK_OFFLINE',
    'warning',
    'Your app is offline. Cached data is available. Changes will sync when WiFi returns.'
  ),

  // API errors
  ApiUnauthorized: new HealthcareError(
    'Authentication failed',
    'API_UNAUTHORIZED',
    'error',
    'Session expired. Please log in again.'
  ),

  // Clinical data errors
  InvalidLabResult: new HealthcareError(
    'Lab result validation failed',
    'INVALID_LAB_RESULT',
    'error',
    'Lab value is outside acceptable range.'
  ),

  // AI service errors
  AIServiceUnavailable: new HealthcareError(
    'AI service temporarily unavailable',
    'AI_SERVICE_UNAVAILABLE',
    'critical',
    'AI analysis is temporarily unavailable. Please try again in a moment.'
  ),

  // Critical healthcare errors
  DataLossRisk: new HealthcareError(
    'Potential data loss detected',
    'DATA_LOSS_RISK',
    'critical',
    'Critical error: Data may be at risk. Contact support immediately.'
  ),
};

// Error boundaries for React
export function ClinicalErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        if (error instanceof HealthcareError && error.severity === 'critical') {
          // Critical healthcare error → notify support
          captureException(error, { context: errorInfo });
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### Monitoring & Observability

```typescript
// EJERCICIO: Healthcare app monitoring

// src/lib/monitoring.ts
export class HealthcareMonitoring {
  // Track clinical workflows
  logClinicalAction(action: string, patientId: string, metadata?: any) {
    console.log(`[CLINICAL] ${action} - Patient: ${patientId}`, metadata);
    // Send to analytics (de-identified)
  }

  // Track AI decisions
  logAIDecision(
    labValues: string[],
    aiResponse: string,
    confidence: number
  ) {
    console.log(`[AI_DECISION] Confidence: ${confidence}%`);
    // Never log actual patient data—only metrics
  }

  // Track data access (HIPAA audit log)
  logDataAccess(userId: string, resourceType: string, action: 'read' | 'write' | 'delete') {
    console.log(`[AUDIT] ${userId} ${action} ${resourceType}`);
    // HIPAA requires logging all PHI access
  }

  // Track errors by severity
  logError(error: Error, severity: 'low' | 'high' | 'critical') {
    if (severity === 'critical') {
      // Page on-call team
      notifyOncall(error);
    }
    Sentry.captureException(error);
  }
}
```

---

## Summary: Key Patterns for Healthcare

| Concept | Pattern | Why It Matters |
|---------|---------|----------------|
| **React Native** | Bridge architecture, native components | Direct access to device sensors, 60 FPS critical for medical UX |
| **Expo** | Managed workflow, OTA updates | Fast development, instant security patches |
| **Offline-First** | TanStack Query + AsyncStorage | Hospitals have dead zones, app must work everywhere |
| **Streaming AI** | Chunked responses, progressive updates | Doctors perceive instant feedback |
| **Responsible AI** | Fairness, transparency, accountability | FDA compliance, patient safety |
| **Compliance** | HIPAA audit logs, encryption, de-identification | Legal requirement, patient privacy |
| **Deployment** | Semantic versioning, staged rollout | Each release may affect patient care |

**Principle:** In healthcare, technology is not just convenient—it's life-critical. Architecture decisions ripple through clinical workflows.
