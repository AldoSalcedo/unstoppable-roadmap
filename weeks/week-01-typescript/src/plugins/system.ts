/**
 * plugins/system.ts - Sistema de Plugins Tipado
 * DÍA 6: Integración - Plugin System con Type Safety
 */

import { Result, Ok, Err } from '../types/base.js';
import { Task, User, Notification } from '../types/entities.js';
import { EventName } from '../types/branded.js';

// ============================================================================
// TAREA 6.2: SISTEMA DE PLUGINS
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ TEMPLATE LITERAL TYPE PARA SEMVER                                       │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ SemVer usa template literal types (del Día 5) para validar             │
 * │ el formato de versión semántica en compile-time:                        │
 * │                                                                         │
 * │   `${number}.${number}.${number}`                                      │
 * │                                                                         │
 * │   const v1: SemVer = '1.0.0';     // ✅                                │
 * │   const v2: SemVer = '2.1.3';     // ✅                                │
 * │   const v3: SemVer = '1.0';       // ❌ Falta patch version            │
 * │   const v4: SemVer = 'v1.0.0';    // ❌ Prefijo 'v' no permitido      │
 * │   const v5: SemVer = '1.0.0-beta';// ❌ Sufijo no permitido           │
 * │                                                                         │
 * │ TypeScript verifica el patrón en compile-time. No es una regex         │
 * │ que se ejecuta en runtime - es validación puramente estática.          │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export type SemVer = `${number}.${number}.${number}`;

/**
 * Metadatos de un plugin
 */
export type PluginMetadata = {
  name: string;
  version: SemVer;
  description: string;
  author?: string;
  dependencies?: Record<string, SemVer>;
};

/**
 * Ciclo de vida del plugin
 */
export type PluginLifecycle = {
  onLoad?: () => Promise<void>;
  onUnload?: () => Promise<void>;
  onEnable?: () => Promise<void>;
  onDisable?: () => Promise<void>;
};

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ INTERFACE GENÉRICA PARA PLUGINS                                          │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ Plugin<TConfig> usa un genérico para tipar la configuración:            │
 * │                                                                         │
 * │   Plugin                    → config es unknown (sin tipo)             │
 * │   Plugin<{ key: string }>   → config es { key: string }               │
 * │                                                                         │
 * │ El default TConfig = unknown permite crear plugins sin config:          │
 * │   const simple: Plugin = { metadata: {...}, hooks: {...} };            │
 * │                                                                         │
 * │ Y con config tipado:                                                    │
 * │   const withConfig: Plugin<{ emailEnabled: boolean }> = {              │
 * │     config: { emailEnabled: true },  // ✅ Tipado                      │
 * │     config: { invalid: 42 },         // ❌ Error de tipo               │
 * │   };                                                                    │
 * │                                                                         │
 * │ PARTIAL<HookDefinitions>:                                               │
 * │ Los hooks son Partial<> porque un plugin no necesita suscribirse       │
 * │ a TODOS los hooks - solo a los que le interesan.                       │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * @example
 * ```typescript
 * const myPlugin: Plugin = {
 *   metadata: {
 *     name: 'my-plugin',
 *     version: '1.0.0',
 *     description: 'My awesome plugin',
 *   },
 *   hooks: {
 *     'task:created': async (task) => {
 *       console.log('Task created:', task.title);
 *     },
 *   },
 * };
 * ```
 */
export interface Plugin<TConfig = unknown> {
  metadata: PluginMetadata;
  config?: TConfig;
  lifecycle?: PluginLifecycle;
  hooks?: Partial<HookDefinitions>;
}

