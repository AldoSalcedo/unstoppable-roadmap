# Week 13 Live Notes — Path Selection + Mock Interviews + Networking (Part 1 of 2)

*Escribe aquí las ideas, patrones, y preguntas que surgen durante prep para entrevistas y selección de carrera. No tiene que estar pulido.*

---

## Day 1 — Career Path Analysis

**Concepto**: Three paths ahead. Choose based on strengths y values.

```typescript
// Path 1: Healthcare Engineering (Senior IC)
// Leverages: auditing + healthcare domain
// Companies: Teladoc, Ro Telehealth, Biofourmis
// Salary: $120-180k + equity
// Pros: Domain expertise, impact, less politics
// Cons: Slower growth, limited companies

// Path 2: AI Engineering (Specialist IC)
// Leverages: AI integration, system design
// Companies: Anthropic, OpenAI, Google DeepMind
// Salary: $140-250k + equity
// Pros: Cutting edge, high growth, high pay
// Cons: Intense competition, burnout risk

// Path 3: Full-Stack Tech Leadership (EM track)
// Leverages: full-stack experience, communication
// Companies: Startups, scale-ups
// Salary: $120-200k + equity
// Pros: Impact at scale, leadership, flexibility
// Cons: Politics, less technical depth

// Decision framework
const decision_matrix = {
  passion: { healthcare: 8, ai: 7, leadership: 6 },
  market_opportunity: { healthcare: 7, ai: 9, leadership: 8 },
  income_potential: { healthcare: 7, ai: 9, leadership: 8 },
  work_life_balance: { healthcare: 8, ai: 5, leadership: 7 },
  domain_advantage: { healthcare: 10, ai: 7, leadership: 6 }
};

// Weighted score: Healthcare wins
// Decision: Healthcare Engineering (Senior IC)
```

**Patrón observado**: Diversified background = healthcare differentiator.

**Pregunta que surgió**: ¿Puedo cambiar luego? Respuesta: Sí, pero healthcare expert es tu niche.

---

## Day 2 — Behavioral Interview Preparation

**Concepto**: "Tell me about a time..." questions. STAR method.

```typescript
// STAR Method
interface BehavioralAnswer {
  Situation: string; // Context, challenge
  Task: string;      // Your responsibility
  Action: string;    // What you did specifically
  Result: string;    // Measurable outcome
}

// Example: "Tell me about a time you resolved conflict"
const answer: BehavioralAnswer = {
  Situation: 'At Auditoría, discovering financial discrepancy between departments.',
  Task: 'I was responsible for identifying and resolving the discrepancy.',
  Action: 'Reviewed transaction logs, identified data entry error, created corrective process, ' +
          'trained team on prevention.',
  Result: 'Resolved $50k discrepancy. Prevented future errors (0 incidents in 12 months).'
};

// Stock questions to prep:
// - "Tell me about a time you failed"
// - "How do you handle feedback?"
// - "Describe a time you overcame a technical challenge"
// - "Tell me about your greatest achievement"
// - "How do you prioritize when swamped?"
// - "Describe a time you worked in a team"

// Polymath stories:
// "My background in auditing taught me attention to detail.
//  When I caught a security vulnerability, I documented it
//  thoroughly (audit mindset), then communicated clearly to
//  the team (sales mindset)."
```

**Patrón**: STAR = structure. Interviewers love clarity.

---

## Day 3 — Technical Interview Preparation

**Concepto**: Coding challenges, system design, follow-up questions.

```typescript
// Types of technical interviews

// Type 1: Coding problems (LeetCode style)
// - Given: problem, 45 minutes
// - Goal: working solution + edge cases
// - Companies: most startups + big tech
// - Tip: Talk through approach before coding

// Type 2: System design
// - Given: vague requirement ("build Uber")
// - Goal: high-level architecture + trade-offs
// - Companies: senior roles, big tech
// - Tip: Ask clarifying questions first

// Type 3: Take-home project
// - Given: project description, deadline (1-3 days)
// - Goal: production-ready code + tests
// - Companies: many startups (better signal)
// - Tip: Quality > speed

// Preparation checklist
const prep = {
  coding: ['LeetCode 50+ problems', 'Practice whiteboarding'],
  system_design: ['Design 5+ systems', 'Mock interviews'],
  communication: ['Explain solutions clearly', 'Ask clarifying questions'],
  research: ['Company tech stack', 'Recent engineering blog posts'],
  projects: ['Rehearse portfolio projects', 'Know metrics cold']
};

// Question to ask interviewers:
// - "What does success look like in this role?"
// - "What are current engineering challenges?"
// - "How is performance measured?"
// - "What's the team structure?"
// - "What's the tech stack?"
```

