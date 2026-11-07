"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { TASKS, simulateLab, type LabRun } from "../lab-simulation";
import { highlight } from "./stage-meter";
import "./manifold.css";

/**
 * Post-training as one object. Every task is a point in many dimensions, once per model.
 * Choose any three dimensions and the same points fly to new places: on some axes the models'
 * clusters pull apart, on others they sit on top of each other, and each view is a different
 * true statement about what training did. Each point is joined to its own other self; each
 * cluster shows its shape and its centre; and the view can be turned.
 */
type Dim = { key: string; label: string; unit: string; read: (t: Row) => number; log?: boolean; digits?: number; binary?: boolean; ticks?: readonly string[] };
type Row = { task: LabRun["tasks"][number]; difficulty: number };
type Cloud = { name: string; color: string; rows: readonly Row[] };
type View = { name: string; axes: readonly [string, string, string]; truth: string };
type Spec = { noun: string; dims: readonly Dim[]; clouds: readonly Cloud[]; views: readonly View[] };

const f = (v: number, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const median = (xs: readonly number[]) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const rowsOf = (r: LabRun): Row[] => r.tasks.map((task) => ({ task, difficulty: TASKS[task.id].difficulty }));

function trainingSpec(): Spec {
  const base = simulateLab(0, 1), rl = simulateLab(2, 4), lean = simulateLab(3, 4);
  const perTask = (r: LabRun) => r.tokens / r.n;
  return {
    noun: "task",
    dims: [
      { key: "difficulty", label: "Task difficulty", unit: "", read: (t) => t.difficulty, digits: 2 },
      { key: "correct", label: "Answer", unit: "", read: (t) => (t.task.correct ? 1 : 0), binary: true, ticks: ["wrong", "correct"] },
      { key: "family", label: "Task family", unit: "", read: (t) => t.task.family, binary: true, ticks: ["maths", "logic", "code"] },
      { key: "tokens", label: "Tokens in the answer", unit: "tokens", read: (t) => t.task.tokens },
      { key: "gpu", label: "GPU time", unit: "GPU-s", read: (t) => t.task.gpuSeconds, digits: 1 },
      { key: "response", label: "Response time", unit: "s", read: (t) => t.task.latency },
    ],
    clouds: [{ name: "Base model", color: "#7fb2ff", rows: rowsOf(base) }, { name: "RL, 4× thinking", color: "#f3a0bc", rows: rowsOf(rl) }, { name: "Lean RL", color: "#b8e986", rows: rowsOf(lean) }],
    views: [
      { name: "The skill", axes: ["difficulty", "correct", "family"], truth: `Tasks cross from wrong to correct: *${base.correct} → ${lean.correct} of 96*` },
      { name: "The cost of thinking", axes: ["difficulty", "tokens", "gpu"], truth: `More thinking costs more: *${f(perTask(base))} → ${f(perTask(rl))} tokens* per task` },
      { name: "Lean RL", axes: ["tokens", "gpu", "correct"], truth: `The same ${lean.correct} correct in *${Math.round(100 * (1 - perTask(lean) / perTask(rl)))}% fewer tokens*` },
      { name: "The families", axes: ["family", "correct", "difficulty"], truth: "*All three task families* gain, on the same tasks" },
    ],
  };
}

const VERT = `attribute vec3 aFrom; attribute vec3 aTo; attribute vec3 aColor; attribute float aCloud;
uniform float uMix; uniform float uPx; uniform vec3 uShow; varying vec3 vC; varying float vA;
void main(){ vec3 p = mix(aFrom, aTo, uMix); vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
  float show = aCloud < .5 ? uShow.x : aCloud < 1.5 ? uShow.y : uShow.z; gl_PointSize = uPx * show * 58.0 / -mv.z; vC = aColor; vA = show; }`;
const FRAG = `varying vec3 vC; varying float vA; void main(){ vec2 d = gl_PointCoord - .5; float r = length(d); if (r > .5 || vA < .01) discard;
  float core = smoothstep(.5, .32, r); float lit = 1.0 + .55 * smoothstep(.34, .0, length(d - vec2(-.1, -.12))); gl_FragColor = vec4(vC * lit, core); }`;
const LVERT = `attribute vec3 aFrom; attribute vec3 aTo; attribute vec3 aColor; uniform float uMix; varying vec3 vC; void main(){ vC = aColor; gl_Position = projectionMatrix * modelViewMatrix * vec4(mix(aFrom, aTo, uMix), 1.0); }`;
const LFRAG = `varying vec3 vC; uniform float uAlpha; void main(){ gl_FragColor = vec4(vC, uAlpha); }`;

export function Manifold({ dwell = 8000, active = true, compact = false, onRound }: { dwell?: number; active?: boolean; compact?: boolean; onRound?: () => void }) {
  const spec = useMemo(() => trainingSpec(), []);
  const host = useRef<HTMLDivElement>(null);
  const labels = useRef<SVGSVGElement>(null);
  const [viewIx, setViewIx] = useState(0);
  const [axes, setAxes] = useState<readonly [string, string, string]>(spec.views[0].axes);
  const [custom, setCustom] = useState(false);
  const [hidden, setHidden] = useState<readonly number[]>([]);
  const [touched, setTouched] = useState(false);
  const touchedRef = useRef(false);
  const round = useRef(onRound);
  useEffect(() => { round.current = onRound; });
  const dimOf = (k: string) => spec.dims.find((d) => d.key === k)!;

  // Every dimension normalised to −1…1 across all the clouds, so a point has one position per view.
  const scales = useMemo(() => Object.fromEntries(spec.dims.map((d) => {
    const all = spec.clouds.flatMap((c) => c.rows.map(d.read));
    const tr = (v: number) => (d.log ? Math.log10(Math.max(1e-3, v) + 1) : v);
    const lo = Math.min(...all.map(tr)), hi = Math.max(...all.map(tr));
    return [d.key, { tr, lo, hi, min: Math.min(...all), max: Math.max(...all) }];
  })), [spec]);

  const stateRef = useRef({ axes, hidden });
  useEffect(() => { stateRef.current = { axes, hidden }; }, [axes, hidden]);
  const api = useRef<{ goTo: (a: readonly [string, string, string]) => void } | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el || !active) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const px = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(px);
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, el.clientWidth / el.clientHeight, 0.1, 50);
    // the object sits left of centre; its readings are on the right
    const offset = () => camera.setViewOffset(el.clientWidth, el.clientHeight, el.clientWidth * 0.1, 0, el.clientWidth, el.clientHeight);
    offset();

    // the cube the points live in
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
    scene.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.3, 2.3, 2.3)), lineMat));
    const grid = new THREE.GridHelper(2.3, 6, 0xffffff, 0xffffff);
    (grid.material as THREE.Material).transparent = true; (grid.material as THREE.Material).opacity = 0.05;
    grid.position.y = -1.15;
    scene.add(grid);

    const coords = (a: readonly [string, string, string], row: Row, jitterSeed: number) => a.map((k, i) => {
      const d = dimOf(k), sc = scales[k];
      const n = sc.hi > sc.lo ? ((sc.tr(d.read(row)) - sc.lo) / (sc.hi - sc.lo)) * 2 - 1 : 0;
      // categories spread a little so their points stay countable; each request keeps the same offset in every cloud
      const j = d.binary ? (((jitterSeed * (i + 3) * 2654435761) % 1000) / 1000 - 0.5) * 0.36 : 0;
      return n + j;
    });
    const n = spec.clouds[0].rows.length, m = spec.clouds.length, total = n * m;
    const from = new Float32Array(total * 3), to = new Float32Array(total * 3), col = new Float32Array(total * 3), cloudId = new Float32Array(total);
    const fill = (buf: Float32Array, a: readonly [string, string, string]) => spec.clouds.forEach((c, ci) => c.rows.forEach((row, ri) => {
      const p = coords(a, row, row.task.id + 7);
      buf.set(p, (ci * n + ri) * 3);
    }));
    spec.clouds.forEach((c, ci) => {
      const cc = new THREE.Color(c.color).convertLinearToSRGB();
      c.rows.forEach((_, ri) => { col.set([cc.r, cc.g, cc.b], (ci * n + ri) * 3); cloudId[ci * n + ri] = ci; });
    });
    fill(from, stateRef.current.axes); to.set(from);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(total * 3), 3));
    geo.setAttribute("aFrom", new THREE.BufferAttribute(from, 3));
    geo.setAttribute("aTo", new THREE.BufferAttribute(to, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aCloud", new THREE.BufferAttribute(cloudId, 1));
    const uni = { uMix: { value: 0 }, uPx: { value: px * (el.clientHeight / 560) }, uShow: { value: new THREE.Vector3(1, 1, 1) } };
    const points = new THREE.Points(geo, new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: uni, transparent: true }));
    points.frustumCulled = false;
    scene.add(points);

    // each point joined to its own other self, cloud to next cloud
    const links = (m - 1) * n, lf = new Float32Array(links * 6), lt = new Float32Array(links * 6), lc = new Float32Array(links * 6);
    const fillLinks = (src: Float32Array, dst: Float32Array) => { for (let c = 0; c < m - 1; c++) for (let i = 0; i < n; i++) { const o = (c * n + i) * 6; dst.set(src.subarray((c * n + i) * 3, (c * n + i) * 3 + 3), o); dst.set(src.subarray(((c + 1) * n + i) * 3, ((c + 1) * n + i) * 3 + 3), o + 3); } };
    fillLinks(from, lf); fillLinks(to, lt);
    for (let c = 0; c < m - 1; c++) for (let i = 0; i < n; i++) { const o = (c * n + i) * 6; lc.set(col.subarray((c * n) * 3, (c * n) * 3 + 3), o); lc.set(col.subarray(((c + 1) * n) * 3, ((c + 1) * n) * 3 + 3), o + 3); }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(links * 6), 3));
    lg.setAttribute("aFrom", new THREE.BufferAttribute(lf, 3));
    lg.setAttribute("aTo", new THREE.BufferAttribute(lt, 3));
    lg.setAttribute("aColor", new THREE.BufferAttribute(lc, 3));
    const lineUni = { uMix: uni.uMix, uAlpha: { value: 0.16 } };
    const linkLines = new THREE.LineSegments(lg, new THREE.ShaderMaterial({ vertexShader: LVERT, fragmentShader: LFRAG, uniforms: lineUni, transparent: true, depthWrite: false }));
    linkLines.frustumCulled = false;
    scene.add(linkLines);

    // each cluster's shape: three rings of its covariance ellipsoid, and its centre
    const unitRing = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 65 }, (_, i) => new THREE.Vector3(Math.cos((i / 64) * 6.2832), Math.sin((i / 64) * 6.2832), 0)));
    const shells = spec.clouds.map((c) => {
      const g = new THREE.Group();
      const mat = new THREE.LineBasicMaterial({ color: c.color, transparent: true, opacity: 0.4 });
      const a = new THREE.Line(unitRing, mat), b = new THREE.Line(unitRing, mat), d = new THREE.Line(unitRing, mat);
      b.rotation.x = Math.PI / 2; d.rotation.y = Math.PI / 2;
      g.add(a, b, d);
      g.matrixAutoUpdate = false;
      scene.add(g);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), new THREE.MeshBasicMaterial({ color: c.color }));
      scene.add(dot);
      return { g, dot, cur: new THREE.Matrix4(), from: new THREE.Matrix4(), to: new THREE.Matrix4(), cFrom: new THREE.Vector3(), cTo: new THREE.Vector3() };
    });
    const arrowGeo = new THREE.BufferGeometry().setFromPoints(spec.clouds.map(() => new THREE.Vector3()));
    const arrow = new THREE.Line(arrowGeo, new THREE.LineBasicMaterial({ color: 0xffffff }));
    arrow.frustumCulled = false;
    scene.add(arrow);
    const ellipsoid = (buf: Float32Array, ci: number) => {
      const c = new THREE.Vector3();
      for (let i = 0; i < n; i++) c.add(new THREE.Vector3().fromArray(buf, (ci * n + i) * 3));
      c.divideScalar(n);
      const m3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
      for (let i = 0; i < n; i++) { const o = (ci * n + i) * 3, d = [buf[o] - c.x, buf[o + 1] - c.y, buf[o + 2] - c.z]; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) m3[a][b] += (d[a] * d[b]) / n; }
      // principal axes by Jacobi rotations
      const V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
      for (let s = 0; s < 12; s++) for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) {
        if (Math.abs(m3[p][q]) < 1e-9) continue;
        const th = 0.5 * Math.atan2(2 * m3[p][q], m3[q][q] - m3[p][p]), co = Math.cos(th), si = Math.sin(th);
        for (let k = 0; k < 3; k++) { const a = m3[k][p], b = m3[k][q]; m3[k][p] = co * a - si * b; m3[k][q] = si * a + co * b; }
        for (let k = 0; k < 3; k++) { const a = m3[p][k], b = m3[q][k]; m3[p][k] = co * a - si * b; m3[q][k] = si * a + co * b; }
        for (let k = 0; k < 3; k++) { const a = V[k][p], b = V[k][q]; V[k][p] = co * a - si * b; V[k][q] = si * a + co * b; }
      }
      // about one standard deviation, and never wider than the cube
      const r = [0, 1, 2].map((i) => Math.min(0.95, Math.max(0.03, 1.15 * Math.sqrt(Math.max(0, m3[i][i])))));
      return { c, m: new THREE.Matrix4().set(V[0][0] * r[0], V[0][1] * r[1], V[0][2] * r[2], c.x, V[1][0] * r[0], V[1][1] * r[1], V[1][2] * r[2], c.y, V[2][0] * r[0], V[2][1] * r[1], V[2][2] * r[2], c.z, 0, 0, 0, 1) };
    };
    const setShellTargets = () => shells.forEach((s, i) => {
      const a = ellipsoid(from, i), b = ellipsoid(to, i);
      s.from.copy(a.m); s.to.copy(b.m); s.cFrom.copy(a.c); s.cTo.copy(b.c);
    });
    setShellTargets();

    let mix = 1, mixStart = 0;
    const MORPH = 1500;
    uni.uMix.value = 1;
    const currentAxes = () => stateRef.current.axes;
    api.current = {
      goTo: (a) => {
        // the new view starts from wherever the points are right now
        const k = uni.uMix.value;
        for (let i = 0; i < from.length; i++) from[i] = from[i] + (to[i] - from[i]) * k;
        fill(to, a);
        fillLinks(from, lf); fillLinks(to, lt);
        (geo.attributes.aFrom as THREE.BufferAttribute).needsUpdate = true;
        (geo.attributes.aTo as THREE.BufferAttribute).needsUpdate = true;
        (lg.attributes.aFrom as THREE.BufferAttribute).needsUpdate = true;
        (lg.attributes.aTo as THREE.BufferAttribute).needsUpdate = true;
        setShellTargets();
        uni.uMix.value = 0; mix = 0; mixStart = performance.now();
      },
    };

    // the viewer can turn it; otherwise it turns by itself, slowly
    let yaw = 0.72, pitch = 0.34, dragging = false, px0 = 0, py0 = 0;
    const down = (e: PointerEvent) => { dragging = true; px0 = e.clientX; py0 = e.clientY; el.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => { if (!dragging) return; yaw -= (e.clientX - px0) * 0.008; pitch = Math.max(-0.15, Math.min(1.2, pitch + (e.clientY - py0) * 0.006)); px0 = e.clientX; py0 = e.clientY; };
    const up = () => { dragging = false; };
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    const ro = new ResizeObserver(() => { const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; renderer.setSize(w, h); camera.aspect = w / h; offset(); camera.updateProjectionMatrix(); uni.uPx.value = px * (h / 560); });
    ro.observe(el);

    const v = new THREE.Vector3();
    const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    let raf = 0, last = performance.now();
    const shown = [1, 1, 1];
    const AX = [new THREE.Vector3(0, -1.28, 1.28), new THREE.Vector3(-1.28, 0, 1.28), new THREE.Vector3(1.28, -1.28, 0)];
    const axisEnds = (i: number, end: number) => (i === 0 ? v.set(end * 1.15, -1.22, 1.22) : i === 1 ? v.set(-1.22, end * 1.15, 1.22) : v.set(1.22, -1.22, end * 1.15));
    const place = (t: SVGTextElement | null | undefined, p: THREE.Vector3) => { if (!t) return; p.project(camera); t.setAttribute("x", String(((p.x + 1) / 2) * el.clientWidth)); t.setAttribute("y", String(((1 - p.y) / 2) * el.clientHeight)); };
    const tick = (now: number) => {
      const dt = Math.min(64, now - last); last = now;
      if (!dragging && !reduced) yaw += dt * 0.00009;
      if (mix < 1) { mix = Math.min(1, (now - mixStart) / MORPH); uni.uMix.value = ease(mix); }
      const k = uni.uMix.value;
      spec.clouds.forEach((_, i) => { const want = stateRef.current.hidden.includes(i) ? 0 : 1; shown[i] += (want - shown[i]) * 0.14; });
      uni.uShow.value.set(shown[0], shown[1], shown[2] ?? 0);
      lineUni.uAlpha.value = stateRef.current.hidden.length ? 0 : 0.16;
      const R = 6.5;
      camera.position.set(R * Math.sin(yaw) * Math.cos(pitch), R * Math.sin(pitch), R * Math.cos(yaw) * Math.cos(pitch));
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
      const pos = arrowGeo.attributes.position as THREE.BufferAttribute;
      shells.forEach((s, i) => {
        for (let e = 0; e < 16; e++) s.cur.elements[e] = s.from.elements[e] + (s.to.elements[e] - s.from.elements[e]) * k;
        s.g.matrix.copy(s.cur); s.g.matrixWorldNeedsUpdate = true;
        s.g.visible = s.dot.visible = shown[i] > 0.5;
        v.copy(s.cFrom).lerp(s.cTo, k); s.dot.position.copy(v); pos.setXYZ(i, v.x, v.y, v.z);
      });
      pos.needsUpdate = true;
      renderer.render(scene, camera);
      // the axes' names and ends follow the view
      const svg = labels.current;
      if (svg) {
        const a = currentAxes();
        a.forEach((_, i) => {
          place(svg.querySelector<SVGTextElement>(`[data-axis="${i}"]`), v.copy(AX[i]).multiplyScalar(1.08));
          place(svg.querySelector<SVGTextElement>(`[data-lo="${i}"]`), axisEnds(i, -1));
          place(svg.querySelector<SVGTextElement>(`[data-hi="${i}"]`), axisEnds(i, 1));
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
      api.current = null;
      renderer.dispose(); geo.dispose(); lg.dispose();
      el.removeChild(renderer.domElement);
    };
    // the scene is built once per laboratory; views travel through `api`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec, scales, active]);

  const show = (a: readonly [string, string, string]) => { setAxes(a); api.current?.goTo(a); };
  const pick = (i: number) => { setViewIx(i); setCustom(false); show(spec.views[i].axes); };
  // the tour: each view holds, then the next; choosing anything hands it to the visitor
  useEffect(() => {
    if (!active || touched || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => {
      const next = (viewIx + 1) % spec.views.length;
      if (next === 0) round.current?.();
      setViewIx(next); setCustom(false); show(spec.views[next].axes);
    }, dwell);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, viewIx, touched, dwell]);
  const take = () => { touchedRef.current = true; setTouched(true); };

  const fmtDim = (d: Dim, v: number) => (d.binary ? (d.ticks?.[Math.round(v)] ?? f(v)) : f(v, d.digits ?? (v < 10 ? 1 : 0)));
  const readings = axes.map((k) => {
    const d = dimOf(k);
    const vals = spec.clouds.map((c) => (d.binary ? c.rows.filter((r) => d.read(r) >= 1).length : median(c.rows.map(d.read))));
    const same = vals.every((x) => Math.abs(x - vals[0]) < 1e-6);
    return { d, vals, same };
  });
  const truth = custom ? null : spec.views[viewIx].truth;
  return (
    <div className="mf-root" data-compact={compact || undefined}>
      <p className="mf-truth" key={custom ? axes.join() : viewIx}>{truth ? highlight(truth) : `Your view: ${axes.map((k) => dimOf(k).label.toLowerCase()).join(", ")}`}</p>
      <div className="mf-stage">
        <div ref={host} className="mf-canvas" role="img" aria-label={`Every ${spec.noun} as a point in a three-dimensional view of many dimensions; drag to turn it`} onPointerDown={take} />
        <svg ref={labels} className="mf-labels" aria-hidden="true">
          {axes.map((k, i) => {
            const d = dimOf(k), sc = scales[k];
            return (
              <g key={i}>
                <text data-axis={i} className="mf-axis" textAnchor="middle">{d.label}{d.unit ? ` (${d.unit})` : ""}</text>
                <text data-lo={i} className="mf-end" textAnchor="middle">{d.ticks ? d.ticks[0] : fmtDim(d, sc.min)}</text>
                <text data-hi={i} className="mf-end" textAnchor="middle">{d.ticks ? d.ticks[d.ticks.length - 1] : fmtDim(d, sc.max)}</text>
              </g>
            );
          })}
        </svg>
        <aside className="mf-readout">
          <ul className="mf-legend">
            {spec.clouds.map((c, i) => (
              <li key={c.name}><button type="button" aria-pressed={!hidden.includes(i)} onClick={() => { take(); setHidden((h) => (h.includes(i) ? h.filter((x) => x !== i) : [...h, i])); }}><i style={{ background: c.color }} />{c.name}</button></li>
            ))}
          </ul>
          <table>
            <tbody>
              {readings.map(({ d, vals, same }) => (
                <tr key={d.key} data-same={same || undefined}>
                  <th>{d.label}{d.binary ? (d.ticks?.[1] ? `: ${d.ticks[d.ticks.length - 1]}` : "") : ""}</th>
                  <td>{same ? <><b>{d.binary ? f(vals[0]) : fmtDim(d, vals[0])}</b> <em>unchanged</em></> : vals.map((x, i) => <b key={i} style={{ color: spec.clouds[i].color }}>{d.binary ? f(x) : fmtDim(d, x)}{i < vals.length - 1 ? <i> → </i> : null}</b>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <small>Medians across {spec.clouds[0].rows.length} synthetic {spec.noun}s; each point is joined to its own other self</small>
        </aside>
      </div>
      <div className="mf-controls">
        <div className="mf-views" role="group" aria-label="Perspectives">
          {spec.views.map((vw, i) => <button key={vw.name} type="button" aria-pressed={!custom && viewIx === i} onClick={() => { take(); pick(i); }}>{vw.name}{!custom && viewIx === i && !touched && <b key={viewIx} style={{ animationDuration: `${dwell}ms` }} />}</button>)}
        </div>
        <div className="mf-axes" role="group" aria-label="Choose the three axes">
          {axes.map((k, i) => (
            <label key={i}><span>{["X", "Y", "Z"][i]}</span>
              <select value={k} onChange={(e) => { take(); setCustom(true); const next = [...axes] as [string, string, string]; next[i] = e.target.value; show(next); }}>
                {spec.dims.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
              </select>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
