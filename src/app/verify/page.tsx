"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ─────────── types ─────────── */

interface FormData {
  platform: string;
  duration: string;
  memberCount: string;
  discovery: string[];
  fee: string;
  tierStructure: string;
  trialRefund: string;
  lockIn: string;
  referral: string;
  signalType: string[];
  leverage: string;
  signalFrequency: string;
  claimedWinRate: string;
  winLossPosted: string;
  trackRecord: string;
  lossHandling: string;
  fomoFrequency: string;
  criticismTolerance: string;
  operatorDisclosure: string;
  crossSelling: string;
  communityTone: string[];
  membershipDuration: string;
  actualResult: string;
  biggestConcern: string;
  trustRating: number;
}

const INIT: FormData = {
  platform: "", duration: "", memberCount: "", discovery: [],
  fee: "", tierStructure: "", trialRefund: "", lockIn: "", referral: "",
  signalType: [], leverage: "", signalFrequency: "", claimedWinRate: "", winLossPosted: "", trackRecord: "",
  lossHandling: "", fomoFrequency: "", criticismTolerance: "", operatorDisclosure: "", crossSelling: "", communityTone: [],
  membershipDuration: "", actualResult: "", biggestConcern: "", trustRating: 5,
};

const STAGES = [
  { id: 1, label: "리딩 환경", desc: "기본 정보" },
  { id: 2, label: "수수료 구조", desc: "경제 모델" },
  { id: 3, label: "시그널 & 성과", desc: "주장 검증" },
  { id: 4, label: "행동 패턴", desc: "운영 방식" },
  { id: 5, label: "내 경험", desc: "종합 평가" },
];

/* ─────────── primitives ─────────── */

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer active:scale-[0.97] ${
        selected
          ? "bg-primary-light text-primary-dark border border-primary/25 shadow-sm"
          : "bg-muted-light text-muted border border-transparent hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );
}

function ChipGroup({ options, value, onChange, multi = false }: {
  options: string[]; value: string | string[]; onChange: (v: string | string[]) => void; multi?: boolean;
}) {
  const selected = Array.isArray(value) ? value : [value];
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Chip
          key={opt}
          label={opt}
          selected={selected.includes(opt)}
          onClick={() => {
            if (multi) {
              const arr = selected.includes(opt) ? selected.filter((v) => v !== opt) : [...selected, opt];
              onChange(arr);
            } else {
              onChange(opt);
            }
          }}
        />
      ))}
    </div>
  );
}

function Q({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
      {sub && <p className="text-xs text-muted mb-3">{sub}</p>}
      {!sub && <div className="mb-3" />}
      {children}
    </div>
  );
}

