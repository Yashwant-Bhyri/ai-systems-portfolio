---
name: Fable Portfolio v7
description: A kinetic, evidence-led observatory for applied AI systems.
colors:
  void: "#050608"
  void-soft: "#090b0f"
  panel: "#0d1015"
  panel-raised: "#11151c"
  ink: "#f4f5ef"
  muted: "#a5afba"
  faint: "#6e7886"
  signal-lime: "#b8ff63"
  reasoning-violet: "#a28cff"
  voice-cyan: "#62e9ff"
  operations-amber: "#ffc267"
  systems-blue: "#78a8ff"
  warning-red: "#ff8176"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.45rem, 4.1vw, 3.875rem)"
    fontWeight: 475
    lineHeight: 1.035
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.4vw, 3.35rem)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "-0.015em"
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 560
    lineHeight: 1.3
    letterSpacing: "0.07em"
rounded:
  precise: "0px"
  compact: "6px"
  surface: "10px"
spacing:
  micro: "6px"
  compact: "10px"
  control: "14px"
  component: "20px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.signal-lime}"
    textColor: "{colors.void}"
    typography: "{typography.label}"
    rounded: "{rounded.precise}"
    padding: "16px 18px"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.precise}"
    padding: "16px 18px"
  technical-surface:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "20px"
---

# Design System: Fable Portfolio v7

## Overview

**Creative North Star: "The Guided Systems Observatory"**

The interface behaves like an observatory for live AI systems: a dark, quiet field holds precise diagrams, active paths, and evidence signals that become bright only when they matter. It is kinetic without becoming frantic. Each viewport has one dominant mechanism, and the automatic walkthrough reveals the system in the same order a strong technical presenter would explain it.

The system rejects generic SaaS landing-page composition, game-like controller chrome, dense dashboards, static résumé grids, and unexplained internal terminology. Technical depth comes from legible runtime behavior and concrete annotations, not from increasing the amount of prose.

**Key Characteristics:**

- Full-viewport, scroll-resolved presentation pages.
- Near-black spatial field with project-specific signal colors.
- Animated architecture diagrams as primary imagery.
- Descriptive project labels before secondary codenames.
- Square or lightly curved technical surfaces with crisp one-pixel boundaries.
- Persistent but compact contact access.
- A central cinematic hero that physically resolves into the final quadrant composition.
- Evidence-aware hero highlights for the CUHK-Shenzhen identity, QS ranking proof, technical scope, and experience counts.
- A role-driven capability lens: five engineering domains, 20 visible skills, and concise applied evidence rather than a checklist or brand map.
- Full-scale architecture pages followed by separate component-microscope pages.
- A two-page, six-record research sequence with one active specimen at a time.

## Colors

The palette uses a near-black observatory field and assigns one scarce signal color to each system so active paths can be recognized before they are read.

### Primary

- **Signal Lime:** The portfolio identity, active navigation state, hero cursor, primary action, and Antigravity runtime.

### Secondary

- **Reasoning Violet:** Filmora's multimodal production and orchestration states.
- **Voice Cyan:** MindScape's capture, retrieval, and clinician-support states.

### Tertiary

- **Operations Amber:** Logistics operations, guarded actions, and caution states.
- **Systems Blue:** Research, browser perception, and systems engineering.
- **Warning Red:** Rejection, validation failure, and safety exceptions only.

### Neutral

- **Void:** The page field.
- **Soft Void:** Large depth layer and quiet section variation.
- **Panel / Raised Panel:** Operational surfaces and active detail layers.
- **Ink:** Primary readable content.
- **Muted / Faint:** Secondary annotations and inactive graph labels.

**The Active-Signal Rule.** One or two bright signals may command a viewport at once; everything else stays muted enough to preserve hierarchy.

**The Semantic-Accent Rule.** Project colors identify systems and states. Never recolor them merely for decoration.

## Typography

**Display Font:** Geist (with ui-sans-serif and system fallbacks)  
**Body Font:** Geist (with ui-sans-serif and system fallbacks)  
**Label/Mono Font:** Geist Mono (with ui-monospace fallback)

