/** Site-wide ambient slot. Home paints its own TacticalPitchCanvas at z-0. */
export function SiteCanvas() {
  return <div aria-hidden className="ligau-canvas pointer-events-none fixed inset-0 z-0" />;
}
