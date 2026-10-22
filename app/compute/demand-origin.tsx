import "./demand-origin.css";

type Point = { x: number; y: number };

const AGENTS = Array.from({ length: 10 }, (_, i) => i);
const DISPLAY_GROUPS = Array.from({ length: 100 }, (_, i) => i);
const DISPLAY_ROWS = Array.from({ length: 10 }, (_, i) => i);
// One path per group keeps ten agents countable at the wide scale without
// adding one thousand React nodes to every film-clock update.
const GROUP_DOTS = AGENTS.map((i) => {
  const x = -9 + (i % 5) * 4.5;
  const y = -3.3 + Math.floor(i / 5) * 6.6;
  return `M${x - 1.05} ${y}a1.05 1.05 0 1 0 2.1 0a1.05 1.05 0 1 0-2.1 0`;
}).join("");

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const phase = (progress: number, start: number, end: number) =>
  ease((progress - start) / (end - start));
const between = (a: number, b: number, t: number) => a + (b - a) * t;
const move = (from: Point, to: Point, t: number): Point => ({
  x: between(from.x, to.x, t),
  y: between(from.y, to.y, t),
});

const firstAgent = (i: number): Point => ({
  x: 88 + (i % 5) * 128,
  y: 151 + Math.floor(i / 5) * 143,
});
const firstDisplayGroup = (i: number): Point => ({
  x: 60 + (i % 5) * 16,
  y: 140 + Math.floor(i / 5) * 24,
});
const fullGroup = (i: number): Point => ({
  x: 60 + (i % 10) * 69,
  y: 99 + Math.floor(i / 10) * 31,
});
const compactGroup = (i: number): Point => ({
  x: 34 + (i % 10) * 12.4,
  y: 154 + Math.floor(i / 10) * 13.5,
});
const firstInFullField = (i: number): Point => ({
  x: 54.8 + (i % 5) * 2.6,
  y: 95.5 + Math.floor(i / 5) * 7,
});
const firstInCompactField = (i: number): Point => ({
  x: 161 + (i % 5) * 8,
  y: 184 + Math.floor(i / 5) * 11,
});
const tileCenter = (i: number): Point => ({
  x: 92 + (i % 5) * 142,
  y: 152 + Math.floor(i / 5) * 148,
});

/**
 * Camera keyframes: ten identifiable agents -> ten groups of ten -> one
 * hundred groups of ten -> the existing input field. The population is always
 * the same 1,000-request replay; zooming reveals more of it. Display groups are
 * a drawing unit, never GPU workers or scheduler batches.
 *
 * This component has no clock. `progress` is the parent's reversible cursor;
 * progress=1 is a complete, still handoff to the FIFO dispatcher at x=214.
 */
