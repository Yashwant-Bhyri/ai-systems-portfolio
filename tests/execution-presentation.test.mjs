import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Exercise the real JSX, not a second implementation of the displayed result.
const app = new URL("../app/", import.meta.url).href;
registerHooks({
  resolve(specifier, context, next) {
    if (context.parentURL?.startsWith(app) && specifier.startsWith(".") && !/\.(tsx?|css)$/.test(specifier)) {
      for (const extension of [".ts", ".tsx"]) {
        const url = new URL(specifier + extension, context.parentURL);
        if (existsSync(url)) return next(url.href, context);
      }
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith(app) && url.endsWith(".css")) return { format: "module", source: "export default {};", shortCircuit: true };
    if (url.startsWith(app) && url.endsWith(".tsx")) return {
      format: "module", shortCircuit: true,
      source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext },
      }).outputText,
    };
    return next(url, context);
  },
});
const { simulateLab } = await import("../app/compute/lab-simulation.ts");
const { executionDemand, budgetCapacity, burstAt } = await import("../app/compute/execution-study-math.ts");
const { ComputeAllowance, AllowancePayoff, DemandRouting, DemandPayoff, ExecutionCost, ExecutionCostPayoff } = await import("../app/compute/execution-scale.tsx");
const render = (component, props) => renderToStaticMarkup(createElement(component, props));
const before = simulateLab(2, 2, false, "shared-prefix", { reuse: true, fastKernels: false });
const after = simulateLab(2, 2, true, "shared-prefix");
const demand = executionDemand(before, after);

test("fixed-compute picture and card expose the same three comparison anchors", () => {
  const allowance = 3000;
  const result = budgetCapacity(demand, allowance);
  const figure = render(ComputeAllowance, { demand, allowance });
  for (const focus of ["baseline", "optimized", "difference"]) {
    const card = render(AllowancePayoff, { demand, allowance, focus });
    assert.match(figure, new RegExp(`data-result-source="${focus}"`));
    assert.match(card, new RegExp(`data-result-target="${focus}"`));
    assert.match(card, /Faster prefill \+ decode execution/);
    assert.match(card, /cache reuse held fixed/);
  }
  assert.match(figure, new RegExp(`${result.optimized.completed} requests completed`));
  assert.match(render(AllowancePayoff, { demand, allowance, focus: "difference" }), new RegExp(`\\+${result.extra} requests`));
});

test("equal execution and zero allowance never claim extra capacity", () => {
  const equal = executionDemand(before, before);
  for (const allowance of [0, 100, 3000]) {
    const figure = render(ComputeAllowance, { demand: equal, allowance });
    const card = render(AllowancePayoff, { demand: equal, allowance, focus: "difference" });
    assert.doesNotMatch(figure, /data-result-source="difference"/);
    assert.match(card, /Same number completed at this allowance/);
    assert.doesNotMatch(card, /NaN|Infinity|% more/);
  }
});

test("burst links come from completed request events, then switch to queue-clearance time", () => {
  const time = demand.optimized.finish;
  const baseline = burstAt(demand.reference, time).completed;
  const figure = render(DemandRouting, { demand, time });
  const card = render(DemandPayoff, { demand, time, focus: "difference" });
  assert.match(card, new RegExp(`\\+${1000 - baseline} requests`));
  assert.match(figure, /data-result-source="difference"/);
  const end = render(DemandPayoff, { demand, time: demand.reference.finish, focus: "difference" });
  assert.match(end, /Time to finish all 1,000 requests/);
  assert.match(end, /s sooner/);
  assert.match(end, /to clear all 1,000 requests/);
  assert.doesNotMatch(end, /\+\d+ requests/);
  const empty = render(DemandPayoff, { demand, time: 0, focus: "difference" });
  assert.match(empty, /Same number completed at this clock/);
  assert.doesNotMatch(empty, /NaN|Infinity|% more/);
});

test("cost comparison connects exact values and does not invent a saving in an equal-run fixture", () => {
  const figure = render(ExecutionCost, { before, after, focus: "difference" });
  for (const focus of ["baseline", "optimized", "difference"]) {
    const card = render(ExecutionCostPayoff, { before, after, focus });
    assert.match(figure, new RegExp(`data-result-source="${focus}"`));
    assert.match(card, new RegExp(`data-result-target="${focus}"`));
    assert.match(card, /Cache reuse and output quality held fixed/);
  }
  const equal = render(ExecutionCostPayoff, { before, after: before, focus: "difference" });
  assert.match(equal, /Same GPU cost per correct answer/);
  assert.doesNotMatch(equal, /% less|NaN|Infinity/);
});
