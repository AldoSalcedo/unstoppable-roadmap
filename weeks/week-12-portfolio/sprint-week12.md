# Sprint Semana 12: Portfolio & Professional Branding

## DÍA 1: Portfolio Website Architecture & Content Strategy

### Objetivos de Aprendizaje

1. Design Next.js portfolio structure for healthcare software engineer positioning
2. Define content pillars and narrative arc
3. Set up project scaffolding with TypeScript, Tailwind CSS
4. Create information architecture for hero → projects → about → blog → contact

### Healthcare Angle

Your portfolio's core narrative: "I bridge healthcare domain expertise with enterprise software engineering." You're not a generic full-stack developer—you bring clinical credibility (biology/QBP) + compliance expertise (auditing) + technical depth (AWS/Azure).

### Architecture Plan

```
portfolio/
├── app/
│   ├── layout.tsx          # Root layout, nav, footer
│   ├── page.tsx            # Hero + featured projects
│   ├── projects/           # Case studies
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── about/page.tsx      # Your story (bio→QBP→engineering→healthcare)
│   ├── blog/
│   │   ├── page.tsx        # Blog listing
│   │   └── [slug]/page.tsx # Individual post
│   └── contact/page.tsx
├── components/
│   ├── Hero.tsx
│   ├── ProjectCard.tsx
│   ├── CertificationBadge.tsx
│   ├── BlogPostCard.tsx
│   └── CallToAction.tsx
├── content/
│   ├── projects/           # MDX project data
│   ├── posts/              # MDX blog posts
│   └── certifications/     # JSON: AWS Solutions Architect, Azure Developer, etc.
├── lib/
│   ├── mdx.ts
│   ├── projects.ts
│   └── seo.ts
└── public/
    ├── images/
    ├── projects/
    └── certifications/
```

### Content Strategy: Four Pillars

1. **Projects**: 5-7 case studies showcasing healthcare relevance
   - Telemedicine platform (React + Node.js + AWS)
   - Patient data analytics dashboard (Next.js + PostgreSQL + Azure ML)
   - Healthcare API (Node.js + TypeScript + compliance focus)
   - Open source contributions (React Native, Prisma)
   - Auditing software enhancement (from previous role)

2. **Expertise**: AWS/Azure certifications, healthcare domain knowledge, compliance (HIPAA mentions)

3. **Thought Leadership**: Blog posts on QBP→tech journey, clinical AI, TypeScript best practices

4. **Credibility**: LinkedIn recommendations, GitHub contributions, open source presence

