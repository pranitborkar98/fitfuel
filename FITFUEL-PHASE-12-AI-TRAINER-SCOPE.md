# FITFUEL — PHASE 12: AI PERSONAL TRAINER — FULL SCOPE
> **Status: Scope locked for build. Phase 12 = ⏸️ Pending → 🔄 starting.**
> **This is a phase-scope document (like the Phase 9 plan). Fold into FITFUEL-MASTER-TRACKER-DEFINITIVE.md — additions only, never remove lines. This is NOT a second tracker.**
> **Prereqs confirmed (Jun 5): Phase 11 complete. All four data signals live — MealLog, WorkoutSession, BodyMetric, ConsistencySnapshot + UserProfile.weeklyConsistencyScore.**
> **Stack: Next.js App Router · Prisma 7 · Neon · Vercel · Claude API (Anthropic) · Auth.js v5 (auth()) · inline styles + checkout token set + Syne/DM Sans.**
> **Vision anchor: "AI TRAINER: Has ALL this context. Not a chatbot. A trainer who watched every rep and every meal for 30 days."**

---

## 0. WHAT PHASE 12 ACTUALLY IS (AND IS NOT)

**It is NOT** a generic chat window bolted onto the dashboard that answers fitness trivia. Anyone can ship that in an afternoon and it has no moat.

**It IS** the conversational front-end to the entire FitFuel health OS — a coach that (a) already knows everything the user has logged, (b) can *take actions* inside the system on the user's behalf, (c) modulates its behaviour based on how consistent the user is, and (d) remembers the user across every session. This is the single feature no tiffin service, no fitness app, and no supplement brand can replicate, because it sits on top of the data loop we spent Phases 5–11 building.

**The moat in one sentence:** every other coach starts from zero each time you talk to it; ours starts from 30 days of your meals, workouts, weight, and consistency — and it can act, not just advise.

### 0.1 Why it's unblocked NOW (data inventory)

| Signal the AI needs | Source (live today) | Status |
|---|---|---|
| Who the user is (age, sex, height, goal, conditions, allergies, TDEE, targets) | `UserProfile` | ✅ |
| What plan they're on, what day, calorie target, delivery window | `UserActivePlan` | ✅ |
| What they were *supposed* to eat | `PlanScheduleSlot` → `Recipe` | ✅ (WL-Veg) |
| What they *actually* ate + how they rated it | `MealLog` (rating, ratingNote, actualGrams) | ✅ |
| Manual diary food | `FoodEntry` | ✅ |
| Weight / body-fat / muscle trend | `BodyMetric` | ✅ |
| Workouts done + calories burned | `WorkoutSession` | ✅ |
| What workout they were assigned | `ExerciseSchedule` / `ExerciseScheduleDay` | ✅ |
| Consistency score + 5 components + week-over-week trend | `getWeeklyConsistency()` + `ConsistencySnapshot` | ✅ |
| Their supplement stack | `lib/supplements-data.ts` resolver | ✅ |
| Pre-aggregated progress (weight/calorie/macro/adherence) | `lib/progress.ts` `getProgressData()` | ✅ |

