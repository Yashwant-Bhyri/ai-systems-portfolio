"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { useT } from "./i18n";
import "./live-scenes.css";

/** How heavily a target role draws on an engineering pillar. */
type Draw = 1 | 2 | 3;
type DrawByRole = readonly [Draw, Draw, Draw];

type TargetRole = {
  id: string;
  lines: readonly [string, string];
  short: string;
  /** Why this is a target role — always argued from the capabilities. */
  why: string;
};

type Pillar = {
  id: string;
  label: string;
  /** Broad capability names, never narrowed to a single vendor or tool. */
  skills: readonly string[];
  draw: DrawByRole;
};

const ROLE_ADVANCE_MS = 9600;

/* --- map geometry (viewBox 1320 x 440) --- */
const ROLE_X = 14;
const ROLE_W = 290;
const ROLE_H = 94;
const ROLE_Y = [66, 186, 306];
const PILLAR_X = 560;
const PILLAR_W = 746;
const PILLAR_H = 76;
const PILLAR_Y = [28, 110, 192, 274, 356];
const EDGE_FROM = ROLE_X + ROLE_W;
const EDGE_TO = PILLAR_X;

const SR_ONLY_STYLE: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export function ProfileSection() {
  const t = useT();
  const profile = t.profile;
  const roles = profile.roles as unknown as TargetRole[];
  const pillars = profile.pillars as unknown as Pillar[];
  const totalSkills = pillars.reduce((sum, pillar) => sum + pillar.skills.length, 0);
  const sectionRef = useRef<HTMLElement>(null);
  const mapRef = useRef<SVGSVGElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeRole, setActiveRole] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "-14% 0px -14%",
      threshold: 0.08,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const autoplaying = playing && !reducedMotion;
  const running = visible && autoplaying;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setActiveRole((value) => (value + 1) % roles.length);
    }, ROLE_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [running, roles.length]);

  const role = roles[activeRole];
  const drawn = pillars.reduce(
    (sum, pillar) => sum + (pillar.draw[activeRole] >= 2 ? pillar.skills.length : 0),
    0,
  );

  function handleRoleKeys(event: KeyboardEvent<SVGSVGElement>) {
    if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") setActiveRole(0);
    else if (event.key === "End") setActiveRole(roles.length - 1);
    else if (event.key === "ArrowDown") setActiveRole((value) => (value + 1) % roles.length);
    else setActiveRole((value) => (value - 1 + roles.length) % roles.length);
  }

  return (
    <section
      ref={sectionRef}
      id="profile"
      className="vx-profile vx-section-shell vx-accent-lime vx-page"
      data-vx-page
      data-role={role.id}
      data-playing={autoplaying}
    >
      <header className="vx-profile-head">
        <div>
          <span className="vx-lens-label">{profile.headline}</span>
          <h2>{profile.subheadline}</h2>
        </div>
        <button
          type="button"
          className="vx-map-pause"
          aria-pressed={!autoplaying}
          disabled={reducedMotion}
          onClick={() => setPlaying((value) => !value)}
        >
          <i data-playing={autoplaying} aria-hidden="true" />
          {reducedMotion ? profile.staticView : autoplaying ? profile.pause : profile.resume}
        </button>
      </header>

      {/* The argument, stated before the map demonstrates it. */}
      <div className="vx-role-why" key={role.id}>
        <span className="vx-lens-label">{profile.whyLabel}</span>
        <p>{role.why}</p>
        <strong>
          {drawn}
          <i>/{totalSkills}</i>
          <small>{profile.capabilitiesDrawn}</small>
        </strong>
      </div>

      <div className="vx-role-map" data-motion-paused={!autoplaying}>
        <svg
          ref={mapRef}
          viewBox="0 0 1320 440"
          className="op-svg"
          role="tablist"
          aria-label={profile.mapAria}
          tabIndex={0}
          onKeyDown={handleRoleKeys}
        >
          <text x={ROLE_X} y={16} className="lv-phase small" style={{ fontSize: 12 }}>
            {profile.targetRolesLabel}
          </text>
          <text x={PILLAR_X} y={16} className="lv-phase small" style={{ fontSize: 12 }}>
            {profile.pillarsLabel.replace("{total}", String(totalSkills))}
          </text>

          {/* Only the active role's edges are ever drawn — five lines, never fifteen. */}
          {pillars.map((pillar, pillarIndex) => {
            const weight = pillar.draw[activeRole];
            const roleCy = ROLE_Y[activeRole] + ROLE_H / 2;
            const pillarCy = PILLAR_Y[pillarIndex] + PILLAR_H / 2;
            const path = `M ${EDGE_FROM} ${roleCy} C ${EDGE_FROM + 82} ${roleCy}, ${EDGE_TO - 82} ${pillarCy}, ${EDGE_TO} ${pillarCy}`;
            return (
              <g key={pillar.id}>
                <path
                  d={path}
                  className={weight === 3 ? "lv-edge win" : "lv-edge"}
                  style={{ strokeWidth: 0.9 + weight * 0.85, opacity: 0.2 + weight * 0.26 }}
                />
                {weight >= 2 && !reducedMotion ? (
                  <circle
                    r={weight === 3 ? 4.2 : 3.2}
                    className="lv-pulse vx-map-pulse"
                    style={{ offsetPath: `path("${path}")`, animationDelay: `${-pillarIndex * 0.36}s` } as CSSProperties}
                  />
                ) : null}
              </g>
            );
          })}

          {roles.map((item, index) => {
            const active = index === activeRole;
            const y = ROLE_Y[index];
            return (
              <g
                key={item.id}
                role="tab"
                aria-selected={active}
                tabIndex={-1}
                onClick={() => setActiveRole(index)}
                style={{ cursor: "pointer" }}
              >
                <g className={`lv-node ${active ? "is-live" : ""}`}>
                  <rect x={ROLE_X} y={y} width={ROLE_W} height={ROLE_H} rx={10} style={{ opacity: active ? 1 : 0.5 }} />
                </g>
                <rect
                  x={ROLE_X}
                  y={y}
                  width={3}
                  height={ROLE_H}
                  className="lv-bar"
                  style={{ opacity: active ? 1 : 0.15 }}
                />
                <text x={ROLE_X + 18} y={y + 24} className="svg-sub" style={{ opacity: active ? 1 : 0.55 }}>
                  {String(index + 1).padStart(2, "0")}
                </text>
                {item.lines.map((line, lineIndex) => (
                  <text
                    key={line}
                    x={ROLE_X + 18}
                    y={y + 48 + lineIndex * 20}
                    className="svg-label"
                    style={{ fontSize: 19, opacity: active ? 1 : 0.5 }}
                  >
                    {line}
                  </text>
                ))}
                <text x={ROLE_X + 18} y={y + 84} className="svg-sub tiny" style={{ fontSize: 12, opacity: active ? 0.9 : 0.4 }}>
                  {item.short}
                </text>
              </g>
            );
          })}

          {pillars.map((pillar, pillarIndex) => {
            const weight = pillar.draw[activeRole];
            const y = PILLAR_Y[pillarIndex];
            return (
              <g key={pillar.id}>
                <g className={`lv-node ${weight === 3 ? "is-live" : ""}`}>
                  <rect x={PILLAR_X} y={y} width={PILLAR_W} height={PILLAR_H} rx={10} style={{ opacity: weight === 1 ? 0.42 : 1 }} />
                </g>
                <text x={PILLAR_X + 18} y={y + 26} className="svg-label" style={{ fontSize: 17, opacity: weight === 1 ? 0.5 : 1 }}>
                  {pillar.label}
                </text>
                {/* Degree of responsibility this role places on the pillar. */}
                {[0, 1, 2].map((segment) => (
                  <rect
                    key={segment}
                    x={PILLAR_X + PILLAR_W - 62 + segment * 16}
                    y={y + 15}
                    width={11}
                    height={5}
                    rx={2.5}
                    className={segment < weight ? "lv-bar" : "lv-bar bg"}
                    style={{ opacity: segment < weight ? 1 : 0.3 }}
                  />
                ))}
                {pillar.skills.map((skill, skillIndex) => (
                  <text
                    key={skill}
                    x={PILLAR_X + 18 + (skillIndex % 2) * 372}
                    y={y + 50 + Math.floor(skillIndex / 2) * 18}
                    className="svg-mono tinytext"
                    style={{ fontSize: 13.5, opacity: weight === 1 ? 0.34 : weight === 2 ? 0.72 : 1 }}
                  >
                    {skill}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      <output style={SR_ONLY_STYLE} aria-live="polite">
        {profile.liveUpdate
          .replace("{role}", role.lines.join(" "))
          .replace("{drawn}", String(drawn))
          .replace("{total}", String(totalSkills))}
      </output>
    </section>
  );
}