### Next.js Setup (Day 1 Code)

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Healthcare Software Engineer | AWS & Azure Certified',
  description: 'Senior Software Engineer with biology/QBP background. Expert in healthcare software, cloud architecture, and clinical AI.',
  openGraph: {
    title: 'Healthcare Software Engineer Portfolio',
    description: 'AWS Solutions Architect & Azure Developer Certified. Building secure, scalable healthcare software.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
          <nav className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <a href="/" className="text-xl font-bold text-blue-600">
              DevName
            </a>
            <ul className="flex gap-6">
              <li><a href="/projects" className="hover:text-blue-600">Projects</a></li>
              <li><a href="/about" className="hover:text-blue-600">About</a></li>
              <li><a href="/blog" className="hover:text-blue-600">Blog</a></li>
              <li><a href="/contact" className="hover:text-blue-600">Contact</a></li>
            </ul>
          </nav>
        </header>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-slate-900 text-white mt-20">
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <p>© 2026 Healthcare Software Engineer. Open to opportunities.</p>
          </div>
        </footer>
      </body>
    </header>
  );
}
```

```typescript
// app/page.tsx - Hero Section
export default function Home() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-24">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">
          Healthcare Software Engineer
        </h1>
        <p className="text-xl text-slate-600 mb-2">
          AWS Solutions Architect & Azure Developer Certified
        </p>
        <p className="text-lg text-slate-500 mb-8">
          Building secure, scalable healthcare software with clinical credibility.
          Biology/QBP background. Auditing expertise. Enterprise-ready systems.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/projects" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            View Projects
          </a>
          <a href="/contact" className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
            Get in Touch
          </a>
        </div>
      </div>

      {/* Certifications */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold mb-6">Certifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-slate-200 p-4 rounded-lg text-center">
            <p className="font-semibold">AWS Solutions Architect</p>
            <p className="text-sm text-slate-600">Associate Level</p>
          </div>
          <div className="border border-slate-200 p-4 rounded-lg text-center">
            <p className="font-semibold">Azure Developer</p>
            <p className="text-sm text-slate-600">Associate Level</p>
          </div>
          <div className="border border-slate-200 p-4 rounded-lg text-center">
            <p className="font-semibold">AWS Security Fundamentals</p>
            <p className="text-sm text-slate-600">Specialization</p>
          </div>
        </div>
      </div>

      {/* Featured Projects */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Featured Projects</h2>
        <div className="space-y-4">
          <a href="/projects/telemedicine-platform" className="block border border-slate-200 p-6 rounded-lg hover:border-blue-600 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Telemedicine Platform</h3>
            <p className="text-slate-600 mb-2">React + Node.js + AWS. Real-time video consultations, secure patient data handling, HIPAA compliance.</p>
            <span className="text-blue-600 text-sm font-semibold">View Case Study →</span>
          </a>
        </div>
      </div>
    </section>
  );
}
```

### Day 1 Deliverables

- [ ] Next.js project initialized with TypeScript
- [ ] Layout structure coded (nav, footer, metadata)
- [ ] Hero section drafted
- [ ] Five project outlines written (for Days 2-3 content creation)
- [ ] Tailwind config refined for healthcare brand colors (blues, teals)
- [ ] SEO metadata structure in place

---

## DÍA 2: Building the Portfolio - Hero, Certifications, Case Studies

### Objetivos de Aprendizaje

1. Build polished, responsive hero section with healthcare positioning
2. Create certification showcase with verification links
3. Build 5 detailed project case studies with metrics
4. Implement smooth animations and transitions
5. Ensure mobile responsiveness

### Healthcare Angle

Every project case study must answer: "Why does healthcare matter to this problem?" Show how your domain expertise solved a real clinical challenge.

### Case Study Template (MDX/JSON)

```typescript
// content/projects/telemedicine-platform.mdx
---
title: "Telemedicine Platform for Rural Clinics"
slug: "telemedicine-platform"
featured: true
description: "Real-time video consultations connecting rural clinics with specialist doctors"
image: "/projects/telemedicine.jpg"
date: "2024-09"
role: "Full-Stack Engineer"
technologies: ["React", "Node.js", "WebRTC", "PostgreSQL", "AWS"]
impact: "Reduced wait time from 3 months to 2 weeks. Served 50+ clinics, 10k+ patients in Year 1."
healthcareContext: "Rural clinics lack specialists. This platform bridges that gap with secure, HIPAA-compliant telemedicine."
---

## Challenge

Rural clinics in Mexico struggle to provide specialized care. Patient referrals require 2-3 month waits. Doctors spend 20% of time on unnecessary in-person visits for follow-ups.

## Solution

Built a WebRTC-based telemedicine platform with:
- Real-time HD video (adaptive bitrate for low connectivity)
- End-to-end encryption for patient data
- Integration with existing EHR systems
- Offline-first design (data syncs when connection returns)

## Technical Highlights