function Severity({ level }: { level: "양호" | "주의" | "위험" }) {
  const cls = level === "양호" ? "text-green bg-green-light" : level === "주의" ? "text-amber bg-amber-light" : "text-red bg-red-light";
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${cls}`}>{level}</span>;
}

/* ─────────── analysis generators ─────────── */

interface Finding { label: string; level: "양호" | "주의" | "위험" }

function getAnalysis1(data: FormData): { title: string; summary: string; findings: Finding[] } {
  const findings: Finding[] = [];
  if (data.platform === "텔레그램") findings.push({ label: "익명성 높은 플랫폼", level: "주의" });
  if (data.platform === "카카오톡") findings.push({ label: "국내 규제 협조 플랫폼", level: "양호" });
  if (["3개월 미만", "3~6개월"].includes(data.duration)) findings.push({ label: "운영 이력 부족", level: "위험" });
  if (["1~2년", "2년 이상"].includes(data.duration)) findings.push({ label: "장기 운영 이력", level: "양호" });
  if (data.memberCount === "2,000명 이상") findings.push({ label: "대규모 멤버 — 관리 한계 가능성", level: "주의" });
  if (data.discovery.includes("SNS 광고") || data.discovery.includes("유튜브")) findings.push({ label: "유료 광고 유입 채널", level: "주의" });
  if (data.discovery.includes("지인 추천")) findings.push({ label: "신뢰 기반 유입", level: "양호" });

  const riskCount = findings.filter(f => f.level === "위험").length;
  const cautionCount = findings.filter(f => f.level === "주의").length;
  const summary = riskCount > 0 ? `위험 ${riskCount}건, 주의 ${cautionCount}건 탐지` : cautionCount > 0 ? `주의 ${cautionCount}건 탐지` : "특이사항 없음";

  return { title: "환경 프로필", summary, findings };
}

function getAnalysis2(data: FormData): { title: string; summary: string; findings: Finding[]; revenue?: string } {
  const findings: Finding[] = [];
  if (["100~300만원", "300만원 이상"].includes(data.fee)) findings.push({ label: "고액 수수료 — 성과 검증 없이는 과도", level: "위험" });
  if (data.trialRefund === "없음") findings.push({ label: "환불/체험 미보장", level: "위험" });
  if (data.tierStructure === "VIP/프리미엄 별도") findings.push({ label: "급격한 등급 차이 — 업셀 유도 가능성", level: "주의" });
  if (data.referral === "다단계 구조") findings.push({ label: "모집 중심 수익 구조 — 피라미드 의심", level: "위험" });
  if (data.referral === "없음") findings.push({ label: "추천인 구조 없음", level: "양호" });
  if (data.lockIn === "평생 이용권 판매") findings.push({ label: "평생 이용권 — 장기 락인", level: "주의" });
  if (data.fee === "무료") findings.push({ label: "무료 — 수수료 리스크 없음", level: "양호" });

  const feeMap: Record<string, number> = { "30만원 미만": 20, "30~100만원": 65, "100~300만원": 200, "300만원 이상": 400 };
  const memberMap: Record<string, number> = { "50명 미만": 30, "50~200명": 120, "200~500명": 350, "500~2,000명": 1000, "2,000명 이상": 3000 };
  const est = (feeMap[data.fee] || 0) * (memberMap[data.memberCount] || 0);
  const revenue = est > 0 ? (est >= 10000 ? `${(est / 10000).toFixed(1)}억원` : `${est.toLocaleString()}만원`) : undefined;

  const riskCount = findings.filter(f => f.level === "위험").length;
  const summary = revenue && est > 5000 ? `추정 월 매출 ${revenue} — 비정상적 규모` : riskCount > 0 ? `구조적 위험 ${riskCount}건` : "구조 양호";

  return { title: "수수료 구조", summary, findings, revenue: est > 5000 ? revenue : undefined };
}

function getAnalysis3(data: FormData): { title: string; summary: string; findings: Finding[] } {
  const findings: Finding[] = [];
  if (["80~90%", "90% 이상"].includes(data.claimedWinRate)) findings.push({ label: `승률 ${data.claimedWinRate} 주장 — 통계적으로 비현실적`, level: "위험" });
  if (data.claimedWinRate === "70~80%") findings.push({ label: "승률 70~80% — 높은 수준, 검증 필요", level: "주의" });
  if (data.claimedWinRate === "구체적 수치 미공개") findings.push({ label: "승률 미공개 — 오히려 현실적 신호", level: "양호" });
  if (data.winLossPosted === "승리만 게시") findings.push({ label: "선택적 공개 — 가장 흔한 조작 기법", level: "위험" });
  if (data.winLossPosted === "둘 다 공개") findings.push({ label: "승리/손실 모두 공개", level: "양호" });
  if (data.trackRecord === "공개 기록 없음") findings.push({ label: "검증 가능한 트랙레코드 부재", level: "위험" });
  if (data.leverage === "20배 이상") findings.push({ label: "고레버리지 추천 — 극고위험", level: "위험" });
  if (data.signalFrequency === "15개 이상") findings.push({ label: "과도한 시그널 빈도 — 체리피킹 용이", level: "주의" });

  const riskCount = findings.filter(f => f.level === "위험").length;
  const summary = riskCount >= 2 ? `성과 주장에서 중대 위험 ${riskCount}건` : riskCount === 1 ? "성과 주장 검증 필요" : "성과 주장 양호";

  return { title: "시그널 & 성과", summary, findings };
}

function getAnalysis4(data: FormData): { title: string; summary: string; findings: Finding[] } {
  const findings: Finding[] = [];
  if (data.lossHandling === "삭제") findings.push({ label: "손실 콜 삭제 → 투명성 심각 부재", level: "위험" });
  if (data.lossHandling === "복기 및 리뷰") findings.push({ label: "손실 복기 수행 → 전문적 운영", level: "양호" });
  if (data.lossHandling === "시장/팔로워 탓") findings.push({ label: "책임 전가 패턴", level: "위험" });
  if (data.criticismTolerance === "비판자 밴") findings.push({ label: "비판 차단 → 통제 구조 의심", level: "위험" });
  if (data.criticismTolerance === "자유 토론") findings.push({ label: "개방적 토론 문화", level: "양호" });
  if (data.fomoFrequency === "주된 영업 방식") findings.push({ label: "FOMO 언어 상시 → 조작 전술", level: "위험" });
  if (data.crossSelling === "그게 본업인 듯") findings.push({ label: "크로스셀링 중심 운영", level: "주의" });
  if (data.communityTone.includes("맹신적")) findings.push({ label: "맹신적 분위기", level: "위험" });
  if (data.communityTone.includes("분석적")) findings.push({ label: "분석적 토론 문화", level: "양호" });

  const riskCount = findings.filter(f => f.level === "위험").length;
  const summary = riskCount >= 2 ? `행동 패턴 중대 위험 ${riskCount}건` : riskCount === 1 ? "행동 패턴 주의 필요" : "행동 패턴 양호";

  return { title: "행동 패턴", summary, findings };
}

/* ─────────── collapsible analysis card ─────────── */

function CollapsedAnalysis({ title, summary, findings, defaultOpen = false, revenue }: {
  title: string; summary: string; findings: Finding[]; defaultOpen?: boolean; revenue?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const worstLevel = findings.some(f => f.level === "위험") ? "위험" : findings.some(f => f.level === "주의") ? "주의" : "양호";

  return (
    <div className="card-elevated !rounded-2xl overflow-hidden transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-muted-light/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0d95a8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted truncate">{summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Severity level={worstLevel} />
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8892a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 animate-fade-in">
          {revenue && (
            <div className="bg-section-bg rounded-xl p-3 mb-2.5">
              <p className="text-[11px] text-muted">추정 월 매출</p>
              <p className="text-base font-extrabold text-foreground stat-number">{revenue}</p>
              <p className="text-[10px] text-amber font-medium mt-0.5">개인 시그널 그룹으로 비정상적 규모</p>
            </div>
          )}
          <div className="space-y-1.5">
            {findings.map((f, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-2.5 bg-muted-light/40 rounded-lg">
                <span className="text-xs text-foreground">{f.label}</span>
                <Severity level={f.level} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────── analyzing indicator ─────────── */

function AnalyzingIndicator({ stageLabel }: { stageLabel: string }) {
  return (
    <div className="flex items-center gap-3 py-6 justify-center animate-fade-in">
      <div className="relative w-8 h-8">
        <svg viewBox="0 0 32 32" className="w-full h-full animate-[spin_1.5s_linear_infinite]">
          <circle cx="16" cy="16" r="12" fill="none" stroke="#e8ecf2" strokeWidth="3" />
          <circle cx="16" cy="16" r="12" fill="none" stroke="#1fb8cd" strokeWidth="3" strokeDasharray="75.4" strokeDashoffset="56" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm text-muted font-medium">{stageLabel} 분석 중...</p>
    </div>
  );
}

/* ─────────── final loading ─────────── */

function FinalLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-5">
      <div className="relative w-24 h-24 mb-8">
        <svg viewBox="0 0 96 96" className="w-full h-full animate-[spin_3s_linear_infinite]">
          <circle cx="48" cy="48" r="40" fill="none" stroke="#e8ecf2" strokeWidth="3" />
          <circle cx="48" cy="48" r="40" fill="none" stroke="#1fb8cd" strokeWidth="3" strokeDasharray="251.3" strokeDashoffset="188" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1fb8cd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" opacity="0.3" />
          </svg>
        </div>
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">종합 분석 진행 중</h2>
      <p className="text-muted text-sm mb-6">4개 영역을 교차 분석하고 있습니다</p>
      <div className="w-full max-w-xs space-y-3">
        {["구조 분석", "성과 검증", "행동 패턴 대조", "종합 리포트 생성"].map((s, i) => (
          <div key={s} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 600}ms` }}>
            <div className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center shrink-0">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0d95a8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4" /></svg>
            </div>
            <span className="text-sm text-foreground">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────── main ─────────── */

