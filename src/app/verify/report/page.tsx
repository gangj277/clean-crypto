"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

type Risk = "safe" | "caution" | "high" | "critical" | "check";

interface StageResult {
  stage: number;
  label: string;
  pass: boolean;
  score: number;
  findings: { question: string; selectedAnswer: string; risk: Risk; explanation: string }[];
}

interface AnalysisReport {
  overallScore: number;
  verdict: "clean" | "caution" | "danger" | "critical";
  summary: string;
  stages: StageResult[];
  redFlags: { label: string; explanation: string }[];
  crossPatterns: { pattern: string; explanation: string; severity: "caution" | "high" | "critical" }[];
  recommendations: string[];
  context: string[];
  methodology: string;
}

/* ═══════════════════════════════════════════
   Unified color system — single source of truth
   ═══════════════════════════════════════════ */

type Level = "green" | "amber" | "red";

function scoreToLevel(score: number): Level {
  if (score >= 70) return "green";
  if (score >= 40) return "amber";
  return "red";
}

function verdictToLevel(verdict: AnalysisReport["verdict"]): Level {
  if (verdict === "clean") return "green";
  if (verdict === "caution") return "amber";
  return "red";
}

function stageToLevel(stage: StageResult): Level {
  if (stage.stage === 1) return stage.pass ? "green" : "red";
  return scoreToLevel(stage.score);
}

function riskToLevel(risk: Risk): Level {
  if (risk === "safe") return "green";
  if (risk === "caution" || risk === "check") return "amber";
  return "red";
}

const LEVEL_COLOR: Record<Level, string> = { green: "#0fae7b", amber: "#e8930c", red: "#e5484d" };
const LEVEL_BG: Record<Level, string> = { green: "bg-green-light", amber: "bg-amber-light", red: "bg-red-light" };
const LEVEL_TEXT: Record<Level, string> = { green: "text-green", amber: "text-amber", red: "text-red" };

const VERDICT_LABEL: Record<AnalysisReport["verdict"], string> = {
  clean: "안전", caution: "주의 필요", danger: "위험", critical: "즉시 위험",
};
const VERDICT_BG_GRADIENT: Record<AnalysisReport["verdict"], string> = {
  clean: "from-green-light", caution: "from-amber-light", danger: "from-red-light", critical: "from-red-light",
};

const RISK_LABEL: Record<Risk, string> = { safe: "안전", caution: "주의", high: "위험", critical: "즉시 위험", check: "확인 필요" };

/* ═══════════════════════════════════════════
   Stage Icons
   ═══════════════════════════════════════════ */

function StageIcon({ stage, size = 16, color }: { stage: number; size?: number; color?: string }) {
  const c = color ?? "#0d95a8";
  if (stage === 1) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" />
    </svg>
  );
  if (stage === 2) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
  if (stage === 3) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 118 2.83" /><path d="M22 12A10 10 0 0012 2v10z" />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   UI Primitives
   ═══════════════════════════════════════════ */

