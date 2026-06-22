# 📚 Recursos: Performance Optimization

Curated resources for mastering React performance optimization, profiling tools, and Core Web Vitals.

---

## React DevTools & Profiling

### Official Documentation
- **React DevTools Profiler** - https://react.dev/learn/react-developer-tools
  - Interactive guide to measuring component render times
  - Learn to identify unnecessary re-renders
  - Flame chart visualization of render behavior

- **React Performance Guidelines** - https://react.dev/learn/render-and-commit
  - Deep dive into reconciliation and commit phases
  - Understanding virtual DOM diffing
  - State updates and batching

### Articles & Guides
- **"Why you shouldn't use a div for that" article** - Talks about semantic HTML performance
- **React Performance Optimization (Kent C. Dodds)** - https://kentcdodds.com/blog/usememo-and-usecallback
  - When to use useMemo and useCallback
  - Common pitfalls and best practices
  - Performance profiling methodology

---

## Core Web Vitals & Metrics

### Google Web Vitals
- **Web Vitals Hub** - https://web.dev/vitals/
  - LCP, FID/INP, CLS metric definitions
  - Why each metric matters
  - Tools for measurement

- **Lighthouse Performance Audits** - https://developers.google.com/web/tools/lighthouse
  - Free automated auditing tool
  - Performance scores and recommendations
  - CI/CD integration with Lighthouse CI

- **Chrome User Experience Report** - https://developer.chrome.com/docs/crux/
  - Real-world performance metrics from actual users
  - Compare your site to competitors
  - Track improvements over time

- **Web Vitals Measurement Guide** - https://web.dev/vitals-measurement-getting-started/
  - Real User Monitoring (RUM) setup
  - Using web-vitals npm package
  - Sending metrics to analytics

### Tools
- **web-vitals npm package** - https://www.npmjs.com/package/web-vitals
  - Simple library to measure Core Web Vitals
  - Use for RUM (Real User Monitoring)
  - Send to your analytics platform

- **PageSpeed Insights** - https://pagespeed.web.dev/
  - Free web-based Lighthouse reports
  - Mobile and desktop comparisons
  - URL-based auditing

---

## React Optimization Techniques

### Memoization & Component Optimization
- **React.memo Documentation** - https://react.dev/reference/react/memo
  - Component memoization basics
  - Custom comparison functions
  - Shallow vs deep comparison

- **useMemo Hook** - https://react.dev/reference/react/useMemo
  - Memoizing expensive calculations
  - Dependency array behavior
  - When to use useMemo (and when not to)

- **useCallback Hook** - https://react.dev/reference/react/useCallback
  - Memoizing function references
  - Preventing child re-renders
  - Dependency management best practices

### Code Splitting & Lazy Loading
- **React.lazy Documentation** - https://react.dev/reference/react/lazy
  - Route-based code splitting
  - Component-level splitting
  - Suspense integration

- **Dynamic Imports** - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import
  - JavaScript dynamic import syntax
  - Conditional imports
  - Performance implications

- **Next.js Dynamic Imports** - https://nextjs.org/docs/app/building-your-application/optimizing/dynamic-imports
  - Next.js-specific code splitting
  - Automatic route splitting
  - Loading states and error boundaries

### List Virtualization
- **react-window GitHub** - https://github.com/bvaughn/react-window
  - Fixed and variable size lists
  - Infinite scrolling implementation
  - VariableSizeList for dynamic heights
  - 4KB library (extremely lightweight)

- **Virtualize Long Lists in React** - https://web.dev/virtualize-long-lists-react-window/
  - Practical guide with examples
  - Performance comparison (virtual vs non-virtual)
  - When to use virtualization

- **TanStack Virtual** - https://tanstack.com/virtual/latest
  - Framework-agnostic virtualization
  - Works with React, Vue, Svelte, etc.
  - Modern alternative to react-window

---

## Bundle Size & Analysis

### Bundle Analyzer Tools
- **@next/bundle-analyzer** - https://www.npmjs.com/package/@next/bundle-analyzer
  - Next.js built-in bundle analysis
  - Interactive treemap visualization
  - Identify large dependencies

- **webpack-bundle-analyzer** - https://www.npmjs.com/package/webpack-bundle-analyzer
  - Webpack plugin for bundle visualization
  - Works with any Webpack-based build
  - Interactive socket server

- **Bundle Phobia** - https://bundlephobia.com/
  - Check npm package sizes before installing
  - See gzipped and minified sizes
  - Compare with alternatives

### Tree Shaking & Code Splitting
- **Tree Shaking in JavaScript** - https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking
  - How tree shaking works
  - Conditions for tree-shakeable code
  - Common pitfalls (default exports, side effects)

- **Code Splitting Best Practices** - https://webpack.js.org/guides/code-splitting/
  - Different code splitting strategies
  - Entry point splitting
  - Dynamic splitting with imports

- **ES6 Module Side Effects** - https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free
  - sideEffects field in package.json
  - How to enable tree shaking
  - package.json configuration

---

## Memory Profiling

### Chrome DevTools Memory
- **Chrome DevTools Memory Guide** - https://developer.chrome.com/docs/devtools/memory-problems/
  - Heap snapshots
  - Timeline allocation tracking
  - Detached DOM node detection
  - Memory leak identification

