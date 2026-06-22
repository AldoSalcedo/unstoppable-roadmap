/**
 * index.ts - Punto de entrada del módulo
 * Exporta todos los tipos, interfaces y clases públicas del sistema
 */

export * from './types/base.js';
export * from './types/entities.js';
export * from './types/utilities.js';
export * from './types/branded.js';
export * from './repositories/base.js';
export * from './repositories/Implementations.js';
export * from './builders/query.js';
export * from './guards/type-guards.js';
export * from './api/handlers.js';
export * from './api/middleware.js';
export * from './plugins/system.js';

// Resolve naming conflicts between modules:
// isTaskInProgress exists in both entities.ts and type-guards.ts — use the guard version
export { isTaskInProgress } from './guards/type-guards.js';
// ApiResponse exists in both handlers.ts and type-guards.ts (exercise stub) — use handlers version
export type { ApiResponse } from './api/handlers.js';