export function DemandOrigin({ progress }: { progress: number }) {
  const p = clamp(Number.isFinite(progress) ? progress : 0);
  const toTenGroups = phase(p, 0.2, 0.34);
  const toHundredGroups = phase(p, 0.49, 0.67);
  const toInput = phase(p, 0.79, 0.96);

  const tenOpacity = 1 - phase(p, 0.14, 0.22);
  const hundredOpacity = phase(p, 0.29, 0.37) * (1 - phase(p, 0.48, 0.57));
  const thousandCaptionOpacity =
    phase(p, 0.56, 0.66) * (1 - phase(p, 0.79, 0.89));
  const inputOpacity = phase(p, 0.85, 0.97);
  const gridOpacity = phase(p, 0.51, 0.64);

  const firstPositions = AGENTS.map((i) => {
    const inTenGroups = move(firstAgent(i), firstDisplayGroup(i), toTenGroups);
    const inHundredGroups = move(
      inTenGroups,
      firstInFullField(i),
      toHundredGroups,
    );
    return move(inHundredGroups, firstInCompactField(i), toInput);
  });
  const firstRadius = between(
    between(between(8, 3.5, toTenGroups), 1.5, toHundredGroups),
    2.6,
    toInput,
  );

  const fullRight = between(698, 149, toInput);
  const trunkX = between(716, 205, toInput);
  const outX = between(744, 214, toInput);
  const topY = between(99, 154, toInput);
  const bottomY = between(378, 275.5, toInput);
  const markerWidth = between(31, 9.4, toInput);
  const markerHeight = between(20, 8, toInput);

  return (
    <g
      className="xd-origin"
      aria-hidden="true"
      data-target-requests="1000"
      data-film-progress={p.toFixed(3)}
    >
      {tenOpacity > 0 && (
        <g opacity={tenOpacity}>
          <text x="28" y="54" className="xd-title">
            10 agents in view
          </text>
          <text x="28" y="77" className="xd-subtitle">
            1 request each
          </text>
          {AGENTS.map((i) => {
            const { x, y } = firstAgent(i);
            const packetX = x + 15 + 37 * phase(p, 0, 0.15);
            return (
              <g key={i}>
                <path
                  d={`M${x + 13} ${y}H${x + 59}`}
                  className="xd-send-line"
                />
                <path
                  d={`M${x + 55} ${y - 3}l5 3-5 3`}
                  className="xd-send-arrow"
                />
                <path d={`M${x + 60} ${y}V${y + 59}`} className="xd-branch" />
                <rect
                  x={packetX}
                  y={y - 3.5}
                  width="7"
                  height="7"
                  rx="1"
                  className="xd-request"
                />
                <text x={x} y={y + 33} textAnchor="middle" className="xd-id">
                  A{String(i + 1).padStart(2, "0")}
                </text>
              </g>
            );
          })}
          <path
            d="M148 210H716M148 353H716M716 210V383"
            className="xd-ingress"
          />
          <rect
            x="648"
            y="383"
            width="100"
            height="53"
            rx="4"
            className="xd-tile-first"
          />
          <path d="M661 398h16m-4-4 4 4-4 4" className="xd-send-arrow" />
          <text x="661" y="423" className="xd-subtitle">
            Intake
          </text>
          <text x="28" y="424" className="xd-equation">
            10 agents → 10 requests
          </text>
        </g>
      )}

      {hundredOpacity > 0 && (
        <g opacity={hundredOpacity}>
          <text x="28" y="54" className="xd-title">
            10 display groups
          </text>
          <text x="28" y="77" className="xd-subtitle">
            10 agents each · 100 requests
          </text>
          {AGENTS.map((group) => {
            const { x, y } = tileCenter(group);
            return (
              <g key={group}>
                <rect
                  x={x - 56}
                  y={y - 39}
                  width="112"
                  height="78"
                  rx="4"
                  className={group === 0 ? "xd-tile xd-tile-first" : "xd-tile"}
                />
                <text x={x - 44} y={y - 25} className="xd-id">
                  {group === 0
                    ? "SAME 10"
                    : `GROUP ${String(group + 1).padStart(2, "0")}`}
                </text>
                {group > 0 &&
                  AGENTS.map((agent) => (
                    <circle
                      key={agent}
                      cx={x - 32 + (agent % 5) * 16}
                      cy={y - 12 + Math.floor(agent / 5) * 24}
                      r="3.5"
                      className="xd-other-agent"
                    />
                  ))}
                <path d={`M${x + 42} ${y}h31`} className="xd-bundle-line" />
                {AGENTS.map((agent) => (
                  <rect
                    key={agent}
                    x={x + 54 + (agent % 5) * 3.3}
                    y={y - 5 + Math.floor(agent / 5) * 6}
                    width="2.4"
                    height="2.4"
                    className="xd-bundle-packet"
                  />
                ))}
              </g>
            );
          })}
        </g>
      )}

      {gridOpacity > 0 && (
        <g opacity={gridOpacity}>
          {DISPLAY_GROUPS.map((group) => {
            const row = Math.floor(group / 10);
            const newlyRevealed =
              row === 0 ? 1 : phase(p, 0.54 + row * 0.008, 0.63 + row * 0.008);
            const center = move(fullGroup(group), compactGroup(group), toInput);
            return (
              <g key={group} opacity={newlyRevealed}>
                <rect
                  x={center.x - markerWidth / 2}
                  y={center.y - markerHeight / 2}
                  width={markerWidth}
                  height={markerHeight}
                  rx={between(2.5, 1.5, toInput)}
                  className={group === 0 ? "xd-mark xd-mark-first" : "xd-mark"}
                />
                {group > 0 && (
                  <path
                    d={GROUP_DOTS}
                    transform={`translate(${center.x} ${center.y}) scale(${between(1, 0.36, toInput)} ${between(1, 0.4, toInput)})`}
                    className="xd-mark-dots"
                  />
                )}
              </g>
            );
          })}
          {DISPLAY_ROWS.map((row) => {
            const group = row * 10;
            const y = between(
              fullGroup(group).y,
              compactGroup(group).y,
              toInput,
            );
            return (
              <path
                key={row}
                d={`M${fullRight} ${y}H${trunkX}`}
                className="xd-branch"
                opacity={
                  row === 0 ? 0.62 : row < 5 ? 0.24 * (1 - toInput) : 0.24
                }
              />
            );
          })}
          <path
            d={`M${trunkX} ${topY}V${bottomY}M${trunkX} 216H${outX}`}
            className="xd-ingress"
          />
        </g>
      )}

      {thousandCaptionOpacity > 0 && (
        <g opacity={thousandCaptionOpacity}>
          <text x="28" y="54" className="xd-title">
            100 display groups
          </text>
          <text x="28" y="77" className="xd-subtitle">
            10 agents each · 1,000 requests
          </text>
          <text x="28" y="425" className="xd-equation">
            1 mark = 10 agents
          </text>
        </g>
      )}

      {inputOpacity > 0 && (
        <g opacity={inputOpacity}>
          <text x="28" y="101" className="xd-title xd-title-compact">
            1,000 agents
          </text>
          <text x="28" y="123" className="xd-subtitle">
            1 request each
          </text>
          <rect
            x="28"
            y="141"
            width="180"
            height="150"
            rx="3"
            className="xd-field"
          />
          <rect
            x="155"
            y="160"
            width="47"
            height="45"
            rx="3"
            className="xd-exemplar"
          />
          <text x="159" y="174" className="xd-exemplar-label">
            1–10
          </text>
          <text x="28" y="317" className="xd-subtitle xd-key">
            100 marks × 10 agents
          </text>
        </g>
      )}

      {/* These ten circles retain their React identity and order throughout all four camera scales. */}
      {AGENTS.map((i) => (
        <g key={i}>
          {i === 0 && (
            <circle
              cx={firstPositions[i].x}
              cy={firstPositions[i].y}
              r={firstRadius + between(3, 1.6, toInput)}
              className="xd-first-ring"
            />
          )}
          <circle
            cx={firstPositions[i].x}
            cy={firstPositions[i].y}
            r={firstRadius}
            className={i === 0 ? "xd-agent xd-agent-first" : "xd-agent"}
          />
        </g>
      ))}
    </g>
  );
}
