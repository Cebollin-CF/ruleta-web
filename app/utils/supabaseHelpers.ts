import { supabase } from "../../supabaseClient";
import { Plan } from "./types";

/* ---------------------------------------------------
   GUARDAR NUEVO PLAN
--------------------------------------------------- */
export async function guardarNuevoPlan(plan: Plan, coupleId: string) {
  const { data } = await supabase
    .from("app_state")
    .select("contenido")
    .eq("id", coupleId)
    .single();

  const contenidoActual = data?.contenido || {
    planes: [],
    planesPorDia: {},
    notas: [],
  };

  const nuevosPlanes = [...contenidoActual.planes, plan];

  await supabase
    .from("app_state")
    .update({
      contenido: {
        ...contenidoActual,
        planes: nuevosPlanes,
      },
    })
    .eq("id", coupleId);
}

/* ---------------------------------------------------
   GUARDAR PLANES POR DÍA
--------------------------------------------------- */
export async function guardarPlanesPorDia(fecha: string, planesDelDia: Plan[], coupleId: string) {
  const { data } = await supabase
    .from("app_state")
    .select("contenido")
    .eq("id", coupleId)
    .single();

  const contenidoActual = data?.contenido || {
    planes: [],
    planesPorDia: {},
    notas: [],
  };

  const nuevosPlanesPorDia = {
    ...contenidoActual.planesPorDia,
    [fecha]: planesDelDia,
  };

  await supabase
    .from("app_state")
    .update({
      contenido: {
        ...contenidoActual,
        planesPorDia: nuevosPlanesPorDia,
      },
    })
    .eq("id", coupleId);
}


/* Guardar notas */

export async function guardarNotas(notas: string[], coupleId: string) {
  const { data } = await supabase
    .from("app_state")
    .select("contenido")
    .eq("id", coupleId)
    .single();

  const contenidoActual = data?.contenido || {
    planes: [],
    planesPorDia: {},
    notas: [],
  };

  await supabase
    .from("app_state")
    .update({
      contenido: {
        ...contenidoActual,
        notas: notas,
      },
    })
    .eq("id", coupleId);
}
