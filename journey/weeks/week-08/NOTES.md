# Week 8 Live Notes — React Native & AI Integration

*Escribe aquí las ideas, patrones, y preguntas que surgen mientras desarrollas con Expo, TanStack Query, y OpenAI. No tiene que estar pulido.*

---

## Day 1 — Expo & React Native Setup

**Concepto**: Expo es el framework más rápido para React Native. iOS + Android desde un código base.

```typescript
// app.json (Expo config)
{
  "expo": {
    "name": "MyApp",
    "slug": "myapp",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "ios": {
      "bundleIdentifier": "com.example.myapp"
    },
    "android": {
      "package": "com.example.myapp"
    }
  }
}

// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**Patrón observado**: Expo handles deployment to App Stores. Un comando = deploy.

**Pregunta que surgió**: ¿Expo vs React Native CLI? Respuesta: Expo para mayoría de apps. CLI si necesitas native code.

---

## Day 2 — Native Component Patterns

**Concepto**: React Native components mapean a controles nativos (UIView en iOS, View en Android).

```typescript
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
} from 'react-native';

// Basic layout
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

export function UserList({ users }: { users: User[] }) {
  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigate('Details', { id: item.id })}>
            <Text style={styles.text}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
```

**Patrón**: FlatList para listas (optimizado). No ScrollView.

---

## Day 3 — TanStack Query (React Query) para datos

**Concepto**: TanStack Query maneja caching, fetching, sincronización de datos.

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const queryClient = new QueryClient();

// Fetching
const { data: users, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: async () => {
    const res = await axios.get('/api/users');
    return res.data;
  },
  staleTime: 1000 * 60 * 5, // 5 minutos
});

// Mutation (POST/PUT/DELETE)
const createUserMutation = useMutation({
  mutationFn: async (name: string) => {
    const res = await axios.post('/api/users', { name });
    return res.data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});

// Usage
export function CreateUserForm() {
  const [name, setName] = useState('');

  return (
    <View>
      <TextInput value={name} onChangeText={setName} />
      <TouchableOpacity
        onPress={() => createUserMutation.mutate(name)}
        disabled={createUserMutation.isPending}
      >
        <Text>{createUserMutation.isPending ? 'Creating...' : 'Create'}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

**Patrón**: TanStack Query maneja loading, error, caching automáticamente.

---

## Day 4 — AI Integration with OpenAI API

**Concepto**: OpenAI API para generative AI. Chat completions, embeddings, etc.

```typescript
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Server Action: generar respuesta con AI
'use server';

export async function generateAIResponse(userMessage: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

// Client Component: chat interface
'use client';

export function AIChat() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    setMessages(prev => [...prev, { role: 'user', content: input }]);

    const response = await generateAIResponse(input);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
  };

  return (
    <View>
      {/* Chat messages */}
      <TextInput value={input} onChangeText={setInput} />
      <TouchableOpacity onPress={handleSend}>
        <Text>Send</Text>
      </TouchableOpacity>
    </View>
  );
}
```

**Patrón**: Call OpenAI en Server Action (seguro, sin exponer API key).

---

## Day 5 — Mobile-Specific Optimizations

**Concepto**: Mobile ≠ Web. Performance, networking, power, storage son diferentes.

```typescript
// Offline support con AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const useOfflinePersist = (key: string) => {
  const cache = useQuery({
    queryKey: [key],
    queryFn: async () => {
      const cached = await AsyncStorage.getItem(key);
      if (cached) return JSON.parse(cached);

      const fresh = await fetchFromAPI(key);
      await AsyncStorage.setItem(key, JSON.stringify(fresh));
      return fresh;
    },
  });

  return cache;
};

// Image caching
import FastImage from 'react-native-fast-image';

export function OptimizedImage({ uri }: { uri: string }) {
  return (
    <FastImage
      source={{ uri, priority: FastImage.priority.normal }}
      style={{ width: 200, height: 200 }}
    />
  );
}

// Reduce animations en low battery
import { useWindowDimensions } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

export function AnimatedComponent() {
  const reducedMotion = useReducedMotion();

  return reducedMotion ? (
    <View>{/* static */}</View>
  ) : (
    <Animated.View>{/* animated */}</Animated.View>
  );
}
```

**Patrón**: Offline-first architecture. Cache local, sync cuando hay conexión.

---

## Patrones descubiertos

**Pattern 1: Navigation State Management**
React Navigation maneja la pila. Navigation stack ≠ web history.

**Pattern 2: Reusable Component Library**
Componentes móviles reutilizables (botones, inputs, cards).

**Pattern 3: API-Driven Architecture**
Mobile + Web comparten API. Una source of truth.

---

## Conexión con background

**De Auditoría**: Mobile tiene más surface area para security (local storage, offline). Audita permisos.

**De QBP**: Mobile app lifecycle ≠ web. Usuarios pueden no tener conexión.

**De Ventas**: Mobile == growth. Donde están los usuarios ahora.

---

## Notas Adicionales

- Expo = fastest path to shipped app
- TanStack Query = manage API state (web + mobile)
- OpenAI = generative AI es commodity ahora
- Offline-first = better UX en mercados emergentes

---

**Última entrada**: 2026-05-21
**Próxima sesión**: 2026-05-22
