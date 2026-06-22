# Week 12 Live Notes — Portfolio + Open Source + Professional Branding

*Escribe aquí las ideas, patrones, y preguntas que surgen mientras construyes tu marca profesional. No tiene que estar pulido.*

---

## Day 1 — Portfolio Website & Case Studies

**Concepto**: Portfolio no es lista de proyectos. Es evidence de impacto.

```typescript
// Portfolio structure
// Portfolio website should have:
// 1. Projects with metrics (users, performance, revenue)
// 2. Case studies (problem → solution → impact)
// 3. Blog (show your thinking)
// 4. Contact + links (email, GitHub, LinkedIn)

// Example case study structure
interface CaseStudy {
  title: 'Healthcare Diagnosis AI';
  problem: 'Doctors spend 2 hours/day on administrative tasks. Delayed diagnoses.';
  solution: 'Built AI-assisted diagnosis system with Azure AI + OpenAI.';
  impact: {
    time_saved: '30% reduction in diagnostic time',
    accuracy: '94% alignment with specialist diagnosis',
    users: '500+ beta testers',
    nps: 8.5
  };
  tech: ['Next.js', 'React Native', 'Azure OpenAI', 'Prisma'];
  metrics: {
    performance: 'LCP < 1.5s',
    uptime: '99.95%',
    users: '500+',
    daily_active: '200+'
  }
}

// Portfolio tech stack
// Next.js (obviously)
// Tailwind CSS (looks modern)
// Framer Motion (smooth animations)
// GitHub API (fetch projects automatically)
// Vercel (deploy automatically)
```

**Patrón observado**: Números hablan. "Built app" vs "Built app for 500 users at $10k MRR".

**Pregunta que surgió**: ¿Cuántos proyectos? Respuesta: 3-5 best, no 10 mediocres.

---

## Day 2 — Open Source Contributions

**Concepto**: Contribuir a open source demuestra colaboración y impacto.

```typescript
// Cuatro tipos de contribuciones

// Type 1: Bug fixes
// - Pequeñas, rápidas
// - Muestra atención al detalle
// - Prueba tu habilidad para read code

// Type 2: Features
// - Más complejo
// - Requiere diseño
// - Demuestra liderazgo

// Type 3: Documentation
// - Subestimado
// - Super valioso
// - Demuestra comunicación

// Type 4: Community (discussions, reviews)
// - Subestimado
// - Demuestra generosidad
// - Build network

// Proyecto recomendado: contribuir a Next.js, TanStack Query, o Prisma
// Porque: tecnologías que ya conoces

// Cómo elegir issue
// - "good first issue" label
// - Algo que FIX en una sesión (< 4 horas)
// - Align con tu expertise

// Pull request checklist
const pr_checklist = {
  description: 'Clear explanation of changes',
  tests: 'New tests for new functionality',
  docs: 'Updated docs if needed',
  breaking_changes: 'None (or justified)',
  commit_messages: 'Clear and descriptive'
};
```

**Patrón**: Empezar con small fixes. Build credibility. Luego features.

---

## Day 3 — GitHub Presence & Public Work

**Concepto**: GitHub es tu "portfolio en vivo". Mantenerlo limpio y activo.

```typescript
// GitHub profile optimization
const github_profile = {
  readme: {
    // GitHub README.md is public facing
    title: 'Full-Stack Engineer | Healthcare AI | Open Source',
    about: 'Shipped 2 apps to production. 1 Azure cert. Healthcare domain expert.',
    featured_projects: [
      { name: 'healthcare-ai', stars: 50, description: '...' },
      { name: 'unstoppable-roadmap', stars: 20, description: '...' }
    ],
    stats: {
      repositories: 15,
      contributions_this_year: 500,
      followers: 100,
      following: 50
    }
  },
  contribution_graph: {
    // Consistent commits
    // Green squares = activity
    // Goal: 1-2 commits daily
  },
  pinned_repos: [
    // Top 6 projects
    'portfolio-website',
    'healthcare-ai',
    'unstoppable-roadmap',
    'open-source-contributions'
  ]
};

// Repository best practices
const repo_standards = {
  readme: 'Complete, with usage and screenshots',
  license: 'MIT or Apache 2.0',
  contributing: 'How to contribute',
  issues: 'Templates for bugs and features',
  ci_cd: 'GitHub Actions for tests',
  documentation: 'Comprehensive docs'
};
```

**Patrón**: GitHub = living resume. Employers look at it.

---

## Day 4 — Content & Thought Leadership

**Concepto**: Escribir sobre lo que aprendes. Build authority.

```typescript
// Blog topics (30 posts, 1/week for 6 months)
const blog_topics = [
  // Technical deep dives
  'How to Scale React Apps to 1M Users',
  'Building Offline-First Mobile Apps',
  'System Design: Twitter-like Platform',
  'HIPAA Compliance in Healthcare Apps',

  // Learning journeys
  'How I Shipped 2 Apps in 10 Weeks',
  'From Auditing to Full-Stack Engineering',
  'Azure Certifications: Study Guide',

  // Polymath angle
  'Why Healthcare Needs Better Software',
  'The Business of Scaling: Cost Analysis',
  'Building for Emerging Markets (Offline)',

  // Tutorial content
  'React Server Components: A Guide',
  'Testing React Native with Detox',
  'Prisma Migrations in Production'
];

// Blog format
// - Introduction (story/problem)
// - Technical details (code + explanation)
// - Key learnings
// - Resources

// Publishing strategy
// - Dev.to (cross-post)
// - Medium (audience)
// - LinkedIn (networking)
// - Twitter (quick tips)
```

**Patrón**: Enseña lo que sabes. Help others. Build reputation.

---

## Day 5 — Networking & Personal Brand

**Concepto**: Networking > job boards. Build real relationships.

```typescript
// Networking strategy

// Online presence (async)
const online_networking = {
  twitter: {
    // Post weekly
    // Engage with others
    // Build audience 500+
    // Goal: be helpful, not salesy
  },
  linkedin: {
    // Post learnings
    // Engage with content
    // Messaging (thoughtful, not cold)
  },
  dev_community: {
    // Comment on posts
    // Share knowledge
    // Build credibility
  }
};

// Offline + video (synchronous)
const sync_networking = {
  tech_meetups: '1/month',
  conferences: '1-2/year',
  video_interviews: '2-3/month (podcasts, YouTube)',
  speaking: 'Talk about healthcare AI'
};

// Informational interviews
// "Hi [person], I admire your work on [X].
// Would you have 30 min for coffee/zoom?
// I'd love to hear about your journey."

// Follow up: send thank you email + share something useful
```

**Patrón**: Networking is giving, not asking. Help first.

---

## Patrones descubiertos

**Pattern 1: Portfolio Effect**
One strong portfolio piece > 10 weak ones.

**Pattern 2: Compound Credibility**
Blog + GitHub + open source + certifications = exponential signal.

**Pattern 3: Generosity**
Share knowledge → build audience → jobs find you.

---

## Conexión con background

**De Auditoría**: Document everything. It's your audit trail.

**De QBP**: Metrics matter. Show ROI of your work.

**De Ventas**: Relationship building > cold pitching.

---

## Notas Adicionales

- Portfolio website = 1-2 day project. Use template.
- Open source = 1 good contribution > 10 small ones
- Blog > Twitter for depth
- GitHub = your living portfolio

---

**Última entrada**: 2026-06-18
**Próxima sesión**: 2026-06-19
