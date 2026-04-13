import { chat } from "./openrouter";

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

export interface VerifyAnswers {
  q1: number; q2: number; q3: number;
  q4: number; q5: number; q6: number;
  q7: number; q8: number; q9: number;
  q10: number; q11: number; q12: number;
}

type Risk = "safe" | "caution" | "high" | "critical" | "check";

interface QuestionMeta {
  id: keyof VerifyAnswers;
  stage: 1 | 2 | 3 | 4;
  title: string;
  options: { label: string; risk: Risk; redFlag?: boolean }[];
}

/* ── Report shape consumed by the report page ── */

export interface AnalysisReport {
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

export interface StageResult {
  stage: number;
  label: string;
  pass: boolean;
  score: number;
  findings: { question: string; selectedAnswer: string; risk: Risk; explanation: string }[];
}

/* ═══════════════════════════════════════════
   Question registry — 4 Stages × 3 Questions
   ═══════════════════════════════════════════ */

const QUESTIONS: QuestionMeta[] = [
  /* ── Stage 1: 즉시 위험 판별 ── */
  { id: "q1", stage: 1, title: "대리매매/자동매매 권유", options: [
    { label: "없음 — 본인 직접 매매", risk: "safe" },
    { label: "자동매매 봇 연동 권유", risk: "high" },
    { label: "대리매매/자금 위탁 권유", risk: "critical", redFlag: true },
  ]},
  { id: "q2", stage: 1, title: "자금 요구/출금 불가 유도", options: [
    { label: "없음", risk: "safe" },
    { label: "특정 거래소 가입 유도 (레퍼럴)", risk: "caution" },
    { label: "자금 입금 요구/출금 조건 추가 입금", risk: "critical", redFlag: true },
  ]},
  { id: "q3", stage: 1, title: "사용 거래소", options: [
    { label: "대형 거래소 (바이낸스, 바이빗, OKX 등)", risk: "safe" },
    { label: "중형 거래소 (빙엑스, 게이트 등)", risk: "caution" },
    { label: "소형·비인가 거래소", risk: "critical", redFlag: true },
    { label: "잘 모름", risk: "check" },
  ]},

  /* ── Stage 2: 시그널 품질 검증 ── */
  { id: "q4", stage: 2, title: "시그널 구체성 (SL/TP)", options: [
    { label: "진입가 + 손절가 + 목표가 모두 제시", risk: "safe" },
    { label: "대부분 포함하지만 가끔 누락", risk: "caution" },
    { label: "방향만 제시 (\"롱 가봅시다\")", risk: "high" },
    { label: "손절 개념 없음 / \"존버\" 강조", risk: "critical" },
  ]},
  { id: "q5", stage: 2, title: "레버리지 권유 수준", options: [
    { label: "현물 위주 또는 저레버리지 (1~5x)", risk: "safe" },
    { label: "중간 레버리지 (5~20x) + 리스크 안내", risk: "caution" },
    { label: "고레버리지 (20x+) 빈번 권유", risk: "high" },
    { label: "50x 이상 / \"풀레버리지\" 권유", risk: "critical" },
  ]},
  { id: "q6", stage: 2, title: "주로 다루는 자산", options: [
    { label: "BTC/ETH 등 대형 + 검증된 알트", risk: "safe" },
    { label: "중형 알트 위주 (시총 Top 100 내외)", risk: "caution" },
    { label: "소형 알트/밈코인 위주", risk: "high" },
    { label: "저유동성 토큰 + 특정 코인 집중 푸시", risk: "critical" },
  ]},

  /* ── Stage 3: 성과 투명성 검증 ── */
  { id: "q7", stage: 3, title: "수익인증 방식", options: [
    { label: "사전 공유 → 결과 인증 (공개 채널)", risk: "safe" },
    { label: "사전 공유 → 결과 인증 (비공개방)", risk: "caution" },
    { label: "사후 \"했제\" 인증 (결과만)", risk: "high" },
    { label: "적중 과대 포장 반복", risk: "critical" },
  ]},
  { id: "q8", stage: 3, title: "성과 표현 방식", options: [
    { label: "승률 + 손익비 + 전체 수익률 공개", risk: "safe" },
    { label: "승률만 공개 (손익비·MDD 언급 없음)", risk: "caution" },
    { label: "\"몇 배 수익\" / 극적 수치 위주", risk: "high" },
    { label: "90%+ 승률 또는 \"원금 보장\" 주장", risk: "critical" },
  ]},
  { id: "q9", stage: 3, title: "손실 콜 처리", options: [
    { label: "승리·손실 모두 공개 + 복기", risk: "safe" },
    { label: "둘 다 공개하지만 복기 없음", risk: "caution" },
    { label: "주로 승리만 공개", risk: "high" },
    { label: "손실 삭제/승리만 남김", risk: "critical", redFlag: true },
  ]},

  /* ── Stage 4: 운영 행동 분석 ── */
  { id: "q10", stage: 4, title: "과시형 콘텐츠", options: [
    { label: "없음 — 분석·교육 중심", risk: "safe" },
    { label: "가끔 (라이프스타일 공유)", risk: "caution" },
    { label: "자주 — 과시가 더 많음", risk: "high" },
    { label: "메인 콘텐츠가 과시", risk: "critical" },
  ]},
  { id: "q11", stage: 4, title: "소통 구조", options: [
    { label: "토론방 있음 (질문·의견 자유)", risk: "safe" },
    { label: "토론방 있지만 활발하지 않음", risk: "caution" },
    { label: "일방향 채널 (공지만)", risk: "high" },
    { label: "일방향 + 비판 시 밴/강퇴", risk: "critical", redFlag: true },
  ]},
  { id: "q12", stage: 4, title: "등급/VIP 유도", options: [
    { label: "단일 등급", risk: "safe" },
    { label: "2단계 (무료 + 유료)", risk: "caution" },
    { label: "VIP/프리미엄 별도", risk: "high" },
    { label: "3단계 이상 + 지속 유도", risk: "critical" },
  ]},
];

const STAGE_LABELS = ["즉시 위험 판별", "시그널 품질", "성과 투명성", "운영 행동"];

/* ═══════════════════════════════════════════
   Deterministic scoring layer
   ═══════════════════════════════════════════ */

const RISK_SCORES: Record<Risk, number> = { safe: 100, caution: 65, check: 50, high: 25, critical: 0 };

/* Per-stage question weights */
const STAGE_WEIGHTS: Record<number, number[]> = {
  2: [30, 40, 30],  // Q4(구체성), Q5(레버리지 ★), Q6(자산)
  3: [40, 30, 30],  // Q7(인증방식 ★), Q8(표현), Q9(손실)
  4: [30, 40, 30],  // Q10(과시), Q11(소통 ★), Q12(등급)
};

function getAnswer(answers: VerifyAnswers, q: QuestionMeta) {
  return q.options[answers[q.id]];
}

function computeRedFlags(answers: VerifyAnswers): string[] {
  const flags: string[] = [];
  for (const q of QUESTIONS) {
    const opt = getAnswer(answers, q);
    if (opt.redFlag) flags.push(opt.label);
  }
  return flags;
}

function computeStageScore(answers: VerifyAnswers, stage: number): number {
  const qs = QUESTIONS.filter((q) => q.stage === stage);
  const weights = STAGE_WEIGHTS[stage] ?? [34, 33, 33];
  let total = 0;
  qs.forEach((q, i) => {
    total += (RISK_SCORES[getAnswer(answers, q).risk] * weights[i]) / 100;
  });
  return Math.round(total);
}

/* ── Cross-risk multiplier patterns ── */

interface CrossRiskPattern {
  name: string;
  multiplier: number;
  check: (a: VerifyAnswers) => boolean;
}

const CROSS_RISK_PATTERNS: CrossRiskPattern[] = [
  {
    name: "계좌 파산 구조",
    multiplier: 0.4,
    // 손절없음/존버(Q4≥2) + 고레버리지 20x+(Q5≥2)
    check: (a) => a.q4 >= 2 && a.q5 >= 2,
  },
  {
    name: "펌프앤덤프 전선",
    multiplier: 0.25,
    // 소형알트+(Q6≥2) + 사후인증+(Q7≥2) + 승률만 이상(Q8≥1)
    check: (a) => a.q6 >= 2 && a.q7 >= 2 && a.q8 >= 1,
  },
  {
    name: "조작된 트랙레코드",
    multiplier: 0.3,
    // 비공개방 이상(Q7≥1) + 90%+/원금보장(Q8=3) + 손실삭제(Q9=3)
    check: (a) => a.q7 >= 1 && a.q8 === 3 && a.q9 === 3,
  },
  {
    name: "이미지 기반 추출",
    multiplier: 0.5,
    // 과시메인(Q10=3) + 밴(Q11=3) + 3단계+(Q12=3)
    check: (a) => a.q10 === 3 && a.q11 === 3 && a.q12 === 3,
  },
  {
    name: "카피트레이딩 사기",
    multiplier: 0.2,
    // 자동매매봇+(Q1≥1) + 고레버리지(Q5≥2) + 90%+(Q8=3)
    check: (a) => a.q1 >= 1 && a.q5 >= 2 && a.q8 === 3,
  },
];

function computeCrossRiskMultiplier(answers: VerifyAnswers): { multiplier: number; triggered: string[] } {
  const triggered: string[] = [];
  let worstMultiplier = 1;

  for (const pattern of CROSS_RISK_PATTERNS) {
    if (pattern.check(answers)) {
      triggered.push(pattern.name);
      if (pattern.multiplier < worstMultiplier) {
        worstMultiplier = pattern.multiplier;
      }
    }
  }

  return { multiplier: worstMultiplier, triggered };
}

/* ── Composite score ── */

function computeComposite(answers: VerifyAnswers): { score: number; verdict: AnalysisReport["verdict"] } {
  const s1Flags = QUESTIONS.filter((q) => q.stage === 1 && getAnswer(answers, q).redFlag);
  const s2 = computeStageScore(answers, 2);
  const s3 = computeStageScore(answers, 3);
  const s4 = computeStageScore(answers, 4);

  // Stage 1 fail → cap at 25
  if (s1Flags.length > 0) {
    const capped = Math.min(25, Math.round(s2 * 0.30 + s3 * 0.35 + s4 * 0.20));
    return { score: capped, verdict: "critical" };
  }

  // Base: Stage2(30%) + Stage3(35%) + Stage4(20%) + 15 baseline from passing Stage 1
  let composite = Math.round(s2 * 0.30 + s3 * 0.35 + s4 * 0.20 + 15);

  // Apply cross-risk multiplier (worst pattern only)
  const { multiplier } = computeCrossRiskMultiplier(answers);
  if (multiplier < 1) {
    composite = Math.round(composite * multiplier);
  }

  if (composite >= 75) return { score: composite, verdict: "clean" };
  if (composite >= 50) return { score: composite, verdict: "caution" };
  if (composite >= 25) return { score: composite, verdict: "danger" };
  return { score: composite, verdict: "critical" };
}

/* ═══════════════════════════════════════════
   LLM analysis prompt
   ═══════════════════════════════════════════ */

const SYSTEM_PROMPT = `당신은 Clean Crypto의 리딩방 사기 탐지 분석 엔진입니다.
암호화폐 리딩방(유료 시그널/자문 그룹)의 사기 지표를 전문적으로 분석합니다.

## 분석 프레임워크 (4-Stage, 12 지표)

### Stage 1: 즉시 위험 판별 (통과/불통과)
여기서 걸리면 나머지 볼 필요 없이 위험합니다.

레드플래그:
- 대리매매/자금 위탁 권유 → 돈을 맡기는 순간 통제권 상실. 사기 가능성 매우 높음.
- 출금 위해 추가 입금 요구 → 어떤 명목이든 100% 사기. 전형적 스캠 패턴.
- 소형·비인가 거래소 강제 → 레퍼럴 수수료 목적 + 거래소 안전성 리스크.

핵심 뉘앙스:
- Q2(레퍼럴 유도) + Q3(소형 거래소) = 조직적 추출 패턴
- 자동매매 봇 자체는 바로 사기가 아니나, 비현실적 승률과 결합하면 카피트레이딩 사기

### Stage 2: 시그널 품질 검증 (전체 30% 가중치)
시그널 자체가 전문적인지 판단합니다.

Q4 — 시그널 구체성:
- 진입가/손절가/목표가 모두 포함 = 전문적 리스크 관리의 기본
- "롱 가봅시다" 수준의 방향만 = 사후 인증 쉬워 승률 조작 가능
- 손절 없음/"존버" 강조 = 리스크 관리 부재. LUNA/FTX 사태 시 "존버" 외치던 방들이 계좌 전멸시킨 사례 다수.

Q5 — 레버리지 권유:
- 전문 트레이더는 5~10x를 거의 넘지 않음
- 50x에서 2% 역방향 = 즉시 청산. 수학적으로 파산 불가피
- 고레버리지 권유 = (1) 무지이거나 (2) 빠른 청산→재입금 유도 목적

Q6 — 주로 다루는 자산:
- 저유동성 토큰 집중 = 펌프앤덤프 구조 (운영자 선매수→시그널→멤버 매수→운영자 매도)
- 연구: 전체 런칭 토큰 3.59%가 펌프앤덤프 패턴, 6개월간 4,800건+ 텔레그램/디스코드 조직

### Stage 3: 성과 투명성 검증 (전체 35% 가중치 — 최고)
주장하는 성과가 진짜인지 검증합니다.

Q7 — 수익인증 방식:
- "사전에 공유했는가" + "공개 채널이었는가" — 둘 다 Yes여야 진짜 검증
- 사후 인증은 누구나 할 수 있어 의미 없음

Q8 — 성과 표현 방식:
- 핵심 원리: 기대값(EV) = (승률 × 평균수익) - (패률 × 평균손실). 승률만으로는 수익성 판단 불가
- 승률 40% + 손익비 3:1 = 수익, 승률 80% + 손익비 0.5:1 = 파산
- 전문 벤치마크: Profit Factor >1.5 수익적, >2.0 우수. 엘리트 트레이더 손익비 2.8:1~4.2:1
- 승률만 앞세우는 곳 = 본질을 모르거나 의도적 은폐
- 90%+ 승률: 실전 불가능. Renaissance Medallion Fund ~66%. Sharpe Ratio 기관 >2.0, 리테일 >0.75
- "원금 보장": 투자에서 불가능한 약속, 사기의 전형적 표현

Q9 — 손실 콜 처리:
- 승패 모두 공개 + 복기 = 전문적 운영, 교육적 가치
- 선택적 공개(승리만) = 조작된 승률과 같은 효과
- 손실 삭제 = 전형적 사기 패턴 (레드플래그)

### Stage 4: 운영 행동 분석 (전체 20% 가중치)
단독으로 사기 단정은 어렵지만, 종합 판단 시 위험도를 높입니다.

Q10 — 과시형 콘텐츠: 슈퍼카·명품·현금 = 트레이딩 실력이 아니라 "부자 이미지"를 파는 것
Q11 — 소통 구조: 일방향 + 비판자 밴 = 정보 통제 구조로 은폐 목적 (레드플래그)
Q12 — 등급/VIP 유도: 3단계+ 지속 업그레이드 유도 = 매출이 콘텐츠가 아니라 등급 판매에 의존

## 교차 위험 패턴 분석 (반드시 수행)

아래 조합을 구체적으로 분석하세요:
1. Q4(손절없음/존버) + Q5(고레버리지 20x+) = "계좌 파산 구조" — 방향 맞아도 작은 변동에 청산. 시간문제
2. Q6(소형알트/저유동성) + Q7(사후인증) + Q8(승률강조/극적수치) = "펌프앤덤프 전선" — 운영자 선매수→시그널→멤버매수→운영자매도
3. Q7(비공개방+) + Q8(90%+/원금보장) + Q9(손실삭제) = "조작된 트랙레코드" — 성과 기록 100% 통제 환경
4. Q10(과시메인) + Q11(비판자밴) + Q12(3단계+유도) = "이미지 기반 추출" — 트레이딩이 아니라 멤버십 판매 사업
5. Q1(자동매매봇) + Q5(고레버리지) + Q8(90%+) = "카피트레이딩 사기" — 봇+비현실적 수익 3종세트
6. Stage 1 레드플래그 복수 발생 = 고도로 정교한 사기 조직

## 한국 법적 맥락
- 가상자산이용자보호법(2024.7 시행): 불공정 거래행위 금지, 위반 시 최소 1년 이상 징역
- 자본시장법: 가상자산이 증권 해당 시 투자자문업 등록 의무
- 한국 리딩방 사기 현황: 2024년 월 400~1,000건, 월 피해액 300~800억원

## 출력 규칙
- 한국어로 작성
- 직접적이고 권위 있는 톤 — 사기 탐지 리포트임. 제안이 아님.
- 구체적 데이터 포인트와 비교 근거 제시 (Profit Factor, Sharpe Ratio, MDD, Renaissance 벤치마크 등)
- 권고사항은 실행 가능하고 우선순위 순서로 정렬
- 요약은 2~3문장으로 핵심 위험을 정확히 포착`;

function buildUserPrompt(answers: VerifyAnswers): string {
  const lines: string[] = ["다음은 사용자가 입력한 리딩방 정보입니다:\n"];

  for (const q of QUESTIONS) {
    const opt = getAnswer(answers, q);
    lines.push(`[Stage ${q.stage}] ${q.title}: ${opt.label} (위험도: ${opt.risk}${opt.redFlag ? " — 레드플래그" : ""})`);
  }

  // Append cross-risk multiplier info
  const { multiplier, triggered } = computeCrossRiskMultiplier(answers);
  if (triggered.length > 0) {
    lines.push(`\n[교차 위험 패턴 감지] ${triggered.join(", ")} (최종 승수: ×${multiplier})`);
  }

  lines.push("\n위 입력을 기반으로 종합 분석 리포트를 JSON으로 생성하세요.");
  return lines.join("\n");
}

/* ═══════════════════════════════════════════
   JSON schema for structured output
   ═══════════════════════════════════════════ */

const OUTPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    summary: { type: "string", description: "2~3문장 핵심 요약 (한국어)" },
    stageFindingExplanations: {
      type: "array",
      description: "12개 질문 각각에 대한 분석 설명 (q1~q12 순서)",
      items: {
        type: "object",
        properties: {
          questionId: { type: "string" },
          explanation: { type: "string", description: "해당 응답이 왜 위험/안전한지 1~2문장 설명" },
        },
        required: ["questionId", "explanation"],
        additionalProperties: false,
      },
    },
    crossPatterns: {
      type: "array",
      description: "교차 패턴 분석 결과. 해당 패턴이 없으면 빈 배열.",
      items: {
        type: "object",
        properties: {
          pattern: { type: "string", description: "패턴 이름 (한국어)" },
          explanation: { type: "string", description: "왜 이 조합이 위험한지 설명" },
          severity: { type: "string", enum: ["caution", "high", "critical"] },
        },
        required: ["pattern", "explanation", "severity"],
        additionalProperties: false,
      },
    },
    recommendations: {
      type: "array",
      description: "우선순위 순서의 실행 가능한 권고사항 3~5개 (한국어)",
      items: { type: "string" },
    },
    context: {
      type: "array",
      description: "비교 맥락 데이터 포인트 2~3개 (한국어). 예: '글로벌 상위 펀드 승률은...'",
      items: { type: "string" },
    },
  },
  required: ["summary", "stageFindingExplanations", "crossPatterns", "recommendations", "context"],
  additionalProperties: false,
};

