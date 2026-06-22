# 🏗️ WEEK 3: Clean Architecture - Sprint Guide

**Duration:** 7 days  
**Level:** Advanced  
**Prerequisites:** Week 1 (TypeScript), Week 2 (Testing)  
**Goal:** Master scalable architecture patterns for large-scale React/React Native applications

---

## 🎯 Overview

Transform from "components folder chaos" to professional **Feature-Based Architecture** that scales to enterprise applications.

### Why Clean Architecture Matters:

```
Junior/Mid Structure:           Senior/Architect Structure:
src/                           src/
├── components/                ├── features/
│   ├── Button.tsx            │   ├── tasks/
│   ├── TaskItem.tsx          │   │   ├── domain/
│   ├── UserCard.tsx          │   │   ├── application/
│   └── ... (100+ files)      │   │   ├── infrastructure/
├── utils/                     │   │   └── presentation/
├── hooks/                     │   ├── users/
└── services/                  │   └── projects/
                               ├── shared/
❌ Hard to navigate            ├── core/
❌ Unclear dependencies        └── config/
❌ Difficult to test           
❌ Coupling everywhere         ✅ Clear boundaries
                               ✅ Easy to navigate
                               ✅ Testable in isolation
                               ✅ Reusable features
```

---

## 📚 Learning Objectives

By the end of Week 3, you will master:

### Architecture Patterns:
- ✅ **Feature-Based Structure**: Organize by business capability
- ✅ **Clean Architecture Layers**: Domain → Application → Infrastructure → Presentation
- ✅ **Dependency Injection**: Inversion of Control
- ✅ **SOLID Principles**: Applied to React/TypeScript
- ✅ **Ports & Adapters**: Hexagonal architecture

### Monorepo Management:
- ✅ **Turborepo**: High-performance build system
- ✅ **Shared Packages**: Reusable across apps
- ✅ **Workspace Protocol**: Dependency management
- ✅ **Build Optimization**: Caching strategies

### Advanced Patterns:
- ✅ **Repository Pattern**: Data access abstraction
- ✅ **Use Case Pattern**: Business logic encapsulation
- ✅ **Factory Pattern**: Object creation
- ✅ **Observer Pattern**: Event-driven architecture

---

## 🗂️ Project: Enterprise Task Manager

### Feature-Based Structure:

```
task-manager-enterprise/
├── apps/
│   ├── web/                  # Next.js web app
│   └── mobile/               # React Native app
├── packages/
│   ├── core/                 # Shared business logic
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   └── repositories/
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   └── services/
│   │   └── infrastructure/
│   │       ├── persistence/
│   │       └── api/
│   ├── ui/                   # Shared components
│   ├── config/               # Shared config
│   └── utils/                # Shared utilities
└── turbo.json
```

### Clean Architecture Layers:

```typescript
// Domain Layer (innermost - pure business logic)
export class Task {
  constructor(
    public readonly id: TaskId,
    public readonly title: string,
    private status: TaskStatus
  ) {}

  complete(userId: UserId): void {
    if (this.status.isCompleted()) {
      throw new Error('Task already completed');
    }
    this.status = TaskStatus.completed(userId);
  }
}

// Application Layer (use cases)
export class CompleteTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private eventBus: IEventBus
  ) {}

  async execute(taskId: TaskId, userId: UserId): Promise<void> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new TaskNotFoundError(taskId);

    task.complete(userId);
    
    await this.taskRepository.save(task);
    await this.eventBus.publish(new TaskCompletedEvent(taskId, userId));
  }
}

// Infrastructure Layer (implementation details)
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: TaskId): Promise<Task | null> {
    const data = await this.prisma.task.findUnique({
      where: { id: id.value }
    });
    return data ? TaskMapper.toDomain(data) : null;
  }

  async save(task: Task): Promise<void> {
    const data = TaskMapper.toPersistence(task);
    await this.prisma.task.upsert({
      where: { id: data.id },
      create: data,
      update: data
    });
  }
}

// Presentation Layer (React components)
export function TaskItem({ taskId }: { taskId: string }) {
  const completeTask = useCompleteTask();

  const handleComplete = async () => {
    await completeTask.execute(new TaskId(taskId), getCurrentUserId());
  };

  return (
    <div>
      {/* UI */}
      <button onClick={handleComplete}>Complete</button>
    </div>
  );
}
```

---

