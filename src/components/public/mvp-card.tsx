import Link from "next/link";
import { MvpPreview } from "@/components/studio/previews";
import { MysteryCard3D } from "@/components/public/mystery-card";
import { cn } from "@/lib/utils";
import type { MvpHighlight } from "@/lib/public/types";

export function MvpCard({
  mvp,
  className,
}: {
  mvp: MvpHighlight | null;
  className?: string;
}) {
  if (!mvp) {
    return (
      <div className={cn("h-full md:h-[360px]", className)}>
        <MysteryCard3D />
      </div>
    );
  }

  return (
    <Link href={`/atletas/${mvp.athlete.id}`} className={cn("block h-full md:h-[360px]", className)}>
      <MvpPreview
        data={{
          name: mvp.athlete.fullName,
          teamLabel: mvp.team.label,
          sportName: mvp.sportName,
          photoUrl: mvp.athlete.photoUrl,
          accent: mvp.team.university.colors.primary,
          goals: mvp.goals,
          points: mvp.points,
          mvpAwards: mvp.mvpAwards,
          jerseyNumber: mvp.athlete.jerseyNumber,
        }}
      />
    </Link>
  );
}
