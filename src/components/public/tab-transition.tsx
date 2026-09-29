import { ViewTransition } from "react";

const SLIDES = { "tab-next": "tab-next", "tab-prev": "tab-prev", default: "none" };

/**
 * Slides a tab screen in the direction of the bottom-nav move. Must wrap each
 * page, not the layout: layouts persist, so enter/exit never fire there.
 */
export function TabTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter={SLIDES} exit={SLIDES} default="none">
      {children}
    </ViewTransition>
  );
}