export default function VerifyPage() {
  const router = useRouter();
  const [stage, setStage] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<FormData>(INIT);

  const set = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) =>
      setData((prev) => ({ ...prev, [key]: value })),
    []
  );

  function handleNext() {
    if (stage < 5) {
      setAnalyzing(true);
      setTimeout(() => {
        setAnalyzing(false);
        setStage((s) => s + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 1500);
    } else {
      setIsLoading(true);
      setTimeout(() => router.push("/verify/report"), 3200);
    }
  }

  /* completed analyses */
  const completedAnalyses: { analysis: ReturnType<typeof getAnalysis1>; revenue?: string }[] = [];
  if (stage > 1) completedAnalyses.push({ analysis: getAnalysis1(data) });
  if (stage > 2) {
    const a2 = getAnalysis2(data);
    completedAnalyses.push({ analysis: a2, revenue: a2.revenue });
  }
  if (stage > 3) completedAnalyses.push({ analysis: getAnalysis3(data) });
  if (stage > 4) completedAnalyses.push({ analysis: getAnalysis4(data) });

  if (isLoading) return <FinalLoading />;

  return (
    <div className="min-h-screen bg-background">
      {/* header */}
      <header className="sticky top-0 z-40 card-glass border-b border-white/40">
        <div className="mx-auto max-w-2xl px-5 h-14 flex items-center justify-between">
          <a href="/" className="font-bold text-foreground tracking-tight">Clean Crypto</a>
          <span className="text-xs text-muted font-medium">{stage}/5 단계</span>
        </div>
      </header>

      {/* progress */}
      <div className="mx-auto max-w-2xl px-5 pt-5 pb-2">
        <div className="flex gap-1.5">
          {STAGES.map((s) => (
            <div key={s.id} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full h-1 rounded-full overflow-hidden bg-card-border">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    s.id < stage ? "bg-primary w-full" : s.id === stage ? "bg-primary/50 w-1/2" : "w-0"
                  }`}
                />
              </div>
              <span className={`text-[10px] font-medium hidden md:block ${s.id <= stage ? "text-primary-dark" : "text-muted/50"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* content */}
      <div className="mx-auto max-w-2xl px-5 py-6">
        {/* stacked completed analyses */}
        {completedAnalyses.length > 0 && (
          <div className="space-y-2 mb-6">
            {completedAnalyses.map(({ analysis, revenue }, i) => (
              <CollapsedAnalysis
                key={i}
                title={analysis.title}
                summary={analysis.summary}
                findings={analysis.findings}
                revenue={revenue}
              />
            ))}
          </div>
        )}

        {/* analyzing indicator */}
        {analyzing && <AnalyzingIndicator stageLabel={STAGES[stage - 1].label} />}

        {/* current stage form */}
        {!analyzing && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <span className="text-xs font-bold text-primary tracking-widest">
                STAGE {String(stage).padStart(2, "0")}
              </span>
              <h1 className="text-2xl font-bold text-foreground mt-1">{STAGES[stage - 1].label}</h1>
              <p className="text-sm text-muted mt-1">
                {stage === 1 && "어떤 환경에서 리딩을 받고 계신가요?"}
                {stage === 2 && "돈은 어떻게 흘러가고 있나요?"}
                {stage === 3 && "무엇을 제공한다고 주장하나요?"}
                {stage === 4 && "실제로 어떻게 행동하나요?"}
                {stage === 5 && "당신의 경험을 알려주세요"}
              </p>
            </div>

            {/* ── stage 1 ── */}
            {stage === 1 && (
              <>
                <Q label="운영 플랫폼" sub="리딩이 이루어지는 주요 채널을 선택하세요">
                  <ChipGroup options={["텔레그램", "카카오톡", "디스코드", "기타"]} value={data.platform} onChange={(v) => set("platform", v as string)} />
                </Q>
                <Q label="운영 기간" sub="대략적으로 얼마나 운영되었나요?">
                  <ChipGroup options={["3개월 미만", "3~6개월", "6~12개월", "1~2년", "2년 이상"]} value={data.duration} onChange={(v) => set("duration", v as string)} />
                </Q>
                <Q label="대략적 멤버 수">
                  <ChipGroup options={["50명 미만", "50~200명", "200~500명", "500~2,000명", "2,000명 이상"]} value={data.memberCount} onChange={(v) => set("memberCount", v as string)} />
                </Q>
                <Q label="어떻게 알게 되셨나요?" sub="복수 선택 가능">
                  <ChipGroup options={["지인 추천", "SNS 광고", "유튜브", "인플루언서", "검색", "기타"]} value={data.discovery} onChange={(v) => set("discovery", v as string[])} multi />
                </Q>
              </>
            )}

            {/* ── stage 2 ── */}
            {stage === 2 && (
              <>
                <Q label="월 수수료" sub="대략적인 월간 비용을 선택하세요">
                  <ChipGroup options={["무료", "30만원 미만", "30~100만원", "100~300만원", "300만원 이상"]} value={data.fee} onChange={(v) => set("fee", v as string)} />
                </Q>
                <Q label="등급 구조" sub="무료방/유료방/VIP 등 등급이 나뉘어 있나요?">
                  <ChipGroup options={["단일 등급", "2~3단계", "VIP/프리미엄 별도", "없음(무료)"]} value={data.tierStructure} onChange={(v) => set("tierStructure", v as string)} />
                </Q>
                <Q label="무료 체험 또는 환불 보장">
                  <ChipGroup options={["있음", "조건부", "없음"]} value={data.trialRefund} onChange={(v) => set("trialRefund", v as string)} />
                </Q>
                <Q label="장기 결제 유도" sub="장기 결제 할인이나 평생 이용권을 판매하나요?">
                  <ChipGroup options={["없음", "3개월 할인", "6개월 할인", "평생 이용권 판매"]} value={data.lockIn} onChange={(v) => set("lockIn", v as string)} />
                </Q>
                <Q label="추천인 리워드" sub="다른 사람을 초대하면 보상이 있나요?">
                  <ChipGroup options={["없음", "소액 할인", "의미 있는 보상", "다단계 구조"]} value={data.referral} onChange={(v) => set("referral", v as string)} />
                </Q>
              </>
            )}

            {/* ── stage 3 ── */}
            {stage === 3 && (
              <>
                <Q label="시그널 유형" sub="복수 선택 가능">
                  <ChipGroup options={["현물 매매", "선물(레버리지)", "디파이", "알트코인 추천", "매크로 분석"]} value={data.signalType} onChange={(v) => set("signalType", v as string[])} multi />
                </Q>
                {data.signalType.includes("선물(레버리지)") && (
                  <Q label="추천 레버리지 수준">
                    <ChipGroup options={["2~5배", "5~10배", "10~20배", "20배 이상"]} value={data.leverage} onChange={(v) => set("leverage", v as string)} />
                  </Q>
                )}
                <Q label="주간 시그널 빈도">
                  <ChipGroup options={["1~3개", "3~7개", "7~15개", "15개 이상"]} value={data.signalFrequency} onChange={(v) => set("signalFrequency", v as string)} />
                </Q>
                <Q label="주장하는 승률">
                  <ChipGroup options={["구체적 수치 미공개", "60~70%", "70~80%", "80~90%", "90% 이상"]} value={data.claimedWinRate} onChange={(v) => set("claimedWinRate", v as string)} />
                </Q>
                <Q label="승리/손실 모두 공개하나요?">
                  <ChipGroup options={["둘 다 공개", "주로 승리만", "승리만 게시", "모름"]} value={data.winLossPosted} onChange={(v) => set("winLossPosted", v as string)} />
                </Q>
                <Q label="과거 성과 데이터 존재 여부">
                  <ChipGroup options={["공개 기록 있음", "회원에게만 공개", "구두로만 주장", "공개 기록 없음"]} value={data.trackRecord} onChange={(v) => set("trackRecord", v as string)} />
                </Q>
              </>
            )}

            {/* ── stage 4 ── */}
            {stage === 4 && (
              <>
                <Q label="손실 발생 시 운영자 대응" sub="손실이 난 콜에 대해 어떻게 반응하나요?">
                  <ChipGroup options={["복기 및 리뷰", "간단히 언급", "무시", "삭제", "시장/팔로워 탓"]} value={data.lossHandling} onChange={(v) => set("lossHandling", v as string)} />
                </Q>
                <Q label="FOMO/긴급성 언어 빈도" sub="'지금 안 들어오면 손해', '마감 임박' 등">
                  <ChipGroup options={["없음", "가끔", "자주", "주된 영업 방식"]} value={data.fomoFrequency} onChange={(v) => set("fomoFrequency", v as string)} />
                </Q>
                <Q label="비판/의문 제기 허용 여부">
                  <ChipGroup options={["자유 토론", "적당한 중재", "비판 비권장", "비판자 밴"]} value={data.criticismTolerance} onChange={(v) => set("criticismTolerance", v as string)} />
                </Q>
                <Q label="운영자 본인 매매 포지션 공개">
                  <ChipGroup options={["증거와 함께 공개", "주장만", "비공개", "모름"]} value={data.operatorDisclosure} onChange={(v) => set("operatorDisclosure", v as string)} />
                </Q>
                <Q label="다른 상품/방 홍보 여부">
                  <ChipGroup options={["없음", "가끔", "빈번", "그게 본업인 듯"]} value={data.crossSelling} onChange={(v) => set("crossSelling", v as string)} />
                </Q>
                <Q label="커뮤니티 전반 분위기" sub="복수 선택 가능">
                  <ChipGroup options={["분석적", "교육적", "하이프 중심", "공포 기반", "맹신적", "서포티브"]} value={data.communityTone} onChange={(v) => set("communityTone", v as string[])} multi />
                </Q>
              </>
            )}

            {/* ── stage 5 ── */}
            {stage === 5 && (
              <>
                <Q label="이용 기간">
                  <ChipGroup options={["가입 고려 중", "1개월 미만", "1~3개월", "3~6개월", "6개월 이상"]} value={data.membershipDuration} onChange={(v) => set("membershipDuration", v as string)} />
                </Q>
                <Q label="시그널을 따라한 결과는?">
                  <ChipGroup options={["큰 수익", "소폭 수익", "보합", "소폭 손실", "큰 손실", "아직 안 따라함"]} value={data.actualResult} onChange={(v) => set("actualResult", v as string)} />
                </Q>
                <Q label="가장 큰 우려사항" sub="자유롭게 적어주세요 (필수)">
                  <textarea
                    value={data.biggestConcern}
                    onChange={(e) => set("biggestConcern", e.target.value)}
                    placeholder="예: 수익 인증은 많은데 정작 내가 따라하면 손해가 나서 의심이 됩니다..."
                    className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-card-border bg-white text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none"
                  />
                </Q>
                <Q label="분석 전 신뢰도 자가 평가" sub="현재 이 리딩 환경을 얼마나 신뢰하시나요?">
                  <div className="space-y-3">
                    <input
                      type="range" min={1} max={10} value={data.trustRating}
                      onChange={(e) => set("trustRating", Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted">
                      <span>1 — 전혀 신뢰 안 함</span>
                      <span className="text-lg font-extrabold text-primary stat-number">{data.trustRating}</span>
                      <span>10 — 완전 신뢰</span>
                    </div>
                  </div>
                </Q>
              </>
            )}

            {/* next button */}
            <div className="pt-4 pb-8">
              <button
                onClick={handleNext}
                className="group w-full py-4 rounded-2xl bg-primary text-white font-semibold text-base flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/25 cursor-pointer active:scale-[0.98]"
              >
                {stage < 5 ? (
                  <>
                    다음 단계로
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                ) : "종합 분석 시작"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
