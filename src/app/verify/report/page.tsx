"use client";

import { useState } from "react";

/* ─── mock data ─── */
const MOCK = {
  score: 38,
  confidence: "보통",
  userRating: 7,
  summary:
    "입력하신 리딩 환경은 수수료 구조와 운영 기간 측면에서 일부 긍정적 지표를 보이나, 성과 검증 불가 및 손실 대응 패턴에서 중대한 우려 사항이 확인되었습니다. 가입 전 추가 검증을 강력히 권고합니다.",
  categories: [
    { name: "구조", score: 52, weight: "20%", color: "#e8930c" },
    { name: "성과", score: 28, weight: "30%", color: "#e5484d" },
    { name: "행동", score: 31, weight: "30%", color: "#e5484d" },
    { name: "사회", score: 55, weight: "20%", color: "#e8930c" },
  ],
  risks: [
    { text: "주장 승률 85% — 상위 0.3% 운용사 수준으로, 검증 없이는 통계적으로 비현실적입니다", severity: "위험" as const, category: "성과" },
    { text: "손실 콜 삭제 확인 — 투명성이 심각하게 부재합니다", severity: "위험" as const, category: "행동" },
    { text: "비판자 밴 정책 — 에코챔버 구조로 건전한 의사결정이 어렵습니다", severity: "위험" as const, category: "행동" },
    { text: "환불/체험 미보장 + 고액 수수료 — 구조적 추출 위험", severity: "위험" as const, category: "구조" },
    { text: "FOMO 언어 상시 사용 — 의사결정 압박 전술", severity: "주의" as const, category: "사회" },
    { text: "VIP 등급 급격한 가격 차이 — 업셀 유도 구조", severity: "주의" as const, category: "구조" },
    { text: "추정 월 매출 6억원 — 개인 시그널 그룹 규모로 비정상적", severity: "주의" as const, category: "구조" },
    { text: "유튜브 광고 유입 — 유료 채널 의존도 높음", severity: "참고" as const, category: "사회" },
  ],
  imageAnalysis: [
    {
      type: "시그널 캡처",
      findings: [
        "진입가는 명시되어 있으나, 손절가와 목표가가 부재합니다",
        "시그널 근거(기술적 분석, 매크로 등)에 대한 설명이 없습니다",
        "'지금 바로 들어가세요' — 긴급성 언어가 사용되었습니다",
      ],
      completeness: 35,
    },
    {
      type: "수익 인증 캡처",
      findings: [
        "표시된 기간이 최근 7일로 제한되어 있어 체리피킹 가능성이 있습니다",
        "레버리지 포지션의 수익이나, 레버리지 배율이 명시되지 않았습니다",
        "손실 거래 내역이 보이지 않습니다",
      ],
      completeness: 20,
    },
  ],
  context: [
    "입력하신 승률 85%는 글로벌 전문 운용사 상위 0.3%에 해당합니다. Renaissance Technologies의 Medallion Fund가 66% 수준인 것과 비교하면, 검증 없이는 수용하기 어려운 수치입니다.",
    "월 100~300만원 수수료 × 추정 2,000명 이상 멤버 = 월 매출 6억원 이상. 이는 일반적인 개인 시그널 그룹의 규모를 크게 초과합니다.",
    "손실 콜 삭제 + 비판자 밴 조합은 경찰청이 발표한 리딩방 사기 핵심 패턴 5가지 중 2가지에 해당합니다.",
  ],
  recommendations: [
    "이 환경에서의 추가 투자를 즉시 중단하고, 기존 투자금 회수 방안을 검토하시길 권고합니다",
    "운영자에게 검증 가능한 전체 트랙레코드(승리 + 손실 포함)를 요청하세요. 제공을 거부한다면 그 자체가 답입니다",
    "손절 콜이 삭제되고 있다면, 개인적으로 모든 시그널을 기록해두세요. 나중에 실제 승률을 직접 계산할 수 있습니다",
    "유사한 우려를 가진 다른 멤버가 있는지 확인하세요. 단, 방 내에서 질문하기보다 개별적으로 접촉하는 것을 권장합니다",
  ],
};

