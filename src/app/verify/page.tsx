"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════
   Data definitions
   ═══════════════════════════════════════════ */

type QId = "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "q7" | "q8" | "q9";
type Risk = "safe" | "caution" | "high" | "critical" | "check";
type Answers = Partial<Record<QId, number>>;

interface Option {
  label: string;
  risk: Risk;
  note?: string;
  redFlag?: boolean;
}

interface QuestionDef {
  id: QId;
  stage: 1 | 2 | 3;
  title: string;
  description?: string;
  tip?: string;
  options: Option[];
}

const STAGES = [
  { id: 1, label: "스캠 판별", desc: "이것만 걸려도 위험합니다" },
  { id: 2, label: "성과 투명성", desc: "실력인지 연출인지 구분합니다" },
  { id: 3, label: "운영 행동", desc: "장기적 위험 신호를 확인합니다" },
] as const;

const QUESTIONS: QuestionDef[] = [
  {
    id: "q1", stage: 1,
    title: "대리매매 또는 자동매매 권유가 있나요?",
    description: '"돈을 맡기면 대신 매매해준다", "자동매매 시스템에 넣으면 된다" 같은 제안이 있었나요?',
    options: [
      { label: "없음 — 매매는 본인이 직접", risk: "safe", note: "정상적인 리딩방의 기본" },
      { label: "자동매매 봇 연동 권유", risk: "high", note: "카피트레이딩 사기 가능성 주의" },
      { label: "대리매매 / 자금 위탁 권유", risk: "critical", note: "돈을 맡기는 순간 통제권 상실", redFlag: true },
    ],
  },
  {
    id: "q2", stage: 1,
    title: "자금 요구 또는 출금 불가 유도가 있나요?",
    description: '"출금하려면 추가 입금이 필요하다", "해당 거래소에만 넣어야 한다" 같은 요구가 있었나요?',
    options: [
      { label: "없음", risk: "safe" },
      { label: "특정 거래소 가입 유도 (레퍼럴)", risk: "caution", note: "레퍼럴 수익 목적일 수 있음" },
      { label: "자금 입금 요구 / 출금 조건 추가 입금", risk: "critical", note: "어떤 명목이든 100% 사기", redFlag: true },
    ],
  },
  {
    id: "q3", stage: 1,
    title: "사용하는 거래소가 어디인가요?",
    description: "운영자가 추천하거나 사용하는 거래소를 선택하세요.",
    options: [
      { label: "대형 거래소 (바이낸스, 바이빗, OKX 등)", risk: "safe", note: "검증된 거래소" },
      { label: "중형 거래소 (빙엑스, 게이트 등)", risk: "caution", note: "대체로 괜찮으나 확인 필요" },
      { label: "소형·비인가 거래소", risk: "critical", note: "레퍼럴 수수료 목적 + 안전성 리스크", redFlag: true },
      { label: "잘 모름", risk: "check", note: "확인을 권장합니다" },
    ],
  },
  {
    id: "q4", stage: 2,
    title: "수익인증 방식이 어떤 형태인가요?",
    description: "운영자가 수익을 보여주는 방식을 선택하세요.",
    tip: "\"사전에 공유했는가\" + \"공개 채널이었는가\" — 이 두 가지가 모두 Yes여야 진짜 실력 검증이 됩니다.",
    options: [
      { label: "사전 공유 → 결과 인증 (공개 채널)", risk: "safe", note: "유일하게 검증 가능한 방식" },
      { label: "사전 공유 → 결과 인증 (비공개방)", risk: "caution", note: "조작·선택적 공개가 쉬움" },
      { label: '사후 "했제" 인증 (결과만)', risk: "high", note: "누구나 할 수 있음 — 의미 없음" },
      { label: '적중 과대 포장 반복', risk: "critical", note: "소수 적중을 과대 포장하는 전형적 패턴" },
    ],
  },
  {
    id: "q5", stage: 2,
    title: "주장하는 승률이 현실적인가요?",
    tip: "승률 자체보다 \"손익비\"가 중요합니다. 승률만 앞세우는 곳은 본질을 모르거나 일부러 숨기는 것일 수 있습니다.",
    options: [
      { label: "현실적 범위 (50~70%)", risk: "safe", note: "실전에서 충분히 가능" },
      { label: "높은 편 (70~85%)", risk: "caution", note: "지속적이라면 검증 필요" },
      { label: "비현실적 (85% 이상)", risk: "high", note: "장기 유지 거의 불가능" },
      { label: "90% 이상 주장", risk: "critical", note: "실전에서 불가능한 수치" },
    ],
  },
  {
    id: "q6", stage: 2,
    title: "손실이 난 콜에 대해 어떻게 대응하나요?",
    options: [
      { label: "승리·손실 모두 공개 + 복기", risk: "safe", note: "가장 이상적인 운영" },
      { label: "둘 다 공개하지만 복기 없음", risk: "caution", note: "투명하긴 하나 개선 의지 부족" },
      { label: "주로 승리만 공개", risk: "high", note: "선택적 공개 = 승률 조작 효과" },
      { label: "손실 삭제 / 승리만 남김", risk: "critical", note: "전형적 사기 패턴", redFlag: true },
    ],
  },
  {
    id: "q7", stage: 3,
    title: "과시형 콘텐츠가 있나요?",
    description: "슈퍼카, 명품, 현금 다발 등 과시성 콘텐츠가 있나요?",
    options: [
      { label: "없음 — 분석·교육 중심", risk: "safe", note: "실력으로 보여주는 방" },
      { label: "가끔 (라이프스타일 공유)", risk: "caution", note: "개인 취향일 수 있음" },
      { label: "자주 — 과시가 더 많음", risk: "high", note: "이미지로 유입시키는 구조" },
      { label: "메인 콘텐츠가 과시", risk: "critical", note: '"부자 이미지"를 판매하는 구조' },
    ],
  },
  {
    id: "q8", stage: 3,
    title: "회원과 운영자 간 소통은 어떤가요?",
    options: [
      { label: "토론방 있음 (질문·의견 자유)", risk: "safe", note: "건강한 커뮤니티의 기본" },
      { label: "토론방 있지만 활발하지 않음", risk: "caution", note: "형식적일 수 있음" },
      { label: "일방향 채널 (공지만)", risk: "high", note: "비판 통로 없으면 은폐 쉬움" },
      { label: "일방향 + 비판 시 밴/강퇴", risk: "critical", note: "통제형 운영 — 은폐 목적", redFlag: true },
    ],
  },
  {
    id: "q9", stage: 3,
    title: "등급 업그레이드 유도가 있나요?",
    description: "무료방 → 유료방 → VIP 같은 등급 구조가 있나요?",
    options: [
      { label: "단일 등급", risk: "safe", note: "투명한 구조" },
      { label: "2단계 (무료 + 유료)", risk: "caution", note: "일반적인 운영 모델" },
      { label: "VIP/프리미엄 별도", risk: "high", note: "추가 결제 압박 가능" },
      { label: "3단계 이상 + 지속 유도", risk: "critical", note: "등급 판매 의존 구조" },
    ],
  },
];

