/**
 * tests/types.test-d.ts - Tests de Tipos
 * DÍA 6: Integración - Type Testing
 *
 * Este archivo contiene tests que verifican el comportamiento de tipos
 * en compile-time. No se ejecutan como tests normales, sino que
 * TypeScript los verifica durante la compilación.
 *
 * Usa:
 * - @ts-expect-error: para verificar que algo ES un error
 * - Asignaciones: para verificar compatibilidad de tipos
 */

import { expectType, expectError, expectNotType } from 'tsd';

// ============================================================================
// TAREA 6.3: TESTS DE TIPOS
// ============================================================================

// Importar todos los tipos a testear
import { Result, Ok, Err, Maybe, Some, None, Entity } from '../src/types/base.js';
import { User, Task, TaskStatus, UserRole, TaskPriority } from '../src/types/entities.js';
import {
  DeepPartial,
  DeepRequired,
  NonNullableFields,
  RequiredKeys,
  OptionalKeys,
  PickByValue,
} from '../src/types/utilities.js';
import {
  UserId,
  TaskId,
  EmailAddress,
  Brand,
  EventName,
  CustomAwaited,
  ExtractArrayType,
  FunctionReturnType,
} from '../src/types/branded.js';
import { isOk, isErr, assertNever } from '../src/guards/type-guards.js';

// ============================================================================
// TESTS: RESULT TYPE
// ============================================================================

/**
 * Test: Result<T, E> discriminated union
 */
function testResultType() {
  const success: Result<number, string> = { ok: true, value: 42 };
  const failure: Result<number, string> = { ok: false, error: 'error' };

  // Type narrowing should work
  if (success.ok) {
    // @ts-expect-error - error doesn't exist on success
    const _e: string = success.error;

    const _v: number = success.value; // ✅ Should work
  }

  if (!failure.ok) {
    // @ts-expect-error - value doesn't exist on failure
    const _v: number = failure.value;

    const _e: string = failure.error; // ✅ Should work
  }
}

/**
 * Test: Ok() and Err() helpers
 */
function testResultHelpers() {
  const ok = Ok(42);
  expectType<Result<number, never>>(ok);

  const err = Err('error');
  expectType<Result<never, string>>(err);
}

// ============================================================================
// TESTS: MAYBE TYPE
// ============================================================================

function testMaybeType() {
  const some: Maybe<number> = { type: 'some', value: 42 };
  const none: Maybe<number> = { type: 'none' };

  // Type narrowing
  if (some.type === 'some') {
    const _v: number = some.value; // ✅
  }

  
  if (none.type === 'none') {
    // @ts-expect-error - none doesn't have value
    const _v: number = none.value;
  }
}

// ============================================================================
// TESTS: ENTITY TYPE
// ============================================================================

