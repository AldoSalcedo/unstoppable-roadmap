/**
 * api/middleware.ts - Middleware Chain Tipado
 * DÍA 6: Integración - Middleware con Type Safety
 */

import { User, UserRole } from '../types/entities.js';
import { RequestContext, ApiResponse, ApiError, error } from './handlers.js';

// ============================================================================
// TAREA 6.1: MIDDLEWARE CHAIN TIPADO
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ EL PATRÓN MIDDLEWARE                                                     │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Un middleware es una función que "envuelve" otra función.                │
 * │ Forma una cadena donde cada eslabón puede:                              │
 * │                                                                         │
 * │ 1. INSPECCIONAR la request (logging, métricas)                          │
 * │ 2. MODIFICAR la request (agregar user, validar body)                   │
 * │ 3. CORTOCIRCUITAR la cadena (retornar error sin llamar next())         │
 * │ 4. MODIFICAR la response (agregar headers, transformar data)           │
 * │                                                                         │
 * │ Flujo de ejecución:                                                      │
 * │   Request → [logging] → [auth] → [validation] → handler → Response    │
 * │                                                                         │
 * │ Si auth falla:                                                           │
 * │   Request → [logging] → [auth] ✗ → Response (401, sin llamar handler) │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Middleware<> CON TRANSFORMACIÓN DE TIPOS (In/Out)                        │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Este tipo avanzado modela middleware que TRANSFORMA los tipos            │
 * │ del contexto. Tiene 6 generics organizados en pares In/Out:             │
 * │                                                                         │
 * │   TBodyIn   → TBodyOut                                                  │
 * │   TParamsIn → TParamsOut                                                │
 * │   TQueryIn  → TQueryOut                                                 │
 * │                                                                         │
 * │ Ejemplo conceptual:                                                      │
 * │   Un middleware de validación podría transformar:                        │
 * │     body: unknown (In) → body: CreateUserDTO (Out)                     │
 * │                                                                         │
 * │ En la práctica, este tipo es más teórico. La mayoría de middleware     │
 * │ usa SimpleMiddleware (ver abajo) porque la transformación de tipos     │
 * │ a través de una cadena dinámica es difícil de modelar.                 │
 * │                                                                         │
 * │ Los defaults TBodyOut = TBodyIn significan "si no especificas Out,     │
 * │ asume que el tipo no cambia" (pass-through).                            │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export type Middleware<
  TBodyIn = unknown,
  TBodyOut = TBodyIn,
  TParamsIn = unknown,
  TParamsOut = TParamsIn,
  TQueryIn = unknown,
  TQueryOut = TQueryIn
> = (
  ctx: RequestContext<TBodyIn, TParamsIn, TQueryIn>,
  next: () => Promise<ApiResponse<unknown>>
) => Promise<ApiResponse<unknown>>;

/**
 * SimpleMiddleware - El tipo práctico para la mayoría de middleware.
 *
 * Usa RequestContext sin generics (todos default a unknown).
 * Es más fácil de componer y suficiente para middleware que:
 * - Solo lee el contexto (logging)
 * - Verifica condiciones y cortocircuita (auth, rate limit)
 * - No necesita transformar los tipos del contexto
 */
export type SimpleMiddleware = (
  ctx: RequestContext,
  next: () => Promise<ApiResponse<unknown>>
) => Promise<ApiResponse<unknown>>;

// ============================================================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ MIDDLEWARE COMO CONSTANTE vs FUNCIÓN                                     │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ authMiddleware es una CONSTANTE de tipo SimpleMiddleware.               │
 * │ Se define directamente como async function expression.                  │
 * │                                                                         │
 * │ Esto contrasta con roleMiddleware() que es una FACTORY FUNCTION         │
 * │ (una función que RETORNA un middleware). La diferencia:                  │
 * │                                                                         │
 * │   authMiddleware          → Middleware listo para usar                  │
 * │   roleMiddleware('ADMIN') → Función que CREA un middleware              │
 * │                                                                         │
 * │ Usa constante cuando: el middleware no necesita configuración           │
 * │ Usa factory cuando:   el middleware necesita parámetros                 │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * @example
 * ```typescript
 * router.get('/protected', authMiddleware, handler);
 * // En el handler, ctx.user está garantizado que existe
 * ```
 */
