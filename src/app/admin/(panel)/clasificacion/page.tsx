import { loadMatchBoard } from "@/app/admin/(panel)/partidos/data";
import { ClasificacionBoard } from "@/app/admin/(panel)/clasificacion/clasificacion-board";

export default async function AdminClasificacionPage() {
  const data = await loadMatchBoard();
  return <ClasificacionBoard {...data} />;
}