## 📅 Day-by-Day Sprint Plan

### **DAY 1: Monday - Clean Architecture Principles** (3-4 hours)

#### Morning Standup (30 min)
- Review current architecture problems
- Learn Clean Architecture layers
- Understand dependency rules

#### Development (2.5 hours)

**Task 1.1: Study Clean Architecture** (1 hour)
- Read: "Clean Architecture" by Uncle Bob (Chapter 22)
- Watch: [Clean Architecture in React](https://www.youtube.com/watch?v=CnailTcJV_U)
- Diagram current vs. target architecture

**Task 1.2: Define Domain Layer** (1.5 hours)
```typescript
// packages/core/src/domain/entities/Task.ts
export class Task extends Entity<TaskProps> {
  get title(): string {
    return this.props.title;
  }

  get status(): TaskStatus {
    return this.props.status;
  }

  public complete(userId: UserId, completedAt: Date): void {
    // Business rule: Can't complete if blocked
    if (this.props.status.isBlocked()) {
      throw new TaskBlockedError(this.id);
    }

    // Business rule: Must be assigned to complete
    if (!this.props.assigneeId) {
      throw new TaskNotAssignedError(this.id);
    }

    this.props.status = TaskStatus.completed(userId, completedAt);
    this.props.updatedAt = completedAt;

    // Domain event
    this.addDomainEvent(new TaskCompletedEvent(this.id, userId));
  }

  public assignTo(userId: UserId): void {
    // Business rule: Can't reassign completed tasks
    if (this.props.status.isCompleted()) {
      throw new TaskCompletedError(this.id);
    }

    this.props.assigneeId = userId;
    this.addDomainEvent(new TaskAssignedEvent(this.id, userId));
  }

  public static create(props: CreateTaskProps): Task {
    // Business validation
    if (!props.title || props.title.trim().length === 0) {
      throw new InvalidTaskTitleError();
    }

    return new Task({
      ...props,
      status: TaskStatus.todo(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

// packages/core/src/domain/value-objects/TaskStatus.ts
export class TaskStatus extends ValueObject<TaskStatusProps> {
  private constructor(props: TaskStatusProps) {
    super(props);
  }

  public static todo(): TaskStatus {
    return new TaskStatus({ type: 'TODO' });
  }

  public static inProgress(startedAt: Date, progress: number): TaskStatus {
    if (progress < 0 || progress > 100) {
      throw new InvalidProgressError(progress);
    }
    return new TaskStatus({ type: 'IN_PROGRESS', startedAt, progress });
  }

  public static completed(userId: UserId, completedAt: Date): TaskStatus {
    return new TaskStatus({ 
      type: 'COMPLETED', 
      completedBy: userId, 
      completedAt 
    });
  }

  public isCompleted(): boolean {
    return this.props.type === 'COMPLETED';
  }

  public isBlocked(): boolean {
    return this.props.type === 'BLOCKED';
  }
}
```

#### Daily Review (30 min)
- Verify domain logic has no dependencies
- Document business rules
- Plan application layer

**Resources:**
- [Clean Architecture Book](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)
- [DDD in TypeScript](https://khalilstemmler.com/articles/domain-driven-design-intro/)

---

### **DAY 2: Tuesday - Application Layer & Use Cases** (3-4 hours)

#### Morning Standup (30 min)
- Review domain layer
- Understand use case pattern
- Plan dependency injection

#### Development (2.5 hours)

**Task 2.1: Create Use Cases** (2 hours)
```typescript
// packages/core/src/application/use-cases/CompleteTask.ts
export interface ICompleteTaskUseCase {
  execute(request: CompleteTaskRequest): Promise<CompleteTaskResponse>;
}

export class CompleteTaskUseCase implements ICompleteTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private userRepository: IUserRepository,
    private eventBus: IEventBus,
    private logger: ILogger
  ) {}

  async execute(request: CompleteTaskRequest): Promise<CompleteTaskResponse> {
    this.logger.info('Completing task', { taskId: request.taskId });

    // 1. Validate user has permission
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new UserNotFoundError(request.userId);
    }

    // 2. Get task
    const task = await this.taskRepository.findById(request.taskId);
    if (!task) {
      throw new TaskNotFoundError(request.taskId);
    }

    // 3. Business logic (domain)
    task.complete(user.id, new Date());

    // 4. Persist
    await this.taskRepository.save(task);

    // 5. Publish events
    const events = task.getDomainEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }

    this.logger.info('Task completed successfully', { taskId: task.id });

    return {
      taskId: task.id.value,
      completedAt: task.status.completedAt!,
    };
  }
}

// packages/core/src/application/use-cases/CreateTask.ts
export class CreateTaskUseCase implements ICreateTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private userRepository: IUserRepository,
    private eventBus: IEventBus
  ) {}

  async execute(request: CreateTaskRequest): Promise<CreateTaskResponse> {
    // 1. Validate reporter exists
    const reporter = await this.userRepository.findById(request.reporterId);
    if (!reporter) {
      throw new UserNotFoundError(request.reporterId);
    }

    // 2. Create domain entity
    const task = Task.create({
      title: request.title,
      description: request.description,
      priority: request.priority,
      reporterId: reporter.id,
      assigneeId: request.assigneeId 
        ? new UserId(request.assigneeId) 
        : undefined,
    });

    // 3. Persist
    await this.taskRepository.save(task);

    // 4. Publish events
    await this.eventBus.publish(new TaskCreatedEvent(task.id, reporter.id));

    return {
      taskId: task.id.value,
      createdAt: task.createdAt,
    };
  }
}
```

**Task 2.2: Dependency Injection Container** (30 min)
```typescript
// packages/core/src/application/di/container.ts
export class DIContainer {
  private services = new Map<string, any>();

  register<T>(key: string, factory: () => T): void {
    this.services.set(key, factory);
  }

  resolve<T>(key: string): T {
    const factory = this.services.get(key);
    if (!factory) {
      throw new Error(`Service ${key} not registered`);
    }
    return factory();
  }
}

// Setup
export function setupContainer(): DIContainer {
  const container = new DIContainer();

  // Infrastructure
  container.register('PrismaClient', () => new PrismaClient());
  container.register('Logger', () => new WinstonLogger());
  container.register('EventBus', () => new InMemoryEventBus());

  // Repositories
  container.register('TaskRepository', () => 
    new PrismaTaskRepository(container.resolve('PrismaClient'))
  );
  container.register('UserRepository', () =>
    new PrismaUserRepository(container.resolve('PrismaClient'))
  );

  // Use Cases
  container.register('CompleteTaskUseCase', () =>
    new CompleteTaskUseCase(
      container.resolve('TaskRepository'),
      container.resolve('UserRepository'),
      container.resolve('EventBus'),
      container.resolve('Logger')
    )
  );

  return container;
}
```

#### Daily Review (30 min)
- Test use cases with mocks
- Verify dependency injection works
- Document use case flows

**Resources:**
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Dependency Injection in TypeScript](https://khalilstemmler.com/articles/software-design-architecture/dependency-injection/)

---

### **DAY 3: Wednesday - Infrastructure Layer** (3-4 hours)

#### Morning Standup (30 min)
- Review application layer
- Understand adapters pattern
- Plan repository implementations

#### Development (2.5 hours)

**Task 3.1: Repository Implementations** (1.5 hours)
```typescript
// packages/core/src/infrastructure/persistence/PrismaTaskRepository.ts
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: TaskId): Promise<Task | null> {
    const data = await this.prisma.task.findUnique({
      where: { id: id.value },
      include: { assignee: true, reporter: true }
    });

    return data ? TaskMapper.toDomain(data) : null;
  }

  async findAll(filters?: TaskFilters): Promise<Task[]> {
    const where = this.buildWhereClause(filters);
    
    const data = await this.prisma.task.findMany({
      where,
      include: { assignee: true, reporter: true },
      orderBy: { createdAt: 'desc' }
    });

    return data.map(TaskMapper.toDomain);
  }

  async save(task: Task): Promise<void> {
    const data = TaskMapper.toPersistence(task);
    
    await this.prisma.task.upsert({
      where: { id: data.id },
      create: data,
      update: data
    });
  }

  async delete(id: TaskId): Promise<void> {
    await this.prisma.task.delete({
      where: { id: id.value }
    });
  }

  private buildWhereClause(filters?: TaskFilters) {
    if (!filters) return {};

    return {
      ...(filters.status && { status: filters.status }),
      ...(filters.assigneeId && { assigneeId: filters.assigneeId.value }),
      ...(filters.priority && { priority: filters.priority }),
    };
  }
}

// packages/core/src/infrastructure/mappers/TaskMapper.ts
export class TaskMapper {
  static toDomain(raw: PrismaTask): Task {
    return new Task({
      id: new TaskId(raw.id),
      title: raw.title,
      description: raw.description,
      status: this.mapStatus(raw.status, raw),
      priority: raw.priority as TaskPriority,
      assigneeId: raw.assigneeId ? new UserId(raw.assigneeId) : undefined,
      reporterId: new UserId(raw.reporterId),
      tags: raw.tags,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(task: Task): PrismaTaskData {
    return {
      id: task.id.value,
      title: task.title,
      description: task.description,
      status: task.status.type,
      priority: task.priority,
      assigneeId: task.assigneeId?.value,
      reporterId: task.reporterId.value,
      tags: task.tags,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  private static mapStatus(type: string, raw: any): TaskStatus {
    switch (type) {
      case 'TODO':
        return TaskStatus.todo();
      case 'IN_PROGRESS':
        return TaskStatus.inProgress(raw.startedAt, raw.progress);
      case 'COMPLETED':
        return TaskStatus.completed(
          new UserId(raw.completedBy),
          raw.completedAt
        );
      default:
        throw new Error(`Unknown status: ${type}`);
    }
  }
}
```

**Task 3.2: Event Bus Implementation** (1 hour)
```typescript
// packages/core/src/infrastructure/events/InMemoryEventBus.ts
export class InMemoryEventBus implements IEventBus {
  private handlers = new Map<string, EventHandler[]>();

  subscribe<T extends DomainEvent>(
    eventName: string, 
    handler: EventHandler<T>
  ): void {
    const handlers = this.handlers.get(eventName) || [];
    handlers.push(handler as EventHandler);
    this.handlers.set(eventName, handlers);
  }

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.constructor.name) || [];
    
    for (const handler of handlers) {
      try {
        await handler.handle(event);
      } catch (error) {
        console.error(`Error handling event ${event.constructor.name}:`, error);
        // In production, you might want to retry or log to external service
      }
    }
  }
}

// Event handlers
export class SendNotificationOnTaskCompleted 
  implements EventHandler<TaskCompletedEvent> {
  
  constructor(
    private notificationService: INotificationService,
    private userRepository: IUserRepository
  ) {}

  async handle(event: TaskCompletedEvent): Promise<void> {
    const task = await this.taskRepository.findById(event.taskId);
    if (!task || !task.assigneeId) return;

    const user = await this.userRepository.findById(task.assigneeId);
    if (!user) return;

    await this.notificationService.send({
      userId: user.id,
      type: 'TASK_COMPLETED',
      message: `Task "${task.title}" has been completed`,
    });
  }
}
```

#### Daily Review (30 min)
- Test repository with real database
- Verify event handlers work
- Document infrastructure patterns

**Resources:**
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)

---

### **DAY 4: Thursday - Feature-Based Structure** (3-4 hours)

#### Morning Standup (30 min)
- Review layers completed
- Learn feature organization
- Plan folder restructure

#### Development (2.5 hours)

**Task 4.1: Organize by Features** (2 hours)
```
src/
├── features/
│   ├── tasks/
│   │   ├── domain/
│   │   │   ├── Task.ts
│   │   │   ├── TaskStatus.ts
│   │   │   └── TaskRepository.ts
│   │   ├── application/
│   │   │   ├── CompleteTask.usecase.ts
│   │   │   ├── CreateTask.usecase.ts
│   │   │   └── ListTasks.usecase.ts
│   │   ├── infrastructure/
│   │   │   ├── PrismaTaskRepository.ts
│   │   │   └── TaskMapper.ts
│   │   └── presentation/
│   │       ├── components/
│   │       │   ├── TaskList.tsx
│   │       │   ├── TaskItem.tsx
│   │       │   └── TaskForm.tsx
│   │       ├── hooks/
│   │       │   ├── useTasks.ts
│   │       │   └── useCompleteTask.ts
│   │       └── pages/
│   │           └── TasksPage.tsx
│   │
│   ├── users/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   └── projects/
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       └── presentation/
│
├── shared/
│   ├── components/        # Reusable UI components
│   ├── hooks/            # Reusable hooks
│   └── utils/            # Utilities
│
└── core/
    ├── domain/           # Base classes
    │   ├── Entity.ts
    │   ├── ValueObject.ts
    │   └── DomainEvent.ts
    ├── application/
    │   └── UseCase.ts
    └── infrastructure/
        └── di/
```

**Task 4.2: Create Feature Module** (30 min)
```typescript
// src/features/tasks/index.ts - Public API
export { Task, TaskStatus, TaskPriority } from './domain';
export { CompleteTaskUseCase, CreateTaskUseCase } from './application';
export { TaskList, TaskItem, TaskForm } from './presentation/components';
export { useTasks, useCompleteTask } from './presentation/hooks';

// Other features import from this public API only
// ❌ Don't: import { Task } from 'features/tasks/domain/Task'
// ✅ Do: import { Task } from 'features/tasks'
```

#### Daily Review (30 min)
- Verify feature isolation
- Check import dependencies
- Document feature boundaries

**Resources:**
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Modular Architecture](https://blog.logrocket.com/modular-architecture-react/)

---

### **DAY 5: Friday - Monorepo with Turborepo** (3-4 hours)

#### Morning Standup (30 min)
- Review feature structure
- Understand monorepo benefits
- Plan Turborepo setup

#### Development (2.5 hours)

**Task 5.1: Setup Turborepo** (1 hour)
```bash
npx create-turbo@latest
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Task 5.2: Create Shared Packages** (1.5 hours)
```json
// packages/core/package.json
{
  "name": "@task-manager/core",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --dts",
    "dev": "tsup src/index.ts --watch --dts",
    "test": "vitest"
  }
}

