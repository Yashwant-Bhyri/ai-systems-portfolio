/** GitHub Pages serves the site under /ai-systems-portfolio/; Vercel serves it at the root.
 *  Every in-site link that leaves the current page goes through this, or it lands on another site. */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const withBase = (path: string) => (path.startsWith("/") && !path.startsWith("//") ? `${BASE}${path}` : path);