/* ═══════════════════════════════════════════
   Stage SVG Icons
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
   Analysis logic
   ═══════════════════════════════════════════ */

const RISK_LABEL: Record<Risk, string> = {
  safe: "안전", caution: "주의", high: "위험", critical: "즉시 위험", check: "확인 필요",
};
const RISK_CLS: Record<Risk, string> = {
  safe: "text-green bg-green-light",
  caution: "text-amber bg-amber-light",
  high: "text-red bg-red-light",
  critical: "text-red bg-red-light",
  check: "text-primary bg-primary-light",
};

interface Finding { label: string; risk: Risk; note?: string }
interface StageAnalysis {
  stage: number;
  label: string;
  pass: boolean;
  score?: number;
  findings: Finding[];
  redFlagsTriggered: string[];
}

function getStageFindings(answers: Answers, stage: number): Finding[] {
  return QUESTIONS
    .filter((q) => q.stage === stage && answers[q.id] !== undefined)
    .map((q) => {
      const opt = q.options[answers[q.id]!];
      return { label: `${q.title.replace(/\?|가 있나요|이 있나요|인가요|하나요/g, "").trim()}`, risk: opt.risk, note: opt.note };
    });
}

function getRedFlags(answers: Answers): string[] {
  const flags: string[] = [];
  for (const q of QUESTIONS) {
    const idx = answers[q.id];
    if (idx !== undefined && q.options[idx].redFlag) flags.push(q.options[idx].label);
  }
  return flags;
}

