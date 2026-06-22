import { AsyncResult } from "../types/base";
import { Project, Task, User } from "../types/entities";
import { InMemoryRepository } from "./base";

export class UserRepository extends InMemoryRepository<User> {
    async findByEmail(email: string): AsyncResult<User, string> {
        const result = await this.findAll();
        if (!result.ok) return result;

        const user = result.value.find(u => u.email === email);
        if (!user) {
            return {ok: false, error: `User with email ${email} not found`};
        }
        return {ok: true, value: user};
    }
}

export class TaskRepository extends InMemoryRepository<Task> {
    async findByUserId(userId: string): AsyncResult<Task[], string> {
        return this.findWhere(t => t.assigneeId === userId);

        // Alternativamente, podríamos usar findAll y luego filtrar, pero findWhere es más eficiente
        const result = await this.findAll();
        if (!result.ok) return result; // Si findAll falla, retornamos el error directamente
    }
}

export class ProjectRepository extends InMemoryRepository<Project> {
    async findByOwnerId(ownerId: string): AsyncResult<Project[], string> {
        return this.findWhere(p => p.ownerId === ownerId);
    }

    async findByStatus(status: Project['status']): AsyncResult<Project[], string> {
        return this.findWhere(p => p.status === status);
    }
}

/**
 * En este archivo se implementan repositorios específicos para cada entidad (UserRepository, TaskRepository) que extienden de InMemoryRepository.
 * Esto nos permite reutilizar toda la lógica CRUD genérica definida en InMemoryRepository, mientras agregamos métodos específicos para cada tipo de entidad.
 * 
 * Por ejemplo, UserRepository tiene un método findByEmail() que busca un usuario por su correo electrónico, y TaskRepository tiene un método findByUserId() que busca tareas por el ID del usuario.
 * Estos métodos utilizan la función findAll() heredada de InMemoryRepository para obtener todos los objetos y luego filtrar según el criterio específico.
 * 
 * Al extender InMemoryRepository<User>, estamos diciendo que UserRepository es un repositorio especializado en manejar objetos de tipo User. 
 * Esto garantiza que todos los métodos CRUD funcionarán con objetos que cumplen con la estructura de User, y que cualquier intento de usar UserRepository con un tipo que no sea User resultará en un error de compilación.
 * Lo mismo aplica para TaskRepository con Task. Esto es una gran ventaja de usar TypeScript, ya que nos da seguridad de tipos en tiempo de compilación y nos ayuda a evitar errores comunes.
 */