/* Post-training glossary figures: each term told as one six-second loop on the serving glossary's
   400 × 120 card, in the same drawing language, so the two glossaries read as one system. */
import { DUR, Fig, Tween, Win, r3 } from "./glossary-figures";

const R = (n: number) => Math.round(n * 100) / 100;

/* ── Data curation: four worked traces reach a check; two pass into the training set, two are dropped. ── */
export function FigCuration() {
  const rows = [
    { y: 22, ok: true, why: "" },
    { y: 46, ok: false, why: "duplicate" },
    { y: 70, ok: true, why: "" },
    { y: 94, ok: false, why: "wrong result" },
  ];
  return <Fig label="Data curation: only worked solutions that pass the checks become training examples">
    <text x={0} y={12} className="gf-t">worked traces</text>
    <rect x={150} y={18} width={74} height={90} rx={6} className="gf-box" />
    <text x={187} y={60} textAnchor="middle" className="gf-k">check</text>
    <text x={187} y={76} textAnchor="middle" className="gf-t">schema · result</text>
    <text x={400} y={12} textAnchor="end" className="gf-t">training set</text>
    {rows.map((r, i) => {
      const a = 0.06 + i * 0.12;
      return <g key={i}>
        <rect x={0} y={r.y} width={0} height={12} rx={2} className="g-b"><Tween attr="width" v0={0} v1={130} a={a} b={a + 0.12} /></rect>
        {r.ok
          ? <rect x={244} y={r.y} width={0} height={12} rx={2} className="g-g"><Tween attr="width" v0={0} v1={120} a={a + 0.18} b={a + 0.3} /></rect>
          : <text x={244} y={r.y + 10} className="gf-t gf-red" opacity={0}>× {r.why}<Win a={a + 0.18} b={0.97} /></text>}
      </g>;
    })}
  </Fig>;
}

/* ── SFT + LoRA: the base weights stay frozen; two thin adapters learn from the verified solutions. ── */
export function FigSFT() {
  const cells = Array.from({ length: 48 }, (_, i) => i);
  return <Fig label="Supervised fine-tuning with LoRA: the base weights are frozen and small low-rank adapters are trained">
    <text x={0} y={12} className="gf-t">base weights · frozen</text>
    {cells.map((i) => <rect key={i} x={(i % 8) * 15} y={20 + Math.floor(i / 8) * 15} width={12} height={12} rx={2} className="g-m" opacity={0.45} />)}
    <text x={140} y={58} className="gf-k">+</text>
    <rect x={160} y={20} width={10} height={87} rx={2} className="gf-slot" />
    <rect x={160} y={107} width={10} height={0} rx={2} className="g-a">
      <Tween attr="height" v0={0} v1={87} a={0.1} b={0.55} />
      <Tween attr="y" v0={107} v1={20} a={0.1} b={0.55} />
    </rect>
    <rect x={180} y={20} width={88} height={10} rx={2} className="gf-slot" />
    <rect x={180} y={20} width={0} height={10} rx={2} className="g-a"><Tween attr="width" v0={0} v1={88} a={0.1} b={0.55} /></rect>
    <text x={180} y={48} className="gf-t">LoRA adapters</text>
    <text x={180} y={62} className="gf-t">the only weights trained</text>
    <text x={180} y={98} className="gf-t">loss ↓</text>
    <path d="M232 82 C262 82 270 104 300 108 S370 112 400 112" className="gf-trace" strokeDasharray="190" strokeDashoffset={190}>
      <animate attributeName="stroke-dashoffset" values="190;190;0;0;190" keyTimes="0;0.12;0.62;0.96;1" dur={DUR} repeatCount="indefinite" />
    </path>
  </Fig>;
}

