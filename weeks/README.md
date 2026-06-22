# 🧪 WEEK 2: Testing as a Standard - Sprint Guide

**Duration:** 7 days  
**Level:** Intermediate to Advanced  
**Prerequisites:** Week 1 (Advanced TypeScript)  
**Goal:** Master testing in React/Redux applications with professional standards

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Learning Objectives](#learning-objectives)
3. [Technology Stack](#technology-stack)
4. [Project: Task Manager Testing Suite](#project)
5. [Day-by-Day Sprint Plan](#sprint-plan)
6. [Setup Instructions](#setup)
7. [Success Criteria](#success-criteria)

---

## 🎯 Overview {#overview}

This week transforms you from a developer who "sometimes writes tests" to one who practices **Test-Driven Development (TDD)** as a standard.

### Why Testing Matters for Senior Roles:

```
Junior Dev:  "I write code, then maybe test it manually"
Mid Dev:     "I write code, then write some tests"
Senior Dev:  "I write tests first, then write code to make them pass"
```

### What You'll Build:

A **comprehensive testing suite** for the Task Manager from Week 1:
- ✅ Unit tests for utilities and business logic
- ✅ Integration tests for React components
- ✅ E2E tests for complete user workflows
- ✅ 80%+ code coverage
- ✅ CI/CD pipeline integration

### Real-World Application:

At **Sekura-aer** or **All-Iser**, you'll be able to:
- Write tests for new features BEFORE implementing them
- Refactor with confidence (tests catch regressions)
- Debug faster (failing tests pinpoint issues)
- Ship with confidence (comprehensive test coverage)

---

## 🎓 Learning Objectives {#learning-objectives}

By the end of Week 2, you will:

### Technical Skills:
- ✅ **Vitest/Jest**: Unit testing framework mastery
- ✅ **React Testing Library**: Component testing best practices
- ✅ **Cypress/Playwright**: End-to-end testing
- ✅ **MSW (Mock Service Worker)**: API mocking
- ✅ **Test Coverage**: Achieve and maintain 80%+ coverage
- ✅ **TDD Workflow**: Red → Green → Refactor cycle

### Architectural Understanding:
- ✅ **Test Pyramid**: Unit → Integration → E2E
- ✅ **Testing Strategy**: What to test, what to skip
- ✅ **Mocking Patterns**: When and how to mock
- ✅ **Test Organization**: Folder structure and naming

### Professional Practices:
- ✅ **CI Integration**: Tests run automatically
- ✅ **Test Documentation**: Tests as living documentation
- ✅ **Debugging Tests**: Fix flaky tests
- ✅ **Performance**: Fast, reliable test suites

---

## 🛠️ Technology Stack {#technology-stack}

### Testing Frameworks:

```json
{
  "unit": "Vitest (faster alternative to Jest)",
  "component": "React Testing Library",
  "e2e": "Playwright (more powerful than Cypress)",
  "mocking": "MSW (Mock Service Worker)",
  "coverage": "c8 (built into Vitest)"
}
```

### Why These Tools:

| Tool | Why Not Jest/Cypress? | Advantage |
|------|----------------------|-----------|
| **Vitest** | Jest is slower, config-heavy | 10x faster, ESM native, Vite integration |
| **Playwright** | Cypress has limitations | Multi-browser, better API, network mocking |
| **MSW** | Manual mocking is brittle | Works in browser & Node, reusable |
| **React Testing Library** | Enzyme tests implementation | Tests user behavior, not internals |

---

## 🚀 Project: Task Manager Testing Suite {#project}

### Architecture Overview:

```
task-manager-testing/
├── src/
│   ├── components/          # React components
│   │   ├── TaskList/
│   │   │   ├── TaskList.tsx
│   │   │   └── TaskList.test.tsx    # Component test
│   │   ├── TaskForm/
│   │   └── UserProfile/
│   ├── hooks/              # Custom hooks
│   │   ├── useTasks.ts
│   │   └── useTasks.test.ts         # Hook test
│   ├── store/              # Redux store
│   │   ├── tasksSlice.ts
│   │   └── tasksSlice.test.ts       # Store test
│   ├── utils/              # Pure functions
│   │   ├── dateHelpers.ts
│   │   └── dateHelpers.test.ts      # Unit test
│   └── api/                # API layer
│       ├── client.ts
│       └── client.test.ts           # API test with MSW
├── tests/
│   ├── integration/        # Integration tests
│   │   └── task-workflow.test.tsx
│   └── e2e/                # End-to-end tests
│       └── complete-flow.spec.ts
├── mocks/                  # MSW handlers
│   ├── handlers.ts
│   └── server.ts
├── vitest.config.ts
├── playwright.config.ts
└── coverage/               # Generated coverage reports
```

### Features to Test:

1. **Unit Tests (Day 1-2):**
   - Date formatting utilities
   - Task validation logic
   - Permission checking functions
   - Type guards from Week 1

2. **Component Tests (Day 3-4):**
   - TaskList renders tasks correctly
   - TaskForm handles user input
   - UserProfile displays user data
   - Loading and error states

3. **Integration Tests (Day 4-5):**
   - Create task → appears in list
   - Update task → list updates
   - Delete task → list updates
   - Filter/search functionality

4. **E2E Tests (Day 5-6):**
   - Complete user workflow: Login → Create → Edit → Complete → Logout
   - Multi-user scenarios
   - Error handling flows

---

## 📅 Day-by-Day Sprint Plan {#sprint-plan}

### **DAY 1: Monday - Vitest/Jest Fundamentals** (3-4 hours)

#### Morning Standup (30 min)
- Review Week 1 TypeScript project
- Understand testing pyramid
- Install and configure Vitest

#### Development (2.5 hours)

**Task 1.1: Setup Vitest** (30 min)
```bash
npm install -D vitest @vitest/ui c8
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event
```

**Task 1.2: First Unit Test** (1 hour)
Test the `doubleResult` function from Week 1:
```typescript
// src/utils/result.test.ts
import { describe, it, expect } from 'vitest';
import { doubleResult, Ok, Err } from './result';

describe('doubleResult', () => {
  it('doubles a successful result', () => {
    const input = Ok(5);
    const result = doubleResult(input);
    
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(10);
    }
  });

  it('preserves error in failed result', () => {
    const input = Err('Division by zero');
    const result = doubleResult(input);
    
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Division by zero');
    }
  });
});
```

**Task 1.3: Test Date Utilities** (1 hour)
Create and test date formatting functions:
```typescript
// src/utils/dateHelpers.ts
export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-MX');
}

export function isOverdue(dueDate: Date): boolean {
  return dueDate < new Date();
}

export function daysUntilDue(dueDate: Date): number {
  const diff = dueDate.getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// src/utils/dateHelpers.test.ts
describe('dateHelpers', () => {
  describe('formatDate', () => {
    it('formats date in Spanish Mexican format', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('15/1/2024');
    });
  });

  describe('isOverdue', () => {
    it('returns true for past dates', () => {
      const pastDate = new Date('2020-01-01');
      expect(isOverdue(pastDate)).toBe(true);
    });

    it('returns false for future dates', () => {
      const futureDate = new Date('2030-01-01');
      expect(isOverdue(futureDate)).toBe(false);
    });
  });

  describe('daysUntilDue', () => {
    it('calculates days correctly', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      expect(daysUntilDue(tomorrow)).toBe(1);
    });
  });
});
```

#### Daily Review (30 min)
- Run tests: `npm run test`
- Check coverage: `npm run test:coverage`
- Document learnings

**Resources:**
- [Vitest Docs](https://vitest.dev/)
- [Testing JavaScript with Kent C. Dodds](https://testingjavascript.com/)

---

### **DAY 2: Tuesday - Testing React Components** (3-4 hours)

#### Morning Standup (30 min)
- Review Day 1 tests
- Learn React Testing Library principles
- Understand "test user behavior, not implementation"

#### Development (2.5 hours)

**Task 2.1: Setup Testing Library** (30 min)
```typescript
// src/test-utils.tsx - Custom render with providers
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './store';

export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions
) {
  return render(
    <Provider store={store}>
      {ui}
    </Provider>,
    options
  );
}

export * from '@testing-library/react';
export { renderWithProviders as render };
```

**Task 2.2: Test Simple Component** (1 hour)
```typescript
// src/components/TaskItem/TaskItem.tsx
interface TaskItemProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onComplete, onDelete }: TaskItemProps) {
  return (
    <div data-testid="task-item">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <span>{task.status.type}</span>
      
      {task.status.type !== 'COMPLETED' && (
        <button onClick={() => onComplete(task.id)}>
          Complete
        </button>
      )}
      
      <button onClick={() => onDelete(task.id)}>
        Delete
      </button>
    </div>
  );
}

// src/components/TaskItem/TaskItem.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem } from './TaskItem';

describe('TaskItem', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: { type: 'TODO' },
    priority: 'HIGH',
    reporterId: 'user1',
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('renders task information', () => {
    render(
      <TaskItem 
        task={mockTask} 
        onComplete={vi.fn()} 
        onDelete={vi.fn()} 
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('TODO')).toBeInTheDocument();
  });

  it('calls onComplete when Complete button clicked', async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskItem 
        task={mockTask} 
        onComplete={onComplete} 
        onDelete={vi.fn()} 
      />
    );

    await user.click(screen.getByText('Complete'));
    
    expect(onComplete).toHaveBeenCalledWith('1');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when Delete button clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskItem 
        task={mockTask} 
        onComplete={vi.fn()} 
        onDelete={onDelete} 
      />
    );

    await user.click(screen.getByText('Delete'));
    
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('hides Complete button for completed tasks', () => {
    const completedTask: Task = {
      ...mockTask,
      status: { 
        type: 'COMPLETED', 
        completedAt: new Date(), 
        completedBy: 'user1' 
      },
    };

    render(
      <TaskItem 
        task={completedTask} 
        onComplete={vi.fn()} 
        onDelete={vi.fn()} 
      />
    );

    expect(screen.queryByText('Complete')).not.toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
```

**Task 2.3: Test Form Component** (1 hour)
```typescript
// src/components/TaskForm/TaskForm.tsx
interface TaskFormProps {
  onSubmit: (data: CreateTaskData) => void;
  onCancel: () => void;
}

export function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    onSubmit({
      title,
      description,
      priority,
    });
  };

  return (
    <form onSubmit={handleSubmit} data-testid="task-form">
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Task title"
      />
      
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        aria-label="Task description"
      />
      
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as TaskPriority)}
        aria-label="Task priority"
      >
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>
      </select>
      
      <button type="submit">Create Task</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}

// src/components/TaskForm/TaskForm.test.tsx
describe('TaskForm', () => {
  it('renders all form fields', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText('Task title')).toBeInTheDocument();
    expect(screen.getByLabelText('Task description')).toBeInTheDocument();
    expect(screen.getByLabelText('Task priority')).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onSubmit with form data', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<TaskForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText('Task title'), 'New Task');
    await user.type(screen.getByLabelText('Task description'), 'Description');
    await user.selectOptions(screen.getByLabelText('Task priority'), 'HIGH');
    await user.click(screen.getByText('Create Task'));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'New Task',
      description: 'Description',
      priority: 'HIGH',
    });
  });

  it('does not submit with empty title', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<TaskForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.click(screen.getByText('Create Task'));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onCancel when Cancel clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByText('Cancel'));

    expect(onCancel).toHaveBeenCalled();
  });
});
```

#### Daily Review (30 min)
- Verify all tests pass
- Check test coverage
- Identify patterns

**Resources:**
- [React Testing Library Docs](https://testing-library.com/react)
- [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

### **DAY 3: Wednesday - Testing Redux/State Management** (3-4 hours)

#### Morning Standup (30 min)
- Review component testing patterns
- Learn Redux testing strategies
- Understand async action testing

#### Development (2.5 hours)

**Task 3.1: Test Redux Slice** (1.5 hours)
```typescript
// src/store/tasksSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { addTask, removeTask, updateTask, setLoading, setError } = 
  tasksSlice.actions;
export default tasksSlice.reducer;

// src/store/tasksSlice.test.ts
import { describe, it, expect } from 'vitest';
import tasksReducer, { 
  addTask, 
  removeTask, 
  updateTask, 
  setLoading, 
  setError 
} from './tasksSlice';

describe('tasksSlice', () => {
  const initialState = {
    tasks: [],
    loading: false,
    error: null,
  };

  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test',
    status: { type: 'TODO' },
    priority: 'MEDIUM',
    reporterId: 'user1',
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should handle initial state', () => {
    expect(tasksReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle addTask', () => {
    const actual = tasksReducer(initialState, addTask(mockTask));
    
    expect(actual.tasks).toHaveLength(1);
    expect(actual.tasks[0]).toEqual(mockTask);
  });

  it('should handle removeTask', () => {
    const stateWithTask = {
      ...initialState,
      tasks: [mockTask],
    };

    const actual = tasksReducer(stateWithTask, removeTask('1'));
    
    expect(actual.tasks).toHaveLength(0);
  });

  it('should handle updateTask', () => {
    const stateWithTask = {
      ...initialState,
      tasks: [mockTask],
    };

    const updatedTask = {
      ...mockTask,
      title: 'Updated Title',
    };

    const actual = tasksReducer(stateWithTask, updateTask(updatedTask));
    
    expect(actual.tasks[0].title).toBe('Updated Title');
  });

  it('should handle setLoading', () => {
    const actual = tasksReducer(initialState, setLoading(true));
    
    expect(actual.loading).toBe(true);
  });

  it('should handle setError', () => {
    const actual = tasksReducer(initialState, setError('Error occurred'));
    
    expect(actual.error).toBe('Error occurred');
  });
});
```

**Task 3.2: Test Custom Hooks** (1 hour)
```typescript
// src/hooks/useTasks.ts
import { useDispatch, useSelector } from 'react-redux';
import { addTask, removeTask, updateTask } from '../store/tasksSlice';
import type { RootState } from '../store';

export function useTasks() {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state: RootState) => state.tasks);

  const createTask = (data: CreateTaskData) => {
    const newTask: Task = {
      ...data,
      id: crypto.randomUUID(),
      status: { type: 'TODO' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch(addTask(newTask));
    return newTask;
  };

  const deleteTask = (id: string) => {
    dispatch(removeTask(id));
  };

  const completeTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const updatedTask: Task = {
      ...task,
      status: {
        type: 'COMPLETED',
        completedAt: new Date(),
        completedBy: 'current-user', // In real app, get from auth
      },
      updatedAt: new Date(),
    };

    dispatch(updateTask(updatedTask));
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    deleteTask,
    completeTask,
  };
}

// src/hooks/useTasks.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { useTasks } from './useTasks';

function wrapper({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

describe('useTasks', () => {
  it('initializes with empty tasks', () => {
    const { result } = renderHook(() => useTasks(), { wrapper });

    expect(result.current.tasks).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('creates a task', () => {
    const { result } = renderHook(() => useTasks(), { wrapper });

    act(() => {
      result.current.createTask({
        title: 'New Task',
        description: 'Description',
        priority: 'HIGH',
      });
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('New Task');
    expect(result.current.tasks[0].status.type).toBe('TODO');
  });

  it('deletes a task', () => {
    const { result } = renderHook(() => useTasks(), { wrapper });

    let taskId: string;

    act(() => {
      const task = result.current.createTask({
        title: 'Task to delete',
        description: '',
        priority: 'LOW',
      });
      taskId = task.id;
    });

    expect(result.current.tasks).toHaveLength(1);

    act(() => {
      result.current.deleteTask(taskId);
    });

    expect(result.current.tasks).toHaveLength(0);
  });

  it('completes a task', () => {
    const { result } = renderHook(() => useTasks(), { wrapper });

    let taskId: string;

    act(() => {
      const task = result.current.createTask({
        title: 'Task to complete',
        description: '',
        priority: 'MEDIUM',
      });
      taskId = task.id;
    });

    act(() => {
      result.current.completeTask(taskId);
    });

    const task = result.current.tasks.find(t => t.id === taskId);
    expect(task?.status.type).toBe('COMPLETED');
  });
});
```

#### Daily Review (30 min)
- Run full test suite
- Check Redux coverage
- Document patterns

**Resources:**
- [Redux Testing Guide](https://redux.js.org/usage/writing-tests)
- [Testing Hooks](https://react-hooks-testing-library.com/)

---

### **DAY 4: Thursday - Integration Testing** (3-4 hours)

#### Morning Standup (30 min)
- Review unit vs integration tests
- Learn integration testing strategies
- Setup MSW for API mocking

#### Development (2.5 hours)

**Task 4.1: Setup MSW** (45 min)
```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/tasks', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Task from API',
        description: 'Test',
        status: { type: 'TODO' },
        priority: 'MEDIUM',
        reporterId: 'user1',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }),

  http.post('/api/tasks', async ({ request }) => {
    const newTask = await request.json();
    return HttpResponse.json({
      ...newTask,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.delete('/api/tasks/:id', ({ params }) => {
    return HttpResponse.json({ success: true });
  }),
];

// mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// tests/setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '../mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Task 4.2: Write Integration Tests** (1.5 hours)
```typescript
// tests/integration/task-workflow.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { store } from '../../src/store';
import { TasksPage } from '../../src/pages/TasksPage';

describe('Task Workflow Integration', () => {
  function renderApp() {
    return render(
      <Provider store={store}>
        <TasksPage />
      </Provider>
    );
  }

  it('complete workflow: create → display → complete → delete', async () => {
    const user = userEvent.setup();
    renderApp();

    // 1. Initially shows empty state
    expect(screen.getByText(/no tasks/i)).toBeInTheDocument();

    // 2. Open create form
    await user.click(screen.getByText(/create task/i));

    // 3. Fill and submit form
    await user.type(screen.getByLabelText(/title/i), 'Integration Test Task');
    await user.type(screen.getByLabelText(/description/i), 'Testing workflow');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'HIGH');
    await user.click(screen.getByText(/submit|create/i));

    // 4. Task appears in list
    await waitFor(() => {
      expect(screen.getByText('Integration Test Task')).toBeInTheDocument();
    });

    // 5. Complete the task
    await user.click(screen.getByText(/complete/i));

    await waitFor(() => {
      expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });

    // 6. Delete the task
    await user.click(screen.getByText(/delete/i));

    await waitFor(() => {
      expect(screen.queryByText('Integration Test Task')).not.toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock API error
    server.use(
      http.post('/api/tasks', () => {
        return HttpResponse.json(
          { error: 'Server error' },
          { status: 500 }
        );
      })
    );

    renderApp();

    await user.click(screen.getByText(/create task/i));
    await user.type(screen.getByLabelText(/title/i), 'Will fail');
    await user.click(screen.getByText(/submit/i));

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

#### Daily Review (30 min)
- Run integration tests
- Verify coverage increase
- Document learnings

**Resources:**
- [MSW Documentation](https://mswjs.io/)
- [Integration Testing Best Practices](https://kentcdodds.com/blog/testing-implementation-details)

---

### **DAY 5: Friday - E2E Testing with Playwright** (3-4 hours)

#### Morning Standup (30 min)
- Review integration testing
- Learn E2E testing philosophy
- Setup Playwright

#### Development (2.5 hours)

**Task 5.1: Setup Playwright** (30 min)
```bash
npm init playwright@latest
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Task 5.2: Write E2E Tests** (2 hours)
```typescript
// tests/e2e/complete-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Task Manager E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete user flow', async ({ page }) => {
    // 1. Navigate to tasks page
    await page.goto('/tasks');

    // 2. Create a new task
    await page.getByRole('button', { name: /create task/i }).click();
    
    await page.getByLabel(/title/i).fill('E2E Test Task');
    await page.getByLabel(/description/i).fill('Testing with Playwright');
    await page.getByLabel(/priority/i).selectOption('HIGH');
    
    await page.getByRole('button', { name: /submit/i }).click();

    // 3. Verify task appears
    await expect(page.getByText('E2E Test Task')).toBeVisible();

    // 4. Edit the task
    await page.getByRole('button', { name: /edit/i }).first().click();
    await page.getByLabel(/title/i).fill('Updated E2E Task');
    await page.getByRole('button', { name: /save/i }).click();

    await expect(page.getByText('Updated E2E Task')).toBeVisible();

    // 5. Mark as complete
    await page.getByRole('button', { name: /complete/i }).first().click();
    await expect(page.getByText(/completed/i)).toBeVisible();

    // 6. Filter completed tasks
    await page.getByLabel(/filter/i).selectOption('completed');
    await expect(page.getByText('Updated E2E Task')).toBeVisible();

    // 7. Delete the task
    await page.getByRole('button', { name: /delete/i }).first().click();
    await page.getByRole('button', { name: /confirm/i }).click();

    await expect(page.getByText('Updated E2E Task')).not.toBeVisible();
  });

  test('search functionality', async ({ page }) => {
    // Create multiple tasks
    const tasks = ['Task Alpha', 'Task Beta', 'Task Gamma'];
    
    for (const task of tasks) {
      await page.getByRole('button', { name: /create task/i }).click();
      await page.getByLabel(/title/i).fill(task);
      await page.getByRole('button', { name: /submit/i }).click();
      await expect(page.getByText(task)).toBeVisible();
    }

    // Search for specific task
    await page.getByPlaceholder(/search/i).fill('Beta');
    
    await expect(page.getByText('Task Beta')).toBeVisible();
    await expect(page.getByText('Task Alpha')).not.toBeVisible();
    await expect(page.getByText('Task Gamma')).not.toBeVisible();
  });

  test('pagination', async ({ page }) => {
    // Create 15 tasks (assuming 10 per page)
    for (let i = 1; i <= 15; i++) {
      await page.getByRole('button', { name: /create task/i }).click();
      await page.getByLabel(/title/i).fill(`Task ${i}`);
      await page.getByRole('button', { name: /submit/i }).click();
    }

    // Verify first page shows 10 tasks
    await expect(page.getByText('Task 1')).toBeVisible();
    await expect(page.getByText('Task 10')).toBeVisible();
    await expect(page.getByText('Task 11')).not.toBeVisible();

    // Navigate to second page
    await page.getByRole('button', { name: /next/i }).click();

    await expect(page.getByText('Task 11')).toBeVisible();
    await expect(page.getByText('Task 15')).toBeVisible();
    await expect(page.getByText('Task 1')).not.toBeVisible();
  });

  test('responsive design', async ({ page }) => {
    // Desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByRole('navigation')).toBeVisible();

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mobile menu should be hidden initially
    await expect(page.getByRole('navigation')).not.toBeVisible();
    
    // Open mobile menu
    await page.getByLabel(/menu/i).click();
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});
```

#### Daily Review (30 min)
- Run E2E tests in all browsers
- Review test reports
- Document findings

**Resources:**
- [Playwright Documentation](https://playwright.dev/)
- [E2E Best Practices](https://playwright.dev/docs/best-practices)

---

### **DAY 6: Saturday - CI/CD Integration & Coverage** (4-5 hours)

#### Morning Standup (30 min)
- Review all tests written
- Plan CI/CD integration
- Set coverage goals

#### Development (3.5 hours)

**Task 6.1: GitHub Actions Workflow** (1 hour)
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-integration:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run unit & integration tests
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json

  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

**Task 6.2: Improve Coverage** (1.5 hours)
- Identify uncovered code
- Write missing tests
- Achieve 80%+ coverage

**Task 6.3: Performance Testing** (1 hour)
```typescript
// tests/performance/rendering.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TaskList } from '../../src/components/TaskList';

describe('Performance Tests', () => {
  it('renders 1000 tasks efficiently', () => {
    const tasks = Array.from({ length: 1000 }, (_, i) => ({
      id: `${i}`,
      title: `Task ${i}`,
      description: 'Test',
      status: { type: 'TODO' } as const,
      priority: 'MEDIUM' as const,
      reporterId: 'user1',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const start = performance.now();
    render(<TaskList tasks={tasks} />);
    const end = performance.now();

    // Should render in less than 100ms
    expect(end - start).toBeLessThan(100);
  });
});
```

#### Daily Review (30 min)
- Verify CI/CD pipeline works
- Check coverage report
- Document achievements

**Resources:**
- [GitHub Actions for Testing](https://docs.github.com/en/actions/automating-builds-and-tests)
- [Codecov Integration](https://about.codecov.io/)

---

### **DAY 7: Sunday - Refactoring & Documentation** (3-4 hours)

#### Morning Standup (30 min)
- Review week's accomplishments
- Identify areas for improvement
- Plan documentation

#### Development (2 hours)

**Task 7.1: Refactor Tests** (1 hour)
- Extract common test utilities
- Remove duplication
- Improve test naming

**Task 7.2: Documentation** (1 hour)
```markdown
# Testing Documentation

## Running Tests

```bash
# Unit & integration tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E UI mode
npm run test:e2e:ui
```

## Test Organization

```
tests/
├── unit/           # Pure functions, utilities
├── integration/    # Component + store interactions
└── e2e/           # Full user workflows
```

## Writing Tests Checklist

- [ ] Test behavior, not implementation
- [ ] Use descriptive test names
- [ ] Follow AAA pattern (Arrange, Act, Assert)
- [ ] Mock external dependencies
- [ ] Achieve 80%+ coverage
- [ ] Tests run fast (<100ms per test)

## Common Patterns

### Testing Async Operations
```typescript
it('loads data', async () => {
  render(<Component />);
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### Testing User Events
```typescript
it('handles click', async () => {
  const user = userEvent.setup();
  render(<Button onClick={handleClick} />);
  
  await user.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
```
```

#### Sprint Retrospective (1 hour)
- What did you learn?
- What was challenging?
- What would you improve?
- Plan for Week 3

---

## 🚀 Setup Instructions {#setup}

### Prerequisites:
```bash
node >= 18.0.0
npm >= 9.0.0
```

### Installation:
```bash
# Clone/navigate to project
cd week-2-testing/proyecto

# Install dependencies
npm install

# Run tests
npm run test

# E2E tests
npm run test:e2e
```

### Scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "lint": "eslint src --ext ts,tsx",
    "type-check": "tsc --noEmit"
  }
}
```

---

## ✅ Success Criteria {#success-criteria}

By the end of Week 2, you should have:

### Technical Achievements:
- [ ] 80%+ code coverage
- [ ] All tests passing in CI
- [ ] E2E tests for critical flows
- [ ] Fast test suite (<5 seconds)
- [ ] Zero flaky tests

### Knowledge Gains:
- [ ] Understand test pyramid
- [ ] Know when to unit vs integration test
- [ ] Can write E2E tests confidently
- [ ] Understand mocking strategies
- [ ] Practice TDD workflow

### Professional Skills:
- [ ] Tests as documentation
- [ ] CI/CD integration
- [ ] Performance awareness
- [ ] Debugging test failures

---

## 📊 Daily Progress Tracker

| Day | Hours | Tests Written | Coverage | Status |
|-----|-------|--------------|----------|--------|
| 1   |       |              |          |        |
| 2   |       |              |          |        |
| 3   |       |              |          |        |
| 4   |       |              |          |        |
| 5   |       |              |          |        |
| 6   |       |              |          |        |
| 7   |       |              |          |        |

---

## 🎯 Next Week Preview

**Week 3: Clean Architecture**
- Feature-based folder structure
- Dependency injection
- SOLID principles
- Monorepo setup

---

**¡Éxito en tu semana de testing, Aldo! 🧪**

Remember: Good tests give you confidence to refactor and ship faster.