// packages/ui/package.json
{
  "name": "@task-manager/ui",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.tsx --dts --external react",
    "dev": "tsup src/index.tsx --watch --dts"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  }
}

// apps/web/package.json
{
  "name": "web",
  "dependencies": {
    "@task-manager/core": "workspace:*",
    "@task-manager/ui": "workspace:*",
    "next": "^14.0.0",
    "react": "^18.0.0"
  }
}
```

#### Daily Review (30 min)
- Verify monorepo builds
- Test package imports
- Check caching works

**Resources:**
- [Turborepo Docs](https://turbo.build/)
- [Monorepo Best Practices](https://monorepo.tools/)

---

### **DAY 6: Saturday - SOLID Principles Applied** (4-5 hours)

#### Morning Standup (30 min)
- Review architecture so far
- Learn SOLID principles
- Plan refactoring

#### Development (3.5 hours)

**Task 6.1: Apply SOLID** (3 hours)
```typescript
// S - Single Responsibility Principle
// ❌ Before: Component does everything
function TaskItem({ task }) {
  const [editing, setEditing] = useState(false);
  
  const handleSave = async () => {
    await fetch('/api/tasks/' + task.id, {
      method: 'PUT',
      body: JSON.stringify(task)
    });
  };

  return (
    <div>
      {editing ? <input /> : <span>{task.title}</span>}
      <button onClick={handleSave}>Save</button>
    </div>
  );
}

