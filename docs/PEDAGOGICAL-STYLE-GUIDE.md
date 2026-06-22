# 📐 Guía de Estilo Pedagógico — Unstoppable Roadmap

Este documento codifica la convención de comentarios que se usa en **todos**
los archivos fuente del monorepo. Cada semana nueva debe seguir este estándar.

---

## Por qué existe esta convención

El código aquí no es solo código — es tu sistema de aprendizaje.
Los comentarios son la diferencia entre "hice el ejercicio" y "entendí el concepto".

La regla de oro: **si no puedes explicarlo en el comentario, no lo entendiste.**

---

## Anatomía completa de un archivo fuente

### 1. CABECERA DE ARCHIVO (siempre primero)

```typescript
/**
 * [filename].ts — [Descripción del módulo]
 * DÍA [X]: [Nombre del concepto] — [subtítulo breve]
 *
 * CONCEPTOS CLAVE:
 * - [Concepto 1]
 * - [Concepto 2]
 * - [Concepto 3]
 */
```

### 2. SEPARADORES DE SECCIÓN (antes de cada bloque mayor)

```typescript
// ============================================================================
// TAREA [X.Y]: [NOMBRE DE LA TAREA EN MAYÚSCULAS]
// ============================================================================
```

### 3. DOCUMENTACIÓN DE TIPO O FUNCIÓN (en cada export)

```typescript
/**
 * NombreDelTipo — descripción en una línea
 *
 * El problema (en JavaScript/React que ya conoces):
 * ```javascript
 * // La forma anterior o conocida...
 * // Problema: ...
 * ```
 *
 * Con [NombreDelTipo]:
 * ```typescript
 * // La forma nueva y por qué es mejor...
 * ```
 *
 * Ventajas:
 * - [Ventaja 1]
 * - [Ventaja 2]
 *
 * Aplicación Healthcare:
 * [Cómo este patrón aplica a software clínico / tu background QBP o Auditoría]
 */
```

### 4. CAJA DE CONCEPTO (para ideas que necesitan más espacio)

Usa esto cuando el concepto requiere una explicación profunda con ejemplos
de ✅ y ❌.

```typescript
/**
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │ NOMBRE DEL CONCEPTO                                                    │
 * ├────────────────────────────────────────────────────────────────────────┤
 * │ Explicación en términos simples.                                       │
 * │                                                                        │
 * │ Sin este patrón:                                                       │
 * │   resultado = hacerAlgo(); // ❌ Podría ser null, undefined, o error   │
 * │                                                                        │
 * │ Con este patrón:                                                       │
 * │   resultado = hacerAlgo(); // ✅ Siempre predecible                    │
 * └────────────────────────────────────────────────────────────────────────┘
 */
```

### 5. MARCADORES DE EJERCICIO (los más importantes)

```typescript
/**
 * EJERCICIO [N]: [Descripción del ejercicio]
 *
 * Pista: [Una guía sin dar la respuesta]
 *
 * Ejemplo esperado:
 * ```typescript
 * const resultado = tuFuncion(entrada);
 * // resultado === valorEsperado ✅
 * ```
 */
// TODO: Implementar
// export const nombreFuncion = ???
```

### 6. NOTAS DE APRENDIZAJE (siempre al final del archivo)

Esta sección se actualiza al terminar cada día de trabajo.

```typescript
// ============================================================================
// NOTAS DE APRENDIZAJE (actualizar al final del día)
// ============================================================================

/**
 * CONCEPTOS CLAVE DEL DÍA [X]:
 *
 * 1. [NOMBRE DEL CONCEPTO]:
 *    - ¿Qué es?
 *    - ¿Cuándo usarlo?
 *    - ¿Cuándo NO usarlo?
 *
 * 2. [SIGUIENTE CONCEPTO]:
 *    - ...
 *
 * CONEXIÓN CON TU BACKGROUND:
 * - QBP/Biología: [cómo este patrón mapea a pensamiento clínico]
 * - Auditoría: [cómo mapea a control de procesos / trazabilidad]
 * - Ventas/UX: [cómo mapea a experiencia de usuario]
 *
 * PARA PRACTICAR:
 * - [Ejercicio adicional]
 * - [Link al TypeScript Playground con el concepto]
 * - [Desafío de Type Challenges relacionado]
 */
```

---

## Reglas adicionales

| Regla | ✅ Correcto | ❌ Incorrecto |
|-------|-----------|-------------|
| Idioma de código | Inglés (nombres, variables) | Español en identificadores |
| Idioma de comentarios | Español | Inglés mezclado sin razón |
| TODO sin contexto | `// TODO: Implementar usando Brand<T,B> — ver línea 12` | `// TODO` |
| Ejercicio sin pista | No existe | Siempre incluir una pista |
| Sección sin separador | No existe | Siempre usar `// ===...===` |
| Conexión healthcare | Siempre presente | Solo si "aplica" |

---

## Checklist antes de commitear un archivo nuevo

```
[ ] Cabecera con DÍA X y conceptos clave
[ ] Separadores // ===...=== antes de cada TAREA
[ ] Cada export tiene doc con "El problema" + "Con [Tipo]" + "Aplicación Healthcare"
[ ] Al menos 1 EJERCICIO con pista
[ ] Sección NOTAS DE APRENDIZAJE al final (puede estar vacía hasta terminar el día)
[ ] 0 tipos `any` — usar `unknown` con type guards
[ ] Sin non-null assertions (!) — usar guards o assertions
```