function scoreStage(answers: Answers, stage: number): number {
  const qs = QUESTIONS.filter((q) => q.stage === stage);
  const weights = stage === 2 ? [40, 30, 30] : [30, 40, 30];
  let total = 0;
  qs.forEach((q, i) => {
    const idx = answers[q.id];
    if (idx === undefined) return;
    const riskScore: Record<Risk, number> = { safe: 100, caution: 65, check: 50, high: 25, critical: 0 };
    total += (riskScore[q.options[idx].risk] * weights[i]) / 100;
  });
  return Math.round(total);
}

function analyzeStage(answers: Answers, stage: number): StageAnalysis {
  const stageInfo = STAGES[stage - 1];
  const findings = getStageFindings(answers, stage);
  const redFlags = getRedFlags(answers).filter((f) => {
    const q = QUESTIONS.find((qq) => qq.options.some((o) => o.label === f && o.redFlag));
    return q && q.stage === stage;
  });
  if (stage === 1) return { stage, label: stageInfo.label, pass: redFlags.length === 0, findings, redFlagsTriggered: redFlags };
  return { stage, label: stageInfo.label, pass: true, score: scoreStage(answers, stage), findings, redFlagsTriggered: redFlags };
}

/* ═══════════════════════════════════════════
   UI Primitives
   ═══════════════════════════════════════════ */