// ============================================================================
// HOOKS SYSTEM TIPADO
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ HOOK DEFINITIONS - MAPA DE TIPO NOMBRE → FIRMA DE FUNCIÓN               │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ HookDefinitions es un tipo que mapea cada nombre de hook               │
 * │ a la firma de función que el handler debe tener.                        │
 * │                                                                         │
 * │ Esto crea un CONTRATO: cuando te suscribes a 'task:created',           │
 * │ tu handler DEBE aceptar (task: Task) como parámetro.                   │
 * │                                                                         │
 * │   hooks: {                                                              │
 * │     'task:created': (task) => { ... },                                 │
 * │     // TS infiere que task es Task (viene de la definición)            │
 * │                                                                         │
 * │     'task:updated': (task, changes) => { ... },                        │
 * │     // TS infiere task: Task, changes: Partial<Task>                   │
 * │   }                                                                     │
 * │                                                                         │
 * │ Si defines un handler con parámetros incorrectos:                       │
 * │   'task:created': (id: string) => { ... }  // ❌ Error de tipo         │
 * │   // Esperado: (task: Task) => void                                     │
 * │                                                                         │
 * │ void | Promise<void> permite handlers síncronos y asíncronos:          │
 * │   'task:created': (task) => { console.log(task); }          // sync   │
 * │   'task:created': async (task) => { await saveLog(task); }  // async  │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export type HookDefinitions = {
  // Task hooks
  'task:created': (task: Task) => void | Promise<void>;
  'task:updated': (task: Task, changes: Partial<Task>) => void | Promise<void>;
  'task:deleted': (taskId: string) => void | Promise<void>;
  'task:assigned': (task: Task, assigneeId: string) => void | Promise<void>;
  'task:completed': (task: Task) => void | Promise<void>;

  // User hooks
  'user:created': (user: User) => void | Promise<void>;
  'user:updated': (user: User, changes: Partial<User>) => void | Promise<void>;
  'user:deleted': (userId: string) => void | Promise<void>;
  'user:login': (user: User) => void | Promise<void>;
  'user:logout': (userId: string) => void | Promise<void>;

  // Notification hooks
  'notification:created': (notification: Notification) => void | Promise<void>;
  'notification:sent': (notification: Notification) => void | Promise<void>;
  'notification:read': (notificationId: string) => void | Promise<void>;

  // System hooks
  'system:startup': () => void | Promise<void>;
  'system:shutdown': () => void | Promise<void>;
  'system:error': (error: Error) => void | Promise<void>;
};

/**
 * Tipo para nombres de hooks.
 * keyof HookDefinitions extrae todas las keys como union:
 *   'task:created' | 'task:updated' | 'task:deleted' | ... | 'system:error'
 */
export type HookName = keyof HookDefinitions;

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ EXTRACCIÓN DE TIPOS CON Parameters<> E INDEXED ACCESS                   │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ HookParams<H> combina dos conceptos:                                    │
 * │                                                                         │
 * │ 1. INDEXED ACCESS TYPE: HookDefinitions[H]                             │
 * │    Si H = 'task:updated', entonces:                                     │
 * │    HookDefinitions['task:updated'] =                                    │
 * │      (task: Task, changes: Partial<Task>) => void | Promise<void>      │
 * │                                                                         │
 * │ 2. BUILT-IN Parameters<>: Extrae los parámetros de una función         │
 * │    Parameters<(task: Task, changes: Partial<Task>) => void>            │
 * │    = [Task, Partial<Task>]   (una tupla)                               │
 * │                                                                         │
 * │ Resultado:                                                               │
 * │   HookParams<'task:created'>  = [Task]                                 │
 * │   HookParams<'task:updated'>  = [Task, Partial<Task>]                  │
 * │   HookParams<'system:error'>  = [Error]                                │
 * │   HookParams<'system:startup'> = []  (tupla vacía, sin parámetros)    │
 * │                                                                         │
 * │ Esto permite que emit() tenga parámetros type-safe (ver PluginRegistry) │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export type HookParams<H extends HookName> = Parameters<HookDefinitions[H]>;

/**
 * El tipo de función handler para un hook específico.
 * HookHandler<'task:created'> = (task: Task) => void | Promise<void>
 */
export type HookHandler<H extends HookName> = HookDefinitions[H];

// ============================================================================
// PLUGIN REGISTRY
// ============================================================================

/**
 * Estado de un plugin
 */
export type PluginState = 'loaded' | 'enabled' | 'disabled' | 'error';

/**
 * Entrada en el registro de plugins
 */
