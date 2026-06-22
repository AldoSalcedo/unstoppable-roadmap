# 🎓 Guía de Conceptos Avanzados - TypeScript para Aldo

**Nivel:** Intermedio-Avanzado (3+ años de experiencia)  
**Objetivo:** Explicar los conceptos específicos del proyecto Task Manager que pueden ser nuevos

---

## 📖 Índice Rápido

1. [Result<T, E> Pattern](#result-pattern)
2. [Maybe<T> Pattern](#maybe-pattern)
3. [Entity<T> Pattern](#entity-pattern)
4. [Discriminated Unions Avanzados](#discriminated-unions)
5. [Generic Constraints](#generic-constraints)
6. [De JavaScript a TypeScript Avanzado](#javascript-to-typescript)

---

## 1️⃣ Result<T, E> Pattern {#result-pattern}

### 🤔 ¿Qué es y por qué existe?

**En JavaScript/React que ya conoces:**
```javascript
// Forma tradicional con try-catch
function dividir(a, b) {
  try {
    if (b === 0) {
      throw new Error('División por cero');
    }
    return a / b;
  } catch (error) {
    console.error(error);
    return null; // 😕 Podría ser un resultado válido
  }
}

const resultado = dividir(10, 0);
// ¿resultado es null por error o porque es válido? No sabemos sin verificar
```

**Problema:** 
- `null` y `undefined` son ambiguos
- `try-catch` rompe el flujo del código
- No es "type-safe" - TypeScript no puede ayudarte

**Con Result<T, E>:**
```typescript
type Result<T, E> =
  | { ok: true; value: T }    // Éxito: contiene el valor
  | { ok: false; error: E };  // Error: contiene el error

function dividir(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { ok: false, error: 'División por cero' };
  }
  return { ok: true, value: a / b };
}

const resultado = dividir(10, 0);

// TypeScript OBLIGA a verificar el resultado
if (resultado.ok) {
  console.log(resultado.value); // TypeScript sabe que value existe aquí
} else {
  console.log(resultado.error); // TypeScript sabe que error existe aquí
}
```

### 🎯 Ventajas para ti como desarrollador React/Vue:

1. **Type Safety Total:**
```typescript
// ❌ Esto NO compila - TypeScript te protege
const resultado = dividir(10, 2);
console.log(resultado.value); // Error: Primero verifica .ok

// ✅ Esto SÍ compila
if (resultado.ok) {
  console.log(resultado.value); // Safe!
}
```

2. **Código más limpio que try-catch:**
```typescript
// En lugar de:
try {
  const user = await fetchUser();
  try {
    const posts = await fetchPosts(user.id);
    // ...nested try-catch hell
  } catch (e) { }
} catch (e) { }

// Usas:
const userResult = await fetchUser();
if (!userResult.ok) return userResult; // Early return con error

const postsResult = await fetchPosts(userResult.value.id);
if (!postsResult.ok) return postsResult;

// Código feliz aquí con datos válidos
```

3. **Composable (como Redux patterns que ya conoces):**
```typescript
// Similar a como Redux tiene actions que pueden fallar
const loginResult = await login(email, password);

if (loginResult.ok) {
  dispatch(setUser(loginResult.value));
  navigate('/dashboard');
} else {
  showError(loginResult.error);
}
```

### 💼 Caso Real en tu Trabajo (Sekura-aer):

```typescript
// Antes (JavaScript):
async function fetchPolicyData(policyId) {
  try {
    const response = await axios.get(`/api/policies/${policyId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null; // 😕 ¿null es error o política no encontrada?
  }
}

// Con Result<T, E>:
async function fetchPolicyData(
  policyId: string
): Promise<Result<Policy, string>> {
  try {
    const response = await axios.get(`/api/policies/${policyId}`);
    return { ok: true, value: response.data };
  } catch (error) {
    return { 
      ok: false, 
      error: error.response?.data?.message || 'Error al cargar póliza'
    };
  }
}

// Uso en componente React:
const PolicyDetails = ({ policyId }) => {
  const [data, setData] = useState<Result<Policy, string> | null>(null);

  useEffect(() => {
    fetchPolicyData(policyId).then(setData);
  }, [policyId]);

  if (!data) return <Loading />;
  
  if (!data.ok) {
    return <ErrorAlert message={data.error} />; // Type-safe!
  }

  return <PolicyCard policy={data.value} />; // Type-safe!
};
```

---

## 2️⃣ Maybe<T> Pattern {#maybe-pattern}

### 🤔 ¿Qué problema resuelve?

**En tu código actual (JavaScript/TypeScript básico):**
```typescript
function findUser(id: string): User | undefined {
  return users.find(u => u.id === id);
}

const user = findUser('123');
// Tienes que recordar verificar undefined
if (user) {
  console.log(user.name);
}
```

**Con Maybe<T>:**
```typescript
type Maybe<T> = 
  | { type: 'some'; value: T }
  | { type: 'none' };

function findUser(id: string): Maybe<User> {
  const user = users.find(u => u.id === id);
  if (user) {
    return { type: 'some', value: user };
  }
  return { type: 'none' };
}

const userMaybe = findUser('123');

// TypeScript OBLIGA a verificar
if (userMaybe.type === 'some') {
  console.log(userMaybe.value.name); // Type-safe!
}
```

### 🎯 ¿Cuándo usar Maybe vs undefined?

**Usa `undefined` cuando:**
- Props opcionales en React
- Parámetros opcionales
- Estado inicial

**Usa `Maybe<T>` cuando:**
- Búsquedas que pueden fallar
- APIs donde "no encontrado" es un estado importante
- Quieres forzar manejo explícito

### 💼 Ejemplo Real (tu trabajo en All-Iser):

```typescript
// Sistema de inventario de muestras
type Sample = {
  id: string;
  labId: string;
  status: 'pending' | 'processed';
};

// Antes:
function getSample(id: string): Sample | undefined {
  return inventory.find(s => s.id === id);
}

// Problema en React:
const SampleDetails = ({ sampleId }) => {
  const sample = getSample(sampleId);
  // Fácil olvidar verificar undefined
  return <div>{sample.status}</div>; // 💥 Runtime error!
};

// Con Maybe<T>:
function getSample(id: string): Maybe<Sample> {
  const sample = inventory.find(s => s.id === id);
  return sample 
    ? { type: 'some', value: sample }
    : { type: 'none' };
}

// En React:
const SampleDetails = ({ sampleId }) => {
  const sampleMaybe = getSample(sampleId);
  
  if (sampleMaybe.type === 'none') {
    return <NotFound message="Muestra no encontrada" />;
  }
  
  // TypeScript SABE que value existe aquí
  return <div>{sampleMaybe.value.status}</div>; // ✅ Type-safe!
};
```

---

## 3️⃣ Entity<T> Pattern {#entity-pattern}

### 🤔 ¿Por qué existe?

**Problema que ya has enfrentado:**

```typescript
// Defines User
type User = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

// Defines Task
type Task = {
  id: string;
  title: string;
  assigneeId: string;
  createdAt: Date;
  updatedAt: Date;
};

// Defines Comment
type Comment = {
  id: string;
  content: string;
  authorId: string;
  createdAt: Date;  // Repetido!
  updatedAt: Date;  // Repetido!
};
```

**Notas:**
- `id`, `createdAt`, `updatedAt` se repiten en TODOS
- Si cambias Date a string, tienes que cambiar en todos lados
- No hay garantía de que todas las entidades tengan estos campos

**Solución con Entity<T>:**

```typescript
// Define el patrón UNA vez
type Entity<T> = T & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

// Ahora defines solo lo único de cada tipo
type UserBase = {
  name: string;
  email: string;
};

type TaskBase = {
  title: string;
  assigneeId: string;
};

type CommentBase = {
  content: string;
  authorId: string;
};

// Y los conviertes en Entities
type User = Entity<UserBase>;
type Task = Entity<TaskBase>;
type Comment = Entity<CommentBase>;

// User ahora automáticamente tiene: id, name, email, createdAt, updatedAt
// Task ahora automáticamente tiene: id, title, assigneeId, createdAt, updatedAt
```

### 🎯 Ventajas reales:

**1. DRY (Don't Repeat Yourself):**
```typescript
// Si decides que todas las entidades necesitan deletedAt:
type Entity<T> = T & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;  // ¡Agregado en UN solo lugar!
};

// TODAS las entidades ahora tienen deletedAt automáticamente
```

**2. Type-safe helpers que funcionan con TODAS las entidades:**
```typescript
// Esta función funciona con User, Task, Comment, o CUALQUIER Entity
function isRecent<T>(entity: Entity<T>): boolean {
  const dayAgo = new Date();
  dayAgo.setDate(dayAgo.getDate() - 1);
  return entity.createdAt > dayAgo;
}

const user: User = { /* ... */ };
const task: Task = { /* ... */ };

isRecent(user); // ✅ Funciona
isRecent(task); // ✅ Funciona
```

**3. Garantías en compile-time:**
```typescript
// TypeScript GARANTIZA que toda Entity tiene estos campos
function saveEntity<T>(entity: Entity<T>) {
  // SIEMPRE puedes acceder a estos campos sin verificar
  console.log(entity.id);
  console.log(entity.createdAt);
  console.log(entity.updatedAt);
}
```

### 💼 Aplicación Real (tu experiencia con MongoDB):

```typescript
// MongoDB típicamente tiene _id, createdAt, updatedAt en todo
// Entity<T> modela esto perfectamente

// Base de datos MongoDB schema
type MongoEntity<T> = T & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

type PolicyBase = {
  policyNumber: string;
  clientId: string;
  premium: number;
};

type Policy = MongoEntity<PolicyBase>;

// Ahora en tu API (con Express que ya conoces):
app.post('/api/policies', async (req, res) => {
  const policyBase: PolicyBase = req.body;
  
  // MongoDB agregará automáticamente _id, timestamps
  const policy: Policy = {
    ...policyBase,
    _id: new ObjectId().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  await db.policies.insertOne(policy);
  res.json(policy); // Type-safe!
});
```

---

## 4️⃣ Discriminated Unions Avanzados {#discriminated-unions}

### 🤔 Lo básico ya lo conoces:

```typescript
// Union type simple (ya lo dominas):
type Status = 'active' | 'inactive' | 'pending';
```

### 🚀 Pero ¿qué pasa cuando cada variante tiene datos diferentes?

**Caso Real - Estado de Tarea:**

```typescript
// ❌ Forma incorrecta (todos los campos opcionales):
type Task = {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'completed';
  startedAt?: Date;      // Solo relevante si in_progress
  progress?: number;     // Solo relevante si in_progress
  completedAt?: Date;    // Solo relevante si completed
  completedBy?: string;  // Solo relevante si completed
};

// Problema: TypeScript no puede ayudarte
const task: Task = {
  id: '1',
  title: 'Fix bug',
  status: 'todo',
  completedAt: new Date(), // 💥 Esto no tiene sentido pero compila!
};
```

**✅ Forma correcta (Discriminated Union):**

```typescript
type TaskStatus =
  | { type: 'TODO' }
  | { 
      type: 'IN_PROGRESS'; 
      startedAt: Date;
      progress: number;
    }
  | { 
      type: 'COMPLETED'; 
      completedAt: Date;
      completedBy: string;
    };

type Task = {
  id: string;
  title: string;
  status: TaskStatus;  // Cada status tiene sus propios campos
};

// Ahora TypeScript te protege:
const task: Task = {
  id: '1',
  title: 'Fix bug',
  status: { 
    type: 'TODO',
    completedAt: new Date() // ❌ Error! TODO no tiene completedAt
  }
};

// Y te ayuda cuando procesas:
function processTask(task: Task) {
  switch (task.status.type) {
    case 'TODO':
      // task.status.progress  ❌ Error! TODO no tiene progress
      break;
      
    case 'IN_PROGRESS':
      // ✅ Aquí TypeScript SABE que status tiene progress
      console.log(`Progress: ${task.status.progress}%`);
      break;
      
    case 'COMPLETED':
      // ✅ Aquí TypeScript SABE que status tiene completedBy
      console.log(`Completed by: ${task.status.completedBy}`);
      break;
  }
}
```

### 🎯 Power Move: Exhaustive Checking

```typescript
function processTask(task: Task): string {
  switch (task.status.type) {
    case 'TODO':
      return 'Not started';
      
    case 'IN_PROGRESS':
      return `${task.status.progress}% done`;
      
    case 'COMPLETED':
      return 'Done!';
      
    default:
      // Si agregas nuevo status y olvidas manejarlo aquí,
      // TypeScript te dará error:
      const exhaustiveCheck: never = task.status;
      throw new Error(`Unhandled status: ${exhaustiveCheck}`);
  }
}
```

### 💼 Aplicación Real en Sekura-aer:

```typescript
// Estados de póliza con datos específicos por estado
type PolicyState =
  | { 
      status: 'DRAFT'; 
      draftSavedAt: Date;
      lastEditedBy: string;
    }
  | { 
      status: 'ACTIVE'; 
      activatedAt: Date;
      policyNumber: string;
      premium: number;
    }
  | { 
      status: 'CANCELLED'; 
      cancelledAt: Date;
      cancelledBy: string;
      reason: string;
    }
  | { 
      status: 'EXPIRED'; 
      expiredAt: Date;
    };

type Policy = {
  id: string;
  clientId: string;
  state: PolicyState;
};

// Componente React que renderiza diferente según estado
const PolicyCard = ({ policy }: { policy: Policy }) => {
  switch (policy.state.status) {
    case 'DRAFT':
      return (
        <Card>
          <Badge color="gray">Borrador</Badge>
          <Text>Último guardado: {policy.state.draftSavedAt}</Text>
          <Button>Continuar editando</Button>
        </Card>
      );
      
    case 'ACTIVE':
      return (
        <Card>
          <Badge color="green">Activa</Badge>
          <Text>Póliza: {policy.state.policyNumber}</Text>
          <Text>Prima: ${policy.state.premium}</Text>
          <Button>Ver detalles</Button>
        </Card>
      );
      
    case 'CANCELLED':
      return (
        <Card>
          <Badge color="red">Cancelada</Badge>
          <Text>Motivo: {policy.state.reason}</Text>
          <Text>Por: {policy.state.cancelledBy}</Text>
        </Card>
      );
      
    case 'EXPIRED':
      return (
        <Card>
          <Badge color="orange">Expirada</Badge>
          <Text>Expiró: {policy.state.expiredAt}</Text>
          <Button>Renovar</Button>
        </Card>
      );
  }
};
```

---

## 5️⃣ Generic Constraints {#generic-constraints}

### 🤔 Generics básicos ya los entiendes:

```typescript
// Generic simple: T puede ser CUALQUIER cosa
function identity<T>(value: T): T {
  return value;
}

identity(5);        // T es number
identity('hello');  // T es string
identity({ x: 1 }); // T es { x: number }
```

### 🚀 Pero ¿qué pasa cuando T debe cumplir requisitos?

**Problema sin constraints:**

```typescript
// Quieres una función que obtenga el ID de cualquier entidad
function getId<T>(entity: T): string {
  return entity.id; // ❌ Error: T no garantiza tener 'id'
}
```

**Solución con constraints:**

```typescript
// Constraint: T DEBE tener al menos un campo 'id' de tipo string
function getId<T extends { id: string }>(entity: T): string {
  return entity.id; // ✅ Ahora funciona!
}

// Funciona con cualquier objeto que tenga id:
getId({ id: '1', name: 'John' });     // ✅
getId({ id: '2', email: 'a@b.com' }); // ✅
getId({ name: 'John' });              // ❌ Error: falta 'id'
```

### 🎯 Power Move: Constraints con Entity<T>

```typescript
// Todas tus entidades tienen Entity<T>
type Entity<T> = T & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

// Ahora puedes hacer funciones que SOLO aceptan Entities:
function getCreatedDate<T>(entity: Entity<T>): Date {
  return entity.createdAt; // ✅ Garantizado que existe!
}

// Funciona con CUALQUIER Entity:
const user: Entity<{ name: string }> = { /* ... */ };
const task: Entity<{ title: string }> = { /* ... */ };

getCreatedDate(user); // ✅
getCreatedDate(task); // ✅
getCreatedDate({ id: '1' }); // ❌ Error: no es Entity completo
```

### 💼 Aplicación Real - Repository Pattern:

```typescript
// Repository que funciona con CUALQUIER Entity
interface Repository<T extends Entity<unknown>> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Implementación genérica:
class InMemoryRepository<T extends Entity<unknown>> 
  implements Repository<T> {
  
  private items = new Map<string, T>();

  async findById(id: string): Promise<T | null> {
    return this.items.get(id) || null;
  }

  async create(
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<T> {
    const now = new Date();
    const item = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as T;
    
    this.items.set(item.id, item);
    return item;
  }

  // ... otros métodos
}

// Uso con diferentes entidades:
type User = Entity<{ name: string; email: string }>;
type Task = Entity<{ title: string; status: string }>;

const userRepo = new InMemoryRepository<User>();
const taskRepo = new InMemoryRepository<Task>();

// Ambos funcionan igual, pero son type-safe:
const user = await userRepo.create({ 
  name: 'John', 
  email: 'john@example.com' 
});

const task = await taskRepo.create({ 
  title: 'Fix bug', 
  status: 'todo' 
});
```

---

## 6️⃣ De JavaScript a TypeScript Avanzado {#javascript-to-typescript}

### 🎯 Traducción de patrones que YA conoces:

#### **React State con TypeScript:**

```typescript
// JavaScript (tu código actual):
const [user, setUser] = useState(null);

// TypeScript básico:
const [user, setUser] = useState<User | null>(null);

// TypeScript avanzado con Result:
type UserState = Result<User, string>;
const [userState, setUserState] = useState<UserState | null>(null);

// Uso:
if (userState && userState.ok) {
  return <Profile user={userState.value} />;
}
```

#### **Redux con TypeScript avanzado:**

```typescript
// Redux actions con discriminated unions
type Action =
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' };

// Reducer type-safe:
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      // TypeScript SABE que payload es User aquí
      return { ...state, user: action.payload };
      
    case 'LOGIN_ERROR':
      // TypeScript SABE que payload es string aquí
      return { ...state, error: action.payload };
      
    case 'LOGOUT':
      // TypeScript SABE que no hay payload aquí
      return { ...state, user: null };
  }
}
```

#### **API calls con Result pattern:**

```typescript
// Axios wrapper con Result:
async function apiCall<T>(
  url: string
): Promise<Result<T, string>> {
  try {
    const response = await axios.get<T>(url);
    return { ok: true, value: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { 
        ok: false, 
        error: error.response?.data?.message || error.message 
      };
    }
    return { ok: false, error: 'Unknown error' };
  }
}

// Uso en React:
const UserProfile = ({ userId }: { userId: string }) => {
  const [state, setState] = useState<Result<User, string> | null>(null);

  useEffect(() => {
    apiCall<User>(`/api/users/${userId}`).then(setState);
  }, [userId]);

  if (!state) return <Loading />;
  if (!state.ok) return <Error message={state.error} />;
  
  return <Profile user={state.value} />;
};
```

---

## 📝 RESUMEN PARA ALDO:

### ✅ Lo que YA dominas:
- Types e interfaces
- Union types simples
- Optional properties
- Funciones tipadas
- Type narrowing básico con `typeof`

### 🚀 Lo NUEVO en el proyecto:
- **Result<T, E>**: Manejo de errores type-safe (mejor que try-catch)
- **Maybe<T>**: Valores opcionales explícitos (mejor que undefined)
- **Entity<T>**: DRY para entidades con campos comunes
- **Discriminated Unions complejos**: Cada variante con sus propios datos
- **Generic Constraints**: `T extends X` para garantizar propiedades

### 🎯 Cómo aplicarlos en tu trabajo diario:

1. **Result<T, E>** → Reemplaza try-catch en llamadas API
2. **Maybe<T>** → Búsquedas en arrays/bases de datos
3. **Entity<T>** → Modelos de MongoDB/PostgreSQL
4. **Discriminated Unions** → Estados de pólizas, tareas, o flujos
5. **Generic Constraints** → Funciones reutilizables con garantías

---

## 🎓 Próximos Pasos:

1. ✅ Lee esta guía completa (30 min)
2. ✅ Vuelve al código del proyecto con esta nueva comprensión
3. ✅ Experimenta en TypeScript Playground con cada concepto
4. ✅ Continúa con el Día 1 del sprint normalmente

---

¿Preguntas sobre algún concepto específico? Escríbelas aquí:
- 
