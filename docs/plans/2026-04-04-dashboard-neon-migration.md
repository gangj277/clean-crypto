# Dashboard Neon Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the dashboard data layer from `content/data/dashboard.json` to Neon PostgreSQL while preserving every exported dashboard interface and public accessor name.

**Architecture:** Seed the existing JSON snapshot into normalized dashboard tables with a standalone `tsx` script, then have `src/lib/dashboard.ts` read from Neon and map rows back into the exact frontend-facing TypeScript interfaces with safe defaults. Keep the dashboard page UI unchanged and only switch its data fetching to awaited async calls.

**Tech Stack:** Next.js app router, TypeScript, Neon serverless driver, `tsx`, `@next/env`, Node test runner

---

### Task 1: Add the Failing Integration Test

**Files:**
- Create: `tests/dashboard-db.test.ts`
- Modify: `package.json`

**Step 1: Write the failing test**

```ts
test("setup script seeds dashboard tables and dashboard accessors read seeded data", async () => {
  await runSetupScript();
  const headline = await getHeadlineStats();
  assert.deepEqual(headline, seedData.headline);
});
```

**Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/dashboard-db.test.ts`
Expected: FAIL because the current migration is either incomplete or the setup/database wiring is broken.

**Step 3: Keep the test focused on the contract**

```ts
assert.equal((await getRecentEnforcements(5)).length, 5);
assert.deepEqual(await getRegulationTimeline(), expectedRegulations);
assert.deepEqual(await getNews(), expectedNewsSortedDesc);
```

**Step 4: Re-run the test to keep the failure signal specific**

Run: `npx tsx --test tests/dashboard-db.test.ts`
Expected: FAIL with a migration/setup mismatch, not a broken test harness.

**Step 5: Commit**

```bash
git add tests/dashboard-db.test.ts package.json pnpm-lock.yaml
git commit -m "test: add dashboard neon integration coverage"
```

### Task 2: Finish the Neon Data Layer

**Files:**
- Create: `src/lib/db.ts`
- Modify: `src/lib/dashboard.ts`
- Modify: `scripts/setup-db.ts`

**Step 1: Make the database connection reusable**

```ts
import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);
```

**Step 2: Ensure the setup script loads env outside Next runtime**

```ts
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
```

**Step 3: Seed every JSON section into its matching table**

```ts
await sql.transaction([
  sql`CREATE TABLE IF NOT EXISTS dashboard_headline (...)`,
  sql`CREATE TABLE IF NOT EXISTS dashboard_yearly (...)`,
]);
await sql`TRUNCATE TABLE ... RESTART IDENTITY`;
await sql.transaction([
  sql`INSERT INTO dashboard_headline (...) VALUES (...)`,
]);
```

**Step 4: Map query rows back to the unchanged exported interfaces**

```ts
export async function getHeadlineStats(): Promise<HeadlineStats> {
  const rows = await sql`SELECT ...`;
  return mapHeadlineStats(rows[0]);
}
```

**Step 5: Run the focused test to verify the implementation passes**

Run: `npx tsx --test tests/dashboard-db.test.ts`
Expected: PASS

### Task 3: Verify Dashboard Rendering and Seed Script Execution

**Files:**
- Modify: `src/app/dashboard/page.tsx`

**Step 1: Make the page async and await the dashboard accessors**

```tsx
export default async function DashboardPage() {
  const [headline, monthly] = await Promise.all([
    getHeadlineStats(),
    getMonthlyTrend(),
  ]);
}
```

**Step 2: Run the actual setup command required by the task**

Run: `npx tsx scripts/setup-db.ts`
Expected: success logs for table creation, truncation, seeding, and completion

**Step 3: Run project verification**

Run: `pnpm exec eslint src/lib/dashboard.ts src/app/dashboard/page.tsx scripts/setup-db.ts tests/dashboard-db.test.ts`
Expected: PASS

Run: `pnpm exec next build`
Expected: PASS

**Step 4: Commit**

```bash
git add src/lib/db.ts src/lib/dashboard.ts scripts/setup-db.ts src/app/dashboard/page.tsx tests/dashboard-db.test.ts
git commit -m "feat: back dashboard data with neon postgres"
```