**Character:** Geist provides compact, contemporary engineering clarity while Geist Mono labels runtime states without turning the entire portfolio into a terminal costume. Scale, weight, and placement create hierarchy inside the existing identity.

### Hierarchy

- **Display** (475, fluid 39–62px, 1.035): Hero choreography and singular chapter statements.
- **Headline** (500, fluid 32–54px, 1.04): Page titles and active project statements.
- **Title** (560, 18–24px, 1.2): Component-microscope stage titles and research spotlight names.
- **Body** (400, 16px, 1.62): Explanations capped at roughly 68 characters per line.
- **Label** (560, 11px, 0.07em, selective uppercase): Runtime labels, badges, metadata, and compact controls.

**The Plain-Language Rule.** A label can be technical; a sentence must explain its consequence.

**The Display-Spacing Rule.** Display letter spacing never exceeds -0.04em.

## Elevation

Depth is structural rather than ornamental. Tonal layers, line contrast, controlled glow, parallax, and diagram motion establish hierarchy. Ambient shadows appear only under live signals, raised project cards, and overlays that genuinely sit above another surface.

### Shadow Vocabulary

- **Signal Glow** (`0 0 22px rgba(184,255,99,0.35)`): Active nodes, live cursors, and selected paths.
- **Raised Surface** (`0 20px 60px rgba(0,0,0,0.34)`): The contact drawer and foreground project card.

**The Flat-By-Default Rule.** Resting surfaces are separated by tone and one-pixel lines; shadows communicate actual elevation or activity.

## Components

### Buttons

- **Shape:** Square technical control (0px radius).
- **Primary:** Signal-lime fill, void text, 16px by 18px padding.
- **Hover / Focus:** Small upward translation on hover and a two-pixel semantic-accent focus ring.
- **Secondary / Ghost:** Transparent or panel surface with a one-pixel strong line; never a low-contrast pill.

### Chips

- **Style:** Compact square label with a faint border; selected state uses the current project signal.
- **State:** Selection must change color, contrast, and a visible marker so meaning is not color-only.

### Cards / Containers

- **Corner Style:** Square for controls and evidence rows; lightly curved (6–10px) only for large technical canvases.
- **Background:** Panel or raised-panel tone over the void.
- **Shadow Strategy:** Flat by default; use Raised Surface only when stacking is literal.
- **Border:** One-pixel neutral line, strengthening on active state.
- **Internal Padding:** 14–24px based on information density.

### Inputs / Fields

- **Style:** Dark panel, one-pixel line, square edges, body typography.
- **Focus:** Semantic accent border plus visible external outline.
- **Error / Disabled:** Warning red is reserved for genuine error; disabled items remain readable and explicitly labelled.

### Navigation

The fixed header is quiet, translucent, and no taller than 76px. Natural scroll is primary. Header links jump to major chapters, while compact next/back symbols may support orientation without becoming a controller panel. Active progress is shown through a thin signal line and semantic current-page state.

### Component Microscope

Each microscope combines a concise input / operation / output explanation with the live graphic. The stage rail auto-advances while visible, pauses when the visitor requests it, and ends with a visually distinct conclusion stage inside the same microscope.

The high-level architecture is never compressed into the microscope. It remains mounted on the preceding page at full scale. One completed architecture circuit may trigger a single native smooth handoff to the microscope; scrolling back must not trigger another forced handoff.

### Capability Role Lens

Three role tabs occupy the left axis. The center keeps all 20 production skills visible, grouped into five horizontal engineering domains; relevance changes through contrast and signal intensity rather than checkmarks or connector spaghetti. The right axis shows three capability-first examples of work for the active role. Product, internship, research, and R&D names appear only as compact provenance above each example.

The lens auto-advances between AI Systems Engineer, AI Agent & Application Developer, and Full-Stack AI / ML Engineer. Pause, replay, direct tab selection, and keyboard arrow navigation remain available. The domain scan advances independently so the visitor can understand the system one capability family at a time.

