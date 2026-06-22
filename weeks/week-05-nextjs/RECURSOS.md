# 📚 Recursos: Next.js & Server Components

Curated resources for mastering Next.js 14+ App Router, React Server Components, and modern full-stack development.

---

## React Server Components (RSC)

### Official Documentation
- **React Server Components** - https://react.dev/reference/rsc/server-components
  - What RSC are and why they matter
  - Server vs Client Component rules
  - When to use each

- **React Client Components** - https://react.dev/reference/rsc/client-components
  - Client-side interactivity in RSC
  - Hooks in Client Components
  - Browser APIs

- **React Suspense** - https://react.dev/reference/react/Suspense
  - Progressive rendering
  - Streaming with Suspense
  - Error boundaries

### Articles & Guides
- **Vercel's RSC Explained** - https://vercel.com/blog/how-react-server-components-work
  - How RSC execution works
  - Performance implications
  - Mental model for RSC

- **Dan Abramov's RSC Notes** - https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md
  - Technical RFC (Request for Comments)
  - Design decisions explained
  - Use cases and limitations

---

## Next.js App Router

### Official Documentation
- **Next.js App Router** - https://nextjs.org/docs/app
  - File-based routing system
  - Special files (page, layout, loading, error)
  - Dynamic routes and catch-all routes

- **File Conventions** - https://nextjs.org/docs/app/api-reference/file-conventions
  - page.tsx - Route definition
  - layout.tsx - Layout wrapper
  - loading.tsx - Loading UI
  - error.tsx - Error boundaries
  - not-found.tsx - 404 page
  - route.ts - API routes

- **Route Groups & Advanced Routing** - https://nextjs.org/docs/app/building-your-application/routing/route-groups
  - Organize routes without URL segments
  - Parallel routes for modals/sidebars
  - Intercepting routes

### Structure & Best Practices
- **App Router Migration Guide** - https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration
  - Migrate from Pages Router to App Router
  - Side-by-side comparison
  - Common patterns

---

## Server Actions & Mutations

### Official Documentation
- **Server Actions** - https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
  - Define Server Actions
  - Call from Client Components
  - Form integration
  - Error handling
  - Revalidation strategies

- **useFormStatus Hook** - https://react.dev/reference/react-dom/hooks/useFormStatus
  - Track form submission status
  - Show loading states
  - Display pending UI

- **useFormAction Hook** - https://react.dev/reference/react-dom/hooks/useFormAction
  - Access form action in components
  - Conditional submission
  - Custom form handling

### Articles
- **Next.js Server Actions Best Practices** - https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#best-practices
  - Security considerations
  - Performance optimization
  - Error handling patterns

---

## Data Fetching Strategies

### Official Documentation
- **Data Fetching** - https://nextjs.org/docs/app/building-your-application/data-fetching
  - Fetching on the server
  - Client-side fetching
  - Patterns and best practices

- **Data Fetching Patterns** - https://nextjs.org/docs/app/building-your-application/data-fetching/patterns
  - Sequential vs parallel fetching
  - Using Suspense for loading states
  - Dynamic and static rendering

- **Incremental Static Regeneration (ISR)** - https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration
  - Revalidation on-demand
  - Revalidation on a schedule
  - ISR vs Static vs Dynamic

### Articles & Case Studies
- **When to use Static vs Dynamic** - https://nextjs.org/docs/app/building-your-application/rendering/server-components#when-to-use-server-and-client-components
  - Decision matrix for rendering modes
  - Performance implications
  - SEO considerations

- **Next.js Caching** - https://nextjs.org/docs/app/building-your-application/caching
  - Request memoization
  - Data cache
  - Full route cache
  - Client-side router cache

---

## Metadata & SEO

### Official Documentation
- **Metadata API** - https://nextjs.org/docs/app/building-your-application/optimizing/metadata
  - Static metadata
  - Dynamic metadata with generateMetadata
  - Open Graph and Twitter Cards
  - Robots and sitemap

- **SEO Optimization** - https://nextjs.org/learn/seo/introduction-to-seo
  - SEO fundamentals
  - Core Web Vitals
  - Structured data

