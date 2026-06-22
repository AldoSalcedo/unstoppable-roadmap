# 🚀 SPRINT SEMANA 1: TypeScript Avanzado
## Sistema de Gestión de Tareas Empresarial

---

## 📋 DESCRIPCIÓN DEL PROYECTO

Desarrollarás un **Sistema de Gestión de Tareas Empresarial** que simula un sistema real de tickets/tareas como Jira o Linear. Este proyecto integra todos los conceptos avanzados de TypeScript de manera práctica.

### Características principales:
- Sistema de usuarios con roles y permisos
- Gestión de tareas con estados y prioridades
- Sistema de notificaciones tipado
- API handlers con validación de tipos
- Sistema de plugins extensible
- Logging y monitoreo tipado

---

## 🎯 OBJETIVOS DE APRENDIZAJE

Al finalizar esta semana dominarás:

✅ **Generics avanzados**: Funciones y clases reutilizables con restricciones
✅ **Utility Types**: Transformación y manipulación de tipos
✅ **Type Narrowing**: Refinamiento preciso de tipos
✅ **Type Safety**: Configuración estricta y branded types
✅ **Conditional Types**: Tipos que dependen de condiciones
✅ **Template Literal Types**: Tipos basados en strings

---

## 📅 PLAN DEL SPRINT (7 DÍAS)

### **DÍA 1 - Lunes: Fundamentos y Setup (3-4 horas)**

#### Morning Standup (30 min)
- Revisar objetivos de la semana
- Configurar proyecto TypeScript con strict mode
- Leer recursos sobre Generics

#### Desarrollo (2.5 horas)
**Tarea 1.1**: Configuración del proyecto
- Inicializar proyecto con `tsconfig.json` estricto
- Configurar ESLint para TypeScript
- Crear estructura de carpetas

**Tarea 1.2**: Implementar tipos base con Generics
- Crear `types/base.ts` con tipos fundamentales
- Implementar `Result<T, E>` type para manejo de errores
- Crear `Entity<T>` con timestamps genéricos

#### Daily Review (30 min)
- Verificar que el código compila sin errores
- Documentar aprendizajes del día
- Preparar dudas para el siguiente día

