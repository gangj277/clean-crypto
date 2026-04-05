"use client";

import { useState } from "react";

interface MirrorCard {
  statement: string;
  followUp: string;
}

const cards: MirrorCard[] = [
  {
    statement:
      "익절 캡처는 계속 올라오는데, 정작 나는 그 가격에 못 들어갔다.",
    followUp:
      "결과 캡처와 실제로 따라갈 수 있었는지는 별개의 문제입니다.",
  },
  {
    statement:
      "오를 땐 '우리 콜 적중', 손절 나면 '매매는 본인 책임'이었다.",
    followUp:
      "성과는 방의 공으로, 손실은 내 판단 탓으로 돌리는 구조인지 살펴보세요.",
  },
  {
    statement:
      "불안하다고 했더니, 설명보다 VIP방 업그레이드가 먼저 나왔다.",
    followUp:
      "불안을 줄여주는 대신 결제를 늘리려는 순간이 있었는지 체크해보세요.",
  },
  {
    statement:
      "손실 얘기가 나오면 방은 조용해지고, 수익 인증만 계속 올라왔다.",
    followUp:
      "분위기가 근거를 대신하면, 의심보다 동조가 쉬워집니다.",
  },
];

export default function MirrorCards() {
  const [responses, setResponses] = useState<Record<number, "seen" | "not-seen">>({});
  const seenCount = Object.values(responses).filter((v) => v === "seen").length;
  const answeredCount = Object.keys(responses).length;

  function handleResponse(index: number, value: "seen" | "not-seen") {
    setResponses((prev) => ({ ...prev, [index]: value }));
  }

  return (
    <section className="relative py-20 md:py-28 bg-section-bg">
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" aria-hidden="true" />
      <div className="relative mx-auto max-w-2xl px-5">
        <p className="text-primary font-semibold text-sm mb-3 tracking-wide">
          셀프 체크
        </p>
        <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-snug">
          혹시, 이런 장면 익숙하지 않으신가요?
        </h2>
        <p className="text-muted mb-10 text-base md:text-lg">
          누군가를 단정하려는 게 아닙니다.
          <br className="hidden md:block" /> 내 방이 실제로 어떻게 운영되는지만
          체크해보세요.
        </p>

        {/* Progress indicator */}
        {answeredCount > 0 && (
          <div className="flex items-center gap-2 mb-6 animate-fade-in">
            {cards.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  responses[i] === "seen"
                    ? "bg-amber"
                    : responses[i] === "not-seen"
                      ? "bg-green"
                      : "bg-card-border"
                }`}
              />
            ))}
          </div>
        )}

        <div className="space-y-4">
          {cards.map((card, i) => {
            const answered = responses[i] !== undefined;
            const isSeen = responses[i] === "seen";

            return (
              <div
                key={i}
                className={`card-elevated p-6 md:p-7 transition-all duration-500 ${
                  answered ? "opacity-90" : ""
                }`}
              >
                {/* Card number */}
                <div className="flex items-start gap-4">
                  <span className="text-xs font-bold text-muted/40 mt-1 shrink-0 w-5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <p className="text-foreground font-medium text-base md:text-lg leading-relaxed mb-5">
                      &ldquo;{card.statement}&rdquo;
                    </p>

                    {!answered ? (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleResponse(i, "seen")}
                          className="flex-1 py-3 rounded-xl text-sm font-semibold bg-primary-light text-primary-dark hover:bg-primary/15 transition-all cursor-pointer hover:shadow-sm active:scale-[0.98]"
                        >
                          봤어요
                        </button>
                        <button
                          onClick={() => handleResponse(i, "not-seen")}
                          className="flex-1 py-3 rounded-xl text-sm font-semibold bg-muted-light text-muted hover:bg-slate-200 transition-all cursor-pointer hover:shadow-sm active:scale-[0.98]"
                        >
                          없었어요
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`rounded-xl px-4 py-3.5 text-sm leading-relaxed animate-fade-in border ${
                          isSeen
                            ? "bg-amber-light border-amber/15 text-amber-800"
                            : "bg-green-light border-green/15 text-green-800"
                        }`}
                      >
                        {isSeen
                          ? card.followUp
                          : "다행이에요. 다음 항목도 확인해보세요."}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {seenCount >= 2 && (
          <div className="mt-12 text-center animate-fade-in-up">
            <div className="inline-block card-glass px-6 py-5 rounded-2xl mb-6">
              <p className="text-foreground font-semibold text-base md:text-lg">
                겹치는 장면이 보인다면, 검증해볼 타이밍입니다.
              </p>
            </div>
            <br />
            <a
              href="#verify"
              className="group inline-flex items-center gap-2.5 bg-primary text-white font-semibold px-8 py-4 rounded-2xl hover:bg-primary-dark transition-all text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              내 리딩방 검증하기
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-1"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