export const authMiddleware: SimpleMiddleware = async (ctx, next) => {
  // Implementar middleware de autenticación
  // Hint:
  //   1. Obtén el header 'authorization' de ctx.headers
  //   2. Si no existe, retorna error('UNAUTHORIZED', 'Missing authorization header', 401)
  //   3. Extrae el token con authHeader.replace('Bearer ', '')
  //   4. Si el token es vacío o 'invalid', retorna error('UNAUTHORIZED', 'Invalid token', 401)
  //   5. Si todo está bien, llama y retorna next()

  const authHeader = ctx.headers['authorization'];

  if (authHeader === undefined) {
    return error('UNAUTHORIZED', 'Missing authorization header', 401);
  }

  const token = authHeader.replace('Bearer', '').trim();

  if (!token || token === 'invalid') {
    return error('UNAUTHORIZED', 'Invalid token', 401);
  }

  return next();
};

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ FACTORY PATTERN CON REST PARAMETERS                                     │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ roleMiddleware() es una FACTORY: una función que retorna otra función.  │
 * │                                                                         │
 * │ ¿Por qué?                                                               │
 * │ Porque necesitamos configurar QUÉ roles permitir, pero el middleware   │
 * │ se ejecutará después (cuando llegue una request).                       │
 * │                                                                         │
 * │   roleMiddleware(UserRole.ADMIN, UserRole.MANAGER)                     │
 * │   // Retorna: (ctx, next) => { ... verifica que ctx.user tiene rol  } │
 * │                                                                         │
 * │ REST PARAMETERS (...allowedRoles):                                      │
 * │ El operador ... permite pasar cualquier cantidad de roles:              │
 * │   roleMiddleware(UserRole.ADMIN)                            // 1 rol   │
 * │   roleMiddleware(UserRole.ADMIN, UserRole.MANAGER)          // 2 roles │
 * │                                                                         │
 * │ TypeScript infiere el tipo como UserRole[], garantizando que            │
 * │ solo puedes pasar valores válidos de UserRole.                          │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * @example
 * ```typescript
 * router.delete('/users/:id', roleMiddleware(UserRole.ADMIN), handler);
 * // Solo admins pueden acceder
 * ```
 */
export function roleMiddleware(
  ...allowedRoles: UserRole[]
): SimpleMiddleware {
  return async (ctx, next) => {
    // Implementar verificación de roles
    // Hint:
    //   1. Verifica que ctx.user exista, si no → error('UNAUTHORIZED', 'User not authenticated', 401)
    //   2. Verifica que allowedRoles.includes(ctx.user.role)
    //      Si no → error('FORBIDDEN', `Required roles: ${allowedRoles.join(', ')}`, 403, { userRole: ctx.user.role, requiredRoles: allowedRoles })
    //   3. Si todo está bien, llama y retorna next()

    if(!ctx.user) {
      return error('UNAUTHORIZED', 'User not authenticated', 401);
    }

    if (!allowedRoles.includes(ctx.user.role)) {
      return error(
        'FORBIDDEN',
        `Required roles: ${allowedRoles.join(', ')}`,
        403,
        { userRole: ctx.user.role, requiredRoles: allowedRoles }
      );
    }
    
    return next();
  };
}

/**
 * PRESETS: Middleware pre-configurados para casos comunes.
 *
 * Son constantes creadas llamando a la factory.
 * Esto evita repetir roleMiddleware(UserRole.ADMIN) en cada ruta:
 *
 *   router.delete('/users/:id', adminOnly, handler);
 *   // En lugar de:
 *   router.delete('/users/:id', roleMiddleware(UserRole.ADMIN), handler);
 */
export const adminOnly = roleMiddleware(UserRole.ADMIN);
export const managerOrAbove = roleMiddleware(UserRole.ADMIN, UserRole.MANAGER);

