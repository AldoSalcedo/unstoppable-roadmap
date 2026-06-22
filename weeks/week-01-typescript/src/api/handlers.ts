/**
 * api/handlers.ts - API Handlers Tipados
 * DÍA 6: Integración - API Handlers con Type Safety
 */

import { Result, Ok, Err, AsyncResult } from '../types/base.js';
import { User, Task, TaskStatus, UserStatus, UserRole } from '../types/entities.js';
import {
  UserId,
  TaskId,
  HttpMethod,
  Route,
} from '../types/branded.js';
import {
  CreateUserDTO,
  CreateTaskDTO,
  UpdateTaskDTO,
  UserUpdateDTO,
} from '../types/utilities.js';
import { UserRepository } from '../repositories/Implementations.js';

// ============================================================================
// TAREA 6.1: API HANDLERS TIPADOS
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ REQUEST CONTEXT CON MÚLTIPLES GENERICS                                  │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ RequestContext usa 3 parámetros genéricos para tipar cada parte         │
 * │ de una HTTP request de forma independiente:                             │
 * │                                                                         │
 * │   RequestContext<TBody, TParams, TQuery>                                │
 * │                                                                         │
 * │ PARÁMETROS:                                                              │
 * │   TBody   = Tipo del body (POST/PUT data)                              │
 * │   TParams = Tipo de los path params (/users/:id → { id: string })     │
 * │   TQuery  = Tipo de los query params (?page=1 → { page?: number })    │
 * │                                                                         │
 * │ DEFAULTS (= unknown):                                                   │
 * │ Cada genérico tiene default 'unknown', así puedes omitir los que       │
 * │ no necesitas:                                                           │
 * │   RequestContext                    → todo unknown                      │
 * │   RequestContext<CreateUserDTO>     → body tipado, rest unknown         │
 * │   RequestContext<void, { id: string }> → sin body, params tipados      │
 * │                                                                         │
 * │ Esto permite que cada handler declare EXACTAMENTE qué espera,           │
 * │ y TypeScript verifica que accedas solo a campos que existen.            │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export type RequestContext<TBody = unknown, TParams = unknown, TQuery = unknown> = {
  body: TBody;
  params: TParams;
  query: TQuery;
  headers: Record<string, string>;
  user?: User;
  requestId: string;
};

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ DISCRIMINATED UNION PARA RESPONSES                                      │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ ApiResponse<T> usa el campo 'success' como discriminante:               │
 * │                                                                         │
 * │   success: true  → tiene 'data: T'      (el resultado)                │
 * │   success: false → tiene 'error: ApiError' (el error)                  │
 * │                                                                         │
 * │ Esto FUERZA a manejar ambos casos:                                      │
 * │   const response = await handler(ctx);                                 │
 * │   if (response.success) {                                               │
 * │     response.data;   // ✅ T                                            │
 * │     response.error;  // ❌ No existe en este branch                     │
 * │   } else {                                                              │
 * │     response.error;  // ✅ ApiError                                     │
 * │     response.data;   // ❌ No existe en este branch                     │
 * │   }                                                                     │
 * │                                                                         │
 * │ Es el mismo patrón que Result<T, E> del Día 1, pero aplicado a APIs.  │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export type ApiResponse<T> =
  | { success: true; data: T; statusCode: number }
  | { success: false; error: ApiError; statusCode: number };

/**
 * Error de API tipado
 */
