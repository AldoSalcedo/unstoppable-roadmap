# 📚 Recursos Completos - TypeScript Avanzado Semana 1

## 🎯 Recursos por Día

### DÍA 1: Generics Básicos

#### Documentación Oficial
- [TypeScript Handbook - Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [TypeScript Handbook - Basic Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript Deep Dive - Generics](https://basarat.gitbook.io/typescript/type-system/generics)

#### Videos
- [Matt Pocock - Generics for Beginners](https://www.youtube.com/watch?v=EcCTIExsqmI)
- [Jack Herrington - TypeScript Generics](https://www.youtube.com/watch?v=nViEqpgwxHE)

#### Artículos
- [Understanding Generics in TypeScript](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [When to Use Generics](https://effectivetypescript.com/2020/08/12/generics-golden-rule/)

#### Ejercicios
- [TypeScript Exercises - Generics](https://typescript-exercises.github.io/)
- Completa los ejercicios en `src/types/base.ts`

---

### DÍA 2: Generics Avanzados

#### Documentación
- [Generic Constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints)
- [Using Type Parameters](https://www.typescriptlang.org/docs/handbook/2/generics.html#using-type-parameters-in-generic-constraints)

#### Videos
- [Advanced TypeScript Generics](https://www.youtube.com/watch?v=VBfHN7WiR5A)
- [Generic Constraints in Practice](https://www.youtube.com/watch?v=jGdHFfTdNkw)

#### Patrones
- [Repository Pattern en TypeScript](https://blog.logrocket.com/generic-repository-pattern-typescript/)
- [Builder Pattern con Generics](https://refactoring.guru/design-patterns/builder/typescript/example)

#### Para Practicar
```typescript
// Challenge: Implementa un tipo que extraiga keys numéricas
type NumberKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never
}[keyof T];

// Challenge: Implementa un Repository con búsqueda filtrada
interface SearchableRepository<T> extends Repository<T> {
  search(query: Partial<T>): AsyncResult<T[], string>;
}
```

---

### DÍA 3: Utility Types

#### Documentación Oficial
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)

#### Built-in Utility Types para Dominar
1. **Partial<T>** - Hace todos los campos opcionales
2. **Required<T>** - Hace todos los campos requeridos
3. **Readonly<T>** - Hace todos los campos readonly
4. **Pick<T, K>** - Selecciona campos específicos
5. **Omit<T, K>** - Excluye campos específicos
6. **Record<K, V>** - Crea objeto con keys K y valores V
7. **Exclude<T, U>** - Excluye tipos de union
8. **Extract<T, U>** - Extrae tipos de union
9. **NonNullable<T>** - Remueve null y undefined
10. **ReturnType<T>** - Extrae tipo de retorno de función

#### Custom Utility Types para Crear
```typescript
// DeepPartial - Hace partial recursivamente
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// DeepReadonly - Hace readonly recursivamente
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// NonNullableFields - Remueve null/undefined de todos los campos
type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

// Mutable - Opuesto de Readonly
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
```

#### Recursos
- [Type Challenges - Utility Types](https://github.com/type-challenges/type-challenges)
- [Advanced Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)

---

### DÍA 4: Type Narrowing

#### Documentación
- [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)

#### Técnicas de Narrowing

1. **typeof Guards**
```typescript
function process(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase(); // TypeScript sabe que es string
  }
  return value.toFixed(2); // TypeScript sabe que es number
}
```

2. **instanceof Guards**
```typescript
function handle(error: Error | string) {
  if (error instanceof Error) {
    console.log(error.stack); // Type-safe!
  }
}
```

3. **in Operator**
```typescript
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ('swim' in animal) {
    animal.swim(); // animal es Fish
  } else {
    animal.fly(); // animal es Bird
  }
}
```

4. **Custom Type Guards**
```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
```

5. **Assertion Functions**
```typescript
function assertDefined<T>(value: T | null | undefined): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error('Value is null or undefined');
  }
}
```

#### Videos
- [TypeScript Narrowing Explained](https://www.youtube.com/watch?v=sjKe5H3vC7Y)
- [Discriminated Unions in Practice](https://www.youtube.com/watch?v=5UQxFS-BsQg)

---

### DÍA 5: Type Safety Avanzado

#### Branded Types

```typescript
// Branded Type Pattern
type Brand<K, T> = K & { __brand: T };

type UserId = Brand<string, 'UserId'>;
type TaskId = Brand<string, 'TaskId'>;

// Helper para crear branded values
function createUserId(id: string): UserId {
  return id as UserId;
}

// Ahora esto da error!
const userId: UserId = 'abc'; // ❌ Error
const userId2: UserId = createUserId('abc'); // ✅ OK
```

#### Template Literal Types

```typescript
type EventName = `on${Capitalize<string>}`;
type Route = `/api/${string}`;
type CSSProperty = `${string}-${string}`;

// Uso
const event: EventName = 'onClick'; // ✅
const route: Route = '/api/users'; // ✅
```

#### Conditional Types

```typescript
type IsString<T> = T extends string ? true : false;
type StringOnly<T> = T extends string ? T : never;

// Awaited helper
type Awaited<T> = T extends Promise<infer U> ? U : T;
```

#### Recursos
- [Branded Types in TypeScript](https://egghead.io/blog/using-branded-types-in-typescript)
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

---

## 🛠️ Herramientas

### TypeScript Playground
- URL: https://www.typescriptlang.org/play
- Experimenta con código sin setup
- Ver tipos inferidos
- Compartir snippets

### VS Code Extensions
1. **Pretty TypeScript Errors** - Errores más legibles
2. **TypeScript Error Translator** - Traduce errores complejos
3. **Error Lens** - Muestra errores inline
4. **TypeScript Importer** - Auto-imports

### Type Coverage
```bash
# Instalar
npm install -D type-coverage

# Verificar coverage
npx type-coverage --detail
```

### Testing de Tipos (tsd)
```bash
# Instalar
npm install -D tsd

# Crear test
# tests/types.test-d.ts
import { expectType } from 'tsd';
import { User } from '../src/types/entities';

expectType<User>({ id: '1', name: 'Test', ... });
```

---

## 📖 Libros Recomendados

1. **"Programming TypeScript"** - Boris Cherny
   - Capítulos relevantes: 4-6
   - Cubre Generics y Advanced Types

2. **"Effective TypeScript"** - Dan Vanderkam
   - Items 14-28: Type Design
   - Items 29-40: Type Inference

3. **"TypeScript Quickly"** - Yakov Fain
   - Capítulo 4: Generics
   - Capítulo 5: Advanced Types

---

## 🎓 Cursos Online

### Gratuitos
1. **TypeScript Handbook** (Oficial)
   - https://www.typescriptlang.org/docs/handbook/intro.html

2. **TypeScript Deep Dive** - Basarat
   - https://basarat.gitbook.io/typescript/

3. **Execute Program - TypeScript**
   - https://www.executeprogram.com/courses/typescript
   - Primeros módulos gratis

### De Pago (Valen la pena)
1. **Total TypeScript** - Matt Pocock
   - https://www.totaltypescript.com/
   - Enfocado en type transformations

2. **Frontend Masters - TypeScript**
   - https://frontendmasters.com/courses/typescript-v4/
   - Mike North

3. **Egghead - Advanced TypeScript**
   - https://egghead.io/courses/advanced-typescript

---

## 🏋️ Type Challenges

### Por Nivel

#### Warm-up (Día 1-2)
- Pick
- Readonly
- Tuple to Object
- First of Array

#### Easy (Día 3)
- Exclude
- Awaited
- If
- Concat

#### Medium (Día 4-5)
- Return Type
- Omit
- Deep Readonly
- Tuple to Union

#### Hard (Opcional)
- Union to Intersection
- Required Keys
- Optional Keys

**Link:** https://github.com/type-challenges/type-challenges

---

## 💡 Tips y Best Practices

### DO's ✅

1. **Siempre usa strict mode**
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

2. **Evita any, usa unknown**
```typescript
// ❌ Malo
function process(data: any) { }

// ✅ Bueno
function process(data: unknown) {
  if (typeof data === 'string') {
    // Ahora es type-safe
  }
}
```

3. **Usa const assertions**
```typescript
const config = {
  api: '/api',
  timeout: 5000
} as const;
```

4. **Prefiere union types sobre enums**
```typescript
// ❌ Enum
enum Status { Active, Inactive }

// ✅ Union
type Status = 'active' | 'inactive';
```

### DON'Ts ❌

1. **No uses ! (non-null assertion) sin razón**
2. **No uses @ts-ignore, usa @ts-expect-error**
3. **No hagas type assertions innecesarias**
4. **No definas types que TypeScript puede inferir**

---

## 🔗 Comunidades

### Discord
- TypeScript Community Discord
- Reactiflux (#typescript)

### Reddit
- r/typescript
- r/learnprogramming

### Stack Overflow
- Tag: [typescript]

### Twitter/X
- @typescript
- @mattpocockuk (Matt Pocock)
- @danvk (Dan Vanderkam)

---

## 📊 Cheat Sheets

### Generics
```typescript
// Función genérica
function identity<T>(arg: T): T { return arg; }

// Interface genérica
interface Box<T> { value: T; }

// Clase genérica
class Container<T> {
  constructor(private value: T) {}
}

// Constraint
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}
```

### Utility Types
```typescript
type User = { id: string; name: string; age: number; };

type PartialUser = Partial<User>; // Todos opcionales
type RequiredUser = Required<User>; // Todos requeridos
type ReadonlyUser = Readonly<User>; // Todos readonly
type PickUser = Pick<User, 'id' | 'name'>; // Solo id y name
type OmitUser = Omit<User, 'age'>; // Sin age
```

### Type Guards
```typescript
// typeof
if (typeof x === 'string') { }

// instanceof
if (x instanceof Date) { }

// in operator
if ('property' in object) { }

// Custom guard
function isUser(x: unknown): x is User {
  return typeof x === 'object' && x !== null && 'id' in x;
}
```

---

## 🎯 Proyecto de Referencia

Proyectos open-source con excelente uso de TypeScript:

1. **Prisma** - ORM con tipos generados
   - https://github.com/prisma/prisma

2. **tRPC** - Type-safe APIs
   - https://github.com/trpc/trpc

3. **Zod** - Schema validation
   - https://github.com/colinhacks/zod

4. **TypeORM** - ORM TypeScript
   - https://github.com/typeorm/typeorm

---

## ✨ Próximos Pasos (Post-Semana 1)

Después de completar esta semana, explora:

1. **Semana 2**: React + TypeScript
   - Props types
   - Hooks tipados
   - Context API

2. **Semana 3**: Node.js + TypeScript
   - Express tipado
   - API routes
   - Middleware

3. **Semana 4**: Testing
   - Jest con TypeScript
   - Type tests
   - Integration tests

4. **Avanzado**: Type-Level Programming
   - Recursive types
   - Variadic tuples
   - Template literal types avanzados

---

**¡Éxito en tu aprendizaje! 🚀**
