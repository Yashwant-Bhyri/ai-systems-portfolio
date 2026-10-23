"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import "./exhibit.css";
import { useLang, useTr } from "./i18n";

/* ---------------- viewing mode ---------------- */

export type Mode = "light" | "dev";
const ModeContext = createContext<{ mode: Mode; setMode: (m: Mode) => void }>({
  mode: "light",
  setMode: () => {},
});

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("light");
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("ex-mode");
    } catch {
      /* storage unavailable: stay in light */
    }
    const raf = requestAnimationFrame(() => { if (saved === "dev") setModeState("dev"); });
    return () => cancelAnimationFrame(raf);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.exMode = mode;
  }, [mode]);
  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    try {
      localStorage.setItem("ex-mode", m);
    } catch {
      /* storage unavailable */
    }
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "d" || e.key === "D") setMode(document.documentElement.dataset.exMode === "dev" ? "light" : "dev");
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [setMode]);
  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);
  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export const useMode = () => useContext(ModeContext).mode;

export function ModeSwitch({ compact = false }: { compact?: boolean }) {
  const { mode, setMode } = useContext(ModeContext);
  const tr = useTr();
  return (
    <div className={`ex-mode ${compact ? "is-compact" : ""}`} role="group" aria-label={tr("Viewing depth")}>
      <button type="button" aria-pressed={mode === "light"} onClick={() => setMode("light")}>
        {tr("Light")}
      </button>
      <button type="button" aria-pressed={mode === "dev"} onClick={() => setMode("dev")}>
        {tr("Developer")}
      </button>
    </div>
  );
}

/* ---------------- rooms ---------------- */

export type RoomClock = {
  readTime: () => number;
  playing: boolean;
  reduced: boolean;
  seek: (ms: number) => void;
  toggle: () => void;
};

export type RoomProps = { active: boolean; mode: Mode; clock: RoomClock; tall: boolean; lang: "en" | "zh" };

/** Phones get portrait compositions; every room reads this instead of its own media query. */
export function useTall() {
  const [tall, setTall] = useState(false);
  useEffect(() => {
    const media = matchMedia("(max-width: 760px)");
    const update = () => setTall(media.matches);
    const raf = requestAnimationFrame(update);
    media.addEventListener("change", update);
    return () => { cancelAnimationFrame(raf); media.removeEventListener("change", update); };
  }, []);
  return tall;
}

export type Room = {
  id: string;
  /** Short name on the film strip. */
  label: string;
  /** Mono kicker above the title: terms of art, not a sentence. */
  kicker: string;
  title: ReactNode;
  /** The room's headline result, shown at the top right of the stage. */
  metric?: { value: ReactNode; label: string };
  duration: number;
  /** Beat positions in ms, shown as ticks on the strip. */
  beats?: readonly number[];
  /** Rooms marked false appear only in Developer mode. */
  light?: boolean;
  /** Chinese copy for the room chrome. */
  zh?: { label?: string; kicker?: string; title?: ReactNode; metricLabel?: string };
  /** Developer instruments: the room's raw record, shown under the stage. */
  dev?: { rows: readonly (readonly [string, string])[]; source?: string };
  Scene: (props: RoomProps) => ReactNode;
};

const HOLD_AFTER = 1600;

