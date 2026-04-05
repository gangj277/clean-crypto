import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { neon } from "@neondatabase/serverless";

interface HeadlineStats {
  totalDamageEok: number;
  totalCases: number;
  periodStart: string;
  periodEnd: string;
  dailyAverage: number;
  avgDamagePerCaseMan: number;
  lastUpdated: string;
}

interface YearlyData {
  year: number;
  label: string;
  cases: number;
  damageEok: number;
  arrests: number;
}

interface MonthlyData {
  month: string;
  cases: number;
  damageEok: number;
}

interface FraudType {
  type: string;
  percentage: number;
  description: string;
}

interface PlatformBreakdown {
  platform: string;
  percentage: number;
}

interface Enforcement {
  date: string;
  title: string;
  damageEok: number;
  victims: number;
  arrests: number;
  source: string;
  isRegulation?: boolean;
}

interface FssInspection {
  totalFirms: number;
  violationFirms: number;
  violationRate: number;
  year: number;
  source: string;
}

interface MarketContext {
  totalInvestors: number;
  dailyVolumeBillion: number;
  registeredVASPs: number;
  lastUpdated: string;
}

interface DataSource {
  name: string;
  type: string;
  url: string;
}

interface NewsItem {
  date: string;
  title: string;
  summary: string;
  category: string;
  source: string;
}

interface DashboardData {
  headline: HeadlineStats;
  yearly: YearlyData[];
  monthly: MonthlyData[];
  fraudTypes: FraudType[];
  platformBreakdown: PlatformBreakdown[];
  majorEnforcements: Enforcement[];
  fssInspection: FssInspection;
  marketContext: MarketContext;
  dataSources: DataSource[];
  news: NewsItem[];
}

const ROOT = process.cwd();
const DASHBOARD_FILE = path.join(ROOT, "content", "data", "dashboard.json");
const ENV_FILE = path.join(ROOT, ".env.local");

async function readDashboardData(): Promise<DashboardData> {
  const raw = await fs.readFile(DASHBOARD_FILE, "utf-8");
  return JSON.parse(raw) as DashboardData;
}

async function readDatabaseUrl(): Promise<string> {
  const raw = await fs.readFile(ENV_FILE, "utf-8");
  const line = raw
    .split(/\r?\n/u)
    .find((entry) => entry.startsWith("DATABASE_URL="));

  if (!line) {
    throw new Error("DATABASE_URL was not found in .env.local");
  }

  const value = line.slice("DATABASE_URL=".length).trim();

  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function runSetupScript() {
  const result = spawnSync("npx", ["tsx", "scripts/setup-db.ts"], {
    cwd: ROOT,
    encoding: "utf-8",
    env: process.env,
  });

  assert.equal(
    result.status,
    0,
    `setup-db.ts failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
}

function sortEnforcementsDescending(items: Enforcement[]): Enforcement[] {
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}

function sortEnforcementsAscending(items: Enforcement[]): Enforcement[] {
  return [...items].sort((a, b) => a.date.localeCompare(b.date));
}

test(
  "setup-db seeds the dashboard tables and dashboard accessors return the seeded data",
  { concurrency: false },
  async () => {
    const databaseUrl = await readDatabaseUrl();
    process.env.DATABASE_URL = databaseUrl;

    const seedData = await readDashboardData();
    runSetupScript();

    const sql = neon(databaseUrl);
    const counts = await sql`
      SELECT
        (SELECT COUNT(*)::int FROM dashboard_headline) AS headline_count,
        (SELECT COUNT(*)::int FROM dashboard_yearly) AS yearly_count,
        (SELECT COUNT(*)::int FROM dashboard_monthly) AS monthly_count,
        (SELECT COUNT(*)::int FROM dashboard_fraud_types) AS fraud_types_count,
        (SELECT COUNT(*)::int FROM dashboard_platforms) AS platforms_count,
        (SELECT COUNT(*)::int FROM dashboard_enforcements) AS enforcements_count,
        (SELECT COUNT(*)::int FROM dashboard_fss_inspection) AS fss_inspection_count,
        (SELECT COUNT(*)::int FROM dashboard_market_context) AS market_context_count,
        (SELECT COUNT(*)::int FROM dashboard_data_sources) AS data_sources_count,
        (SELECT COUNT(*)::int FROM dashboard_news) AS news_count
    `;

    assert.deepEqual(counts[0], {
      headline_count: 1,
      yearly_count: seedData.yearly.length,
      monthly_count: seedData.monthly.length,
      fraud_types_count: seedData.fraudTypes.length,
      platforms_count: seedData.platformBreakdown.length,
      enforcements_count: seedData.majorEnforcements.length,
      fss_inspection_count: 1,
      market_context_count: 1,
      data_sources_count: seedData.dataSources.length,
      news_count: seedData.news.length,
    });

    const dashboard = await import("../src/lib/dashboard");

    assert.equal(dashboard.getHeadlineStats() instanceof Promise, true);
    assert.equal(dashboard.getRecentEnforcements(1) instanceof Promise, true);

    assert.deepEqual(await dashboard.getHeadlineStats(), seedData.headline);
    assert.deepEqual(await dashboard.getYearlyTrend(), seedData.yearly);
    assert.deepEqual(await dashboard.getMonthlyTrend(), seedData.monthly);
    assert.deepEqual(await dashboard.getFraudTypes(), seedData.fraudTypes);
    assert.deepEqual(await dashboard.getPlatformBreakdown(), seedData.platformBreakdown);
    assert.deepEqual(
      await dashboard.getEnforcements(),
      sortEnforcementsDescending(seedData.majorEnforcements),
    );
    assert.deepEqual(await dashboard.getFssInspection(), seedData.fssInspection);
    assert.deepEqual(await dashboard.getMarketContext(), seedData.marketContext);
    assert.deepEqual(await dashboard.getDataSources(), seedData.dataSources);
    assert.deepEqual(
      await dashboard.getRecentEnforcements(5),
      sortEnforcementsDescending(
        seedData.majorEnforcements.filter((item) => !item.isRegulation),
      ).slice(0, 5),
    );
    assert.deepEqual(
      await dashboard.getRegulationTimeline(),
      sortEnforcementsAscending(
        seedData.majorEnforcements.filter((item) => item.isRegulation),
      ),
    );
    assert.deepEqual(
      await dashboard.getNews(),
      [...seedData.news].sort((a, b) => b.date.localeCompare(a.date)),
    );
  },
);

test(
  "dashboard singletons fall back to defaults when the corresponding tables are empty",
  { concurrency: false },
  async () => {
    const databaseUrl = await readDatabaseUrl();
    process.env.DATABASE_URL = databaseUrl;

    const sql = neon(databaseUrl);
    await sql`
      TRUNCATE TABLE
        dashboard_headline,
        dashboard_fss_inspection,
        dashboard_market_context
      RESTART IDENTITY
    `;

    const dashboard = await import("../src/lib/dashboard");

    assert.deepEqual(await dashboard.getHeadlineStats(), {
      totalDamageEok: 0,
      totalCases: 0,
      periodStart: "",
      periodEnd: "",
      dailyAverage: 0,
      avgDamagePerCaseMan: 0,
      lastUpdated: "",
    });

    assert.deepEqual(await dashboard.getFssInspection(), {
      totalFirms: 0,
      violationFirms: 0,
      violationRate: 0,
      year: 0,
      source: "",
    });

    assert.deepEqual(await dashboard.getMarketContext(), {
      totalInvestors: 0,
      dailyVolumeBillion: 0,
      registeredVASPs: 0,
      lastUpdated: "",
    });

    runSetupScript();
  },
);