/* ─── severity badge ─── */
function Badge({ level }: { level: "위험" | "주의" | "참고" | "양호" }) {
  const cls =
    level === "양호"
      ? "text-green bg-green-light"
      : level === "참고"
        ? "text-primary bg-primary-light"
        : level === "주의"
          ? "text-amber bg-amber-light"
          : "text-red bg-red-light";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${cls}`}>
      {level}
    </span>
  );
}

/* ─── score ring ─── */
function ScoreRing({
  score,
  size = 120,
}: {
  score: number;
  size?: number;
}) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score > 60 ? "#0fae7b" : score > 40 ? "#e8930c" : "#e5484d";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#e8ecf2" strokeWidth="8"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold stat-number" style={{ color }}>
          {score}
        </span>
        <span className="text-[10px] text-muted">/100</span>
      </div>
    </div>
  );
}

/* ─── category bar ─── */
function CategoryBar({
  name,
  score,
  weight,
  color,
}: {
  name: string;
  score: number;
  weight: string;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{name}</span>
          <span className="text-[10px] text-muted">{weight}</span>
        </div>
        <span className="text-sm font-bold stat-number" style={{ color }}>
          {score}점
        </span>
      </div>
      <div className="h-2 bg-card-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${score}%`,
            backgroundColor: color,
            transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </div>
    </div>
  );
}