### Frontend (React/TypeScript)
\`\`\`typescript
// components/VideoConsultation.tsx
import { useWebRTC } from '@/lib/webrtc';

export function VideoConsultation({ consultationId }: { consultationId: string }) {
  const { localStream, remoteStream, isConnected } = useWebRTC(consultationId);

  return (
    <div className="grid grid-cols-2 gap-4">
      <video ref={localStream} autoPlay muted className="bg-black rounded" />
      <video ref={remoteStream} autoPlay className="bg-black rounded" />
      <div className="col-span-2 flex gap-2">
        <button onClick={() => toggleAudio()}>Toggle Audio</button>
        <button onClick={() => endCall()}>End Consultation</button>
      </div>
    </div>
  );
}
\`\`\`

### Backend (Node.js/Express + Prisma)
\`\`\`typescript
// routes/consultations.ts
import { Router } from 'express';
import { verifyHIPAA } from '@/middleware/hipaa';

const router = Router();

router.post('/consultations', verifyHIPAA, async (req, res) => {
  const { patientId, specialistId } = req.body;

  const consultation = await prisma.consultation.create({
    data: {
      patientId,
      specialistId,
      status: 'scheduled',
      encryptedNotes: await encryptData(req.body.initialNotes),
    },
  });

  res.json(consultation);
});

router.post('/consultations/:id/end', verifyHIPAA, async (req, res) => {
  const { id } = req.params;
  const { notes, diagnosis, followUp } = req.body;

  const updated = await prisma.consultation.update({
    where: { id },
    data: {
      status: 'completed',
      encryptedNotes: await encryptData(notes),
      diagnosis,
      followUpDate: followUp,
      completedAt: new Date(),
    },
  });

  // Audit log for compliance
  await logAuditEvent('CONSULTATION_COMPLETED', { consultationId: id });

  res.json(updated);
});
\`\`\`

### AWS Architecture

- **S3**: Encrypted recording storage
- **Lambda**: Video stream processing, transcription
- **DynamoDB**: Session state (low latency)
- **RDS**: Patient data, encrypted at rest
- **CloudFront**: Global CDN for low-latency video

## Results

- 50+ clinics integrated
- 10,000+ patient consultations in Year 1
- Avg wait time: 3 months → 2 weeks
- Patient satisfaction: 4.8/5
- 99.9% platform uptime
- Zero security incidents (HIPAA compliance maintained)

## Learnings

1. **Low-bandwidth optimization**: WebRTC adaptive bitrate critical for rural connectivity
2. **Compliance first**: Encryption, audit logs, data residency requirements drove architecture
3. **Domain expertise wins**: Understanding clinic workflows shaped the feature set

---

## DÍA 3: Open Source Contribution Strategy

### Objetivos de Aprendizaje

1. Identify high-impact open source projects aligned with your expertise
2. Find good first issues in React Native, Prisma, Azure SDK
3. Make 2-3 quality contributions
4. Document your OSS work on portfolio
5. Understand PR review culture and feedback

### Healthcare Angle

Contribute to projects used in healthcare: React Native (mobile health apps), Prisma (healthcare data management), Azure SDK (compliance-focused cloud services).

### High-Impact Projects to Target

**React Native**
- Healthcare apps require native performance
- Good first issues: Documentation, type definitions, bug fixes
- Search: "good first issue" + "healthcare" or "medical"
- GitHub: facebook/react-native

**Prisma**
- Healthcare databases need robust data layers
- Good first issues: Schema improvements, docs
- Search: "help wanted" + "docs" or "type-safety"
- GitHub: prisma/prisma

**Azure SDK for Python/JavaScript**
- Healthcare deployments run on Azure
- Good first issues: Examples, error handling, logging
- GitHub: Azure-Samples, Azure/azure-sdk-js

### Finding Good First Issues

```bash
# Search GitHub
gh search issues --repo=facebook/react-native --label="good first issue" --state=open

# Or use GitHub web search:
# https://github.com/facebook/react-native/issues?q=label%3A%22good+first+issue%22+is%3Aopen

# For Prisma:
# https://github.com/prisma/prisma/issues?q=label%3A%22good+first+issue%22
```

### PR Strategy Template

```markdown
## Contribution: [Issue Title]