### Tools
- **Open Graph Preview Tool** - https://www.opengraphcheck.com/
  - See how your page appears when shared
  - Preview social media cards
  - Debug metadata

- **Schema Markup Generator** - https://schema.org/
  - Structured data for search engines
  - Organization, Article, Product schemas
  - Rich snippet generation

---

## Route Handlers & API Routes

### Official Documentation
- **Route Handlers** - https://nextjs.org/docs/app/building-your-application/routing/route-handlers
  - Create API endpoints
  - HTTP methods (GET, POST, PUT, DELETE)
  - Request and response handling
  - Middleware in Route Handlers

- **Middleware** - https://nextjs.org/docs/app/building-your-application/routing/middleware
  - Run code before request handling
  - Authentication and authorization
  - Request modification
  - CORS handling

### Patterns
- **REST API Best Practices** - https://nextjs.org/docs/app/building-your-application/routing/route-handlers#best-practices
  - Error handling
  - CORS configuration
  - Rate limiting
  - Input validation

---

## Streaming & Progressive Rendering

### Official Documentation
- **Streaming** - https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
  - Benefits of streaming
  - Suspense with Server Components
  - Streaming patterns

### Articles
- **Understanding Streaming** - https://vercel.com/blog/streaming-best-practices-for-next-js
  - How streaming improves perceived performance
  - Waterfall prevention
  - UX patterns

---

## Deployment & Hosting

### Vercel (Official Next.js Host)
- **Vercel Documentation** - https://vercel.com/docs
  - Deploy Next.js apps
  - Environment variables
  - Preview deployments
  - Analytics and monitoring

- **Vercel CLI** - https://vercel.com/docs/cli
  - Local development
  - Deployment automation
  - Log viewing

### Alternative Hosting
- **Self-Hosted on AWS** - https://aws.amazon.com/blogs/
  - Deploy to EC2, ECS, or Lambda
  - CloudFront for CDN
  - Environment configuration

- **Docker Deployment** - https://nextjs.org/docs/app/building-your-application/deploying/docker
  - Containerize Next.js
  - Deploy to any platform
  - Production optimization

---

## Image & Asset Optimization

### Official Documentation
- **Image Optimization** - https://nextjs.org/docs/app/building-your-application/optimizing/images
  - Next.js Image component
  - Automatic optimization
  - Responsive images
  - Placeholder options

- **Font Optimization** - https://nextjs.org/docs/app/building-your-application/optimizing/fonts
  - next/font
  - Google Fonts integration
  - System fonts
  - Variable fonts

- **Static Assets** - https://nextjs.org/docs/app/building-your-application/optimizing/static-assets
  - Public directory
  - CDN and caching
  - Versioning

---

## TypeScript Integration

### Official Documentation
- **TypeScript Setup** - https://nextjs.org/docs/app/building-your-application/configuring/typescript
  - TypeScript with Next.js
  - Type checking
  - Plugin system

### Libraries & Tools
- **ts-rest** - https://ts-rest.com/
  - End-to-end type safety
  - Share API contracts between client and server
  - RPC-like experience

- **Zod** - https://zod.dev/
  - Type-safe form validation
  - Runtime type checking
  - Error messages

- **tRPC** - https://trpc.io/
  - Strongly-typed RPC between client/server
  - Automatic API routes from TypeScript
  - Full-stack type safety

---

## Advanced Patterns

### Parallel Routes & Modals
- **Parallel Routes** - https://nextjs.org/docs/app/building-your-application/routing/parallel-routes
  - Render multiple pages simultaneously
  - Independent error handling
  - Modal patterns with intercepting routes

- **Intercepting Routes** - https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes
  - Modal workflows
  - Keep URL intact
  - Soft navigation

### Advanced Caching
- **Request Deduplication** - https://nextjs.org/docs/app/building-your-application/caching#request-memoization
  - Automatic dedup within request
  - Prevent duplicate database queries
  - Request lifetime caching

- **Dynamic Rendering** - https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-rendering
  - When to use dynamic rendering
  - Incremental adoption
  - Performance considerations

---

## Testing & Quality

### Testing Libraries
- **Vitest** - https://vitest.dev/
  - Fast unit testing
  - Jest-compatible
  - Native ESM support