### Hero Evidence Highlights

The hero remains one large typed-and-backspaced presentation before it resolves into the upper-left credential capsule. Highlighting is semantic rather than decorative:

- CUHK-Shenzhen uses the university treatment and inline crest.
- `(CUHK, QS World #18)` uses a distinct proof treatment.
- Technical scope uses the signal treatment.
- `3 internships` and `2 research experiences` use the metric treatment.

Highlights reveal only as their text is typed. The opening uses solid editorial marker ribbons with cloned line decoration so wrapped phrases remain intentional; the resolved capsule switches to quieter underlines and tinted evidence fields. Both states must preserve text flow, line-height, and silent readability.

### Flagship Stage Counts

- **Antigravity:** nine component stages, with the recruiter report followed by an offline agent-evaluation and route-policy refinement loop.
- **Wondershare Filmora:** eight component stages, ending in trace-led evaluation and refinement.
- **MindScape:** eight component stages, with governed refinement following clinician review.

The arrays driving the story rail and the live-scene arrays remain one-to-one. Evaluation and refinement are operational stages, not decorative conclusion claims.

### Dynamic Conclusion

The conclusion uses one central signal at a time rather than a six-card matrix. A quiet six-label rail shows position and supports direct selection. The project action or boundary note appears after the first complete signal cycle.

### Research Sequence

Research and R&D use two complete presentation pages. Records 1–3 form page one; records 4–6 form the continuation page. Each page keeps three specimen cards visible on desktop, while a single active card receives the bright border, progress sweep, and live mini-graphic. Inactive cards remain readable and still establish sequence context.

Autoplay advances 1 → 6, performs one native smooth handoff to page two when record 4 becomes active, holds on record 6, and then advances to the closing contact page. The visitor can pause or focus a card manually; manual focus must not force a page jump. Tablet and mobile may reduce the grid to two or one column without changing the record order.

### Contact Drawer

A persistent compact trigger exposes verified contact channels without repeating a full contact card on each page. Unavailable values are labelled as pending rather than represented by fake links.

## Do's and Don'ts

### Do:

- **Do** let natural wheel, trackpad, touch, and keyboard scrolling resolve to complete presentation pages.
- **Do** keep the operational graphics and their default motion as primary imagery.
- **Do** compact introductory copy after it has established context.
- **Do** begin the hero as a true central presentation before revealing the credential, contact, and selected-work quadrants.
- **Do** preserve the CUHK crest, proof highlight, and metric highlights through both hero states.
- **Do** keep all 20 skills visible and group them into the five capability domains used by the role lens.
- **Do** keep applied evidence capability-first; project names remain secondary provenance.
- **Do** preserve each flagship's complete high-level architecture above its microscope.
- **Do** keep the nine-stage Antigravity and eight-stage MindScape live-scene arrays aligned with their story-step arrays.
- **Do** let the research spotlight progress 1 → 6 across two complete pages before the closing contact page.
- **Do** keep desktop microscopes side by side even in short windows; stack only when width requires it.
- **Do** attach every strong claim to its mechanism, outcome, or conclusion.
- **Do** keep primary body copy below roughly 68 characters per line.
- **Do** keep contact access visible and verified.

### Don't:

- **Don't** build a generic SaaS landing page assembled from interchangeable rounded cards.
- **Don't** build a videogame HUD that requires a controller, map, or dense navigation chrome.
- **Don't** expose every metric and label at the same visual priority like a dashboard.
- **Don't** hide mechanisms behind a static résumé grid.
- **Don't** collapse the role lens into requirement rows, a skill checklist, or a web of brand-to-skill connectors.
- **Don't** collapse all six research records back into one long specimen wall.
- **Don't** use unexplained internal engineering terminology as presentation copy.
- **Don't** strip out operational graphics or their motion in the name of simplification.
- **Don't** take control away from the visitor through irreversible autoplay.
- **Don't** add gradient text, decorative pills, or repeated tiny uppercase section eyebrows.
- **Don't** invent contact links, affiliations, algorithms, bit-widths, or metrics.
