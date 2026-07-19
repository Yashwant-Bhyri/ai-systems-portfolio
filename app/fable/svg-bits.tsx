"use client";

/** Shared SVG vocabulary for the operational graphics. */

export function Node({
  x,
  y,
  w,
  h,
  label,
  sub,
  lit,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  lit?: boolean;
}) {
  return (
    <g className={`svg-node ${lit ? "is-lit" : ""}`}>
      <rect x={x} y={y} width={w} height={h} rx={10} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 6 : h / 2 + 1)} className="svg-label" textAnchor="middle">
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 13} className="svg-sub" textAnchor="middle">
          {sub}
        </text>
      )}
    </g>
  );
}

export function Packet({ path, dur, delay = 0, cls = "" }: { path: string; dur: number; delay?: number; cls?: string }) {
  return (
    <circle r={4.5} className={`svg-packet ${cls}`}>
      <animateMotion dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" path={path} />
    </circle>
  );
}
