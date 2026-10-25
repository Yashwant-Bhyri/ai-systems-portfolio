"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { FLIPS, LAYERS, TOKENS, buildScan, driftColor } from "./scan-data";
import "./brain-scan.css";

/**
 * One answer and the network beneath it, in three synchronised views:
 * a flat token × layer field, the same field raised as terrain, and the answer
 * itself. A single scan moves left to right through all three.
 */
const LOOP = 19000, SCAN = 15000;
const T = TOKENS.length;
const SUB = 2; // mesh columns per token: each word gets its own mound

export function BrainScan() {
  const scan = useMemo(() => buildScan(), []);
  const heat = useRef<HTMLCanvasElement>(null);
  const relief = useRef<HTMLDivElement>(null);
  const labels = useRef<SVGSVGElement>(null);
  const [front, setFront] = useState(0); // tokens revealed (integer, for the ribbon and labels)
  const reveal = useRef(0);

  // Flat view: every token a column, every layer a row; input on top, output at the bottom.
  const drawHeat = (k: number) => {
    const c = heat.current;
    if (!c) return;
    const w = c.clientWidth, h = c.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    const g = c.getContext("2d")!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    const left = 34, top = 2, gridH = h - 34, cw = (w - left) / T, rh = gridH / LAYERS;
    g.fillStyle = "#0a1513";
    g.fillRect(left, top, w - left, gridH);
    for (let t = 0; t < T; t++) {
      const a = Math.max(0, Math.min(1, k - t));
      if (a <= 0) break;
      for (let l = 0; l < LAYERS; l++) {
        const [r, gg, b] = driftColor(scan.drift[t][l]);
        g.fillStyle = `rgba(${r},${gg},${b},${a})`;
        g.fillRect(left + t * cw + 0.5, top + l * rh, cw - 1, rh - 0.6);
      }
      // the full model's confidence under each word: tall = sure, short = torn
      const conf = scan.confidence[t];
      const flip = FLIPS.has(t);
      g.fillStyle = flip ? `rgba(226,84,64,${a})` : `rgba(64,196,150,${a})`;
      const bh = 12 * conf;
      g.fillRect(left + t * cw + 1, top + gridH + 4 + (12 - bh), cw - 2, bh);
    }
    g.fillStyle = "#8f9a96";
    g.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
    g.fillText("input", 0, top + 8);
    g.fillText("output", 0, top + gridH - 2);
    g.fillText("sure", 0, top + gridH + 10);
    g.fillText("torn", 0, top + gridH + 20);
  };

  useEffect(() => {
    const host = relief.current;
    if (!host) return;
    const width = host.clientWidth, height = host.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(width, height);
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const W = 10.6, D = 5.2, H = 3.0;
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(-0.9, 5.9, 11.2);
    camera.lookAt(0.15, 0.15, -0.2);

    const cols = T * SUB, rows = LAYERS - 1;
    const geo = new THREE.PlaneGeometry(W, D, cols, rows);
    geo.rotateX(-Math.PI / 2); // lie flat: x across tokens; the back row is the output layer
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 38, specular: 0x9ffff0, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    // the dark ground the scan has not reached yet
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshBasicMaterial({ color: 0x14130f }));
    ground.rotateX(-Math.PI / 2);
    ground.position.y = -0.005;
    scene.add(ground);
    scene.add(new THREE.AmbientLight(0xbffff2, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(-6, 6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x6fe9cf, 0.6);
    rim.position.set(5, 3, -6);
    scene.add(rim);

    // field value at a mesh vertex: smooth across a word's ridge, sharp between words
    const fieldAt = (ix: number, iz: number) => {
      const tf = ix / SUB - 0.5;
      const t0 = Math.max(0, Math.min(T - 1, Math.floor(tf))), t1 = Math.min(T - 1, t0 + 1);
      const f = Math.max(0, Math.min(1, tf - t0));
      const s = f * f * (3 - 2 * f);
      // input layers along the front edge; the field rises to the output layers at the back
      const layer = rows - iz;
      // a three-layer average turns per-layer noise into broad mounds, as in the reference
      const at = (tt: number, l: number) => {
        const c = scan.drift[tt];
        return (c[Math.max(0, l - 1)] + 2 * c[l] + c[Math.min(LAYERS - 1, l + 1)]) / 4;
      };
      const v = at(t0, layer) * (1 - s) + at(t1, layer) * s;
      const ridge = 0.9 + 0.1 * Math.cos(((ix % SUB) / SUB) * Math.PI * 2);
      return v * ridge;
    };
    const tokenOf = (ix: number) => ix / SUB;
    const update = (k: number) => {
      for (let iz = 0; iz <= rows; iz++) {
        for (let ix = 0; ix <= cols; ix++) {
          const i = iz * (cols + 1) + ix;
          const shown = Math.max(0, Math.min(1, (k - tokenOf(ix)) * 1.6));
          const v = fieldAt(ix, iz) * shown;
          pos.setY(i, (v / 1.41) * H);
          const [r, g, b] = shown > 0 ? driftColor(v) : [20, 19, 15];
          colors[i * 3] = r / 255; colors[i * 3 + 1] = g / 255; colors[i * 3 + 2] = b / 255;
        }
      }
      pos.needsUpdate = true;
      (geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
      geo.computeVertexNormals();
    };

    // token labels along the front (output) edge, projected from 3D
    const placeLabels = () => {
      const svg = labels.current;
      if (!svg) return;
      camera.updateMatrixWorld();
      camera.updateProjectionMatrix();
      const v = new THREE.Vector3();
      svg.querySelectorAll<SVGTextElement>("text").forEach((el, t) => {
        v.set(-W / 2 + ((t + 0.5) / T) * W, 0, D / 2 + 0.35).project(camera);
        el.setAttribute("x", String(((v.x + 1) / 2) * width));
        el.setAttribute("y", String(((1 - v.y) / 2) * height));
        el.setAttribute("transform", `rotate(58 ${((v.x + 1) / 2) * width} ${((1 - v.y) / 2) * height})`);
      });
    };
    placeLabels();

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, last = -1;
    const start = performance.now();
    const tick = (now: number) => {
      const t = reduced ? SCAN : (now - start) % LOOP;
      const k = Math.min(T, (t / SCAN) * T);
      reveal.current = k;
      update(k);
      drawHeat(k);
      renderer.render(scene, camera);
      const n = Math.floor(k);
      if (n !== last) { last = n; setFront(n); }
      if (!reduced) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); renderer.dispose(); geo.dispose(); mat.dispose(); host.removeChild(renderer.domElement); };
    // drawHeat reads the latest refs only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scan]);

  const finalLayer = (t: number) => scan.drift[t][LAYERS - 1];
  return (
    <main className="bs-page">
      <header className="bs-top">
        <span><b>Yashwant Bhyri</b> · Quantization scan</span>
        <time>26 October 2026</time>
      </header>
      <h1>The answer, <em>and the layers under it.</em></h1>
      <p className="bs-lede">
        Qwen3-4B in BF16 wrote this answer; its INT4 copy (2.01 GB instead of 8.04 GB) was fed the same tokens and compared after every layer.
        Every column is a token, every row one of 36 layers; the colour is how far apart the two models&rsquo; internal states are on that token at that layer.
      </p>

      <section className="bs-flat">
        <h2><b>Flat</b> · every token a column, every layer a row, colour = how far INT4 has drifted from BF16</h2>
        <p className="bs-note">input at the top, the token comes out at the bottom</p>
        <canvas ref={heat} className="bs-heat" />
        <div className="bs-ticks" aria-hidden="true" style={{ gridTemplateColumns: `34px repeat(${T}, minmax(0, 1fr))` }}>
          {TOKENS.map((tok, t) => (
            <span key={t} data-flip={FLIPS.has(t) || undefined} data-on={t < front || undefined}>{tok.trim() || "·"}</span>
          ))}
        </div>
      </section>

      <section className="bs-relief">
        <h2><b>In relief</b> · the same field; each ridge stands behind its token</h2>
        <p className="bs-note">drift rises toward the output and along the answer</p>
        <div className="bs-stage">
          <div ref={relief} className="bs-canvas" />
          <svg ref={labels} className="bs-labels" aria-hidden="true">
            {TOKENS.map((tok, t) => (
              <text key={t} data-flip={FLIPS.has(t) || undefined} opacity={t < front ? 1 : 0.12}>{tok.trim() || "·"}</text>
            ))}
          </svg>
        </div>
      </section>

      <p className="bs-ribbon" aria-label="The answer">
        {TOKENS.map((tok, t) => {
          if (tok === "⏎") return <span key={t} className="bs-break" data-on={t < front || undefined}>⏎</span>;
          const v = finalLayer(t) / 1.41;
          return (
            <span
              key={t}
              className="bs-tok"
              data-on={t < front || undefined}
              data-now={t === front - 1 || undefined}
              data-flip={FLIPS.has(t) || undefined}
              style={{ background: t < front ? `rgba(46,150,126,${0.18 + 0.5 * v})` : undefined }}
            >{tok}</span>
          );
        })}
      </p>

      <footer className="bs-legend">
        <span className="bs-ramp"><i />0 = identical, bright = 1.41</span>
        <span><u>red underline</u> = the INT4 copy would have chosen a different token ({Math.round(100 - (100 * FLIPS.size) / T)}% stayed the same)</span>
        <span>bars under the field = the full model&rsquo;s own confidence on each token: tall = sure, short = torn</span>
      </footer>
      <footer className="bs-foot">
        <b>yashwant · portfolio lab</b>
        <span>tools/quant-scan · first_item task · bf16 vs int4-awq · teacher-forced scan · simulated drift field</span>
      </footer>
    </main>
  );
}