export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ ApiHandler - EL TIPO CENTRAL DE LA API                                  │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Un ApiHandler es una función async que:                                 │
 * │ - Recibe un RequestContext tipado (body, params, query)                 │
 * │ - Retorna una Promise<ApiResponse<TResponse>>                           │
 * │                                                                         │
 * │ Los 4 generics fluyen end-to-end:                                       │
 * │                                                                         │
 * │   ApiHandler<TBody, TParams, TQuery, TResponse>                         │
 * │               ↓         ↓        ↓         ↓                            │
 * │          ctx.body  ctx.params  ctx.query  response.data                 │
 * │                                                                         │
 * │ Esto significa que TypeScript verifica TODA la cadena:                  │
 * │ - Que accedas correctamente al body del request                         │
 * │ - Que los params que lees existan en la ruta                            │
 * │ - Que la respuesta tenga el tipo que prometiste                         │
 * │                                                                         │
 * │ EJEMPLO DE FLUJO:                                                       │
 * │   const handler: ApiHandler<CreateUserDTO, {}, {}, User> = async (ctx) => {
 * │     ctx.body.email;    // ✅ string (viene de CreateUserDTO)            │
 * │     ctx.body.id;       // ❌ Error: id no existe en CreateUserDTO       │
 * │     ctx.params.id;     // ❌ Error: {} no tiene 'id'                    │
 * │     return {                                                            │
 * │       success: true,                                                    │
 * │       data: user,      // ✅ Debe ser User                              │
 * │       statusCode: 201                                                   │
 * │     };                                                                  │
 * │   };                                                                    │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export type ApiHandler<
  TBody = unknown,
  TParams = unknown,
  TQuery = unknown,
  TResponse = unknown
> = (
  ctx: RequestContext<TBody, TParams, TQuery>
) => Promise<ApiResponse<TResponse>>;

// ============================================================================
// DEFINICIÓN DE ENDPOINTS
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ ENDPOINT DEFINITION                                                      │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Agrupa toda la información de un endpoint en un solo tipo:              │
 * │ - method: El verbo HTTP (GET, POST, PUT, PATCH, DELETE)                │
 * │ - path: La ruta del endpoint                                            │
 * │ - handler: La función que maneja la request (con tipos completos)      │
 * │ - middleware: Funciones intermedias (auth, validación, etc.)            │
 * │ - auth: Si requiere autenticación                                       │
 * │                                                                         │
 * │ Los mismos 4 generics del ApiHandler se propagan aquí,                  │
 * │ garantizando que el handler coincida con la definición del endpoint.    │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export type EndpointDefinition<
  TBody = unknown,
  TParams = unknown,
  TQuery = unknown,
  TResponse = unknown
> = {
  method: HttpMethod;
  path: string;
  handler: ApiHandler<TBody, TParams, TQuery, TResponse>;
  middleware?: MiddlewareFunction[];
  auth?: boolean;
};

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ HANDLERS CRUD CON TIPOS EXPLÍCITOS                                      │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Cada handler declara sus 4 generics explícitamente:                     │
 * │   ApiHandler<TBody, TParams, TQuery, TResponse>                        │
 * │                                                                         │
 * │ Convenciones:                                                            │
 * │   void                  → No se espera (ej: GET no tiene body)         │
 * │   Record<string, never> → Objeto vacío (ej: no hay params en /users)  │
 * │   GetUsersQuery         → Query params específicos de este endpoint    │
 * │   User[]                → Tipo de la respuesta exitosa                 │
 * │                                                                         │
 * │ ¿POR QUÉ Record<string, never> EN VEZ DE {}?                           │
 * │ En TypeScript, {} significa "cualquier objeto no-nullish".             │
 * │ Record<string, never> es un objeto que NO puede tener propiedades,     │
 * │ lo cual es más preciso para "no hay parámetros".                       │
 * │                                                                         │
 * │ ¿POR QUÉ User['role'] EN VEZ DE UserRole?                              │
 * │ Ambos funcionan igual, pero User['role'] (indexed access type)         │
 * │ se mantiene sincronizado automáticamente si cambia el tipo de User.    │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

// GET /api/users
export type GetUsersQuery = {
  page?: number;
  pageSize?: number;
  role?: User['role'];
  status?: User['status'];
};

// Implementa getUsersHandler
// - Tipo: ApiHandler<void, Record<string, never>, GetUsersQuery, User[]>
// - GET no tiene body (void), no tiene path params (Record<string, never>)
// - Usa GetUsersQuery para los query params (ctx.query.page, ctx.query.role, etc.)
// - Retorna User[] como response data
// - Hint: usa la función helper success([], 200) para la respuesta
export const getUsersHandler: ApiHandler<
  void,
  Record<string, never>,
  GetUsersQuery,
  User[]
