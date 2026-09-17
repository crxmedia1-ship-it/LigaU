import { GENDER_LABELS } from "@/lib/admin/labels";
import type { MatchStatus, TeamGender } from "@/lib/public/types";

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
  if (status === "live") return "EN VIVO";
  if (status === "finished") return "FINAL";
  if (status === "scheduled") return "PRÓXIMO";
  if (status === "postponed") return "APLAZADO";
  return "CANCELADO";
}

export function genderShort(gender: TeamGender) {
  return GENDER_LABELS[gender];
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

export function spotifyEmbed(url: string | null) {
  if (!url || url.includes("/demo")) return null;
  if (url.includes("/embed/")) return url;
  return url.replace("open.spotify.com/", "open.spotify.com/embed/");
}