function RiskBadge({ risk }: { risk: Risk }) {
  const lv = riskToLevel(risk);
  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap ${LEVEL_BG[lv]} ${LEVEL_TEXT[lv]}`}>
      {RISK_LABEL[risk]}
    </span>
  );
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const lv = scoreToLevel(score);
  const color = LEVEL_COLOR[lv];
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="7" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold stat-number" style={{ color }}>{score}</span>
        <span className="text-xs text-muted/50 font-medium">/100</span>
      </div>
    </div>
  );
}

function Expandable({ title, icon, defaultOpen = false, badge, children }: {
  title: string; icon: React.ReactNode; defaultOpen?: boolean; badge?: React.ReactNode; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card-elevated !rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 cursor-pointer active:bg-section-bg/40 transition-colors min-h-[56px]"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {icon}
          <span className="text-[15px] font-bold text-foreground tracking-[-0.02em]">{title}</span>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          {badge}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8892a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>
      <div className={`grid transition-all duration-400 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main
   ═══════════════════════════════════════════ */

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("verify-report");
      if (stored) { setReport(JSON.parse(stored)); return; }
    } catch { /* ignore */ }
    router.replace("/verify");
  }, [router]);

  if (!report) {
    return (
      <div className="min-h-screen bg-section-bg flex items-center justify-center">
        <div className="relative w-8 h-8">
          <svg viewBox="0 0 32 32" className="w-full h-full animate-[spin_1.5s_linear_infinite]">
            <circle cx="16" cy="16" r="12" fill="none" stroke="#e8ecf2" strokeWidth="3" />
            <circle cx="16" cy="16" r="12" fill="none" stroke="#1fb8cd" strokeWidth="3" strokeDasharray="75.4" strokeDashoffset="56" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    );
  }

  const vLevel = verdictToLevel(report.verdict);
  const vColor = LEVEL_COLOR[vLevel];
  const hasRedFlags = report.redFlags.length > 0;
  const isBad = report.verdict === "danger" || report.verdict === "critical";

  return (
    <div className="min-h-screen min-h-[100dvh] bg-section-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 card-glass !rounded-none border-b border-white/40">
        <div className="mx-auto max-w-2xl px-5 h-13 flex items-center justify-between">
          <a href="/" className="font-bold text-foreground tracking-[-0.03em] text-base">Clean Crypto</a>
          <span className="text-xs text-muted font-medium px-2.5 py-1 bg-muted-light rounded-lg">진단 리포트</span>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className={`bg-gradient-to-b ${VERDICT_BG_GRADIENT[report.verdict]} to-section-bg px-5 pt-10 pb-12`}>
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center text-center animate-fade-in-up">
            <ScoreRing score={report.overallScore} size={130} />

            <div className="mt-6 mb-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ backgroundColor: `${vColor}14` }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: vColor }} />
              <span className="text-sm font-bold" style={{ color: vColor }}>
                {VERDICT_LABEL[report.verdict]}
              </span>
            </div>

            <p className="text-[15px] sm:text-base text-foreground/70 leading-relaxed max-w-md mt-2">
              {report.summary}
            </p>
          </div>

          {/* Stage pills */}
          <div className="flex gap-2.5 mt-8 justify-center flex-wrap">
            {report.stages.map((s) => {
              const lv = stageToLevel(s);
              const c = LEVEL_COLOR[lv];
              return (
                <div key={s.stage} className="flex items-center gap-2 px-3.5 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm">
                  <StageIcon stage={s.stage} size={13} color={c} />
                  <span className="text-[13px] font-semibold text-foreground/70">{s.label}</span>
                  <span className="text-[13px] font-bold stat-number" style={{ color: c }}>
                    {s.stage === 1 ? (s.pass ? "OK" : "FAIL") : s.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <div className="mx-auto max-w-2xl px-5 -mt-3 space-y-3.5 pb-8">

        {/* Red flags */}
        {hasRedFlags && (
          <div className="card-elevated !rounded-2xl !border-red/20 p-5 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-red-light flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e5484d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><circle cx="12" cy="16" r="0.5" fill="#e5484d" />
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-red tracking-[-0.02em]">
                  레드플래그 {report.redFlags.length}건 감지
                </p>
                <p className="text-xs text-red/50 mt-0.5">점수와 관계없이 강력 경고 대상</p>
              </div>
            </div>
            <div className="space-y-2">
              {report.redFlags.map((rf, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 bg-red-light/50 rounded-xl">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e5484d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-1">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-red leading-snug">{rf.label}</p>
                    {rf.explanation && <p className="text-[13px] text-red/55 mt-1 leading-relaxed">{rf.explanation}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="card-elevated !rounded-2xl p-5 animate-fade-in-up animation-delay-100"
          style={{ borderLeftWidth: "3px", borderLeftColor: vColor }}>
          <h2 className="text-lg font-bold text-foreground mb-4 tracking-[-0.02em]">
            {isBad ? "지금 해야 할 것" : "권고사항"}
          </h2>
          <div className="space-y-3.5">
            {report.recommendations.map((r, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: `${vColor}12` }}>
                  <span className="text-[10px] font-bold" style={{ color: vColor }}>{i + 1}</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{r}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Expandable details ── */}

        {report.stages.map((stage) => {
          const lv = stageToLevel(stage);
          const c = LEVEL_COLOR[lv];
          const stageRisk: Risk = stage.stage === 1
            ? (stage.pass ? "safe" : "critical")
            : stage.score >= 70 ? "safe" : stage.score >= 40 ? "caution" : "high";

          return (
            <Expandable
              key={stage.stage}
              title={stage.label}
              icon={<StageIcon stage={stage.stage} size={16} color={c} />}
              badge={<RiskBadge risk={stageRisk} />}
            >
              {/* Score bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted font-medium tracking-wide uppercase">
                    {stage.stage === 1 ? "판정" : "신뢰도"}
                  </span>
                  <span className="text-sm font-bold stat-number" style={{ color: c }}>
                    {stage.stage === 1 ? (stage.pass ? "통과" : "불통과") : `${stage.score}/100`}
                  </span>
                </div>
                {stage.stage !== 1 && (
                  <div className="h-1.5 bg-card-border/50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${stage.score}%`, backgroundColor: c, transition: "width 1s cubic-bezier(0.16,1,0.3,1)" }} />
                  </div>
                )}
              </div>

              {/* Findings */}
              <div className="space-y-2.5">
                {stage.findings.map((f, i) => (
                  <div key={i} className="p-4 bg-section-bg/70 rounded-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground leading-snug">{f.question}</p>
                        <p className="text-[13px] text-muted mt-1">{f.selectedAnswer}</p>
                      </div>
                      <RiskBadge risk={f.risk} />
                    </div>
                    {f.explanation && (
                      <p className="text-[13px] text-foreground/55 leading-relaxed mt-3 pt-3 border-t border-card-border/30">{f.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </Expandable>
          );
        })}

        {/* Cross patterns */}
        {report.crossPatterns.length > 0 && (
          <Expandable
            title="교차 패턴 분석"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d95a8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
            }
            badge={<span className="text-[11px] font-bold text-primary bg-primary-light px-2.5 py-1 rounded-lg">{report.crossPatterns.length}건</span>}
          >
            <div className="space-y-2.5">
              {report.crossPatterns.map((cp, i) => {
                const sevLv: Level = cp.severity === "caution" ? "amber" : "red";
                const c = LEVEL_COLOR[sevLv];
                return (
                  <div key={i} className="p-4 rounded-xl border" style={{ borderColor: `${c}20`, backgroundColor: `${c}06` }}>
                    <p className="text-sm font-semibold leading-snug" style={{ color: c }}>{cp.pattern}</p>
                    <p className="text-[13px] text-foreground/55 leading-relaxed mt-1.5">{cp.explanation}</p>
                  </div>
                );
              })}
            </div>
          </Expandable>
        )}

        {/* Context */}
        {report.context.length > 0 && (
          <Expandable
            title="비교 맥락"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d95a8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            }
          >
            <div className="space-y-3">
              {report.context.map((c, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-lg bg-primary-light flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[9px] font-bold text-primary-dark">{i + 1}</span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">{c}</p>
                </div>
              ))}
            </div>
          </Expandable>
        )}

        {/* Methodology */}
        <Expandable
          title="분석 방법론"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8892a5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
            </svg>
          }
        >
          <div className="text-[13px] text-muted leading-relaxed space-y-3">
            <p>{report.methodology}</p>
            <p>본 진단은 입력된 정보에 기반한 패턴 분석이며, 특정 서비스에 대한 법적 평가가 아닙니다. 투자 결정은 반드시 본인의 판단과 추가 조사를 통해 이루어져야 합니다.</p>
          </div>
        </Expandable>

        {/* Actions */}
        <div className="pt-4 pb-6 pb-safe space-y-3">
          <button
            onClick={() => setShared(true)}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-[15px] flex items-center justify-center gap-2.5 hover:bg-primary-dark transition-all shadow-lg shadow-primary/12 cursor-pointer active:scale-[0.98] min-h-[52px]"
          >
            {shared ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4" /></svg>
                링크가 복사되었습니다
              </>
            ) : (
              <>
                진단 결과 공유하기
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </>
            )}
          </button>
          <a
            href="/verify"
            className="w-full py-4 rounded-2xl border border-card-border text-foreground font-bold text-[15px] flex items-center justify-center gap-2.5 hover:bg-muted-light active:bg-section-bg transition-all min-h-[52px]"
          >
            새로운 진단 시작하기
          </a>
        </div>
      </div>
    </div>
  );
}
