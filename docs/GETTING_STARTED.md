# 🚀 Getting Started - Unstoppable Roadmap

Welcome! This guide will help you start your 12-week transformation.

---

## 📋 Pre-Flight Checklist

Before starting, make sure you have:

### Required Software
- [ ] **Node.js 18+** installed ([download](https://nodejs.org/))
- [ ] **pnpm 8+** installed (`npm install -g pnpm`)
- [ ] **Git** installed
- [ ] **VS Code** (or your preferred IDE)
- [ ] **Terminal** access (bash/zsh)

### Recommended VS Code Extensions
- [ ] ESLint
- [ ] Prettier
- [ ] Pretty TypeScript Errors
- [ ] Error Lens
- [ ] GitLens

### Verify Installation
```bash
node --version    # Should be >= 18.0.0
pnpm --version    # Should be >= 8.0.0
git --version     # Any recent version
```

---

## 🎯 First-Time Setup (15 minutes)

### Step 1: Get the Monorepo
```bash
# If you have a zip file
unzip unstoppable-roadmap.zip
cd unstoppable-roadmap

# If you have a git repo
git clone [repo-url]
cd unstoppable-roadmap
```

### Step 2: Install All Dependencies
```bash
# This installs dependencies for ALL weeks at once
pnpm install

# ☕ This may take 2-3 minutes
# You'll see progress for each week
```

### Step 3: Verify Setup
```bash
# Run this to check everything is working
pnpm test:all

# You should see:
# ✓ Week 1: TypeScript tests passing
# ✓ Week 2: Testing suite ready
# ... etc
```

### Step 4: Open in VS Code
```bash
code .

# Or manually:
# 1. Open VS Code
# 2. File → Open Folder
# 3. Select unstoppable-roadmap folder
```

---

## 📅 Starting Week 1

### Day 0: Preparation (Night before)

**1. Read the Week 1 Overview**
```bash
# Open in your browser or editor
open weeks/week-01-typescript/README.md
```

**2. Set Your Environment**
```bash
# Week 1 specific setup
cd weeks/week-01-typescript
pnpm install
pnpm build
```

**3. Block Your Calendar**
- **Mon-Fri:** 3-4 hours daily
- **Sat-Sun:** 4-5 hours daily
- Total: ~25-30 hours this week

**4. Prepare Your Workspace**
- Close all other projects
- Open only Week 1 in VS Code
- Have the README.md visible

**5. Create Your Notes File**
```bash
cp weeks/week-01-typescript/NOTAS-TEMPLATE.md weeks/week-01-typescript/MIS-NOTAS.md
```

---

### Day 1: Monday Morning (START HERE! 🎉)

**Morning Standup (30 min) - 8:00 AM**

1. **Read Day 1 Plan** in `weeks/week-01-typescript/README.md`
2. **Open TypeScript Playground**: https://www.typescriptlang.org/play?jsx=0
3. **Watch Intro Video** (15 min): [Link in README]

**Development Session (2.5 hours) - 8:30 AM**

```bash
# Start development server
cd weeks/week-01-typescript
pnpm dev

# In another terminal, run tests in watch mode
pnpm test:watch
```

**Tasks for Day 1:**
1. Explore `src/types/base.ts` (30 min)
2. Complete `doubleResult()` exercise (20 min)
3. Complete `mapResult()` exercise (30 min)
4. Complete `mapMaybe()` exercise (30 min)
5. Experiment in TypeScript Playground (30 min)

**Daily Review (30 min) - 11:30 AM**

1. Run full test suite: `pnpm test`
2. Check coverage: `pnpm test:coverage`
3. Update your notes in `MIS-NOTAS.md`
4. Commit your work: `git add . && git commit -m "Day 1 complete"`

---

## 🔄 Daily Routine (Every Day)

### Morning (3-4 hours)

**1. Morning Standup (30 min)**
- [ ] Read today's plan in README
- [ ] Review yesterday's notes
- [ ] Set 3 specific goals for today

**2. Development Session (2-2.5 hours)**
- [ ] Work through tasks one by one
- [ ] Don't skip exercises
- [ ] Take notes as you learn

**3. Daily Review (30 min)**
- [ ] Run all tests
- [ ] Check what you built
- [ ] Document learnings
- [ ] Commit code

---

### Evening (Optional 1-2 hours)

**If you have extra time:**
- Watch supplementary videos from RECURSOS.md
- Do extra exercises from EJERCICIOS.md
- Explore advanced topics
- Help others in community

---

## 📖 How to Use Each Week's Materials

Every week has the same structure:

### 1. **README.md** - Your Sprint Guide
```
Purpose: Day-by-day plan with exact tasks
When to read: Every morning
How to use: Follow it like a recipe
```

### 2. **CONCEPTOS.md** - Deep Explanations
```
Purpose: Detailed explanations of concepts
When to read: When you don't understand something
How to use: Reference material, not linear reading
```

### 3. **EJERCICIOS.md** - Practice Problems
```
Purpose: Additional practice beyond main project
When to do: After completing day's main tasks
How to use: Try yourself first, then check solutions
```

### 4. **RECURSOS.md** - Curated Links
```
Purpose: Videos, articles, docs organized by day
When to use: For deeper learning or when stuck
How to use: Bookmark the good ones
```

### 5. **proyecto/** - The Actual Code
```
Purpose: Hands-on project to build
When to code: During development sessions
How to use: Read, modify, experiment
```

---

## 🎯 Learning Strategies

### 1. Active Learning (Not Passive)
❌ **Don't:** Just read code and nod along
✅ **Do:** Type every example, break things, fix them

### 2. Spaced Repetition
❌ **Don't:** Cram everything in one day
✅ **Do:** Review yesterday's concepts each morning

### 3. Learning by Teaching
❌ **Don't:** Keep knowledge to yourself
✅ **Do:** Explain concepts in your notes as if teaching someone

### 4. Debugging is Learning
❌ **Don't:** Copy-paste solutions when stuck
✅ **Do:** Read error messages, use debugger, understand WHY

### 5. Rest is Progress
❌ **Don't:** Code for 8 hours straight
✅ **Do:** Take breaks every 90 minutes (Pomodoro technique)

---

## 🆘 When You Get Stuck

### Level 1: Check Documentation
1. Read CONCEPTOS.md for that week
2. Check RECURSOS.md for relevant links
3. Review examples in the code

### Level 2: Debug Systematically
1. Read the error message carefully
2. Google the exact error
3. Check Stack Overflow
4. Use console.log / debugger

### Level 3: Troubleshooting Guide
1. Check `docs/TROUBLESHOOTING.md`
2. Check `docs/FAQ.md`
3. Search GitHub Issues

### Level 4: Ask for Help
1. Post in community Discord
2. Create a GitHub Issue
3. Share your problem with specific details:
   - What you're trying to do
   - What you expected
   - What actually happened
   - Code snippet
   - Error message

---

## 📊 Tracking Your Progress

### Daily Tracking
```markdown
# In your MIS-NOTAS.md

## Day 1 - Monday
✅ Completed doubleResult exercise
✅ Completed mapResult exercise
❓ Still confused about: Generic constraints
💡 Learned: Result<T, E> is better than try-catch because...
🎯 Tomorrow: Focus on Entity<T> pattern
```

### Weekly Tracking
```bash
# At end of each week, run:
./scripts/generate-report.sh

# This creates a summary:
# - Hours spent
# - Exercises completed
# - Tests passing
# - Key learnings
```

### Overall Progress
Use the table in root README.md to track:
- [ ] Week status (Not Started / In Progress / Complete)
- [ ] Days completed (X/7)
- [ ] Tests passing (✓/✗)
- [ ] Deliverables (✓/✗)

---

## 🎓 Study Tips

### 1. **Pomodoro Technique**
```
25 min: Focused coding
5 min: Break (stretch, water, walk)
Repeat 4x
15-30 min: Longer break
```

### 2. **Active Recall**
At end of day, close your laptop and write:
- What did I learn today?
- How does it connect to what I knew before?
- Where would I use this?

### 3. **Feynman Technique**
Explain concepts in simple terms in your notes.
If you can't explain it simply, you don't understand it.

### 4. **Deliberate Practice**
Don't just code. Code with intention:
- What pattern am I learning?
- Why is this better than alternatives?
- How can I break this?

---

## 🚀 Optimization Tips

### Speed Up Your Workflow

**1. Terminal Aliases**
```bash
# Add to ~/.zshrc or ~/.bashrc
alias w1="cd ~/unstoppable-roadmap/weeks/week-01-typescript"
alias w2="cd ~/unstoppable-roadmap/weeks/week-02-testing"
# ... etc
```

**2. VS Code Snippets**
Create custom snippets for common patterns.

**3. Keyboard Shortcuts**
Learn these:
- `Cmd/Ctrl + P` - Quick file open
- `Cmd/Ctrl + Shift + P` - Command palette
- `Cmd/Ctrl + B` - Toggle sidebar
- `Cmd/Ctrl + J` - Toggle terminal

**4. Split Terminal**
Keep 2-3 terminals open:
- Terminal 1: `pnpm dev`
- Terminal 2: `pnpm test:watch`
- Terminal 3: git commands, scripts

---

## 🎯 Success Mindset

### 1. **Progress Over Perfection**
Your code doesn't need to be perfect.
It needs to work and teach you something.

### 2. **Consistency Over Intensity**
3-4 hours daily for 12 weeks > 8 hours on weekends only

### 3. **Embrace Confusion**
Feeling confused means you're learning.
Feeling comfortable means you're in your comfort zone.

### 4. **Celebrate Small Wins**
Finished a day? Great! ✅
All tests passing? Awesome! 🎉
Understood a concept? Amazing! 💡

### 5. **Trust the Process**
The roadmap is designed to work.
If you follow it, you WILL transform.

---

## 📅 Next Steps

Now that you're set up:

1. ✅ **Complete Pre-Flight Checklist** (above)
2. ✅ **Run `pnpm install` in root**
3. ✅ **Open Week 1 README**
4. ✅ **Block your calendar**
5. ✅ **Start Day 1 tomorrow morning**

---

## 🎉 You're Ready!

Everything is set up. The materials are ready.
The only thing missing is... YOU starting.

Tomorrow morning, 8 AM, Day 1, Week 1.

Let's build something amazing. 🚀

---

**Next:** Read `weeks/week-01-typescript/README.md`