// ============================================================================
// MIDDLEWARE DE VALIDACIÓN
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ VALIDATION SCHEMA CON MAPPED TYPES                                      │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ ValidationSchema<T> usa un mapped type para crear reglas de             │
 * │ validación que están ATADAS a los campos de T:                          │
 * │                                                                         │
 * │   [K in keyof T]?: { ... }                                             │
 * │                                                                         │
 * │ Esto significa:                                                          │
 * │ - Solo puedes definir reglas para campos que EXISTEN en T              │
 * │ - La función custom() recibe T[K] (el tipo correcto del campo)         │
 * │                                                                         │
 * │ EJEMPLO:                                                                │
 * │   type User = { email: string; age: number };                          │
 * │   const schema: ValidationSchema<User> = {                             │
 * │     email: { required: true, pattern: /.+@.+/ },                      │
 * │     age: { min: 0, max: 150 },                                         │
 * │     foo: { ... },  // ❌ Error: 'foo' no existe en User                │
 * │   };                                                                    │
 * │                                                                         │
 * │ El ? después de ]?: hace que TODAS las reglas sean opcionales.          │
 * │ No necesitas definir reglas para todos los campos.                      │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export type ValidationSchema<T> = {
  [K in keyof T]?: {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    /** custom() recibe T[K] - el tipo específico del campo K */
    custom?: (value: T[K]) => boolean | string;
  };
};

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ FACTORY CON GENERIC CONSTRAINT                                          │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ validateBody<T extends Record<string, unknown>>                         │
 * │                                                                         │
 * │ El constraint Record<string, unknown> garantiza que T es un objeto     │
 * │ con keys string (no un array, no un primitivo).                         │
 * │ Esto es necesario porque el body de un POST/PUT siempre es un objeto.  │
 * │                                                                         │
 * │ El genérico T se infiere del schema que pasas:                          │
 * │   validateBody(createUserSchema)                                        │
 * │   // T se infiere como CreateUserDTO desde el tipo del schema          │
 * │                                                                         │
 * │ NOTA: Dentro del middleware, hacemos "ctx.body as T".                   │
 * │ Esta assertion es necesaria porque el middleware recibe                  │
 * │ SimpleMiddleware (body: unknown), pero sabemos que el body             │
 * │ DEBERÍA ser de tipo T. La validación que sigue confirma esto.          │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * @example
 * ```typescript
 * const createUserSchema: ValidationSchema<CreateUserDTO> = {
 *   email: { required: true, type: 'string', pattern: /.+@.+\..+/ },
 *   name: { required: true, type: 'string', minLength: 2 },
 * };
 *
 * router.post('/users', validateBody(createUserSchema), handler);
 * ```
 */