**Problem**: [What's the issue?]

**Solution**: [What did you change?]

**Type of Change**:
- [ ] Bug fix
- [ ] Documentation
- [ ] Feature
- [ ] Type definitions

**Testing**:
- [ ] Added/updated tests
- [ ] Manual testing on [platform]

**Checklist**:
- [ ] Follows project style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex logic
- [ ] Updated docs if needed

**Healthcare Context** (if relevant):
This change impacts healthcare workflows by [explain relevance to your domain].
```

### Day 3 Action Plan

- [ ] Fork 3 projects (React Native, Prisma, Azure SDK)
- [ ] Identify 2-3 "good first issue" candidates
- [ ] Understand codebase (run locally, read issue history)
- [ ] Make first contribution (likely docs or type fix)
- [ ] Submit PR with professional description
- [ ] Engage with reviewer feedback
- [ ] Document OSS work on portfolio (link to merged PRs)

---

## DÍA 4: LinkedIn Optimization

### Objetivos de Aprendizaje

1. Craft healthcare-focused headline
2. Write compelling about section
3. Add media (certificates, portfolio link)
4. Showcase projects with metrics
5. Optimize for recruiter search

### LinkedIn Headline Strategy

**Current**: Senior Software Engineer | AWS Certified

**Better**: Healthcare Software Engineer | AWS Solutions Architect | Azure Developer | Clinical AI

This tells recruiters:
- Your domain: healthcare
- Your level: senior
- Your proof: specific certifications
- Your edge: clinical AI knowledge

### LinkedIn About Section Template

```
Senior Software Engineer with unique healthcare domain expertise.

Background:
- Biology/QBP training → deep clinical credibility
- Auditing experience → compliance & data integrity focus
- AWS Solutions Architect + Azure Developer Certified → enterprise-ready
- 12+ years in tech (5 in healthcare systems)

What I Build:
Secure, scalable healthcare software. Think telemedicine platforms, patient data analytics, clinical decision support systems. Systems that matter to patient outcomes.

Why Healthcare:
My biology background isn't a detour—it's my superpower. I understand the domain problems. HIPAA, HL7, EHR integrations, clinical workflows. This matters.

I'm open to opportunities: Senior Backend Engineer, Solutions Architect, Healthcare Tech Lead roles.

Languages: Spanish/English

GitHub: [link]
Portfolio: [link]
```

### LinkedIn Content Strategy

**Posts to make (1 per week going forward)**:
1. "Why Your Healthcare App Needs a Biologist Engineer" (thought leadership)
2. "From QBP to Software Architecture" (career narrative)
3. "3 Compliance Mistakes I See in Healthcare Startups" (expertise signal)
4. "My Journey with AWS Certification" (social proof)

**Example Post**:
```
Just passed AWS Solutions Architect exam. Here's what surprised me:

Most healthcare startups design for scale but miss compliance from day one. They add HIPAA later—expensive mistake.

Architecture should enforce security. Not after.

If you're building healthcare software, ask yourself:
- Where is patient data encrypted (at rest + in transit)?
- Who audits access logs?
- Can you delete patient data on request (right to be forgotten)?
- Is your infrastructure in the right region (data residency)?

These aren't nice-to-haves. They're table stakes.

#healthcare #aws #softwaredevelopment
```

### Recruiter Optimization

- **Keywords in headline**: Healthcare, AWS, Azure, Senior, Certified
- **Keywords in about**: TypeScript, React, Node.js, PostgreSQL, Telemedicine, EHR, HIPAA
- **Experience section**: Link each role to portfolio projects
- **Media**: Screenshot of certifications, GitHub profile, portfolio URL

---

## DÍA 5: Resume Crafting - Impact Metrics & Healthcare Highlights

### Objetivos de Aprendizaje

1. Write resume with quantified impact (not just responsibilities)
2. Highlight healthcare domain expertise
3. Feature certifications prominently
4. Use ATS-friendly formatting
5. Create downloadable PDF on portfolio

### Resume Structure for Healthcare Engineers

```
[NAME] | Healthcare Software Engineer | AWS Solutions Architect | Azure Developer
[Email] | [Phone] | [LinkedIn] | [Portfolio] | [GitHub]

HEADLINE
Senior Software Engineer with biology/QBP background designing secure,
scalable healthcare systems. 5+ years healthcare tech. AWS Solutions
Architect & Azure Developer Certified. Expertise: HIPAA compliance, EHR
integration, clinical data management, telemedicine platforms.

TECHNICAL SKILLS
Languages: TypeScript, Python, JavaScript, SQL
Frontend: React, Next.js, React Native
Backend: Node.js, Express, Django
Databases: PostgreSQL, MongoDB, DynamoDB
Cloud: AWS (S3, Lambda, RDS, DynamoDB, CloudFront), Azure (App Service, SQL DB, Cognitive Services)
Healthcare: HIPAA compliance, HL7 standards, EHR integration, telemedicine architecture
Other: Docker, Kubernetes, CI/CD, Git, Agile

PROFESSIONAL EXPERIENCE

Senior Software Engineer | HealthcoreTech (Jan 2023 - Present)
- Led architecture redesign of patient data platform; reduced query latency 60% (2.5s → 1s) serving 100k+ active patients
- Implemented end-to-end encryption for PHI with AES-256; passed HIPAA audit with zero findings
- Mentored 3 junior engineers on healthcare compliance and secure coding practices
- Designed telemedicine feature integrated with 50+ clinic partners; achieved 4.8/5 patient satisfaction
- Built real-time analytics dashboard (React + Node.js + PostgreSQL) tracking 10k+ daily consultations

Healthcare Software Engineer | MediSync (Mar 2021 - Dec 2022)
- Developed HL7 integration layer connecting legacy hospital systems to modern EHR; reduced manual data entry 80%
- Architected serverless backend (Node.js/Lambda) handling 5M+ monthly patient data queries
- Led security audit of data pipeline; identified and fixed 12 compliance vulnerabilities
- Reduced infrastructure costs 40% through AWS optimization (RDS reserved instances, DynamoDB on-demand scaling)

Software Engineer | AuditTech (May 2019 - Feb 2021)
- Built compliance monitoring system for financial auditing; used in 20+ enterprise clients
- Created real-time alerting system (Python/PostgreSQL/Redis) reducing audit cycle time 35%
- Implemented automated data validation reducing manual review time 60%

CERTIFICATIONS
- AWS Solutions Architect - Associate (2024)
- AWS Security Fundamentals Specialization (2024)
- Azure Developer Associate (2024)
- Bachelor's Degree, Biology with Quantitative Biology specialization (2015)

OPEN SOURCE
- Contributed type definitions to React Native (1 merged PR)
- Active contributor to Prisma schema migrations (3 merged PRs)
- Contributor to Azure SDK for JavaScript (documentation improvements)

LANGUAGES
- English (Fluent)
- Spanish (Native)
```

### Before/After Resume Bullets

**BEFORE** (vague, responsibility-focused):
- Worked on telemedicine platform
- Built APIs for patient data
- Fixed security issues
- Improved database performance

**AFTER** (quantified, impact-focused):
- Architected telemedicine platform serving 50+ clinics, 10k+ patients; achieved 99.9% uptime
- Designed REST API (Node.js + Express) handling 5M+ monthly patient queries with sub-100ms latency
- Conducted security audit; identified 12 HIPAA compliance violations and led remediation (zero findings in follow-up)
- Optimized PostgreSQL queries and added strategic indexes; reduced patient data retrieval latency 60% (2.5s → 1s)

### Resume as PDF on Portfolio

```typescript
// app/resume/page.tsx
export default function ResumePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Resume</h1>
        <a
          href="/resume.pdf"
          download
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Download PDF
        </a>
      </div>
      {/* Embedded resume content or PDF viewer */}
    </div>
  );
}
```

---

## DÍA 6: Technical Blog Posts (3 Posts)

### Post 1: "From Biology/QBP to Healthcare Software Engineer"

**Goal**: Personal narrative showing your unique transition and why it matters

**Angle**: Your biology background isn't a side quest—it's your core competency in healthcare tech

**Outline**:
- How biology training shaped your thinking about systems
- Why "domain expertise" matters in healthcare tech
- Specific example: How understanding clinical workflows solved a real problem
- Lessons for other domain experts transitioning to tech

**Length**: 1,500-2,000 words

### Post 2: "Building HIPAA-Compliant Healthcare Systems: Lessons from 5 Years in Production"

**Goal**: Position yourself as healthcare compliance expert

**Angle**: HIPAA isn't a buzzword—it's architecture. Show how you think about it.

**Outline**:
- Why compliance must be baked into architecture (not bolted on)
- 5 compliance mistakes you've seen (and fixed)
- Encryption strategy (at rest + in transit)
- Audit logging (proving compliance)
- Data residency and sovereignty
- Real-world example from your work

**Length**: 2,000-2,500 words

### Post 3: "TypeScript for Healthcare: Type Safety Saves Lives (No, Really)"

**Goal**: Technical expertise signal + healthcare angle

**Angle**: Strong typing matters when bugs can impact patient safety

**Outline**:
- Type safety in critical systems
- Example: Building a medication dosing API where types prevent calculation errors
- Advanced TypeScript patterns for healthcare (discriminated unions, branded types)
- Real code examples
- Performance considerations

**Length**: 1,500-2,000 words

### Blog Setup (MDX)

```typescript
// content/posts/qbp-to-engineer.mdx
---
title: "From Biology/QBP to Healthcare Software Engineer: My Journey"
date: "2025-01-15"
slug: "qbp-to-healthcare-engineer"
excerpt: "How my biology background became my superpower in healthcare tech"
---

