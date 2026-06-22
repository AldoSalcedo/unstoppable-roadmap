# 🚀 Task Manager TypeScript - Sprint Week 1

Sistema de Gestión de Tareas Empresarial para aprender TypeScript Avanzado

## 📖 Descripción

Este proyecto es un sistema completo de gestión de tareas similar a Jira o Linear, diseñado específicamente para dominar conceptos avanzados de TypeScript en una semana de sprint intensivo.

## 🎯 Objetivos de Aprendizaje

- ✅ **Generics avanzados** con constraints
- ✅ **Utility Types** (built-in y custom)
- ✅ **Type Narrowing** (guards, assertions, discriminated unions)
- ✅ **Type Safety** (branded types, template literals)
- ✅ **Conditional Types**
- ✅ **Type-Level Programming**

## 📂 Estructura del Proyecto

```
task-manager-ts/
├── src/
│   ├── types/
│   │   ├── base.ts          # ✅ DÍA 1: Tipos fundamentales (Result, Entity, Maybe)
│   │   ├── entities.ts      # ✅ DÍA 1: Modelos del dominio (User, Task, etc)
│   │   ├── utilities.ts     # ✅ DÍA 3: Custom utility types
│   │   └── branded.ts       # ✅ DÍA 5: Branded types
│   ├── repositories/
│   │   ├── base.ts          # ✅ DÍA 2: Repository<T> genérico
│   │   └── implementations.ts
│   ├── builders/
│   │   └── query.ts         # ✅ DÍA 2: QueryBuilder<T>
│   ├── guards/
│   │   └── type-guards.ts   # ✅ DÍA 4: Type guards y assertions
│   ├── api/
│   │   ├── handlers.ts      # ✅ DÍA 6: API handlers
│   │   └── middleware.ts
│   ├── plugins/
│   │   └── system.ts        # ✅ DÍA 6: Plugin system
│   └── index.ts
├── tests/
│   └── types.test-d.ts      # ✅ DÍA 6: Type tests
├── docs/
│   └── API.md
└── README.md
```

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Compilar

```bash
npm run build
```

### 3. Modo desarrollo (watch)

```bash
npm run dev
```

### 4. Ejecutar tests de tipos

```bash
npm run test:types
```

### 5. Verificar type coverage

```bash
npm run type-coverage
```

## 📅 Plan Día por Día

### DÍA 1: Fundamentos (HOY)

**✅ Archivos creados:**
- `src/types/base.ts` - Result, Entity, Maybe
- `src/types/entities.ts` - User, Task, Comment, Notification

**📝 Tareas:**
1. ✅ Configurar proyecto con strict mode
2. ✅ Implementar tipos base
3. ✅ Crear modelos de dominio
4. ✅ Completar ejercicios en los archivos
5. ✅ Leer recursos sobre Generics

**🎓 Ejercicios:**
- Completa `doubleResult()` en `base.ts`
- Completa `mapResult()` en `base.ts`
- Completa `mapMaybe()` en `base.ts`
- Implementa `canUserEditTask()` en `entities.ts`
- Implementa `calculateProjectProgress()` en `entities.ts`

