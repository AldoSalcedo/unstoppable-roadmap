# 🤖 AGENTS: Performance Optimization Week

## Context
Performance optimization sprint for clinical SaaS platform. Focus on React rendering efficiency, bundle optimization, and Core Web Vitals compliance.

---

## Key Patterns & Principles

### 1. Measurement-First Mindset
- **Never guess.** Always measure before optimizing.
- Establish baseline metrics (Lighthouse, React DevTools Profiler).
- Track improvements with before/after comparisons.
- Target: Lighthouse performance > 85, LCP < 2.5s, FID < 100ms.

### 2. React Optimization Hierarchy
```
Priority 1: Unnecessary re-renders (biggest impact)
  └─ Use React.memo on expensive components
  └─ useCallback for stable function references
  └─ useMemo for expensive calculations

Priority 2: Bundle size (loading performance)
  └─ Code splitting at route level
  └─ Lazy loading heavy components
  └─ Tree shaking unused code

Priority 3: Assets (initial load)
  └─ Image optimization (WebP, lazy load)
  └─ Font optimization (font-display: swap)
  └─ CSS minification

Priority 4: Memory (runtime stability)
  └─ Clean up event listeners
  └─ Cancel pending requests (AbortController)
  └─ Unsubscribe from observables
```

### 3. Web Vitals Targets
- **LCP (Largest Contentful Paint):** < 2.5 seconds
- **FID/INP (Input Delay):** < 100ms
- **CLS (Layout Shift):** < 0.1
- **TTFB (Time to First Byte):** < 600ms

---

## Common Optimization Patterns

### Pattern: Preventing Re-renders
```
Component A (Parent) re-renders
  ├─ Component B (memo) ← Props same? Skip re-render ✅
  └─ Component C ← Props changed? Re-render 📝
```

### Pattern: Code Splitting Routes
```
app/
  ├─ layout.tsx         (always loaded)
  ├─ page.tsx           (always loaded)
  ├─ dashboard/
  │  └─ page.tsx        (lazy loaded, ~50KB)
  └─ admin/
     └─ page.tsx        (lazy loaded, ~80KB)
```

### Pattern: Image Optimization
```
User requests page
  ├─ Inline placeholder (blurred low-res)
  ├─ Load high-res image in background
  └─ Display when ready

Result: Perceived faster loading + smooth UX
```

---

## Essential Tools & Commands

### React DevTools Profiler
```bash
# Run your app
npm start

# Open DevTools → React tab → Profiler
# Record interaction, identify slow renders
```

### Lighthouse CI
```bash
# Install
npm install -g @lhci/cli@latest

# Create config
lhci wizard

# Run CI
lhci autorun
```

### Bundle Analyzer
```bash
# Install
npm install -D @next/bundle-analyzer

# Run analysis (Next.js)
ANALYZE=true npm run build

# Or with webpack
npm install -D webpack-bundle-analyzer
```

### Web Vitals Measurement
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Chrome DevTools Memory Profiler
```
DevTools > Memory tab
1. Take heap snapshot (baseline)
2. Perform user action (mount/unmount component)
3. Take another snapshot
4. Compare: should see decrease if cleanup works
```

---

## Debugging Checklist

When performance is slow:

1. **Profiling First**
   - [ ] Run Lighthouse → identify primary bottleneck
   - [ ] React DevTools Profiler → find slow components
   - [ ] Chrome DevTools Performance → check for long tasks

2. **For Slow Renders**
   - [ ] Is component re-rendering unnecessarily?
   - [ ] Can you wrap it with React.memo?
   - [ ] Are functions/objects recreated each render?
   - [ ] Use useCallback/useMemo if needed

3. **For Slow Loading**
   - [ ] Is main bundle too large?
   - [ ] Can you code-split heavy routes/components?
   - [ ] Are images optimized (WebP, right size)?
   - [ ] Are fonts optimized (preload critical, swap)?

4. **For Memory Issues**
   - [ ] Take heap snapshots before/after interactions
   - [ ] Are event listeners cleaned up?
   - [ ] Are timers/intervals cleared?
   - [ ] Are subscriptions unsubscribed?

---

## Performance Budget Template

```yaml
Performance Targets (Weekly):
  - Lighthouse Score: 85+
  - LCP: < 2.5s
  - FID/INP: < 100ms
  - CLS: < 0.1
  - Bundle Size: < 400 KB (gzipped)
  - No Critical Memory Leaks

Review Process:
  - Daily: Check Lighthouse score in CI
  - Weekly: Review performance metrics
  - Monthly: Identify trends and optimization opportunities
```

---

## Key Reminders

- **Measure before you optimize** (avoid wasted effort)
- **Profile in production mode** (dev mode is slower)
- **Monitor real users** with RUM (Real User Monitoring)
- **Set performance budgets** and enforce in CI
- **Document optimizations** for team knowledge
- **Don't over-optimize** (diminishing returns after 85+ score)

---

**Status:** Week 4 focus is on practical optimization implementation using data-driven approach.
