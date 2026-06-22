# 🎯 Conceptos Clave: Performance Optimization

Guía visual de los patrones y técnicas fundamentales para optimizar aplicaciones React en producción.

---

## 1. REACT RENDERING PIPELINE

El corazón de React: cómo detecta cambios, reconcilia el árbol virtual, y actualiza el DOM.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    REACT RENDERING PIPELINE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  1. TRIGGER                                                              │
│     ├─ State/Props change detected                                       │
│     └─ Component schedule for re-render                                  │
│                                                                           │
│  2. RECONCILIATION (Virtual DOM)                                         │
│     ├─ React builds new component tree                                   │
│     ├─ Compares with previous tree (diffing algorithm)                   │
│     ├─ Identifies what changed                                           │
│     └─ Returns list of DOM updates needed                                │
│                                                                           │
│  3. COMMIT PHASE                                                         │
│     ├─ Apply DOM updates (synchronous, can't interrupt)                  │
│     ├─ Run lifecycle hooks (useEffect cleanup, setup)                    │
│     └─ Browser paints new pixels                                         │
│                                                                           │
│  4. BROWSER PAINT                                                        │
│     ├─ Layout (reflow): Calculate element positions                      │
│     ├─ Paint: Render pixels to screen                                    │
│     └─ Composite: Layer and display                                      │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

KEY INSIGHT: Reconciliation is FAST. DOM updates and painting are SLOW.
Goal: Minimize unnecessary re-renders and DOM thrashing.
```

---

## 2. MEMOIZATION DECISION TREE

When to use useMemo, useCallback, and React.memo to prevent re-renders.

```
┌─────────────────────────────────────────────────────────────────────────┐
│              MEMOIZATION: WHICH TOOL TO USE?                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  START: "I want to optimize a re-render"                                │
│  │                                                                        │
│  ├─ Is it a CHILD COMPONENT getting re-rendered?                         │
│  │  │                                                                     │
│  │  └─ YES: Use React.memo()                                             │
│  │     └─ Wraps component: const MyComponent = memo(Component)           │
│  │     └─ Skips re-render if props are same (shallow comparison)         │
│  │     └─ Use custom comparator for complex objects                      │
│  │                                                                        │
│  ├─ Is it a FUNCTION being passed as a prop?                             │
│  │  │                                                                     │
│  │  └─ YES: Use useCallback()                                            │
│  │     └─ Memoizes function reference                                    │
│  │     └─ Dependencies: [dep1, dep2]                                     │
│  │     └─ Solves: Child components see same function reference           │
│  │     └─ Without it: new function each render = new reference           │
│  │                                                                        │
│  └─ Is it EXPENSIVE COMPUTATION (sorting, filtering, calculations)?      │
│     │                                                                     │
│     └─ YES: Use useMemo()                                                │
│        └─ Memoizes calculated VALUE, not reference                       │
│        └─ const result = useMemo(() => expensiveCalc(), [deps])          │
│        └─ Only re-calculates when dependencies change                    │
│        └─ Skip if dependency array is longer than computation            │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

PATTERN EXAMPLES:
────────────────────────────────────────────────────────────────────────

❌ ANTI-PATTERN: Creating function in render
  function Parent() {
    const handleClick = () => { ... } // NEW FUNCTION EACH RENDER!
    return <Child onClick={handleClick} />
  }

✅ FIX: Use useCallback
  function Parent() {
    const handleClick = useCallback(() => { ... }, [])
    return <Child onClick={handleClick} />
  }


❌ ANTI-PATTERN: Expensive calculation
  function Dashboard({ data }) {
    const sorted = data.sort() // SORTS EVERY RENDER!
    return <List items={sorted} />
  }

✅ FIX: Use useMemo
  function Dashboard({ data }) {
    const sorted = useMemo(() => data.sort(), [data])
    return <List items={sorted} />
  }


❌ ANTI-PATTERN: Child re-renders unnecessarily
  function Parent({ id }) {
    return <UserProfile id={id} />
  }

✅ FIX: Memoize child
  const UserProfile = memo(function UserProfile({ id }) {
    return <div>{id}</div>
  })

```

---

## 3. CORE WEB VITALS: WHAT & WHY

Three metrics Google uses to measure real-world user experience.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CORE WEB VITALS                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │ 1. LCP (Largest Contentful Paint)                            │        │
│  ├──────────────────────────────────────────────────────────────┤        │
│  │ MEASURES: Time when largest visual element appears on screen │        │
│  │                                                              │        │
│  │ Timeline:                                                    │        │
│  │  0ms ───► 1000ms ───► 2000ms ───► 3000ms ───► 4000ms        │        │
│  │  [Good]              [Needs Work]          [Poor]            │        │
│  │                                                              │        │
│  │ WHAT COUNTS AS "LARGEST"?                                   │        │
│  │  • Images, videos                                            │        │
│  │  • Text blocks (h1, p, etc.)                                 │        │
│  │  • NOT: background images, invisible elements                │        │
│  │                                                              │        │
│  │ WHY? Users judge if page is loading by when content appears  │        │
│  │ Target: < 2.5 seconds for optimal UX                         │        │
│  │                                                              │        │
│  │ HOW TO IMPROVE:                                              │        │
│  │  • Reduce server response time (TTFB)                        │        │
│  │  • Lazy-load below-the-fold images                           │        │
│  │  • Code split JavaScript                                     │        │
│  │  • Use a CDN for static assets                               │        │
│  │  • Optimize images (WebP, compression)                       │        │
│  └──────────────────────────────────────────────────────────────┘        │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │ 2. FID / INP (First Input Delay / Interaction to Next Paint)│        │
│  ├──────────────────────────────────────────────────────────────┤        │
│  │ MEASURES: Time from user interaction to browser response     │        │
│  │                                                              │        │
│  │ Timeline:                                                    │        │
│  │  0ms ───► 100ms ───► 200ms ───► 300ms ───► 400ms            │        │
│  │  [Good]             [Needs Work]          [Poor]             │        │
│  │                                                              │        │
│  │ USER ACTIONS MEASURED:                                       │        │
│  │  • Click a button                                            │        │
│  │  • Type in a form                                            │        │
│  │  • Select dropdown                                           │        │
│  │                                                              │        │
│  │ WHY? Slow response = app feels unresponsive/broken           │        │
│  │ Target: < 100ms for First Input Delay (FID)                  │        │
│  │         < 200ms for Interaction to Next Paint (INP)          │        │
│  │                                                              │        │
│  │ HOW TO IMPROVE:                                              │        │
│  │  • Break up JavaScript into smaller chunks                   │        │
│  │  • Use Web Workers for heavy computations                    │        │
│  │  • Avoid long-running JavaScript on main thread              │        │
│  │  • Optimize React rendering (memo, useMemo, useCallback)     │        │
│  │  • Profile with DevTools to find bottlenecks                 │        │
│  └──────────────────────────────────────────────────────────────┘        │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │ 3. CLS (Cumulative Layout Shift)                             │        │
│  ├──────────────────────────────────────────────────────────────┤        │
│  │ MEASURES: Unexpected layout changes during page load         │        │
│  │                                                              │        │
│  │ Score: 0.0 ───► 0.05 ───► 0.1 ───► 0.15 ───► 0.2            │        │
│  │        [Good]            [Needs]    [Poor]                   │        │
│  │                                                              │        │
│  │ EXAMPLE OF CLS ISSUE:                                        │        │
│  │  1. User starts reading paragraph                            │        │
│  │  2. Ad loads and pushes text down                            │        │
│  │  3. User clicks wrong location (meant to click link below)    │        │
│  │                                                              │        │
│  │ WHY? Frustrating UX - looks broken, accidental clicks        │        │
│  │ Target: < 0.1 for good UX                                    │        │
│  │                                                              │        │
│  │ HOW TO IMPROVE:                                              │        │
│  │  • Set explicit dimensions on images (width/height)          │        │
│  │  • Avoid inserting content above existing content            │        │
│  │  • Use transform for animations (GPU accelerated)            │        │
│  │  • Lazy-load ads, embeds below the fold                      │        │
│  │  • Add placeholder space for dynamic content                 │        │
│  └──────────────────────────────────────────────────────────────┘        │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

MEASUREMENT TOOLS:
  • Chrome DevTools Lighthouse tab
  • web-vitals npm package
  • https://web.dev/measure/
  • Real User Monitoring (RUM)
```

---

## 4. BUNDLE SIZE ANATOMY

Understanding what's bloating your JavaScript bundle and how to fix it.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      BUNDLE SIZE BREAKDOWN                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  YOUR APP BUNDLE (1.5 MB)                                                │
│  ├─ React + ReactDOM: 42 KB                                              │
│  ├─ State Library (Redux/Zustand): 15 KB                                  │
│  ├─ UI Library (Material-UI): 180 KB                                      │
│  ├─ Utility Libraries (lodash, moment): 95 KB                             │
│  ├─ Date Library (date-fns): 45 KB                                        │
│  ├─ Your Code: 250 KB                                                     │
│  ├─ CSS (minified): 85 KB                                                 │
│  └─ Unused/Dead Code: 688 KB (!!)                                         │
│                                                                           │
│  SOLUTION 1: TREE SHAKING (Remove dead code)                              │
│  ────────────────────────────────────────────────────────────────────────│
│                                                                           │
│  ❌ IMPORT ALL: Even if you only use one function                        │
│     import * as lodash from 'lodash'                                     │
│     lodash.map(array, fn) // Bundle includes ALL lodash!                 │
│                                                                           │
│  ✅ NAMED IMPORTS: Only import what you use                              │
│     import { map } from 'lodash-es'  // Tree-shakeable                   │
│     map(array, fn)                                                       │
│                                                                           │
│  ✅ ES MODULE SYNTAX: Required for tree-shaking                          │
│     export const func = () => {}     // Works                            │
│     module.exports.func = () => {}   // Doesn't tree-shake               │
│                                                                           │
│                                                                           │
│  SOLUTION 2: CODE SPLITTING (Lazy load routes/components)                │
│  ────────────────────────────────────────────────────────────────────────│
│                                                                           │
│  WITHOUT CODE SPLITTING:                                                 │
│   ┌─────────────────────────────────────────┐                            │
│   │ main.js (1.5 MB)                         │                            │
│   │ ├─ Home page code                        │                            │
│   │ ├─ Dashboard code (user hasn't visited) │                            │
│   │ ├─ Settings code (user hasn't visited)  │                            │
│   │ └─ Heavy chart library (not loaded yet) │                            │
│   └─────────────────────────────────────────┘                            │
│   User downloads 1.5 MB even if they only need 150 KB                     │
│                                                                           │
│  WITH CODE SPLITTING:                                                    │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│   │ main.js      │  │ dashboard.js  │  │ settings.js  │                   │
│   │ (150 KB)     │  │ (400 KB)      │  │ (300 KB)     │                   │
│   └──────────────┘  └──────────────┘  └──────────────┘                   │
│        load         (lazy load when    (lazy load when                    │
│       first        user navigates)    user navigates)                    │
│                                                                           │
│  IMPLEMENTATION:                                                          │
│   const DashboardPage = lazy(() =>                                        │
│     import('./pages/Dashboard')                                           │
│   )                                                                       │
│                                                                           │
│                                                                           │
│  SOLUTION 3: DYNAMIC IMPORTS (Load when needed)                           │
│  ────────────────────────────────────────────────────────────────────────│
│                                                                           │
│   // Heavy library only imported when button clicked                      │
│   function Dashboard() {                                                  │
│     const [chart, setChart] = useState(null)                              │
│                                                                           │
│     const showChart = async () => {                                       │
│       const ChartLib = await import('heavy-chart-lib')                    │
│       setChart(ChartLib)                                                  │
│     }                                                                     │
│                                                                           │
│     return (                                                              │
│       <>                                                                  │
│         <button onClick={showChart}>Show Chart</button>                   │
│         {chart && <chart.render />}                                       │
│       </>                                                                 │
│     )                                                                     │
│   }                                                                       │
│                                                                           │
│                                                                           │
│  SOLUTION 4: ANALYZE WITH WEBPACK BUNDLE ANALYZER                        │
│  ────────────────────────────────────────────────────────────────────────│
│                                                                           │
│   npm install -D @next/bundle-analyzer                                    │
│   ANALYZE=true npm run build                                              │
│                                                                           │
│   Generates interactive HTML showing exactly what's in bundle             │
│                                                                           │
│                                                                           │
│  COMMON HEAVY LIBRARIES (Choose alternatives):                            │
│  ────────────────────────────────────────────────────────────────────────│
│   ❌ moment.js (67 KB) ──► ✅ date-fns (13 KB) or day.js (2 KB)           │
│   ❌ lodash (71 KB) ──► ✅ lodash-es (24 KB) or just use native JS        │
│   ❌ jquery (84 KB) ──► ✅ Use vanilla JS (not needed in React!)          │
│   ❌ axios (14 KB) ──► ✅ Use fetch API (native)                          │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. MEMORY LEAK PATTERNS

Common patterns that cause memory to grow and crash your app.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   MEMORY LEAK PATTERNS                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  PATTERN 1: FORGOTTEN EVENT LISTENERS                                    │
│  ────────────────────────────────────────────────────────────────────────│
│                                                                           │
│  ❌ LEAK: Listener added but never removed                               │
│     useEffect(() => {                                                    │
│       window.addEventListener('scroll', handleScroll)                    │
│       // MISSING: remove listener on cleanup!                            │
│     }, [])                                                               │
│                                                                           │
│     Each time component mounts: +1 listener (never cleaned up)            │
│     After 100 mounts: 100 listeners firing on every scroll!              │
│                                                                           │
│  ✅ FIXED: Clean up in useEffect return                                  │
│     useEffect(() => {                                                    │
│       const handleScroll = () => { ... }                                  │
│       window.addEventListener('scroll', handleScroll)                    │
│                                                                           │
│       return () => {                                                     │
│         window.removeEventListener('scroll', handleScroll)               │
│       }                                                                   │
│     }, [])                                                               │
│                                                                           │
│                                                                           │
│  PATTERN 2: TIMER NOT CLEARED                                            │
│  ────────────────────────────────────────────────────────────────────────│
│                                                                           │
│  ❌ LEAK: Interval continues even after unmount                          │
│     useEffect(() => {                                                    │
│       setInterval(() => {                                                │
│         // This runs forever, even if component unmounts!                │
│         setState(prev => prev + 1)                                       │
│       }, 1000)                                                           │
│     }, [])                                                               │
│                                                                           │
│  ✅ FIXED: Save and clear interval ID                                    │
│     useEffect(() => {                                                    │
│       const intervalId = setInterval(() => {                             │
│         setState(prev => prev + 1)                                       │
│       }, 1000)                                                           │
│                                                                           │
│       return () => clearInterval(intervalId)                             │
│     }, [])                                                               │
│                                                                           │
│                                                                           │
│  PATTERN 3: PROMISE CALLBACK AFTER UNMOUNT                               │
│  ────────────────────────────────────────────────────────────────────────│
│                                                                           │
│  ❌ LEAK: setState called after unmount (infinite fetch loop)            │
│     useEffect(() => {                                                    │
│       fetch('/data')                                                     │
│         .then(res => res.json())                                          │
│         .then(data => setState(data)) // Component unmounted? Still runs! │
│     }, [])                                                               │
│                                                                           │
│     Warning: Can't perform a React state update on an unmounted          │
│     component. Memory leak!                                              │
│                                                                           │
│  ✅ FIXED: Abort fetch or check mounted flag                             │
│     useEffect(() => {                                                    │
│       const controller = new AbortController()                           │
│                                                                           │
│       fetch('/data', { signal: controller.signal })                      │
│         .then(res => res.json())                                          │
│         .then(data => setState(data))                                     │
│         .catch(err => {                                                   │
│           if (err.name !== 'AbortError') console.error(err)              │
│         })                                                               │
│                                                                           │
│       return () => controller.abort()                                     │
│     }, [])                                                               │
│                                                                           │
│                                                                           │
│  PATTERN 4: SUBSCRIPTION NOT UNSUBSCRIBED                                │
│  ────────────────────────────────────────────────────────────────────────│
│                                                                           │
│  ❌ LEAK: WebSocket/RxJS subscription never closed                       │
│     useEffect(() => {                                                    │
│       const subscription = dataStore.subscribe(data => {                 │
│         setState(data)                                                   │
│       })                                                                 │
│       // Missing: unsubscribe!                                           │
│     }, [])                                                               │
│                                                                           │
│  ✅ FIXED: Unsubscribe in cleanup                                        │
│     useEffect(() => {                                                    │
│       const subscription = dataStore.subscribe(data => {                 │
│         setState(data)                                                   │
│       })                                                                 │
│                                                                           │
│       return () => subscription.unsubscribe()                            │
│     }, [])                                                               │
│                                                                           │
│                                                                           │
│  PATTERN 5: CLOSURE OVER STATE                                           │
│  ────────────────────────────────────────────────────────────────────────│
│                                                                           │
│  ❌ LEAK: Old callbacks hold references to old state                     │
│     function List() {                                                    │
│       const [items, setItems] = useState([])                             │
│                                                                           │
│       useEffect(() => {                                                  │
│         const handleAdd = () => {                                        │
│           console.log(items) // Captures CURRENT state                   │
│         }                                                                │
│         window.addEventListener('click', handleAdd)                      │
│         // If dependency array changes, OLD handler still attached!      │
│       }, [items]) // THIS DEPENDENCY IS KEY                              │
│     }                                                                     │
│                                                                           │
│  ✅ FIXED: Use proper dependencies                                       │
│     useEffect(() => {                                                    │
│       const handleAdd = () => {                                          │
│         setItems(prev => [...prev, newItem]) // Use functional update    │
│       }                                                                  │
│       window.addEventListener('click', handleAdd)                        │
│       return () => window.removeEventListener('click', handleAdd)        │
│     }, []) // No dependencies = mounted once, cleaned once               │
│                                                                           │
│                                                                           │
│  HOW TO DETECT MEMORY LEAKS:                                             │
│  ────────────────────────────────────────────────────────────────────────│
│  1. Chrome DevTools > Memory tab                                         │
│  2. Take heap snapshot                                                   │
│  3. Perform actions (mount/unmount component)                            │
│  4. Take another snapshot                                                │
│  5. Compare: if size grew, you have a leak                               │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. VIRTUALIZATION: RENDER ONLY VISIBLE ITEMS

Rendering 10,000 items? Only render the ones users can see.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LIST VIRTUALIZATION                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  WITHOUT VIRTUALIZATION:                                                 │
│  ────────────────────────────────────────────────────────────────────────│
│                                                                           │
│   const TaskList = ({ tasks }) => (                                       │
│     <div>                                                                 │
│       {tasks.map(task => (    // 10,000 iterations!                       │
│         <div key={task.id}>{task.name}</div>                             │
│       ))}                                                                │
│     </div>                                                               │
│   )                                                                       │
│                                                                           │
│   RESULT:                                                                 │
│   ┌──────────────────────────────┐                                       │
│   │ 🖥️ Visible Viewport (600px)   │  Item 1                              │
│   │ ──────────────────────────── │  Item 2                              │
│   │                              │  Item 3                              │
│   │                              │  Item 4 ← Only 4 visible              │
│   │                              │  Item 5 ← But 10,000 rendered!        │
│   │ ──────────────────────────── │                                       │
│   └──────────────────────────────┘                                       │
│   ↓ Scroll                                                                │
│   ┌──────────────────────────────┐                                       │
│   │        Item 500               │  Item 499-503 visible                │
│   │        Item 501 ← Visible     │                                       │
│   │        Item 502 ← Visible     │  But still rendering all 10,000      │
│   │        Item 503 ← Visible     │                                       │
│   │        Item 504               │                                       │
│   └──────────────────────────────┘                                       │
│                                                                           │
│   PERFORMANCE: Sluggish scrolling, high memory, janky                     │
│                                                                           │
│                                                                           │
│  WITH VIRTUALIZATION (React Window):                                      │
│  ────────────────────────────────────────────────────────────────────────│
│                                                                           │
│   import { FixedSizeList } from 'react-window'                            │
│                                                                           │
│   const VirtualList = ({ items }) => (                                    │
│     <FixedSizeList                                                        │
│       height={600}        // Viewport height                              │
│       itemCount={items.length}                                            │
│       itemSize={50}       // Each item height                             │
│       width="100%"                                                        │
│     >                                                                     │
│       {({ index, style }) => (                                            │
│         <div style={style}>{items[index].name}</div>                      │
│       )}                                                                  │
│     </FixedSizeList>                                                      │
│   )                                                                       │
│                                                                           │
│   RESULT:                                                                 │
│   ┌──────────────────────────────┐                                       │
│   │ 🖥️ Visible Viewport (600px)   │  Item 1 (rendered)                    │
│   │ ──────────────────────────── │  Item 2 (rendered)                    │
│   │                              │  Item 3 (rendered)                    │
│   │                              │  Item 4 (rendered)                    │
│   │                              │  Item 5 (rendered)                    │
│   │ ──────────────────────────── │                                       │
│   │ Items 6-9995: Not rendered    │  Only 5-6 items in DOM!               │
│   │ Off-screen (hidden)           │                                       │
│   │ Items 9996-10000: Not rendered│                                       │
│   └──────────────────────────────┘                                       │
│   ↓ Scroll                                                                │
│   ┌──────────────────────────────┐                                       │
│   │ Items 498-499 (unmounted)     │  Item 500 (rendered)                  │
│   │ ──────────────────────────── │  Item 501 (rendered)                  │
│   │        Item 500 (rendered)    │  Item 502 (rendered)                  │
│   │        Item 501 (rendered)    │  Item 503 (rendered)                  │
│   │        Item 502 (rendered)    │  Item 504 (rendered)                  │
│   │        Item 503 (rendered)    │                                       │
│   │        Item 504 (rendered)    │  Always ~5-6 in DOM                   │
│   │ ──────────────────────────── │                                       │
│   │ Items 505-9998 (off-screen)   │                                       │
│   └──────────────────────────────┘                                       │
│                                                                           │
│   PERFORMANCE: Smooth 60fps scrolling, minimal memory, responsive        │
│                                                                           │
│                                                                           │
│  WHEN TO USE VIRTUALIZATION:                                             │
│  ────────────────────────────────────────────────────────────────────────│
│  ✅ Lists with 100+ items                                                │
│  ✅ Fixed-height items (FixedSizeList)                                   │
│  ✅ Variable heights possible (VariableSizeList)                         │
│  ✅ Infinite scrolling lists                                             │
│                                                                           │
│  ❌ NOT for small lists (<50 items)                                      │
│  ❌ NOT if items have complex effects (animations)                       │
│  ❌ NOT if search/filtering changes frequently                           │
│                                                                           │
│  LIBRARIES:                                                               │
│  • react-window (GitHub bvaughn, 4KB)                                    │
│  • react-virtualized (older, heavier)                                    │
│  • TanStack Virtual (framework agnostic)                                  │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. PROFILING METHODOLOGY: MEASURE → OPTIMIZE

The right way to optimize performance: data-driven, not guesswork.

```
┌─────────────────────────────────────────────────────────────────────────┐
│           PERFORMANCE OPTIMIZATION METHODOLOGY                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  PRINCIPLE: "You can't optimize what you don't measure"                  │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │ PHASE 1: MEASURE (Establish Baseline)                        │        │
│  ├──────────────────────────────────────────────────────────────┤        │
│  │                                                               │        │
│  │  Step 1.1: Run Lighthouse                                     │        │
│  │  ──────────────────────────────────────────────────────────   │        │
│  │   Chrome DevTools > Lighthouse tab                            │        │
│  │   • Performance: 45 (Bad)                                     │        │
│  │   • LCP: 4.2s (Target: <2.5s)                                 │        │
│  │   • FID: 280ms (Target: <100ms)                               │        │
│  │   • CLS: 0.18 (Target: <0.1)                                  │        │
│  │   Generate report with specific issues                        │        │
│  │                                                               │        │
│  │  Step 1.2: Profile with React DevTools                        │        │
│  │  ──────────────────────────────────────────────────────────   │        │
│  │   Extensions > React Developer Tools > Profiler tab           │        │
│  │   Record interactions:                                        │        │
│  │   • Which components are rendering?                           │        │
│  │   • How long does each take?                                  │        │
│  │   • Which re-renders are unnecessary?                         │        │
│  │                                                               │        │
│  │   Output: Flame chart showing all re-renders                  │        │
│  │                                                               │        │
│  │  Step 1.3: Check Bundle Size                                  │        │
│  │  ──────────────────────────────────────────────────────────   │        │
│  │   ANALYZE=true npm run build  (or vercel analytics)           │        │
│  │   • What libraries are taking space?                          │        │
│  │   • Any duplicates?                                           │        │
│  │   • Opportunities for splitting?                              │        │
│  │                                                               │        │
│  │  Step 1.4: Memory Profiling                                   │        │
│  │  ──────────────────────────────────────────────────────────   │        │
│  │   Chrome DevTools > Memory tab                                │        │
│  │   • Take heap snapshot (baseline)                             │        │
│  │   • Interact with app (add items, navigate, etc.)             │        │
│  │   • Take another snapshot                                     │        │
│  │   • Compare: should see decrease if cleanup works             │        │
│  │                                                               │        │
│  │  RESULT: Documented baseline metrics                          │        │
│  │  ┌────────────────────────────────────┐                       │        │
│  │  │ Before Optimization:               │                       │        │
│  │  │ ├─ Performance Score: 45           │                       │        │
│  │  │ ├─ LCP: 4.2s                       │                       │        │
│  │  │ ├─ FID: 280ms                      │                       │        │
│  │  │ ├─ Bundle Size: 540 KB             │                       │        │
│  │  │ ├─ Slowest Component: TaskList (2.1s) │                    │        │
│  │  │ └─ Memory Leak: 45 MB growth/session   │                   │        │
│  │  └────────────────────────────────────┘                       │        │
│  │                                                               │        │
│  └──────────────────────────────────────────────────────────────┘        │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │ PHASE 2: IDENTIFY BOTTLENECKS                                │        │
│  ├──────────────────────────────────────────────────────────────┤        │
│  │                                                               │        │
│  │  From measurements above, prioritize:                         │        │
│  │  1. LCP (users see slow load)                                 │        │
│  │  2. Unnecessary re-renders (React Profiler)                   │        │
│  │  3. Large bundle (code split, tree shake)                     │        │
│  │  4. Memory leaks (unsubscribe, cleanup)                       │        │
│  │                                                               │        │
│  │  Ask: "What has biggest impact relative to effort?"           │        │
│  │  Start with highest ROI optimizations                         │        │
│  │                                                               │        │
│  └──────────────────────────────────────────────────────────────┘        │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │ PHASE 3: OPTIMIZE (Targeted Fixes)                           │        │
│  ├──────────────────────────────────────────────────────────────┤        │
│  │                                                               │        │
│  │  Example 1: React.memo on slow component                      │        │
│  │  ───────────────────────────────────────────                  │        │
│  │   const TaskList = memo(function TaskList(props) {            │        │
│  │     // ... was rendering: 12ms                                │        │
│  │     // ... now renders: 0.8ms (only when props change)        │        │
│  │   })                                                          │        │
│  │                                                               │        │
│  │  Example 2: Code split heavy route                            │        │
│  │  ───────────────────────────────────────────                  │        │
│  │   const ChartPage = lazy(() => import('./ChartPage'))         │        │
│  │   // Reduces main bundle 540KB → 380KB                        │        │
│  │                                                               │        │
│  │  Example 3: Add cleanup to useEffect                          │        │
│  │  ───────────────────────────────────────────                  │        │
│  │   useEffect(() => {                                           │        │
│  │     subscription.subscribe(...)                               │        │
│  │     return () => subscription.unsubscribe()                   │        │
│  │   }, [])                                                      │        │
│  │   // Memory growth: 45MB → 2MB!                               │        │
│  │                                                               │        │
│  └──────────────────────────────────────────────────────────────┘        │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │ PHASE 4: RE-MEASURE (Verify Improvements)                    │        │
│  ├──────────────────────────────────────────────────────────────┤        │
│  │                                                               │        │
│  │  Run same measurements again:                                 │        │
│  │  ┌────────────────────────────────────┐                       │        │
│  │  │ After Optimization:                │                       │        │
│  │  │ ├─ Performance Score: 88 ↑ +43%    │                       │        │
│  │  │ ├─ LCP: 1.8s ↑ +2.4s               │                       │        │
│  │  │ ├─ FID: 65ms ↑ +215ms              │                       │        │
│  │  │ ├─ Bundle Size: 380 KB ↓ -160 KB   │                       │        │
│  │  │ ├─ TaskList Render: 0.8ms ↓ -1.3ms │                       │        │
│  │  │ └─ Memory: 2MB/session ↓ -43MB     │                       │        │
│  │  └────────────────────────────────────┘                       │        │
│  │                                                               │        │
│  │  ✅ Progress! But not done yet:                               │        │
│  │  - LCP still above 1.5s target                                │        │
│  │  - FID approaching 100ms target                               │        │
│  │                                                               │        │
│  └──────────────────────────────────────────────────────────────┘        │
│                                                                           │
│  LOOP BACK TO PHASE 2 until targets met or ROI diminishes                │
│                                                                           │
│  KEY PRINCIPLE: Never optimize based on intuition alone.                  │
│  Measure → Identify → Fix → Verify → Repeat                              │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

PROFILING TOOLS REFERENCE:
──────────────────────────────────────────────────────────────────────────
1. Chrome DevTools Lighthouse    → Overall performance audit
2. React DevTools Profiler        → Component render times
3. Chrome DevTools Performance    → Frame rate, long tasks
4. Chrome DevTools Memory         → Heap snapshots, detached DOM
5. Bundle Analyzer                → What's in your bundle
6. web-vitals npm package         → Real-world metrics
```

---

## Key Takeaways

| Concept | Purpose | When to Use |
|---------|---------|-------------|
| **React.memo** | Skip re-render if props same | Child component receiving stable props |
| **useCallback** | Memoize function reference | Passing function to memoized child |
| **useMemo** | Memoize expensive calculation | Heavy sorting, filtering, calculations |
| **Code Splitting** | Load JS on-demand | Routes, heavy components, modals |
| **Tree Shaking** | Remove dead code | Named imports from ES modules |
| **Virtualization** | Render visible items only | Lists with 100+ items |
| **Image Optimization** | Reduce image bytes | All images (lazy load, WebP, srcset) |
| **Memory Cleanup** | Prevent leaks | All useEffect hooks |

---

**Next Step:** Apply these patterns to your codebase using the measurement methodology!