export type PluginRegistryEntry = {
  plugin: Plugin;
  state: PluginState;
  loadedAt: Date;
  error?: Error;
};

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ PLUGIN REGISTRY - PATRÓN REGISTRO CENTRAL                               │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ El Registry es el punto central que:                                     │
 * │ 1. Registra/desregistra plugins                                         │
 * │ 2. Maneja el ciclo de vida (load → enable → disable → unload)          │
 * │ 3. Despacha eventos a los hooks suscritos                               │
 * │                                                                         │
 * │ ALMACENAMIENTO:                                                          │
 * │   plugins: Map<string, PluginRegistryEntry>                            │
 * │   - Key: nombre del plugin (string)                                     │
 * │   - Value: plugin + estado + metadata                                   │
 * │                                                                         │
 * │   hooks: Map<HookName, Set<HookHandler<HookName>>>                     │
 * │   - Key: nombre del hook ('task:created', etc.)                        │
 * │   - Value: Set de handlers suscritos a ese hook                        │
 * │   - Set (no Array) evita handlers duplicados                            │
 * │                                                                         │
 * │ ¿POR QUÉ Map y Set EN LUGAR DE OBJETOS Y ARRAYS?                       │
 * │   Map: Mejor para keys dinámicas, .has()/.get()/.delete() eficientes  │
 * │   Set: Elementos únicos, .add()/.delete()/.has() en O(1)              │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * @example
 * ```typescript
 * const registry = new PluginRegistry();
 *
 * registry.register(myPlugin);
 * registry.enable('my-plugin');
 *
 * // Emitir evento - todos los plugins suscritos reciben
 * await registry.emit('task:created', newTask);
 * ```
 */
export class PluginRegistry {
  private plugins: Map<string, PluginRegistryEntry> = new Map();
  private hooks: Map<HookName, Set<HookHandler<HookName>>> = new Map();

  /**
   * ┌─────────────────────────────────────────────────────────────────────┐
   * │ REGISTER CON GENERIC PASS-THROUGH                                   │
   * ├─────────────────────────────────────────────────────────────────────┤
   * │ register<TConfig>() declara un genérico para que puedas registrar  │
   * │ plugins con CUALQUIER tipo de config:                               │
   * │                                                                     │
   * │   registry.register(simplePlugin);   // TConfig = unknown          │
   * │   registry.register(configPlugin);   // TConfig = { emailEnabled } │
   * │                                                                     │
   * │ El genérico se infiere del argumento - no necesitas escribirlo.    │
   * │                                                                     │
   * │ Internamente, el registry almacena Plugin (sin genérico) porque    │
   * │ no necesita conocer el tipo de config para gestionar el plugin.    │
   * │ El genérico solo sirve para que el caller pueda pasar el tipo      │
   * │ correcto de plugin sin errores de tipo.                            │
   * └─────────────────────────────────────────────────────────────────────┘
   */
  async register<TConfig>(plugin: Plugin<TConfig>): Promise<Result<void, string>> {
    const { name } = plugin.metadata;

    // Check if already registered
    if (this.plugins.has(name)) {
      return Err(`Plugin ${name} is already registered`);
    }

    // Check dependencies
    if (plugin.metadata.dependencies) {
      for (const [dep, version] of Object.entries(plugin.metadata.dependencies)) {
        const depPlugin = this.plugins.get(dep);
        if (!depPlugin) {
          return Err(`Missing dependency: ${dep}@${version}`);
        }
        if(depPlugin.plugin.metadata.version !== version) {
          return Err(`Dependency version mismatch for ${dep}: expected ${version}, found ${depPlugin.plugin.metadata.version}`);
        }
      }
    }

    // Register hooks
    if (plugin.hooks) {
      for (const [hookName, handler] of Object.entries(plugin.hooks)) {
        this.addHook(hookName as HookName, handler as HookHandler<HookName>);
      }
    }

    // Call onLoad lifecycle
    try {
      await plugin.lifecycle?.onLoad?.();
    } catch (err) {
      return Err(`Failed to load plugin ${name}: ${err instanceof Error ? err.message : String(err)}`);
    }

    this.plugins.set(name, {
      plugin,
      state: 'loaded',
      loadedAt: new Date(),
    });

    return Ok(undefined);
  }

  /**
   * Habilita un plugin
   */
  async enable(name: string): Promise<Result<void, string>> {
    const entry = this.plugins.get(name);

    if (!entry) {
      return Err(`Plugin ${name} not found`);
    }

    if (entry.state === 'enabled') {
      return Ok(undefined); // Already enabled
    }

    try {
      await entry.plugin.lifecycle?.onEnable?.();
      entry.state = 'enabled';
      return Ok(undefined);
    } catch (err) {
      entry.state = 'error';
      entry.error = err instanceof Error ? err : new Error(String(err));
      return Err(`Failed to enable plugin ${name}: ${entry.error.message}`);
    }
  }

