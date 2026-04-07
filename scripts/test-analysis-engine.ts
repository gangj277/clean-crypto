/**
 * Analysis Engine Benchmark & Validation
 *
 * Tests both deterministic scoring correctness and LLM enrichment quality.
 * Run: npx tsx scripts/test-analysis-engine.ts
 */

const API_URL = process.env.API_URL ?? "http://localhost:3000/api/analyze";

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

interface Answers {
  q1: number; q2: number; q3: number;
  q4: number; q5: number; q6: number;
  q7: number; q8: number; q9: number;
}

interface StageResult {
  stage: number;
  label: string;
  pass: boolean;
  score: number;
  findings: { question: string; selectedAnswer: string; risk: string; explanation: string }[];
}

interface Report {
  overallScore: number;
  verdict: "clean" | "caution" | "danger" | "critical";
  summary: string;
  stages: StageResult[];
  redFlags: { label: string; explanation: string }[];
  crossPatterns: { pattern: string; explanation: string; severity: string }[];
  recommendations: string[];
  context: string[];
  methodology: string;
}

/* ═══════════════════════════════════════════
   Test scenarios
   ═══════════════════════════════════════════ */

interface TestCase {
  name: string;
  answers: Answers;
  expect: {
    // Deterministic checks (strict)
    verdict?: Report["verdict"];
    scoreRange?: [number, number]; // [min, max] inclusive
    stage1Pass?: boolean;
    redFlagCount?: number;
    redFlagCountMin?: number;
    // Stage score ranges
    stage2ScoreRange?: [number, number];
    stage3ScoreRange?: [number, number];
    // LLM enrichment quality checks (soft — warns instead of failing)
    expectCrossPatterns?: boolean;
    minRecommendations?: number;
    expectContext?: boolean;
  };
}

const TESTS: TestCase[] = [
  /* ── 1. All-safe: pristine leading room ── */
  {
    name: "ALL_SAFE — 모든 응답 안전",
    answers: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0 },
    expect: {
      verdict: "clean",
      scoreRange: [75, 100],
      stage1Pass: true,
      redFlagCount: 0,
      stage2ScoreRange: [95, 100],
      stage3ScoreRange: [95, 100],
      expectCrossPatterns: false,
      minRecommendations: 2,
      expectContext: true,
    },
  },

  /* ── 2. All-critical: maximum danger ── */
  {
    name: "ALL_CRITICAL — 모든 응답 최고 위험",
    answers: { q1: 2, q2: 2, q3: 2, q4: 3, q5: 3, q6: 3, q7: 3, q8: 3, q9: 3 },
    expect: {
      verdict: "critical",
      scoreRange: [0, 10],
      stage1Pass: false,
      redFlagCountMin: 3,
      stage2ScoreRange: [0, 5],
      stage3ScoreRange: [0, 5],
      expectCrossPatterns: true,
      minRecommendations: 3,
      expectContext: true,
    },
  },

  /* ── 3. Stage 1 red flag → score cap at 25 ── */
  {
    name: "STAGE1_REDFLAG_CAP — Stage 1 실패, Stage 2-3 양호 → 25점 캡",
    answers: { q1: 2, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0 },
    expect: {
      verdict: "critical",
      scoreRange: [0, 25],
      stage1Pass: false,
      redFlagCountMin: 1,
      // Stage 2-3 scores should still be high (they're computed independently)
      stage2ScoreRange: [95, 100],
      stage3ScoreRange: [95, 100],
    },
  },

  /* ── 4. Stage 1 clean, Stage 2 terrible ── */
  {
    name: "STAGE2_DANGER — Stage 1 통과, Stage 2 전면 위험",
    answers: { q1: 0, q2: 0, q3: 0, q4: 3, q5: 3, q6: 3, q7: 0, q8: 0, q9: 0 },
    expect: {
      verdict: "danger",
      scoreRange: [10, 50],
      stage1Pass: true,
      redFlagCountMin: 1, // q6 option 3 is a red flag
      stage2ScoreRange: [0, 5],
      stage3ScoreRange: [95, 100],
    },
  },

  /* ── 5. Cross-pattern: referral + small exchange ── */
  {
    name: "CROSS_REFERRAL_EXCHANGE — Q2 레퍼럴 + Q3 소형거래소 조합",
    answers: { q1: 0, q2: 1, q3: 2, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0 },
    expect: {
      stage1Pass: false, // Q3 option 2 is a red flag
      redFlagCountMin: 1,
      expectCrossPatterns: true,
    },
  },

  /* ── 6. Cross-pattern: fabricated track record ── */
  {
    name: "CROSS_FABRICATED — Q4 사후인증 + Q5 90%+ + Q6 손실삭제",
    answers: { q1: 0, q2: 0, q3: 0, q4: 2, q5: 3, q6: 3, q7: 0, q8: 0, q9: 0 },
    expect: {
      stage1Pass: true,
      redFlagCountMin: 1, // Q6 option 3
      stage2ScoreRange: [0, 10],
      expectCrossPatterns: true,
    },
  },

  /* ── 7. Cross-pattern: image-based extraction ── */
  {
    name: "CROSS_IMAGE_EXTRACTION — Q7 과시 + Q8 밴 + Q9 3단계",
    answers: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 3, q8: 3, q9: 3 },
    expect: {
      stage1Pass: true,
      redFlagCountMin: 1, // Q8 option 3
      stage3ScoreRange: [0, 5],
      expectCrossPatterns: true,
    },
  },

  /* ── 8. Borderline caution ── */
  {
    name: "BORDERLINE_CAUTION — 경계선 주의 수준",
    answers: { q1: 0, q2: 0, q3: 1, q4: 1, q5: 1, q6: 1, q7: 1, q8: 1, q9: 1 },
    expect: {
      stage1Pass: true,
      redFlagCount: 0,
      scoreRange: [50, 85],
      minRecommendations: 2,
    },
  },

  /* ── 9. Single red flag: proxy trading only ── */
  {
    name: "SINGLE_REDFLAG_Q1 — 대리매매만 레드플래그",
    answers: { q1: 2, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0 },
    expect: {
      stage1Pass: false,
      redFlagCount: 1,
      scoreRange: [0, 25],
      verdict: "critical",
    },
  },

  /* ── 10. "잘 모름" for exchange ── */
  {
    name: "CHECK_EXCHANGE — Q3 잘 모름 (확인 필요)",
    answers: { q1: 0, q2: 0, q3: 3, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0 },
    expect: {
      stage1Pass: true, // "잘 모름" is not a red flag
      redFlagCount: 0,
      scoreRange: [60, 100],
    },
  },
];

