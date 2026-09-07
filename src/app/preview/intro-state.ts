/**
 * Whether the guided intro has already played this visit.
 *
 * Module scope, deliberately: it survives the doc↔chat view toggle (which
 * unmounts and remounts the whole genome surface) but resets on a real page
 * load. So the reveal plays once when someone arrives, and returning from the
 * chat via "← Your genome" shows the finished document instead of replaying it.
 *
 * Not React state — nothing needs to re-render when it flips, and keeping it
 * out of state avoids an SSR/client hydration mismatch (both start `false`).
 */
export const intro = { played: false };
