import { cn } from "@/lib/utils";

export function YoutubeLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 20" aria-hidden className={cn("h-5 w-auto", className)}>
      <path
        fill="#FF0000"
        d="M27.4 3.1A3.5 3.5 0 0 0 25 .6C22.8 0 14 0 14 0S5.2 0 3 .6A3.5 3.5 0 0 0 .6 3.1C0 5.3 0 10 0 10s0 4.7.6 6.9A3.5 3.5 0 0 0 3 19.4c2.2.6 11 .6 11 .6s8.8 0 11-.6a3.5 3.5 0 0 0 2.4-2.5c.6-2.2.6-6.9.6-6.9s0-4.7-.6-6.9Z"
      />
      <path fill="#fff" d="m11.2 14.3 7.3-4.3-7.3-4.3v8.6Z" />
    </svg>
  );
}

export function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" className={cn("size-5", className)}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TiktokGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" className={cn("size-5", className)}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

export function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" className={cn("size-5", className)}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function SpotifyLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-5", className)}>
      <circle cx="12" cy="12" r="12" fill="#1DB954" />
      <path
        fill="none"
        stroke="#000"
        strokeLinecap="round"
        strokeWidth="1.9"
        d="M6.3 9.2c3.8-1.1 8.2-.8 11.5 1.1M7 12.6c3.1-.9 6.6-.6 9.3 1M7.7 15.8c2.5-.7 5.1-.5 7.2.8"
      />
    </svg>
  );
}
