// ============================================================
// AGENTS.md - Week 08 Agent Context
// ============================================================

# Agent Context: Week 08 - React Native + AI for Healthcare

## Summary

This week transforms developers into full-stack mobile + AI engineers building production-grade healthcare applications. The focus is **clinical mobile app development** with React Native, Expo, TanStack Query for offline-first architectures, and AI API integration (OpenAI/Claude streaming).

## Core Concepts

**Architecture:**
- React Native bridge pattern (JavaScript → native iOS/Android)
- Expo managed workflow (no native compilation required)
- Offline-first with TanStack Query caching strategy
- Streaming AI APIs for perceived performance
- HIPAA-compliant data handling

**Technologies:**
- React Native 0.75+, Expo SDK 52+
- Expo Router (file-based navigation)
- TanStack Query v5 (data fetching, caching, offline)
- AsyncStorage (persistent local storage)
- OpenAI/Claude API with streaming
- EAS Build (cloud compilation)
- Sentry (error tracking)
- Detox (e2e testing)

**Healthcare Focus:**
- Offline-first mandatory (hospitals have WiFi dead zones)
- HIPAA compliance (encryption, audit logging)
- Responsible AI (fairness, transparency, accountability)
- Azure AI-102 certification concepts
- TestFlight + Play Store deployment

## Week Breakdown

### Day 1: React Native Fundamentals
- Understand bridge architecture vs React Web
- Expo setup and simulator deployment
- Core components: View, Text, TouchableOpacity, StyleSheet
- Responsive layout (Dimensions API)

### Day 2: Navigation with Expo Router
- File-based routing (like Next.js for mobile)
- Tab navigation (4-5 tabs)
- Stack navigation and dynamic routes
- Deep linking for patient-specific screens

### Day 3: Offline-First State Management
- TanStack Query cache strategies
- AsyncStorage persistence
- Mutation patterns (POST/PUT/DELETE)
- Optimistic updates
- Background sync

### Day 4: AI API Streaming
- OpenAI API with streaming responses
- Claude API streaming alternative
- Chunked streaming for mobile performance
- Error handling for API failures

### Day 5: Clinical Lab Analyzer
- Complete feature integration (all previous days)
- Medical prompt engineering
- Response parsing into structured data
- Confidence scoring
- Critical alerts highlighting

### Day 6: Healthcare Compliance & Azure AI-102
- HIPAA encryption and audit logging
- Responsible AI scorecard
- Fairness and bias detection
- Healthcare data security patterns
- Azure AI-102 key concepts

### Day 7: Deployment
- EAS Build configuration
- TestFlight/Play Store submission
- Integration testing with Detox
- Performance profiling
- Release checklist

## Key Deliverables

1. **README.md** - Week overview and learning outcomes
2. **sprint-week8.md** - 7-day detailed sprint with code examples (200+ lines)
3. **GUIA-CONCEPTOS.md** - Concept guide with architecture patterns (200+ lines)
4. **AGENTS.md** - This file (agent context)
5. **RECURSOS.md** - External resources and links

## Example Project: Clinical Lab Result Analyzer

**Application:** Hospital doctor's AI-powered lab analysis tool

**Features:**
- Doctor logs in, views patient list
- Selects patient → views lab results (cached from API)
- Pastes/uploads lab results → AI analyzes with streaming
- AI returns clinical insights in real-time
- Results cached for offline access
- Works without WiFi (offline-first)
- HIPAA compliant (audit logs, encryption)

**Tech Stack:**
- React Native + Expo Router
- TanStack Query (offline caching)
- OpenAI/Claude streaming
- AsyncStorage + SQLite
- EAS Build deployment

## Code Quality Standards

- **TypeScript:** No `any` types allowed
- **Testing:** E2E tests with Detox on all major flows
- **Performance:** Target <3s AI analysis (perceived)
- **Accessibility:** WCAG 2.1 AA compliance
- **Security:** HIPAA audit logging, data encryption
- **Documentation:** JSDoc on all public APIs

## Pre-Week Checklist

- [ ] Node.js 18+ installed
- [ ] Expo account created (free)
- [ ] iOS simulator running (macOS) OR Android emulator ready
- [ ] OpenAI or Claude API key obtained
- [ ] Git configured for commits
- [ ] Code editor (VS Code) with React Native extensions

## Expected Learning Outcomes

By end of week, you should be able to:

1. **Build:** Complete React Native app with navigation and UI
2. **Fetch:** Implement offline-first caching with TanStack Query
3. **Stream:** Integrate OpenAI/Claude with streaming responses
4. **Deploy:** Submit app to TestFlight and Google Play
5. **Comply:** Understand HIPAA requirements and implement audit logging
6. **Test:** Write e2e tests that verify clinical workflows
7. **Explain:** Discuss Azure AI-102 concepts (responsible AI, fairness)

## Mindset

**Healthcare Engineering:**
- Patient safety is paramount
- Every bug could affect clinical decisions
- Regulatory compliance is not optional
- Offline-first is mandatory (connectivity unreliable)
- Data security is non-negotiable

**Mobile Engineering:**
- Native performance matters (60 FPS)
- Perceived performance > actual performance (use streaming)
- Battery life is critical (avoid unnecessary network)
- Storage is limited (cache strategically)
- Permissions are explicit (ask user)

## Success Metrics

- App runs on iOS/Android simulators
- Offline caching working (API calls cached)
- AI streaming displays progressively
- Build succeeds on EAS (both iOS and Android)
- TestFlight/Play Store submission succeeds
- e2e tests pass for critical flows
- HIPAA compliance documented
- Performance benchmarks met (<3s AI analysis)

## Resources Provided

**Files in this directory:**
- `README.md` - Week overview
- `sprint-week8.md` - Detailed 7-day guide with code
- `GUIA-CONCEPTOS.md` - Architecture and patterns
- `AGENTS.md` - This file
- `RECURSOS.md` - External resources

**External Resources:**
- React Native docs: https://reactnative.dev/
- Expo docs: https://docs.expo.dev/
- TanStack Query: https://tanstack.com/query/latest
- OpenAI API: https://platform.openai.com/docs/
- Claude API: https://docs.anthropic.com/
- Azure AI-102: https://learn.microsoft.com/en-us/certifications/exams/ai-102/

## Support & Troubleshooting

**Common Issues:**

1. **Simulator won't run:** `npx expo run:ios` or `npx expo run:android`
2. **API key issues:** Check `.env` variables and `process.env.EXPO_PUBLIC_*`
3. **Offline sync failing:** Verify network status with `@react-native-community/hooks`
4. **Build fails on EAS:** Check `eas.json` config and `app.json` validity
5. **AI streaming stops:** Implement retry logic with exponential backoff

**When Stuck:**
1. Read the error message carefully (React Native errors are specific)
2. Check console with `npx react-native log-ios` or `log-android`
3. Use Flipper debugger for network inspection
4. Review relevant section in `sprint-week8.md`
5. Search GitHub issues for exact error message

## Next Steps After Week 8

- Week 9: Advanced AI features (fine-tuning, RAG systems)
- Week 10: Multi-doctor collaboration features
- Week 11: Analytics and reporting dashboards
- Week 12: Scale to production infrastructure

---

**¡Este es tu viaje!** This is your journey from web developer to mobile + AI engineer. The healthcare context isn't just flavoring—it's the reason we're building this way. Doctors and patients are waiting.

**Vamos.**
