import { supabase } from "../../supabaseClient";

export async function guardarNuevoPlan(plan, coupleId) {
  const { data } = await supabase
    .from("app_state")
    .select("contenido")
    .eq("id", coupleId)
    .single();

  const contenidoActual = data?.contenido || { planes: [], planesPorDia: {}, notas: [] };

  const nuevosPlanes = [...contenidoActual.planes, plan];

  await supabase
    .from("app_state")
    .update({ contenido: { ...contenidoActual, planes: nuevosPlanes } })
    .eq("id", coupleId);
}