/* ═══════════════════════════════════════════
   Main analysis function
   ═══════════════════════════════════════════ */

interface LLMEnrichment {
  summary: string;
  stageFindingExplanations: { questionId: string; explanation: string }[];
  crossPatterns: { pattern: string; explanation: string; severity: "caution" | "high" | "critical" }[];
  recommendations: string[];
  context: string[];
}

async function callLLM(answers: VerifyAnswers): Promise<LLMEnrichment> {
  const raw = await chat({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(answers) },
    ],
    temperature: 0.15,
    maxTokens: 4000,
    responseFormat: {
      type: "json_schema",
      json_schema: {
        name: "analysis_report",
        strict: true,
        schema: OUTPUT_SCHEMA,
      },
    },
  });

  return JSON.parse(raw) as LLMEnrichment;
}

/* ── Fallback when LLM is unavailable ── */

function buildFallback(answers: VerifyAnswers): LLMEnrichment {
  const redFlags = computeRedFlags(answers);
  const hasRedFlags = redFlags.length > 0;

  const summary = hasRedFlags
    ? `이 리딩 환경에서 ${redFlags.length}건의 즉시 위험 신호가 감지되었습니다. 이 환경에서의 투자를 즉시 중단하고 기존 투자금 회수를 검토하시길 강력히 권고합니다.`
    : `입력하신 리딩 환경을 4개 영역에서 분석한 결과입니다. 각 영역별 상세 분석을 확인하시고 종합적으로 판단하시길 권장합니다.`;

  const explanations = QUESTIONS.map((q) => {
    const opt = getAnswer(answers, q);
    const base = opt.redFlag ? "즉시 위험 신호에 해당합니다." : "";
    return { questionId: q.id, explanation: base || `${opt.label}에 해당하는 응답입니다.` };
  });

  return {
    summary,
    stageFindingExplanations: explanations,
    crossPatterns: [],
    recommendations: hasRedFlags
      ? ["이 환경에서의 추가 투자를 즉시 중단하세요.", "기존 투자금 회수 방안을 검토하세요.", "유사 피해 사례를 확인하고 필요시 신고를 고려하세요."]
      : ["운영자에게 검증 가능한 전체 트랙레코드(승률+손익비+MDD)를 요청하세요.", "다른 이용자의 경험을 확인해보세요.", "소액으로 시작하여 주장과 실제의 차이를 직접 확인하세요."],
    context: [],
  };
}

