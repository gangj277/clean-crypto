function FrontRunDiagram() {
  return (
    <div className="relative h-36 mb-4 bg-muted-light/30 rounded-xl p-3 overflow-hidden">
      <svg viewBox="0 0 280 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Price line */}
        <path
          d="M20 75 Q60 70, 80 65 Q100 60, 120 45 Q140 30, 170 20 Q190 15, 200 18 Q220 25, 240 50 Q255 65, 270 80"
          fill="none"
          stroke="#e8ecf2"
          strokeWidth="2"
        />
        {/* Green area up to peak */}
        <path
          d="M20 75 Q60 70, 80 65 Q100 60, 120 45 Q140 30, 170 20 Q190 15, 200 18 L200 100 L20 100Z"
          fill="#0fae7b"
          opacity="0.06"
        />
        {/* Red area after peak */}
        <path
          d="M200 18 Q220 25, 240 50 Q255 65, 270 80 L270 100 L200 100Z"
          fill="#e5484d"
          opacity="0.06"
        />

        {/* Leader buys - dark marker */}
        <circle cx="60" cy="72" r="6" fill="#1a1e2e" />
        <text x="60" y="92" textAnchor="middle" fontSize="7" fill="#8892a5" fontWeight="600">
          리더 매수
        </text>

        {/* Signal broadcast */}
        <g transform="translate(130, 38)">
          <rect x="-18" y="-8" width="36" height="16" rx="4" fill="#1fb8cd" opacity="0.15" />
          <text textAnchor="middle" y="3" fontSize="7" fill="#0d95a8" fontWeight="700">
            시그널
          </text>
        </g>

        {/* Crowd enters */}
        <g transform="translate(175, 18)">
          {[0, 8, 16].map((dx) => (
            <circle key={dx} cx={dx} cy={0} r="4" fill="#bae6fd" stroke="white" strokeWidth="1" />
          ))}
        </g>
        <text x="183" y="36" textAnchor="middle" fontSize="7" fill="#8892a5" fontWeight="600">
          회원 매수
        </text>

        {/* Leader sells at peak */}
        <circle cx="200" cy="18" r="6" fill="#e5484d" />
        <text x="200" y="10" textAnchor="middle" fontSize="7" fill="#e5484d" fontWeight="700">
          리더 매도
        </text>

        {/* Arrow showing crowd stuck */}
        <path d="M220 30 L240 50" stroke="#e5484d" strokeWidth="1.5" strokeDasharray="3 2" markerEnd="url(#arrowRed)" />
        <defs>
          <marker id="arrowRed" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0 0 L6 3 L0 6" fill="none" stroke="#e5484d" strokeWidth="1" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

function FakeProofDiagram() {
  return (
    <div className="relative h-36 mb-4 bg-muted-light/30 rounded-xl p-3 flex items-center justify-center overflow-hidden">
      {/* Base phone screen */}
      <div className="relative w-28">
        <div className="bg-white rounded-lg border border-card-border p-2 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-muted" />
            <div className="h-1 bg-muted-light rounded w-12" />
          </div>
          {/* Real chart - going down */}
          <div className="h-10 relative mb-1">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <path d="M0 10 Q20 8, 35 15 Q50 25, 70 30 Q85 33, 100 35" fill="none" stroke="#e5484d" strokeWidth="1.5" opacity="0.4" />
              <path d="M0 10 Q20 8, 35 15 Q50 25, 70 30 Q85 33, 100 35 L100 40 L0 40Z" fill="#e5484d" opacity="0.04" />
            </svg>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red" />
            <span className="text-[7px] text-red font-bold">-350,000원</span>
          </div>
        </div>

        {/* Fake overlay screenshot - lifted and offset */}
        <div
          className="absolute -top-2 -right-3 w-28 bg-white rounded-lg border border-card-border p-2 shadow-lg rotate-2"
          style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green" />
            <div className="h-1 bg-green-light rounded w-12" />
          </div>
          <div className="h-10 relative mb-1">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <path d="M0 35 Q20 30, 35 22 Q50 15, 70 10 Q85 6, 100 4" fill="none" stroke="#0fae7b" strokeWidth="1.5" />
              <path d="M0 35 Q20 30, 35 22 Q50 15, 70 10 Q85 6, 100 4 L100 40 L0 40Z" fill="#0fae7b" opacity="0.06" />
            </svg>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green" />
            <span className="text-[7px] text-green font-bold">+1,250,000원</span>
          </div>

          {/* Edit handles hint */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-amber opacity-60 rounded-br-sm" />
          <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-amber opacity-60 rounded-tl-sm" />
        </div>
      </div>

      {/* Magnifier */}
      <div className="absolute bottom-2 right-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" opacity="0.3">
          <circle cx="10" cy="10" r="7" stroke="#1fb8cd" strokeWidth="1.5" />
          <path d="M15 15l5 5" stroke="#1fb8cd" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function PyramidDiagram() {
  return (
    <div className="relative h-36 mb-4 bg-muted-light/30 rounded-xl p-3 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 200 110" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Upward arrows */}
        <path d="M60 78 L90 52" stroke="#e8ecf2" strokeWidth="1" strokeDasharray="3 2" />
        <path d="M140 78 L110 52" stroke="#e8ecf2" strokeWidth="1" strokeDasharray="3 2" />
        <path d="M95 45 L100 28" stroke="#e8ecf2" strokeWidth="1" strokeDasharray="3 2" />
        <path d="M105 45 L100 28" stroke="#e8ecf2" strokeWidth="1" strokeDasharray="3 2" />

        {/* Top: Leader */}
        <circle cx="100" cy="20" r="10" fill="#1fb8cd" opacity="0.2" stroke="#1fb8cd" strokeWidth="1.5" />
        <text x="100" y="23" textAnchor="middle" fontSize="7" fill="#0d95a8" fontWeight="700">방장</text>

        {/* Middle: Paying members */}
        {[75, 100, 125].map((x, i) => (
          <g key={i}>
            <circle cx={x} cy="50" r="8" fill="#bae6fd" opacity="0.4" stroke="#38bdf8" strokeWidth="1" />
            <text x={x} y="53" textAnchor="middle" fontSize="5" fill="#64748b" fontWeight="600">유료</text>
          </g>
        ))}

        {/* Bottom: New members */}
        {[40, 65, 90, 110, 135, 160].map((x, i) => (
          <g key={i}>
            <circle cx={x} cy="82" r="6" fill="#e8ecf2" stroke="#cbd5e1" strokeWidth="0.8" />
          </g>
        ))}
        <text x="100" y="100" textAnchor="middle" fontSize="7" fill="#8892a5" fontWeight="500">신규 가입비</text>

        {/* Money flow arrows */}
        <path d="M85 42 L97 28" stroke="#e8930c" strokeWidth="1.2" opacity="0.6" markerEnd="url(#arrowAmber)" />
        <path d="M115 42 L103 28" stroke="#e8930c" strokeWidth="1.2" opacity="0.6" markerEnd="url(#arrowAmber)" />
        <defs>
          <marker id="arrowAmber" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0 0 L5 2.5 L0 5" fill="none" stroke="#e8930c" strokeWidth="0.8" />
          </marker>
        </defs>

        {/* Won symbols */}
        <text x="88" y="36" fontSize="7" fill="#e8930c" fontWeight="700" opacity="0.7">₩</text>
        <text x="108" y="36" fontSize="7" fill="#e8930c" fontWeight="700" opacity="0.7">₩</text>
      </svg>
    </div>
  );
}

function HideLossDiagram() {
  return (
    <div className="relative h-36 mb-4 bg-muted-light/30 rounded-xl p-3 flex items-center justify-center overflow-hidden">
      {/* Ledger/report */}
      <div className="relative w-44">
        <div className="bg-white rounded-lg border border-card-border p-2.5 shadow-sm">
          {/* Visible rows - green */}
          <div className="space-y-1 mb-1">
            {[
              { coin: "BTC", pnl: "+12.5%", color: "text-green" },
              { coin: "ETH", pnl: "+8.3%", color: "text-green" },
              { coin: "SOL", pnl: "+23.1%", color: "text-green" },
            ].map((r) => (
              <div key={r.coin} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-green" />
                  <span className="text-[8px] font-semibold text-foreground">{r.coin}</span>
                </div>
                <span className={`text-[8px] font-bold ${r.color}`}>{r.pnl}</span>
              </div>
            ))}
          </div>

          {/* Hidden rows - partially covered */}
          <div className="relative">
            <div className="space-y-1 opacity-30">
              {[
                { coin: "AVAX", pnl: "-45.2%", color: "text-red" },
                { coin: "DOGE", pnl: "-67.8%", color: "text-red" },
                { coin: "LINK", pnl: "-31.4%", color: "text-red" },
              ].map((r) => (
                <div key={r.coin} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-red" />
                    <span className="text-[8px] font-semibold text-foreground">{r.coin}</span>
                  </div>
                  <span className={`text-[8px] font-bold ${r.color}`}>{r.pnl}</span>
                </div>
              ))}
            </div>

            {/* Cover/mask overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/90 to-white rounded-b-lg flex items-center justify-center">
              <div className="bg-muted-light/80 rounded px-2 py-0.5">
                <span className="text-[7px] font-semibold text-muted">삭제됨</span>
              </div>
            </div>
          </div>
        </div>

        {/* Peeking red bar chart behind */}
        <div className="absolute -bottom-1 -right-2 w-20 opacity-25">
          <div className="flex items-end gap-[2px] h-8">
            {[5, 8, 3, 7, 4, 9, 6].map((h, i) => (
              <div key={i} className="flex-1 bg-red rounded-t-sm" style={{ height: `${h * 3}px` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RiskCards() {
  const risks = [
    {
      Diagram: FrontRunDiagram,
      title: "선행매매",
      desc: "리더가 먼저 매수한 뒤, 회원에게 추천합니다. 가격이 오르면 리더만 수익.",
    },
    {
      Diagram: FakeProofDiagram,
      title: "수익 인증 조작",
      desc: "스크린샷은 얼마든지 조작 가능합니다. 보여주고 싶은 것만 보여줍니다.",
    },
    {
      Diagram: PyramidDiagram,
      title: "피라미드 구조",
      desc: "신규 회원의 가입비가 기존 회원의 '수익'이 되는 구조일 수 있습니다.",
    },
    {
      Diagram: HideLossDiagram,
      title: "손실 은폐",
      desc: "실패한 콜은 삭제하고, 성공한 콜만 남깁니다. 승률은 만들어지는 겁니다.",
    },
  ];

  return (
    <section className="py-20 md:py-28 px-5">
      <div className="mx-auto max-w-3xl">
        <p className="text-primary font-semibold text-sm mb-3 tracking-wide">
          왜 검증이 필요한가
        </p>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-snug">
          그럴듯해 보이는 것과
          <br />
          실제로 정상인 것은 다릅니다
        </h2>
        <p className="text-muted text-base mb-12">
          금감원 적발 기준, 유사투자자문업 700개 중 112곳(16%)에서 불법 행위가
          확인됐습니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {risks.map(({ Diagram, title, desc }) => (
            <div key={title} className="card-elevated p-5 group">
              <Diagram />
              <h3 className="font-bold text-foreground mb-1.5">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