> = (_ctx) => {
  return Promise.resolve(success([], 200));
};

// GET /api/users/:id
export type GetUserParams = {
  id: string;
};

// Implementa getUserHandler
// - Tipo: ApiHandler<void, GetUserParams, Record<string, never>, User>
// - Sin body (void), params tiene { id: string }, sin query params
// - Accede al id con ctx.params.id (type-safe gracias a GetUserParams)
// - Retorna un User o un error NOT_FOUND
// - Hint: usa error('NOT_FOUND', `User ${id} not found`, 404) para el caso de error
export const getUserHandler: ApiHandler<
  void,
  GetUserParams,
  Record<string, never>,
  User
> = async (ctx) => {
  return Promise.resolve(error('NOT_FOUND', `User ${ctx.params.id} not found`, 404));
};

// POST /api/users
// Implementa createUserHandler
// - Tipo: ApiHandler<CreateUserDTO, Record<string, never>, Record<string, never>, User>
// - Body es CreateUserDTO (ctx.body.email, ctx.body.name, ctx.body.role, ctx.body.status)
// - Sin path params ni query params (POST /users crea recurso en colección)
// - Pasos sugeridos:
//   1. Destructura ctx.body para obtener email, name, role, status
//   2. Valida campos requeridos (email, name). Si faltan, retorna error('VALIDATION_ERROR', ...)
//   3. Crea un objeto User con id generado (ej: `user-${Date.now()}`)
//   4. Retorna success(user, 201)
export const createUserHandler: ApiHandler<
  CreateUserDTO,
  Record<string, never>,
  Record<string, never>,
  User
> = async (ctx) => {
  const { email, name, role, status } = ctx.body;
  if (!email || !name) {
    return Promise.resolve(
      error('VALIDATION_ERROR', 'Email and name are required', 400)
    );
  }
  const user: User = {
    id: `user-${Date.now()}`,
    email: email,
    name: name,
    role: role ?? 'USER',
    status: status ?? 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return success(user, 201);
};

// PUT /api/users/:id
export const updateUserHandler: ApiHandler<
  UserUpdateDTO,
  GetUserParams,
  Record<string, never>,
  User
> = async (ctx) => {
  // ctx.body es Partial<User> - solo campos que se pueden actualizar
  if (Object.keys(ctx.body).length === 0) {
    return Promise.resolve(
      error('VALIDATION_ERROR', 'At least one field must be provided for update', 400)
    );
  }
  return Promise.resolve({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Not implemented',
    },
    statusCode: 501,
  });
};

// DELETE /api/users/:id
export const deleteUserHandler: ApiHandler<
  void,
  GetUserParams,
  Record<string, never>,
  void
> = (_ctx) => {
  return Promise.resolve(success(undefined, 204));
};

// ============================================================================
// TASK HANDLERS
// ============================================================================

// GET /api/tasks
export type GetTasksQuery = {
  page?: number;
  pageSize?: number;
  assigneeId?: string;
  priority?: Task['priority'];
  statusType?: TaskStatus['type'];
};

export const getTasksHandler: ApiHandler<
  void,
  Record<string, never>,
  GetTasksQuery,
  Task[]
> = (_ctx) => {
  return Promise.resolve({
    success: true,
    data: [],
    statusCode: 200,
  });
};

// GET /api/tasks/:id
export type GetTaskParams = {
  id: string;
};

export const getTaskHandler: ApiHandler<
  void,
  GetTaskParams,
  Record<string, never>,
  Task
> = async (ctx) => {
  return Promise.resolve({
    success: false,
    error: {
      code: 'TASK_NOT_FOUND',
      message: `Task ${ctx.params.id} not found`,
    },
    statusCode: 404,
});
};

// POST /api/tasks
export const createTaskHandler: ApiHandler<
  CreateTaskDTO,
  Record<string, never>,
  Record<string, never>,
  Task