/* ═══════════════════════════════════════════
   Public API
   ═══════════════════════════════════════════ */

export async function analyzeLeadingRoom(answers: VerifyAnswers): Promise<AnalysisReport> {
  // 1. Deterministic scoring
  const redFlags = computeRedFlags(answers);
  const { score: overallScore, verdict } = computeComposite(answers);
  const { triggered: crossRiskTriggered } = computeCrossRiskMultiplier(answers);

  const stages: StageResult[] = [1, 2, 3, 4].map((stage) => {
    const qs = QUESTIONS.filter((q) => q.stage === stage);
    const stageRedFlags = qs.filter((q) => getAnswer(answers, q).redFlag);
    return {
      stage,
      label: STAGE_LABELS[stage - 1],
      pass: stage === 1 ? stageRedFlags.length === 0 : true,
      score: stage === 1 ? (stageRedFlags.length === 0 ? 100 : 0) : computeStageScore(answers, stage),
      findings: qs.map((q) => {
        const opt = getAnswer(answers, q);
        return { question: q.title, selectedAnswer: opt.label, risk: opt.risk, explanation: "" };
      }),
    };
  });

  // 2. LLM enrichment (best effort)
  let enrichment: LLMEnrichment;
  try {
    enrichment = await callLLM(answers);
  } catch (err) {
    console.error("LLM analysis failed, using fallback:", err);
    enrichment = buildFallback(answers);
  }

  // 3. Merge LLM explanations into deterministic findings
  for (const stage of stages) {
    for (const finding of stage.findings) {
      const qMeta = QUESTIONS.find((q) => q.title === finding.question);
      if (!qMeta) continue;
      const llmExpl = enrichment.stageFindingExplanations.find((e) => e.questionId === qMeta.id);
      if (llmExpl) finding.explanation = llmExpl.explanation;
    }
  }

  // 4. Build red flag details
  const redFlagDetails = redFlags.map((label) => {
    const q = QUESTIONS.find((qq) => qq.options.some((o) => o.label === label && o.redFlag));
    const llmExpl = q ? enrichment.stageFindingExplanations.find((e) => e.questionId === q.id) : undefined;
    return { label, explanation: llmExpl?.explanation ?? "" };
  });

  return {
    overallScore,
    verdict,
    summary: enrichment.summary,
    stages,
    redFlags: redFlagDetails,
    crossPatterns: enrichment.crossPatterns,
    recommendations: enrichment.recommendations,
    context: enrichment.context,
    methodology: `본 분석은 4개 영역(즉시 위험 판별, 시그널 품질, 성과 투명성, 운영 행동)을 가중 평가하여 산출되었습니다. Stage 1은 통과/불통과, Stage 2는 전체 점수의 30%, Stage 3은 35%, Stage 4는 20%를 차지합니다. 즉시 레드플래그 발생 시 종합 점수는 25점 이하로 제한됩니다.${crossRiskTriggered.length > 0 ? ` 교차 위험 패턴(${crossRiskTriggered.join(", ")})이 감지되어 점수에 감쇠 승수가 적용되었습니다.` : ""}`,
  };
}
