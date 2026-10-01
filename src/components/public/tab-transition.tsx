/**
 * The tab pages used to slide with a React ViewTransition. On a phone that
 * snapshots the whole screen before painting the next tab, and a second tap
 * aborts the transition into the error screen. The wrapper stays so each page
 * can keep its marker without paying that cost.
 */
export function TabTransition({ children }: { children: React.ReactNode }) {
  return children;
}
