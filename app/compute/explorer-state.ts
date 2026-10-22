import type { CompositionLens } from "./composition-comparison";
import type { RequestMeasure } from "./request-comparison";
import type { Workload } from "./lab-simulation";

export type RequestViewState = { time: number; taskId: number; mechanism: "both" | "reuse" | "rates"; metric: RequestMeasure };
export type LoadViewState = { time: number; percentile: number; selected: number | null };
export type CompositionViewState = { lens: CompositionLens; metric: "cost" | "accuracy"; phase: number };
export type DirectedView<T> = { time: number; pause: () => void; inspect: (state: T) => void };
export type InferenceFigureContext = { workload: Workload; budget: number; policy: 0 | 2 };
export type InferenceFigureSelection =
  | { view: 0; selected: number; state: CompositionViewState }
  | { view: 1; state: RequestViewState }
  | { view: 2; state: LoadViewState };
export type InferenceFigureHandoff = InferenceFigureContext & { time: number; selection: InferenceFigureSelection };