// ✅ After: Separated concerns
function TaskItem({ task, onUpdate }) {
  return (
    <div>
      <TaskTitle task={task} />
      <TaskActions task={task} onUpdate={onUpdate} />
    </div>
  );
}

function useUpdateTask() {
  const updateTask = useUpdateTaskUseCase();
  
  return async (taskId: string, data: Partial<Task>) => {
    await updateTask.execute({ taskId, data });
  };
}

// O - Open/Closed Principle
// ✅ Open for extension, closed for modification
interface ITaskFilter {
  matches(task: Task): boolean;
}

class StatusFilter implements ITaskFilter {
  constructor(private status: TaskStatus) {}
  
  matches(task: Task): boolean {
    return task.status.equals(this.status);
  }
}

class PriorityFilter implements ITaskFilter {
  constructor(private priority: TaskPriority) {}
  
  matches(task: Task): boolean {
    return task.priority === this.priority;
  }
}

class TaskFilterService {
  filter(tasks: Task[], filters: ITaskFilter[]): Task[] {
    return tasks.filter(task => 
      filters.every(filter => filter.matches(task))
    );
  }
}

// L - Liskov Substitution Principle
// ✅ Subtypes must be substitutable for base types
abstract class BaseRepository<T> {
  abstract findById(id: string): Promise<T | null>;
  abstract save(entity: T): Promise<void>;
}