/* ═══════════════════════════════════════════
   Test runner
   ═══════════════════════════════════════════ */

interface AssertResult { pass: boolean; message: string; isWarn?: boolean }

function assert(condition: boolean, msg: string, isWarn = false): AssertResult {
  return { pass: condition, message: msg, isWarn };
}

function validateReport(tc: TestCase, report: Report): AssertResult[] {
  const results: AssertResult[] = [];
  const { expect: e } = tc;

  // ── Structural integrity ──
  results.push(assert(typeof report.overallScore === "number", "overallScore is a number"));
  results.push(assert(["clean", "caution", "danger", "critical"].includes(report.verdict), `verdict "${report.verdict}" is valid`));
  results.push(assert(report.stages.length === 3, "has 3 stages"));
  results.push(assert(typeof report.summary === "string" && report.summary.length > 10, "summary is non-trivial"));
  results.push(assert(typeof report.methodology === "string" && report.methodology.length > 10, "methodology present"));
  results.push(assert(Array.isArray(report.recommendations), "recommendations is array"));

  // ── Deterministic checks ──
  if (e.verdict) {
    results.push(assert(report.verdict === e.verdict, `verdict: expected "${e.verdict}", got "${report.verdict}"`));
  }
  if (e.scoreRange) {
    const [min, max] = e.scoreRange;
    results.push(assert(
      report.overallScore >= min && report.overallScore <= max,
      `overallScore ${report.overallScore} in [${min}, ${max}]`,
    ));
  }
  if (e.stage1Pass !== undefined) {
    results.push(assert(report.stages[0].pass === e.stage1Pass, `stage1 pass: expected ${e.stage1Pass}, got ${report.stages[0].pass}`));
  }
  if (e.redFlagCount !== undefined) {
    results.push(assert(
      report.redFlags.length === e.redFlagCount,
      `redFlags count: expected ${e.redFlagCount}, got ${report.redFlags.length}`,
    ));
  }
  if (e.redFlagCountMin !== undefined) {
    results.push(assert(
      report.redFlags.length >= e.redFlagCountMin,
      `redFlags count: expected >= ${e.redFlagCountMin}, got ${report.redFlags.length}`,
    ));
  }
  if (e.stage2ScoreRange) {
    const s2 = report.stages[1].score;
    results.push(assert(
      s2 >= e.stage2ScoreRange[0] && s2 <= e.stage2ScoreRange[1],
      `stage2 score ${s2} in [${e.stage2ScoreRange[0]}, ${e.stage2ScoreRange[1]}]`,
    ));
  }
  if (e.stage3ScoreRange) {
    const s3 = report.stages[2].score;
    results.push(assert(
      s3 >= e.stage3ScoreRange[0] && s3 <= e.stage3ScoreRange[1],
      `stage3 score ${s3} in [${e.stage3ScoreRange[0]}, ${e.stage3ScoreRange[1]}]`,
    ));
  }

  // ── LLM enrichment quality (warnings, not failures) ──
  if (e.expectCrossPatterns !== undefined) {
    if (e.expectCrossPatterns) {
      results.push(assert(report.crossPatterns.length > 0, "cross-patterns detected (LLM)", true));
    } else {
      results.push(assert(report.crossPatterns.length === 0, "no cross-patterns (LLM)", true));
    }
  }
  if (e.minRecommendations) {
    results.push(assert(
      report.recommendations.length >= e.minRecommendations,
      `recommendations >= ${e.minRecommendations}, got ${report.recommendations.length} (LLM)`,
      true,
    ));
  }
  if (e.expectContext) {
    results.push(assert(report.context.length > 0, "context data points present (LLM)", true));
  }

  // ── LLM explanation coverage ──
  const totalFindings = report.stages.flatMap((s) => s.findings);
  const withExplanation = totalFindings.filter((f) => f.explanation && f.explanation.length > 5);
  results.push(assert(
    withExplanation.length >= totalFindings.length * 0.5,
    `${withExplanation.length}/${totalFindings.length} findings have LLM explanations`,
    true,
  ));

  return results;
}