/* ── Verifiable rewards: the tests decide. One attempt passes and earns 1; the next fails and earns 0. ── */
export function FigReward() {
  return <Fig label="Verifiable rewards: unit tests and exact answers score each attempt 1 or 0, with no judge model">
    <text x={0} y={12} className="gf-t">attempt</text>
    <rect x={0} y={22} width={110} height={70} rx={6} className="gf-box" />
    {[0, 1, 2, 3].map((k) => <rect key={k} x={12} y={34 + k * 14} width={70 - k * 12} height={7} rx={2} className="g-b" opacity={0.75} />)}
    <path d="M114 57H150" className="gf-wire" />
    <text x={156} y={12} className="gf-t">unit tests</text>
    {[0, 1, 2].map((k) => <g key={k}>
      <rect x={156} y={22 + k * 24} width={96} height={18} rx={4} className="gf-slot" />
      <text x={166} y={35 + k * 24} className="gf-t gf-green" opacity={0}>✓ test {k + 1}<Win a={0.08 + k * 0.08} b={0.46} /></text>
      <text x={166} y={35 + k * 24} className={k === 1 ? "gf-t gf-red" : "gf-t gf-green"} opacity={0}>{k === 1 ? "× test 2" : `✓ test ${k + 1}`}<Win a={0.56 + k * 0.08} b={0.96} /></text>
    </g>)}
    <path d="M256 57H292" className="gf-wire" />
    <text x={300} y={12} className="gf-t">reward</text>
    <text x={300} y={72} className="gf-big" opacity={0} style={{ fill: "#b8e986" }}>1<Win a={0.34} b={0.48} /></text>
    <text x={300} y={72} className="gf-big" opacity={0} style={{ fill: "#ff8f86" }}>0<Win a={0.82} b={0.97} /></text>
    <text x={330} y={68} className="gf-t" opacity={0}>all pass<Win a={0.34} b={0.48} /></text>
    <text x={330} y={68} className="gf-t" opacity={0}>one fails<Win a={0.82} b={0.97} /></text>
  </Fig>;
}

/* ── GRPO: eight attempts at one task; each is scored against the group's mean, not a learned critic. ── */
export function FigGRPO() {
  const reward = [1, 0, 1, 1, 0, 0, 1, 0];
  const mean = reward.reduce((a, b) => a + b, 0) / reward.length;
  const base = 70, unit = 46;
  return <Fig label="GRPO: each attempt's advantage is its reward minus the mean reward of its group">
    <text x={0} y={12} className="gf-t">eight attempts · one task</text>
    {reward.map((r, i) => {
      const x = 8 + i * 30, h = Math.abs(r - mean) * unit, up = r > mean;
      return <g key={i}>
        <rect x={x} y={up ? base - h : base} width={20} height={0} rx={2} className={up ? "g-g" : "g-r"} opacity={0.85}>
          <Tween attr="height" v0={0} v1={R(h)} a={0.3 + i * 0.03} b={0.45 + i * 0.03} />
          {up && <Tween attr="y" v0={base} v1={R(base - h)} a={0.3 + i * 0.03} b={0.45 + i * 0.03} />}
        </rect>
        <text x={x + 10} y={112} textAnchor="middle" className={r ? "gf-t gf-green" : "gf-t gf-red"} opacity={0}>{r ? "✓" : "×"}<Win a={0.04 + i * 0.025} b={0.97} /></text>
      </g>;
    })}
    <path d={`M0 ${base}H246`} className="gf-wire gf-ok" strokeDasharray="246" strokeDashoffset={246}>
      <animate attributeName="stroke-dashoffset" values="246;246;0;0;246" keyTimes="0;0.2;0.3;0.97;1" dur={DUR} repeatCount="indefinite" />
    </path>
    <text x={262} y={base - 18} className="gf-k">group mean</text>
    <text x={262} y={base - 2} className="gf-t">above it: reinforced</text>
    <text x={262} y={base + 14} className="gf-t">below it: pushed down</text>
    <text x={262} y={112} className="gf-t" opacity={0}>no critic model<Win a={0.62} b={0.97} /></text>
  </Fig>;
}