### Memory Leak Patterns
- **React Memory Leaks** - https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render
  - Common memory leak patterns
  - How to fix memory leaks
  - Using AbortController for requests

- **useEffect Cleanup** - https://react.dev/learn/synchronizing-with-effects#cleaning-up-an-effect
  - Proper cleanup patterns
  - Event listener cleanup
  - Subscription management

- **AbortController API** - https://developer.mozilla.org/en-US/docs/Web/API/AbortController
  - Cancel fetch requests
  - Prevent setState after unmount
  - Browser-native cancellation

---

## Real-World Case Studies

### Performance Case Studies
- **Etsy's Performance Improvements** - Case study on how Etsy improved Core Web Vitals
  - Real metrics before and after
  - Specific optimizations applied
  - Business impact (conversion rates)

- **Walmart's JavaScript Performance** - Their journey to faster load times
  - Bundle splitting strategies
  - Image optimization
  - Network-aware loading

- **Vercel's Next.js Performance** - Real-world Next.js optimization examples
  - Next.js-specific optimizations
  - Vercel platform advantages
  - Streaming and SSR strategies

---

## Image & Asset Optimization

### Image Optimization
- **Next.js Image Component** - https://nextjs.org/docs/app/building-your-application/optimizing/images
  - Automatic image optimization
  - Responsive images (sizes attribute)
  - Blur placeholder support
  - Lazy loading by default

- **Web Image Formats** - https://web.dev/image-formats/
  - JPEG vs WebP vs AVIF
  - Format selection strategies
  - Compression ratios

- **Responsive Images** - https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
  - srcset attribute usage
  - sizes attribute for responsive sizing
  - Picture element for art direction

### Font Optimization
- **Web Font Best Practices** - https://web.dev/font-best-practices/
  - font-display strategies (swap, fallback, optional)
  - Font subsetting
  - Self-hosting vs CDN trade-offs

- **next/font Documentation** - https://nextjs.org/docs/app/building-your-application/optimizing/fonts
  - Automatic font optimization
  - Google Fonts integration
  - Variable font support

---

## Performance Monitoring & CI Integration

### Lighthouse CI
- **Lighthouse CI GitHub** - https://github.com/GoogleChrome/lighthouse-ci
  - Automated performance testing
  - Performance budget enforcement
  - CI/CD integration (GitHub, GitLab, etc.)

- **Lighthouse CI Setup Guide** - Complete configuration examples
  - Performance thresholds
  - Budget assertions
  - GitHub PR integration

### Performance Monitoring Services
- **Vercel Analytics** - https://vercel.com/analytics
  - Real User Monitoring (RUM) on Vercel
  - Core Web Vitals tracking
  - Performance trends and anomaly detection

- **Web Vitals Reporting** - https://web.dev/vitals-measurement-getting-started/
  - Google Analytics integration
  - Third-party analytics services
  - Custom reporting solutions

---

## Advanced Techniques

### Service Workers & Caching
- **Service Worker Fundamentals** - https://developers.google.com/web/tools/service-worker
  - Offline caching strategies
  - Request interception
  - Cache invalidation

- **Workbox Library** - https://developers.google.com/web/tools/workbox
  - Service worker library by Google
  - Pre-caching, runtime caching
  - Cache versioning and cleanup

### Web Workers & Offloading
- **Web Workers API** - https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
  - Background computation
  - Heavy lifting off main thread
  - Data serialization and messaging

---

## Learning Paths

### Beginner Path (Week 4)
1. Read: Core Web Vitals introduction
2. Tool: Run Lighthouse on your app
3. Profile: Use React DevTools Profiler
4. Implement: Add React.memo to slow components
5. Measure: Re-run Lighthouse

### Intermediate Path
1. Bundle Analysis: Visualize your dependencies
2. Code Splitting: Lazy load routes and heavy components
3. Memory Profiling: Take heap snapshots and identify leaks
4. Virtualization: Implement for long lists
5. Image Optimization: Convert to WebP with lazy loading

### Advanced Path
1. Service Workers: Implement offline-first strategies
2. Web Workers: Offload heavy computations
3. Custom Metrics: Build RUM with web-vitals package
4. Performance Budgets: Enforce in CI/CD
5. Edge Rendering: Stream HTML with Suspense

---

## Quick Reference Commands

```bash
# React DevTools
Open DevTools > React > Profiler > Record interaction

# Lighthouse
npx lighthouse https://yoursite.com --view

# Bundle Analysis (Next.js)
ANALYZE=true npm run build

# Bundle Analysis (Webpack)
npm run build -- --analyze

# Web Vitals measurement
npm install web-vitals

# Lighthouse CI
lhci wizard
lhci autorun

# Memory profiling
Open DevTools > Memory > Take snapshot

# Performance recording
Open DevTools > Performance > Record
```

---

**Recommended Learning Order:**
1. Core Web Vitals (understand what to measure)
2. React DevTools Profiler (identify slow components)
3. React Optimization (memo, useMemo, useCallback)
4. Code Splitting (reduce bundle size)
5. Image/Font Optimization (optimize assets)
6. Memory Profiling (prevent leaks)

---

**Note:** Most resources are from official sources (React, Google, MDN) which receive regular updates. Check publication dates and React version compatibility.
