export function SiteCanvas() {
  return (
    <div aria-hidden className="ligau-canvas pointer-events-none fixed inset-0 z-0">
      {/* Subtle crimson corner blush — just enough warmth without dirtying the white canvas */}
      <div className="absolute right-0 -bottom-8 h-56 w-56 rounded-full bg-[#C8102E]/8 blur-3xl" />
      <div className="absolute top-0 left-1/3 h-80 w-80 rounded-full bg-[#C8102E]/5 blur-3xl" />
    </div>
  );
}
