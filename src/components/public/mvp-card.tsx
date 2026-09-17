import Link from "next/link";
import { MvpPreview } from "@/components/studio/previews";
import { MysteryCard3D } from "@/components/public/mystery-card";
import type { MvpHighlight } from "@/lib/public/types";

export function MvpCard({ mvp }: { mvp: MvpHighlight | null }) {
  if (!mvp) {
    return <MysteryCard3D />;
  }

  return (
    <Link href={`/atletas/${mvp.athlete.id}`} className="block">
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
