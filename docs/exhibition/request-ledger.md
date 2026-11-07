# Request ledger: every ask across Yash's messages, with status (2026-10-26)

Rebuilt by re-reading all messages in the session transcript. Status: **Done** · **Partly** · **Open** (and why).

## Direction and principles
| Ask | Status |
|---|---|
| Keep Astra's layout; elevate sleekness and attention inside it | Done. The block shell is optional; the reel orientations keep the original stage at full size. |
| No text blocks or IT-dashboard chrome; museum feel (titles, names, numbers) | Partly. Captions, caveats, sub-step rows and links were removed; a few Astra panels still carry prose. |
| Denser, more profound content, but no vague one-liners ("prepare, execute, deliver", "a queued request cannot use an idle worker") | Done for Part 1, Part 2 and the post-training titles; every Δ states unit, meaning and cause. |
| No disclaimer banners; show our claims; never caption simulated numbers as real Qwen3-4B runs | Done. "Synthetic" appears only in units; caveats live in the scenario record. |
| Light and developer modes (round 1) | Open. They exist in the old exhibit wings, not in the current lab. |

## Attention and motion
| Ask | Status |
|---|---|
| One thing lit, the rest matte but still moving; highlight the architecture component by component, without fading the rest completely | Done. |
| Baseline and optimized must not animate at once | Done: scheduling, KV reuse, execution, prefill/decode, overlap, cache routing and queue each narrate one lane at a time. |
| Nothing pauses unless pause is pressed | Done. |
| Auto-cursor demonstrates hidden controls: replay sweep over 96 requests, p50 → p95 → p99, speculative views, post-training explorers | Done. |
| CPU/GPU overlap freezes on the first red idle patch | Done (verified 2026-10-26). |
| Latency dot plot: a cursor scans ranks while Δ grows | Done. |

## Numbers
| Ask | Status |
|---|---|
| Star and shine on numbers, more widely, more pronounced | Done. Tier 1: every earned result gets a bright sweep, glow and two stars. Tier 2: every prominent number gets a soft staggered sweep. SVG figure numbers glint. |
| Every gain states Δ, unit, what it is a Δ of, and its cause; explain "Δ ms" and "8 ms" | Done. |
| Graphs show baseline vs optimized as overlays | Partly. The Queue rank scan shades the gap between the two curves, and the runtime ladder shows the steps; there is no overlay in every module yet. |

## Navigation and structure
| Ask | Status |
|---|---|
| Two branches instead of Part 1 / Part 2; the fork names techniques, not GPU-s | Done. |
| Reel ("Go deeper") kept as it was, on top or on the side, not squeezing the lab | Done as live options: A reel on top (sticky, condensing), B side column, C docked below, plus D compact block. Switch with `?labnav=` or the tab at the left edge. |
| Lab as one block, no scrolling between modules | Done in D; A, B and C trade a single screen for a full-size stage while keeping the reel always in reach. |
| Dedupe Part 1, Part 2 and post-training | Done. Policy × runtime keeps only the combined lens; the overview time-lapses the three mechanisms shown in full elsewhere; "Where the 96 tasks land" moved to post-training. |
| Two-tier projects: overview first, then HLA → LLA → lab | Prototype at `/overview`. Each card deep-links to its module (`/#inference-study/draft`). |

## Module-specific
| Ask | Status |
|---|---|
| Baseline titles concrete ("Follow request 7…"), and chapter tabs that steal attention | Done. Chapters are quiet pills. |
| Worker scheduling liked; keep it | Kept. It now follows request 7, with a time-gain hero. |
| Speculative decoding: one model guesses, another verifies, as agents | Done. It adds a result card (Δ 9 calls) and a pause control. |
| Queue & latency spacing; the p50/p95/p99 tour | Done. |
| Policy × runtime dynamics | Done (combined lens, cycling). |
| Glossary should "sprout" into the project | Done. Cards open the microscope. |
| £120 shipping example removed; firstItem code task kept | Done (now spelled `first_item`). |
| Frontier explains each step (what we did, what it bought) | Done. Chapter titles state each step's computed result. |
| Hot inference terms woven in (SSE, KV sizing, PagedAttention, FlashAttention, continuous batching, chunked prefill, prefix caching, routing, ITL, speculative decoding, quantization, observability, engines, autoscaling) | Done via the glossary and the serving modules. |
| "For serving under load, some things are coming back" | Interpreted as repetition; the overview's repeated beats are now a 4.5 s time-lapse. |

