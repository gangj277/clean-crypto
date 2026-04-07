import { chat } from "./openrouter";

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

export interface VerifyAnswers {
  q1: number; q2: number; q3: number;
  q4: number; q5: number; q6: number;
  q7: number; q8: number; q9: number;
}

type Risk = "safe" | "caution" | "high" | "critical" | "check";

interface QuestionMeta {
  id: keyof VerifyAnswers;
  stage: 1 | 2 | 3;
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
   Question registry (mirrors the form)
   ═══════════════════════════════════════════ */

const QUESTIONS: QuestionMeta[] = [
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
  { id: "q4", stage: 2, title: "수익인증 방식", options: [
    { label: "사전 공유 → 결과 인증 (공개 채널)", risk: "safe" },
    { label: "사전 공유 → 결과 인증 (비공개방)", risk: "caution" },
    { label: "사후 \"했제\" 인증 (결과만)", risk: "high" },
    { label: "적중 과대 포장 반복", risk: "critical" },
  ]},
  { id: "q5", stage: 2, title: "주장 승률", options: [
    { label: "현실적 범위 (50~70%)", risk: "safe" },
    { label: "높은 편 (70~85%)", risk: "caution" },
    { label: "비현실적 (85% 이상)", risk: "high" },
    { label: "90% 이상 주장", risk: "critical" },
  ]},
  { id: "q6", stage: 2, title: "손실 콜 처리", options: [
    { label: "승리·손실 모두 공개 + 복기", risk: "safe" },
    { label: "둘 다 공개하지만 복기 없음", risk: "caution" },
    { label: "주로 승리만 공개", risk: "high" },
    { label: "손실 삭제/승리만 남김", risk: "critical", redFlag: true },
  ]},
  { id: "q7", stage: 3, title: "과시형 콘텐츠", options: [
    { label: "없음 — 분석·교육 중심", risk: "safe" },
    { label: "가끔 (라이프스타일 공유)", risk: "caution" },
    { label: "자주 — 과시가 더 많음", risk: "high" },
    { label: "메인 콘텐츠가 과시", risk: "critical" },
  ]},
  { id: "q8", stage: 3, title: "소통 구조", options: [
    { label: "토론방 있음 (질문·의견 자유)", risk: "safe" },
    { label: "토론방 있지만 활발하지 않음", risk: "caution" },
    { label: "일방향 채널 (공지만)", risk: "high" },
    { label: "일방향 + 비판 시 밴/강퇴", risk: "critical", redFlag: true },
  ]},
  { id: "q9", stage: 3, title: "등급/VIP 유도", options: [
    { label: "단일 등급", risk: "safe" },
    { label: "2단계 (무료 + 유료)", risk: "caution" },
    { label: "VIP/프리미엄 별도", risk: "high" },
    { label: "3단계 이상 + 지속 유도", risk: "critical" },
  ]},
];

const STAGE_LABELS = ["스캠 판별", "성과 투명성", "운영 행동"];

/* ═══════════════════════════════════════════
   Deterministic scoring layer
   ═══════════════════════════════════════════ */

const RISK_SCORES: Record<Risk, number> = { safe: 100, caution: 65, check: 50, high: 25, critical: 0 };

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
  const weights = stage === 2 ? [40, 30, 30] : [30, 40, 30];
  let total = 0;
  qs.forEach((q, i) => {
    total += (RISK_SCORES[getAnswer(answers, q).risk] * weights[i]) / 100;
  });
  return Math.round(total);
}

function computeComposite(answers: VerifyAnswers): { score: number; verdict: AnalysisReport["verdict"] } {
  const s1Flags = QUESTIONS.filter((q) => q.stage === 1 && getAnswer(answers, q).redFlag);
  const s2 = computeStageScore(answers, 2);
  const s3 = computeStageScore(answers, 3);

  // Stage 1 fail → cap at 25
  if (s1Flags.length > 0) {
    const capped = Math.min(25, Math.round(s2 * 0.55 + s3 * 0.30));
    return { score: capped, verdict: "critical" };
  }

  const composite = Math.round(s2 * 0.55 + s3 * 0.30 + 15); // 15 baseline from passing stage 1
  if (composite >= 75) return { score: composite, verdict: "clean" };
  if (composite >= 50) return { score: composite, verdict: "caution" };
  return { score: composite, verdict: "danger" };
}

/* ═══════════════════════════════════════════
   LLM analysis prompt
   ═══════════════════════════════════════════ */

