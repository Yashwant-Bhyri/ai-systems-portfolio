# Scheduling review checkpoint

The dedicated 26-second Release the queue scene preserves the six-request subset of the original cohort. Fixed paired batches and independent admission have identical arrivals, service lengths, outputs and task outcomes. Changes are start times and worker assignments. Red intervals are checked to contain both an idle worker and waiting arrived work.

The authored clock holds at Q3 admission, then at Q5's earlier delivery, before both schedules complete. The main absolute-time timeline and the selected request's arrival-relative wait/work strips deliberately use different origins; that distinction is stated in the inspector. No hardware speedup is claimed.

Verified:

- 15 new scheduling tests, 95 combined model tests, 3 relevant server-render tests.
- TypeScript, targeted ESLint, production build, whitespace check.
- Lazy component loading removes the initial bundle-size warning introduced by eagerly importing this scene.
- Desktop 1440×1050; mobile 390×844, 390px document width with the 660px figure contained in its 356px scroll region.
- Mouse and keyboard request selection, explicit pause, Escape release, workload switching and reduced-motion end state at 26 seconds with manual moments retained.
- Shared-document Q5: 68.6696 vs 76.3220 absolute completion; 60.6696 vs 68.3220 response latency; identical 22.8476 GPU-seconds of work.
- Different-document Q3: starts at 44 vs 66 seconds, retains 12.7840 GPU-seconds of work.
- Scoped axe check has zero violations. SVG/gradient contrast remains an automated incomplete check, not a whole-site accessibility certification. No browser errors.

The execution-scale source archive is the pre-change baseline. The scheduling source snapshot is saved separately after verification. Opening workload staging, final composition and post-training remain future component passes.