  /**
   * Deshabilita un plugin
   */
  async disable(name: string): Promise<Result<void, string>> {
    const entry = this.plugins.get(name);

    if (!entry) {
      return Err(`Plugin ${name} not found`);
    }

    if (entry.state === 'disabled') {
      return Ok(undefined);
    }

    try {
      await entry.plugin.lifecycle?.onDisable?.();
      entry.state = 'disabled';
      return Ok(undefined);
    } catch (err) {
      entry.state = 'error';
      entry.error = err instanceof Error ? err : new Error(String(err));
      return Err(`Failed to disable plugin ${name}: ${entry.error.message}`);
    }
  }

  /**
   * Desregistra un plugin
   */
  async unregister(name: string): Promise<Result<void, string>> {
    const entry = this.plugins.get(name);

    if (!entry) {
      return Err(`Plugin ${name} not found`);
    }

    // First disable
    await this.disable(name);

    // Remove hooks
    if (entry.plugin.hooks) {
      for (const [hookName, handler] of Object.entries(entry.plugin.hooks)) {
        this.removeHook(hookName as HookName, handler as HookHandler<HookName>);
      }
    }

    // Call onUnload
    try {
      await entry.plugin.lifecycle?.onUnload?.();
    } catch (err) {
      // Log but don't fail
      entry.error = err instanceof Error ? err : new Error(String(err));
      // eslint-disable-next-line no-console
      console.error(`Error unloading plugin ${name}:`, entry.error);
    }

    this.plugins.delete(name);
    return Ok(undefined);
  }

