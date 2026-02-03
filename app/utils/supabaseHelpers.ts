import { supabase } from "../../supabaseClient";

/* ---------------------------------------------------
   GUARDAR NUEVO PLAN
--------------------------------------------------- */
export async function guardarNuevoPlan(plan, coupleId) {
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
export async function guardarPlanesPorDia(fecha, planesDelDia, coupleId) {
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

export async function guardarNotas(notas, coupleId) {
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