# From Biology/QBP to Healthcare Software Engineer: My Journey

I remember the moment I realized my biology degree wasn't a detour—it was a feature.

I was three months into my first healthcare engineering role, debugging a telemedicine platform. A clinician asked why patients couldn't see real-time vital signs alongside video. The feature seemed simple. Why did the team miss it?

Because they didn't understand *clinical workflows*.

I grew up thinking biology was the foundation. You learn cells, systems, human physiology. Then you specialize: biochemistry, microbiology, public health.

Quantitative Biology (QBP)? That's where I found my real passion. Data-driven thinking about biological systems. Statistical models. Computational approaches to understanding disease.

Then life happened. I needed flexibility. Better pay. A job that scaled.

So I learned to code.

## The Detour That Wasn't

For years, I treated my biology background like a private shame. In tech interviews, I downplayed it. "Yeah, I did QBP, but I've been engineering for 5 years." As if learning code meant biology was irrelevant.

I was wrong.

[Blog post continues... full narrative + technical examples]
```

### Day 6 Deliverables

- [ ] Post 1: "From Biology/QBP to Healthcare Engineer" (published)
- [ ] Post 2: "HIPAA-Compliant Systems" (published)
- [ ] Post 3: "TypeScript for Healthcare" (published)
- [ ] All 3 posts linked on portfolio blog section
- [ ] SEO metadata added (meta descriptions, keywords)
- [ ] Share on LinkedIn (one per day, Days 6-8)

---

## DÍA 7: SEO, Analytics, Final Review & Launch

### Objetivos de Aprendizaje

1. Implement basic SEO (metadata, Open Graph, structured data)
2. Set up Google Analytics and Search Console
3. Do final accessibility audit
4. Deploy to production
5. Create launch plan

### SEO Checklist

```typescript
// lib/seo.ts
export const generateMetadata = (
  title: string,
  description: string,
  image?: string,
  url?: string
) => ({
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    url,
    images: image ? [{ url: image }] : [],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: image ? [image] : [],
  },
});