  /**
   * ┌─────────────────────────────────────────────────────────────────────┐
   * │ EMIT - TYPE-SAFE EVENT EMISSION CON REST + GENERICS                 │
   * ├─────────────────────────────────────────────────────────────────────┤
   * │ Este es uno de los patrones más avanzados del proyecto.             │
   * │ Combina generics + rest parameters + type extraction:               │
   * │                                                                     │
   * │   async emit<H extends HookName>(                                   │
   * │     hookName: H,                                                    │
   * │     ...args: HookParams<H>                                          │
   * │   )                                                                 │
   * │                                                                     │
   * │ ¿Cómo funciona?                                                     │
   * │ 1. H se infiere del primer argumento (hookName)                    │
   * │ 2. HookParams<H> extrae los parámetros de ese hook                │
   * │ 3. ...args exige que pases EXACTAMENTE esos parámetros            │
   * │                                                                     │
   * │ EJEMPLOS:                                                           │
   * │   emit('task:created', task)           // ✅ [Task]                 │
   * │   emit('task:created')                 // ❌ Falta task             │
   * │   emit('task:created', task, extra)    // ❌ Parámetro de más      │
   * │   emit('task:updated', task, changes)  // ✅ [Task, Partial<Task>] │
   * │   emit('system:startup')               // ✅ [] (sin params)       │
   * │                                                                     │
   * │ NOTA: "as (...args: unknown[]) => void | Promise<void>"            │
   * │ Es una assertion necesaria porque TypeScript no puede verificar     │
   * │ que un HookHandler<HookName> (genérico) acepta args específicos.  │
   * │ Ya verificamos los tipos en la firma del método, así que es seguro.│
   * └─────────────────────────────────────────────────────────────────────┘
   */
  async emit<H extends HookName>(
    hookName: H,
    ...args: HookParams<H>
  ): Promise<void> {
    const handlers = this.hooks.get(hookName);

    if (!handlers || handlers.size === 0) {
      return;
    }

    const promises: Promise<void>[] = [];

    for (const handler of handlers) {
      try {
        const result = (handler as (...args: unknown[]) => void | Promise<void>)(...args);
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Error in hook ${hookName}:`, err);
        // Emit system error
        if (hookName !== 'system:error') {
          await this.emit('system:error', err instanceof Error ? err : new Error(String(err)));
        }
      }
    }

    await Promise.all(promises);
  }

  /**
   * Agrega un handler de hook.
   *
   * "handler as HookHandler<HookName>" es necesario porque el Map
   * almacena HookHandler<HookName> (genérico), pero recibimos
   * HookHandler<H> (específico). Como H extends HookName, la
   * conversión es segura pero TypeScript no puede probarlo sin assertion.
   */
  
  private addHook<H extends HookName>(hookName: H, handler: HookHandler<H>): void {
    let handlers = this.hooks.get(hookName);
    if (!handlers) {
      handlers = new Set();
      this.hooks.set(hookName, handlers);
    }
    handlers.add(handler as HookHandler<HookName>);
  }

  /**
   * Remueve un handler de hook.
   */
  private removeHook<H extends HookName>(hookName: H, handler: HookHandler<H>): void {
    const handlers = this.hooks.get(hookName);
    if (handlers) {
      handlers.delete(handler as HookHandler<HookName>);
    }
  }

  /**
   * Obtiene información de un plugin
   */
  getPlugin(name: string): PluginRegistryEntry | undefined {
    return this.plugins.get(name);
  }

  /**
   * Lista todos los plugins
   */
  listPlugins(): PluginRegistryEntry[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Lista plugins por estado
   */
  listByState(state: PluginState): PluginRegistryEntry[] {
    return this.listPlugins().filter(entry => entry.state === state);
  }
}

// ============================================================================
// PLUGIN EXAMPLES
// ============================================================================

/**
 * Ejemplo: Plugin de logging
 */
export const loggingPlugin: Plugin = {
  metadata: {
    name: 'logging-plugin',
    version: '1.0.0',
    description: 'Logs all task and user events',
  },
  hooks: {
    'task:created': (task) => {
      // eslint-disable-next-line no-console
      console.log(`[LOG] Task created: ${task.title}`);
    },
    'task:completed': (task) => {
      // eslint-disable-next-line no-console
      console.log(`[LOG] Task completed: ${task.title}`);
    },
    'user:login': (user) => {
      // eslint-disable-next-line no-console
      console.log(`[LOG] User logged in: ${user.email}`);
    },
    'system:error': (error) => {
      // eslint-disable-next-line no-console
      console.error(`[LOG] System error: ${error.message}`);
    },
  },
};

/**
 * Ejemplo: Plugin de notificaciones
 */
export const notificationPlugin: Plugin<{ emailEnabled: boolean }> = {
  metadata: {
    name: 'notification-plugin',
    version: '1.0.0',
    description: 'Sends notifications on important events',
  },
  config: {
    emailEnabled: true,
  },
  hooks: {
    'task:assigned': async (task, assigneeId) => {
      // Send notification to assignee
      if (!(notificationPlugin.config?.emailEnabled ?? false)) return;
      await Promise.resolve(); // Simulate async operation
      // eslint-disable-next-line no-console
      console.log(`[NOTIFY] Task "${task.title}" assigned to user ${assigneeId}`);
    },
    'notification:created': async (notification) => {
      // Send actual notification
      await Promise.resolve(); // Simulate async operation

      const { kind } = notification.type;
      if (kind === 'TASK_ASSIGNED' || kind === 'TASK_COMPLETED') {
        // handle task-related notifications
      }
      // eslint-disable-next-line no-console
      console.log(`[NOTIFY] New notification: ${kind}`);
    },
  },
  lifecycle: {
    onEnable: async () => {
      await Promise.resolve(); // Simulate async setup
      // eslint-disable-next-line no-console
      console.log('[NOTIFY] Notification plugin enabled');
    },
    onDisable: async () => {
      await Promise.resolve(); // Simulate async teardown
      // eslint-disable-next-line no-console
      console.log('[NOTIFY] Notification plugin disabled');
    },
  },
};

// ============================================================================
// PLUGIN BUILDER
// ============================================================================

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ PLUGIN BUILDER - FLUENT API CON GENÉRICO QUE CAMBIA                     │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ PluginBuilder combina dos patrones avanzados:                           │
 * │                                                                         │
 * │ 1. FLUENT API (como QueryBuilder del Día 2):                           │
 * │    Cada método retorna 'this' para method chaining.                    │
 * │                                                                         │
 * │ 2. GENERIC MUTATION (como TaskBuilder del Día 2):                      │
 * │    withConfig<C>() CAMBIA el genérico de la clase:                     │
 * │      PluginBuilder<Record<string, never>>                              │
 * │      → PluginBuilder<{ emailEnabled: boolean }>                        │
 * │                                                                         │
 * │ on<H>() usa el mismo patrón que emit<H>():                             │
 * │ - H se infiere del nombre del hook                                      │
 * │ - El handler se verifica contra HookHandler<H>                          │
 * │                                                                         │
 * │   .on('task:created', (task) => { ... })                               │
 * │   // H = 'task:created', handler debe ser (task: Task) => void        │
 * │                                                                         │
 * │   .on('task:created', (id: string) => { ... })                         │
 * │   // ❌ Error: handler no coincide con HookHandler<'task:created'>     │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * @example
 * ```typescript
 * const plugin = new PluginBuilder('my-plugin', '1.0.0')
 *   .description('My plugin')
 *   .author('Me')
 *   .on('task:created', (task) => console.log(task))
 *   .on('user:login', (user) => console.log(user))
 *   .withConfig({ key: 'value' })
 *   .build();
 * ```
 */
export class PluginBuilder<TConfig = Record<string, never>> {
  private _metadata: PluginMetadata;
  private _hooks: Partial<HookDefinitions> = {};
  private _lifecycle: PluginLifecycle = {};
  private _config?: TConfig;

  constructor(name: string, version: SemVer) {
    this._metadata = {
      name,
      version,
      description: '',
    };
  }

  description(desc: string): this {
    this._metadata.description = desc;
    return this;
  }

  author(author: string): this {
    this._metadata.author = author;
    return this;
  }

  dependsOn(name: string, version: SemVer): this {
    this._metadata.dependencies = this._metadata.dependencies || {};
    this._metadata.dependencies[name] = version;
    return this;
  }

  on<H extends HookName>(hookName: H, handler: HookHandler<H>): this {
    this._hooks[hookName] = handler as HookDefinitions[H];
    return this;
  }

  onLoad(fn: () => Promise<void>): this {
    this._lifecycle.onLoad = fn;
    return this;
  }

  onUnload(fn: () => Promise<void>): this {
    this._lifecycle.onUnload = fn;
    return this;
  }

  onEnable(fn: () => Promise<void>): this {
    this._lifecycle.onEnable = fn;
    return this;
  }

  onDisable(fn: () => Promise<void>): this {
    this._lifecycle.onDisable = fn;
    return this;
  }

  /**
   * ┌─────────────────────────────────────────────────────────────────────┐
   * │ withConfig<C>() - CAMBIA EL GENÉRICO DE LA CLASE                    │
   * ├─────────────────────────────────────────────────────────────────────┤
   * │ Este método introduce un NUEVO genérico C que reemplaza TConfig:   │
   * │                                                                     │
   * │   builder                           → PluginBuilder<{}>            │
   * │   builder.withConfig({ x: true })   → PluginBuilder<{ x: boolean }>│
   * │                                                                     │
   * │ ¿Por qué "as unknown as PluginBuilder<C>"?                         │
   * │ TypeScript no permite convertir directamente entre                  │
   * │ PluginBuilder<TConfig> y PluginBuilder<C> porque son tipos         │
   * │ diferentes. El paso intermedio por 'unknown' es necesario.         │
   * │                                                                     │
   * │ ¿Es seguro? Sí, porque:                                            │
   * │ - Es la misma instancia (mismo objeto en memoria)                  │
   * │ - Solo cambia el tipo de _config, que estamos actualizando        │
   * │ - build() usará el nuevo tipo C para Plugin<TConfig>               │
   * └─────────────────────────────────────────────────────────────────────┘
   */
  withConfig<C>(config: C): PluginBuilder<C> {
    (this as unknown as PluginBuilder<C>)._config = config;
    return this as unknown as PluginBuilder<C>;
  }

  build(): Plugin<TConfig> {
    const plugin: Plugin<TConfig> = {
      metadata: this._metadata,
      hooks: this._hooks,
      lifecycle: this._lifecycle,
    };

    if (this._config !== undefined) {
      plugin.config = this._config;
    }

    return plugin;
  }
}

// ============================================================================
// EJERCICIOS DÍA 6 - PLUGINS
// ============================================================================

/**
 * EJERCICIO 1: Crea un plugin que valide tareas antes de crearlas
 *
 * @example
 * ```typescript
 * const validationPlugin: Plugin = {
 *   hooks: {
 *     'task:created': (task) => {
 *       if (!task.title) throw new Error('Title required');
 *     },
 *   },
 * };
 * ```
 */
type ValidationHooks = {
  'task:created': (task: Task) => void | Promise<void>;
}

export const validationPlugin: Plugin & { hooks: ValidationHooks } = {
  metadata: {
    name: 'validation-plugin',
    version: '1.0.0',
    description: 'Validates tasks before creation',
  },
  hooks: {
    'task:created': (task) => {
      if (task.title.trim().length === 0) {
        throw new Error('Title is required');
      }
      if (task.dueDate && task.dueDate < new Date()) {
        throw new Error('Due date cannot be in the past');
      }
    },
  }
}

export const validationPluginWithExtractor: PluginHooks<typeof validationPlugin> = {
  'task:created': (task) => {
    if (task.title.trim().length === 0) {
      throw new Error('Title is required');
    }
    if (task.dueDate && task.dueDate < new Date()) {
      throw new Error('Due date cannot be in the past');
    }
  },
};

export const validationPluginWithBuilder = new PluginBuilder('validation-plugin', '1.0.0')
  .description('Validates tasks before creation')
  .on('task:created', (task) => {
    if (task.title.trim().length === 0) {
      throw new Error('Title is required');
    }
    if (task.dueDate && task.dueDate < new Date()) {
      throw new Error('Due date cannot be in the past');
    }
  })
  .build();

/**
 * EJERCICIO 2: Implementa un plugin de métricas
 * Que cuente eventos y los almacene
 */
type MetricsHooks = {
  'task:created': (task: Task) => void | Promise<void>;
  'user:created': (user: User) => void | Promise<void>;
}

const metricsStore: Record<string, number> = {};

export const metricsPlugin: Plugin & { hooks: MetricsHooks } = {
  metadata: {
    name: 'metrics-plugin',
    version: '1.0.0',
    description: 'Collects metrics on task and user events',
  },
  hooks: {
    'task:created': (task) => {
      if (task.title.trim().length === 0) return; // Ignore invalid tasks
      if (metricsStore['tasksCreated'] === undefined) return; // Store not initialized
      metricsStore['tasksCreated'] = (metricsStore['tasksCreated'] || 0) + 1;
    },
    'user:created': (user) => {
      if (!user.email) return; // Ignore invalid users
      if (metricsStore['usersCreated'] === undefined) return; // Store not initialized
      metricsStore['usersCreated'] = (metricsStore['usersCreated'] || 0) + 1;
    },
  },
};

export const metricsPluginWithExtractor: PluginHooks<typeof metricsPlugin> = {
  'task:created': (task) => {
    if (!task.title) return; // Ignore invalid tasks
    if (metricsStore['tasksCreated'] === undefined) return; // Store not initialized
    metricsStore['tasksCreated'] = (metricsStore['tasksCreated'] || 0) + 1;
  },
  'user:created': (user) => {
    if (!user.email) return; // Ignore invalid users
    if (metricsStore['usersCreated'] === undefined) return; // Store not initialized
    metricsStore['usersCreated'] = (metricsStore['usersCreated'] || 0) + 1;
  },
};

export const metricsPluginWithBuilder = new PluginBuilder('metrics-plugin', '1.0.0')
  .description('Collects metrics on task and user events')
  .on('task:created', (task) => {
    if (!task.title) return; // Ignore invalid tasks
    if (metricsStore['tasksCreated'] === undefined) return; // Store not initialized
    metricsStore['tasksCreated'] = (metricsStore['tasksCreated'] || 0) + 1;
  })
  .on('user:created', (user) => {
    if (!user.email) return; // Ignore invalid users
    if (metricsStore['usersCreated'] === undefined) return; // Store not initialized
    metricsStore['usersCreated'] = (metricsStore['usersCreated'] || 0) + 1;
  })
  .build();

/**
 * EJERCICIO 3: Crea un tipo que extraiga todos los hooks de un plugin
 *
 * @example
 * ```typescript
 * type PluginHooks<P extends Plugin> = ... // implementar
 * ```
 */
export type PluginHooks<P extends Plugin> = P extends Plugin<unknown>
  ? NonNullable<P['hooks']>
  : never;
  /**
   * EXPLICACIÓN:
   * PluginHooks<P> es un tipo condicional que verifica si P extiende Plugin<unknown>.
   * Si es así, extrae el tipo de hooks usando P['hooks'].
   * NonNullable<> se usa para eliminar la posibilidad de undefined, ya que hooks es opcional.
   * Si P no extiende Plugin, el resultado es never (no válido).
   * 
   * Ejemplo de uso:
   * type ValidationHooks = PluginHooks<typeof validationPlugin>;
   * // ValidationHooks = { 'task:created': (task: Task) => void }
   * 
   * type MetricsHooks = PluginHooks<typeof metricsPlugin>;
   * // MetricsHooks = { 'task:created': (task: Task) => void, 'user:created': (user: User) => void }
   */

// ============================================================================
// NOTAS DE APRENDIZAJE - PLUGINS
// ============================================================================

/**
 * CONCEPTOS CLAVE:
 *
 * 1. PLUGIN INTERFACE:
 *    - Define contrato que todos los plugins deben cumplir
 *    - Metadata para identificación
 *    - Hooks para funcionalidad
 *    - Lifecycle para control de estado
 *
 * 2. HOOK DEFINITIONS:
 *    - Mapa de nombre -> firma de función
 *    - Type-safe: emit() verifica argumentos
 *    - Extensible: agregar nuevos hooks es fácil
 *
 * 3. TYPE INFERENCE:
 *    - HookParams<H> extrae parámetros del hook
 *    - emit() usa esto para type safety
 *    - No puedes pasar argumentos incorrectos
 *
 * 4. REGISTRY PATTERN:
 *    - Registro central de plugins
 *    - Manejo de ciclo de vida
 *    - Despacho de eventos a hooks
 *
 * 5. BUILDER PATTERN:
 *    - API fluida para crear plugins
 *    - Method chaining type-safe
 *    - Config genérico
 *
 * 6. DISCRIMINATED UNIONS EN ESTADO:
 *    - PluginState es union de strings
 *    - Permite narrowing en switch/if
 *    - Estado explícito y type-safe
 */

/**
 * MIS NOTAS PERSONALES:
 * SemVer que es? Es un formato de versión común en software: major.minor.patch
 * Ejemplo: 1.0.0, 2.1.3, etc.
 * Template literal types permiten validar este formato en compile-time.
 * 
 * que es un plugin? Es un módulo de código que extiende la funcionalidad de una aplicación sin modificar su código base. 
 * Permite agregar características de forma modular y opcional.
 * Un sistema de plugins es una arquitectura que permite a los desarrolladores crear y registrar plugins que se integran con la aplicación principal a través de hooks o eventos.
 * 
 * plugun builder es una clase que facilita la creación de plugins usando un patrón de diseño fluido (fluent API). Permite configurar metadata, hooks, lifecycle y config de forma encadenada y type-safe.
 * 
 * que significa this en el contexto de una clase? Es una referencia a la instancia actual de la clase. Permite acceder a propiedades y métodos de esa instancia. En un método, retornar this permite encadenar llamadas (method chaining).
 * 
 * que es un generic mutation? Es un patrón donde un método de una clase con genéricos permite cambiar el tipo genérico de la clase. En PluginBuilder, withConfig<C>() cambia el tipo TConfig a C, permitiendo configurar plugins con diferentes tipos de configuración.
 * 
 * que es un type extractor? Es un tipo genérico que extrae información de otro tipo. En este caso, PluginHooks<P> extrae el tipo de hooks de un plugin P, permitiendo obtener solo esa parte del tipo para usarla en otros contextos.
 * 
 * que es un discriminated union? Es un tipo union que tiene una propiedad común (discriminante) que permite a TypeScript determinar qué tipo específico se está usando. En PluginState, el discriminante es el valor string ('loaded', 'enabled', etc.), lo que permite hacer narrowing en condiciones.
 * 
 * que es un rest parameter? Es una sintaxis en JavaScript/TypeScript que permite a una función aceptar un número variable de argumentos como un array. En emit(), ...args: HookParams<H> permite pasar los parámetros específicos de cada hook de forma flexible y type-safe.
 * 
 * que es un indexed access type? Es una forma de acceder a un tipo dentro de otro tipo usando la sintaxis T[K]. En HookParams<H>, usamos HookDefinitions[H] para obtener el tipo de función asociado al hook H, y luego Parameters<> para extraer sus parámetros.
 * 
 * que es un built-in utility type? Son tipos genéricos predefinidos en TypeScript que realizan operaciones comunes sobre tipos. Parameters<T> es uno de ellos, que extrae los tipos de los parámetros de una función T como una tupla.
 * 
 * que es una tupla en TypeScript? Es un tipo de array con longitud fija y tipos específicos para cada posición. Por ejemplo, [string, number] es una tupla que espera un string seguido de un number. 
 * En HookParams<H>, el resultado de Parameters<> es una tupla que representa los parámetros esperados por el hook H.
 */