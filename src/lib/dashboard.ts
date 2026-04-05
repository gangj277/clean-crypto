import { sql } from "./db";

export interface HeadlineStats {
  totalDamageEok: number;
  totalCases: number;
  periodStart: string;
  periodEnd: string;
  dailyAverage: number;
  avgDamagePerCaseMan: number;
  lastUpdated: string;
}

export interface YearlyData {
  year: number;
  label: string;
  cases: number;
  damageEok: number;
  arrests: number;
}

export interface MonthlyData {
  month: string;
  cases: number;
  damageEok: number;
}

export interface FraudType {
  type: string;
  percentage: number;
  description: string;
}

export interface PlatformBreakdown {
  platform: string;
  percentage: number;
}

export interface Enforcement {
  date: string;
  title: string;
  damageEok: number;
  victims: number;
  arrests: number;
  source: string;
  isRegulation?: boolean;
}

export interface FssInspection {
  totalFirms: number;
  violationFirms: number;
  violationRate: number;
  year: number;
  source: string;
}

export interface MarketContext {
  totalInvestors: number;
  dailyVolumeBillion: number;
  registeredVASPs: number;
  lastUpdated: string;
}

export interface DataSource {
  name: string;
  type: string;
  url: string;
}

export interface NewsItem {
  date: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  url: string;
}

export interface DashboardData {
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

const DEFAULT_DASHBOARD_DATA: DashboardData = {
  headline: {
    totalDamageEok: 0,
    totalCases: 0,
    periodStart: "",
    periodEnd: "",
    dailyAverage: 0,
    avgDamagePerCaseMan: 0,
    lastUpdated: "",
  },
  yearly: [],
  monthly: [],
  fraudTypes: [],
  platformBreakdown: [],
  majorEnforcements: [],
  fssInspection: {
    totalFirms: 0,
    violationFirms: 0,
    violationRate: 0,
    year: 0,
    source: "",
  },
  marketContext: {
    totalInvestors: 0,
    dailyVolumeBillion: 0,
    registeredVASPs: 0,
    lastUpdated: "",
  },
  dataSources: [],
  news: [],
};

function toNumber(value: unknown, fallback = 0): number {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function toString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    return value === "true" || value === "t" || value === "1";
  }

  return fallback;
}

function mapHeadlineStats(row: Partial<HeadlineStats> | undefined): HeadlineStats {
  return {
    totalDamageEok: toNumber(
      row?.totalDamageEok,
      DEFAULT_DASHBOARD_DATA.headline.totalDamageEok,
    ),
    totalCases: toNumber(row?.totalCases, DEFAULT_DASHBOARD_DATA.headline.totalCases),
    periodStart: toString(
      row?.periodStart,
      DEFAULT_DASHBOARD_DATA.headline.periodStart,
    ),
    periodEnd: toString(row?.periodEnd, DEFAULT_DASHBOARD_DATA.headline.periodEnd),
    dailyAverage: toNumber(
      row?.dailyAverage,
      DEFAULT_DASHBOARD_DATA.headline.dailyAverage,
    ),
    avgDamagePerCaseMan: toNumber(
      row?.avgDamagePerCaseMan,
      DEFAULT_DASHBOARD_DATA.headline.avgDamagePerCaseMan,
    ),
    lastUpdated: toString(
      row?.lastUpdated,
      DEFAULT_DASHBOARD_DATA.headline.lastUpdated,
    ),
  };
}

function mapYearlyData(row: Partial<YearlyData>): YearlyData {
  return {
    year: toNumber(row.year),
    label: toString(row.label),
    cases: toNumber(row.cases),
    damageEok: toNumber(row.damageEok),
    arrests: toNumber(row.arrests),
  };
}

function mapMonthlyData(row: Partial<MonthlyData>): MonthlyData {
  return {
    month: toString(row.month),
    cases: toNumber(row.cases),
    damageEok: toNumber(row.damageEok),
  };
}

function mapFraudType(row: Partial<FraudType>): FraudType {
  return {
    type: toString(row.type),
    percentage: toNumber(row.percentage),
    description: toString(row.description),
  };
}

function mapPlatformBreakdown(row: Partial<PlatformBreakdown>): PlatformBreakdown {
  return {
    platform: toString(row.platform),
    percentage: toNumber(row.percentage),
  };
}

function mapEnforcement(row: Partial<Enforcement>): Enforcement {
  return {
    date: toString(row.date),
    title: toString(row.title),
    damageEok: toNumber(row.damageEok),
    victims: toNumber(row.victims),
    arrests: toNumber(row.arrests),
    source: toString(row.source),
    ...(toBoolean(row.isRegulation) ? { isRegulation: true } : {}),
  };
}

function mapFssInspection(row: Partial<FssInspection> | undefined): FssInspection {
  return {
    totalFirms: toNumber(
      row?.totalFirms,
      DEFAULT_DASHBOARD_DATA.fssInspection.totalFirms,
    ),
    violationFirms: toNumber(
      row?.violationFirms,
      DEFAULT_DASHBOARD_DATA.fssInspection.violationFirms,
    ),
    violationRate: toNumber(
      row?.violationRate,
      DEFAULT_DASHBOARD_DATA.fssInspection.violationRate,
    ),
    year: toNumber(row?.year, DEFAULT_DASHBOARD_DATA.fssInspection.year),
    source: toString(row?.source, DEFAULT_DASHBOARD_DATA.fssInspection.source),
  };
}

