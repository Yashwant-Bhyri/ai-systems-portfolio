"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import {
  SERVING_BEATS,
  SERVING_OVERVIEW_DURATION_MS,
  servingOverviewFrame,
  type ServingRoute,
} from "./serving-load-overview-model";
import "./serving-load-overview.css";
import { ServingHardwareScenes } from "./serving-hardware-scenes";
import { ServingAdmissionScenes } from "./serving-admission-scenes";
import { servingAdmissionFrame } from "./serving-admission-model";
import { ServingDeliveryScene } from "./serving-delivery-scenes";
import {
  deliveryFrame,
  deliveryStudy,
  type DeliveryTargets,
} from "./serving-delivery-model";
import {
  ServingLocalityScene,
  ServingVerificationScene,
} from "./serving-continuity-scenes";
import { localityFrame, verificationFrame } from "./serving-continuity-model";
import {
  OVERVIEW_PACING,
  OVERVIEW_PLAYBACK_DURATION_MS,
  overviewPresentationTime,
  overviewTraceTime,
} from "./serving-overview-playback";
import {
  fusionFixture,
  hardwareFrame,
  pipelineFixture,
  quantizationFixture,
  tensorFixture,
  type HardwareTopology,
} from "./serving-hardware-model";

type DraftCase = "accepted" | "loss";

const clamp = (value: number) =>
  Math.max(0, Math.min(OVERVIEW_PLAYBACK_DURATION_MS, value));

function useOverviewClock(
  root: RefObject<HTMLElement | null>,
  active: boolean,
) {
  const [time, setTime] = useState(0);
  const [revision, setRevision] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const current = useRef(0);
  const previous = useRef<number | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(media.matches);
      if (media.matches) {
        current.current = OVERVIEW_PLAYBACK_DURATION_MS;
        setTime(current.current);
        setPlaying(false);
      }
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const update = () => setTabVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (!root.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.04 },
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [root]);
  useEffect(() => {
    if (!active || !playing || !visible || !tabVisible || reduced) {
      previous.current = null;
      return;
    }
    let animation = 0;
    const tick = (now: number) => {
      if (previous.current !== null) {
        current.current = clamp(
          current.current + Math.max(0, now - previous.current),
        );
        setTime(current.current);
      }
      previous.current = now;
      if (current.current >= OVERVIEW_PLAYBACK_DURATION_MS) setPlaying(false);
      else animation = requestAnimationFrame(tick);
    };
    animation = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animation);
      previous.current = null;
    };
  }, [active, playing, visible, tabVisible, reduced]);
  return {
    time,
    traceTime: overviewTraceTime(time),
    revision,
    playing,
    reduced,
    running: active && playing && visible && tabVisible && !reduced,
    pause: () => setPlaying(false),
    seek: (next: number) => {
      setRevision((value) => value + 1);
      current.current = overviewPresentationTime(next);
      setTime(current.current);
      setPlaying(false);
    },
    scrub: (next: number) => {
      setRevision((value) => value + 1);
      current.current = clamp(next);
      setTime(current.current);
      setPlaying(false);
    },
    replay: () => {
      setRevision((value) => value + 1);
      current.current = 0;
      setTime(0);
      setPlaying(!reduced);
    },
    toggle: () => {
      if (reduced) return;
      setRevision((value) => value + 1);
      if (current.current >= OVERVIEW_PLAYBACK_DURATION_MS) {
        current.current = 0;
        setTime(0);
      }
      setPlaying((prior) => !prior);
    },
  };
}

