import type { Metadata } from "next";
import { StudioBoard } from "@/app/admin/studio/studio-board";
import { getPublicCatalog } from "@/lib/public/queries";

export const metadata: Metadata = {
  title: "Live Studio",
};

export default async function AdminStudioPage() {
  const catalog = await getPublicCatalog({ staff: true });

  return (
    <div className="mx-auto w-full max-w-7xl">
      <StudioBoard
        athletes={catalog.athletes}
        teams={catalog.teams}
        sports={catalog.sports}
        matches={catalog.matches}
        sponsors={catalog.sponsors}
        benefits={catalog.benefits}
      />
    </div>
  );
}