/* ─── main ─── */
export default function ReportPage() {
  const [shared, setShared] = useState(false);

  return (
    <div className="min-h-screen bg-section-bg">
      {/* header */}
      <header className="sticky top-0 z-40 card-glass !rounded-none border-b border-white/40">
        <div className="mx-auto max-w-2xl px-5 h-14 flex items-center justify-between">
          <a href="/" className="font-bold text-foreground tracking-tight">
            Clean Crypto
          </a>
          <span className="text-[11px] text-muted font-medium px-2.5 py-1 bg-muted-light rounded-lg">
            리딩 환경 진단 리포트
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-8 space-y-6">
        {/* ── 1. 진단 요약 ── */}
        <section className="card-elevated p-6 !rounded-2xl animate-fade-in-up">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ScoreRing score={MOCK.score} />
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-lg font-bold text-foreground mb-2">진단 요약</h2>
              <p className="text-sm text-muted leading-relaxed mb-3">
                {MOCK.summary}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-red-light text-red">
                  종합: 주의 필요
                </span>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-muted-light text-muted">
                  신뢰도: {MOCK.confidence}
                </span>
              </div>
            </div>
          </div>

          {/* user rating vs analysis */}
          <div className="mt-5 pt-5 border-t border-card-border">
            <div className="bg-amber-light/50 rounded-xl p-4">
              <p className="text-sm text-foreground">
                <span className="font-bold">당신의 자가 평가: {MOCK.userRating}/10</span>
                <span className="mx-2 text-muted">→</span>
                <span className="font-bold text-red">분석 결과: {(MOCK.score / 10).toFixed(1)}/10</span>
              </p>
              <p className="text-xs text-muted mt-1">
                자가 평가와 분석 결과 사이에 유의미한 차이가 있습니다. 아래 상세 분석을 확인하세요.
              </p>
            </div>
          </div>
        </section>

        {/* ── 2. 영역별 분석 ── */}
        <section className="card-elevated p-6 !rounded-2xl animate-fade-in-up animation-delay-100">
          <h2 className="text-lg font-bold text-foreground mb-5">영역별 분석</h2>
          <div className="space-y-5">
            {MOCK.categories.map((c) => (
              <CategoryBar key={c.name} {...c} />
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-card-border">
            <p className="text-xs text-muted">
              행동(30%)과 성과(30%)가 전체 점수의 60%를 차지합니다.
              이 두 영역의 낮은 점수가 종합 점수에 결정적 영향을 미쳤습니다.
            </p>
          </div>
        </section>

        {/* ── 3. 위험 신호 목록 ── */}
        <section className="card-elevated p-6 !rounded-2xl animate-fade-in-up animation-delay-200">
          <h2 className="text-lg font-bold text-foreground mb-1">위험 신호</h2>
          <p className="text-xs text-muted mb-5">심각도 순으로 정렬됩니다</p>
          <div className="space-y-3">
            {MOCK.risks.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-muted-light/40 rounded-xl">
                <Badge level={r.severity} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">{r.text}</p>
                  <p className="text-[10px] text-muted mt-0.5">영역: {r.category}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. 이미지 분석 ── */}
        <section className="card-elevated p-6 !rounded-2xl animate-fade-in-up animation-delay-300">
          <h2 className="text-lg font-bold text-foreground mb-1">이미지 분석 결과</h2>
          <p className="text-xs text-muted mb-5">업로드된 캡처를 기반으로 분석했습니다</p>
          <div className="space-y-4">
            {MOCK.imageAnalysis.map((img, i) => (
              <div key={i} className="border border-card-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground">{img.type}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted">완성도</span>
                    <span className="text-sm font-bold text-red stat-number">{img.completeness}%</span>
                  </div>
                </div>
                <div className="h-1 bg-card-border rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-red rounded-full"
                    style={{ width: `${img.completeness}%` }}
                  />
                </div>
                <ul className="space-y-1.5">
                  {img.findings.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted">
                      <div className="w-1 h-1 rounded-full bg-muted mt-2 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. 비교 맥락 ── */}
        <section className="card-elevated p-6 !rounded-2xl animate-fade-in-up animation-delay-400">
          <h2 className="text-lg font-bold text-foreground mb-4">비교 맥락</h2>
          <div className="space-y-3">
            {MOCK.context.map((c, i) => (
              <div key={i} className="flex gap-3 text-sm text-muted leading-relaxed">
                <div className="w-5 h-5 rounded-lg bg-primary-light flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[9px] font-bold text-primary-dark">{i + 1}</span>
                </div>
                <p>{c}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. 권고사항 ── */}
        <section className="card-elevated p-6 !rounded-2xl border-l-3 animate-fade-in-up animation-delay-500"
          style={{ borderLeftWidth: "3px", borderLeftColor: "var(--color-red)" }}
        >
          <h2 className="text-lg font-bold text-foreground mb-1">권고사항</h2>
          <p className="text-xs text-muted mb-4">
            종합 점수 38점 — 이 환경에서의 투자를 재고하시길 권고합니다
          </p>
          <div className="space-y-3">
            {MOCK.recommendations.map((r, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-red-light flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[9px] font-bold text-red">{i + 1}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{r}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. 방법론 ── */}
        <section className="card-elevated p-6 !rounded-2xl animate-fade-in-up animation-delay-600">
          <h2 className="text-sm font-bold text-foreground mb-3">분석 방법론</h2>
          <div className="text-xs text-muted leading-relaxed space-y-2">
            <p>
              본 분석은 입력하신 정보를 기반으로 4개 영역(구조 20%, 성과 30%, 행동 30%,
              사회 20%)을 가중 평가하여 산출되었습니다. 각 시그널은 양호/주의/위험 3단계로
              분류되며, 특정 레드플래그 조합은 자동 상한(크리티컬 오버라이드)이 적용됩니다.
            </p>
            <p>
              본 진단은 입력된 정보에 기반한 패턴 분석이며, 특정 서비스에 대한 평가가 아닙니다.
              투자 결정은 반드시 본인의 판단과 추가 조사를 통해 이루어져야 합니다.
            </p>
          </div>
        </section>

        {/* ── share ── */}
        <div className="pt-2 pb-12 space-y-3">
          <button
            onClick={() => setShared(true)}
            className="group w-full py-4 rounded-2xl bg-primary text-white font-semibold text-base flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/15 cursor-pointer active:scale-[0.98]"
          >
            {shared ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4" />
                </svg>
                링크가 복사되었습니다
              </>
            ) : (
              <>
                진단 결과 공유하기
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </>
            )}
          </button>
          <a
            href="/verify"
            className="w-full py-4 rounded-2xl border border-card-border text-foreground font-semibold text-base flex items-center justify-center gap-2 hover:bg-muted-light transition-all"
          >
            새로운 진단 시작하기
          </a>
        </div>
      </div>
    </div>
  );
}