function RiskBadge({ risk }: { risk: Risk }) {
  return (
    <span className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap ${RISK_CLS[risk]}`}>
      {RISK_LABEL[risk]}
    </span>
  );
}

function OptionCard({ option, selected, onClick }: { option: Option; selected: boolean; onClick: () => void }) {
  const borderCls = selected
    ? option.risk === "safe" ? "border-green/25 bg-green-light/40"
      : option.risk === "caution" || option.risk === "check" ? "border-amber/25 bg-amber-light/40"
      : "border-red/25 bg-red-light/40"
    : "border-card-border/80 bg-white hover:border-card-border hover:bg-section-bg/60 active:bg-section-bg";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer active:scale-[0.985] overflow-hidden min-h-[56px] ${borderCls} ${selected ? "animate-answer-lock" : ""}`}
    >
      <div className="flex">
        {/* Risk color bar */}
        <div
          className="w-1 shrink-0 self-stretch rounded-l-xl sm:rounded-l-2xl"
          style={{ backgroundColor: option.risk === "safe" ? "#0fae7b" : option.risk === "caution" || option.risk === "check" ? "#e8930c" : "#e5484d" }}
        />
        <div className="flex-1 p-3 sm:p-4 pl-3 sm:pl-4">
          {/* Mobile: badge below label. Desktop: badge beside label */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-3">
            <div className="flex-1 min-w-0">
              <p className={`text-[13px] font-semibold leading-snug tracking-[-0.01em] ${selected ? "text-foreground" : "text-foreground/85"}`}>
                {option.label}
              </p>
              {option.note && (
                <p className="text-[11px] text-muted mt-0.5 leading-relaxed">{option.note}</p>
              )}
            </div>
            <RiskBadge risk={option.risk} />
          </div>
          {option.redFlag && (
            <div className="mt-2 pt-2 border-t border-red/10 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#e5484d" opacity="0.12" stroke="#e5484d" strokeWidth="1.5" />
                <line x1="12" y1="9" x2="12" y2="13" stroke="#e5484d" strokeWidth="2" />
                <circle cx="12" cy="16" r="0.5" fill="#e5484d" stroke="#e5484d" strokeWidth="1" />
              </svg>
              <span className="text-[10px] font-bold text-red tracking-wide uppercase">Critical Red Flag</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function AnsweredQuestionCompact({ question, selectedIndex, onClick }: {
  question: QuestionDef; selectedIndex: number; onClick: () => void;
}) {
  const opt = question.options[selectedIndex];
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 bg-section-bg/80 rounded-xl cursor-pointer hover:bg-section-bg active:bg-muted-light transition-colors group border border-transparent hover:border-card-border/60 min-h-[44px]"
    >
      <span className="text-[12px] text-foreground/60 font-medium truncate mr-2 tracking-[-0.01em] flex-1 min-w-0">
        {question.title.replace(/\?$/, "")}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        <RiskBadge risk={opt.risk} />
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted/30 group-hover:text-muted/60 transition-colors hidden sm:block">
          <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
        </svg>
      </div>
    </button>
  );
}

/* ── Stage Analysis Card ── */

function StageAnalysisCard({ analysis }: { analysis: StageAnalysis }) {
  const [open, setOpen] = useState(true);
  const isFail = analysis.stage === 1 && !analysis.pass;

  return (
    <div className={`card-elevated !rounded-xl sm:!rounded-2xl overflow-hidden ${isFail ? "!border-red/20" : ""}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-section-bg/40 active:bg-section-bg/60 transition-colors min-h-[52px]"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className={`w-8 h-8 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${isFail ? "bg-red-light" : "bg-primary-light"}`}>
            {isFail ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e5484d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <line x1="12" y1="9" x2="12" y2="13" /><circle cx="12" cy="16" r="0.5" fill="#e5484d" />
              </svg>
            ) : (
              <StageIcon stage={analysis.stage} size={14} color="#0d95a8" />
            )}
          </div>
          <div className="text-left min-w-0 flex-1">
            <p className="text-[12px] sm:text-[13px] font-bold text-foreground tracking-[-0.02em] truncate">
              Stage {analysis.stage} — {analysis.label}
            </p>
            <p className="text-[10px] sm:text-[11px] text-muted truncate">
              {analysis.stage === 1
                ? (analysis.pass ? "위험 신호 없음" : `즉시 위험 ${analysis.redFlagsTriggered.length}건 감지`)
                : `신뢰도 ${analysis.score}/100`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-2">
          {analysis.stage === 1 ? (
            <RiskBadge risk={analysis.pass ? "safe" : "critical"} />
          ) : (
            <RiskBadge risk={(analysis.score ?? 0) >= 70 ? "safe" : (analysis.score ?? 0) >= 40 ? "caution" : "high"} />
          )}
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`text-muted/40 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 animate-fade-in space-y-1.5 sm:space-y-2">
          {analysis.redFlagsTriggered.length > 0 && (
            <div className="bg-red-light/80 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-red/10">
              <div className="flex items-center gap-2 mb-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e5484d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><circle cx="12" cy="16" r="0.5" fill="#e5484d" />
                </svg>
                <p className="text-[10px] font-bold text-red tracking-wide uppercase">Red Flags Detected</p>
              </div>
              {analysis.redFlagsTriggered.map((f) => (
                <div key={f} className="flex items-start gap-2 mb-1.5 last:mb-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#e5484d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span className="text-[11px] text-red font-medium leading-snug">{f}</span>
                </div>
              ))}
            </div>
          )}

          {analysis.findings.map((f, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 bg-section-bg/60 rounded-lg sm:rounded-xl gap-2">
              <span className="text-[11px] text-foreground/80 font-medium tracking-[-0.01em] truncate flex-1 min-w-0">{f.label}</span>
              <RiskBadge risk={f.risk} />
            </div>
          ))}

          {analysis.score !== undefined && (
            <div className="pt-2 px-0.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-muted font-medium tracking-wide uppercase">Trust Score</span>
                <span className={`text-sm font-extrabold stat-number ${
                  analysis.score >= 70 ? "text-green" : analysis.score >= 40 ? "text-amber" : "text-red"
                }`}>
                  {analysis.score}
                </span>
              </div>
              <div className="h-1.5 bg-card-border/60 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${analysis.score}%`,
                    backgroundColor: analysis.score >= 70 ? "#0fae7b" : analysis.score >= 40 ? "#e8930c" : "#e5484d",
                    transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Analyzing indicator ── */

function AnalyzingIndicator({ stage, stageLabel, questions }: { stage: number; stageLabel: string; questions: string[] }) {
  return (
    <div className="py-8 sm:py-10 animate-fade-in">
      <div className="flex flex-col items-center mb-6 sm:mb-8">
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 mb-3 sm:mb-4">
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-primary/8 animate-pulse-soft" />
          <div className="absolute inset-0 flex items-center justify-center">
            <StageIcon stage={stage} size={20} color="#1fb8cd" />
          </div>
          <svg viewBox="0 0 56 56" className="absolute inset-0 w-full h-full animate-[spin_3s_linear_infinite]">
            <circle cx="28" cy="4" r="2" fill="#1fb8cd" opacity="0.6" />
          </svg>
        </div>
        <p className="text-[13px] sm:text-sm font-semibold text-foreground tracking-[-0.02em]">{stageLabel} 분석 중</p>
        <div className="flex items-center gap-1 mt-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-primary" style={{ animation: `pulse-soft 1.4s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
      <div className="max-w-xs mx-auto space-y-2">
        {questions.map((q, i) => (
          <div key={q} className="flex items-center gap-2.5 animate-fade-in" style={{ animationDelay: `${i * 400}ms` }}>
            <div className="w-5 h-5 rounded-md bg-primary-light flex items-center justify-center shrink-0">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0d95a8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <span className="text-[11px] text-muted tracking-[-0.01em] leading-snug">{q}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Final loading ── */

function FinalLoading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-5">
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-8 sm:mb-10">
        <svg viewBox="0 0 112 112" className="w-full h-full">
          <circle cx="56" cy="56" r="50" fill="none" stroke="#e8ecf2" strokeWidth="1.5" />
          <circle cx="56" cy="56" r="40" fill="none" stroke="#e8ecf2" strokeWidth="1" opacity="0.5" />
          <circle cx="56" cy="56" r="50" fill="none" stroke="#1fb8cd" strokeWidth="2" strokeDasharray="314" strokeDashoffset="235" strokeLinecap="round" className="animate-[spin_3s_linear_infinite] origin-center" />
          <circle cx="56" cy="56" r="40" fill="none" stroke="#0d95a8" strokeWidth="1.5" strokeDasharray="251" strokeDashoffset="188" strokeLinecap="round" className="animate-[spin_4s_linear_infinite_reverse] origin-center" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1fb8cd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
          </svg>
        </div>
      </div>
      <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2 tracking-[-0.03em]">종합 분석 진행 중</h2>
      <p className="text-muted text-[13px] sm:text-sm mb-6 sm:mb-8 tracking-[-0.01em]">3개 영역을 교차 분석하고 있습니다</p>
      <div className="w-full max-w-xs space-y-2.5 sm:space-y-3">
        {[
          { label: "스캠 판별 완료", icon: 1 },
          { label: "성과 투명성 분석", icon: 2 },
          { label: "운영 행동 대조", icon: 3 },
          { label: "종합 리포트 생성", icon: 0 },
        ].map((s, i) => (
          <div key={s.label} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 600}ms` }}>
            <div className="w-6 h-6 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
              {s.icon > 0 ? <StageIcon stage={s.icon} size={12} color="#0d95a8" /> : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0d95a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
                </svg>
              )}
            </div>
            <span className="text-[13px] text-foreground font-medium tracking-[-0.01em]">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════ */

type Phase = "questioning" | "stage-analysis" | "stage-result" | "final-loading";

export default function VerifyPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("questioning");
  const [completedAnalyses, setCompletedAnalyses] = useState<StageAnalysis[]>([]);
  const activeRef = useRef<HTMLDivElement>(null);

  const currentQ = QUESTIONS[currentQIdx];
  const currentStage = currentQ?.stage ?? 3;
  const stageQs = QUESTIONS.filter((q) => q.stage === currentStage);
  const stageStartIdx = QUESTIONS.findIndex((q) => q.stage === currentStage);
  const answeredQsInStage = stageQs.filter((q) => answers[q.id] !== undefined && QUESTIONS.indexOf(q) < currentQIdx);
  const totalAnswered = Object.keys(answers).length;

  useEffect(() => {
    if (phase === "questioning" && activeRef.current) {
      const timer = setTimeout(() => {
        activeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [currentQIdx, phase]);

  const handleAnswer = useCallback((optionIdx: number) => {
    const q = QUESTIONS[currentQIdx];
    setAnswers((prev) => ({ ...prev, [q.id]: optionIdx }));

    setTimeout(() => {
      const isLastInStage = currentQIdx === stageStartIdx + stageQs.length - 1;
      if (isLastInStage) {
        setPhase("stage-analysis");
        setTimeout(() => {
          const analysis = analyzeStage({ ...answers, [q.id]: optionIdx } as Answers, currentStage);
          setCompletedAnalyses((prev) => [...prev, analysis]);
          setPhase("stage-result");
        }, 1800);
      } else {
        setCurrentQIdx((i) => i + 1);
      }
    }, 450);
  }, [currentQIdx, stageStartIdx, stageQs.length, answers, currentStage]);

  const handleReAnswer = useCallback((qIdx: number) => {
    const stage = QUESTIONS[qIdx].stage;
    const toRemove = QUESTIONS.filter((q, i) => q.stage === stage && i >= qIdx).map((q) => q.id);
    setAnswers((prev) => {
      const next = { ...prev };
      for (const id of toRemove) delete next[id];
      return next;
    });
    setCurrentQIdx(qIdx);
  }, []);

  const handleContinueToNextStage = useCallback(async () => {
    if (currentStage >= 3) {
      setPhase("final-loading");

      // Build full answer payload (merge client-side answers into q1-q9 shape)
      const payload: Record<string, number> = {};
      for (const q of QUESTIONS) {
        const val = answers[q.id];
        if (val !== undefined) payload[q.id] = val;
      }

      try {
        // Call analysis API
        const resp = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) throw new Error(`API ${resp.status}`);
        const report = await resp.json();
        sessionStorage.setItem("verify-report", JSON.stringify(report));
      } catch (err) {
        console.error("Analysis API failed:", err);
        // Fallback: store client-side data so report page can still render
        sessionStorage.setItem("verify-answers", JSON.stringify(payload));
        sessionStorage.setItem("verify-analysis", JSON.stringify({ stages: completedAnalyses, redFlags: getRedFlags(answers) }));
      }

      router.push("/verify/report");
    } else {
      setCurrentQIdx(stageStartIdx + stageQs.length);
      setPhase("questioning");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStage, stageStartIdx, stageQs.length, answers, completedAnalyses, router]);

  if (phase === "final-loading") return <FinalLoading />;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 card-glass !rounded-none border-b border-white/40">
        <div className="mx-auto max-w-2xl px-4 sm:px-5 h-12 sm:h-14 flex items-center justify-between">
          <a href="/" className="font-bold text-foreground tracking-[-0.03em] text-[15px]">Clean Crypto</a>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((s) => {
                const done = completedAnalyses.some((a) => a.stage === s);
                const active = s === currentStage && !done;
                return (
                  <div key={s} className={`w-2 h-2 rounded-full transition-all duration-500 ${done ? "bg-green" : active ? "bg-primary" : "bg-card-border"}`} />
                );
              })}
            </div>
            <span className="text-[11px] text-muted font-medium tabular-nums">{totalAnswered}/9</span>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="mx-auto max-w-2xl px-4 sm:px-5 pt-4 sm:pt-5 pb-1 sm:pb-2">
        <div className="flex gap-1.5 sm:gap-2">
          {STAGES.map((s) => {
            const stageComplete = completedAnalyses.some((a) => a.stage === s.id);
            const isActive = s.id === currentStage;
            const stageQCount = QUESTIONS.filter((q) => q.stage === s.id).length;
            const stageAnswered = QUESTIONS.filter((q) => q.stage === s.id && answers[q.id] !== undefined).length;
            const pct = stageComplete ? 100 : isActive ? (stageAnswered / stageQCount) * 100 : 0;

            return (
              <div key={s.id} className="flex-1 flex flex-col gap-1.5 sm:gap-2">
                <div className="w-full h-1 rounded-full overflow-hidden bg-card-border/60">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: stageComplete ? "#0fae7b" : "#1fb8cd",
                      transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                    }}
                  />
                </div>
                <div className={`flex items-center gap-1 sm:gap-1.5 ${
                  stageComplete ? "text-green" : isActive ? "text-primary-dark" : "text-muted/30"
                }`}>
                  <StageIcon stage={s.id} size={10} color={stageComplete ? "#0fae7b" : isActive ? "#0d95a8" : "#c8cdd6"} />
                  <span className="text-[9px] sm:text-[10px] font-semibold tracking-[-0.01em]">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 sm:px-5 py-4 sm:py-6">
        {/* Completed stages */}
        {completedAnalyses.length > 0 && (
          <div className="space-y-2 sm:space-y-2.5 mb-5 sm:mb-6">
            {completedAnalyses.map((a) => (
              <StageAnalysisCard key={a.stage} analysis={a} />
            ))}
          </div>
        )}

        {/* Analyzing */}
        {phase === "stage-analysis" && (
          <AnalyzingIndicator
            stage={currentStage}
            stageLabel={STAGES[currentStage - 1].label}
            questions={stageQs.map((q) => q.title.replace(/\?$/, ""))}
          />
        )}

        {/* Stage result */}
        {phase === "stage-result" && (
          <div className="animate-slide-in pb-safe">
            {completedAnalyses.at(-1)?.stage === 1 && !completedAnalyses.at(-1)?.pass && (
              <div className="bg-red-light/50 border border-red/15 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-5">
                <div className="flex items-start sm:items-center gap-3 mb-2">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-red-light flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e5484d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <line x1="12" y1="9" x2="12" y2="13" /><circle cx="12" cy="16" r="0.5" fill="#e5484d" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[13px] sm:text-sm font-bold text-red tracking-[-0.02em]">즉시 위험이 감지되었습니다</p>
                    <p className="text-[11px] text-red/70 mt-0.5 leading-relaxed">
                      이 환경에서의 투자를 즉시 재고하시길 강력히 권고합니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleContinueToNextStage}
              className="group w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-primary text-white font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/12 cursor-pointer active:scale-[0.98] tracking-[-0.02em] min-h-[48px]"
            >
              {currentStage >= 3 ? (
                <>
                  종합 분석 시작
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
                  </svg>
                </>
              ) : (
                <>
                  다음: {(STAGES as readonly {label: string}[])[currentStage]?.label}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}

        {/* Question flow */}
        {phase === "questioning" && (
          <div className="animate-fade-in">
            {/* Stage header */}
            <div className="mb-5 sm:mb-7">
              <div className="flex items-center gap-2 sm:gap-2.5 mb-1">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary-light/80 flex items-center justify-center">
                  <StageIcon stage={currentStage} size={12} color="#0d95a8" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-primary-dark tracking-widest uppercase">
                  Stage {String(currentStage).padStart(2, "0")}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-foreground tracking-[-0.03em] mt-1.5 sm:mt-2">
                {STAGES[currentStage - 1].label}
              </h1>
              <p className="text-[12px] sm:text-[13px] text-muted mt-0.5 tracking-[-0.01em]">{STAGES[currentStage - 1].desc}</p>
            </div>

            {/* Answered questions */}
            {answeredQsInStage.length > 0 && (
              <div className="space-y-1.5 mb-4 sm:mb-5">
                {answeredQsInStage.map((q) => (
                  <AnsweredQuestionCompact
                    key={q.id}
                    question={q}
                    selectedIndex={answers[q.id]!}
                    onClick={() => handleReAnswer(QUESTIONS.indexOf(q))}
                  />
                ))}
              </div>
            )}

            {/* Active question */}
            <div ref={activeRef} className="animate-slide-in scroll-mt-28 sm:scroll-mt-32" key={currentQ.id}>
              <div className="mb-4 sm:mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-md bg-section-bg flex items-center justify-center">
                    <span className="text-[9px] font-bold text-muted/60 tabular-nums">{currentQIdx + 1}</span>
                  </div>
                  <div className="h-px flex-1 bg-card-border/40" />
                </div>
                <h2 className="text-[15px] sm:text-[17px] font-bold text-foreground leading-snug tracking-[-0.025em]">
                  {currentQ.title}
                </h2>
                {currentQ.description && (
                  <p className="text-[12px] sm:text-[13px] text-muted mt-1 sm:mt-1.5 leading-relaxed tracking-[-0.01em]">{currentQ.description}</p>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentQ.options.map((opt, i) => (
                  <OptionCard
                    key={i}
                    option={opt}
                    selected={answers[currentQ.id] === i}
                    onClick={() => { if (answers[currentQ.id] === undefined) handleAnswer(i); }}
                  />
                ))}
              </div>

              {/* Tip */}
              {currentQ.tip && (
                <div className="mt-4 sm:mt-5 bg-primary-light/40 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary/8">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0d95a8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                    </div>
                    <p className="text-[11px] text-primary-dark/80 leading-relaxed tracking-[-0.01em]">{currentQ.tip}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom safe area spacer */}
            <div className="h-16 sm:h-20 pb-safe" />
          </div>
        )}
      </div>
    </div>
  );
}