#### Recursos del día:
- [TypeScript Handbook - Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Effective TypeScript - Item 14: Use Type Operations](https://effectivetypescript.com/)

---

### **DÍA 2 - Martes: Generics Avanzados (3-4 horas)**

#### Morning Standup (30 min)
- Review código del día anterior
- Planear implementación de hoy

#### Desarrollo (2.5 horas)
**Tarea 2.1**: Sistema de repositorios genéricos
- Crear `Repository<T>` interface
- Implementar `InMemoryRepository<T>` con constraints
- Agregar métodos con Generic Constraints

**Tarea 2.2**: Builders con Generics
- Implementar `QueryBuilder<T>` para filtros
- Crear `TaskBuilder` con fluent API
- Agregar validación en compile-time

#### Daily Review (30 min)
- Probar repositorios con diferentes entidades
- Verificar type safety en builders
- Documentar patrones descubiertos

#### Recursos del día:
- [TypeScript Deep Dive - Generics](https://basarat.gitbook.io/typescript/type-system/generics)
- [Advanced TypeScript Patterns - Builders](https://www.patterns.dev/)

---

### **DÍA 3 - Miércoles: Utility Types (3-4 horas)**

#### Morning Standup (30 min)
- Review del código anterior
- Introducción a Utility Types

#### Desarrollo (2.5 horas)
**Tarea 3.1**: Transformación de tipos de Usuario
- Usar `Partial<T>` para updates
- Implementar `Pick<T>` y `Omit<T>` para DTOs
- Crear `Required<T>` para validaciones

**Tarea 3.2**: Custom Utility Types
- Crear `DeepPartial<T>` recursivo
- Implementar `NonNullableFields<T>`
- Hacer `StrictPick<T, K>` con mejores errores

**Tarea 3.3**: Sistema de permisos con Record
- Usar `Record<K, V>` para mapear permisos
- Implementar `Extract` y `Exclude` para filtrar
- Crear tipos de roles con `NonNullable`

#### Daily Review (30 min)
- Verificar que los DTOs son correctos
- Probar utility types custom
- Documentar casos de uso

#### Recursos del día:
- [TypeScript Handbook - Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [Type Challenges - Utility Types](https://github.com/type-challenges/type-challenges)

---

### **DÍA 4 - Jueves: Type Narrowing (3-4 horas)**

#### Morning Standup (30 min)
- Review utility types implementados
- Planear sistema de estados

#### Desarrollo (2.5 horas)
**Tarea 4.1**: Type Guards básicos
- Implementar guards con `typeof`
- Crear guards con `instanceof`
- Usar operador `in` para object shapes

**Tarea 4.2**: Custom Type Guards
- Crear `isTaskComplete()` guard
- Implementar `isUserAdmin()` con type predicate
- Hacer guards para validación de API

**Tarea 4.3**: Discriminated Unions
- Crear `TaskState` como discriminated union
- Implementar `NotificationType` union
- Sistema de eventos con discriminated unions

**Tarea 4.4**: Assertion Functions
- Implementar `assertNever()` para exhaustiveness
- Crear `assertDefined()` para null checks
- Hacer `assertValidTask()` con throws

#### Daily Review (30 min)
- Probar todos los type guards
- Verificar exhaustiveness checking
- Documentar patrones de narrowing

#### Recursos del día:
- [TypeScript Handbook - Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Discriminated Unions in Practice](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)

---

### **DÍA 5 - Viernes: Type Safety Avanzado (3-4 horas)**

#### Morning Standup (30 min)
- Review del narrowing
- Introducción a type safety avanzado

#### Desarrollo (2.5 horas)
**Tarea 5.1**: Branded Types
- Crear `UserId`, `TaskId` como branded types
- Implementar `EmailAddress` validado
- Hacer `ISODateString` type-safe

**Tarea 5.2**: Template Literal Types
- Crear `EventName` con prefijos validados
- Implementar `Route` paths tipados
- Hacer `CSSProperty` type-safe

**Tarea 5.3**: Conditional Types
- Implementar `Awaited<T>` para promises
- Crear `ExtractArrayType<T>` 
- Hacer `FunctionReturnType<T>` custom

#### Daily Review (30 min)
- Verificar que branded types previenen errores
- Probar template literals
- Documentar conditional types

#### Recursos del día:
- [Branded Types Pattern](https://egghead.io/blog/using-branded-types-in-typescript)
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

---

### **DÍA 6 - Sábado: Integración y Testing (4-5 horas)**

#### Morning Standup (30 min)
- Review completa del código
- Plan de integración

#### Desarrollo (3.5 horas)
**Tarea 6.1**: API Handlers tipados
- Crear handlers con todos los tipos
- Implementar middleware chain tipado
- Agregar error handling type-safe

**Tarea 6.2**: Sistema de Plugins
- Interface de Plugin genérica
- Registry con type safety
- Hooks system tipado

**Tarea 6.3**: Tests de tipos
- Crear archivos `.test-d.ts`
- Usar `@ts-expect-error` para negative tests
- Verificar inferencia de tipos

#### Daily Review (30 min)
- Ejecutar todos los tests
- Verificar compilation
- Code review personal

#### Recursos del día:
- [Testing TypeScript Types](https://github.com/SamVerschueren/tsd)
- [Type-Level Testing](https://www.totaltypescript.com/workshops)

---

### **DÍA 7 - Domingo: Refactoring y Documentación (3-4 horas)**

#### Morning Standup (30 min)
- Review final del proyecto
- Identificar áreas de mejora

#### Desarrollo (2 horas)
**Tarea 7.1**: Refactoring
- Simplificar tipos complejos
- Extraer utility types reutilizables
- Optimizar performance de tipos

**Tarea 7.2**: Documentación
- Documentar todos los tipos públicos
- Crear ejemplos de uso
- Escribir README del proyecto

#### Sprint Retrospective (1 hora)
- ¿Qué aprendiste esta semana?
- ¿Qué fue difícil?
- ¿Qué mejorarías?
- Plan para la siguiente semana

#### Recursos del día:
- [TSDoc](https://tsdoc.org/)
- [TypeScript Project Guidelines](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines)

---

## 🛠️ SETUP INICIAL

### Prerrequisitos
```bash
node >= 18.0.0
npm >= 9.0.0
```

### Instalación
```bash
# Crear proyecto
mkdir task-manager-ts
cd task-manager-ts
npm init -y

# Instalar dependencias
npm install -D typescript @types/node
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier
npm install -D tsd  # Para tests de tipos

# Inicializar TypeScript
npx tsc --init
```

### tsconfig.json (STRICT MODE)
```json
{
  "compilerOptions": {
    /* Language and Environment */
    "target": "ES2022",
    "lib": ["ES2022"],
    
    /* Modules */
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "resolveJsonModule": true,
    
    /* Emit */
    "outDir": "./dist",
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "removeComments": true,
    
    /* Type Checking - TODAS EN STRICT */
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    
    /* Completeness */
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Estructura del proyecto
```
task-manager-ts/
├── src/
│   ├── types/
│   │   ├── base.ts          # Día 1: Tipos fundamentales
│   │   ├── entities.ts      # Día 1-2: Entidades del dominio
│   │   ├── utilities.ts     # Día 3: Custom utility types
│   │   └── branded.ts       # Día 5: Branded types
│   ├── repositories/
│   │   ├── base.ts          # Día 2: Repository genérico
│   │   └── implementations.ts
│   ├── builders/
│   │   └── query.ts         # Día 2: Query builder
│   ├── guards/
│   │   └── type-guards.ts   # Día 4: Type guards y assertions
│   ├── api/
│   │   ├── handlers.ts      # Día 6: API handlers
│   │   └── middleware.ts
│   ├── plugins/
│   │   └── system.ts        # Día 6: Plugin system
│   └── index.ts
├── tests/
│   └── types.test-d.ts      # Día 6: Type tests
├── docs/
│   └── API.md
├── tsconfig.json
├── package.json
└── README.md
```

---

## 📚 RECURSOS PRINCIPALES

### Documentación oficial
1. **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/intro.html
2. **TypeScript Deep Dive**: https://basarat.gitbook.io/typescript/
3. **Effective TypeScript**: https://effectivetypescript.com/

### Cursos y tutoriales
1. **Matt Pocock - Total TypeScript**: https://www.totaltypescript.com/
2. **Type Challenges**: https://github.com/type-challenges/type-challenges
3. **TypeScript Exercises**: https://typescript-exercises.github.io/

### Herramientas
1. **TS Playground**: https://www.typescriptlang.org/play
2. **Type Coverage**: https://github.com/plantain-00/type-coverage
3. **TSDoc**: https://tsdoc.org/

### Libros recomendados
1. "Programming TypeScript" - Boris Cherny
2. "Effective TypeScript" - Dan Vanderkam
3. "TypeScript Quickly" - Yakov Fain, Anton Moiseev

---

## ✅ CRITERIOS DE ÉXITO

Al final de la semana deberás tener:

### Técnicos
- [ ] Proyecto compila sin errores en strict mode
- [ ] 0 `any` types en el código
- [ ] Todos los tipos son inferidos o explícitos
- [ ] Type coverage > 95%
- [ ] Tests de tipos pasan

### De aprendizaje
- [ ] Puedes explicar cuándo usar cada Utility Type
- [ ] Entiendes cómo funcionan los Generics con constraints
- [ ] Sabes crear Custom Type Guards
- [ ] Comprendes Discriminated Unions
- [ ] Puedes crear Conditional Types

### De proyecto
- [ ] Sistema de usuarios completo y tipado
- [ ] CRUD de tareas con type safety
- [ ] Sistema de permisos funcional
- [ ] API handlers implementados
- [ ] Documentación completa

---

## 🎓 EJERCICIOS DIARIOS EXTRAS

### Ejercicio Día 1: Warm-up
Crea un tipo `Maybe<T>` que sea similar a `Option` en Rust:
```typescript
type Maybe<T> = /* implementar */

// Debe permitir:
const value: Maybe<number> = { type: 'some', value: 42 };
const empty: Maybe<string> = { type: 'none' };
```

### Ejercicio Día 2: Challenge
Implementa un `SafeArray<T>` que no permita acceso a índices inválidos:
```typescript
type SafeArray<T> = /* implementar */

const arr: SafeArray<string> = /* implementar */
// arr.at(0) debería retornar string | undefined
```

### Ejercicio Día 3: Advanced
Crea un tipo `FlattenObject<T>` que aplane objetos nested:
```typescript
type FlattenObject<T> = /* implementar */

type Nested = { a: { b: { c: number } } };
type Flat = FlattenObject<Nested>; // { 'a.b.c': number }
```

### Ejercicio Día 4: Narrowing
Implementa un sistema de estados de orden con narrowing:
```typescript
type OrderState = /* implementar con discriminated unions */

function processOrder(order: OrderState) {
  // Implementar con exhaustive checking
}
```

### Ejercicio Día 5: Type-Level Programming
Crea un tipo que valide rutas de API:
```typescript
type ValidRoute = /* implementar */

const route1: ValidRoute = '/api/users/:id'; // ✅
const route2: ValidRoute = '/api//invalid'; // ❌ Error
```

---

## 📊 MÉTRICAS DEL SPRINT

Trackea tu progreso diario:

| Día | Horas | Conceptos | Líneas | Commits | Notas |
|-----|-------|-----------|--------|---------|-------|
| 1   |       |           |        |         |       |
| 2   |       |           |        |        |       |
| 3   |       |           |        |         |       |
| 4   |       |           |        |         |       |
| 5   |       |           |        |         |       |
| 6   |       |           |        |         |       |
| 7   |       |           |        |         |       |

---

## 🚀 SIGUIENTE NIVEL

Después de completar esta semana, estarás listo para:
- Week 2: React + TypeScript avanzado
- Week 3: Node.js APIs con type safety
- Week 4: Testing exhaustivo con tipos

---

## 💡 TIPS DE PRODUCTIVIDAD

1. **Usa el TypeScript Playground** para experimentar rápidamente
2. **Activa "Problems" en VS Code** para ver errores en tiempo real
3. **Instala la extensión "Pretty TypeScript Errors"** para errores más legibles
4. **Usa Git** desde el día 1, commit por cada tarea completada
5. **Toma breaks** cada 90 minutos (Técnica Pomodoro)
6. **Documenta tus dudas** en un archivo QUESTIONS.md

---

## 🤝 SOPORTE

Si te atascas:
1. Revisa la documentación oficial primero
2. Busca en el TypeScript Playground
3. Consulta los ejercicios de Type Challenges
4. Pregunta en el Discord de TypeScript
5. Stack Overflow es tu amigo

---

**¡Éxito en tu sprint, Aldo! 🎯**

Recuerda: El objetivo no es solo completar el código, sino **entender profundamente** cada concepto. La velocidad vendrá con la práctica.
