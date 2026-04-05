"use client";

import { useState } from "react";
import type { MonthlyData, FraudType, PlatformBreakdown, YearlyData } from "@/lib/dashboard";

/* ═══════════════════════════════════════════
   1. MONTHLY BAR CHART — pure SVG
   ═══════════════════════════════════════════ */

const CHART_W = 720;
const CHART_H = 200;
const PAD = { top: 8, right: 12, bottom: 28, left: 42 };
const INNER_W = CHART_W - PAD.left - PAD.right;
const INNER_H = CHART_H - PAD.top - PAD.bottom;

export function MonthlyChart({ data }: { data: MonthlyData[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxVal = Math.max(...data.map((d) => d.cases));
  const yMax = Math.ceil(maxVal / 100) * 100;
  const barW = INNER_W / data.length - 2;

  function barColor(damageEok: number) {
    if (damageEok >= 630) return "#e5484d";
    if (damageEok >= 560) return "#e8930c";
    return "#1fb8cd";
  }

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    y: PAD.top + INNER_H * (1 - pct),
    label: Math.round(yMax * pct),
  }));

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* grid lines */}
        {gridLines.map((g) => (
          <g key={g.label}>
            <line
              x1={PAD.left}
              y1={g.y}
              x2={CHART_W - PAD.right}
              y2={g.y}
              stroke="#e8ecf2"
              strokeWidth="0.5"
            />
            <text
              x={PAD.left - 6}
              y={g.y + 3}
              textAnchor="end"
              fill="#8892a5"
              fontSize="8"
              fontWeight="500"
            >
              {g.label}
            </text>
          </g>
        ))}

        {/* bars */}
        {data.map((d, i) => {
          const barH = (d.cases / yMax) * INNER_H;
          const x = PAD.left + (INNER_W / data.length) * i + 1;
          const y = PAD.top + INNER_H - barH;
          const isHov = hovered === i;

          return (
            <g
              key={d.month}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {/* hover highlight bg */}
              {isHov && (
                <rect
                  x={x - 1}
                  y={PAD.top}
                  width={barW + 2}
                  height={INNER_H}
                  fill="#f0fbfc"
                  rx="2"
                />
              )}
              {/* actual bar */}
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                fill={barColor(d.damageEok)}
                opacity={isHov ? 1 : 0.72}
                rx="1.5"
                ry="1.5"
              >
                <animate
                  attributeName="height"
                  from="0"
                  to={barH}
                  dur="0.6s"
                  begin={`${i * 0.02}s`}
                  fill="freeze"
                />
                <animate
                  attributeName="y"
                  from={PAD.top + INNER_H}
                  to={y}
                  dur="0.6s"
                  begin={`${i * 0.02}s`}
                  fill="freeze"
                />
              </rect>
            </g>
          );
        })}

        {/* x-axis labels */}
        {data.map((d, i) => {
          const x = PAD.left + (INNER_W / data.length) * i + barW / 2 + 1;
          const monthNum = parseInt(d.month.split("-")[1]);
          const yr = d.month.split("-")[0].slice(2);
          const showLabel = monthNum % 3 === 1;
          if (!showLabel) return null;
          return (
            <text
              key={`label-${d.month}`}
              x={x}
              y={CHART_H - 4}
              textAnchor="middle"
              fill="#8892a5"
              fontSize="7.5"
              fontWeight="500"
            >
              {monthNum === 1 ? `'${yr}` : `${monthNum}월`}
            </text>
          );
        })}

        {/* baseline */}
        <line
          x1={PAD.left}
          y1={PAD.top + INNER_H}
          x2={CHART_W - PAD.right}
          y2={PAD.top + INNER_H}
          stroke="#e8ecf2"
          strokeWidth="1"
        />
      </svg>

      {/* floating tooltip */}
      {hovered !== null && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: `${((PAD.left + (INNER_W / data.length) * hovered + barW / 2) / CHART_W) * 100}%`,
            top: "0px",
            transform: "translateX(-50%)",
          }}
        >
          <div className="bg-foreground text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
            <span className="opacity-60">{data[hovered].month}</span>
            <span className="mx-1.5">·</span>
            <span>{data[hovered].cases.toLocaleString()}건</span>
            <span className="mx-1.5">·</span>
            <span>{data[hovered].damageEok}억원</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   2. FRAUD TYPE DONUT — conic gradient + interactive center
   ═══════════════════════════════════════════ */