class TaskRepository extends BaseRepository<Task> {
  async findById(id: string): Promise<Task | null> {
    // Implementation
  }
  
  async save(task: Task): Promise<void> {
    // Implementation
  }
}

// Can use TaskRepository anywhere BaseRepository is expected

// I - Interface Segregation Principle
// ❌ Before: Fat interface
interface ITaskService {
  create(data: CreateTaskData): Promise<Task>;
  update(id: string, data: UpdateTaskData): Promise<Task>;
  delete(id: string): Promise<void>;
  find(id: string): Promise<Task | null>;
  list(filters: Filters): Promise<Task[]>;
  export(format: string): Promise<Buffer>;
  import(file: Buffer): Promise<void>;
}

// ✅ After: Segregated interfaces
interface ITaskReader {
  find(id: string): Promise<Task | null>;
  list(filters: Filters): Promise<Task[]>;
}

interface ITaskWriter {
  create(data: CreateTaskData): Promise<Task>;
  update(id: string, data: UpdateTaskData): Promise<Task>;
  delete(id: string): Promise<void>;
}

interface ITaskExporter {
  export(format: string): Promise<Buffer>;
  import(file: Buffer): Promise<void>;
}

// D - Dependency Inversion Principle
// ✅ Depend on abstractions, not concretions
class CompleteTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,  // Interface, not concrete
    private eventBus: IEventBus,              // Interface, not concrete
    private logger: ILogger                   // Interface, not concrete
  ) {}
  
  // Use case doesn't know about Prisma, Winston, or EventEmitter
}
```

**Task 6.2: Refactor Existing Code** (30 min)

#### Daily Review (30 min)
- Verify SOLID compliance
- Document refactoring decisions
- Plan final integration

**Resources:**
- [SOLID Principles](https://khalilstemmler.com/articles/solid-principles/solid-typescript/)
- [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)

---

### **DAY 7: Sunday - Integration & Documentation** (3-4 hours)

#### Morning Standup (30 min)
- Review week's work
- Plan final integration
- Prepare documentation

#### Development (2 hours)

**Task 7.1: End-to-End Integration** (1 hour)
- Connect all layers
- Test complete workflows
- Verify dependency injection

**Task 7.2: Architecture Documentation** (1 hour)
```markdown
# Architecture Documentation