**📚 Recursos:**
- [TypeScript Handbook - Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [TypeScript Playground](https://www.typescriptlang.org/play)

### DÍA 2: Generics Avanzados

**📝 Tareas:**
1. Crear `Repository<T>` interface
2. Implementar `InMemoryRepository<T>`
3. Crear `QueryBuilder<T>`
4. Agregar Generic Constraints

**🎓 Ejercicios:**
- SafeArray<T> challenge
- Repository con constraints
- Fluent API builder

### DÍA 3: Utility Types

**📝 Tareas:**
1. User DTOs con Pick, Omit, Partial
2. Custom utility types (DeepPartial, NonNullableFields)
3. Sistema de permisos con Record
4. Extract y Exclude para filtrado

**🎓 Ejercicios:**
- FlattenObject<T>
- StrictPick<T, K>
- DeepReadonly<T>

### DÍA 4: Type Narrowing

**📝 Tareas:**
1. Type guards básicos (typeof, instanceof, in)
2. Custom type guards con predicates
3. Discriminated unions para TaskState
4. Assertion functions

**🎓 Ejercicios:**
- Sistema de estados con narrowing
- Exhaustive checking
- Custom assertions

### DÍA 5: Type Safety Avanzado

**📝 Tareas:**
1. Branded types (UserId, TaskId, Email)
2. Template literal types (EventName, Route)
3. Conditional types custom

**🎓 Ejercicios:**
- ValidRoute<T>
- Type-safe event system
- Conditional utility types

### DÍA 6: Integración

**📝 Tareas:**
1. API handlers tipados
2. Sistema de plugins
3. Tests de tipos con tsd
4. Type coverage verification

### DÍA 7: Refactoring y Docs

**📝 Tareas:**
1. Code review y refactoring
2. Documentación completa
3. Sprint retrospective

## 🔧 Comandos Útiles

```bash
# Compilar y ver errores
npm run build

# Modo watch para desarrollo
npm run dev

# Verificar linting
npm run lint

# Formatear código
npm run format

# Medir type coverage
npm run type-coverage

# Tests de tipos
npm run test:types
```

## 📊 Métricas del Sprint

Trackea tu progreso:

| Día | Horas | Conceptos | Archivos | Commits | Notas |
|-----|-------|-----------|----------|---------|-------|
| 1   | 3-4   | Generics básicos | 2 | [ ] | |
| 2   | 3-4   | Generics avanzados | 3 | [ ] | |
| 3   | 3-4   | Utility types | 2 | [ ] | |
| 4   | 3-4   | Type narrowing | 1 | [ ] | |
| 5   | 3-4   | Type safety | 2 | [ ] | |
| 6   | 4-5   | Integración | 3 | [ ] | |
| 7   | 3-4   | Refactoring | - | [ ] | |

## ✅ Criterios de Éxito

- [ ] Proyecto compila sin errores en strict mode
- [ ] 0 tipos `any` en el código
- [ ] Type coverage > 95%
- [ ] Todos los ejercicios completados
- [ ] Tests de tipos pasan
- [ ] Documentación completa

## 🎓 Recursos de Aprendizaje

### Documentación
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Effective TypeScript](https://effectivetypescript.com/)

### Práctica
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Type Challenges](https://github.com/type-challenges/type-challenges)
- [TypeScript Exercises](https://typescript-exercises.github.io/)

### Cursos
- [Total TypeScript](https://www.totaltypescript.com/)
- [Execute Program - TypeScript](https://www.executeprogram.com/courses/typescript)

## 💡 Tips

1. **Usa TypeScript Playground** para experimentar
2. **Activa "Problems" en VS Code** para ver errores en tiempo real
3. **Instala Pretty TypeScript Errors** para errores legibles
4. **Haz commits frecuentes** por cada tarea completada
5. **Documenta tus dudas** en QUESTIONS.md
6. **Toma breaks** cada 90 minutos

## 🤝 Dudas y Soporte

Si te atascas:
1. Revisa la documentación oficial
2. Experimenta en TypeScript Playground
3. Consulta Type Challenges
4. Stack Overflow
5. Discord de TypeScript

## 📝 Notas del Sprint

Crea un archivo `NOTES.md` para documentar:
- Conceptos nuevos aprendidos
- Patrones útiles descubiertos
- Errores comunes y cómo resolverlos
- Ideas para proyectos futuros

## 🎉 ¡Éxito en tu Sprint!

Recuerda: El objetivo es **entender profundamente**, no solo completar código rápidamente.

---

**Autor:** Aldo Salcedo
**Sprint:** Semana 1 - TypeScript Avanzado  
**Fecha:** Abril 2026 - 5 mayo 2026
