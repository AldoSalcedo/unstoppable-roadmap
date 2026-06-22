# Week 1 Live Notes — Conceptos aprendidos

*Escribe aquí las ideas, patrones, y preguntas que surgen mientras trabajas en el sprint TypeScript. No tiene que estar pulido.*

---

## Day 1 — Partial<T>

**Concepto**: Shallow partial — todas las propiedades se hacen opcionales.

```typescript
// Original
interface User {
  name: string;
  email: string;
}

// Partial<User> es equivalente a:
interface PartialUser {
  name?: string;
  email?: string;
}
```

**Patrón observado**: Perfecto para form drafts donde el usuario llena campos gradualmente.

**Pregunta que surgió**: ¿Cómo se diferencia de `Omit<User, 'name' | 'email'>`? Respuesta: son lo opuesto.

---

## Day 2 — Readonly<T>

**Concepto**: Todas las propiedades se hacen read-only (no pueden cambiar después de asignación).

```typescript
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}
```

**Uso real**: Cuando tienes un singleton (ej. config global) que no debe cambiar.

**Healthcare angle**: Medicamentos oficiales (formulario farmacéutico) = nunca cambian sin aprobación formal.

---

## Day 2 — DeepPartial<T> Research

**El reto**: Partial<T> es shallow — solo el nivel top. ¿Cómo hacer nested objects también parciales?

```typescript
// Sin DeepPartial
interface Config {
  database: {
    host: string;
    port: number;
  }
}

Partial<Config> = {
  database?: {
    host: string;     // ← TODAVÍA REQUERIDO
    port: number;
  }
}

// Con DeepPartial
DeepPartial<Config> = {
  database?: {
    host?: string;    // ← PARCIAL
    port?: number;
  }
}
```

**Solución**: Usar conditional types + recursión

```typescript
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
```

**Insight**: El `extends object` es el pattern key. "Si T es un objeto, mapea cada propiedad recursivamente."

---

## Patrones clave viendo

1. **Conditional types** (`T extends U ? X : Y`) = tipo al sistema: decisiones lógicas
2. **Recursión en tipos** = el compilador puede descender indefinidamente
3. **keyof T** = obtener todas las claves de un objeto como unión tipo

---

## Preguntas pendientes

- [ ] ¿Cuándo usarías DeepPartial en producción?
- [ ] ¿Hay límites a la recursión de tipos?
- [ ] ¿Cómo se performance-testea tipos complejos?

---

## Patrones descubiertos

**Pattern 1: Type Guards**
Cuando usas `T extends X`, estás escribiendo un "type guard". El compilador solo entra a esa rama si T cumple.

**Pattern 2: Distributed Conditional Types**
Si T es una unión (`A | B`), TypeScript evalúa el condicional para cada miembro. Esto es poderoso pero sorprendente.

**Pattern 3: Recursion Base Cases**
Siempre necesitas un caso base (ej. `T extends object ? ... : T`) para evitar loops infinitos de tipos.

---

## Conexión con background

**De auditoría**: Este tipo de análisis recursivo es exactamente como auditar estados financieros. Bajas por niveles (Empresa → Departamento → Equipo → Individuo). Los tipos recursivos son "audit trails en tipos".

**De QBP**: Entender qué es "parcial" vs "completo" es crítico en datos. Un formulario parcialmente lleno no es lo mismo que uno cancelado. Los tipos lo fuerzan.

---

**Última entrada**: 2026-04-02
**Próxima sesión**: 2026-04-03 (Day 4)