export function validateBody<T extends Record<string, unknown>>(
  schema: ValidationSchema<T>
): SimpleMiddleware {
  return async (ctx, next) => {
    const body = ctx.body as T;
    const errors: Record<string, string> = {};
    const entries = Object.entries(schema) as Array<[string, ValidationSchema<T>[keyof T]]>;

    for (const [field, rules] of entries) {
      const value = body[field];
     
      // Required check
      if (rules?.required === true && (value === undefined || value === null)) {
        errors[field] = `${field} is required`;
        continue;
      }

      if (value === undefined) continue;

      // Type check
      if (rules?.type && typeof value !== rules.type) {
        errors[field] = `${field} must be of type ${rules.type}`;
        continue;
      }

      // String validations
      if (typeof value === 'string') {
        if (rules?.minLength !== undefined && value.length < rules.minLength) {
          errors[field] = `${field} must be at least ${rules.minLength} characters`;
        }
        if (rules?.maxLength !== undefined && value.length > rules.maxLength) {
          errors[field] = `${field} must be at most ${rules.maxLength} characters`;
        }
        if (rules?.pattern && !rules.pattern.test(value)) {
          errors[field] = `${field} has invalid format`;
        }
      }

      // Number validations
      if (typeof value === 'number') {
        if (rules?.min !== undefined && value < rules.min) {
          errors[field] = `${field} must be at least ${rules.min}`;
        }
        if (rules?.max !== undefined && value > rules.max) {
          errors[field] = `${field} must be at most ${rules.max}`;
        }
      }

      // Custom validation
      if (rules?.custom) {
        const result = rules.custom(value as T[keyof T]);
        if (result !== true) {
          errors[field] = typeof result === 'string' ? result : `${field} is invalid`;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return error('VALIDATION_ERROR', 'Validation failed', 400, errors);
    }

    return next();
  };
}

/**
 * esta función es una "aduana" para validar los datos que llegan en el body de una petición.
 * La Estructura: validateBody recibe un Schema(reglas de validación) y retorna un middleware que valida el body contra ese schema (async (ctx, next)).
 * El Corazón: Bucle de validación convierte tu esquema en una lista de entradas (Object.entries) y las recorre una por una. Por cada campo, aplica un "check-list" de seguridad:
 * A. Verificación de Obligatoriedad if (rules?.required === true && (value === undefined || value === null))
 * Si la regla dice que es obligatorio y no hay nada, anota el error y salta al siguiente campo (continue).
 * B. Verificación de Tipo if (rules?.type && typeof value !== rules.type).
 * C. Validaciones Específicas de Tipo (minLength, maxLength, pattern para strings; min, max para números).
 * D. Validación Personalizada if (rules?.custom) que permite lógica específica para ese campo.
 * Resultado: Si se acumulan errores, retorna un error de validación con detalles. Si no, llama a next() para continuar la cadena.
 */

// ============================================================================
// MIDDLEWARE DE LOGGING
// ============================================================================

/**
 * Log entry tipado
 */
export type LogEntry = {
  timestamp: Date;
  requestId: string;
  method: string | undefined;
  path: string | undefined;
  statusCode: number;
  duration: number;
  userId?: string | undefined;
  error?: string;
};

/**
 * Logger interface
 */
export interface Logger {
  info(entry: LogEntry): void;
  warn(entry: LogEntry): void;
  error(entry: LogEntry): void;
}

/**
 * Middleware de logging
 *
 * Implementar
 */
export function loggingMiddleware(logger: Logger): SimpleMiddleware {
  return async (ctx, next) => {
    const startTime = Date.now();

    try {
      const response = await next();
      const duration = Date.now() - startTime;

      const entry: LogEntry = {
        timestamp: new Date(),
        requestId: ctx.requestId,
        method: ctx.headers['method'],
        path: ctx.headers['path'],
        statusCode: response.statusCode,
        duration,
        userId: ctx.user?.id,
      };

      if (response.statusCode >= 400) {
        logger.warn(entry);
      } else {
        logger.info(entry);
      }

      return response;
    } catch (err) {
      const duration = Date.now() - startTime;

      logger.error({
        timestamp: new Date(),
        requestId: ctx.requestId,
        method: ctx.headers['method'],
        path: ctx.headers['path'],
        statusCode: 500,
        duration,
        userId: ctx.user?.id,
        error: err instanceof Error ? err.message : 'Unknown error',
      });

      throw err;
    }
  };
}

// ============================================================================
// MIDDLEWARE DE RATE LIMITING
// ============================================================================

/**
 * Configuración de rate limiting.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ FUNCIONES COMO PROPIEDADES DE TIPO                                      │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ keyGenerator y skip son funciones opcionales en el config:              │
 * │                                                                         │
 * │   keyGenerator?: (ctx: RequestContext) => string                       │
 * │   skip?: (ctx: RequestContext) => boolean                              │
 * │                                                                         │
 * │ Esto permite personalizar el comportamiento sin crear subclases:        │
 * │   rateLimitMiddleware({                                                │
 * │     windowMs: 60000,                                                   │
 * │     maxRequests: 100,                                                   │
 * │     keyGenerator: (ctx) => ctx.user?.id ?? 'anonymous', // por usuario │
 * │     skip: (ctx) => ctx.user?.role === 'ADMIN',          // admins free │
 * │   });                                                                  │
 * │                                                                         │
 * │ Este patrón se llama "Strategy Pattern" implementado con funciones.    │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (ctx: RequestContext) => string;
  skip?: (ctx: RequestContext) => boolean;
};

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ CLOSURE-BASED STATE (ESTADO EN CLOSURE)                                  │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Este middleware usa un Map FUERA del middleware retornado:               │
 * │                                                                         │
 * │   function rateLimitMiddleware(config) {                                │
 * │     const requests = new Map();  ← Estado compartido (closure)          │
 * │     return async (ctx, next) => {                                       │
 * │       // Accede a 'requests' via closure                                │
 * │       // El Map persiste entre llamadas al middleware                   │
 * │     };                                                                  │
 * │   }                                                                     │
 * │                                                                         │
 * │ ¿Por qué funciona?                                                      │
 * │ Cuando llamas rateLimitMiddleware(config), se crea el Map.             │
 * │ La función retornada "captura" (cierra sobre) ese Map.                 │
 * │ Cada request accede al MISMO Map, permitiendo contar requests.         │
 * │                                                                         │
 * │ Este es un patrón MUY común en JavaScript/TypeScript para              │
 * │ mantener estado privado sin clases.                                     │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export function rateLimitMiddleware(config: RateLimitConfig): SimpleMiddleware {
  /** Estado compartido entre todas las requests (vive en el closure) */
  const requests = new Map<string, { count: number; resetAt: number }>();

  return async (ctx, next) => {
    // Check if should skip
    if (config.skip?.(ctx) ?? false) {
      return next();
    }

    // Generate key (default: by IP or user)
    const key = config.keyGenerator?.(ctx) ?? ctx.headers['x-forwarded-for'] ?? 'unknown';

    const now = Date.now();
    let entry = requests.get(key);

    // Reset if window expired
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + config.windowMs };
      requests.set(key, entry);
    }

    entry.count++;

    if (entry.count > config.maxRequests) {
      return error(
        'BAD_REQUEST',
        'Too many requests',
        429,
        {
          retryAfter: Math.ceil((entry.resetAt - now) / 1000),
        }
      );
    }

    return next();
  };
}