> = async (ctx) => {
  const { title, description, priority, status, reporterId, tags } = ctx.body;

  if (!title || !description) {
    return Promise.resolve({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Title and description are required',
      },
      statusCode: 400,
    });
  }

  const task: Task = {
    id: `task-${Date.now()}`,
    title,
    description,
    priority,
    status,
    reporterId,
    tags,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return Promise.resolve({
    success: true,
    data: task,
    statusCode: 201,
  });
};

// PATCH /api/tasks/:id
export const updateTaskHandler: ApiHandler<
  UpdateTaskDTO,
  GetTaskParams,
  Record<string, never>,
  Task
> = async (ctx) => {
  // ctx.body es DeepPartial<Task> - cualquier campo puede actualizarse
  if (Object.keys(ctx.body).length === 0) {
    return Promise.resolve({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'At least one field must be provided for update',
      },
      statusCode: 400,
    });
  }
  return Promise.resolve({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Not implemented',
    },
    statusCode: 501,
  });
};

// ============================================================================
// MIDDLEWARE TYPE
// ============================================================================

export type MiddlewareFunction = <TBody, TParams, TQuery>(
  ctx: RequestContext<TBody, TParams, TQuery>,
  next: () => Promise<ApiResponse<unknown>>
) => Promise<ApiResponse<unknown>>;

// ============================================================================
// ERROR HANDLING TYPE-SAFE
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ UNION DE STRING LITERALS PARA CÓDIGOS DE ERROR                          │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ ErrorCode es un Union Type de strings literales. Esto significa:         │
 * │ - Solo los strings listados son valores válidos                         │
 * │ - El IDE ofrece autocomplete de los valores                             │
 * │ - Errores tipográficos se detectan en compile-time                      │
 * │                                                                         │
 * │   createApiError('VALIDATON_ERROR', ...);  // ❌ Typo detectado!        │
 * │   createApiError('VALIDATION_ERROR', ...); // ✅ Valor válido           │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR'
  | 'NOT_IMPLEMENTED'
  | 'CONFLICT'
  | 'BAD_REQUEST';

/**
 * Helper para crear errores de API.
 * Encapsula la creación del objeto ApiError para consistencia.
 */
export function createApiError(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): ApiError {
  return { code, message, ...(details !== undefined && { details })};
}

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ HELPERS CON GENERICS PARA RESPONSES                                     │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ success() y error() simplifican la creación de ApiResponse.             │
 * │                                                                         │
 * │ success<T>() - El genérico T se INFIERE del argumento:                  │
 * │   success(user)         → ApiResponse<User> (T = User)                 │
 * │   success([t1, t2])     → ApiResponse<Task[]> (T = Task[])             │
 * │                                                                         │
 * │ error() - Retorna ApiResponse<never>:                                   │
 * │   'never' como tipo de data significa que NO hay data en errores.      │
 * │   Y como never es asignable a cualquier tipo, esta respuesta           │
 * │   es compatible con cualquier ApiResponse<T>.                          │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export function success<T>(data: T, statusCode = 200): ApiResponse<T> {
  return { success: true, data, statusCode };
}

export function error(
  code: ErrorCode,
  message: string,
  statusCode = 400,
  details?: Record<string, unknown>
): ApiResponse<never> {
  return {
    success: false,
    error: createApiError(code, message, details),
    statusCode,
  };
}

