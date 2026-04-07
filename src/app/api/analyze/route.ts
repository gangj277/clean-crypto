import { analyzeLeadingRoom, type VerifyAnswers } from "@/lib/analysis-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate all 9 answers exist and are valid indices
    const required = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9"] as const;
    const maxOptions = [3, 3, 4, 4, 4, 4, 4, 4, 4]; // max option count per question

    for (let i = 0; i < required.length; i++) {
      const key = required[i];
      const val = body[key];
      if (typeof val !== "number" || val < 0 || val >= maxOptions[i]) {
        return Response.json(
          { error: `Invalid answer for ${key}: expected 0-${maxOptions[i] - 1}, got ${val}` },
          { status: 400 },
        );
      }
    }

    const answers: VerifyAnswers = {
      q1: body.q1, q2: body.q2, q3: body.q3,
      q4: body.q4, q5: body.q5, q6: body.q6,
      q7: body.q7, q8: body.q8, q9: body.q9,
    };

    const report = await analyzeLeadingRoom(answers);
    return Response.json(report);
  } catch (err) {
    console.error("Analysis route error:", err);
    return Response.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 },
    );
  }
}
