# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npx expo start          # Start dev server (scan QR with Expo Go)
npx expo start --android
npx expo start --ios
npx expo start --web
npx tsc --noEmit        # Type-check (no test suite exists)
```

There is no lint script configured. TypeScript strict mode is on (`tsconfig.json`).

## Git workflow

After completing any meaningful unit of work — a new feature, a bug fix, a refactor, a schema change — commit and push to `origin main`. Use descriptive commit messages that explain what changed and why. Never let work accumulate uncommitted. If a task spans multiple files or steps, commit at each logical checkpoint rather than waiting until everything is done.

## Architecture

### Routing
Expo Router file-based routing lives in `app/`. The entry point `app/index.tsx` checks `userStore` for `setup_complete` and redirects to either `/onboarding` or `/(tabs)`. The onboarding flow is a linear stack: `onboarding/index` → `onboarding/tdee` → `onboarding/macros`. After setup, the app lives in `app/(tabs)/` with four tabs: Today (diary), Search, Recipes, Profile.

Modal screens (`custom-food`, `recipe-import`, `micronutrients`, `settings`) are registered in `app/_layout.tsx` as stack screens with `presentation: 'modal'` or explicit headers.

### State
- **Zustand** (`src/store/userStore.ts`) — sole global store, holds `UserProfile` loaded from SQLite at startup via `initDatabase().then(() => loadProfile())` in the root layout.
- **TanStack Query** — used only for USDA food searches in `app/(tabs)/search.tsx`. All SQLite reads are synchronous and called directly (no query wrapper).

### Database
`src/db/database.ts` opens a singleton SQLite database (`calories_tracker.db`) using `expo-sqlite`'s synchronous API. All queries in `src/db/queries/` use `getAllSync`, `getFirstSync`, and `runSync`. `initDatabase()` runs all `CREATE TABLE IF NOT EXISTS` migrations on startup — schema changes are additive only (no migration versioning exists yet).

**Tables:** `user_profile` (singleton row, id=1), `custom_foods`, `recipes`, `recipe_ingredients`, `diary_entries`.

Nutrition values are stored **denormalized** directly on `diary_entries` rows — no joins needed to compute daily totals. USDA and custom foods store nutrients per 100g; amounts are scaled at log time before insertion.

### External APIs
| Module | Purpose | Auth |
|--------|---------|------|
| `src/api/usda.ts` | Food search (USDA FoodData Central) | `DEMO_KEY` hardcoded — 30 req/hr limit. Replace with free key from fdc.nal.usda.gov |
| `src/api/openfoodfacts.ts` | Barcode lookup | None required |
| `src/api/claude.ts` | Recipe text parsing + nutrition label photo scanning | Anthropic API key stored in `expo-secure-store`, entered via Settings screen |

The Claude client is instantiated with `dangerouslyAllowBrowser: true` because Expo runs in a browser-like environment. The API key is never bundled — it's saved to SecureStore at runtime.

### Nutrient schema
All 15 nutrient fields appear consistently across `custom_foods`, `diary_entries`, and TypeScript interfaces: `calories`, `protein_g`, `carbs_g`, `fat_g`, `fiber_g`, `sugar_g`, `sodium_mg`, `saturated_fat_g`, `cholesterol_mg`, `vitamin_a_mcg`, `vitamin_c_mg`, `vitamin_d_mcg`, `calcium_mg`, `iron_mg`, `potassium_mg`. When adding a new nutrient, it must be added to all of these places plus `src/constants/fdaDailyValues.ts`.

### Path alias
`@/*` maps to `./src/*` (configured in `tsconfig.json`). Both `@/` and relative imports are used; prefer `@/` for imports from `src/`.
