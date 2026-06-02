# Phase 5 — Body Metrics Tracker
**Status: ✅ COMPLETE**
**Route:** `/dashboard/body-metrics`
**Stack:** Next.js App Router · Prisma · Neon PostgreSQL · Vercel BLE Web API

---

## Files

| File | Path | Status |
|------|------|--------|
| Page (server component) | `app/dashboard/body-metrics/page.tsx` | ✅ Done |
| Client component | `app/dashboard/body-metrics/BodyMetricsClient.tsx` | ✅ Done |
| POST + GET metrics | `app/api/user/metrics/route.ts` | ✅ Done |
| GET latest reading | `app/api/user/metrics/latest/route.ts` | ✅ Done |
| GET history (paginated) | `app/api/user/metrics/history/route.ts` | ✅ Done |
| Prisma model | `prisma/schema.prisma` → `BodyMetric` | ✅ Done |

---

## DB Model — `BodyMetric`

```prisma
model BodyMetric {
  id           String   @id @default(cuid())
  userId       String
  measuredAt   DateTime @default(now())
  weightKg     Float?
  bmi          Float?
  bodyFatPct   Float?
  muscleMassKg Float?
  waterPct     Float?
  boneMassKg   Float?
  visceralFat  Float?   // stored as float (1 decimal) — NOT rounded int
  metabolicAge Int?
  proteinPct   Float?
  source       String   @default("manual")
  notes        String?  // JSON — stores: bmr, fatFreeWeight, subcutaneousFat, skeletalMuscle
  createdAt    DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([measuredAt])
  @@map("body_metrics")
}
```

**Field mapping — client → schema:**
| Client field | Schema column | Notes |
|---|---|---|
| `weight` | `weightKg` | |
| `bodyFatRate` | `bodyFatPct` | |
| `muscleMass` | `muscleMassKg` | |
| `bodyWater` | `waterPct` | |
| `boneMass` | `boneMassKg` | |
| `bodyAge` | `metabolicAge` | stored as `Math.round()` Int |
| `bmi` | `bmi` | same name |
| `visceralFat` | `visceralFat` | same name, 1 decimal |
| `protein` | `proteinPct` | |
| `bmr` | `notes` JSON | packed as `{ bmr: number }` |
| `fatFreeWeight` | `notes` JSON | packed as `{ fatFreeWeight: number }` |
| `subcutaneousFat` | `notes` JSON | packed as `{ subcutaneousFat: number }` |
| `skeletalMuscle` | `notes` JSON | packed as `{ skeletalMuscle: number }` |

**Computed fields (never stored — derived on read/compute):**
- `fatMass` = `weightKg × bodyFatPct / 100`
- `waterWeight` = `weightKg × waterPct / 100`
- `muscleRate` = `muscleMassKg / weightKg × 100`
- `proteinMass` = `weightKg × proteinPct / 100`
- `idealWeight` = `22 × weightKg / bmi`
- `subcutaneousFat` fallback = `bodyFatPct × 0.82`
- `skeletalMuscle` fallback = `muscleMassKg / weightKg × 100 × 0.73`

---

## 18 Tracked Parameters

| # | Key | Label | Unit | Source |
|---|-----|-------|------|--------|
| 1 | `weight` | Weight | kg | scale / manual |
| 2 | `bmi` | BMI | — | computed |
| 3 | `bodyFatRate` | Body Fat | % | BIA |
| 4 | `fatMass` | Fat Mass | kg | derived |
| 5 | `fatFreeWeight` | Fat-Free Weight | kg | derived |
| 6 | `subcutaneousFat` | Subcutaneous Fat | % | BIA / derived |
| 7 | `visceralFat` | Visceral Fat | level | BIA |
| 8 | `bodyWater` | Body Water | % | BIA |
| 9 | `waterWeight` | Water Weight | kg | derived |
| 10 | `skeletalMuscle` | Skeletal Muscle | % | BIA / derived |
| 11 | `muscleMass` | Muscle Mass | kg | BIA |
| 12 | `muscleRate` | Muscle Rate | % | derived |
| 13 | `boneMass` | Bone Mass | kg | BIA |
| 14 | `protein` | Protein | % | BIA |
| 15 | `proteinMass` | Protein Mass | kg | derived |
| 16 | `bmr` | BMR | kcal | computed (Mifflin-St Jeor) |
| 17 | `bodyAge` | Body Age | yrs | computed |
| 18 | `idealWeight` | Ideal Weight | kg | derived (BMI=22) |

---

## API Routes

### `POST /api/user/metrics`
Saves a new reading. Auth: `auth()` session.
- Maps client field names → schema column names
- Packs `bmr`, `fatFreeWeight`, `subcutaneousFat`, `skeletalMuscle` into `notes` as JSON
- Returns `{ reading }` with status 201

