# ⚡ WEEK 4: Performance Optimization - Sprint Guide

**Duration:** 7 days  
**Level:** Advanced  
**Prerequisites:** Weeks 1-3  
**Goal:** Master React performance optimization and profiling tools

---

## 🎯 Overview

Transform from "it works" to "it works FAST" - master the tools and techniques to build lightning-fast React applications.

### Why Performance Matters:

```
Slow App (Poor Performance):      Fast App (Optimized):
- 3-5 second load time            - <1 second load time
- Jank when scrolling              - Smooth 60fps
- High memory usage                - Efficient memory
- Large bundle size                - Code-split bundles
- User frustration                 - Happy users
❌ Users leave                     ✅ Users stay & convert
```

**Real Impact:**
- 1 second delay = 7% reduction in conversions
- 53% mobile users abandon slow sites
- Performance = User Experience = Revenue

---

## 📚 Learning Objectives

### Profiling & Measurement:
- ✅ **React DevTools Profiler**: Identify slow renders
- ✅ **Chrome DevTools**: Memory & CPU profiling
- ✅ **Lighthouse**: Performance audits
- ✅ **Web Vitals**: LCP, FID, CLS metrics
- ✅ **Bundle Analyzer**: Visualize package sizes

### Optimization Techniques:
- ✅ **React Optimization**: useMemo, useCallback, memo
- ✅ **Code Splitting**: Lazy loading, dynamic imports
- ✅ **Image Optimization**: WebP, lazy load, srcset
- ✅ **State Management**: Minimize re-renders
- ✅ **Virtualization**: React Window for long lists

### Advanced Patterns:
- ✅ **Memoization**: When and how to use
- ✅ **Debouncing/Throttling**: User input optimization
- ✅ **Web Workers**: Offload heavy computation
- ✅ **Service Workers**: Caching strategies

---

## 📅 Day-by-Day Sprint Plan

### **DAY 1: Profiling & Measurement Tools** (3-4 hours)

#### Tasks:
**1.1 Setup Profiling Tools** (1 hour)
- Install React DevTools extension
- Configure Lighthouse CI
- Setup bundle analyzer
- Install web-vitals package

**1.2 Baseline Performance Audit** (1.5 hours)
```typescript
// Measure current performance
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify(metric);
  fetch('/analytics', { body, method: 'POST', keepalive: true });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

**1.3 Identify Performance Bottlenecks** (30 min)
- Run Lighthouse audit
- Profile with React DevTools
- Analyze bundle size
- Document findings

**Resources:**
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)
- [Web Vitals](https://web.dev/vitals/)
- [Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)

---

### **DAY 2: React Optimization Patterns** (3-4 hours)

#### Tasks:
**2.1 Memo, useMemo, useCallback** (2 hours)
```typescript
// ❌ Before: Re-renders unnecessarily
function TaskList({ tasks, onComplete }) {
  return tasks.map(task => (
    <TaskItem key={task.id} task={task} onComplete={onComplete} />
  ));
}

// ✅ After: Optimized
const TaskList = memo(function TaskList({ tasks, onComplete }) {
  return tasks.map(task => (
    <TaskItem key={task.id} task={task} onComplete={onComplete} />
  ));
});