async function callAPI(answers: Answers): Promise<Report> {
  const resp = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answers),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`API ${resp.status}: ${text}`);
  }
  return resp.json();
}

/* ═══════════════════════════════════════════
   Main
   ═══════════════════════════════════════════ */

async function main() {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║  Clean Crypto Analysis Engine Benchmark    ║");
  console.log("╚════════════════════════════════════════════╝");
  console.log(`API: ${API_URL}\n`);

  // Health check
  try {
    await fetch(API_URL.replace("/api/analyze", "/verify"));
  } catch {
    console.error("ERROR: Dev server not reachable. Run `pnpm dev` first.");
    process.exit(1);
  }

  let totalPass = 0;
  let totalFail = 0;
  let totalWarn = 0;
  let totalTests = 0;
  const failedCases: string[] = [];
  const timings: { name: string; ms: number }[] = [];

  for (const tc of TESTS) {
    console.log(`── ${tc.name} ──`);
    const start = Date.now();

    try {
      const report = await callAPI(tc.answers);
      const elapsed = Date.now() - start;
      timings.push({ name: tc.name, ms: elapsed });

      const results = validateReport(tc, report);
      let caseFailed = false;

      for (const r of results) {
        totalTests++;
        if (r.pass) {
          totalPass++;
          // Only print non-obvious passes
        } else if (r.isWarn) {
          totalWarn++;
          console.log(`   ⚠ WARN: ${r.message}`);
        } else {
          totalFail++;
          caseFailed = true;
          console.log(`   ✗ FAIL: ${r.message}`);
        }
      }

      const passCount = results.filter((r) => r.pass).length;
      const failCount = results.filter((r) => !r.pass && !r.isWarn).length;
      const warnCount = results.filter((r) => !r.pass && r.isWarn).length;

      const statusIcon = failCount > 0 ? "✗" : warnCount > 0 ? "⚠" : "✓";
      console.log(`   ${statusIcon} ${passCount} pass, ${failCount} fail, ${warnCount} warn — ${elapsed}ms`);
      console.log(`   Score: ${report.overallScore} | Verdict: ${report.verdict} | RedFlags: ${report.redFlags.length} | CrossPatterns: ${report.crossPatterns.length}`);

      if (caseFailed) failedCases.push(tc.name);
    } catch (err) {
      const elapsed = Date.now() - start;
      timings.push({ name: tc.name, ms: elapsed });
      totalFail++;
      totalTests++;
      console.log(`   ✗ ERROR: ${err}`);
      failedCases.push(tc.name);
    }

    console.log();
  }

  // ── Summary ──
  console.log("════════════════════════════════════════════");
  console.log("SUMMARY");
  console.log("════════════════════════════════════════════");
  console.log(`Total assertions: ${totalTests}`);
  console.log(`  ✓ Pass: ${totalPass}`);
  console.log(`  ✗ Fail: ${totalFail}`);
  console.log(`  ⚠ Warn: ${totalWarn}`);
  console.log();

  // Timing stats
  const totalMs = timings.reduce((s, t) => s + t.ms, 0);
  const avgMs = Math.round(totalMs / timings.length);
  const maxT = timings.reduce((a, b) => (a.ms > b.ms ? a : b));
  const minT = timings.reduce((a, b) => (a.ms < b.ms ? a : b));
  console.log(`Timing: avg ${avgMs}ms | min ${minT.ms}ms (${minT.name.split(" —")[0]}) | max ${maxT.ms}ms (${maxT.name.split(" —")[0]})`);
  console.log(`Total: ${(totalMs / 1000).toFixed(1)}s for ${timings.length} test cases`);
  console.log();

  if (failedCases.length > 0) {
    console.log(`FAILED CASES: ${failedCases.join(", ")}`);
    process.exit(1);
  } else {
    console.log("ALL DETERMINISTIC CHECKS PASSED");
    if (totalWarn > 0) {
      console.log(`(${totalWarn} LLM quality warnings — review above)`);
    }
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Benchmark crashed:", err);
  process.exit(1);
});
