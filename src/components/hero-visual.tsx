"use client";

export default function HeroVisual() {
  return (
    <div className="relative w-full max-w-[420px] mx-auto md:mx-0">
      {/* Background glow */}
      <div
        className="absolute -inset-8 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, #a5f3fc 0%, #67e8f9 40%, transparent 70%)",
        }}
      />

      <div className="relative">
        {/* ── Top: Noisy Room Preview ── */}
        <div className="bg-white rounded-2xl border border-card-border shadow-sm p-4 mb-3">
          {/* Room header */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">████ VIP 리딩방</p>
              <p className="text-[10px] text-muted">멤버 2,847명</p>
            </div>
            <div className="ml-auto flex -space-x-1.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full border-2 border-white"
                  style={{ background: ["#a5f3fc", "#bae6fd", "#c4b5fd", "#fde68a"][i] }}
                />
              ))}
              <div className="w-5 h-5 rounded-full border-2 border-white bg-muted-light flex items-center justify-center">
                <span className="text-[7px] text-muted font-bold">+</span>
              </div>
            </div>
          </div>

          {/* Chat bubbles - noisy */}
          <div className="space-y-1.5">
            <div className="flex gap-2 items-end">
              <div className="bg-muted-light rounded-xl rounded-bl-sm px-3 py-1.5 max-w-[70%]">
                <p className="text-[10px] text-foreground">지금 매수 타이밍입니다 🔥</p>
              </div>
            </div>
            <div className="flex gap-2 items-end">
              <div className="bg-green-light rounded-xl rounded-bl-sm px-3 py-1.5">
                <p className="text-[10px] text-green font-bold">+280% 수익 달성 💰</p>
              </div>
            </div>
            <div className="flex gap-2 items-end">
              <div className="bg-muted-light rounded-xl rounded-bl-sm px-3 py-1.5 max-w-[65%]">
                <p className="text-[10px] text-foreground">VIP방 오시면 핵심 콜...</p>
              </div>
            </div>
            {/* Fake profit screenshot */}
            <div className="bg-muted-light/50 rounded-lg p-2 max-w-[60%] border border-card-border">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-green" />
                <span className="text-[8px] font-bold text-green">+1,250,000원</span>
              </div>
              <div className="h-8 relative overflow-hidden rounded">
                <svg viewBox="0 0 120 32" className="w-full h-full">
                  <path d="M0 28 L20 24 L40 26 L60 18 L80 8 L100 4 L120 2" fill="none" stroke="#0fae7b" strokeWidth="1.5" />
                  <path d="M0 28 L20 24 L40 26 L60 18 L80 8 L100 4 L120 2 L120 32 L0 32Z" fill="#0fae7b" opacity="0.08" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ── Middle: Scan Line ── */}
        <div className="relative my-1 flex items-center justify-center">
          <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
          <div className="relative bg-white border border-primary/30 rounded-full px-4 py-1.5 shadow-sm shadow-primary/10 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary">
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            </svg>
            <span className="text-[10px] font-bold text-primary tracking-wide">검증 분석 중</span>
          </div>
        </div>

        {/* ── Bottom: Clean Report Output ── */}
        <div className="bg-white rounded-2xl border border-card-border shadow-lg shadow-slate-200/60 p-4 mt-3">
          <div className="flex items-center gap-3 mb-3">
            {/* Donut score */}
            <div className="relative w-12 h-12 shrink-0">
              <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                <circle cx="24" cy="24" r="18" fill="none" stroke="#e8ecf2" strokeWidth="4" />
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  fill="none"
                  stroke="#e8930c"
                  strokeWidth="4"
                  strokeDasharray="113.1"
                  strokeDashoffset="65"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-amber">
                42
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">신뢰도 낮음</p>
              <p className="text-[10px] text-muted">위험 신호 3건 탐지</p>
            </div>
          </div>

          {/* Risk pills */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-red-light text-red">
              수익률 보장
            </span>
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-amber-light text-amber">
              손절 비율 이상
            </span>
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-amber-light text-amber">
              VIP 유도
            </span>
          </div>
        </div>

        {/* Floating satellite chips */}
        <div className="absolute -left-4 top-1/3 bg-white rounded-lg px-2.5 py-1 border border-card-border shadow-sm animate-float-slower text-[9px] text-muted font-medium hidden md:block">
          t.me/████
        </div>
        <div className="absolute -right-6 top-2/3 bg-amber-light rounded-lg px-2.5 py-1 border border-amber/10 shadow-sm animate-float-slow text-[9px] text-amber font-semibold hidden md:block">
          ⚠ 이상 패턴
        </div>
      </div>
    </div>
  );
}