/* ── Test-time scaling: the same model, given a larger thinking budget, answers more tasks. ── */
export function FigTTS({ points }: { points: readonly number[] }) {
  // points: accuracy (0–100) at 1×, 2×, 4×, 8×
  const X0 = 40, W = 330, Y0 = 104, H = 78;
  const px = (i: number) => X0 + (i / (points.length - 1)) * W, py = (v: number) => Y0 - (v / 100) * H;
  const d = points.map((v, i) => `${i ? "L" : "M"}${R(px(i))} ${R(py(v))}`).join(" ");
  return <Fig label="Test-time scaling: accuracy rises as the thinking budget grows from 1× to 8×">
    <path d={`M${X0} ${Y0}H${X0 + W}M${X0} ${Y0}V${Y0 - H}`} className="gf-wire" />
    <text x={0} y={12} className="gf-t">accuracy · thinking budget →</text>
    {["1×", "2×", "4×", "8×"].map((b, i) => <text key={b} x={px(i)} y={118} textAnchor="middle" className="gf-t">{b}</text>)}
    <path d={d} className="gf-trace" strokeDasharray="400" strokeDashoffset={400}>
      <animate attributeName="stroke-dashoffset" values="400;400;0;0;400" keyTimes="0;0.06;0.7;0.97;1" dur={DUR} repeatCount="indefinite" />
    </path>
    {points.map((v, i) => <g key={i} opacity={0}>
      <Win a={0.06 + (i / (points.length - 1)) * 0.64} b={0.97} />
      <circle cx={px(i)} cy={py(v)} r={4} className="g-a" />
      <text x={px(i)} y={py(v) - 9} textAnchor="middle" className="gf-t">{Math.round(v)}%</text>
    </g>)}
  </Fig>;
}

/* ── Lean RL: the same correct answer, with the tokens past a target charged for and cut away. ── */
export function FigLean({ fewer }: { fewer: number }) {
  const L = 300, keep = L * (1 - fewer / 100);
  return <Fig label="Lean RL: the reward charges for tokens past a target, so the same answers use fewer tokens">
    <text x={0} y={18} className="gf-k">RL checkpoint</text>
    <rect x={100} y={8} width={L} height={14} rx={3} className="g-b" opacity={0.7} />
    <text x={0} y={60} className="gf-k">Lean RL</text>
    <rect x={100} y={50} width={L} height={14} rx={3} className="g-a"><Tween attr="width" v0={L} v1={R(keep)} a={0.15} b={0.55} /></rect>
    <rect x={R(100 + keep)} y={50} width={R(L - keep)} height={14} rx={3} className="gf-hatch" opacity={0}><Win a={0.55} b={0.97} /></rect>
    <path d={`M${R(100 + keep)} 40V74`} className="gf-wire gf-cut" opacity={0}><Win a={0.55} b={0.97} /></path>
    <text x={100} y={84} className="gf-t">tokens per task →</text>
    <text x={100} y={117} className="gf-big" opacity={0}>−{fewer}%<Win a={0.6} b={0.97} /></text>
    <text x={190} y={110} className="gf-t gf-green" opacity={0}>✓ the same answers<Win a={0.66} b={0.97} /></text>
  </Fig>;
}

/* ── Elastic RL: with a barrier, finished GPUs wait for the slowest rollout; elastic, they move on at once. ── */
export function FigElastic() {
  const lens = [0.9, 0.45, 0.62, 0.3];
  const X = 92, L = 300;
  return <Fig label="Elastic RL: GPUs that finish their rollout train or publish at once instead of waiting at a barrier">
    <text x={0} y={22} className="gf-k">barrier</text>
    <text x={0} y={38} className="gf-t gf-red">GPUs wait</text>
    {lens.map((l, i) => <g key={i}>
      <rect x={X} y={10 + i * 11} width={0} height={8} rx={2} className="g-b"><Tween attr="width" v0={0} v1={R(L * l * 0.6)} a={0.04} b={0.04 + l * 0.5} /></rect>
      <rect x={R(X + L * l * 0.6)} y={10 + i * 11} width={0} height={8} rx={2} className="g-r" opacity={0.4}><Tween attr="width" v0={0} v1={R(L * (0.9 - l) * 0.6)} a={0.04 + l * 0.5} b={0.49} /></rect>
    </g>)}
    <path d={`M${R(X + L * 0.54)} 6V56`} className="gf-wire gf-cut" />
    <text x={0} y={80} className="gf-k">elastic</text>
    <text x={0} y={96} className="gf-t gf-green">no wait</text>
    {lens.map((l, i) => <g key={i}>
      <rect x={X} y={68 + i * 11} width={0} height={8} rx={2} className="g-b"><Tween attr="width" v0={0} v1={R(L * l * 0.6)} a={0.04} b={0.04 + l * 0.5} /></rect>
      <rect x={R(X + L * l * 0.6 + 2)} y={68 + i * 11} width={0} height={8} rx={2} className="g-g"><Tween attr="width" v0={0} v1={R(L * (1 - l) * 0.6)} a={0.04 + l * 0.5} b={0.04 + l * 0.5 + (1 - l) * 0.45} /></rect>
    </g>)}
    <text x={400} y={118} textAnchor="end" className="gf-t">rollout · <tspan className="gf-green">train / publish</tspan></text>
  </Fig>;
}

