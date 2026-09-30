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

export function youtubeEmbed(url: string | null) {
  if (!url) return null;
  const watch = url.match(/[?&]v=([\w-]+)/);
  const short = url.match(/youtu\.be\/([\w-]+)/);
  const id = watch?.[1] ?? short?.[1];
  if (!id || id === "demo") return null;
  return `https://www.youtube.com/embed/${id}`;
}