**Patrón**: Practice > intelligence. Preparation wins interviews.

---

## Day 4 — Salary Negotiation Tactics

**Concepto**: First offer rara vez es final. Negocia profesionalmente.

```typescript
// Offer negotiation framework

// Before negotiation
const preparation = {
  market_research: 'Look up Levels.fyi, Glassdoor, Blind',
  target_range: '$120-180k (know your walkaway)',
  total_comp: 'Salary + bonus + equity + benefits',
  timeline: 'Other offers in pipeline?'
};

// When offer comes
const response = {
  immediate: "Thank you! I'm excited. Let me review and get back to you.",
  delay: 'Buy time (1-3 days). Dont accept immediately.',
  counter: 'Counter with range, not number. "I was expecting $140-160k"',
  leverage: 'Use other offers. "I have an offer for $150k..."',
  non_salary: 'Equity timing, remote days, learning budget'
};

// Don't say
const dont_say = [
  'I need this job',
  'My current salary is [low]',
  'I dont care about salary',
  'First number from them'
];

// Example negotiation
// Them: "We offer $110k"
// You: "Thank you! I'm excited about the role.
//       Based on my research and experience,
//       I was expecting $140-160k range. Is there room to adjust?"
// Them: "We can do $130k"
// You: "That's closer. Can we do $150k + extra equity?"
```

**Patrón**: Negotiation is standard. Don't leave money on table.

---

## Day 5 — Network Activation & Warm Intros

**Concepto**: Referrals > cold applications. Activation de network.

```typescript
// Activación de network

// Tier 1: Direct connections (help you interview)
const tier1 = [
  'Mentors',
  'Previous colleagues',
  'University network',
  'Tech community regulars'
];

// Tier 2: Warm intros (ask contact for intro)
const tier2 = [
  'LinkedIn connections with mutual friends',
  'Twitter followers who work at target companies',
  'Blog readers who commented'
];

// Warm intro template
const warm_intro = `
Hi [mutual friend],

I'm wrapping up a 12-week intensive program in full-stack + AI engineering.
I'm particularly interested in [Company] because of [specific reason: tech, mission, people].

Would you be open to introducing me to [target person] on your team?
I'd love to learn about their work on [specific project].

[Your name]
`;

// Cold outreach (LinkedIn)
const cold_outreach = `
Hi [hiring manager name],

I came across your post about [recent project/engineering challenge].
I'm particularly interested because I recently built something similar...
[1-2 sentences about relevant project]

Would you have 15 min for a quick chat?

[Your name]
`;

// Follow-up timing
// - First contact: 0 days
// - If no response: 5 days
// - Second attempt: 10 days
// - Then move on (3 strikes)
```

**Patrón**: Referrals = 70% of jobs. Activate network aggressively.

---

## Patrones descubiertos

**Pattern 1: Interview Funnel**
- 100 applications → 30 phone screens → 10 onsite → 3 offers
- Conversion rate = quality of prep

**Pattern 2: Negotiation Leverage**
- Multiple offers = negotiating power
- Time pressure = lower offers
- Move fast, have options

**Pattern 3: Network Premium**
- Referral hire = 50% higher starting salary
- Warm intro = 10x higher response rate
- Genuine relationship = better fit

---

## Conexión con background

**De Auditoría**: Due diligence on companies (culture, financials, stability).

**De QBP**: Understand economics. Equity = lottery if startup fails.

**De Ventas**: Negotiation is relationship, not confrontation.

---

## Notas Adicionales

- Healthcare path = best fit (leverage expertise + passion)
- Interview prep = systematic (STAR, system design, salary knowledge)
- Network = force multiplier (3x faster, better opportunities)

---

**Última entrada**: 2026-06-25
**Próxima sesión**: 2026-06-26