/* ── Regression audit: the score rises, and every task that got worse on the way is still named. ── */
export function FigAudit() {
  const n = 40, gained = [3, 8, 12, 17, 21, 26, 30, 34, 37], lost = [14];
  return <Fig label="Regression audit: tasks gained and lost are counted separately, and each lost task is named">
    {Array.from({ length: n }, (_, i) => {
      const g = gained.indexOf(i), l = lost.indexOf(i);
      return <rect key={i} x={(i % 10) * 22} y={14 + Math.floor(i / 10) * 22} width={18} height={18} rx={3} className="g-m" opacity={0.4}>
        {g >= 0 && <animate attributeName="fill" values="#5e6a76;#5e6a76;#b8e986;#b8e986;#5e6a76" keyTimes={`0;${r3(0.1 + g * 0.04)};${r3(0.11 + g * 0.04)};0.96;1`} dur={DUR} repeatCount="indefinite" />}
        {(g >= 0 || l >= 0) && <animate attributeName="opacity" values=".4;.4;1;1;.4" keyTimes={`0;${r3(l >= 0 ? 0.58 : 0.1 + g * 0.04)};${r3((l >= 0 ? 0.58 : 0.1 + g * 0.04) + 0.01)};0.96;1`} dur={DUR} repeatCount="indefinite" />}
        {l >= 0 && <animate attributeName="fill" values="#5e6a76;#5e6a76;#ff8f86;#ff8f86;#5e6a76" keyTimes="0;0.58;0.59;0.96;1" dur={DUR} repeatCount="indefinite" />}
      </rect>;
    })}
    <rect x={R((14 % 10) * 22 - 3)} y={R(14 + 22 - 3)} width={24} height={24} rx={4} className="gf-warm" opacity={0}><Win a={0.62} b={0.96} /></rect>
    <text x={238} y={34} className="gf-t gf-green" opacity={0}>■ newly correct<Win a={0.1} b={0.96} /></text>
    <text x={238} y={56} className="gf-t gf-red" opacity={0}>■ got worse<Win a={0.58} b={0.96} /></text>
    <text x={238} y={86} className="gf-k" opacity={0}>each one named<Win a={0.66} b={0.96} /></text>
    <text x={238} y={104} className="gf-t" opacity={0}>not hidden in the score<Win a={0.7} b={0.96} /></text>
  </Fig>;
}

/* ── The manifold: every task a point, each model a cloud; lines join the same task across models. ── */
export function FigManifold() {
  const clouds = [
    { cx: 60, cy: 64, cls: "g-b", name: "base" },
    { cx: 200, cy: 54, cls: "g-c", name: "RL" },
    { cx: 340, cy: 64, cls: "g-a", name: "Lean RL" },
  ];
  const pts = [[-24, -18], [-8, 10], [12, -22], [22, 14], [-30, 20], [4, 28], [30, -6]];
  return <Fig label="The manifold: every task is a point, each model a cloud, and lines join the same task across the three models">
    {pts.map(([dx, dy], k) => <path key={k} d={`M${clouds[0].cx + dx} ${clouds[0].cy + dy}L${clouds[1].cx + dx * 0.8} ${clouds[1].cy + dy * 0.8}L${clouds[2].cx + dx * 0.7} ${clouds[2].cy + dy * 0.7}`} className="gf-wire" opacity={0}>
      <Win a={0.3 + k * 0.05} b={0.97} to={0.7} />
    </path>)}
    {clouds.map((c, ci) => <g key={c.name}>
      {pts.map(([dx, dy], k) => <circle key={k} cx={c.cx + dx * (1 - ci * 0.15)} cy={c.cy + dy * (1 - ci * 0.15)} r={3.6} className={c.cls} opacity={0}><Win a={0.04 + ci * 0.08 + k * 0.012} b={0.97} /></circle>)}
      <text x={c.cx} y={116} textAnchor="middle" className="gf-t">{c.name}</text>
    </g>)}
  </Fig>;
}