- **React Testing Library** - https://testing-library.com/
  - Component testing
  - User-centric testing
  - Query APIs

- **Cypress** - https://www.cypress.io/
  - End-to-end testing
  - Visual testing
  - API testing

- **Playwright** - https://playwright.dev/
  - Cross-browser E2E testing
  - Mobile testing
  - Headless and headed modes

### Code Quality
- **ESLint** - https://eslint.org/
  - Code linting
  - Next.js rules plugin
  - Custom rules

- **Prettier** - https://prettier.io/
  - Code formatting
  - Opinionated but configurable
  - CI/CD integration

---

## Monitoring & Analytics

### Performance Monitoring
- **Vercel Analytics** - https://vercel.com/analytics
  - Real User Monitoring (RUM)
  - Web Vitals
  - Performance trends

- **web-vitals** - https://www.npmjs.com/package/web-vitals
  - Measure Core Web Vitals
  - Send to analytics
  - Real user metrics

- **Sentry** - https://sentry.io/
  - Error tracking
  - Session replay
  - Performance monitoring

### Database & API Monitoring
- **Prisma Studio** - https://www.prisma.io/studio
  - Browse database visually
  - Development tool
  - Data inspection

- **Database Query Insights** - https://planetscale.com/docs/
  - Monitor database queries
  - Find slow queries
  - Optimize performance

---

## Learning Paths

### Beginner Path (Week 5)
1. Learn RSC fundamentals (server vs client components)
2. Understand App Router file conventions
3. Create basic routes with page.tsx and layout.tsx
4. Add Server Actions for mutations
5. Implement loading.tsx and error.tsx

### Intermediate Path
1. Master Suspense and streaming
2. Implement ISR for periodic updates
3. Add Metadata API for SEO
4. Create protected routes with middleware
5. Setup TypeScript for full-stack type safety

### Advanced Path
1. Implement parallel routes for modals
2. Use intercepting routes
3. Advanced caching strategies
4. Custom error boundaries
5. Deploy to production with monitoring

---

## Real-World Examples

### Open Source Projects
- **Next.js Examples** - https://github.com/vercel/next.js/tree/canary/examples
  - Official examples
  - Starter templates
  - Community contributions

- **T3 Stack** - https://create.t3.gg/
  - Full-stack TypeScript
  - Includes best practices
  - Opinionated but proven

### Templates & Boilerplates
- **Next.js App Router Starter** - Basic setup with TypeScript
- **Headless CMS Integration** - Next.js with Strapi, Contentful, etc.
- **E-commerce Template** - With cart, checkout, payments
- **SaaS Boilerplate** - Authentication, billing, multi-tenancy

---

## Quick Reference Commands

```bash
# Create new Next.js project
npx create-next-app@latest my-app --typescript --app

# Development server
npm run dev

# Production build
npm run build
npm start

# Deploy to Vercel
npm i -g vercel
vercel --prod

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format
npm run format

# Test
npm test
```

---

## Performance Targets

- **Lighthouse Score:** 90+
- **LCP:** < 2.5s
- **FID/INP:** < 100ms
- **CLS:** < 0.1
- **Bundle Size:** < 350KB gzipped (main)
- **Build Time:** < 2 minutes

---

## Recommended Learning Order

1. **Core RSC Concepts** (2 hours)
   - Understand server vs client rendering
   - Benefits and tradeoffs

2. **App Router Navigation** (3 hours)
   - File conventions
   - Dynamic routes
   - Nested layouts

3. **Data Fetching** (4 hours)
   - Server Components
   - Static/Dynamic/ISR strategies
   - Suspense with streaming

4. **Server Actions** (2 hours)
   - Create mutations
   - Form integration
   - Revalidation

5. **SEO & Metadata** (2 hours)
   - Metadata API
   - Open Graph
   - Sitemap generation

6. **Advanced Patterns** (4 hours)
   - Middleware authentication
   - Parallel routes
   - Error boundaries

---

**Note:** Most resources are official (React, Next.js, Vercel) and kept up-to-date. Check version numbers for compatibility with Next.js 14+.