function TasksPage() {
  const [tasks, setTasks] = useState([]);

  // ✅ useCallback prevents function recreation
  const handleComplete = useCallback((id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: true } : t
    ));
  }, []);

  // ✅ useMemo prevents expensive recalculation
  const sortedTasks = useMemo(() => {
    return tasks.sort((a, b) => 
      a.priority.localeCompare(b.priority)
    );
  }, [tasks]);

  return <TaskList tasks={sortedTasks} onComplete={handleComplete} />;
}
```

**2.2 Prevent Unnecessary Re-renders** (1 hour)
```typescript
// Use React.memo with custom comparison
const TaskItem = memo(
  function TaskItem({ task, onComplete }) {
    return (
      <div>
        <h3>{task.title}</h3>
        <button onClick={() => onComplete(task.id)}>Complete</button>
      </div>
    );
  },
  // Custom comparison function
  (prevProps, nextProps) => {
    return (
      prevProps.task.id === nextProps.task.id &&
      prevProps.task.title === nextProps.task.title &&
      prevProps.task.completed === nextProps.task.completed
    );
  }
);
```

**Resources:**
- [React Optimization](https://react.dev/learn/render-and-commit)
- [When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback)

---

### **DAY 3: Code Splitting & Lazy Loading** (3-4 hours)

#### Tasks:
**3.1 Route-Based Code Splitting** (1.5 hours)
```typescript
// Lazy load routes
import { lazy, Suspense } from 'react';