const DONUT_COLORS = ["#1fb8cd", "#0d95a8", "#38bdf8", "#e8930c", "#e5484d"];

export function FraudDonut({ data }: { data: FraudType[] }) {
  const [active, setActive] = useState(0);
  const total = data.reduce((s, d) => s + d.percentage, 0);

  let cum = 0;
  const segments = data.map((d, i) => {
    const start = (cum / total) * 360;
    cum += d.percentage;
    const end = (cum / total) * 360;
    return { ...d, start, end, color: DONUT_COLORS[i] };
  });

  const conicStops = segments
    .map((s, i) => {
      const opacity = i === active ? "" : "cc";
      return `${s.color}${opacity} ${s.start}deg ${s.end}deg`;
    })
    .join(", ");

  return (
    <div className="flex flex-col md:flex-row items-center gap-8">
      {/* donut */}
      <div className="relative shrink-0">
        <div
          className="w-40 h-40 rounded-full transition-all duration-300"
          style={{
            background: `conic-gradient(${conicStops})`,
            boxShadow: "0 4px 24px rgba(31,184,205,0.12)",
          }}
        >
          <div className="absolute inset-[18px] rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
            <span
              className="text-2xl font-extrabold stat-number transition-colors duration-200"
              style={{ color: DONUT_COLORS[active] }}
            >
              {data[active].percentage}%
            </span>
            <span className="text-[10px] font-semibold text-foreground mt-0.5">
              {data[active].type}
            </span>
          </div>
        </div>
      </div>

      {/* legend */}
      <div className="flex-1 space-y-2.5 w-full">
        {segments.map((s, i) => (
          <button
            key={s.type}
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer text-left ${
              i === active ? "bg-muted-light/60" : "hover:bg-muted-light/30"
            }`}
          >
            <div
              className="w-3 h-3 rounded-[4px] shrink-0 transition-transform duration-200"
              style={{
                backgroundColor: s.color,
                transform: i === active ? "scale(1.25)" : "scale(1)",
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold transition-colors ${i === active ? "text-foreground" : "text-muted"}`}>
                  {s.type}
                </span>
                <span className="text-xs font-bold stat-number text-foreground">{s.percentage}%</span>
              </div>
              <p className="text-[10px] text-muted truncate">{s.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   3. PLATFORM BARS — with icons
   ═══════════════════════════════════════════ */

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#1fb8cd" opacity="0.12" />
      <path d="M8.5 13.5l1.5 4 2-2 3.5 2.5 3-11-14 5.5 4 1z" stroke="#1fb8cd" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#e8930c" opacity="0.12" />
      <ellipse cx="12" cy="11.5" rx="5.5" ry="4" stroke="#e8930c" strokeWidth="1.3" />
      <path d="M9.5 15.5l-1 3 3-1.5" stroke="#e8930c" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#7c3aed" opacity="0.12" />
      <path d="M9 16c1-1 2-1.5 3-1.5s2 .5 3 1.5" stroke="#7c3aed" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="9.5" cy="12" r="1" fill="#7c3aed" />
      <circle cx="14.5" cy="12" r="1" fill="#7c3aed" />
      <path d="M8 9.5c1-.5 2.5-.8 4-.8s3 .3 4 .8" stroke="#7c3aed" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function OtherIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#8892a5" opacity="0.12" />
      <circle cx="8" cy="12" r="1.2" fill="#8892a5" />
      <circle cx="12" cy="12" r="1.2" fill="#8892a5" />
      <circle cx="16" cy="12" r="1.2" fill="#8892a5" />
    </svg>
  );
}

const PLATFORM_ICONS: Record<string, () => React.JSX.Element> = {
  텔레그램: TelegramIcon,
  카카오톡: KakaoIcon,
  디스코드: DiscordIcon,
  기타: OtherIcon,
};

const PLATFORM_COLORS: Record<string, string> = {
  텔레그램: "#1fb8cd",
  카카오톡: "#e8930c",
  디스코드: "#7c3aed",
  기타: "#8892a5",
};

export function PlatformBars({ data }: { data: PlatformBreakdown[] }) {
  return (
    <div className="space-y-4">
      {data.map((d) => {
        const Icon = PLATFORM_ICONS[d.platform] || OtherIcon;
        const color = PLATFORM_COLORS[d.platform] || "#8892a5";
        return (
          <div key={d.platform} className="flex items-center gap-3">
            <Icon />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-foreground">{d.platform}</span>
                <span className="text-sm font-bold stat-number" style={{ color }}>
                  {d.percentage}%
                </span>
              </div>
              <div className="h-2.5 bg-muted-light rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${d.percentage}%`,
                    backgroundColor: color,
                    animation: `bar-grow 0.8s cubic-bezier(0.16,1,0.3,1) forwards`,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes bar-grow {
          from { transform: scaleX(0); transform-origin: left; }
          to { transform: scaleX(1); transform-origin: left; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════
   4. YEARLY COMPARISON — infographic style
   ═══════════════════════════════════════════ */

export function YearlyComparison({ data }: { data: YearlyData[] }) {
  const maxDamage = Math.max(...data.map((d) => d.damageEok));
  const maxCases = Math.max(...data.map((d) => d.cases));

  return (
    <div className="space-y-5">
      {data.map((y, idx) => {
        const damagePct = (y.damageEok / maxDamage) * 100;
        const casesPct = (y.cases / maxCases) * 100;
        const isMax = y.damageEok === maxDamage;

        return (
          <div
            key={y.year}
            className={`rounded-2xl p-4 transition-all ${
              isMax ? "bg-red-light/40 border border-red/10" : "bg-muted-light/30 border border-card-border/50"
            }`}
          >
            {/* year header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold text-foreground stat-number">
                  {y.label}
                </span>
                {isMax && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red/10 text-red">
                    최대 피해
                  </span>
                )}
              </div>
              {y.arrests > 0 && (
                <div className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0d95a8" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" opacity="0.3" />
                  </svg>
                  <span className="text-xs font-bold text-primary stat-number">
                    {y.arrests.toLocaleString()}명 검거
                  </span>
                </div>
              )}
            </div>

            {/* damage bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted font-medium">피해액</span>
                <span className="text-sm font-extrabold text-red stat-number">
                  {y.damageEok.toLocaleString()}억원
                </span>
              </div>
              <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${damagePct}%`,
                    background: isMax
                      ? "linear-gradient(90deg, #e5484d 0%, #ff8a8a 100%)"
                      : "linear-gradient(90deg, #e8930c 0%, #ffc164 100%)",
                    animation: `bar-grow 0.9s cubic-bezier(0.16,1,0.3,1) ${idx * 0.15}s both`,
                  }}
                />
              </div>
            </div>

            {/* cases bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted font-medium">신고 건수</span>
                <span className="text-sm font-extrabold text-foreground stat-number">
                  {y.cases.toLocaleString()}건
                </span>
              </div>
              <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${casesPct}%`,
                    background: "linear-gradient(90deg, #1fb8cd 0%, #67e8f9 100%)",
                    animation: `bar-grow 0.9s cubic-bezier(0.16,1,0.3,1) ${idx * 0.15 + 0.1}s both`,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
