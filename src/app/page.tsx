import MirrorCards from "@/components/mirror-cards";
import HeroVisual from "@/components/hero-visual";
import HowItWorks from "@/components/how-it-works";
import RiskCards from "@/components/risk-cards";

function HeroBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full animate-float-slow opacity-25"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, #a5f3fc 0%, #67e8f9 30%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-20 -left-40 w-[400px] h-[400px] rounded-full animate-float-slower opacity-15"
        style={{
          background:
            "radial-gradient(circle at 60% 50%, #bae6fd 0%, #7dd3fc 40%, transparent 70%)",
        }}
      />
      <div className="absolute inset-0 dot-grid opacity-30" />
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-2" aria-hidden="true">
      <svg width="120" height="8" viewBox="0 0 120 8" fill="none">
        <path
          d="M0 4h48c2 0 4-3 8-3s6 3 8 3h48"
          stroke="#e8ecf2"
          strokeWidth="1"
        />
        <circle cx="60" cy="4" r="2.5" fill="#1fb8cd" opacity="0.3" />
      </svg>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex-1 overflow-x-hidden">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 card-glass border-b border-white/40">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-5 h-14">
          <span className="font-bold text-lg tracking-tight text-foreground">
            Clean Crypto
          </span>
          <div className="flex items-center gap-5">
            <a href="/dashboard" className="text-sm font-semibold text-muted hover:text-foreground transition-colors">피해 현황</a>
            <a href="/blog" className="text-sm font-semibold text-muted hover:text-foreground transition-colors">블로그</a>
            <a href="/verify" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">검증하기</a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 px-5 grain">
        <HeroBackground />
        <div className="relative mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* Left: Copy */}
          <div className="md:w-1/2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md text-primary-dark text-xs font-semibold px-4 py-2 rounded-full mb-7 border border-primary/10 shadow-sm">
              <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-pulse-soft" />
              무료 · 익명 · 30초 소요
            </div>
            <h1 className="text-3xl md:text-[3.25rem] font-extrabold leading-tight md:leading-[1.15] mb-6 text-foreground tracking-tight">
              당신이 이용하는 리딩방,
              <br />
              <span className="text-gradient">믿을 수 있나요?</span>
            </h1>
            <p className="text-muted text-base md:text-lg leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
              수익 인증은 넘치는데, 내 계좌는 왜 그대로인지
              한 번쯤 의심해본 적 있다면 — 지금 확인해보세요.
            </p>
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

          {/* Right: Product Visual */}
          <div className="md:w-1/2">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* ── Proof Strip ── */}
      <section className="relative py-16 md:py-20 bg-section-bg border-y border-card-border">
        <div className="absolute inset-0 dot-grid opacity-30" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-5 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 text-center">
          {[
            {
              num: "1.3조 원",
              label: "최근 2년간 리딩방 피해 규모",
              source: "경찰청 공식 발표",
            },
            {
              num: "14,629건",
              label: "같은 기간 누적 신고 건수",
              source: "경찰청 집계",
            },
            {
              num: "매일 18건",
              label: "하루 평균 새로운 피해 접수",
              source: "1건당 평균 피해액 9,200만 원",
            },
          ].map((s) => (
            <div key={s.num}>
              <p className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight stat-number">
                {s.num}
              </p>
              <p className="text-muted text-sm mt-2.5">{s.label}</p>
              <p className="text-xs text-muted/60 mt-1.5 tracking-wide uppercase">
                {s.source}
              </p>
            </div>
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* ── Risk Cards (with visual diagrams) ── */}
      <RiskCards />

      {/* ── Mirror Cards ── */}
      <MirrorCards />

      <SectionDivider />

      {/* ── How It Works (vertical with illustrations) ── */}
      <HowItWorks />

      {/* ── Sample Report ── */}
      <section className="relative py-20 md:py-28 bg-section-bg px-5 grain">
        <div className="absolute inset-0 dot-grid opacity-20" aria-hidden="true" />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-primary font-semibold text-sm mb-3 tracking-wide text-center">
            리포트 미리보기
          </p>
          <h2 className="text-2xl md:text-3xl font-bold mb-12 leading-snug text-center">
            이런 결과를 받게 됩니다
          </h2>

          <div className="card-elevated p-6 md:p-8 !rounded-3xl !shadow-xl !shadow-slate-200/60">
            <div className="flex items-center justify-between mb-6 pb-5 border-b border-card-border">
              <div>
                <p className="text-[11px] text-muted mb-1 uppercase tracking-wider">
                  검증 대상
                </p>
                <p className="font-bold text-foreground">██████ VIP 리딩방</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-muted mb-1 uppercase tracking-wider">
                  검증일
                </p>
                <p className="font-semibold text-foreground text-sm">
                  2026.04.04
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5 mb-6">
              <div className="w-[72px] h-[72px] rounded-2xl bg-amber-light flex items-center justify-center shrink-0 relative overflow-hidden">
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 72 72"
                  aria-hidden="true"
                >
                  <circle
                    cx="36"
                    cy="36"
                    r="30"
                    fill="none"
                    stroke="#e8930c"
                    strokeWidth="3"
                    strokeDasharray="188.5"
                    strokeDashoffset="109"
                    strokeLinecap="round"
                    opacity="0.25"
                    transform="rotate(-90 36 36)"
                  />
                </svg>
                <span className="text-2xl font-extrabold text-amber stat-number relative">
                  42
                </span>
              </div>
              <div>
                <p className="font-bold text-foreground mb-0.5">
                  신뢰도 점수: 낮음
                </p>
                <p className="text-muted text-sm">
                  3건의 위험 신호가 탐지되었습니다
                </p>
              </div>
            </div>

            <div className="space-y-2.5 mb-6">
              {[
                {
                  label: "수익률 보장 문구 사용",
                  level: "높음",
                  color: "text-red bg-red-light",
                },
                {
                  label: "손절 콜 비율 비정상적으로 낮음",
                  level: "중간",
                  color: "text-amber bg-amber-light",
                },
                {
                  label: "VIP 업그레이드 유도 패턴",
                  level: "중간",
                  color: "text-amber bg-amber-light",
                },
              ].map((risk) => (
                <div
                  key={risk.label}
                  className="flex items-center justify-between p-3.5 bg-muted-light/60 rounded-xl"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                    <span className="text-sm text-foreground font-medium">
                      {risk.label}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${risk.color}`}
                  >
                    위험 {risk.level}
                  </span>
                </div>
              ))}
            </div>

            <div className="relative mt-4">
              <div className="blur-[6px] select-none pointer-events-none opacity-60">
                <div className="h-3.5 bg-muted-light rounded-lg w-full mb-2" />
                <div className="h-3.5 bg-muted-light rounded-lg w-4/5 mb-2" />
                <div className="h-3.5 bg-muted-light rounded-lg w-3/5" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="card-glass text-sm text-muted font-medium px-5 py-2.5 rounded-xl shadow-sm">
                  검증 후 전체 리포트를 확인하세요
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── Social Proof ── */}
      <section className="py-20 md:py-28 px-5">
        <div className="mx-auto max-w-2xl">
          <p className="text-primary font-semibold text-sm mb-3 tracking-wide text-center">
            이용자 후기
          </p>
          <h2 className="text-2xl md:text-3xl font-bold mb-12 leading-snug text-center">
            먼저 검증한 분들의 이야기
          </h2>

          <div className="space-y-4">
            {[
              {
                quote:
                  "2달 동안 매달 50만 원씩 냈는데, 검증해보니 위험 신호가 4개나 나왔습니다. 바로 나왔어요.",
                author: "30대 직장인",
                verdict: "위험 신호 탐지",
                verdictColor: "text-amber bg-amber-light",
              },
              {
                quote:
                  "혹시나 해서 해봤는데, 제 리딩방은 깨끗하다고 나와서 오히려 안심됐어요.",
                author: "20대 투자자",
                verdict: "클린 확인",
                verdictColor: "text-green bg-green-light",
              },
              {
                quote:
                  "친구가 추천해서 들어간 방이었는데, 피라미드 구조 의심 판정이 나왔습니다. 소름이었어요.",
                author: "40대 자영업자",
                verdict: "구조적 위험",
                verdictColor: "text-red bg-red-light",
              },
            ].map((item, i) => (
              <div key={i} className="card-elevated p-6">
                <svg
                  width="24"
                  height="18"
                  viewBox="0 0 24 18"
                  fill="none"
                  className="mb-3 opacity-10"
                  aria-hidden="true"
                >
                  <path
                    d="M0 18V10.8C0 4.56 3.36 1.08 10.08 0l1.2 2.64C7.08 3.72 5.28 5.88 4.8 9H10V18H0zM14 18V10.8C14 4.56 17.36 1.08 24.08 0l1.2 2.64c-4.2 1.08-6 3.24-6.48 6.36H24V18H14z"
                    fill="currentColor"
                  />
                </svg>
                <p className="text-foreground leading-relaxed mb-4">
                  {item.quote}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-muted text-sm">{item.author}</span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${item.verdictColor}`}
                  >
                    {item.verdict}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section
        id="verify"
        className="relative py-24 md:py-32 px-5 overflow-hidden grain"
      >
        <div className="absolute inset-0" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, #f0fbfc 0%, #e8f8fa 40%, #ffffff 100%)",
            }}
          />
          <div className="absolute inset-0 dot-grid opacity-25" />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full animate-pulse-soft opacity-20"
            style={{
              background:
                "radial-gradient(circle, #a5f3fc 0%, transparent 70%)",
            }}
          />
        </div>
        <div className="relative mx-auto max-w-lg text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-snug text-foreground">
            검증에 30초,
            <br />
            피해 복구에는 30개월.
          </h2>
          <p className="text-muted mb-10 text-base">
            의심이 드는 지금이 가장 빠른 타이밍입니다.
          </p>
          <a
            href="#verify"
            className="group inline-flex items-center gap-2.5 bg-primary text-white font-semibold px-10 py-4 rounded-2xl hover:bg-primary-dark transition-all text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
          >
            지금 무료로 검증하기
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
          <p className="text-muted text-xs mt-6">
            개인정보를 수집하지 않습니다 · 완전 익명
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 border-t border-card-border px-5">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
          <span className="font-semibold text-foreground tracking-tight">
            Clean Crypto
          </span>
          <p className="text-muted/70">
            © 2026 Clean Crypto. 리딩방 신뢰의 새로운 기준.
          </p>
        </div>
      </footer>
    </main>
  );
}
