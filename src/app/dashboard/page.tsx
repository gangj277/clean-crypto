import type { Metadata } from "next";
import {
  getHeadlineStats,
  getMonthlyTrend,
  getYearlyTrend,
  getFraudTypes,
  getPlatformBreakdown,
  getRecentEnforcements,
  getRegulationTimeline,
  getFssInspection,
  getMarketContext,
  getDataSources,
  getNews,
} from "@/lib/dashboard";
import { MonthlyChart, FraudDonut, PlatformBars, YearlyComparison } from "@/components/dashboard/charts";

export const metadata: Metadata = {
  title: "리딩방 피해 현황 대시보드 | Clean Crypto",
  description:
    "한국 암호화폐 리딩방 사기 피해 통계를 실시간으로 확인하세요. 경찰청·금감원·금융위 공식 데이터 기반.",
  openGraph: {
    title: "리딩방 피해 현황 대시보드 | Clean Crypto",
    description: "2년간 1.3조 원 피해. 한국 리딩방 사기의 실태를 데이터로 봅니다.",
    locale: "ko_KR",
  },
};

function StatCard({
  value,
  unit,
  label,
  sub,
  accent,
}: {
  value: string;
  unit?: string;
  label: string;
  sub?: string;
  accent?: "red" | "amber" | "primary";
}) {
  const accentCls =
    accent === "red"
      ? "text-red"
      : accent === "amber"
        ? "text-amber"
        : "text-primary";
  return (
    <div className="card-elevated p-5 !rounded-2xl">
      <p className="text-xs text-muted mb-2 font-medium">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl md:text-3xl font-extrabold stat-number ${accentCls}`}>
          {value}
        </span>
        {unit && <span className="text-sm font-bold text-muted">{unit}</span>}
      </div>
      {sub && <p className="text-[10px] text-muted/70 mt-1">{sub}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const [
    headline,
    monthly,
    yearly,
    fraudTypes,
    platforms,
    enforcements,
    regulations,
    fss,
    market,
    sources,
    news,
  ] = await Promise.all([
    getHeadlineStats(),
    getMonthlyTrend(),
    getYearlyTrend(),
    getFraudTypes(),
    getPlatformBreakdown(),
    getRecentEnforcements(5),
    getRegulationTimeline(),
    getFssInspection(),
    getMarketContext(),
    getDataSources(),
    getNews(),
  ]);

  const categoryStyle: Record<string, { bg: string; text: string }> = {
    적발: { bg: "bg-red-light", text: "text-red" },
    규제: { bg: "bg-primary-light", text: "text-primary-dark" },
    통계: { bg: "bg-amber-light", text: "text-amber" },
    판결: { bg: "bg-red-light", text: "text-red" },
    플랫폼: { bg: "bg-green-light", text: "text-green" },
  };

  return (
    <div className="min-h-screen bg-section-bg">
      {/* nav */}
      <nav className="sticky top-0 z-50 card-glass !rounded-none border-b border-white/40">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-5 h-14">
          <a href="/" className="font-bold text-lg tracking-tight text-foreground">
            Clean Crypto
          </a>
          <div className="flex items-center gap-5">
            <a href="/dashboard" className="text-sm font-semibold text-primary">대시보드</a>
            <a href="/blog" className="text-sm font-semibold text-muted hover:text-foreground transition-colors">블로그</a>
            <a href="/verify" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">검증하기</a>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-5 pt-10 pb-20">
        {/* header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d95a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>
            </svg>
            <span className="text-xs font-bold text-primary-dark tracking-wide">공식 데이터 종합</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2">
            리딩방 피해 현황
          </h1>
          <p className="text-muted text-base">
            경찰청·금감원·금융위 공식 발표 데이터 기반 · 마지막 업데이트 {headline.lastUpdated}
          </p>
          <p className="text-xs text-muted/60 mt-1">
            구조화 데이터 연 1회 · 보도자료 분기별 · 적발 사건 수시 반영
          </p>
        </div>

        {/* ── news feed ── */}
        <div className="card-elevated p-5 !rounded-2xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1fb8cd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2" />
                <path d="M18 14h-8M18 18h-8M18 10h-8" />
              </svg>
              <h2 className="text-base font-bold text-foreground">최신 소식</h2>
            </div>
            <span className="text-[10px] text-muted font-medium">{news.length}건</span>
          </div>
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {news.map((item, i) => {
              const style = categoryStyle[item.category] || { bg: "bg-muted-light", text: "text-muted" };
              const Wrapper = item.url ? "a" : "div";
              const linkProps = item.url ? { href: item.url, target: "_blank" as const, rel: "noopener noreferrer" } : {};
              return (
                <Wrapper
                  key={i}
                  {...linkProps}
                  className={`flex gap-3 p-3 rounded-xl bg-muted-light/30 hover:bg-muted-light/60 transition-colors group ${item.url ? "cursor-pointer" : ""}`}
                >
                  <div className="shrink-0 pt-0.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${style.bg} ${style.text}`}>
                      {item.category}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-foreground leading-snug mb-0.5 group-hover:text-primary transition-colors">{item.title}</p>
                      {item.url && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8892a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-muted leading-relaxed line-clamp-2">{item.summary}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-muted/60">{item.date}</span>
                      <span className="text-[10px] text-muted/40">·</span>
                      <span className="text-[10px] text-muted/60">{item.source}</span>
                    </div>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </div>

        {/* ── headline stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard
            value={(headline.totalDamageEok / 10000).toFixed(1)}
            unit="조 원"
            label="누적 피해액"
            sub={`${headline.periodStart} ~ ${headline.periodEnd}`}
            accent="red"
          />
          <StatCard
            value={headline.totalCases.toLocaleString()}
            unit="건"
            label="누적 신고 건수"
            sub="경찰청 집계"
            accent="amber"
          />
          <StatCard
            value={String(headline.dailyAverage)}
            unit="건/일"
            label="일일 평균 접수"
            accent="primary"
          />
          <StatCard
            value={(headline.avgDamagePerCaseMan / 10000).toFixed(1)}
            unit="억 원"
            label="건당 평균 피해액"
            sub={`${headline.avgDamagePerCaseMan.toLocaleString()}만 원`}
            accent="amber"
          />
        </div>

        {/* ── market context strip ── */}
        <div className="card-elevated p-4 !rounded-2xl mb-8 flex flex-wrap gap-6 justify-between">
          <div>
            <p className="text-[10px] text-muted mb-0.5">국내 가상자산 투자자</p>
            <p className="text-sm font-bold text-foreground stat-number">
              {(market.totalInvestors / 10000).toLocaleString()}만 명
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted mb-0.5">일일 거래 규모</p>
            <p className="text-sm font-bold text-foreground stat-number">
              {(market.dailyVolumeBillion / 10000).toFixed(1)}조 원
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted mb-0.5">등록 가상자산사업자</p>
            <p className="text-sm font-bold text-foreground stat-number">
              {market.registeredVASPs}개
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted mb-0.5">유사투자자문업 불법 적발</p>
            <p className="text-sm font-bold text-red stat-number">
              {fss.violationFirms}곳 / {fss.totalFirms}곳 ({fss.violationRate}%)
            </p>
          </div>
        </div>

        {/* ── main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* monthly trend — spans 2 cols */}
          <div className="lg:col-span-2 card-elevated p-5 !rounded-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-foreground">월별 피해 추이</h2>
                <p className="text-[11px] text-muted">2024.01 – 2025.12 · 건수 기준</p>
              </div>
              <div className="flex items-center gap-3 text-[9px]">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm bg-primary" />
                  <span className="text-muted">보통</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm bg-amber" />
                  <span className="text-muted">주의</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm bg-red" />
                  <span className="text-muted">심각</span>
                </div>
              </div>
            </div>
            <MonthlyChart data={monthly} />
          </div>

          {/* yearly comparison */}
          <div className="card-elevated p-5 !rounded-2xl">
            <h2 className="text-base font-bold text-foreground mb-1">연도별 비교</h2>
            <p className="text-[11px] text-muted mb-4">피해액 · 건수 · 검거</p>
            <YearlyComparison data={yearly} />
          </div>
        </div>

        {/* ── fraud types + platforms ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="card-elevated p-5 !rounded-2xl">
            <h2 className="text-base font-bold text-foreground mb-1">사기 유형 분포</h2>
            <p className="text-[11px] text-muted mb-5">주요 사기 수법별 비중</p>
            <FraudDonut data={fraudTypes} />
          </div>
          <div className="card-elevated p-5 !rounded-2xl">
            <h2 className="text-base font-bold text-foreground mb-1">플랫폼별 분포</h2>
            <p className="text-[11px] text-muted mb-5">리딩방 운영 채널 비중</p>
            <PlatformBars data={platforms} />

            {/* Telegram callout */}
            <div className="mt-5 bg-primary-light/50 rounded-xl p-3.5 border border-primary/10">
              <p className="text-xs text-foreground font-medium">
                텔레그램이 전체의 {platforms.find(p => p.platform === "텔레그램")?.percentage}%를 차지
              </p>
              <p className="text-[10px] text-muted mt-0.5">
                높은 익명성과 해외 서버로 인해 국내법 적용이 제한적입니다
              </p>
            </div>
          </div>
        </div>

        {/* ── enforcements + regulations ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* recent enforcements */}
          <div className="card-elevated p-5 !rounded-2xl">
            <h2 className="text-base font-bold text-foreground mb-1">주요 적발 사건</h2>
            <p className="text-[11px] text-muted mb-4">최신순 정렬</p>
            <div className="space-y-3">
              {enforcements.map((e, i) => (
                <div
                  key={i}
                  className="p-3.5 bg-muted-light/40 rounded-xl border border-card-border/50"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-muted font-medium">{e.date}</span>
                    <span className="text-[10px] font-semibold text-muted px-2 py-0.5 bg-white rounded-md">
                      {e.source}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-2">{e.title}</p>
                  <div className="flex gap-4 text-[11px]">
                    {e.damageEok > 0 && (
                      <span className="text-red font-bold">{e.damageEok.toLocaleString()}억원</span>
                    )}
                    {e.victims > 0 && (
                      <span className="text-foreground">피해자 {e.victims.toLocaleString()}명</span>
                    )}
                    {e.arrests > 0 && (
                      <span className="text-primary font-medium">검거 {e.arrests}명</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* regulation timeline */}
          <div className="card-elevated p-5 !rounded-2xl">
            <h2 className="text-base font-bold text-foreground mb-1">규제 타임라인</h2>
            <p className="text-[11px] text-muted mb-4">주요 법제도 변화</p>
            <div className="relative pl-6">
              {/* timeline line */}
              <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-card-border" />
              <div className="space-y-5">
                {regulations.map((r, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-6 top-1 w-[18px] h-[18px] rounded-full bg-primary-light border-2 border-primary flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </div>
                    <p className="text-[10px] text-muted font-medium mb-0.5">{r.date}</p>
                    <p className="text-sm font-semibold text-foreground">{r.title}</p>
                    <p className="text-[11px] text-muted mt-0.5">{r.source}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="card-elevated p-6 md:p-8 !rounded-2xl text-center mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-light/30 to-accent-light/30" />
          <div className="relative">
            <h3 className="text-lg font-bold text-foreground mb-2">
              내 리딩 환경은 안전한가요?
            </h3>
            <p className="text-sm text-muted mb-5">
              30초 무료 진단으로 위험 신호를 확인하세요
            </p>
            <a
              href="/verify"
              className="group inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3.5 rounded-2xl text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/15"
            >
              무료 진단 시작하기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* ── data sources ── */}
        <div className="text-center">
          <p className="text-xs text-muted mb-3 font-medium">데이터 출처</p>
          <div className="flex flex-wrap justify-center gap-3">
            {sources.map((s) => (
              <span
                key={s.name}
                className="text-[10px] text-muted/70 px-3 py-1 bg-white rounded-lg border border-card-border"
              >
                {s.name} ({s.type})
              </span>
            ))}
          </div>
          <p className="text-[10px] text-muted/50 mt-3">
            본 대시보드는 공개된 정부 발표 자료를 기반으로 합니다. 실시간 데이터가 아닌 주기적 업데이트 데이터입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
