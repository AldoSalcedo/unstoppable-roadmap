# Week 4 Live Notes — Performance Optimization & Core Web Vitals

*Escribe aquí las ideas, patrones, y preguntas que surgen mientras optimizas React y Core Web Vitals. No tiene que estar pulido.*

---

## Day 1 — Core Web Vitals & Performance Metrics

**Concepto**: Google mide performance con 3 métricas (2024+): LCP, INP, CLS.

```typescript
// Monitor Core Web Vitals con web-vitals library
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log); // Cumulative Layout Shift
getLCP(console.log); // Largest Contentful Paint (< 2.5s target)
getFCP(console.log); // First Contentful Paint
getTTFB(console.log); // Time to First Byte (< 600ms)

// Good targets:
// LCP: < 2.5 seconds
// INP: < 200 milliseconds (Interaction Next Paint)
// CLS: < 0.1 (layout shifts)
```

**Patrón observado**: LCP es lo más importante. Si página carga rápido, usuarios esperan.

**Pregunta que surgió**: ¿Cómo mejoro LCP? Respuesta: optimiza imagen más grande, reduce CSS blocking, server-side render.

---

## Day 2 — Code Splitting & Lazy Loading

**Concepto**: Carga código solo cuando se necesita, no todo al inicio.

```typescript
// Code splitting con React.lazy
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

export function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Suspense>
  );
}

// Result: Initial bundle 100KB → 60KB
// AdminPanel loads only when user navigates to /admin
```

**Patrón**: Separa rutas en chunks. Lazy load modales y componentes pesados.

---

## Day 3 — Image Optimization & Responsive Images

**Concepto**: Imágenes son 50% del peso total. Optimizarlas es ganar más que cualquier otra cosa.

```typescript
// Bad: single large image
<img src="photo.jpg" alt="Hero" />

// Good: responsive + WebP + lazy loading
<picture>
  <source
    srcSet="hero-800w.webp 800w, hero-1600w.webp 1600w"
    type="image/webp"
  />
  <source
    srcSet="hero-800w.jpg 800w, hero-1600w.jpg 1600w"
    type="image/jpeg"
  />
  <img
    src="hero-1600w.jpg"
    alt="Hero"
    loading="lazy"
    width={1600}
    height={900}
  />
</picture>

// Using Next.js Image component (automatic optimization)
import Image from 'next/image';

export function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={1600}
      height={900}
      priority // LCP image, load immediately
      sizes="(max-width: 768px) 100vw, 1600px"
    />
  );
}
```

**Patrón**: WebP + srcset + lazy loading = 60-70% reduction.

---

## Day 4 — Bundle Analysis & Tree Shaking

**Concepto**: Algunos bundlers incluyen código que nunca ejecutas. Detecta y elimina.

```typescript
// Analyze bundle (webpack-bundle-analyzer)
import BundleAnalyzerPlugin from 'webpack-bundle-analyzer';

// In webpack.config.js
plugins: [
  new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    openAnalyzer: false
  })
];

// Tree shaking: only import what you use
// BAD
import * as lodash from 'lodash';
const result = lodash.debounce(fn, 300); // includes entire library

// GOOD
import { debounce } from 'lodash-es';
const result = debounce(fn, 300); // includes only debounce
```

**Patrón**: Usa lodash-es o individual imports. Audit bundle monthly.

---

## Day 5 — React Performance Patterns

**Concepto**: React puede hacer muchas renders innecesarios. Memoización previene.

```typescript
// useMemo: memoiza expensive calculations
function UserProfile({ userId }: { userId: string }) {
  const computedMetrics = useMemo(() => {
    return expensiveAnalysis(userId);
  }, [userId]); // recompute only when userId changes
}

// useCallback: memoiza function references
function SearchBox() {
  const handleSearch = useCallback((query: string) => {
    // expensive search
  }, []); // function never changes

  return <SearchInput onSearch={handleSearch} />;
}

// React.memo: skip re-render if props unchanged
interface ItemProps { item: Item; onDelete: () => void; }
const ListItem = React.memo(({ item, onDelete }: ItemProps) => {
  return (
    <div>
      <span>{item.name}</span>
      <button onClick={onDelete}>Delete</button>
    </div>
  );
});
```

**Patrón**: Memoize expensive calculations y callbacks pasados a child components.

---

## Patrones descubiertos

**Pattern 1: Performance Budgets**
Establece límites: "initial bundle < 150KB", "LCP < 2.5s". Bloquea PRs que exceden.

**Pattern 2: Streaming Optimization**
Renderiza lo que el usuario ve primero. Renderiza el resto mientras interactúa.

**Pattern 3: Metric Monitoring**
Monitorea Core Web Vitals en producción. Alertas si degradan.

---

## Conexión con background

**De Auditoría**: Performance = control effectiveness. Auditar que optimization targets se cumplen.

**De QBP**: Performance datos = costo por transacción. Optimizar = reducir costo operacional.

**De Ventas**: "Page loads 5 seconds faster" = "Users stay 10% longer" = "10% more conversions".

---

## Notas Adicionales

- Core Web Vitals: LCP > INP > CLS en importancia
- Next.js Image component automatiza optimizaciones
- Memoization tiene cost (memory). Usa juiciosamente.
- Bundle analyzer revela sorpresas (qué libraries son grandes)

---

**Última entrada**: 2026-04-23
**Próxima sesión**: 2026-04-24