const TasksPage = lazy(() => import('./pages/TasksPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

**3.2 Component-Based Code Splitting** (1 hour)
```typescript
// Lazy load heavy components
const HeavyChart = lazy(() => import('./components/HeavyChart'));
const RichTextEditor = lazy(() => import('./components/RichTextEditor'));

function Dashboard() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <button onClick={() => setShowChart(true)}>Show Chart</button>
      
      {showChart && (
        <Suspense fallback={<Skeleton />}>
          <HeavyChart data={data} />
        </Suspense>
      )}
    </div>
  );
}
```

**3.3 Bundle Analysis** (30 min)
```bash
# Analyze bundle
npm install -D @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // config
});

# Run analysis
ANALYZE=true npm run build
```

**Resources:**
- [Code Splitting](https://react.dev/reference/react/lazy)
- [Dynamic Imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)

---

### **DAY 4: Memory Leak Detection & Prevention** (3-4 hours)

#### Tasks:
**4.1 Detect Memory Leaks** (1.5 hours)
```typescript
// ❌ Memory leak: Event listener not cleaned up
function TaskItem({ task }) {
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    // Missing cleanup!
  }, []);
}

// ✅ Proper cleanup
function TaskItem({ task }) {
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
}

// ❌ Memory leak: setState after unmount
function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks().then(setTasks); // Component might unmount!
  }, []);
}

// ✅ Cleanup with AbortController
function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    fetchTasks({ signal: controller.signal })
      .then(setTasks)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });

    return () => controller.abort();
  }, []);
}
```

**4.2 Profile Memory Usage** (1 hour)
- Use Chrome DevTools Memory profiler
- Take heap snapshots
- Identify detached DOM nodes
- Fix memory leaks

**4.3 Prevent Common Leaks** (30 min)
```typescript
// Use cleanup for subscriptions
function useWebSocket(url: string) {
  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onmessage = handleMessage;
    
    return () => {
      ws.close();
    };
  }, [url]);
}

// Cancel pending requests
function useAsyncData<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetcher().then(result => {
      if (!cancelled) {
        setData(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
```

**Resources:**
- [Memory Leak Patterns](https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render)
- [Chrome DevTools Memory](https://developer.chrome.com/docs/devtools/memory-problems/)

---

### **DAY 5: List Virtualization** (3-4 hours)

#### Tasks:
**5.1 Implement React Window** (2 hours)
```typescript
import { FixedSizeList } from 'react-window';

// ❌ Before: Renders 10,000 items (slow!)
function TaskList({ tasks }) {
  return (
    <div>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}

// ✅ After: Only renders visible items (fast!)
function VirtualizedTaskList({ tasks }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <TaskItem task={tasks[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={tasks.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

**5.2 Dynamic Height Lists** (1 hour)
```typescript
import { VariableSizeList } from 'react-window';

function VirtualizedTaskList({ tasks }) {
  const listRef = useRef<VariableSizeList>(null);

  const getItemSize = (index: number) => {
    // Calculate height based on content
    return tasks[index].description ? 120 : 80;
  };

  return (
    <VariableSizeList
      ref={listRef}
      height={600}
      itemCount={tasks.length}
      itemSize={getItemSize}
      width="100%"
    >
      {Row}
    </VariableSizeList>
  );
}
```

**Resources:**
- [React Window](https://github.com/bvaughn/react-window)
- [Virtualization Guide](https://web.dev/virtualize-long-lists-react-window/)

---

### **DAY 6: Image & Asset Optimization** (4-5 hours)

#### Tasks:
**6.1 Image Optimization** (2 hours)
```typescript
// Next.js Image component (automatic optimization)
import Image from 'next/image';

function TaskImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      placeholder="blur"
      blurDataURL="data:image/..." // Low-quality placeholder
      loading="lazy"
      sizes="(max-width: 768px) 100vw, 800px"
    />
  );
}

// Manual optimization with srcset
function ResponsiveImage({ src, alt }) {
  return (
    <img
      src={`${src}?w=800`}
      srcSet={`
        ${src}?w=400 400w,
        ${src}?w=800 800w,
        ${src}?w=1200 1200w
      `}
      sizes="(max-width: 768px) 100vw, 800px"
      alt={alt}
      loading="lazy"
    />
  );
}
```

**6.2 Font Optimization** (1 hour)
```typescript
// next/font optimization
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

**6.3 Asset Compression** (30 min)
- Configure image compression
- Use WebP format
- Implement CDN caching
- Setup asset versioning

**Resources:**
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Web Font Optimization](https://web.dev/font-best-practices/)

---

### **DAY 7: Integration & Monitoring** (3-4 hours)

#### Tasks:
**7.1 Setup Performance Monitoring** (1.5 hours)
```typescript
// Real User Monitoring (RUM)
import { onCLS, onFID, onLCP } from 'web-vitals';

function sendToAnalytics({ name, value, id }) {
  const body = JSON.stringify({ name, value, id });
  
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/analytics', body);
  } else {
    fetch('/analytics', { 
      body, 
      method: 'POST',
      keepalive: true 
    });
  }
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);

// Custom metrics
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'measure') {
      sendToAnalytics({
        name: entry.name,
        value: entry.duration,
        id: Math.random().toString()
      });
    }
  }
});

performanceObserver.observe({ entryTypes: ['measure'] });

// Measure custom operations
performance.mark('task-render-start');
// ... render tasks
performance.mark('task-render-end');
performance.measure('task-render', 'task-render-start', 'task-render-end');
```

**7.2 Performance Budget** (1 hour)
```javascript
// lighthouse-config.js
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
      },
    },
  },
};
```

**7.3 Documentation** (30 min)
- Document optimizations made
- Create performance checklist
- Setup monitoring dashboard
- Plan ongoing improvements

**Resources:**
- [Performance Monitoring](https://web.dev/vitals-measurement-getting-started/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

## ✅ Success Criteria

### Performance Metrics:
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Bundle size reduced by 30%+
- [ ] Memory leaks fixed

### Code Quality:
- [ ] Proper memoization used
- [ ] Code splitting implemented
- [ ] Images optimized
- [ ] Lists virtualized
- [ ] Monitoring setup

---

## 📊 Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Lighthouse Score | 78 | 97 | — |
| LCP (Largest Contentful Paint) | 6.0s ❌ | 2.6s | — |
| FCP (First Contentful Paint) | 0.8s ✅ | 0.8s | — |
| TBT (Total Blocking Time) | 40ms ✅ | 40ms | — |
| CLS (Cumulative Layout Shift) | 0 ✅ | 0 | — |
| Speed Index | 1.6s ✅ | 1.5s | — |
| Bundle Size | 875.82 KB | 2.61MB | — |
| Memory | — | — | — |

---

## 🎯 Week 5 Preview

**Next.js & Server Components**
- App Router mastery
- Server Actions
- Streaming & Suspense
- SEO optimization

---

**Your app is now blazing fast! ⚡**