### `GET /api/user/metrics`
Returns all readings for user (paginated, `?limit=30`).
- Returns `{ readings: [...] }` ordered `measuredAt desc`

### `GET /api/user/metrics/latest`
Returns the single most recent reading remapped to client `Metrics` shape.
- Derives all computed fields server-side (no null blanks)
- Returns `null` (200) if user has no readings yet
- Used to hydrate Overview tab on mount

### `GET /api/user/metrics/history?limit=30`
Returns array of `HistoryRow[]` ordered `measuredAt asc` (oldest→newest for chart).
- Remaps: `measuredAt→recordedAt`, `weightKg→weight`, `bodyFatPct→bodyFatRate`, `muscleMassKg→muscleMass`, `waterPct→bodyWater`
- Unpacks `bmr` from notes JSON
- Returns plain array (not wrapped object)

---

## BLE Scale Integration

**Scale:** MEDITIVE (FitDays protocol)
**Tech:** Web Bluetooth API (Chrome only)

**Flow:**
1. User clicks "Connect Scale" → `navigator.bluetooth.requestDevice()`
2. Scans for services: `fff0`, `ffb0`, `fee0`
3. Writes user profile packet (gender, height, age) to characteristic `ffb1`
4. Subscribes to notifications on `ffb2` / `fff1` / `fff4`
5. `parseFitDaysPacket()` decodes each packet → `{ weight, impedance, stable, stableCount }`
6. Tare baseline: first 5 packets averaged → `tareWeight`
7. Stable reading: 8 consecutive packets within ±0.05 kg above tare → fires once
8. `computeAllMetrics(weight, impedance, bio)` → all 18 fields
9. Modal opens pre-filled → user reviews → clicks Save → POST

**Fallback:** Manual Entry modal (18 input fields, any/all can be filled)

**BIA Formulas:**
- Body fat: Deurenberg BMI-based formula (not raw impedance BIA — impedance used for stability detection only)
- Muscle mass: `fatFreeWeight × 0.95` (matches Fitdays display)
- Visceral fat: `bodyFatPct × 0.25 + bmi × 0.1` (1 decimal, not rounded)
- BMR: Mifflin-St Jeor (`10w + 6.25h - 5a + 5` for men, `- 161` for women)
- Body age: `age + (bodyFatPct - 18) × 0.4` for men

---

## UI Components

### Overview Tab
- Loads latest reading on mount via `/api/user/metrics/latest`
- Shows `loadingLatest` spinner → Empty state (no data) OR MetricsGrid
- **MetricsGrid:** 18 cards, each clickable → InfoDrawer

### InfoDrawer (per metric)
- Slides up from bottom (mobile-style sheet)
- Shows: current value + range badge, description, personalised insight (computed from actual values), reference ranges with active progress bar, 3–5 numbered actionable tips

### History Tab
- Loads from `/api/user/metrics/history?limit=30` when tab opens (not on mount)
- **Chart:** SVG line chart, 7 switchable metrics (Weight, Body Fat, Muscle, BMI, Visceral Fat, Body Water, BMR), each with own colour
- **All Readings:** click-to-expand rows — summary shows 5 stats, expanded panel shows all 7 stored metrics in a grid

### Manual Entry Modal
- Triggered by "+ Manual Entry" button (header) or BLE fallback
- 18 input fields, grid layout
- When scale is connected: pre-populated from BIA computation, shows "Scale Connected" badge
- `handleSave` → POST → refreshes history if on history tab

---

## Key Bugs Fixed This Phase

| Bug | Fix |
|-----|-----|
| History showed May 17 mock data always | Removed `MOCK_HISTORY` hardcoded array; wired `useEffect` to `/api/user/metrics/history` |
| Overview always empty on load | Added `/latest` route + `useEffect` on mount |
| Muscle mass formula off vs Fitdays | Changed coefficient `0.826 → 0.95` |
| Visceral fat rounded (no decimals) | Removed `Math.round()`, changed `decimals: 0 → 1` |
| History tab not clickable | Was a CSS issue — now rows have `cursor: pointer` + expand on click |
| Blank fields (Water Weight, Muscle Rate, etc.) | `/latest` route now derives all computed fields server-side |
| BLE debug log visible in production | Removed `bleDebugLog` state, all `console.log` calls, debug panel |
| Log tab duplicated Manual Entry | Removed Log tab entirely; only Overview + History remain |
| Chart only showed 4 metrics | Expanded to 7: added Visceral Fat, Body Water, BMR |
| All Readings not expandable | Added click-to-expand with full metric grid panel |

---

## What Is NOT Done (intentional)

- **Progress photos** — not planned for this phase
- **Export CSV** — could be added later
- **Goal setting per metric** — Phase 8+ feature
- **Push notifications for weekly weigh-in** — Phase 8+ feature
- **Admin view of user metrics** — Admin dashboard phase

