"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { useT } from "./i18n";
import "./live-scenes.css";
import "./profile-section.css";

/**
 * What I'm built for: three target roles beside one stack of five layers, product at the top and
 * infrastructure at the bottom. Each layer names its skills and links to the projects that prove them.
 * The roles take turns; the one in focus wires itself to the layers it draws on, heavier where it
 * draws more, and the rest of the stack steps back.
 */
type Draw = 1 | 2 | 3;
type TargetRole = { id: string; lines: readonly [string, string]; short: string; why: string };
type Pillar = { id: string; label: string; layer: string; skills: readonly string[]; draw: readonly [Draw, Draw, Draw]; proof: readonly string[] };

const ROLE_ADVANCE_MS = 9600;

const SR_ONLY_STYLE: CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0,
};

type Wire = { d: string; weight: Draw };

export function ProfileSection() {
  const t = useT();
  const profile = t.profile;
  const roles = profile.roles as unknown as TargetRole[];
  const pillars = profile.pillars as unknown as Pillar[];
  const totalSkills = pillars.reduce((sum, pillar) => sum + pillar.skills.length, 0);
  const sectionRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const roleRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState(false);
  const [activeRole, setActiveRole] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [wires, setWires] = useState<Wire[]>([]);

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
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "-14% 0px -14%", threshold: 0.08 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const autoplaying = playing && !reducedMotion;
  const running = visible && autoplaying;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setActiveRole((value) => (value + 1) % roles.length), ROLE_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [running, roles.length, activeRole]);

  // The wires run from the role in focus to every layer it draws on; measured, so they follow the layout.
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const measure = () => {
      const box = body.getBoundingClientRect();
      const from = roleRefs.current[activeRole]?.getBoundingClientRect();
      if (!from || window.innerWidth < 900) { setWires([]); return; }
      const x0 = from.right - box.left, y0 = from.top + from.height / 2 - box.top;
      const next: Wire[] = [];
      pillars.forEach((pillar, i) => {
        const weight = pillar.draw[activeRole];
        const to = layerRefs.current[i]?.getBoundingClientRect();
        if (!to || weight < 2) return;
        const x1 = to.left - box.left, y1 = to.top + to.height / 2 - box.top, mid = (x0 + x1) / 2;
        next.push({ d: `M${x0},${y0} C${mid},${y0} ${mid},${y1} ${x1},${y1}`, weight });
      });
      setWires(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    return () => observer.disconnect();
  }, [activeRole, pillars]);

  const role = roles[activeRole];
  const drawn = pillars.reduce((sum, pillar) => sum + (pillar.draw[activeRole] >= 2 ? pillar.skills.length : 0), 0);
  const deep = pillars.filter((pillar) => pillar.draw[activeRole] === 3).length;

  function handleRoleKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? roles.length - 1 : event.key === "ArrowDown" ? (activeRole + 1) % roles.length : (activeRole - 1 + roles.length) % roles.length;
    setActiveRole(next);
    roleRefs.current[next]?.focus();
  }

  return (
    <section
      ref={sectionRef}
      id="profile"
      className="vx-profile pf vx-section-shell vx-accent-lime vx-page"
      data-vx-page
      data-role={role.id}
      data-playing={autoplaying}
    >
      <header className="pf-head">
        <div>
          <span className="vx-lens-label">{profile.headline}</span>
          <h2>{profile.subheadline}</h2>
        </div>
        <button type="button" className="vx-map-pause" aria-pressed={!autoplaying} disabled={reducedMotion} onClick={() => setPlaying((value) => !value)}>
          <i data-playing={autoplaying} aria-hidden="true" />
          {reducedMotion ? profile.staticView : autoplaying ? profile.pause : profile.resume}
        </button>
      </header>

      <div ref={bodyRef} className="pf-body">
        <div className="pf-roles" role="tablist" aria-label={profile.mapAria} aria-orientation="vertical" onKeyDown={handleRoleKeys}>
          <span className="pf-col-label">{profile.targetRolesLabel}</span>
          {roles.map((item, index) => {
            const active = index === activeRole;
            return (
              <button
                key={item.id}
                ref={(node) => { roleRefs.current[index] = node; }}
                type="button"
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                className="pf-role"
                data-active={active || undefined}
                onClick={() => setActiveRole(index)}
              >
                <span className="pf-role-n">{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.lines.join(" ")}</strong>
                <small>{item.short}</small>
                {active && (
                  <span className="pf-role-more" key={item.id}>
                    <span className="pf-why">{item.why}</span>
                    <span className="pf-cover">
                      {profile.coverage.split(/(\{drawn\}|\{total\}|\{deep\})/).map((part, k) =>
                        part === "{drawn}" ? <b key={k}>{drawn}</b> : part === "{total}" ? <b key={k}>{totalSkills}</b> : part === "{deep}" ? <b key={k}>{deep}</b> : part)}
                    </span>
                  </span>
                )}
                {active && running && <i className="pf-timer" key={`t${activeRole}`} style={{ animationDuration: `${ROLE_ADVANCE_MS}ms` }} aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        <svg className="pf-wires" aria-hidden="true">
          {wires.map((wire, i) => (
            <g key={`${activeRole}-${i}`} data-weight={wire.weight}>
              <path d={wire.d} className="pf-wire" />
              {running && <circle r={3.5} className="pf-pulse"><animateMotion dur="2.4s" repeatCount="indefinite" path={wire.d} begin={`${i * 0.3}s`} /></circle>}
            </g>
          ))}
        </svg>

        <div className="pf-stack">
          <span className="pf-col-label">{profile.pillarsLabel.replace("{total}", String(totalSkills))}</span>
          {pillars.map((pillar, i) => {
            const weight = pillar.draw[activeRole];
            return (
              <div key={pillar.id} ref={(node) => { layerRefs.current[i] = node; }} className="pf-layer" data-weight={weight}>
                <div className="pf-layer-head">
                  <small>{pillar.layer}</small>
                  <strong>{pillar.label}</strong>
                  <span className="pf-depth" aria-label={`${weight} / 3`}>{[0, 1, 2].map((k) => <i key={k} data-on={k < weight || undefined} />)}</span>
                </div>
                <ul className="pf-skills">{pillar.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
                <div className="pf-proof">
                  <small>{profile.proofLabel}</small>
                  {pillar.proof.map((id) => <a key={id} href={`#${id}`}>{profile.projectNames[id] ?? id}<i aria-hidden="true">↗</i></a>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <output style={SR_ONLY_STYLE} aria-live="polite">
        {profile.liveUpdate.replace("{role}", role.lines.join(" ")).replace("{drawn}", String(drawn)).replace("{total}", String(totalSkills))}
      </output>
    </section>
  );
}
