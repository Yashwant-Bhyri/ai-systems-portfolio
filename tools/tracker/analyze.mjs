// Stage tracker: analysis of snapshots taken by inject.js.
const area = (r) => Math.max(0, r.w) * Math.max(0, r.h);
const inter = (a, b) => {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
};
const contains = (outer, inner, pad = 1) =>
  outer.x <= inner.x + pad && outer.y <= inner.y + pad && outer.x + outer.w >= inner.x + inner.w - pad && outer.y + outer.h >= inner.y + inner.h - pad;

/** Issues visible in one frame. */
export function frameIssues(s, { minPx = 10 } = {}) {
  const texts = s.texts.filter((t) => t.op > 0.3);
  const issues = [];
  // text over text
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i], b = texts[j];
      if (a.k === b.k) continue;
      const ov = inter(a, b);
      if (ov > 0.25 * Math.min(area(a), area(b))) issues.push({ kind: "text-over-text", label: "text overlap", r: a, detail: `"${a.t || a.k.split(">").pop()}" × "${b.t || b.k.split(">").pop()}"` });
    }
  }
  // text crossed by graphics (lines, bars, markers): a graphic that does not contain the text but cuts through it
  const graphics = s.graphics.filter((g) => g.op > 0.3 && (g.filled || g.stroked || g.tag === "canvas" || g.tag === "img"));
  const rootArea = area(s.root);
  for (const t of texts) {
    if (!t.t && !t.svg) continue;
    for (const g of graphics) {
      if (area(g) > 0.4 * rootArea) continue; // backgrounds and full canvases
      if (contains(g, t, 2)) continue; // chips, pills, cards behind the text
      const ov = inter(t, g);
      if (ov > 0.18 * area(t)) { issues.push({ kind: "text-crossed", label: "crossed by graphic", r: t, detail: `"${t.t}" × ${g.tag} ${g.k.split(">").slice(-2).join(">")}` }); break; }
    }
  }
  for (const t of texts) {
    if (t.clipped) issues.push({ kind: "text-clipped", label: "clipped", r: t, detail: `"${t.t}"` });
    if (t.truncated) issues.push({ kind: "text-truncated", label: "…", r: t, detail: `"${t.t}"` });
    if (t.px > 0 && t.px < minPx && t.op > 0.5 && t.t) issues.push({ kind: "text-small", label: `${t.px}px`, r: t, detail: `"${t.t}" at ${t.px}px` });
  }
  return issues;
}

/** Largest empty rectangle in the root, on a grid, as a share of the root (the "huge gaps"). */
export function gaps(s, cell = 16) {
  // only the part of the root that is on screen
  const top = Math.max(0, s.root.y), bottom = Math.min(s.vh, s.root.y + s.root.h);
  // a stage mostly off screen says nothing about its spacing
  if (bottom - top < 120) return { covered: null, largestEmpty: 0, rect: null, offscreen: true };
  const R0 = { x: s.root.x, y: top, w: s.root.w, h: bottom - top };
  const cols = Math.max(1, Math.floor(R0.w / cell)), rows = Math.max(1, Math.floor(R0.h / cell));
  const grid = Array.from({ length: rows }, () => new Uint8Array(cols));
  const rootArea = area(R0);
  const mark = (r) => {
    const x0 = Math.max(0, Math.floor((r.x - R0.x) / cell)), x1 = Math.min(cols - 1, Math.floor((r.x + r.w - R0.x) / cell));
    const y0 = Math.max(0, Math.floor((r.y - R0.y) / cell)), y1 = Math.min(rows - 1, Math.floor((r.y + r.h - R0.y) / cell));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid[y][x] = 1;
  };
  s.texts.filter((t) => t.op > 0.2).forEach(mark);
  s.graphics.filter((g) => g.op > 0.2 && area(g) < 0.35 * rootArea && (g.filled || g.stroked || g.tag === "canvas")).forEach(mark);
  // maximal rectangle of zeros (histogram method)
  const h = new Array(cols).fill(0);
  let best = { a: 0 };
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) h[x] = grid[y][x] ? 0 : h[x] + 1;
    const st = [];
    for (let x = 0; x <= cols; x++) {
      const cur = x === cols ? 0 : h[x];
      while (st.length && h[st[st.length - 1]] >= cur) {
        const top = st.pop(), height = h[top], left = st.length ? st[st.length - 1] + 1 : 0, width = x - left;
        if (height * width > best.a) best = { a: height * width, x: left, y: y - height + 1, w: width, h: height };
      }
      st.push(x);
    }
  }
  const covered = grid.reduce((a, row) => a + row.reduce((b, v) => b + v, 0), 0) / (rows * cols);
  return {
    covered: Math.round(covered * 100),
    largestEmpty: best.a ? Math.round((best.a / (rows * cols)) * 100) : 0,
    rect: best.a ? { x: R0.x + best.x * cell, y: R0.y + best.y * cell, w: best.w * cell, h: best.h * cell } : null,
  };
}

/** Movement of layout blocks between consecutive frames (structural = shallow keys). */
export function shifts(frames, maxDepth = 5) {
  const out = [];
  for (let i = 1; i < frames.length; i++) {
    const prev = new Map(frames[i - 1].blocks.map((b) => [b.k, b]));
    let moved = 0, worst = null;
    for (const b of frames[i].blocks) {
      if (b.k.split(">").length > maxDepth || b.tag === "svg") continue;
      const p = prev.get(b.k);
      if (!p) continue;
      const d = Math.max(Math.abs(b.x - p.x), Math.abs(b.y - p.y), Math.abs(b.h - p.h), Math.abs(b.w - p.w));
      if (d > 2) { moved++; if (!worst || d > worst.d) worst = { d: Math.round(d), k: b.k.split(">").slice(-2).join(">"), from: p, to: b }; }
    }
    const scroll = Math.abs(frames[i].scrollY - frames[i - 1].scrollY);
    out.push({ i, t: Math.round(frames[i].t - frames[0].t), moved, worst, scroll: Math.round(scroll), texts: frames[i].texts.length });
  }
  return out;
}

/** Group a list of per-frame issues into a summary: count of frames each issue appears in. */
export function summarize(perFrame) {
  const by = new Map();
  perFrame.forEach((issues, fi) => issues.forEach((x) => {
    const key = `${x.kind}|${x.detail}`;
    const e = by.get(key) ?? { kind: x.kind, detail: x.detail, frames: 0, first: fi, r: x.r, label: x.label };
    e.frames++;
    by.set(key, e);
  }));
  return [...by.values()].sort((a, b) => b.frames - a.frames);
}