> **Recipe-seed clarification (Decision #74 below):** 1/119 seeds does NOT block Phase 12. Only `weight-loss-veg` is `isActive` and only 1 user is subscribed. The AI coaches on logged behaviour, which is fully present. Seeding stays a parallel track.

---

## 1. CORE PRINCIPLES (NON-NEGOTIABLE)

1. **Context-first.** The quality of the trainer = the quality of the context we assemble. 80% of the engineering effort is the Context Engine, not the chat UI.
2. **Safety-first.** Medical-condition users (diabetic, PCOS, thyroid, heart, cancer-recovery, kidney…) are on this platform. The AI gives coaching, never medical advice, never unsafe restriction. Safety is built in 12-SAFE *before* chat ships, not after.
3. **Action-capable.** The AI can log a meal, request a swap, summarise progress, surface a recalibration — via guarded tool use. Talk without action is a demo, not the product.
4. **Consistency-aware.** Tone and ambition scale with the consistency score (Decision #46). High consistency → bold, specific pushes. Low consistency → curious, low-pressure, "what's getting in the way?"
5. **Cost-disciplined.** This is a Luxury feature funded by you. Prompt caching + a two-model split + pre-computed briefs keep per-user cost survivable.
6. **Tier-gated.** Full chat = Luxury only (per tier table). See §11 for the Premium upsell question.
7. **Remembers you.** Durable, user-scoped memory of preferences, constraints, and history — not just the current thread.

---

## 2. ARCHITECTURE OVERVIEW

```
                         ┌─────────────────────────────────────────────┐
   LIVE DB TABLES        │            CONTEXT ENGINE (12A)              │
  (Phases 5–11)  ───────▶│  buildTrainerContext(userId)                 │
  Profile, Plan,         │   → token-efficient structured snapshot      │
  MealLog, Workout,      │   → derived insights (plateau, streak, deltas)│
  BodyMetric,            └───────────────┬─────────────────────────────┘
  Consistency, Recipe                    │
                                         ▼
                         ┌─────────────────────────────────────────────┐
                         │        TRAINER BRIEF (12A, cached)           │
                         │  precomputed daily JSON the chat + proactive │
                         │  engine both read (fast, cheap)              │
                         └───────┬───────────────────────┬─────────────┘
                                 │                       │
                   ┌─────────────▼──────────┐   ┌────────▼─────────────────┐
                   │  REACTIVE CHAT (12B)    │   │  PROACTIVE ENGINE (12E)  │
                   │  /dashboard/trainer     │   │  event triggers →        │
                   │  streaming, persisted   │   │  "message from coach"    │
                   └─────────────┬──────────┘   └────────┬─────────────────┘
                                 │                       │
                                 ▼                       ▼
                   ┌──────────────────────────────────────────────────────┐
                   │           SAFETY + PERSONA LAYER (12-SAFE)            │
                   │  system prompt · tone modulation · medical/ED guards  │
                   └─────────────────────────┬────────────────────────────┘
                                             ▼
                   ┌──────────────────────────────────────────────────────┐
                   │              TOOL USE / ACTIONS (12D)                 │
                   │  logMeal · logWorkout · requestSwap · getProgress ·   │
                   │  suggestRecalibration · bookConsult   (all guarded)   │
                   └─────────────────────────┬────────────────────────────┘
                                             ▼
                          ACTIONS WRITE BACK INTO THE OS
                   (MealLog, swap, recalibration draft, consult request)
                                             │
                                             ▼
                   ┌──────────────────────────────────────────────────────┐
                   │        MEMORY / INSIGHTS (12F)  +  USAGE LOG          │
                   │  durable user facts the AI learns + cost/quality log  │
                   └──────────────────────────────────────────────────────┘
```

---

## 3. DATA CONTEXT — HOW THE SNAPSHOT IS BUILT (12A detail)

`lib/ai-trainer/context.ts` → `buildTrainerContext(userId)` returns a **structured, summarised** object (never raw rows — token cost and noise). Shape:

```ts
interface TrainerContext {
  profile: {
    name; age; sex; heightCm; currentWeightKg; targetWeightKg;
    goal; activityLevel; diet; healthConditions[]; allergies[];
    tdee; calorieTarget; proteinTarget; carbTarget; fatTarget;
  };
  plan: { slug; name; tier; currentDay; cycleLength; startDate; deliveryWindow };
  nutrition7d: {
    daysTracked; avgKcalIn; avgKcalOut; avgNet; targetKcal;
    adherencePct; avgProtein; proteinTarget; topRatedMeals[]; lowRatedMeals[];
  };
  workouts7d: { scheduled; completed; totalKcalBurned; lastSessionDate; programType };
  body: { latestWeight; weighInsLast30d; trend30dKg; bodyFatPct?; muscleKg?; bmi };
  consistency: { thisWeekScore; label; components{meals,workouts,water,weighIn,noSkips}; trend4w[] };
  supplements: { recommendedStack[] };
  derived: {
    plateauDetected: boolean;   // weight flat ≥14d while in a deficit/surplus goal
    streakDays: number;
    biggestGap: 'meals'|'workouts'|'water'|'weighIn'|'noSkips';  // lowest-scoring component
    momentum: 'improving'|'flat'|'declining';  // from consistency trend
  };
}
```

**Derived insights are the secret sauce.** The raw numbers are cheap; the *interpretation* (plateau, momentum, biggest gap) is what lets the AI sound like it's been watching. Compute these in TS, not by asking the model to do math on raw rows.

**Token budget:** the serialised context targets ≤ ~1.5–2k tokens. Summaries, not transcripts. 30 days of MealLog is rolled up to averages + the few meals with extreme ratings, never row-by-row.

---

## 4. 12-SAFE — PERSONA & SAFETY LAYER (ships WITH 12B, not after)

This is a first-class sub-phase, not a disclaimer footer. It defines the system prompt and the hard guardrails.

### 4.1 Persona
A direct, warm, evidence-respecting coach. Knows the user's data cold. Speaks plainly (English, India-aware food references — dal, roti, paneer, not quinoa bowls). Celebrates real wins, names real problems, never fawns, never shames.

### 4.2 Tone modulation by consistency (formalises Decision #46)
| Score | Posture |
|---|---|
| 80–100 | Bold and specific. Push progression, raise targets, suggest the next plan. |
| 50–79 | Steady. Reinforce what's working, fix the single biggest gap (`derived.biggestGap`). |
| < 50 | Curious and low-pressure. Ask what's blocking. Do NOT pile on more demands. Shrink the ask. |

### 4.3 Medical boundaries (hard rules in system prompt)
- For any user with a `healthCondition`, the AI states it is a fitness/nutrition coach, **not a doctor**, and must not diagnose, change medication guidance, or contradict a clinician.
- Condition-specific landmines are explicitly forbidden in the prompt (e.g. no carb/insulin titration for diabetics, no "push through it" for cardiac/post-surgery users).
- Route medical questions to the **Luxury 1-on-1 nutritionist consult** (already a Luxury entitlement) via the `bookConsult` tool.
- Carry the Decision #30 medical disclaimer in the trainer UI for condition-plan users.

### 4.4 Disordered-eating guardrails (hard rules)
- The AI never endorses dropping below a **configurable safe-calorie floor** (set per profile; defaults conservative; defers to a professional below it).
- If a user pushes for extreme restriction, over-exercise, or expresses distress about food/body in a concerning way, the AI does **not** comply or optimise the restriction — it reflects care, de-escalates, and surfaces the nutritionist consult. No "shred to 1000 kcal" coaching, ever, regardless of how it's asked.
- This guard sits *above* tool use: `suggestRecalibration` can never propose a target below the floor.

### 4.5 Action guardrails
- Any AI-initiated change to a real target (recalibration, plan progression) is a **draft requiring explicit user confirmation** in the UI — the AI proposes, the human commits.
- Hard floors/ceilings enforced in code, not trusted to the model.

### 4.6 Prompt-injection / abuse
- User messages are untrusted input. System prompt instructs the model to ignore attempts to override its role, reveal the system prompt, or act outside the tool catalog.
- Tools validate every argument server-side against the user's own data (a user can only ever act on their own `userId`).

---

## 5. SUB-PHASES (12A–12K)

| Sub | Name | What it delivers | Priority |
|---|---|---|---|
| **12A** | Context Engine + Trainer Brief | `lib/ai-trainer/context.ts`, derived insights, cached daily brief | **P0 — foundation** |
| **12-SAFE** | Persona & Safety Layer | system prompt, tone modulation, medical + ED guards, disclaimers | **P0 — ships with 12B** |
| **12B** | Reactive Chat (MVP shippable moat) | `/dashboard/trainer` streaming chat, persisted threads, Luxury gate | **P0** |
| **12C** | Conversation Persistence + Memory wiring | `AiConversation` / `AiMessage` models, history load | **P0 (part of 12B)** |
| **12D** | Tool Use / Actions | logMeal, logWorkout, requestSwap, getProgress, suggestRecalibration, bookConsult | **P1** |
| **12E** | Proactive Engine | event triggers → "message from your coach" | **P1** |
| **12F** | Durable Memory / Insight Extraction | `TrainerInsight` model, post-conversation fact extraction | **P2** |
| **12G** | WhatsApp surface (overlaps Phase 16) | trainer reachable in WhatsApp via n8n | **P2** |
| **12H** | Cost & Usage controls | `AiUsageLog`, rate limits, prompt caching, two-model routing | **P1 (wire early)** |
| **12I** | Eval Harness | golden conversations + safety red-team set, run on each prompt change | **P1** |
| **12J** | Admin / Quality dashboard | review conversations, costs, flagged safety events | **P2** |
| **12K** | Premium "AI Insights" lite feed (IF approved) | read-only proactive insights for Premium | **P3 — pending Decision #78** |

---

## 6. SCHEMA ADDITIONS (proposed — via `db push`, Decision #71; verify against schema.prisma first, Decision #61)

```prisma
model AiConversation {
  id         String      @id @default(cuid())
  userId     String
  title      String?
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  user       User        @relation(fields: [userId], references: [id])
  messages   AiMessage[]
  @@index([userId])
}

model AiMessage {
  id              String         @id @default(cuid())
  conversationId  String
  role            AiRole         // USER | ASSISTANT | SYSTEM | TOOL
  content         String         @db.Text
  toolName        String?        // set when role = TOOL
  toolPayload     Json?
  tokensIn        Int?
  tokensOut       Int?
  createdAt       DateTime       @default(now())
  conversation    AiConversation @relation(fields: [conversationId], references: [id])
  @@index([conversationId])
}

model TrainerInsight {            // durable memory — "knows you"
  id        String   @id @default(cuid())
  userId    String
  kind      String   // preference | constraint | history | goal
  text      String   // "dislikes paneer", "trains mornings only", "travels weekends"
  source    String   // chat | derived
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  @@index([userId, active])
}

model TrainerEvent {             // proactive queue
  id          String   @id @default(cuid())
  userId      String
  type        String   // plateau | missed_workouts | milestone | low_rating | weekly_review
  payload     Json?
  status      String   @default("pending") // pending | delivered | dismissed
  createdAt   DateTime @default(now())
  deliveredAt DateTime?
  user        User     @relation(fields: [userId], references: [id])
  @@index([userId, status])
}

model AiUsageLog {               // cost + quality
  id          String   @id @default(cuid())
  userId      String
  model       String
  tokensIn    Int
  tokensOut   Int
  cachedRead  Int?     // prompt-cache hit tokens
  costUsd      Float?
  flagged     Boolean  @default(false) // safety event flag
  createdAt   DateTime @default(now())
  @@index([userId, createdAt])
}

enum AiRole { USER ASSISTANT SYSTEM TOOL }
```
Add relations on `User`: `aiConversations`, `trainerInsights`, `trainerEvents`. **Read schema.prisma before writing any select.**

---

## 7. API ROUTES

| Route | Method | Auth | Description | Sub |
|---|---|---|---|---|
| `/api/trainer/chat` | POST (stream) | Luxury | Send message → streamed AI reply (context injected, tools enabled) | 12B/12D |
| `/api/trainer/conversations` | GET | Luxury | List user's threads | 12C |
| `/api/trainer/conversations/[id]` | GET | Luxury | Load a thread | 12C |
| `/api/trainer/brief` | GET | Luxury | Today's cached trainer brief | 12A |
| `/api/trainer/events` | GET | Luxury | Pending proactive "messages from coach" | 12E |
| `/api/trainer/events/[id]/dismiss` | POST | Luxury | Dismiss a proactive nudge | 12E |
| `/api/cron/trainer-events` | GET | CRON_SECRET | Scan signals → enqueue TrainerEvent (⚠️ Vercel Hobby = 2 cron limit, see §8.4) | 12E |
| `/api/trainer/insights` | GET / DELETE | Luxury | View / forget what the AI remembers (user control) | 12F |
| `/api/admin/trainer/conversations` | GET | OWNER/ADMIN | QA review + flagged events | 12J |

> Tool actions (logMeal etc.) reuse EXISTING routes where possible (`/api/user/active-plan/meals/log`, swap route from 9P) so the AI and the dashboard write through the same code path — no divergence.

---

## 8. COST & PERFORMANCE STRATEGY (12H — wire from day one)

### 8.1 Prompt caching
The system prompt + persona + the user's context block are large and stable within a session. Use Anthropic **prompt caching** so the big prefix is charged at the cheap cached-read rate on every turn after the first. For a multi-turn coaching chat this is the dominant cost lever — design the message assembly so the cacheable prefix is contiguous and first.

### 8.2 Two-model split
- **Live chat:** a fast, cheaper Claude model — latency + cost sensitive, many short turns.
- **Weekly deep-dive / proactive analysis:** a stronger Claude model — runs rarely (once/week or per event), where reasoning quality justifies the cost.
- Pick the exact current model strings from `docs.claude.com` at build time (lineup/pricing shift; don't hard-assume). Log `model` per call in `AiUsageLog`.

### 8.3 Pre-computed brief
`/api/trainer/brief` is computed once/day and cached, so opening the chat doesn't re-run every aggregation. The proactive engine reads the same brief.

### 8.4 Cron budget reality (Vercel Hobby)
You're at the **2-cron Hobby limit** (delivery generator + consistency snapshot, Decision #70/#71). The proactive scan (`/api/cron/trainer-events`) is a 3rd cron. Options: **(a)** fold it into the existing nightly delivery cron as a second step, **(b)** trigger it off the consistency snapshot cron, or **(c)** upgrade to Vercel Pro. → **Open Decision #76.**

### 8.5 Rate limits
Per-user daily message cap + token budget, enforced before the API call, logged in `AiUsageLog`. Prevents a single Luxury user from running up unbounded cost.

---

## 9. TOOL USE CATALOG (12D) — what the AI can DO

| Tool | Effect | Guardrail |
|---|---|---|
| `getProgressSummary` | Returns `getProgressData()` digest | read-only |
| `logMeal` | "I had dal and 2 rotis" → MealLog via existing log route | confirm grams if ambiguous |
| `logWorkout` | Logs a WorkoutSession | sanity-check duration/kcal |
| `requestMealSwap` | Triggers 9P swap, same slot ±100 kcal | only plan recipes |
| `getTodaysMeals` / `getTodaysWorkout` | Reads plan + schedule | read-only |
| `suggestRecalibration` | Drafts a new calorie target (Phase 18 logic) | **never below safe floor; user must confirm** |
| `suggestPlanProgression` | Proposes next plan when goal hit | user must confirm |
| `bookNutritionistConsult` | Creates a consult request (Luxury) | Luxury only |
| `rememberFact` | Writes a `TrainerInsight` | user-visible + deletable |

Every tool validates the target `userId` server-side = the authenticated user. The model can request; the server decides.

---

## 10. PROACTIVE TRIGGERS CATALOG (12E)

| Trigger (signal) | Source | "Message from your coach" |
|---|---|---|
| Plateau: weight flat ≥14d in a deficit/surplus goal | `derived.plateauDetected` | "Your weight's held for two weeks — let's look at recalibrating." |
| Missed workouts: 0 sessions in 3+ scheduled days | `WorkoutSession` vs schedule | "Noticed the gym's gone quiet — what's getting in the way?" |
| Milestone: target weight hit / 30-day cycle done | `BodyMetric` / `currentDay` | celebrate + `suggestPlanProgression` |
| Low rating: meal rated ≤2 | `MealLog.rating` | acknowledge + offer `requestMealSwap` |
| Weekly review: every cycle close | `ConsistencySnapshot` | the week in numbers + one focus for next week |
| Momentum drop: consistency trend declining | `consistency.trend4w` | low-pressure check-in (tone < 50 rules) |

Events enqueue to `TrainerEvent`, surface in the chat as unread coach messages, and (Phase 16) can fan out to the WhatsApp Weekly Digest.

---

## 11. TIERING & MONETIZATION

- **Luxury:** full two-way AI chat + tool use + proactive coach + nutritionist consult. This is the headline Luxury entitlement and the reason Premium/Luxury were waitlisted until Phase 12 (Decision #39). Shipping 12B flips the Luxury waitlist to live.
- **Premium (Open Decision #78):** offer a **read-only "AI Insights" feed** — proactive weekly insights and nudges (no open chat, no tool use). Cheap to run (no live chat tokens), strong upsell ladder Premium → Luxury. My recommendation: yes, ship 12K after 12E is stable; it monetises the proactive engine you already built with almost no extra cost.
- **Standard/Free:** none. (A single teaser insight on the progress page could seed FOMO → Open Decision #78b.)

---

## 12. BUILD ORDER (solo-dev sequence — MVP first, then depth)

```
STEP 1 (P0):  12A Context Engine + Trainer Brief
              → lib/ai-trainer/context.ts + derived insights + /api/trainer/brief
              → verify the snapshot reads YOUR real data correctly (you're the 1 live user)

STEP 2 (P0):  12-SAFE + 12B + 12C  — the shippable moat
              → AiConversation/AiMessage models (db push)
              → /api/trainer/chat (streaming, context injected, NO tools yet)
              → /dashboard/trainer chat UI (checkout token set, Syne/DM Sans)
              → Luxury gate via auth() + role/tier check
              → 12H cost basics wired: prompt caching + AiUsageLog + rate limit
              ⇒ At end of Step 2 you have a real, safe, context-aware coach. Flip Luxury live.

STEP 3 (P1):  12D Tool Use  — turn talk into action
              → start with read-only (getProgress, getTodaysMeals) + logMeal + requestSwap
              → THEN suggestRecalibration / suggestPlanProgression (confirm-required)

STEP 4 (P1):  12E Proactive Engine + 12I Eval Harness
              → TrainerEvent + trigger scan (fold into existing cron, Decision #76)
              → golden + red-team conversation set; run before any prompt change

STEP 5 (P2):  12F Memory  →  12G WhatsApp  →  12J Admin/QA  →  12K Premium feed (if #78 = yes)
```

> **Test-one-before-batch (your established rule):** validate the full chat loop end-to-end on your own account before any cost-scaling or proactive automation. The 1 live user (you) is the perfect canary.

---

## 13. OPEN DECISIONS (propose #74–#80 — confirm before/while building)

| # | Decision | My recommendation |
|---|---|---|
| 74 | Recipe seeds do NOT gate Phase 12; AI coaches on logged behaviour; seeding stays parallel | **Lock as stated** |
| 75 | Conversation persistence: full thread history vs rolling window of last N turns + brief | **Rolling window (cost) + durable TrainerInsight memory for the "remembers you" feel** |
| 76 | 3rd cron problem (proactive scan) on Vercel Hobby 2-cron limit | **Fold into nightly delivery cron as step 2; upgrade to Pro only if it gets heavy** |
| 77 | Two-model split — confirm which current Claude models for chat vs weekly deep-dive | **Pick from docs.claude.com at build; cheap-tier for chat, strong-tier for weekly** |
| 78 | Premium read-only "AI Insights" feed as upsell (12K) | **Yes — ship after 12E; monetises proactive engine cheaply** |
| 78b | One teaser insight on Standard/Free progress page for FOMO | **Optional — low effort, test conversion** |
| 79 | Safe-calorie floor values per sex/goal (the ED guardrail constant) | **Conservative defaults; defer below floor to nutritionist; you set the numbers** |
| 80 | Where the trainer lives in nav (and the deferred global nav rewire from Phase 11) | **Add /dashboard/trainer + link /dashboard/progress in the same nav pass** |

---

## 14. DEFINITION OF DONE (verification gates, like Phase 9 launch gates)

| Gate | Requirement |
|---|---|
| T1 | `buildTrainerContext(userId)` returns accurate snapshot of YOUR real logged data (manually verified) |
| T2 | Chat streams, persists across sessions, and the coach correctly references your actual meals/workouts/weight |
| T3 | 12-SAFE verified: medical-question deflection + restriction-pushback + injection-resistance all pass the red-team set |
| T4 | Tone modulation observably changes at your low (~26) vs a simulated high consistency score |
| T5 | Tool use: logMeal + requestSwap write through the SAME routes the dashboard uses (no divergence) |
| T6 | Cost: prompt caching confirmed hitting; per-message cost logged in AiUsageLog; rate limit enforced |
| T7 | Proactive: a plateau/missed-workout event enqueues and surfaces as a coach message |
| T8 | Luxury gate verified: non-Luxury user is correctly blocked |
| T9 | Eval harness runs green before merge; admin QA can read conversations + flagged events |

---

> **Fold into master tracker on completion. Phase 12 = the moat. Build it on the loop, not beside it.**

---------------------------------------------------------------------------------------------------------------------------------------------
# FITFUEL — PHASE 12: AI TRAINER — FINALIZED SCOPE
> **Status: FINALIZED Jun 5, 2026 — BUILD PARKED. Scope is locked; build is intentionally deferred until the data loop is fuller and the later phases ship (Decision #85). Revisit and refine the v1 cut at build time, against richer data + newer/cheaper models. Supersedes the earlier Phase 12 draft.**
> **This is the authoritative Phase 12 spec. Fold the summary + Decisions #79–#84 into FITFUEL-MASTER-TRACKER-DEFINITIVE.md (additions only).**
> **Finalization principle: CAPTURE the full universe so nothing is ever forgotten. COMMIT to a tight v1 so it actually ships. Capture ≠ commit.**
> **Stack: Next.js (PWA) · Prisma 7 · Neon · Vercel · Claude API · Auth.js v5. Native (Expo) deferred — Decision #79.**

---

## 0. THE FINALIZATION PRINCIPLE (read this first)

The exploration that fed this doc was right to be expansive — the AI trainer surface is huge and the field moves monthly. But "lock all 25 capabilities before writing a line of code" is how a solo founder never launches. So this spec does two separate things on purpose:

1. **Captures the complete universe** (§1) — every capability discussed, tagged with the wave it belongs to. Nothing is lost. This is the no-regret insurance.
2. **Commits to a tight, shippable v1** (§2) — the moat, buildable now, on web, on data already in the system.

The rest is sequenced into v2/v3/v4 (§3–§5) or reassigned to where it actually belongs (§6). You stay ahead of the field through clean architecture that lets you *add fast* (§8), not by building everything at once.

**Platform call (Decision #79, confirmed):** PWA-first. Expo native app is deferred until Luxury wearable demand is real (target trigger: ~200 Luxury users or explicit at-scale wearable-import requests). v1 ships web-only. ~85% of the full AI-trainer surface is buildable on web; the ~15% that needs native is passive wearable sync (§5).

---

## 1. THE PHASE 12 UNIVERSE (complete capture — every capability, tagged)

Wave key: **v1** = launch moat · **v2** = full daily loop · **v3** = depth + women's health + clinical-adjacent · **v4** = native/voice/social · **→Pn** = reassigned out of Phase 12.

### Food & Nutrition
| Capability | Wave |
|---|---|
| Meal logging via chat, macro tracking, plan-vs-logged, condition-aware coaching | v1 |
| Meal swap via tool call (executes, not just suggests) | v1 |
| Calorie-cycling guidance ("burned 400, eat 200 more tonight") — pure compute | v1 |
| Recipe / ingredient explanation ("why this dish, what's in it") | v1 |
| Food-photo logging (browser camera + vision API) | v2 |
| Restaurant / outside-food ordering guidance | v2 |
| Eating-time / circadian pattern analysis | v2 |
| Off-day (weekend) cooking + grocery guidance | v2 |
| Hydration tracking + prompts | v2 |

### Workout & Movement
| Capability | Wave |
|---|---|
| Pre-workout briefing (reads last session, suggests progressive overload) | v1 |
| Post-workout debrief (sets completed, est. burn, net-calorie impact) | v1 |
| Missed-workout + adaptive-load detection ("3 incomplete → consider deload") | v1 |
| Injury / pain flag → modify session + escalate (safety-critical) | v1 (in 12-SAFE) |
| **In-session workout mode** — dedicated screen, big Log-Set button, rest timer, next-up | **v1 (12-WORKOUT-MODE) — pulled into v1, "best version"** |
| RPE / effort logging per set (drives load decisions) — needs schema | v2 |
| Adaptive rest timer from RPE | v2 |
| NEAT / manual step + daily-activity logging | v2 |
| Deload-week detection + proposal | v2 |
| Exercise form-video library | →Phase 7 (content; AI links to it) |

### Body & Biometrics
| Capability | Wave |
|---|---|
| Weight history, trend, plateau detection, TDEE recalibration suggestion, goal proximity | v1 |
| Expanded measurement tracking (waist/hips/chest/arms) — verify schema | v3 |
| Progress-photo storage + side-by-side comparison (NO AI body-fat verdict — §7) | v3 |
| Menstrual-cycle tracking the AI reads (energy/water/cravings by phase) | v3 (12-CYCLE) |
| Blood-report upload + parse → surface values (NO diagnosis/Rx — §7) | v3 (12-BLOODWORK) |

### Sleep & Recovery
| Capability | Wave |
|---|---|
| Manual sleep log (hrs + quality) → intensity/weight-fluctuation/recovery coaching | v2 (12-SLEEP) |
| Pre-sleep nutrition guidance (condition-specific) | v2 |

### Mental & Behavioral
| Capability | Wave |
|---|---|
| Named, data-specific praise + cognitive reframing (pull data vs. just "keep going") | v1 (chat) |
| Mood / energy daily log | v2 (12-MOOD) |
| Stress / burnout pattern → supportive check-in, route toward human (§7) | v2 |
| Behavioral pattern library ("always skips Friday workouts") | v3 (→ memory) |

### Proactive & Predictive
| Capability | Wave |
|---|---|
| Plateau alert, streak-risk alert, goal-hit → next-plan, weekly digest narrative | v1 (12E) |
| Plan-fit detection ("only hitting 1,400 of 1,800 — portions wrong?") | v2 |
| Seasonal / festival awareness (Diwali, etc.) | v2 |
| Churn prediction + re-engagement (care, not dark-pattern — §7) | v3 (12-RETENTION) |
| Condition medical-appointment / re-test nudges | v3 |
| Supplement timing intelligence (ties Phase 17) | v2/v3 |

### Conversation & Memory
| Capability | Wave |
|---|---|
| Conversation continuity within/across sessions | v1 (12C) |
| Proactive conversation starters (push → opens chat) | v1 (12E) |
| Durable long-term memory ("hates coriander", "trip next week") | v2 (12-MEMORY) |
| Hindi / Marathi / Hinglish | v2 (12-LANGUAGE) |

### Platform / Technical / Trust
| Capability | Wave |
|---|---|
| Explainability (AI always shows its reasoning) | v1 (persona) |
| Confidence scoring (flags uncertainty on estimates) | v1/v2 |
| Audit trail of AI recs to condition users | v1 (12-SAFE/12H) |
| Coach → human nutritionist handoff protocol (Luxury consult exists) | v3/v4 |
| MyFitnessPal CSV import | v3 |
| Wearable import: Apple Health / Google Fit / Garmin / Whoop / Strava | v4 (12-IMPORT — needs Expo) |
| Real-time voice coaching (mic-on during workout) | v4 (12-VOICE — Realtime API, heavy) |
| Accountability matching / community challenges | →Phase 22 (Social) |
| Data export / DPDP Act compliance / privacy | →Phase 20 (launch compliance pass) |

---

## 2. PHASE 12 v1 — THE COMMITTED CUT (the moat, ships first)

**Definition:** a context-aware, safe, action-capable AI coach + support assistant, running on web, on data already in the system. No new schema beyond the conversation/memory/usage models + a small set/RPE-log addition for workout mode. No native, no vision, no voice.

| Sub | Name | Notes |
|---|---|---|
| 12A | Context Engine + Trainer Brief | `lib/ai-trainer/context.ts` + derived insights (plateau, streak, momentum) + cached daily brief. 80% of the value. |
| 12-SAFE | Persona + Safety Layer | tone modulation by consistency score; medical boundary; disordered-eating guards; injury-flag handling; prompt-injection; audit log. Ships WITH 12B. |
| 12B | Reactive Chat | `/dashboard/trainer`, streaming, persisted, Luxury gate. |
| 12-SUPPORT | Support layer (all subscribers) | order status, delivery ETA, pause/skip, address, billing Qs. Bounded + read-mostly; sensitive actions escalate to owner. Absorbs solo-founder support load. |
| 12C | Conversation persistence + basic memory | AiConversation / AiMessage; rolling-window context + brief. |
| 12D | Tool use | start: getProgress, getTodaysMeals/Workout, logMeal, requestSwap → then suggestRecalibration (confirm-gated, safe floor). |
| 12E | Proactive engine | plateau, missed-workout, milestone, low-rating, weekly review → "message from your coach". |
| 12-WORKOUT-MODE | In-session workout screen | dedicated screen (not chat): current exercise, target sets/reps/weight, Log-Set button, rest timer, next-up + RPE logging (adds a small set-log schema). Pulled into v1 — it's the daily-use surface chat can't replace. |
| 12H | Cost & usage controls | prompt caching, two-model split, rate limits, AiUsageLog. Wired day one, not bolted on. |
| 12I | Eval harness | golden conversations + safety red-team set; run before any prompt change. |

**v1 is explicitly:** web-only · data-already-in-system · cost-bounded · Luxury (coach) + all-subscribers (support). Shipping v1 flips the Premium/Luxury waitlist live (Decision #39).

**v1 Definition of Done:** context snapshot verified on a real account · chat references real logged data · 12-SAFE red-team passes (medical deflection, restriction pushback, injection) · tone shifts with consistency score · logMeal/requestSwap write through the SAME routes the dashboard uses · prompt caching confirmed + cost logged · proactive event surfaces · Luxury gate blocks non-Luxury · evals green.

---

## 3. PHASE 12 v2 — THE FULL DAILY LOOP (web, post-v1)

12-SLEEP (sleep log + coaching) · 12-MOOD (mood/energy log + burnout detection) · 12-FOOD-VISION (photo meal logging) · 12-MEMORY (durable long-term memory) · 12-LANGUAGE (Hinglish/Marathi) · workout-mode refinements (adaptive rest from RPE, deload detection) · plan-fit detection · hydration · NEAT logging · seasonal awareness.

The core in-session workout screen moved to v1 (best version). v2 deepens it. Sequence the rest by user demand; each adds schema + a surface + ongoing API cost.

---

## 4. PHASE 12 v3 — DEPTH + WOMEN'S HEALTH + CLINICAL-ADJACENT

12-CYCLE (menstrual tracking the AI reads — big differentiator for women's-health plans) · 12-BLOODWORK (report upload + parse, surface-only) · 12-RETENTION (churn prediction + re-engagement) · progress-photo comparison · expanded measurements · behavioral pattern library · condition education library · MyFitnessPal CSV import.

---

## 5. PHASE 12 v4 — NATIVE / VOICE / SOCIAL

12-IMPORT (Apple Health / Google Fit / Garmin / Whoop / Strava — **requires Expo native app**, Decision #79) · 12-VOICE (real-time audio coaching, OpenAI-Realtime-class, heavy cost) · coach→human handoff protocol. Community/accountability is NOT here — see §6.

---

## 6. REASSIGNED OUT OF PHASE 12 (so the phase stays shippable)

| Item | Real home | Why |
|---|---|---|
| Exercise form-video library | Phase 7 (content extension) | It's curated video content; the AI just links to it. Not AI work. |
| Data export / DPDP Act / privacy / right-to-delete | Phase 20 (launch compliance pass) | Platform-wide legal requirement, not an AI feature. (Audit trail of AI recs stays in 12-SAFE.) |
| Community / accountability matching / challenges | **NEW Phase 22 — Social & Community** | A whole social product with its own moderation, matching, and abuse surface. Bolting it onto "AI trainer" bloats and delays Phase 12. |

---

## 7. SAFETY BOUNDARIES — HARD LINES (protect users AND the business)

1. **Medical boundary.** The AI is a fitness/nutrition coach, not a clinician. For condition users (diabetic, PCOS, thyroid, heart, cancer-recovery, kidney…) and for blood-report data, it **surfaces and contextualizes only** — never diagnoses, prescribes, titrates medication, or alters medical management. Medical questions route to the Luxury nutritionist consult. Carries the Decision #30 disclaimer. (Decision #81)
2. **Body-image / disordered-eating.** No AI body-fat % verdicts from photos (inaccurate + harmful). Progress photos = storage + side-by-side only. AI never endorses sub-floor calorie targets or extreme restriction; pushes for it are de-escalated and routed to a human. `suggestRecalibration` can never propose below a configurable safe floor. (Decision #82)
3. **Proactive ≠ manipulative.** Churn/mood intelligence exists for care and retention through genuine value, not engagement dark-patterns. Sustained low mood / distress routes toward a human and supportive resources — it is never exploited as a re-engagement hook. (Decision #83)
4. **Injury flag.** "My knee hurts" → AI removes the loading exercise today, suggests rest, escalates if persistent. (in 12-SAFE)
5. **Audit trail.** Every AI recommendation to a condition user is logged with timestamp + context (AiUsageLog/AiMessage). Legal protection.

---

## 8. ARCHITECTURE GUARDRAILS — so v1 never blocks the future

- **Build the receiving end now.** A clean `/api/import/health` endpoint accepting a standard activity/sleep/HR format ships conceptually with v2's manual logs. When Expo lands (v4), the native app just *sends* to the same endpoint — no rework. Same pattern for `/api/import/foodlog` (CSV now, app later).
- **App-shell layout from v1.** Even web-only, build the PWA app shell (persistent bottom nav: Home / Log / Workouts / Progress / Coach) so v2's workout-mode and v3's surfaces slot in without re-architecting navigation. (Full webapp redesign stays a post-build pass per your call — but the layout primitives go in now.)
- **Memory model is forward-compatible.** TrainerInsight (durable facts) is written generically (kind/text/source) so cycle data, blood markers, and behavioral patterns all land in the same store later without schema churn.
- **Tools write through existing routes.** logMeal/requestSwap call the SAME APIs the dashboard uses — one code path, no divergence as surfaces grow.
- **Two-model + caching from day one.** Cheap model for chat, strong model for weekly deep-dive; prompt-cache the big context prefix. Adding vision/voice later is an additive model route, not a re-architecture.

---

## 9. DECISIONS TO LOG (append to tracker — #79–#84)

| # | Decision |
|---|---|
| 79 | **PWA-first; Expo native deferred.** v1 ships web-only. Native app enters roadmap only on real Luxury wearable demand (target trigger ~200 Luxury users or explicit at-scale requests). ~85% of the AI-trainer surface is web-buildable; the ~15% needing native = passive wearable sync. |
| 80 | **Phase 12 finalized = tight v1 + captured backlog (v2–v4). Capture ≠ commit.** v1 = 12A + 12-SAFE + 12B + 12-SUPPORT + 12C + 12D + 12E + 12H + 12I, on data already in the system. Everything else is documented and sequenced, not built upfront. |
| 81 | **AI medical boundary (hard line).** Bloodwork + condition coaching = surface/contextualize only. Never diagnose, prescribe, titrate, or alter medical management. Route medical questions to nutritionist consult. Reinforces #30. |
| 82 | **Body-image guardrail (hard line).** No AI body-fat verdicts from photos. Progress photos = storage + comparison only. No sub-floor calorie targets ever. Governed by disordered-eating guards in 12-SAFE. |
| 83 | **Proactive ≠ manipulative.** Mood/churn intelligence for genuine care + value-based retention only. Distress routes to a human; never a dark-pattern engagement hook. |
| 84 | **Reassignments out of Phase 12.** Form-video → Phase 7 content. Data export / DPDP / privacy → Phase 20 launch compliance pass. Community / accountability / challenges → NEW Phase 22 (Social & Community). |
| 85 | **Phase 12 build PARKED (Jun 5).** Scope finalized + fully captured; build intentionally deferred until the data loop is fuller (more users, more logged meals/workouts/weight, v2-class surfaces) and the later phases ship. Rationale: the AI's quality is bounded by data depth (1 user, sparse logs today), the field moves monthly (build against newer/cheaper models later), and operational + revenue phases come first. Keep §8 forward-compatible hooks (receiving-API pattern, app-shell nav) in mind during intervening phases so the eventual build is a slot-in, not a retrofit. Re-confirm the v1 cut at build time. |

(Phase 22 — Social & Community — to be added to the Phase Status Overview + Upcoming Phases tables as ⏸️ Pending.)

---

## 10. BUILD ORDER — WHEN UN-PARKED

Phase 12 is parked (Decision #85) — build the data-generating phases first. **When un-parked**, start at **12A — Context Engine**. Build `lib/ai-trainer/context.ts`, verify the snapshot reads a real account correctly (your own is the canary), then 12-SAFE + 12B chat with the Luxury gate and cost controls wired in. That sequence alone produces a shippable, world-class coach. Everything in §3–§5 layers on after, in demand order, without rework — because §8 made v1 forward-compatible. Re-confirm the exact v1 cut at that point against the data you actually have by then.

> **The moat was never the wearable sync or the voice. It's that FitFuel owns the plate — verified intake, not self-reported. That runs 100% on web, in v1.**