// ============================================================================
// MIDDLEWARE CHAIN BUILDER
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ MIDDLEWARE CHAIN - COMPOSICIÓN CON BUILDER PATTERN                      │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ MiddlewareChain permite componer múltiples middleware en uno solo       │
 * │ usando el patrón Builder (Fluent API):                                  │
 * │                                                                         │
 * │   const chain = new MiddlewareChain()                                   │
 * │     .use(loggingMiddleware(logger))   // 1ro: logging                  │
 * │     .use(authMiddleware)              // 2do: autenticación             │
 * │     .use(roleMiddleware(UserRole.ADMIN)) // 3ro: autorización          │
 * │     .build();                         // → un solo SimpleMiddleware     │
 * │                                                                         │
 * │ useIf() permite agregar middleware condicionalmente:                     │
 * │   .useIf(process.env.NODE_ENV !== 'test', loggingMiddleware(logger))   │
 * │   // Solo agrega logging fuera de tests                                 │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export class MiddlewareChain {
  private middlewares: SimpleMiddleware[] = [];

  /** Agrega un middleware a la cadena. Retorna 'this' para chaining. */
  use(middleware: SimpleMiddleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  /** Agrega un middleware solo si la condición es true. */
  useIf(condition: boolean, middleware: SimpleMiddleware): this {
    if (condition) {
      this.middlewares.push(middleware);
    }
    return this;
  }

  /**
   * ┌─────────────────────────────────────────────────────────────────────┐
   * │ build() - EJECUCIÓN RECURSIVA CON CLOSURE                          │
   * ├─────────────────────────────────────────────────────────────────────┤
   * │ build() retorna un SimpleMiddleware que ejecuta toda la cadena.    │
   * │                                                                     │
   * │ ¿Cómo funciona executeNext()?                                       │
   * │ Es una función recursiva que mantiene un índice via closure:        │
   * │                                                                     │
   * │   Llamada 1: index=0 → ejecuta middleware[0], pasa executeNext     │
   * │   Llamada 2: index=1 → ejecuta middleware[1], pasa executeNext     │
   * │   Llamada 3: index=2 → no hay más middleware → llama finalHandler  │
   * │                                                                     │
   * │ Cada middleware decide si llama next() (continuar) o retorna       │
   * │ directamente (cortocircuitar).                                     │
   * │                                                                     │
   * │ [...this.middlewares] crea una COPIA del array para evitar que     │
   * │ modificaciones posteriores al chain afecten el middleware built.    │
   * └─────────────────────────────────────────────────────────────────────┘
   */
  build(): SimpleMiddleware {
    const middlewares = [...this.middlewares];

    return async (ctx, finalHandler) => {
      let index = 0;

      const executeNext = async (): Promise<ApiResponse<unknown>> => {
        if (index >= middlewares.length) {
          return finalHandler();
        }

        const currentMiddleware = middlewares[index];
        index++;

        if (currentMiddleware === undefined) {
          return finalHandler();
        }

        return currentMiddleware(ctx, executeNext);
      };

      return executeNext();
    };
  }
}

