/** Resolve dense scatterplot targets geometrically, independent of SVG paint order. */
export function nearestPlotPoint<T>(
  x: number,
  y: number,
  targets: readonly { x: number; y: number; value: T }[],
  radius = 28,
): T | undefined {
  let distance = radius * radius;
  let selected: T | undefined;
  for (const target of targets) {
    const d = (x - target.x) ** 2 + (y - target.y) ** 2;
    if (d < distance) {
      distance = d;
      selected = target.value;
    }
  }
  return selected;
}