// Structured data for projects
export const projectSchema = (project: Project) => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: project.title,
  description: project.description,
  image: project.image,
  author: {
    '@type': 'Person',
    name: 'Your Name',
  },
  datePublished: project.date,
});
```

### Google Analytics Setup

```typescript
// app/layout.tsx - Add Google Analytics
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Accessibility Audit (WCAG 2.1 AA)

- [ ] Color contrast ratio 4.5:1 for text (check with WebAIM)
- [ ] All images have alt text
- [ ] Keyboard navigation works (Tab through site)
- [ ] Form labels associated with inputs
- [ ] Links have descriptive text (not "click here")
- [ ] Heading hierarchy correct (H1 → H2 → H3)
- [ ] Run through axe DevTools or Lighthouse

### Performance Optimization

```typescript
// Optimize images
// Use next/image for automatic optimization
import Image from 'next/image';

export function ProjectCard({ project }) {
  return (
    <div>
      <Image
        src={project.image}
        alt={project.title}
        width={500}
        height={300}
        priority={project.featured}
      />
    </div>
  );
}

// Set up Vercel deployment with automatic optimizations
```

### Launch Checklist

- [ ] Portfolio deployed to custom domain (yourname.dev or yourname.com)
- [ ] All links working (test internally)
- [ ] Forms functional (contact form submits)
- [ ] Mobile responsive (test on iPhone, Android)
- [ ] PDF resume downloadable
- [ ] GitHub links working
- [ ] LinkedIn profile linked and updated
- [ ] Google Search Console verified (submit sitemap)
- [ ] Analytics tracking active
- [ ] Blog posts indexed by Google (may take 24-48h)

### Launch Announcement Plan

**Day 7 Evening/Day 8**:
1. Tweet: "Launched my portfolio. Built with Next.js. Focused on healthcare software engineering. DM for inquiries."
2. LinkedIn: Long-form post about week of portfolio + philosophy
3. Email to 20 contacts (past colleagues, mentors): "I've been building healthcare software. Here's my work."
4. GitHub README mention: "Portfolio built with [tech]"

### Success Metrics (End of Week 12)

- [ ] Portfolio live and indexed by Google
- [ ] 2+ open source PRs submitted (ideally 1 merged)
- [ ] LinkedIn profile updated with 200+ profile views in first week
- [ ] 3 blog posts published with 50+ views total
- [ ] Resume downloadable from portfolio
- [ ] Analytics tracking visitors (aim for 50+ visits in first week)
- [ ] No broken links or accessibility issues

---

## Week 12 Summary

You've built proof. Not hype.

Your portfolio doesn't say "I'm a great engineer." It shows:
- Real projects with healthcare relevance
- Quantified impact (metrics matter)
- Open source contributions (community participation)
- Thought leadership (blog posts)
- Professional presentation (LinkedIn, resume)

This is what a 100k+ position looks like: domain expertise + technical depth + market visibility.

Next week: Job search strategy, interview prep, salary negotiation.