// ============================================================================
// EJERCICIOS DÍA 6 - MIDDLEWARE
// ============================================================================

/**
 * EJERCICIO 1: Implementa un middleware de cache
 *
 * @example
 * ```typescript
 * const cacheMiddleware = createCacheMiddleware({
 *   ttlSeconds: 60,
 *   keyGenerator: (ctx) => `${ctx.headers.method}:${ctx.headers.path}`,
 * });
 * ```
 */
export function createCacheMiddleware(options: { ttlSeconds: number; keyGenerator: (ctx: RequestContext) => string}): SimpleMiddleware {
  const cache = new Map<string, { value: ApiResponse<unknown>; expiresAt: number }>();

  return async (ctx, next) => {
    const key = options.keyGenerator(ctx);
    const cached = cache.get(key);

    if(cached !== undefined && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const response = await next();
    cache.set(key, { value: response, expiresAt: Date.now() + options.ttlSeconds * 1000 });
    return response;
  };
}

/**
 * EJERCICIO 2: Implementa un middleware de transformación de response
 *
 * @example
 * ```typescript
 * const transformMiddleware = responseTransformer((response) => ({
 *   ...response,
 *   data: { result: response.data, timestamp: Date.now() },
 * }));
 * ```
 */
export function responseTransformer(transform: (response: ApiResponse<unknown>) => ApiResponse<unknown>): SimpleMiddleware {
  return async (ctx, next) => {
    const response = await next();
    return transform(response);
  };
}

/**
 * EJERCICIO 3: Crea un tipo que infiera el contexto modificado por middleware
 *
 * @example
 * ```typescript
 * // Después de authMiddleware, ctx.user debería ser requerido
 * type AuthenticatedContext = ApplyMiddleware<RequestContext, typeof authMiddleware>;
 * ```
 */
type ApplyMiddleware<TContext, TMiddleware> =
  TMiddleware extends (ctx: TContext, next: () => unknown) => unknown 
    ? TContext 
    : never;

// ============================================================================
// NOTAS DE APRENDIZAJE - MIDDLEWARE
// ============================================================================

/**
 * CONCEPTOS CLAVE:
 *
 * 1. MIDDLEWARE PATTERN:
 *    - Funciones que envuelven otras funciones
 *    - Pueden modificar input/output
 *    - Composables y reutilizables
 *
 * 2. NEXT FUNCTION:
 *    - Representa el siguiente paso en la cadena
 *    - Llamar next() continúa la ejecución
 *    - No llamarlo cortocircuita la cadena
 *
 * 3. TYPE SAFETY EN MIDDLEWARE:
 *    - Los tipos pueden transformarse a través de la cadena
 *    - authMiddleware: ctx.user pasa de optional a required
 *    - validateBody: ctx.body pasa de unknown a T
 *
 * 4. FACTORY PATTERN:
 *    - roleMiddleware(...roles) retorna un middleware
 *    - Permite configuración sin perder tipos
 *
 * 5. BUILDER PATTERN:
 *    - MiddlewareChain permite composición fluida
 *    - Method chaining para agregar middlewares
 *    - build() retorna el middleware compuesto
 */

/**
 * MIS NOTAS PERSONALES:
 * Higher-order functions, closures, y composición son herramientas poderosas para crear middleware flexible y reusable. 
 * El desafío es mantener la type safety a medida que transformamos el contexto. 
 * Las factory functions son esenciales para middleware configurables, mientras que los builders facilitan la composición sin perder legibilidad.
 * 
 * Strategy pattern con funciones (keyGenerator, skip) es una forma elegante de permitir personalización sin complicar la API del middleware.
 * El uso de mapped types en ValidationSchema garantiza que las reglas de validación estén siempre alineadas con los campos del tipo que estamos validando, evitando errores comunes.
 */