## Layers

### Domain Layer
Pure business logic. No dependencies on frameworks.

**Entities:**
- Task: Core business entity
- User: User aggregate
- Project: Project aggregate

**Value Objects:**
- TaskId, UserId, ProjectId
- TaskStatus, TaskPriority
- Email, DateRange

**Rules:**
- Can't complete blocked tasks
- Can't reassign completed tasks
- Title must be non-empty

### Application Layer
Use cases orchestrate domain logic.

**Use Cases:**
- CompleteTask: Marks task as done
- CreateTask: Creates new task
- AssignTask: Assigns to user

**Services:**
- NotificationService
- EmailService
- AnalyticsService

### Infrastructure Layer
Technical implementations.

**Repositories:**
- PrismaTaskRepository
- PrismaUserRepository

**Services:**
- WinstonLogger
- NodemailerEmailService

### Presentation Layer
UI components and hooks.

**Components:**
- TaskList, TaskItem, TaskForm

**Hooks:**
- useTasks, useCompleteTask
```

#### Sprint Retrospective (1 hour)
- Document architecture decisions
- List lessons learned
- Plan for Week 4

---

## ✅ Success Criteria

By end of Week 3:

- [ ] Feature-based folder structure implemented
- [ ] Clean Architecture layers defined
- [ ] Dependency injection working
- [ ] SOLID principles applied
- [ ] Monorepo with Turborepo setup
- [ ] Shared packages created
- [ ] Architecture documented
- [ ] All tests passing

---

## 📊 Progress Tracker

| Day | Focus | Deliverable | Status |
|-----|-------|------------|--------|
| 1 | Domain Layer | Entities & Value Objects | |
| 2 | Application | Use Cases & DI | |
| 3 | Infrastructure | Repositories & Mappers | |
| 4 | Feature Structure | Organized codebase | |
| 5 | Monorepo | Turborepo setup | |
| 6 | SOLID | Refactored code | |
| 7 | Integration | Complete system | |

---

## 🎯 Week 4 Preview

**Performance Optimization**
- React DevTools Profiler
- Memory leak detection
- Bundle analysis
- Lazy loading

---

**Your architecture is now enterprise-ready! 🏗️**
