export default function HowItWorks() {
  return (
    <section className="py-24 md:py-32 px-5">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm mb-3 tracking-wide">
            이용 방법
          </p>
          <h2 className="text-2xl md:text-3xl font-bold leading-snug">
            30초면 충분합니다
          </h2>
        </div>

        <div className="space-y-6 md:space-y-0">
          {/* ── Step 1: Input ── */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="md:w-1/2 order-2 md:order-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-xl bg-primary-light text-primary-dark text-sm font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-lg text-foreground">
                  리딩방 정보 입력
                </h3>
              </div>
              <p className="text-muted text-sm leading-relaxed pl-11">
                리딩방 이름, 운영 플랫폼, 수수료 구조 등 기본 정보를 입력하세요.
                텔레그램, 카카오톡, 디스코드 모두 지원합니다.
              </p>
            </div>
            {/* Visual: Input form mockup */}
            <div className="md:w-1/2 order-1 md:order-2">
              <div className="card-elevated p-5 max-w-[340px] mx-auto">
                <p className="text-[11px] font-bold text-foreground mb-3">
                  리딩방 검증 요청
                </p>
                {/* Room name field */}
                <div className="mb-2.5">
                  <p className="text-[9px] text-muted mb-1 font-medium">리딩방 이름</p>
                  <div className="bg-muted-light/60 rounded-lg px-3 py-2 border border-card-border flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8892a5" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <span className="text-[10px] text-foreground">████ VIP 코인 리딩방</span>
                    <span className="text-[10px] text-muted ml-auto">|</span>
                  </div>
                </div>
                {/* Platform chips */}
                <div className="mb-2.5">
                  <p className="text-[9px] text-muted mb-1 font-medium">운영 채널</p>
                  <div className="flex gap-1.5">
                    {[
                      { name: "텔레그램", active: true },
                      { name: "카카오톡", active: false },
                      { name: "디스코드", active: false },
                    ].map((p) => (
                      <span
                        key={p.name}
                        className={`text-[9px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                          p.active
                            ? "bg-primary-light text-primary-dark border border-primary/20"
                            : "bg-muted-light text-muted border border-transparent"
                        }`}
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Status */}
                <div className="mb-3">
                  <p className="text-[9px] text-muted mb-1 font-medium">이용 상태</p>
                  <div className="flex gap-1.5">
                    <span className="text-[9px] font-semibold px-2.5 py-1 rounded-lg bg-primary-light text-primary-dark border border-primary/20">
                      유료 이용 중
                    </span>
                    <span className="text-[9px] font-semibold px-2.5 py-1 rounded-lg bg-muted-light text-muted">
                      결제 고민 중
                    </span>
                  </div>
                </div>
                {/* Submit button */}
                <div className="bg-primary rounded-xl py-2 text-center">
                  <span className="text-[10px] font-bold text-white">검증 시작하기</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connector */}
          <div className="hidden md:flex justify-center py-4">
            <svg width="2" height="48" viewBox="0 0 2 48">
              <line x1="1" y1="0" x2="1" y2="48" stroke="#e8ecf2" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
          </div>

          {/* ── Step 2: Analysis ── */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="md:w-1/2">
              <div className="card-elevated p-5 max-w-[340px] mx-auto relative overflow-hidden">
                <p className="text-[11px] font-bold text-foreground mb-4">
                  패턴 분석 진행 중
                </p>
                {/* Analysis core */}
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-32 h-32">
                    {/* Concentric rings */}
                    <svg viewBox="0 0 128 128" className="w-full h-full animate-[spin_12s_linear_infinite]">
                      <circle cx="64" cy="64" r="56" fill="none" stroke="#e8ecf2" strokeWidth="1" strokeDasharray="4 4" />
                      <circle cx="64" cy="64" r="40" fill="none" stroke="#e8ecf2" strokeWidth="1" strokeDasharray="3 3" />
                      <circle cx="64" cy="64" r="24" fill="none" stroke="#1fb8cd" strokeWidth="1.5" opacity="0.4" />
                    </svg>
                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-xl bg-primary-light border border-primary/20 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1fb8cd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 12l2 2 4-4" />
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      </div>
                    </div>
                    {/* Satellite nodes */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1">
                      <div className="bg-white rounded-lg px-2 py-1 border border-card-border shadow-sm">
                        <span className="text-[8px] font-semibold text-foreground">채팅 패턴</span>
                      </div>
                    </div>
                    <div className="absolute bottom-1 right-0 translate-x-2">
                      <div className="bg-white rounded-lg px-2 py-1 border border-card-border shadow-sm">
                        <span className="text-[8px] font-semibold text-foreground">가격 대조</span>
                      </div>
                    </div>
                    <div className="absolute bottom-1 left-0 -translate-x-2">
                      <div className="bg-white rounded-lg px-2 py-1 border border-card-border shadow-sm">
                        <span className="text-[8px] font-semibold text-foreground">캡처 검증</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Analysis items */}
                <div className="space-y-2">
                  {[
                    { label: "선행매매 패턴 대조", status: "완료", color: "text-green" },
                    { label: "수익 인증 진위 확인", status: "완료", color: "text-green" },
                    { label: "구조적 위험 분석", status: "분석 중...", color: "text-primary" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between bg-muted-light/50 rounded-lg px-3 py-2"
                    >
                      <span className="text-[10px] text-foreground font-medium">
                        {item.label}
                      </span>
                      <span className={`text-[9px] font-bold ${item.color}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Scan line animation */}
                <div
                  className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none"
                  style={{
                    animation: "scan-line 3s ease-in-out infinite",
                    top: "50%",
                  }}
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-xl bg-primary-light text-primary-dark text-sm font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-lg text-foreground">패턴 분석</h3>
              </div>
              <p className="text-muted text-sm leading-relaxed pl-11">
                채팅 패턴, 시그널 타이밍, 수익 인증 진위, 구조적 위험 요소를
                종합적으로 분석합니다. 알려진 사기 패턴 DB와 실시간 시장 데이터를
                대조합니다.
              </p>
            </div>
          </div>

          {/* Connector */}
          <div className="hidden md:flex justify-center py-4">
            <svg width="2" height="48" viewBox="0 0 2 48">
              <line x1="1" y1="0" x2="1" y2="48" stroke="#e8ecf2" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
          </div>

          {/* ── Step 3: Report ── */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="md:w-1/2 order-2 md:order-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-xl bg-primary-light text-primary-dark text-sm font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-lg text-foreground">
                  리포트 확인
                </h3>
              </div>
              <p className="text-muted text-sm leading-relaxed pl-11">
                신뢰도 점수, 탐지된 위험 요소, 구체적 분석 근거를 담은 검증
                리포트를 받아보세요. 각 위험 요소별 상세 설명과 대응 가이드를
                함께 제공합니다.
              </p>
            </div>
            {/* Visual: Report card */}
            <div className="md:w-1/2 order-1 md:order-2">
              <div className="card-elevated p-5 max-w-[340px] mx-auto !shadow-xl !shadow-slate-200/60">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-bold text-foreground">검증 리포트</p>
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-amber-light text-amber">
                    주의 필요
                  </span>
                </div>

                {/* Score + donut */}
                <div className="flex items-center gap-4 mb-4 bg-muted-light/40 rounded-xl p-3">
                  <div className="relative w-16 h-16 shrink-0">
                    <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="#e8ecf2" strokeWidth="5" />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        fill="none"
                        stroke="#e8930c"
                        strokeWidth="5"
                        strokeDasharray="163.4"
                        strokeDashoffset="95"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-extrabold text-amber stat-number">
                      42
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">신뢰도 점수</p>
                    <p className="text-[10px] text-muted mt-0.5">
                      100점 만점 중 42점
                    </p>
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`w-5 h-1 rounded-full ${
                            i <= 2 ? "bg-amber" : "bg-card-border"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Risk badges */}
                <div className="space-y-2 mb-3">
                  {[
                    { label: "수익률 보장 문구", level: "높음", dot: "bg-red" },
                    { label: "손절 콜 비율 이상", level: "중간", dot: "bg-amber" },
                    { label: "VIP 업그레이드 유도", level: "중간", dot: "bg-amber" },
                  ].map((r) => (
                    <div
                      key={r.label}
                      className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-lg border border-card-border"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${r.dot}`} />
                      <span className="text-[10px] text-foreground font-medium flex-1">
                        {r.label}
                      </span>
                      <span className="text-[9px] text-muted">{r.level}</span>
                    </div>
                  ))}
                </div>

                {/* Mini timeline */}
                <div className="bg-muted-light/50 rounded-lg p-2.5">
                  <p className="text-[8px] text-muted mb-1.5 font-medium">이상 패턴 타임라인</p>
                  <div className="flex items-end gap-[3px] h-6">
                    {[3, 5, 2, 7, 4, 8, 3, 6, 9, 4, 5, 3, 7, 2, 5, 4, 8, 3, 6, 4].map(
                      (h, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-sm ${
                            [6, 9, 16].includes(i)
                              ? "bg-amber"
                              : "bg-card-border"
                          }`}
                          style={{ height: `${h * 2.5}px` }}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan-line {
          0%, 100% { top: 15%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 85%; opacity: 0; }
        }
      `}</style>
    </section>
  );
}
