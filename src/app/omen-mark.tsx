/**
 * The Omen logo — the "Augur" bird from the logo exploration board: two
 * banking wing arcs chasing an ember star. Omens were read from the flight
 * of birds. Stroke inherits currentColor so the same mark works ink-on-paper
 * (headers) and paper-on-espresso (footer, capsule); the ember dot stays
 * ember everywhere.
 *
 * viewBox is cropped tight to the artwork so sizing by height alone gives
 * the mark its designed 2:1 footprint.
 */
export function OmenMark({ className }: { className?: string }) {
  return (
    <svg aria-label="Omen" className={className} fill="none" role="img" viewBox="12 8 118 60">
      <path
        d="M 16 64 Q 42 16 70 46 Q 98 14 124 38"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="7"
      />
      <circle cx="124" cy="14" fill="var(--ember)" r="6" />
    </svg>
  );
}
