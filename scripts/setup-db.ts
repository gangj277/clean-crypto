import fs from "node:fs/promises";
import path from "node:path";

import type { DashboardData } from "../src/lib/dashboard";

const DASHBOARD_FILE = path.join(process.cwd(), "content", "data", "dashboard.json");

async function loadSeedData(): Promise<DashboardData> {
  const raw = await fs.readFile(DASHBOARD_FILE, "utf-8");
  return JSON.parse(raw) as DashboardData;
}

async function getSql() {
  const processWithLoadEnvFile = process as typeof process & {
    loadEnvFile?: (file?: string) => void;
  };

  processWithLoadEnvFile.loadEnvFile?.(".env.local");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Check .env.local.");
  }

  const { sql } = await import("../src/lib/db");
  return sql;
}

async function createTables() {
  const sql = await getSql();

  console.log("Creating dashboard tables...");

  await sql.transaction([
    sql`
      CREATE TABLE IF NOT EXISTS dashboard_headline (
        id INTEGER PRIMARY KEY DEFAULT 1,
        total_damage_eok INTEGER NOT NULL,
        total_cases INTEGER NOT NULL,
        period_start TEXT NOT NULL,
        period_end TEXT NOT NULL,
        daily_average INTEGER NOT NULL,
        avg_damage_per_case_man INTEGER NOT NULL,
        last_updated TEXT NOT NULL
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS dashboard_yearly (
        id SERIAL PRIMARY KEY,
        year INTEGER NOT NULL UNIQUE,
        label TEXT NOT NULL,
        cases INTEGER NOT NULL,
        damage_eok INTEGER NOT NULL,
        arrests INTEGER NOT NULL DEFAULT 0
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS dashboard_monthly (
        id SERIAL PRIMARY KEY,
        month TEXT NOT NULL UNIQUE,
        cases INTEGER NOT NULL,
        damage_eok INTEGER NOT NULL
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS dashboard_fraud_types (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL UNIQUE,
        percentage INTEGER NOT NULL,
        description TEXT NOT NULL
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS dashboard_platforms (
        id SERIAL PRIMARY KEY,
        platform TEXT NOT NULL UNIQUE,
        percentage INTEGER NOT NULL
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS dashboard_enforcements (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL,
        title TEXT NOT NULL,
        damage_eok INTEGER NOT NULL DEFAULT 0,
        victims INTEGER NOT NULL DEFAULT 0,
        arrests INTEGER NOT NULL DEFAULT 0,
        source TEXT NOT NULL,
        is_regulation BOOLEAN NOT NULL DEFAULT FALSE
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS dashboard_fss_inspection (
        id INTEGER PRIMARY KEY DEFAULT 1,
        total_firms INTEGER NOT NULL,
        violation_firms INTEGER NOT NULL,
        violation_rate INTEGER NOT NULL,
        year INTEGER NOT NULL,
        source TEXT NOT NULL
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS dashboard_market_context (
        id INTEGER PRIMARY KEY DEFAULT 1,
        total_investors INTEGER NOT NULL,
        daily_volume_billion INTEGER NOT NULL,
        registered_vasps INTEGER NOT NULL,
        last_updated TEXT NOT NULL
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS dashboard_data_sources (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        url TEXT NOT NULL
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS dashboard_news (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        category TEXT NOT NULL,
        source TEXT NOT NULL
      )
    `,
  ]);
}

async function truncateTables() {
  const sql = await getSql();

  console.log("Truncating existing dashboard data...");

  await sql`
    TRUNCATE TABLE
      dashboard_headline,
      dashboard_yearly,
      dashboard_monthly,
      dashboard_fraud_types,
      dashboard_platforms,
      dashboard_enforcements,
      dashboard_fss_inspection,
      dashboard_market_context,
      dashboard_data_sources,
      dashboard_news
    RESTART IDENTITY
  `;
}