function testEntityType() {
  type TestBase = { name: string; age: number };
  type TestEntity = Entity<TestBase>;

  // Entity should have all base fields plus id and timestamps
  const entity: TestEntity = {
    id: 'test-1',
    name: 'Test',
    age: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // @ts-expect-error - missing id
  const _invalid1: TestEntity = {
    name: 'Test',
    age: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // @ts-expect-error - missing createdAt
  const _invalid2: TestEntity = {
    id: 'test-1',
    name: 'Test',
    age: 25,
    updatedAt: new Date(),
  };
}

// ============================================================================
// TESTS: BRANDED TYPES
// ============================================================================

function testBrandedTypes() {
  const userId: UserId = 'user-123' as UserId;
  const taskId: TaskId = 'task-456' as TaskId;

  // @ts-expect-error - UserId should not be assignable to TaskId
  const _invalid: TaskId = userId;

  // @ts-expect-error - plain string should not be assignable to UserId
  const _invalid2: UserId = 'plain-string';

  // This should work
  const _validString: string = userId; // Branded types are assignable to base
}

function testEmailBranded() {
  const email: EmailAddress = 'test@example.com' as EmailAddress;

  // @ts-expect-error - plain string is not EmailAddress
  const _invalid: EmailAddress = 'test@example.com';

  // EmailAddress is usable as string
  const _str: string = email; // ✅
}

// ============================================================================
// TESTS: UTILITY TYPES
// ============================================================================

function testDeepPartial() {
  type Nested = {
    a: {
      b: {
        c: number;
      };
      d: string;
    };
    e: boolean;
  };

  type DP = DeepPartial<Nested>;

  // All of these should be valid
  const _v1: DP = {};
  const _v2: DP = { a: {} };
  const _v3: DP = { a: { b: {} } };
  const _v4: DP = { a: { b: { c: 42 } } };
  const _v5: DP = { e: true };
}

function testNonNullableFields() {
  type WithNulls = {
    a: string | null;
    b?: number;
    c: boolean | undefined;
  };

  type NoNulls = NonNullableFields<WithNulls>;

  // All fields should be required and non-null
  const valid: NoNulls = {
    a: 'string',
    b: 42,
    c: true,
  };

  // @ts-expect-error - all fields required
  const _invalid1: NoNulls = { a: 'string' };

  // @ts-expect-error - null not allowed
  const _invalid2: NoNulls = { a: null, b: 42, c: true };
}

function testPickByValue() {
  type Test = {
    a: string;
    b: number;
    c: string;
    d: boolean;
  };

  type OnlyStrings = PickByValue<Test, string>;

  // Should only have a and c
  const valid: OnlyStrings = { a: 'hello', c: 'world' };

  // @ts-expect-error - b is number, not string
  const _invalid: OnlyStrings = { a: 'hello', c: 'world', b: 42 };
}

// ============================================================================
// TESTS: TEMPLATE LITERAL TYPES
// ============================================================================

function testEventName() {
  // Valid event names
  const _e1: EventName = 'task:created';
  const _e2: EventName = 'user:deleted';
  const _e3: EventName = 'system:error';

  // @ts-expect-error - invalid domain
  const _invalid1: EventName = 'invalid:created';

  // @ts-expect-error - invalid action
  const _invalid2: EventName = 'task:invalid';

  // @ts-expect-error - wrong format
  const _invalid3: EventName = 'task-created';
}

// ============================================================================
// TESTS: CONDITIONAL TYPES
// ============================================================================

function testAwaited() {
  type A = CustomAwaited<Promise<string>>;
  expectType<A>('string' as string);

  type B = CustomAwaited<Promise<Promise<number>>>;
  expectType<B>(42 as number);

  type C = CustomAwaited<string>;
  expectType<C>('string' as string);
}

function testExtractArrayType() {
  type A = ExtractArrayType<string[]>;
  expectType<A>('string' as string);

  type B = ExtractArrayType<number[]>;
  expectType<B>(42 as number);

  type C = ExtractArrayType<string>;
  expectType<C>(undefined as unknown as never);
}

function testFunctionReturnType() {
  type A = FunctionReturnType<() => string>;
  expectType<A>('string' as string);

  type B = FunctionReturnType<(x: number) => boolean>;
  expectType<B>(true as boolean);

  type C = FunctionReturnType<(a: string, b: number) => { result: boolean }>;
  expectType<C>({ result: true as boolean });
}

// ============================================================================
// TESTS: DISCRIMINATED UNIONS
// ============================================================================

function testTaskStatusNarrowing(status: TaskStatus) {
  switch (status.type) {
    case 'TODO':
      // assignedAt is optional
      const _a: Date | undefined = status.assignedAt;
      break;

    case 'IN_PROGRESS':
      // These are required
      const _b: Date = status.startedAt;
      const _c: number = status.progress;
      break;

    case 'COMPLETED':
      const _d: Date = status.completedAt;
      const _e: string = status.completedBy;
      break;

    case 'BLOCKED':
      const _f: string = status.reason;
      break;

    case 'IN_REVIEW':
      const _g: string = status.reviewerId;
      break;

    case 'CANCELLED':
      const _h: string = status.reason;
      break;

    default:
      // This should make TypeScript happy if all cases are handled
      assertNever(status);
  }
}

// ============================================================================
// TESTS: TYPE GUARDS
// ============================================================================

function testTypeGuards() {
  const result: Result<number, string> = Ok(42);

  if (isOk(result)) {
    // value should exist
    const _v: number = result.value;

    // @ts-expect-error - error should not exist
    const _e: string = result.error;
  }

  if (isErr(result)) {
    // error should exist
    const _e: string = result.error;

    // @ts-expect-error - value should not exist
    const _v: number = result.value;
  }
}

// ============================================================================
// TESTS: GENERICS
// ============================================================================

function testGenerics() {
  // Repository should work with any Entity
  type UserEntity = Entity<{ email: string; name: string }>;
  type TaskEntity = Entity<{ title: string; description: string }>;

  // Both should be valid entities
  const user: UserEntity = {
    id: '1',
    email: 'test@test.com',
    name: 'Test',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const task: TaskEntity = {
    id: '2',
    title: 'Test Task',
    description: 'Description',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ============================================================================
// TESTS: INFERENCE
// ============================================================================

function testInference() {
  // Ok should infer the value type
  const ok1 = Ok(42);
  expectType<Result<number, never>>(ok1);

  const ok2 = Ok('hello');
  expectType<Result<string, never>>(ok2);

  const ok3 = Ok({ name: 'test' });
  expectType<Result<{ name: string }, never>>(ok3);

  // Err should infer the error type
  const err1 = Err('error');
  expectType<Result<never, string>>(err1);

  const err2 = Err(new Error('error'));
  expectType<Result<never, Error>>(err2);
}

// ============================================================================
// NEGATIVE TESTS (SHOULD FAIL)
// ============================================================================

/**
 * These tests verify that certain things ARE errors
 * Each @ts-expect-error comment should be followed by invalid code
 */

function negativeTests() {
  // Branded types should not be interchangeable
  // @ts-expect-error
  const _a: UserId = 'task-123' as TaskId;

  // Result discriminated union should be strict
  // @ts-expect-error - can't have both value and error
  const _b: Result<number, string> = { ok: true, value: 42, error: 'oops' };

  // Entity must have all required fields
  // @ts-expect-error
  const _c: Entity<{ name: string }> = { name: 'test' };

  // DeepPartial should work but DeepRequired should not allow undefined
  type DeepReq = DeepRequired<{ a?: { b?: number } }>;
  const validDeepReq: DeepReq = { a: { b: 42 } };
  // @ts-expect-error - b is required in DeepRequired
  const _d: DeepReq = { a: {} };
}

// ============================================================================
// NOTAS DE APRENDIZAJE - TYPE TESTING
// ============================================================================

/**
 * CONCEPTOS CLAVE:
 *
 * 1. @ts-expect-error:
 *    - Indica que la siguiente línea DEBE ser un error
 *    - Si no es error, el test falla
 *    - Útil para "negative tests"
 *
 * 2. expectType<T>(value):
 *    - Verifica que value tiene exactamente tipo T
 *    - Parte de la librería 'tsd'
 *    - Útil para verificar inferencia
 *
 * 3. TYPE ASSERTIONS:
 *    - Asignar a una variable con tipo explícito
 *    - Si no compila, el tipo es incorrecto
 *    - Método básico de testing
 *
 * 4. NARROWING TESTS:
 *    - Verificar que narrowing funciona correctamente
 *    - Dentro de if/switch, el tipo debe cambiar
 *    - Usar @ts-expect-error para verificar lo que NO debe compilar
 *
 * 5. COMPILE-TIME VS RUNTIME:
 *    - Estos tests se verifican en compilación
 *    - No se "ejecutan" como tests normales
 *    - tsc verifica los @ts-expect-error
 *
 * 6. TSD LIBRARY:
 *    - Librería para type testing
 *    - expectType, expectError, expectNotType
 *    - Se integra con npm test
 *
 * COMANDOS:
 * - npm run build: Compila y verifica tipos
 * - npx tsd: Ejecuta tests de tipos con tsd
 */