export function Wing({
  id,
  number,
  name,
  accent,
  rooms,
}: {
  id: string;
  number: string;
  name: string;
  accent: "amber" | "rose";
  rooms: readonly Room[];
}) {
  const mode = useMode();
  const lang = useLang();
  const tr = useTr();
  const tall = useTall();
  const list = useMemo(() => rooms.filter((r) => mode === "dev" || r.light !== false), [rooms, mode]);
  const n = list.length;
  const section = useRef<HTMLElement>(null);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const timeLabel = useRef<HTMLSpanElement>(null);
  const time = useRef(0);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(false);
  const indexRef = useRef(0);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(media.matches);
      if (media.matches) setPlaying(false);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // Scroll is the controller: each room owns one viewport of scroll inside the wing.
  useEffect(() => {
    const onScroll = () => {
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect(), vh = innerHeight;
      setInView(r.top < vh * 0.6 && r.bottom > vh * 0.4);
      const i = Math.max(0, Math.min(n - 1, Math.floor((-r.top + vh * 0.5) / vh)));
      if (i !== indexRef.current) setIndex(i);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, [n]);

  const room = list[Math.min(index, n - 1)];
  const goTo = useCallback(
    (i: number, smooth = true) => {
      const el = section.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + scrollY + Math.max(0, Math.min(n - 1, i)) * innerHeight;
      scrollTo({ top, behavior: smooth && !reduced ? "smooth" : "instant" });
    },
    [n, reduced],
  );

  // Each room starts at zero; reduced motion opens on its settled final frame.
  useEffect(() => {
    time.current = reduced ? room.duration : 0;
  }, [room, reduced]);

  // One clock per wing, running only while the wing is on screen and the tab is visible.
  useEffect(() => {
    let raf = 0, last = 0;
    const tick = (now: number) => {
      const dt = last ? Math.min(100, now - last) : 0;
      last = now;
      if (playing && inView && !document.hidden) {
        time.current += dt;
        if (time.current > room.duration + HOLD_AFTER) {
          if (indexRef.current < n - 1) {
            time.current = room.duration + HOLD_AFTER;
            goTo(indexRef.current + 1);
          } else {
            time.current = room.duration;
            setPlaying(false);
          }
        }
      }
      const p = Math.min(1, time.current / room.duration);
      fills.current.forEach((f, k) => {
        if (f) f.style.transform = `scaleX(${k < index ? 1 : k > index ? 0 : p})`;
      });
      if (timeLabel.current) {
        const s = Math.floor(Math.min(time.current, room.duration) / 1000);
        timeLabel.current.textContent = `${String(index + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")} · ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, inView, room, index, n, goTo]);

  // Verification hook: dispatch `ex:seek` with { wing, ms } to freeze a room at an exact moment.
  useEffect(() => {
    const onSeek = (e: Event) => {
      const d = (e as CustomEvent<{ wing: string; ms: number }>).detail;
      if (d?.wing !== id) return;
      time.current = d.ms;
      setPlaying(false);
    };
    addEventListener("ex:seek", onSeek);
    return () => removeEventListener("ex:seek", onSeek);
  }, [id]);

  // The page's floating contact pill steps aside while a wing holds the screen.
  useEffect(() => {
    if (!inView) return;
    document.documentElement.dataset.exWing = id;
    return () => {
      if (document.documentElement.dataset.exWing === id) delete document.documentElement.dataset.exWing;
    };
  }, [inView, id]);

  // Keyboard while the wing holds the screen.
  useEffect(() => {
    if (!inView) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, button, [role='slider'], [contenteditable]")) return;
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(indexRef.current + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(indexRef.current - 1);
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [inView, goTo]);

  const readTime = useCallback(() => time.current, []);
  const seek = useCallback((ms: number) => {
    time.current = Math.max(0, ms);
  }, []);
  const toggle = useCallback(() => setPlaying((p) => !p), []);
  const clock = useMemo<RoomClock>(() => ({ readTime, playing, reduced, seek, toggle }), [readTime, playing, reduced, seek, toggle]);
  const Scene = room.Scene;
  const zh = lang === "zh" ? room.zh : undefined;

  return (
    <section
      ref={section}
      id={id}
      className={`ex-wing ex-accent-${accent}`}
      style={{ "--ex-rooms": n } as CSSProperties}
      aria-label={`${number} ${tr(name)}`}
    >
      <div className="ex-snaps" aria-hidden="true">
        {list.map((r, k) => <span key={r.id} style={{ top: `${k * 100}svh` }} />)}
      </div>
      <div className="ex-sticky">
        <div className="ex-stage" data-room={room.id}>
          <div className="ex-top">
            <header className="ex-head" key={`h-${room.id}`}>
              <div className="ex-kicker">
                <span className="ex-num">{number}</span>
                <span>{tr(name)}</span>
                <i aria-hidden="true" />
                <span>{zh?.kicker ?? room.kicker}</span>
              </div>
              <h2 className="ex-title">{zh?.title ?? room.title}</h2>
            </header>
            {room.metric && (
              <div className="ex-metric" key={`m-${room.id}`}>
                <b>{room.metric.value}</b>
                <span>{zh?.metricLabel ?? room.metric.label}</span>
              </div>
            )}
          </div>
          <div className="ex-scene" key={`${room.id}-${tall ? "t" : "w"}`}>
            <Scene active={inView} mode={mode} clock={clock} tall={tall} lang={lang} />
          </div>
          {mode === "dev" && room.dev && (
            <dl className="ex-instruments" key={`d-${room.id}`}>
              {room.dev.rows.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
              {room.dev.source && <div className="ex-source"><dt>{tr("source")}</dt><dd>{room.dev.source}</dd></div>}
            </dl>
          )}
        </div>
        <nav className="ex-strip" aria-label={`${tr(name)} · ${tr("rooms")}`}>
          <button type="button" className="ex-play" onClick={toggle} aria-label={tr(playing ? "Pause tour" : "Play tour")}>
            {playing ? (
              <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="2.5" width="3" height="11" rx="1" /><rect x="9.5" y="2.5" width="3" height="11" rx="1" /></svg>
            ) : (
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 2.8v10.4l8.6-5.2z" /></svg>
            )}
          </button>
          <ol className="ex-segs">
            {list.map((r, k) => (
              <li key={r.id} style={{ flexGrow: 1 }} data-duration={r.duration}>
                <button
                  type="button"
                  className={k === index ? "is-on" : k < index ? "is-done" : ""}
                  aria-current={k === index ? "step" : undefined}
                  onClick={() => goTo(k)}
                >
                  <span className="ex-seg-fill" ref={(el) => { fills.current[k] = el; }} />
                  <span className="ex-seg-name">{(lang === "zh" && r.zh?.label) || r.label}</span>
                  {r.beats?.map((b) => (
                    <i key={b} style={{ left: `${(b / r.duration) * 100}%` }} aria-hidden="true" />
                  ))}
                </button>
              </li>
            ))}
          </ol>
          <span className="ex-time" ref={timeLabel} />
          <ModeSwitch compact />
        </nav>
      </div>
    </section>
  );
}

/**
 * Hosts a component authored at a fixed design width and scales it to fit the stage,
 * so a forked scene never pushes its payoff below the fold.
 */
export function Fit({ width = 1240, max = 1.25, children }: { width?: number; max?: number; children: ReactNode }) {
  const tall = useTall();
  if (tall) return <div className="ex-fit is-tall">{children}</div>;
  return <FitScaled width={width} max={max}>{children}</FitScaled>;
}

function FitScaled({ width, max, children }: { width: number; max: number; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [{ scale, top }, setFit] = useState({ scale: 1, top: 0 });
  useLayoutEffect(() => {
    const b = box.current, c = inner.current;
    if (!b || !c) return;
    const fit = () => {
      const h = Math.max(1, c.scrollHeight);
      const s = Math.max(0.3, Math.min(max, b.clientWidth / width, b.clientHeight / h));
      setFit({ scale: s, top: Math.max(0, (b.clientHeight - h * s) / 2) });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(b);
    ro.observe(c);
    return () => ro.disconnect();
  }, [width, max]);
  return (
    <div className="ex-fit" ref={box}>
      <div className="ex-fit-inner" ref={inner} style={{ width, top, transform: `translate(-50%, 0) scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