// ============================================================================
// ROUTER TYPE-SAFE
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ ROUTE REGISTRY CON MAPPED TYPE                                          │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ RouteRegistry usa un DOBLE mapped type:                                 │
 * │                                                                         │
 * │   [K in Route]?: {              ← Para cada ruta válida                │
 * │     [M in HttpMethod]?: ...     ← Para cada método HTTP                │
 * │   }                                                                     │
 * │                                                                         │
 * │ Esto crea un tipo donde:                                                │
 * │ - Las keys del primer nivel son Route (template literal types)         │
 * │ - Las keys del segundo nivel son HttpMethod                             │
 * │ - Los valores son EndpointDefinition                                    │
 * │                                                                         │
 * │ TypeScript verifica que solo registres rutas y métodos válidos:          │
 * │   registry['/api/v1/users']?.['GET']  // ✅ Ruta y método válidos       │
 * │   registry['/invalid']?.['GET']       // ❌ Ruta no válida              │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export type RouteRegistry = {
  [K in Route]?: {
    [M in HttpMethod]?: EndpointDefinition;
  };
};

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ ROUTER CON FLUENT API                                                    │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ El Router usa el patrón Fluent API (como QueryBuilder del Día 2)        │
 * │ para registrar endpoints con method chaining:                           │
 * │                                                                         │
 * │   const router = new Router()                                           │
 * │     .get('/users', getUsersHandler)                                     │
 * │     .post('/users', createUserHandler)                                  │
 * │     .delete('/users/:id', deleteUserHandler, { auth: true });           │
 * │                                                                         │
 * │ CONVENIENCIA vs TYPE SAFETY:                                             │
 * │ Los métodos get(), post(), put(), delete() son "convenience wrappers"  │
 * │ sobre register(). Cada uno pre-configura los generics apropiados:       │
 * │                                                                         │
 * │   get()    → TBody = void (GET no tiene body)                          │
 * │   post()   → TParams = {} (POST a colección, sin :id)                  │
 * │   delete() → TBody = void, TResponse = void                            │
 * │                                                                         │
 * │ NOTA: "handler as ApiHandler" en register() es un TYPE ASSERTION        │
 * │ necesario porque TypeScript no puede unificar los generics              │
 * │ específicos de cada handler con el tipo genérico del Map.              │
 * │ Es seguro porque los tipos ya se verificaron en la firma del método.   │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export class Router {
  private routes: Map<string, EndpointDefinition> = new Map();

  /**
   * Método base que registra cualquier endpoint.
   * Los métodos get(), post(), etc. delegan a este.
   */
  register<TBody, TParams, TQuery, TResponse>(
    method: HttpMethod,
    path: string,
    handler: ApiHandler<TBody, TParams, TQuery, TResponse>,
    options?: {
      middleware?: MiddlewareFunction[];
      auth?: boolean;
    }
  ): this {
    const key = `${method} ${path}`;
    this.routes.set(key, {
      method,
      path,
      handler: handler as ApiHandler,
      ...(options?.middleware !== undefined && { middleware: options.middleware }),
      ...((options?.auth !== undefined) && { auth: options.auth }),
    });
    return this;
  }

  /** GET: sin body, con params y query opcionales */
  get<TParams, TQuery, TResponse>(
    path: string,
    handler: ApiHandler<void, TParams, TQuery, TResponse>,
    options?: { middleware?: MiddlewareFunction[]; auth?: boolean }
  ): this {
    return this.register('GET', path, handler, options);
  }

  /** POST: con body, sin params (se usa en colecciones: POST /users) */
  post<TBody, TResponse>(
    path: string,
    handler: ApiHandler<TBody, Record<string, never>, Record<string, never>, TResponse>,
    options?: { middleware?: MiddlewareFunction[]; auth?: boolean }
  ): this {
    return this.register('POST', path, handler, options);
  }

  /** PUT: con body y params (reemplazo completo: PUT /users/:id) */
  put<TBody, TParams, TResponse>(
    path: string,
    handler: ApiHandler<TBody, TParams, Record<string, never>, TResponse>,
    options?: { middleware?: MiddlewareFunction[]; auth?: boolean }
  ): this {
    return this.register('PUT', path, handler, options);
  }

  /** DELETE: sin body, sin response data (DELETE /users/:id) */
  delete<TParams>(
    path: string,
    handler: ApiHandler<void, TParams, Record<string, never>, void>,
    options?: { middleware?: MiddlewareFunction[]; auth?: boolean }
  ): this {
    return this.register('DELETE', path, handler, options);
  }
}

// ============================================================================
// EJERCICIOS DÍA 6 - HANDLERS
// ============================================================================

/**
 * EJERCICIO 1: Implementa un handler que use todos los tipos
 *
 * Debe:
 * - Recibir body tipado
 * - Usar params tipados
 * - Retornar response tipada
 * - Manejar errores con Result
 */
const userRepo = new UserRepository();

const exampleHandler: ApiHandler<
  CreateUserDTO,
  { id: string },
  Record<string, never>,
  User
