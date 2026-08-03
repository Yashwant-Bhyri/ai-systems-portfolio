"use client";

import { T } from "../i18n";

import { useEffect, useRef, type ReactNode } from "react";
import { useTour, useStepper, useOnScreen, type ChapterId } from "./director";

export type StepDef = {
  label: string;
  sub: string;
  pilotTitle: string;
  pilotBody: string;
  metrics?: { k: string; v: string }[];
  graphic: (active: boolean) => ReactNode;
};

/**
 * Shared chapter engine: a chronological rail of components on the left,
 * the operational graphic + pilot box for the lit component on the right.
 * Exactly one component is lit at a time; the rail advances itself.
 */
export function ChapterShell({
  id,
  accent,
  kicker,
  title,
  subtitle,
  steps,
  stepMs = 7000,
  footer,
}: {
  id: ChapterId;
  accent: string;
  kicker: string;
  title: string;
  subtitle: string;
  steps: StepDef[];
  stepMs?: number;
  footer?: ReactNode;
}) {
  const { registerSection, chapterDone } = useTour();
  const sectionRef = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(sectionRef);

  useEffect(() => {
    registerSection(id, sectionRef.current);
  }, [id, registerSection]);

  const [step, setStep] = useStepper(steps.length, {
    active: onScreen,
    stepMs,
    startDelayMs: 1200,
    onFirstCycle: () => chapterDone(id),
  });

  const current = steps[step];

  return (
    <section
      ref={sectionRef}
      data-chapter={id}
      className="fable-section chapter"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <header className="chapter-head">
        <p className="chapter-kicker">{kicker}</p>
        <h2 className="chapter-title">{title}</h2>
        <p className="chapter-sub">{subtitle}</p>
      </header>

      <div className="chapter-body">
        <ol className="step-rail" aria-label={T("System components, in execution order")}>
          {steps.map((s, i) => (
            <li key={s.label}>
              <button
                className={`step-box ${i === step ? "is-lit" : ""} ${i < step ? "is-passed" : ""}`}
                onClick={() => setStep(i)}
                aria-current={i === step}
              >
                <span className="step-idx">{String(i + 1).padStart(2, "0")}</span>
                <span className="step-meta">
                  <span className="step-label">{s.label}</span>
                  <span className="step-sub">{s.sub}</span>
                </span>
                {i === step && <span className="step-live" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ol>

        <div className="chapter-stage">
          <div className="stage-graphic" key={step}>
            {current.graphic(onScreen)}
          </div>
          <aside className="pilot-box" key={`p${step}`}>
            <h3 className="pilot-title">{current.pilotTitle}</h3>
            <p className="pilot-body">{current.pilotBody}</p>
            {current.metrics && (
              <dl className="pilot-metrics">
                {current.metrics.map((m) => (
                  <div key={m.k} className="pilot-metric">
                    <dt>{m.k}</dt>
                    <dd>{m.v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </aside>
        </div>
      </div>

      {footer && <div className="chapter-footer">{footer}</div>}
    </section>
  );
}
