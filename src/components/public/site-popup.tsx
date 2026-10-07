"use client";

import { useEffect, useState } from "react";
import { XIcon } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cloudinaryImage } from "@/lib/public/media";
import type { SitePopup } from "@/lib/public/site-popup";

const OPEN_DELAY_MS = 700;

/** Opening pop-up from the admin. Once closed it stays closed until the admin edits it. */
export function SitePopupModal({ popup }: { popup: SitePopup }) {
  const [open, setOpen] = useState(false);
  const key = `ligau-popup:${popup.id}:${popup.version}`;

  useEffect(() => {
    if (localStorage.getItem(key)) return;
    const timer = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [key]);

  const close = (next: boolean) => {
    setOpen(next);
    if (!next) localStorage.setItem(key, "1");
  };

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cloudinaryImage(popup.imageUrl, 1080) ?? popup.imageUrl}
      alt={popup.title ?? "Anuncio de Liga U"}
      className="block max-h-[78dvh] w-full rounded-[1.6rem] object-contain"
    />
  );
  const external = popup.linkUrl ? /^https?:\/\//i.test(popup.linkUrl) : false;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-zinc-950/60 supports-backdrop-filter:backdrop-blur-sm"
        className="w-auto max-w-[min(92vw,30rem)] gap-0 bg-transparent p-0 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] ring-0 sm:max-w-[30rem]"
      >
        <DialogTitle className="sr-only">{popup.title ?? "Anuncio de Liga U"}</DialogTitle>
        {popup.linkUrl ? (
          <a
            href={popup.linkUrl}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            onClick={() => close(false)}
          >
            {image}
          </a>
        ) : (
          image
        )}
        <DialogClose
          aria-label="Cerrar"
          className="absolute -top-3 -right-3 grid size-10 place-items-center rounded-full bg-white text-zinc-900 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.6)] ring-1 ring-zinc-200 active:scale-95"
        >
          <XIcon className="size-5" strokeWidth={2.5} />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
