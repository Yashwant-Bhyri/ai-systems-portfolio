import * as THREE from "three";

/**
 * A Brain-Scan relief: a lit surface raised from a column × row field, revealed
 * by a scan. Shared by every scan-style module so they read as one family:
 * same camera, same light, same mounds-per-column construction.
 */
export type RGB = [number, number, number];
export type ReliefSpec = {
  cols: number;
  rows: number;
  /** Field value at a column and row; 0 is flat. */
  value: (c: number, r: number) => number;
  max: number;
  color: (v: number, c: number, r: number) => RGB;
  /** Mesh columns per field column: each column gets its own ridge. */
  sub?: number;
  size?: { w: number; d: number; h: number };
  /** Rows smooth into broad mounds (as the reference does across layers). */
  smoothRows?: boolean;
  ground?: number;
  light?: number;
  /** Camera zoom: a wide, shallow field fills more of its stage. */
  zoom?: number;
};

export function mountRelief(host: HTMLElement, spec: ReliefSpec) {
  const width = host.clientWidth, height = host.clientHeight;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  // 1.5× is sharp on a retina screen and draws about half the pixels of 2×.
  renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
  renderer.setSize(width, height);
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const { w: W, d: D, h: H } = spec.size ?? { w: 10.6, d: 5.2, h: 3.0 };
  const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
  camera.position.set(-0.9, 5.9, 11.2);
  camera.lookAt(0.15, 0.15, -0.2);
  camera.zoom = spec.zoom ?? 1;
  camera.updateProjectionMatrix();
  const SUB = spec.sub ?? 2;
  const cols = spec.cols * SUB, rows = spec.rows - 1;
  const geo = new THREE.PlaneGeometry(W, D, cols, rows);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 38, specular: spec.light ?? 0x9ffff0, side: THREE.DoubleSide });
  scene.add(new THREE.Mesh(geo, mat));
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshBasicMaterial({ color: spec.ground ?? 0x14130f }));
  ground.rotateX(-Math.PI / 2);
  ground.position.y = -0.005;
  scene.add(ground);
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-6, 6, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(spec.light ?? 0x6fe9cf, 0.6);
  rim.position.set(5, 3, -6);
  scene.add(rim);

  const at = (c: number, r: number) => {
    const cc = Math.max(0, Math.min(spec.cols - 1, c)), rr = Math.max(0, Math.min(spec.rows - 1, r));
    if (!spec.smoothRows) return spec.value(cc, rr);
    return (spec.value(cc, Math.max(0, rr - 1)) + 2 * spec.value(cc, rr) + spec.value(cc, Math.min(spec.rows - 1, rr + 1))) / 4;
  };
  // value at a mesh vertex: smooth across a column's ridge, sharp between columns
  const fieldAt = (ix: number, iz: number) => {
    const tf = ix / SUB - 0.5;
    const t0 = Math.max(0, Math.min(spec.cols - 1, Math.floor(tf))), t1 = Math.min(spec.cols - 1, t0 + 1);
    const f = Math.max(0, Math.min(1, tf - t0));
    const s = f * f * (3 - 2 * f);
    const row = rows - iz; // row 0 along the front edge
    const v = at(t0, row) * (1 - s) + at(t1, row) * s;
    return { v: v * (0.9 + 0.1 * Math.cos(((ix % SUB) / SUB) * Math.PI * 2)), c: Math.round(tf), r: row };
  };

  /** Raise the field; `reveal(c, r)` (0..1) says how much of each cell the scan has reached. */
  const update = (reveal: (c: number, r: number) => number) => {
    for (let iz = 0; iz <= rows; iz++) {
      for (let ix = 0; ix <= cols; ix++) {
        const i = iz * (cols + 1) + ix;
        const { v, c, r } = fieldAt(ix, iz);
        const shown = Math.max(0, Math.min(1, reveal(Math.max(0, Math.min(spec.cols - 1, c)), r)));
        const h = v * shown;
        pos.setY(i, (h / spec.max) * H);
        const [cr, cg, cb] = shown > 0 ? spec.color(h, c, r) : [20, 19, 15];
        colors[i * 3] = cr / 255; colors[i * 3 + 1] = cg / 255; colors[i * 3 + 2] = cb / 255;
      }
    }
    pos.needsUpdate = true;
    (geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
    geo.computeVertexNormals();
  };
  const v3 = new THREE.Vector3();
  /** Screen position of a point on the field's edge: column centre `c` (0..cols), depth `z` (−0.5 back … +0.5 front). */
  const project = (c: number, z: number, lift = 0) => {
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    v3.set(-W / 2 + ((c + 0.5) / spec.cols) * W, lift, z * D).project(camera);
    return { x: ((v3.x + 1) / 2) * width, y: ((1 - v3.y) / 2) * height };
  };
  return {
    update,
    render: () => renderer.render(scene, camera),
    project,
    dispose: () => { renderer.dispose(); geo.dispose(); mat.dispose(); host.removeChild(renderer.domElement); },
  };
}
