"use client";

import type { ReactNode } from "react";
import { highlight } from "./compute/stagecraft/stage-meter";
import "./conclusion-board.css";

/**
 * The end of a walkthrough: not a recap of its parts but the answer to "so what?".
 * One sentence says what the project achieved, the measures prove it, every piece of
 * work sits beside what it bought, and one line says what was learned.
 */
export type ConclusionSpec = {
  /** One sentence; `*phrase*` marks the phrase that matters. */
  verdict: string;
  measures?: readonly { label: string; from?: string; to: string; unit?: string }[];
  groups: readonly { title: string; rows: readonly { what: string; how: string; result: string }[] }[];
  learned?: string;
  note?: string;
  links?: readonly { title: string; href: string }[];
};

export function ConclusionBoard({ spec, extra }: { spec: ConclusionSpec; extra?: ReactNode }) {
  let order = 0;
  const next = () => ({ animationDelay: `${160 + order++ * 90}ms` });
  return (
    <div className="cb-root">
      <p className="cb-verdict">{highlight(spec.verdict)}</p>
      {spec.measures && (
        <dl className="cb-measures">
          {spec.measures.map((m) => (
            <div key={m.label} className="cb-in" style={next()}>
              <dt>{m.label}</dt>
              <dd>{m.from && <s>{m.from}</s>}{m.from && <i aria-hidden="true">→</i>}<b>{m.to}</b>{m.unit && <small>{m.unit}</small>}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="cb-groups" data-count={spec.groups.length}>
        {spec.groups.map((g) => (
          <section key={g.title}>
            <h4 className="cb-in" style={next()}>{g.title}</h4>
            <ul>
              {g.rows.map((r) => (
                <li key={r.what} className="cb-in" style={next()}>
                  <strong>{r.what}</strong>
                  <span>{r.how}</span>
                  <b>{r.result}</b>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {spec.learned && <p className="cb-learned cb-in" style={next()}><small>What it showed</small>{spec.learned}</p>}
      {(spec.links?.length || spec.note) && (
        <footer className="cb-foot cb-in" style={next()}>
          {spec.links?.map((l) => <a key={l.href} href={l.href}>{l.title} <i aria-hidden="true">↗</i></a>)}
          {spec.note && <small>{spec.note}</small>}
        </footer>
      )}
      {extra ? <div className="cb-extra">{extra}</div> : null}
    </div>
  );
}

const sentence = (label: string) => label.charAt(0) + label.slice(1).toLowerCase();
/** Projects without a measured ledger conclude from their own proof points. */
export function conclusionFromProof(proof: readonly { label: string; value: string; detail: string }[]): ConclusionSpec {
  const main = proof.find((p) => p.label === "IMPACT") ?? proof.find((p) => p.label === "OUTPUT") ?? proof[0];
  return {
    verdict: `*${main.value}*: ${main.detail.charAt(0).toLowerCase()}${main.detail.slice(1)}`,
    groups: [{ title: "What was built", rows: proof.filter((p) => p !== main).map((p) => ({ what: sentence(p.label), how: p.detail, result: p.value })) }],
  };
}