> = (ctx) => {
  const { email, name } = ctx.body;

  if (email.trim().length === 0 || name.trim().length === 0) {
    return Promise.resolve(error('VALIDATION_ERROR', 'Email and name are required', 400));
  }

  return userRepo.findById(ctx.params.id).then((result) => {
    if (!result.ok) {
      return error('NOT_FOUND', `User with id ${ctx.params.id} not found`, 404);
    }

    const user = result.value;
    return Promise.resolve(success(user, 200));
  });
}

const router = new Router();
router.put('/users/:id', exampleHandler);

/**
 * EJERCICIO 2: Extrae los tipos de un handler usando conditional types + infer.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ INFER CON MÚLTIPLES PARÁMETROS                                          │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Este tipo usa 4 'infer' simultáneos para "desempaquetar" los           │
 * │ generics de un ApiHandler:                                              │
 * │                                                                         │
 * │   H extends ApiHandler<infer TBody, infer TParams, infer TQuery, infer TResponse>
 * │                                                                         │
 * │ Si H = ApiHandler<CreateUserDTO, {id: string}, {}, User>, entonces:    │
 * │   TBody     = CreateUserDTO                                             │
 * │   TParams   = {id: string}                                              │
 * │   TQuery    = {}                                                        │
 * │   TResponse = User                                                      │
 * │                                                                         │
 * │ Esto es útil para introspección de tipos:                               │
 * │   type Types = ExtractHandlerTypes<typeof createUserHandler>;           │
 * │   // { body: CreateUserDTO, params: {}, query: {}, response: User }    │
 * │                                                                         │
 * │ PATRÓN: Es el mismo que FunctionReturnType<T> y FunctionParameters<T>  │
 * │ del Día 5, pero aplicado a un tipo con más parámetros genéricos.       │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export type ExtractHandlerTypes<H> = H extends ApiHandler<
  infer TBody,
  infer TParams,
  infer TQuery,
  infer TResponse
>
  ? {
      body: TBody;
      params: TParams;
      query: TQuery;
      response: TResponse;
    }
  : never;

// ============================================================================
// NOTAS DE APRENDIZAJE - HANDLERS
// ============================================================================

/**
 * CONCEPTOS CLAVE:
 *
 * 1. GENERIC HANDLERS:
 *    - Los handlers son genéricos sobre Body, Params, Query, Response
 *    - Esto permite type safety en toda la cadena
 *    - El IDE provee autocomplete completo
 *
 * 2. REQUEST CONTEXT:
 *    - Agrupa toda la información de la request
 *    - Cada campo tiene su tipo específico
 *    - Evita 'any' en toda la API
 *
 * 3. DISCRIMINATED UNIONS PARA RESPONSE:
 *    - ApiResponse es success: true | success: false
 *    - TypeScript narrowea automáticamente
 *    - Imposible olvidar manejar errores
 *
 * 4. HELPER FUNCTIONS:
 *    - success() y error() simplifican creación de responses
 *    - Mantienen type safety
 *    - Código más limpio y consistente
 */

/**
 * MIS NOTAS PERSONALES:
 * API Handlers nos sirven para definir la lógica de negocio de cada endpoint de forma tipada. 
 * Al usar generics, podemos especificar exactamente qué tipo de datos esperamos en el body, params, query y response. 
 * Esto hace que nuestro código sea mucho más seguro y fácil de mantener, ya que TypeScript nos ayuda a evitar errores comunes como acceder a campos que no existen o retornar tipos incorrectos. 
 * Además, al usar discriminated unions para las respuestas, nos aseguramos de manejar correctamente tanto los casos de éxito como los de error, lo que mejora la robustez de nuestra API.
 * 
 * EndpointsDefinition es un tipo que agrupa toda la información de un endpoint en un solo lugar, lo que facilita su registro y manejo en el router. 
 * El Router implementa un patrón Fluent API para registrar endpoints de manera sencilla y con type safety garantizada.
 * 
 * que quiere decir firma del método? se refiere a la declaración de la función, con sus parámetros y tipos de retorno.
 * 
 * 
 */