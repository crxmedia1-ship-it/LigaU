import { loadMatchBoard } from "@/app/admin/(panel)/partidos/data";
import { EstadisticasBoard } from "@/app/admin/(panel)/estadisticas/estadisticas-board";

export default async function AdminEstadisticasPage() {
  const data = await loadMatchBoard();
  return <EstadisticasBoard {...data} />;
}
