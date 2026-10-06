import type { MatchStatus } from "@/lib/public/types";

export function formatMatchDate(iso: string) {
  return new Date(iso).toLocaleString("es-VE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatScore(home: number | null, away: number | null, status: MatchStatus) {
  if (status === "scheduled" || home === null || away === null) {
    return "vs";
  }
  return `${home} - ${away}`;
}

export function statusLabel(status: MatchStatus) {
  if (status === "finished") return "FINAL";
  if (status === "scheduled" || status === "live") return "PRÓXIMO";
  if (status === "postponed") return "APLAZADO";
  return "CANCELADO";
}

export function eventLabel(type: string) {
  if (type === "goal") return "Gol";
  if (type === "yellow_card") return "Amarilla";
  if (type === "red_card") return "Roja";
  if (type === "points") return "Puntos";
  return type;
}

function youtubeId(url: string | null) {
  if (!url) return null;
  const id =
    url.match(/[?&]v=([\w-]+)/)?.[1] ??
    url.match(/youtu\.be\/([\w-]+)/)?.[1] ??
    url.match(/youtube\.com\/(?:shorts|embed|live)\/([\w-]+)/)?.[1];
  return id && id !== "demo" ? id : null;
}

export function youtubeEmbed(url: string | null) {
  const id = youtubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function youtubeThumb(url: string | null) {
  const id = youtubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}