const SYSTEM_PROMPT = `당신은 Clean Crypto의 리딩방 사기 탐지 분석 엔진입니다.
암호화폐 리딩방(유료 시그널/자문 그룹)의 사기 지표를 전문적으로 분석합니다.

## 분석 프레임워크

### Stage 1: 즉시 스캠 판별 (통과/불통과)
여기서 걸리면 나머지 볼 필요 없이 위험합니다.

레드플래그:
- 대리매매/자금 위탁 권유 → 돈을 맡기는 순간 통제권 상실. 사기 가능성 매우 높음.
- 출금 위해 추가 입금 요구 → 어떤 명목이든 100% 사기. 전형적 스캠 패턴.
- 소형·비인가 거래소 강제 → 레퍼럴 수수료 목적 + 거래소 안전성 리스크.

핵심 뉘앙스:
- Q2(레퍼럴 유도) + Q3(소형 거래소) = 조직적 추출 패턴
- 자동매매 봇 자체는 바로 사기가 아니나, 비현실적 승률과 결합하면 카피트레이딩 사기

### Stage 2: 성과 투명성 (핵심 — 가장 높은 비중)
리딩방의 본질적 신뢰도를 결정하는 영역입니다.

판별 핵심: "사전에 공유했는가" + "공개 채널이었는가" — 둘 다 Yes여야 진짜 검증.

승률 현실성 기준:
- 50~70%: 실전 트레이딩에서 충분히 가능
- 70~85%: 가능하지만 지속적이라면 검증 필요
- 85%+: 장기 유지 거의 불가능 — 과장 가능성
- 90%+: 실전 불가능. 세계 최고 퀀트 펀드 Renaissance Technologies의 Medallion Fund가 약 66% 수준.

중요: 승률 자체보다 "손익비"가 핵심. 승률 40%여도 손익비가 좋으면 수익. 승률 80%여도 큰 손실 한 번이면 전부 소진. 승률만 앞세우는 곳은 본질을 모르거나 의도적 은폐.

손실 처리가 가장 드러내는 지표:
- 승리·손실 모두 공개 + 복기 = 전문적 운영, 교육적 가치
- 선택적 공개(승리만) = 조작된 승률과 같은 효과
- 손실 삭제 = 전형적 사기 패턴. 승률은 "만들어지는" 것.

### Stage 3: 운영 행동 (보조 지표)
단독으로 사기 단정은 어렵지만, 종합 판단 시 위험도를 높이는 역할.

- 과시형 콘텐츠: 슈퍼카·명품·현금 다발 = 트레이딩 실력이 아니라 "부자 이미지"를 파는 것
- 일방향 소통 + 비판자 밴 = 정보 통제 구조로 은폐 목적
- 3단계 이상 등급 + 지속 업그레이드 유도 = 매출 구조가 콘텐츠가 아니라 등급 판매에 의존

## 교차 패턴 분석 (반드시 수행)

아래 조합을 구체적으로 분석하세요:
1. Q2(레퍼럴 유도) + Q3(소형 거래소) = 조직적 추출 구조
2. Q4(사후 인증만) + Q5(비현실적 승률) + Q6(손실 삭제) = 조작된 트랙레코드
3. Q7(과시 중심) + Q8(비판자 밴) + Q9(공격적 업셀) = 이미지 기반 추출 사업
4. Q1(자동매매) + Q5(90%+ 승률) = 카피트레이딩 사기
5. Stage 1 레드플래그 복수 발생 = 고도로 정교한 사기 조직

## 출력 규칙

- 한국어로 작성
- 직접적이고 권위 있는 톤 — 사기 탐지 리포트임. 제안이 아님.
- 구체적 데이터 포인트와 비교 근거 제시
- 권고사항은 실행 가능하고 우선순위 순서로 정렬
- 요약은 2~3문장으로 핵심 위험을 정확히 포착`;

function buildUserPrompt(answers: VerifyAnswers): string {
  const lines: string[] = ["다음은 사용자가 입력한 리딩방 정보입니다:\n"];

  for (const q of QUESTIONS) {
    const opt = getAnswer(answers, q);
    lines.push(`[Stage ${q.stage}] ${q.title}: ${opt.label} (위험도: ${opt.risk}${opt.redFlag ? " — 레드플래그" : ""})`);
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
      description: "9개 질문 각각에 대한 분석 설명 (q1~q9 순서)",
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
    maxTokens: 3000,
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
    : `입력하신 리딩 환경을 3개 영역에서 분석한 결과입니다. 각 영역별 상세 분석을 확인하시고 종합적으로 판단하시길 권장합니다.`;

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
      : ["운영자에게 검증 가능한 전체 트랙레코드를 요청하세요.", "다른 이용자의 경험을 확인해보세요.", "소액으로 시작하여 주장과 실제의 차이를 직접 확인하세요."],
    context: [],
  };
}

/* ═══════════════════════════════════════════
   Public API
   ═══════════════════════════════════════════ */

export async function analyzeLeadingRoom(answers: VerifyAnswers): Promise<AnalysisReport> {
  // 1. Deterministic scoring (always runs, always reliable)
  const redFlags = computeRedFlags(answers);
  const { score: overallScore, verdict } = computeComposite(answers);

  const stages: StageResult[] = [1, 2, 3].map((stage) => {
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

  // 2. LLM enrichment (best effort — fallback on failure)
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

  // 4. Build red flag details with LLM explanations
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
    methodology: "본 분석은 3개 영역(스캠 판별, 성과 투명성, 운영 행동)을 가중 평가하여 산출되었습니다. Stage 1은 통과/불통과, Stage 2는 전체 점수의 55%, Stage 3은 30%를 차지합니다. 즉시 레드플래그 발생 시 종합 점수는 25점 이하로 제한됩니다.",
  };
}
