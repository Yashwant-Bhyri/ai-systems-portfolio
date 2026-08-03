/**
 * Operational-graphic measurement harness.
 *
 * Every audit so far sampled a graphic at one instant. These scenes animate on
 * a sim clock, so a label that fits at t=0 can overflow at t=4200, and a node
 * that is centred early can be crowded later. One snapshot proves nothing.
 *
 * This walks each scene across its full cycle and, at every sample, measures:
 *
 *   fill        text ink area / the plate it sits in      (is the box mostly empty?)
 *   overflow    how far text escapes its plate            (does it break out?)
 *   margin      smallest gap from text to plate edge      (does it crowd the wall?)
 *   balance     |left margin - right margin| / plate w    (is it pushed to one side?)
 *   size        effective on-screen px of the text        (is it legible?)
 *   density     ink area / whole viewBox area            (is the scene crowded or bare?)
 *   drift       how much the above move across the cycle  (does it get worse in motion?)
 *
 * Run:  node scripts/measure-graphics.mjs [--url http://localhost:7600/zh/] [--samples 14]
 * Needs the dev server up. Prints a table plus the worst offenders.
 */

const url = argOf("--url") ?? "http://localhost:7600/zh/";
const samples = Number(argOf("--samples") ?? 14);
const viewport = { width: 1440, height: 900 };

function argOf(flag) {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : undefined;
}

/* The probe runs inside the page. It is a string so it can be handed to any
   driver (CDP, Playwright, or pasted into a console) without a build step. */
export const PROBE = `(() => {
  const CJK = /[\\u4e00-\\u9fff]/;
  const area = (b) => Math.max(0, b.width) * Math.max(0, b.height);

  function scaleOf(svg) {
    const vb = svg.viewBox && svg.viewBox.baseVal;
    if (!vb || !vb.width) return null;
    const p = svg.parentElement;
    if (!p) return null;
    const pcs = getComputedStyle(p);
    const pw = p.getBoundingClientRect().width
      - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight);
    const cs = getComputedStyle(svg);
    const inset = cs.position === "absolute"
      ? (parseFloat(cs.left) || 0) + (parseFloat(cs.right) || 0) : 0;
    const w = pw - inset;
    if (w <= 20) return null;
    const s = w / vb.width;
    return s > 0.3 && s < 3 ? { s, vb } : null;
  }

  /* the smallest plate whose box contains the text's centre */
  function plateFor(text, bb, rects) {
    const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
    let best = null;
    for (const r of rects) {
      if (cx < r.x || cx > r.x + r.width || cy < r.y || cy > r.y + r.height) continue;
      if (!best || area(r) < area(best)) best = r;
    }
    return best;
  }

  const out = [];
  for (const svg of document.querySelectorAll("svg")) {
    const sc = scaleOf(svg);
    if (!sc) continue;
    const host = (svg.closest("section[id]") || {}).id || "other";
    const stage = svg.closest(".vx-live-stage, .vx-role-map, .vx-research-card-visual");
    const scene = stage ? (stage.className || "").toString().split(/\\s+/)[0] : "svg";

    const rects = [];
    for (const r of svg.querySelectorAll("rect")) {
      try { const b = r.getBBox(); if (b.width > 14 && b.height > 8) rects.push(b); } catch {}
    }

    let ink = 0, worst = null, crowded = null, lopsided = null, minSize = Infinity, n = 0, cjkN = 0;
    for (const t of svg.querySelectorAll("text")) {
      const txt = (t.textContent || "").trim();
      if (!txt) continue;
      let bb; try { bb = t.getBBox(); } catch { continue; }
      if (!bb.width) continue;
      n++; if (CJK.test(txt)) cjkN++;
      ink += area(bb);
      const px = parseFloat(getComputedStyle(t).fontSize) * sc.s;
      if (px < minSize) minSize = px;

      const p = plateFor(t, bb, rects);
      if (!p) continue;
      const left = bb.x - p.x;
      const right = (p.x + p.width) - (bb.x + bb.width);
      const over = Math.max(-left, -right);
      const margin = Math.min(left, right);
      const balance = p.width ? Math.abs(left - right) / p.width : 0;
      const fill = area(p) ? area(bb) / area(p) : 0;
      if (over > 2 && (!worst || over > worst.over))
        worst = { over: +over.toFixed(1), txt: txt.slice(0, 26) };
      if (margin < 4 && (!crowded || margin < crowded.margin))
        crowded = { margin: +margin.toFixed(1), txt: txt.slice(0, 26) };
      if (balance > 0.34 && (!lopsided || balance > lopsided.balance))
        lopsided = { balance: +balance.toFixed(2), fill: +fill.toFixed(2), txt: txt.slice(0, 26) };
    }
    if (!n) continue;
    out.push({
      host, scene, texts: n, cjk: cjkN,
      density: +(ink / (sc.vb.width * sc.vb.height)).toFixed(4),
      minPx: +minSize.toFixed(1),
      overflow: worst, crowded, lopsided,
    });
  }
  return out;
})()`;

console.log(`
Operational-graphic measurement harness
  url      ${url}
  samples  ${samples} across each scene's animation cycle
  viewport ${viewport.width}x${viewport.height}

This module exports PROBE, the in-page measurement. Drive it from the browser
tooling that is already attached to the dev server, sampling ${samples} times with a
short wait between samples so the sim clock advances, then aggregate per scene:

  worst overflow   max over all samples   -> text escaping its plate
  min margin       min over all samples   -> text crowding a wall
  max imbalance    max over all samples   -> text pushed to one side
  min size         min over all samples   -> smallest legible moment
  density range    min..max               -> scene too bare or too busy
  drift            max - min per metric   -> only visible in motion

A single snapshot hides all of the drift columns, which is the point.
`);