function mapMarketContext(row: Partial<MarketContext> | undefined): MarketContext {
  return {
    totalInvestors: toNumber(
      row?.totalInvestors,
      DEFAULT_DASHBOARD_DATA.marketContext.totalInvestors,
    ),
    dailyVolumeBillion: toNumber(
      row?.dailyVolumeBillion,
      DEFAULT_DASHBOARD_DATA.marketContext.dailyVolumeBillion,
    ),
    registeredVASPs: toNumber(
      row?.registeredVASPs,
      DEFAULT_DASHBOARD_DATA.marketContext.registeredVASPs,
    ),
    lastUpdated: toString(
      row?.lastUpdated,
      DEFAULT_DASHBOARD_DATA.marketContext.lastUpdated,
    ),
  };
}

function mapDataSource(row: Partial<DataSource>): DataSource {
  return {
    name: toString(row.name),
    type: toString(row.type),
    url: toString(row.url),
  };
}

function mapNewsItem(row: Partial<NewsItem>): NewsItem {
  return {
    date: toString(row.date),
    title: toString(row.title),
    summary: toString(row.summary),
    category: toString(row.category),
    source: toString(row.source),
    url: toString(row.url),
  };
}

export async function getHeadlineStats(): Promise<HeadlineStats> {
  const rows = await sql`
    SELECT
      total_damage_eok AS "totalDamageEok",
      total_cases AS "totalCases",
      period_start AS "periodStart",
      period_end AS "periodEnd",
      daily_average AS "dailyAverage",
      avg_damage_per_case_man AS "avgDamagePerCaseMan",
      last_updated AS "lastUpdated"
    FROM dashboard_headline
    LIMIT 1
  `;

  return mapHeadlineStats(rows[0] as Partial<HeadlineStats> | undefined);
}

export async function getYearlyTrend(): Promise<YearlyData[]> {
  const rows = await sql`
    SELECT
      year,
      label,
      cases,
      damage_eok AS "damageEok",
      arrests
    FROM dashboard_yearly
    ORDER BY year ASC
  `;

  return rows.map((row) => mapYearlyData(row as Partial<YearlyData>));
}

export async function getMonthlyTrend(): Promise<MonthlyData[]> {
  const rows = await sql`
    SELECT
      month,
      cases,
      damage_eok AS "damageEok"
    FROM dashboard_monthly
    ORDER BY month ASC
  `;

  return rows.map((row) => mapMonthlyData(row as Partial<MonthlyData>));
}

export async function getFraudTypes(): Promise<FraudType[]> {
  const rows = await sql`
    SELECT
      type,
      percentage,
      description
    FROM dashboard_fraud_types
    ORDER BY id ASC
  `;

  return rows.map((row) => mapFraudType(row as Partial<FraudType>));
}

export async function getPlatformBreakdown(): Promise<PlatformBreakdown[]> {
  const rows = await sql`
    SELECT
      platform,
      percentage
    FROM dashboard_platforms
    ORDER BY id ASC
  `;

  return rows.map((row) => mapPlatformBreakdown(row as Partial<PlatformBreakdown>));
}

export async function getEnforcements(): Promise<Enforcement[]> {
  const rows = await sql`
    SELECT
      date,
      title,
      damage_eok AS "damageEok",
      victims,
      arrests,
      source,
      is_regulation AS "isRegulation"
    FROM dashboard_enforcements
    ORDER BY date DESC
  `;

  return rows.map((row) => mapEnforcement(row as Partial<Enforcement>));
}

export async function getMarketContext(): Promise<MarketContext> {
  const rows = await sql`
    SELECT
      total_investors AS "totalInvestors",
      daily_volume_billion AS "dailyVolumeBillion",
      registered_vasps AS "registeredVASPs",
      last_updated AS "lastUpdated"
    FROM dashboard_market_context
    LIMIT 1
  `;

  return mapMarketContext(rows[0] as Partial<MarketContext> | undefined);
}

export async function getDataSources(): Promise<DataSource[]> {
  const rows = await sql`
    SELECT
      name,
      type,
      url
    FROM dashboard_data_sources
    ORDER BY id ASC
  `;

  return rows.map((row) => mapDataSource(row as Partial<DataSource>));
}

export async function getFssInspection(): Promise<FssInspection> {
  const rows = await sql`
    SELECT
      total_firms AS "totalFirms",
      violation_firms AS "violationFirms",
      violation_rate AS "violationRate",
      year,
      source
    FROM dashboard_fss_inspection
    LIMIT 1
  `;

  return mapFssInspection(rows[0] as Partial<FssInspection> | undefined);
}

export async function getRecentEnforcements(limit: number): Promise<Enforcement[]> {
  const normalizedLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;

  if (normalizedLimit === 0) {
    return [];
  }

  const rows = await sql`
    SELECT
      date,
      title,
      damage_eok AS "damageEok",
      victims,
      arrests,
      source,
      is_regulation AS "isRegulation"
    FROM dashboard_enforcements
    WHERE is_regulation = FALSE
    ORDER BY date DESC
    LIMIT ${normalizedLimit}
  `;

  return rows.map((row) => mapEnforcement(row as Partial<Enforcement>));
}

export async function getRegulationTimeline(): Promise<Enforcement[]> {
  const rows = await sql`
    SELECT
      date,
      title,
      damage_eok AS "damageEok",
      victims,
      arrests,
      source,
      is_regulation AS "isRegulation"
    FROM dashboard_enforcements
    WHERE is_regulation = TRUE
    ORDER BY date ASC
  `;

  return rows.map((row) => mapEnforcement(row as Partial<Enforcement>));
}

export async function getNews(): Promise<NewsItem[]> {
  const rows = await sql`
    SELECT
      date,
      title,
      summary,
      category,
      source,
      url
    FROM dashboard_news
    ORDER BY date DESC
  `;

  return rows.map((row) => mapNewsItem(row as Partial<NewsItem>));
}