async function seedTables(data: DashboardData) {
  const sql = await getSql();

  console.log("Seeding dashboard data...");

  const queries = [
    sql`
      INSERT INTO dashboard_headline (
        id,
        total_damage_eok,
        total_cases,
        period_start,
        period_end,
        daily_average,
        avg_damage_per_case_man,
        last_updated
      ) VALUES (
        1,
        ${data.headline.totalDamageEok},
        ${data.headline.totalCases},
        ${data.headline.periodStart},
        ${data.headline.periodEnd},
        ${data.headline.dailyAverage},
        ${data.headline.avgDamagePerCaseMan},
        ${data.headline.lastUpdated}
      )
    `,
    ...data.yearly.map((item) => sql`
      INSERT INTO dashboard_yearly (
        year,
        label,
        cases,
        damage_eok,
        arrests
      ) VALUES (
        ${item.year},
        ${item.label},
        ${item.cases},
        ${item.damageEok},
        ${item.arrests}
      )
    `),
    ...data.monthly.map((item) => sql`
      INSERT INTO dashboard_monthly (
        month,
        cases,
        damage_eok
      ) VALUES (
        ${item.month},
        ${item.cases},
        ${item.damageEok}
      )
    `),
    ...data.fraudTypes.map((item) => sql`
      INSERT INTO dashboard_fraud_types (
        type,
        percentage,
        description
      ) VALUES (
        ${item.type},
        ${item.percentage},
        ${item.description}
      )
    `),
    ...data.platformBreakdown.map((item) => sql`
      INSERT INTO dashboard_platforms (
        platform,
        percentage
      ) VALUES (
        ${item.platform},
        ${item.percentage}
      )
    `),
    ...data.majorEnforcements.map((item) => sql`
      INSERT INTO dashboard_enforcements (
        date,
        title,
        damage_eok,
        victims,
        arrests,
        source,
        is_regulation
      ) VALUES (
        ${item.date},
        ${item.title},
        ${item.damageEok},
        ${item.victims},
        ${item.arrests},
        ${item.source},
        ${Boolean(item.isRegulation)}
      )
    `),
    sql`
      INSERT INTO dashboard_fss_inspection (
        id,
        total_firms,
        violation_firms,
        violation_rate,
        year,
        source
      ) VALUES (
        1,
        ${data.fssInspection.totalFirms},
        ${data.fssInspection.violationFirms},
        ${data.fssInspection.violationRate},
        ${data.fssInspection.year},
        ${data.fssInspection.source}
      )
    `,
    sql`
      INSERT INTO dashboard_market_context (
        id,
        total_investors,
        daily_volume_billion,
        registered_vasps,
        last_updated
      ) VALUES (
        1,
        ${data.marketContext.totalInvestors},
        ${data.marketContext.dailyVolumeBillion},
        ${data.marketContext.registeredVASPs},
        ${data.marketContext.lastUpdated}
      )
    `,
    ...data.dataSources.map((item) => sql`
      INSERT INTO dashboard_data_sources (
        name,
        type,
        url
      ) VALUES (
        ${item.name},
        ${item.type},
        ${item.url}
      )
    `),
    ...data.news.map((item) => sql`
      INSERT INTO dashboard_news (
        date,
        title,
        summary,
        category,
        source
      ) VALUES (
        ${item.date},
        ${item.title},
        ${item.summary},
        ${item.category},
        ${item.source}
      )
    `),
  ];

  await sql.transaction(queries);

  console.log(
    [
      `headline: 1`,
      `yearly: ${data.yearly.length}`,
      `monthly: ${data.monthly.length}`,
      `fraud types: ${data.fraudTypes.length}`,
      `platforms: ${data.platformBreakdown.length}`,
      `enforcements: ${data.majorEnforcements.length}`,
      `fss inspection: 1`,
      `market context: 1`,
      `data sources: ${data.dataSources.length}`,
      `news: ${data.news.length}`,
    ].join(" | "),
  );
}

async function main() {
  console.log(`Reading seed data from ${DASHBOARD_FILE}...`);
  const data = await loadSeedData();

  await createTables();
  await truncateTables();
  await seedTables(data);

  console.log("Dashboard database setup complete.");
}

main().catch((error) => {
  console.error("Dashboard database setup failed.");
  console.error(error);
  process.exitCode = 1;
});
