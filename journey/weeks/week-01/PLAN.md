# Week 1 Plan — TypeScript Sprint: Utility Types & Generics

**Week Theme**: Foundation week. Master TypeScript utility types (Partial, Readonly, Pick, Record, DeepPartial). Build confidence.

**Target**: Complete all 7 tasks of the TypeScript sprint by end of week.

**Current Status**: 3/7 tasks done (Day 3). Task 3-3.4 completed, tests passing.

---

## Daily Breakdown

### Day 1 (2026-03-31)
- [ ] Setup: Clone repo, install dependencies
- [ ] Task 3-3.1: Partial<T> — understand shallow partial
- **Goal**: First commit, break the ice
- **Outcome**: ✅ Done

### Day 2 (2026-04-01)
- [ ] Task 3-3.2: Readonly<T> — immutability patterns
- [ ] Task 3-3.3: Pick<T, K> — tuple-based selection
- **Goal**: 2 more utility types mastered
- **Outcome**: ✅ Done (+ Deep Partial research started)

### Day 3 (2026-04-02) — TODAY
- [x] Task 3-3.4: DeepPartial<T> with recursion
- [ ] Task 3-3.5: Record<K, T> — indexed types
- **Goal**: Recursion + conditional types
- **Expected outcome**: Commit, solve recursive typing challenge

### Day 4 (2026-04-03)
- [ ] Task 3-3.6: Exclude<T, U> and Omit<T, K>
- [ ] Task 3-3.7: Extract<T, U> advanced pattern
- **Goal**: Type union manipulation mastery
- **Outcome**: TBD

### Day 5 (2026-04-04)
- [ ] Review: Rewrite 2-3 previous tasks from memory
- [ ] Deep dive: Conditional types (if-else logic in types)
- **Goal**: Solidify understanding before next sprint
- **Outcome**: TBD

### Day 6 (2026-04-05)
- [ ] Buffer/flex day: Any blockers from days 1-5
- [ ] Or: Start Week 2 preview (Stack & Queue)
- **Goal**: Sustainability check
- **Outcome**: TBD

### Day 7 (2026-04-06)
- [ ] Weekly review (WEEKLY-REVIEWS.md)
- [ ] Plan Week 2
- [ ] Celebrate wins!
- **Goal**: Closure + momentum for next week

---

## Key Concepts (Pedagogical Notes)

### Utility Types Pattern

TypeScript provides generic type helpers:
1. **Shallow transformations**: Partial<T>, Readonly<T>, Pick<T>, Record<K, T>
2. **Union operations**: Exclude<T, U>, Extract<T, U>, Omit<T, K>
3. **Advanced**: Conditional types (T extends U ? X : Y)

### Why This Matters

- Professional TypeScript code uses these constantly
- Understanding them = understanding type system deeply
- Foundation for generics, constraints, inference

### Healthcare Angle

In healthcare data modeling:
- **Partial<PatientRecord>** = form drafts (not all fields required)
- **Readonly<MedicineList>** = official drug formulary (immutable)
- **Pick<Patient, 'name' | 'dob'>** = HIPAA minimal data exposure
- **Exclude<AllFields, 'SSN'>** = security by design

---

## Deliverables

By end of Week 1:
- [ ] 7/7 tasks committed to git
- [ ] All tests passing: `npm test`
- [ ] WEEKLY-REVIEWS.md completed
- [ ] DAILY-LOG.md entries filled for days 1-7
- [ ] WINS.md updated with 3-5 wins

---

## Notes & Discovery

*Space for concepts learned this week. Updated daily.*

---

**Last updated**: 2026-04-02 (Day 3)
**Next review**: 2026-04-06 (Day 7, Sunday)