export function ServingLoadOverview({
  onOpenContinuity,
  onOpenDraft,
  onOpenCache,
  onOpenOverlap,
  active: isActive = true,
}: {
  onOpenContinuity: () => void;
  onOpenDraft: () => void;
  onOpenCache: () => void;
  onOpenOverlap?: () => void;
  active?: boolean;
}) {
  const root = useRef<HTMLElement>(null);
  const diagramScroll = useRef<HTMLDivElement>(null);
  const beatList = useRef<HTMLDivElement>(null);
  const clock = useOverviewClock(root, isActive);
  const [route, setRoute] = useState<ServingRoute>("warm");
  const [draftCase, setDraftCase] = useState<DraftCase>("accepted");
  const [bits, setBits] = useState<4 | 8>(4);
  const [topology, setTopology] = useState<HardwareTopology | null>(null);
  const [selectedWeight, setSelectedWeight] = useState(0);
  const [deliveryTargets, setDeliveryTargets] = useState<DeliveryTargets>({
    firstTokenMs: 100,
    maxGapMs: 60,
  });
  const [deliverySelection, setDeliverySelection] = useState<{
    id: string;
    revision: number;
  } | null>(null);
  const markerId = useId().replace(/:/g, "");
  const frame = servingOverviewFrame(clock.traceTime, route);
  const beat = SERVING_BEATS.find((candidate) => candidate.id === frame.beat)!;
  const hardware = [
    "execution",
    "precision",
    "placement",
    "lifecycle",
  ].includes(frame.beat);
  const hardwareState = hardwareFrame(clock.traceTime, topology);
  const opening = ["arrivals", "admission", "interference"].includes(
    frame.beat,
  );
  const continuity = frame.beat === "locality" || frame.beat === "verification";
  const delivery = frame.beat === "outcome";
  const selectedDelivery =
    deliverySelection?.revision === clock.revision
      ? deliverySelection.id
      : null;
  const admissionMoments =
    frame.beat === "arrivals"
      ? ([
          [0, "A is streaming"],
          [5000, "B arrives"],
        ] as const)
      : frame.beat === "admission"
        ? ([
            [7500, "Whole input"],
            [10000, "Admit a chunk"],
          ] as const)
        : ([
            [12700, "Next token waits"],
            [14500, "Stream resumes"],
            [17900, "Prefix retained"],
          ] as const);
  useEffect(() => {
    const list = beatList.current;
    const selected = list?.querySelector<HTMLButtonElement>(
      '[aria-pressed="true"]',
    );
    if (!list || !selected || !isActive) return;
    const revealSelected = () => {
      const bounds = list.getBoundingClientRect(),
        item = selected.getBoundingClientRect();
      if (item.left < bounds.left || item.right > bounds.right)
        list.scrollTo({
          left:
            list.scrollLeft +
            item.left -
            bounds.left -
            (list.clientWidth - item.width) / 2,
          behavior: "instant",
        });
    };
    revealSelected();
    const observer = new ResizeObserver(revealSelected);
    observer.observe(list);
    return () => observer.disconnect();
  }, [frame.beat, isActive]);
  const changeBranch = (change: () => void) => {
    clock.pause();
    change();
  };

  return (
    <section
      ref={root}
      className="slo-root"
      data-beat={frame.beat}
      data-time={Math.round(clock.time)}
      data-trace-time={Math.round(clock.traceTime)}
      data-playing={clock.running}
      aria-label="Serving under load operational overview"
    >
      <div className="slo-topline">
        <span>PART 2 · NEW A/B/C/D WORKLOAD</span>
        <strong>Illustrative serving schematic</strong>
      </div>
      <div className="slo-header">
        <div>
          <h3>{beat.title}</h3>
          <p>{beat.detail}</p>
        </div>
      </div>
      <div className="slo-transport" aria-label="Overview playback">
        <button
          type="button"
          onClick={() => {
            setTopology(null);
            clock.toggle();
          }}
          disabled={clock.reduced}
          aria-label={clock.playing ? "Pause overview" : "Play overview"}
        >
          {clock.playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={() => {
            setTopology(null);
            clock.replay();
          }}
        >
          Replay
        </button>
        <label htmlFor={`${markerId}-seek`}>Story position</label>
        <input
          id={`${markerId}-seek`}
          type="range"
          min="0"
          max={OVERVIEW_PLAYBACK_DURATION_MS}
          step="100"
          value={clock.time}
          onChange={(event) => {
            setTopology(null);
            clock.scrub(Number(event.target.value));
          }}
          aria-valuetext={`${beat.label}, ${Math.round(clock.time / 1000)} of ${OVERVIEW_PLAYBACK_DURATION_MS / 1000} presentation seconds`}
        />
        <output>
          {Math.round(clock.time / 1000)} /{" "}
          {OVERVIEW_PLAYBACK_DURATION_MS / 1000} s
        </output>
        {clock.reduced && (
          <span className="slo-motion-note">
            Motion off: select a beat or move the story cursor.
          </span>
        )}
      </div>
      <div
        ref={beatList}
        className="slo-beats"
        role="group"
        aria-label="Seek to a serving event"
      >
        {SERVING_BEATS.map((candidate, index) => (
          <button
            key={candidate.id}
            type="button"
            aria-pressed={frame.beat === candidate.id}
            onClick={() => {
              setTopology(null);
              clock.seek(
                clock.reduced
                  ? (SERVING_BEATS[index + 1]?.at ??
                      SERVING_OVERVIEW_DURATION_MS) - 100
                  : candidate.id === "interference"
                    ? 12700
                    : candidate.at,
              );
            }}
          >
            {candidate.label}
          </button>
        ))}
      </div>
      {opening && (
        <div className="slo-context-controls slo-hardware-controls">
          <div
            className="slo-choice"
            role="group"
            aria-label="Inspect request admission moments"
          >
            <span>Follow the request</span>
            {admissionMoments.map(([at, label]) => (
              <button key={at} type="button" onClick={() => clock.seek(at)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      {continuity && (
        <div className="slo-context-controls slo-hardware-controls">
          <div
            className="slo-choice"
            role="group"
            aria-label={
              frame.beat === "locality"
                ? "Inspect routing moments"
                : "Inspect verification moments"
            }
          >
            <span>Follow request C</span>
            {(frame.beat === "locality"
              ? [
                  [18500, "Retained prefix"],
                  [21950, "Route request C"],
                  [23700, "Check request D"],
                ]
              : [
                  [26680, "Draft proposals"],
                  [26950, "Verify prefix"],
                  [28900, "Committed answer"],
                ]
            ).map(([at, label]) => (
              <button
                key={at}
                type="button"
                onClick={() => clock.seek(Number(at))}
              >
                {label}
              </button>
            ))}
          </div>
          <div
            className="slo-choice"
            role="group"
            aria-label={
              frame.beat === "locality"
                ? "Choose C’s replica"
                : "Choose draft agreement"
            }
          >
            {frame.beat === "locality"
              ? (["warm", "cold"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={route === option}
                    onClick={() =>
                      changeBranch(() => {
                        setRoute(option);
                        clock.seek(frame.storyMs >= 22600 ? 23700 : 21950);
                      })
                    }
                  >
                    {option === "warm"
                      ? "Reuse on replica 1"
                      : "Recompute on replica 2"}
                  </button>
                ))
              : (["accepted", "loss"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={draftCase === option}
                    onClick={() =>
                      changeBranch(() => {
                        setDraftCase(option);
                        clock.seek(frame.storyMs >= 27000 ? 28900 : 26950);
                      })
                    }
                  >
                    {option === "accepted"
                      ? "Two proposals agree"
                      : "First proposal fails"}
                  </button>
                ))}
          </div>
        </div>
      )}
      {delivery && (
        <div className="slo-context-controls slo-hardware-controls">
          <div
            className="slo-choice"
            role="group"
            aria-label="Inspect delivery criteria"
          >
            <span>Apply the checks</span>
            {[
              [88500, "A–D outcomes"],
              [89300, "First token (TTFT)"],
              [90500, "Token gaps (ITL)"],
              [91800, "Answer validity"],
              [93200, "Qualified rate"],
            ].map(([at, label]) => (
              <button
                key={at}
                type="button"
                onClick={() => clock.seek(Number(at))}
              >
                {label}
              </button>
            ))}
          </div>
          {frame.storyMs >= 89000 && (
            <>
              <div
                className="slo-choice"
                role="group"
                aria-label="First token target for worked example"
              >
                <span>TTFT target</span>
                {([100, 180] as const).map((ms) => (
                  <button
                    key={ms}
                    type="button"
                    aria-pressed={deliveryTargets.firstTokenMs === ms}
                    onClick={() => {
                      setDeliveryTargets((old) => ({
                        ...old,
                        firstTokenMs: ms,
                      }));
                      clock.pause();
                    }}
                  >
                    {ms} ms
                  </button>
                ))}
              </div>
              <div
                className="slo-choice"
                role="group"
                aria-label="Maximum token gap for worked example"
              >
                <span>Max ITL</span>
                {([60, 120] as const).map((ms) => (
                  <button
                    key={ms}
                    type="button"
                    aria-pressed={deliveryTargets.maxGapMs === ms}
                    onClick={() => {
                      setDeliveryTargets((old) => ({ ...old, maxGapMs: ms }));
                      clock.pause();
                    }}
                  >
                    {ms} ms
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      {hardware && (
        <div className="slo-context-controls slo-hardware-controls">
          {frame.beat === "execution" && (
            <div
              className="slo-choice"
              role="group"
              aria-label="Inspect kernel fusion"
            >
              <span>Follow the values</span>
              {[
                [31000, "Read input"],
                [36500, "Intermediate memory"],
                [42000, "Compare traffic"],
              ].map(([at, label]) => (
                <button
                  key={at}
                  type="button"
                  onClick={() => clock.seek(Number(at))}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          {frame.beat === "precision" && (
            <div
              className="slo-choice"
              role="group"
              aria-label="Inspect weight precision"
            >
              <span>Select a weight, compare formats</span>
              {([4, 8] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={bits === option}
                  onClick={() =>
                    changeBranch(() => {
                      setBits(option);
                      clock.seek(55500);
                    })
                  }
                >
                  INT{option}
                </button>
              ))}
            </div>
          )}
          {frame.beat === "placement" && (
            <div
              className="slo-choice"
              role="group"
              aria-label="Inspect placement topology"
            >
              <span>What each GPU owns</span>
              {(["replicas", "tensor", "pipeline", "moe"] as const).map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={hardwareState.topology === option}
                    onClick={() =>
                      changeBranch(() => {
                        setTopology(option);
                        clock.seek(
                          option === "tensor"
                            ? 62000
                            : option === "pipeline"
                              ? 69000
                              : 56000,
                        );
                      })
                    }
                  >
                    {option === "replicas"
                      ? "Model replicas"
                      : option === "tensor"
                        ? "Tensor parallel"
                        : option === "pipeline"
                          ? "Pipeline parallel"
                          : "MoE alternative"}
                  </button>
                ),
              )}
            </div>
          )}
          {frame.beat === "lifecycle" && (
            <div
              className="slo-choice"
              role="group"
              aria-label="Inspect cancellation"
            >
              <span>Request D</span>
              <button type="button" onClick={() => clock.seek(82200)}>
                Before cancellation
              </button>
              <button type="button" onClick={() => clock.seek(86000)}>
                After reclamation
              </button>
            </div>
          )}
        </div>
      )}
      <div className="slo-diagram-label">
        Mechanism close-up · scroll horizontally on a narrow screen
      </div>
      <div
        className="slo-mobile-pan"
        role="group"
        aria-label="Navigate the wide mechanism figure"
      >
        <button
          type="button"
          onClick={() => {
            clock.pause();
            diagramScroll.current?.scrollTo({ left: 0, behavior: "instant" });
          }}
        >
          Show mechanism
        </button>
        <button
          type="button"
          onClick={() => {
            clock.pause();
            diagramScroll.current?.scrollTo({
              left: diagramScroll.current.scrollWidth,
              behavior: "instant",
            });
          }}
        >
          Show comparison →
        </button>
      </div>
      <div
        ref={diagramScroll}
        className="slo-diagram-scroll"
        tabIndex={0}
        role="region"
        aria-label="Horizontally scrollable serving system diagram"
      >
        {opening ? (
          <ServingAdmissionScenes
            frame={frame}
            onPause={clock.pause}
            reduced={clock.reduced}
            revision={clock.revision}
          />
        ) : frame.beat === "locality" ? (
          <ServingLocalityScene
            frame={frame}
            reduced={clock.reduced}
            onPause={clock.pause}
            onRoute={(option) =>
              changeBranch(() => {
                setRoute(option);
                clock.seek(frame.storyMs >= 22600 ? 23700 : 21950);
              })
            }
          />
        ) : frame.beat === "verification" ? (
          <ServingVerificationScene
            frame={frame}
            agreement={draftCase}
            reduced={clock.reduced}
          />
        ) : delivery ? (
          <ServingDeliveryScene
            frame={frame}
            targets={deliveryTargets}
            reduced={clock.reduced}
            selected={selectedDelivery}
            onPause={clock.pause}
            onSelect={(id) => {
              clock.pause();
              setDeliverySelection(
                id ? { id, revision: clock.revision } : null,
              );
            }}
          />
        ) : hardware ? (
          <ServingHardwareScenes
            frame={frame}
            bits={bits}
            topology={topology}
            selectedWeight={selectedWeight}
            onWeight={(index) => {
              clock.pause();
              setSelectedWeight(index);
            }}
          />
        ) : null}
      </div>
      <div className="slo-context-controls">
        {frame.beat === "execution" && onOpenOverlap && (
          <button
            type="button"
            className="slo-deep-action"
            onClick={() => {
              clock.pause();
              onOpenOverlap();
            }}
          >
            Compare CPU/GPU scheduling overlap ↗
          </button>
        )}
        {frame.beat === "verification" && (
          <button
            type="button"
            className="slo-deep-action"
            onClick={() => {
              clock.pause();
              onOpenDraft();
            }}
          >
            Follow the draft / verify experiment ↗
          </button>
        )}
        {frame.beat === "locality" && (
          <button
            type="button"
            className="slo-deep-action"
            onClick={() => {
              clock.pause();
              onOpenCache();
            }}
          >
            Compare cache-aware placements ↗
          </button>
        )}
        {frame.beat === "interference" && (
          <button
            type="button"
            className="slo-deep-action"
            onClick={() => {
              clock.pause();
              onOpenContinuity();
            }}
          >
            Open separate four-request continuity replay
          </button>
        )}
      </div>
      <details className="slo-hardware-notes">
        <summary>Inspect assumptions and arithmetic</summary>
        <p>
          A–D retain their request and page identities. Close-ups of fusion,
          precision and placement use separate arithmetic examples, not
          additional measurements of that cohort. The replay clock sets
          presentation pace, not service time. The presentation adds held
          comparisons and slows C’s verification after prefill; the underlying
          request events are unchanged.
        </p>
        <p>
          Admission checks use token-work units per scheduling step and KV-page
          reservations as separate budgets. The admitted chunk contains four of
          B’s seven input units; remaining input is processed in later steps.
          This overview does not specify a measured GPU execution duration.
        </p>
        <p>
          Fusion counts reads and writes for four FP32 values; shared bias
          traffic is excluded. Quantization uses 16 weights, a symmetric signed
          range, ties-to-even rounding and one FP32 scale; packing assumes no
          alignment overhead. Fewer bytes do not establish faster execution or
          preserved task accuracy. Pipeline columns are logical slots of equal
          duration; communication is shown but not timed.
        </p>
        <p>
          Cancellation is observed at a safe iteration boundary, not an
          interruption of a running GPU kernel. Only D-owned pages return to the
          pool. Independent validity, latency and full-horizon resource
          measurements are required to establish goodput.
        </p>
        <p>
          Delivery criteria uses an explicitly separate five-request worked
          example over a fixed 500 ms window. R1–R4 complete, R5 cancels, and R4
          fails the declared independent validity check. The example changes
          only latency thresholds; it does not assign measured latency or
          accuracy to A–D, estimate GPU cost, or establish production goodput.
        </p>
        <button
          type="button"
          onClick={() => {
            const record = {
              schema: "serving-overview-exploration-v2",
              evidence: "illustrative arithmetic, not hardware benchmark",
              presentationMs: clock.time,
              traceMs: clock.traceTime,
              playback: {
                presentationDurationMs: OVERVIEW_PLAYBACK_DURATION_MS,
                traceDurationMs: SERVING_OVERVIEW_DURATION_MS,
                pacing: OVERVIEW_PACING,
              },
              route,
              selected: {
                bits,
                topology: hardwareState.topology,
                selectedWeight,
                draftCase,
                deliveryTargets,
                selectedDelivery,
              },
              frame,
              admission: opening ? servingAdmissionFrame(frame) : null,
              locality: frame.beat === "locality" ? localityFrame(frame) : null,
              verification:
                frame.beat === "verification"
                  ? verificationFrame(frame, draftCase)
                  : null,
              delivery: delivery
                ? {
                    frame: deliveryFrame(frame),
                    example: deliveryStudy(deliveryTargets),
                  }
                : null,
              hardwareFrame: hardwareState,
              fusion: fusionFixture(),
              quantization: quantizationFixture(bits),
              tensor: tensorFixture(),
              pipeline: pipelineFixture(),
            };
            const url = URL.createObjectURL(
              new Blob([JSON.stringify(record, null, 2)], {
                type: "application/json",
              }),
            );
            const link = document.createElement("a");
            link.href = url;
            link.download = "serving-overview-exploration.json";
            link.click();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >
          Download this inspection as JSON
        </button>
      </details>
    </section>
  );
}