## References
| Ask | Status |
|---|---|
| Brain Scan clip (local file): redo it as close as possible, as a separate piece | Done at `/brain-scan`: flat token × layer field, lit 3D relief, answer ribbon, confidence bars, one synchronised scan, on our first_item answer. |
| QwenGyre: review how well it was done | Reviewed. The scene existed but was unmounted. It now spotlights the first barrier (GPUs idle behind the slowest rollout) and shows hero metrics, and it is mounted as the post-training module "Elastic RL on 64 GPUs". Harness at `/fleet-review`. |
| DeepInfer (DeepSeek) | Its CPU/GPU overlap and draft-verification ideas are in. Not built: the decode Pareto plot (per-user tokens/s vs per-GPU throughput by concurrency), a candidate new serving module. |

## Still open
- Phone variant that shows one lane at a time (reviewer M34).
- One colour system across all modules: baseline slate-blue, optimized green, violet = Δ only, coral = waste (M32).
- Number formatting inside Astra components: separators, minus signs, percent precision, round ticks (m5–m10).
- Architecture sections are a few px taller than 900 (M35, Astra's section).
- Light and developer modes for the lab.

## Round 9 (2026-10-27): fit, focus, communication
Target viewport: the user's MacBook (3024×1964 Retina, which "looks like" 1512×982); Chrome at 100% shows about **1512×860**. Also verify at 1440×900 and 1280×800.

| # | Ask | Status |
|---|---|---|
| 1 | The results lab behaves like the architecture and microscope pages: it fills the screen and stays pinned, with nothing important below the fold | Done. The show layout is exactly one viewport and snaps flush under the header. |
| 2 | Remove the gap above "Inference optimization" that pushes the content down | Done. The gap is gone; the head is one tight row. |
| 3 | Every module fits one full screen. Track the page start and cutoff, and measure each component's use of the central 75% | Done. `tools/tracker/fit.mjs` reports room, natural height, scale and central-75% coverage for every module and beat. |
| 4 | No tiny words, and no robotic letter-spaced labels | Mostly done. Tracked capitals replaced in the film and explorers; HTML small text has a 12 px floor. Some SVG labels still render near 11 px at narrow widths. |
| 5 | Highlighted numbers get a focus mode: dim or desaturate the rest; baseline, optimized, Δ and cause shine vividly | Done. `stage-meter.tsx`: the stage desaturates and blurs except marked spots; a caption reads baseline, optimized, Δ and cause. |
| 6 | Guides are not text blocks at the bottom. Use a one-line live meter in the most visible place ("draft model drafting…") | Done. One-line live meter in the lab head, across every film chapter, arc and explorer. |
| 7 | Lab intro: branch 1 expands, then blurs; branch 2, renamed **Optimized serving under load**, expands and the cursor walks its titles (3–4 s) and returns. Then the opening line "First: how we serve the same intelligence with *cheaper execution*" | Done. Branch 02 renamed; both branches lift in turn, the cursor walks the titles, then the opening line. |
| 8 | Serving arcs: the "In our system" beats overflow the page with wasted space, so make them fit | Done. New timed system scenes for prefill/decode, speculative and cache; overlap fitted. All at scale 1. |
| 9 | Problem beat is labelled **Problem / Bottleneck**. State the bottleneck centrally and highlight it (e.g. "12 calls for 12 tokens: serialized computation, a bottleneck at scale") | Done. Beat renamed; each Problem ends with a central bottleneck statement and its effect at scale. |
| 10 | How it works shows **Optimized solution** on top and names the real draft model | Done. Beat renamed; the draft is the EAGLE-3 head for Qwen3-4B (`AngelSlim/Qwen3-4B_eagle3`). Its 0.2 B parameter count is an estimate from its architecture. |
| 11 | Use the empty right space: a tracker of where we started and where we ended up (baseline → now) | Done. The arc ledger beside the first two beats tracks baseline → optimized → Δ. |
| 12 | No vague wording | Done for the arcs and film; headings now state what happens with its number. |
| 13 | Cache routing "In our system": the request-C panel is small and diffuse, with no focus | Done. Replaced by a two-lane scene with a large consequence panel. The old explorer is behind "Explore the full model". |
| 14 | CPU/GPU overlap "In our system" is the gold standard; redo the others like it | Done for prefill/decode, speculative and cache. |
| 15 | Impact beats state what you learn, not just three numbers | Done. Every impact opens with a one-sentence lesson. |
| 16 | Serving glossary: start empty; each of the nine cards (3×3) expands for about 1 s under the cursor, then settles. This ends "serving under load" | Done. Empty 3×3 slots; each term large then settled; cursor sweep; the show ends there. |
| 17 | Cheaper execution feels repetitive and has no problem intro. Open with "the same intelligence at cheaper execution depends on N things", then pick one | Done. Opening board: baseline cost, where a request's time goes, three levers. Each technique states its bottleneck. Chapter lengths are unchanged, so some repetition may remain. |
| 18 | Film spacing: fit one screen. Prefix reuse has floating text blocks; use focus and blur instead | Done. Told on prompt reading (not 0.6% of total GPU work), with the meter and a focus moment. |
| 19 | Policy × runtime: annotate the curve itself (base → RL checkpoint: SFT + correctness RL; KV reuse + execution rate), with gains in pp and GPU-s, in focus mode | Done. Notes on the curve give pp and GPU-s; the final focus keeps only baseline, optimized and the two moves. |
| 20 | Replay: per-request differences look small. Show where it matters (latency), plus a paired baseline-vs-optimized cluster plot with median and mean | Done. Opens on response latency; paired cluster plot with median, mean and p95. |
| 21 | Post-training intro: the goal is a smarter model on math and coding (accuracy, then efficiency) | Done. Opening goal board with the four moves. |
| 22 | Show how the agent learns first: a reasoning trace and a reward critiquing it, like speculative's How it works | Done. Short scenes for SFT, GRPO, thinking budget and Lean RL, on first_item. |
| 23 | Starting point and SFT+LoRA pages: too much text; the "6-value calculation" box does nothing. Keep the six output coordinates, frozen matrices and loss graph | Done. Chapter 1 opens on the request; the 6-value box and formula are gone; coordinates, matrices and loss kept. |
| 24 | GRPO title text is unreadable as data; show it visually. Iterations: pink deepens and the curve tightens | Done. Plain title; four iterations; the pink deepens and the curve sharpens. The iterations are illustrative, not measured epochs. |
| 25 | "Give it more thought": label budgets as thinking budget, not accuracy. The request text is bad; keep the app → payment-provider graph. The guide at the bottom gets missed | Done. Labelled thinking budget; the request text is gone; the provider diagram stays; the guide moved to the meter. |
| 26 | Lean RL is undefined; give it a short mechanism | Done. Bottleneck plus a reward-minus-length scene. |
| 27 | Capability terrain loops: say what changes, and place it after SFT/GRPO are explained | Done. One pass, then holds; the meter names each checkpoint and its solved count. |
| 28 | Frontier: highlight the orange (runtime) dots with their gains; replace "moves it up / moves it left" | Done. Each serving dot shows its gain; the title states the numbers. |
| 29 | Inside the model: context for what improved it | Done, lightly: the kicker places it after SFT and GRPO. |
| 30 | "What did the model learn": arrows from each step to its result (e.g. where 69.8 came from) | Done for curves: arrow from the base point with pp, tasks and cause. Not yet on the capability map. |
| 31 | Where the 96 tasks land: reimagine the graph | Done. Tasks stacked by difficulty with an ability line that sweeps right. |
| 32 | Elastic RL: explain elastic RL and the QwenGyre idea; impact communicated | Done. Bottleneck, the idea (crediting QwenGyre), ledger and lesson. |
| 33 | Regression audit: communicate, not just represent | Done. Step-by-step ledger naming each lost task, plus a focus moment. |

## Round 10 (2026-11-07): direct attention, order by impact, free controls
Target viewport stays 1512×860.

| # | Ask | Status |
|---|---|---|
| 1 | Lab intro uses the full-screen blur: "Inference optimization can be done in two ways"; left branch lifts and its titles light up, then the right branch and its titles, then the explanation starts | Done. Line, left branch and its titles, right branch and its titles, then the line that starts the show. Skip link at the corner. |
| 2 | The explanatory pill (live meter) is out of focus; find a better way | Done. No pill. A film's or arc's own heading is the voice; other modules get one large plain line at the head of the stage. |
| 3 | The focus pop-up (dim page, one pill) is too blocky and too wordy; make it clean | Done. No box: one large line and at most a line of numbers on the dimmed picture, wording cut down. |
| 4 | Revisiting a module: the scrubber and pause cannot be used; the module rushes on | Done and tested. A finished module stays when revisited, arcs restart from the problem, framing scenes play once, and a finished film replays the chapter on screen. |
| 5 | "Open next" pill blocks the toggle bar and re-exploring | Done. The floating pill is gone; Next lives in the rail, and the pause and scrubber test as clickable. Using any stage control stops auto-advance. |
| 6 | Every component states, full screen: what we deal with, the exact goal, the impact | Done. Full-screen brief on first opening: we are looking at, the goal, the impact with its number, computed from the model. |
| 7 | Inference opens on a moving 3D graph (GPU time, correctness, waiting), not on a sentence of numbers; highlight the slowest 5%; then "depends on three things" | Done. `big-picture.tsx`: 96 requests on GPU time, waiting and correct/wrong sheets, turning camera, slowest 5% marked, each lever moves the points. |
| 8 | One central highlight theme (sparkles) that marks one phrase, not a whole pill | Done, as a highlighter stroke rather than sparkles (unslop lists sparkles and shimmer as AI tells). See `design-direction.md`. |
| 9 | Before baseline: the request-to-answer flowchart, which component each technique touches; narrow onto that component; what happens, what we did, impact in numbers | Done. `flow-board.tsx`: the whole path in the big picture, then each chapter narrows to its stop: what happens, what we changed, impact. |
| 10 | Order by visual impact: define the experiment quickly, then Execution replay, then Policy × runtime; the detailed experiment later; baseline made easier to consume | Done. Big picture, Execution replay, Policy × runtime, Queue & latency, then The experiment. The baseline now opens on the path before its detail; the baseline film itself is unchanged. |
| 11 | Inside each module, under the title cards on the left: keep playing, dive deeper, or go to the next one | Done. Rail under the titles: Stay on this one / Keep playing, Dive deeper, Next, with a state line. |
| 12 | Post-training: better introduction; start with Inside the model, then Capability terrain, then the other visual ones | Done. New introduction; Inside the model, Capability terrain, Compute curves, Where the tasks land, How it learned, Elastic RL, Capability map, Regression audit. |
| 13 | Capability terrain: unclear whether it is running, replaying, or time to move on | Done. One pass, chosen stages, Raise it again, and a state line in the rail. Inside the model also runs once, with a scrubber. |
| 14 | Component microscope: endless floating marquees and the pill; refer to the original. **Later, not this round** | Later |
| 15 | Component microscope: the Conclusion stage is broken | Fixed. The conclusion was squeezed into a 38 px row by a grid rule of mine. Copy also made plain. |

## Round 11 (2026-11-08): highlights first, a real conclusion, a live second page
| # | Ask | Status |
|---|---|---|
| 1 | Microscope pill ("Model parallelism spreads weights…" with chips): compare with Antigravity and Medical AI, understand what it should be, redo it | Done. The compute microscopes now use the same signal console, stage header and input → output rail as Antigravity and Medical AI; my stripped-down version is gone. |
| 2 | Conclusion: redo from scratch; genuinely conclude what was done and achieved | Done. New `ConclusionBoard`: one verdict sentence, the measures behind it, each piece of work beside what it bought, what it showed, and a link to the results. |
| 3 | Title introductions: move like the top reel layout (big picture → replay → policy → queue → experiment), not the current graphic | Done. Intro and briefs use a reel (`ReelRow`): tiles share a row, the open one grows, a cursor walks them. |
| 4 | Big picture: the three levers stay pinned, numbered, beside a smaller graph; say "same intelligence at scale, less GPU time" | Done. Levers numbered and pinned on the left with their results and a running tally; the graph sits on the right. |
| 5 | Request flow: not sequential; the whole flowchart visible at once | Done. One whole system diagram: queue, scheduler, two workers, KV cache, weights, answers. Levers light parts of it; nothing is cropped. |
| 6 | Module brief text: earlier version's look was better; give it a makeover | Done. Centred: title, what it is, the goal, the impact with its highlight, under the reel. |
| 7 | Bring back the bottom-left loading pill's style for Next | Done. Dark round Next pill with a loading ring, now in the rail so it covers nothing. |
| 8 | Returning to a module must restart it (or resume where left), never play its last 15 seconds | Done and tested. Explorers remount and restart on return; finished arcs restart; unfinished arcs resume. |
| 9 | Freeze and highlight inside graphs wherever numbers or graphs appear (e.g. Δ fewer requests waiting) | Done for queue & latency, policy × runtime, film chapters, terrain, tasks, audit, replay clusters. The film freezes while the number reads. Not yet: inside the model, curves. |
| 10 | Glossary titles move like the reel | Done. Three rows of title cards; the open card grows and its figure runs. |
| 11 | When a component is done, go on to the next one | Done. Finished modules move on after 3.2 s. A used module moves on after 30 s idle. Only Stay on this one holds it. |
| 12 | Compute curves: faster checkpoint transitions | Done. Holds cut from about 4 s to about 1.5 s. |
| 13 | Rename the post-training titles | Done. See the rail; new names are my proposal and easy to change. |
| 14 | Frontier moved far ahead, perhaps with compute curves; bring back the curve that keeps updating | Frontier done: its own module near the top. The updating curve: the chosen curve now redraws each time. **Yash to confirm this is the curve meant.** |
| 15 | Blurred-screen text always in the same central place | Done. Always the middle of the stage. |
| 16 | Learn from outcomes lifted near the top | Done. Its own module, third in the order, and in the highlights. |
| 17 | A 1–2 minute highlights run first in both labs, individual modules after for depth | Done. The two-minute version: inference 10 clips, about 110 s; post-training 8 clips, about 78 s. Real figures, not recordings. |
| 18 | Project order: post-training, inference, medical AI, interview AI | Done. Home sections, project index, hero deck, nav and numbering. |
| 19 | Project second page: three blocks on a curve (microscope, results, current page), one central and two muted, all live, auto-toggling, "click to explore" | Done. `project-second-page.tsx`: three live blocks on a curve, toggling every 11 s, holding on hover, with the call to explore. |
| 20 | Microscope block runs through every component at 1.5–2× | Done. The real microscope at 1.8× its pace. |

## Round 12 (2026-11-08): teach, then ask; the transition was misread
| # | Ask | Status |
|---|---|---|
| 1 | Microscope keywords must keep rolling | Done. They roll when paused or when a step is chosen by hand. Tested on inference. |
| 2 | Second page: tabs better arranged, three in one, not stacked horizontally | Done. One large block, two stacked beside it; each block carries its own tab. |
| 3 | The result on one page is too inactive | Done. It walks its results one at a time. |
| 4 | Results block: not one horizontal row; e.g. 3 + 2, highlighted card larger | Done. Rows of 3 + 2, 3 + 3, 4 + 3 or 4 + 4. |
| 5 | Short version: 2.5–3 minutes, with a structure that teaches | Done. Post-training about 3 minutes; inference two runs of about 85 and 100 seconds. Problem → fix → result, with line cards at the turns. |
| 6 | "Top reel" meant its clean colour-and-motion transition, not the reel itself | Done. Reel overlay removed. Title cards and glossary use its timing and colour. |
| 7 | Bring back the original pill for moving between modules | Done in its style: appears once a module is finished, ring loading. It sits in the rail rather than floating, so it cannot cover a scrubber. **To confirm with Yash.** |
| 8 | After a short version: study in detail, or go on to the next part | Done. A planned fork; going on starts by itself after 14 s where there is a next part on the page. |
| 9 | Inference names: one or two are too big | Done. Prefill / decode scheduling → Chunked prefill; Serving system overview → System map. |

## Round 13 (2026-11-08): no "short version"; say what improved; a striking second page
| # | Ask | Status |
|---|---|---|
| 1 | Intro titles move too fast | Done. Each title now holds about 1.9 s, up from 0.85 s. |
| 2 | Remove "short version" and "serving glossary" from the titles; start with the important modules | Done. Both are gone from the rail and the intro. The glossary still opens from its direct link. |
| 3 | Rename inference modules so names say something | Done. Titles now say the outcome, with the technique beside it, for example "Fewer calls to the large model" (Speculative decoding). |
| 4 | Say in the title what improves and what happens | Done. The stage head names the module, its number and why, on every module. |
| 5 | Big picture does not complete; check its timing | Done. The flow gets longer per lever, and a closing state with all three together. |
| 6 | Toggle bar and scrubbing do not work properly | Done and tested. Cause: my own listener re-rendered in the middle of a slider event and threw the click away. Scrubbing also no longer triggers a freeze, and touching anything ends one. Policy × runtime had no scrubber in this layout; it has one now. |
| 7 | Inference summary duplicated the big picture; no flow in either summary. A good summary, not a short one | Done. No separate summary. The modules are told in order at full length, then a planned stop asks: check it in detail, or go on. |
| 8 | No vague statements like "moves left": say accuracy rose, cost fell, with numbers | Done for the lines that said moves left/up/right. They now state accuracy and cost with numbers. |
| 9 | "Holding up when load arrives" is bad; say optimized serving under load | Done. Second: optimized serving under load. |
| 10 | Second page is not striking; make it enticing enough that people go in | Done. One enormous number moving in step with the live picture behind it, one sentence, one button, three live doors with a question each. |
| 11 | Task by task: a blinking box on the number that changes (22 of 32) | Done. A box blinks three times on each score that changes. |
| 12 | Post-training order: learning from outcomes second, then skill gained, then frontier, then accuracy | Done. Inside the model, learning from outcomes, skill gained, accuracy against cost, what more thinking buys, elastic RL, task by task; then the detail. |
