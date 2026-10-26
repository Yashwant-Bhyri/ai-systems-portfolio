// Stage tracker: injected into the page. Records what is actually on screen inside a root:
// layout blocks, every line of text (with its rendered size), and every SVG/canvas graphic,
// all in viewport coordinates. Exposed as window.__track.snapshot(selector) and .overlay(...).
(() => {
  const vis = (el) => {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity < 0.05) return false;
      if (n.hasAttribute && n.hasAttribute("hidden")) return false;
    }
    return true;
  };
  const opacityChain = (el) => {
    let o = 1;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= +getComputedStyle(n).opacity || 0;
    return o;
  };
  const keyOf = (el, root) => {
    const parts = [];
    for (let n = el; n && n !== root && n.nodeType === 1; n = n.parentElement) {
      const cls = (n.className && typeof n.className === "string" ? n.className : n.className?.baseVal || "").trim().split(/\s+/)[0];
      const idx = n.parentElement ? [...n.parentElement.children].indexOf(n) : 0;
      parts.unshift(`${n.tagName.toLowerCase()}${cls ? "." + cls : ""}:${idx}`);
      if (parts.length > 7) break;
    }
    return parts.join(">");
  };
  const R = (r) => ({ x: Math.round(r.left * 10) / 10, y: Math.round(r.top * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 });
  const inView = (r) => r.width > 0.5 && r.height > 0.5 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
  const GRAPHIC = "path,rect,circle,ellipse,line,polyline,polygon,image,use,canvas,img,video";
  const BLOCK = "section,article,aside,header,footer,nav,main,div,figure,svg,canvas,button,li,p,h1,h2,h3,h4,h5,h6,label,details,summary";

  function clipBoxOf(el) {
    // nearest ancestor that hides overflow
    for (let n = el.parentElement; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (/(hidden|clip|auto|scroll)/.test(cs.overflow + cs.overflowX + cs.overflowY)) return n.getBoundingClientRect();
    }
    return null;
  }

  function snapshot(selector) {
    const root = document.querySelector(selector);
    if (!root) return null;
    const rb = root.getBoundingClientRect();
    const blocks = [], texts = [], graphics = [];
    root.querySelectorAll(BLOCK).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!inView(r) || r.width * r.height < 300 || !vis(el)) return;
      blocks.push({ k: keyOf(el, root), tag: el.tagName.toLowerCase(), cls: (el.className && typeof el.className === "string" ? el.className : el.className?.baseVal || "").slice(0, 60), ...R(r) });
    });
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    let tn;
    while ((tn = walker.nextNode())) {
      const s = tn.textContent.replace(/\s+/g, " ").trim();
      if (!s) continue;
      const el = tn.parentElement;
      if (!el || !vis(el)) continue;
      range.selectNodeContents(tn);
      const rects = [...range.getClientRects()].filter(inView);
      if (!rects.length) continue;
      const cs = getComputedStyle(el);
      let px = parseFloat(cs.fontSize) || 0;
      const svg = el.closest("svg");
      if (svg && el instanceof SVGElement) {
        const m = el.getScreenCTM ? el.getScreenCTM() : null;
        if (m) px = px * Math.hypot(m.a, m.b);
      }
      const clip = clipBoxOf(el);
      const op = opacityChain(el);
      rects.forEach((r, i) => {
        const clipped = clip ? (r.left < clip.left - 1 || r.right > clip.right + 1 || r.top < clip.top - 1 || r.bottom > clip.bottom + 1) : false;
        texts.push({ t: i ? "" : s.slice(0, 80), k: keyOf(el, root), px: Math.round(px * 10) / 10, op: Math.round(op * 100) / 100, svg: !!svg, clipped, ...R(r) });
      });
      // ellipsis truncation on HTML text
      if (!svg && el.scrollWidth > el.clientWidth + 1 && /ellipsis/.test(cs.textOverflow)) texts[texts.length - 1].truncated = true;
    }
    root.querySelectorAll(GRAPHIC).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!inView(r) || (r.width < 2 && r.height < 2) || !vis(el)) return;
      const cs = getComputedStyle(el);
      const filled = cs.fill && cs.fill !== "none" && cs.fill !== "transparent" && !/rgba\(.*,\s*0\)/.test(cs.fill);
      const stroked = cs.stroke && cs.stroke !== "none";
      graphics.push({ k: keyOf(el, root), tag: el.tagName.toLowerCase(), filled, stroked, op: Math.round(opacityChain(el) * 100) / 100, ...R(r) });
    });
    return { t: performance.now(), scrollY, vw: innerWidth, vh: innerHeight, root: R(rb), blocks, texts, graphics };
  }

  // Draw boxes over the page for an annotated screenshot.
  function overlay(selector, issues) {
    clear();
    const snap = snapshot(selector);
    if (!snap) return;
    const layer = document.createElement("div");
    layer.id = "__track_overlay";
    layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647";
    const box = (r, color, width = 1, label) => {
      const d = document.createElement("div");
      d.style.cssText = `position:fixed;left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px;outline:${width}px solid ${color};`;
      if (label) { const l = document.createElement("span"); l.textContent = label; l.style.cssText = `position:absolute;left:0;top:-13px;font:10px monospace;color:#fff;background:${color};padding:0 3px;white-space:nowrap`; d.appendChild(l); }
      layer.appendChild(d);
    };
    snap.graphics.forEach((g) => box(g, "rgba(90,160,255,.35)"));
    snap.texts.forEach((t) => box(t, t.px < 10 ? "rgba(255,200,0,.9)" : "rgba(80,230,140,.6)"));
    (issues || []).forEach((i) => box(i.r, "rgba(255,60,60,.95)", 2, i.label));
    document.body.appendChild(layer);
  }
  function clear() { document.getElementById("__track_overlay")?.remove(); }

  // Smoothness recorder: frame times, layout shifts (with the nodes that moved) and long tasks.
  const jank = { frames: [], shifts: [], long: [], running: false };
  function describe(n) {
    if (!n || n.nodeType !== 1) return n?.parentElement ? describe(n.parentElement) : "?";
    const cls = (typeof n.className === "string" ? n.className : n.className?.baseVal || "").trim().split(/\s+/).slice(0, 2).join(".");
    const txt = (n.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40);
    return `${n.tagName.toLowerCase()}${cls ? "." + cls : ""}${txt ? ` "${txt}"` : ""}`;
  }
  try {
    new PerformanceObserver((l) => {
      if (!jank.running) return;
      l.getEntries().forEach((e) => jank.shifts.push({ t: e.startTime, v: e.value, input: e.hadRecentInput, sources: (e.sources || []).slice(0, 4).map((s) => ({ n: describe(s.node), from: R(s.previousRect), to: R(s.currentRect) })) }));
    }).observe({ type: "layout-shift", buffered: false });
    new PerformanceObserver((l) => { if (jank.running) l.getEntries().forEach((e) => jank.long.push({ t: e.startTime, d: Math.round(e.duration) })); }).observe({ type: "longtask", buffered: false });
  } catch { /* not supported */ }
  function startJank() {
    jank.frames = []; jank.shifts = []; jank.long = []; jank.running = true;
    let last = performance.now();
    const tick = (now) => { if (!jank.running) return; jank.frames.push(Math.round((now - last) * 10) / 10); last = now; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  function stopJank() {
    jank.running = false;
    const f = jank.frames.slice(1).sort((a, b) => a - b);
    const pct = (p) => f[Math.min(f.length - 1, Math.floor(p * f.length))] || 0;
    return {
      frames: f.length, p50: pct(0.5), p95: pct(0.95), max: f[f.length - 1] || 0,
      dropped: f.filter((x) => x > 25).length,
      cls: Math.round(jank.shifts.reduce((a, s) => a + s.v, 0) * 1000) / 1000,
      shifts: jank.shifts.slice(0, 40), long: jank.long,
    };
  }
  window.__track = { snapshot, overlay, clear, startJank, stopJank };
})();
