import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Plan, PlanesPorDia, DatedPlan } from '../utils/types';

export const usePlanes = (coupleId: string | null, initialPlanes: Plan[] = [], initialPlanesPorDia: PlanesPorDia = {}) => {
  const [planes, setPlanes] = useState<Plan[]>(initialPlanes);
  const [planesPorDia, setPlanesPorDia] = useState<PlanesPorDia>(initialPlanesPorDia);
  const [planActual, setPlanActual] = useState<Plan | null>(null);
  const [intentosRuleta, setIntentosRuleta] = useState(0);
  const [loaded, setLoaded] = useState(false); // ✅ Nueva bandera de carga

  // ✅ FUNCIÓN MEJORADA PARA GUARDAR EN SUPABASE
  const guardarEnSupabase = async (nuevosPlanes: Plan[] | null = null, nuevosPlanesPorDia: PlanesPorDia | null = null) => {
    if (!coupleId) return false;
    // 🛡️ SEGURIDAD EXTRA: Si intentamos guardar [] y no estamos marcados como cargados, abortar.
    if (!loaded && nuevosPlanes !== null && nuevosPlanes.length === 0 && planes.length === 0) {
      console.warn("⚠️ Intento de guardado ignorado: Los datos aún no se han cargado.");
      return false;
    }

    try {
      const { data: registro, error: fetchError } = await supabase
        .from('app_state')
        .select('contenido')
        .eq('id', coupleId)
        .maybeSingle();

      if (fetchError) {
        console.error("❌ Error obteniendo datos de Supabase:", fetchError);
        return false;
      }

      const contenidoPrevio = registro?.contenido || {};

      const datosActualizados = {
        ...contenidoPrevio,
        ...(nuevosPlanes !== null ? { planes: nuevosPlanes } : {}),
        ...(nuevosPlanesPorDia !== null ? { planesPorDia: nuevosPlanesPorDia } : {})
      };

      const { error: updateError } = await supabase
        .from('app_state')
        .update({ contenido: datosActualizados })
        .eq('id', coupleId);

      if (updateError) {
        console.error("❌ Error actualizando en Supabase:", updateError);
        return false;
      }

      console.log("✅ Datos persistidos correctamente");
      return true;
    } catch (err) {
      console.error('❌ Excepción en guardarEnSupabase:', err);
      return false;
    }
  };

  // Guardar planes por día
  const guardarPlanesPorDia = async (fecha: string, nuevaLista: DatedPlan[]) => {
    if (!coupleId || !loaded) return false;

    const nuevosPlanesPorDia = { ...planesPorDia };

    if (!nuevaLista || nuevaLista.length === 0) {
      delete nuevosPlanesPorDia[fecha];
    } else {
      nuevosPlanesPorDia[fecha] = nuevaLista;
    }

    setPlanesPorDia(nuevosPlanesPorDia);
    return await guardarEnSupabase(planes, nuevosPlanesPorDia);
  };

  // Agregar nuevo plan
  const agregarPlan = async (nuevoPlan: Plan) => {
    if (!coupleId || !loaded) {
      console.error("❌ No se puede agregar plan: Hook no cargado o sin coupleId");
      return false;
    }

    const nuevosPlanes = [nuevoPlan, ...(planes || [])];
    const success = await guardarEnSupabase(nuevosPlanes, planesPorDia);

    if (success) {
      setPlanes(nuevosPlanes);
      console.log("✅ Plan agregado y persistido");
      return true;
    }
    return false;
  };

  // Editar plan
  const editarPlan = async (planId: string, datosNuevos: Partial<Plan>) => {
    if (!coupleId || !loaded) return false;

    const nuevosPlanes = planes.map(p =>
      p.id === planId ? { ...p, ...datosNuevos } : p
    );

    const success = await guardarEnSupabase(nuevosPlanes, planesPorDia);
    if (success) {
      setPlanes(nuevosPlanes);
      console.log("✅ Plan editado y persistido");
      return true;
    }
    return false;
  };

  // Marcar como completado
  const marcarComoCompletado = async (planId: string) => {
    if (!coupleId || !loaded) return false;

    const nuevosPlanes = planes.map(p =>
      p.id === planId ? { ...p, completado: true } : p
    );

    const success = await guardarEnSupabase(nuevosPlanes, planesPorDia);
    if (success) {
      setPlanes(nuevosPlanes);
      console.log("✅ Plan marcado como completado y persistido");
      return true;
    }
    return false;
  };

  // Eliminar plan
  const eliminarPlan = async (planId: string) => {
    if (!coupleId || !loaded) return false;

    const nuevosPlanes = planes.filter(p => p.id !== planId);
    const success = await guardarEnSupabase(nuevosPlanes, planesPorDia);

    if (success) {
      setPlanes(nuevosPlanes);
      console.log("✅ Plan eliminado y persistido");
      return true;
    }
    return false;
  };

  // ✅ FUNCIÓN PARA VERIFICAR SI UN PLAN TIENE FECHA
  const planTieneFecha = (planId: string) => {
    return Object.values(planesPorDia).some((lista) =>
      lista.some((p) => (p.planId === planId) && !p.completado)
    );
  };

  // ✅ GIRAR RULETA - EXCLUYE PLANES CON FECHA
  const girarRuleta = () => {
    const planesDisponibles = planes.filter(p => {
      if (p.completado) return false;
      if (planTieneFecha(p.id)) return false;
      return true;
    });

    if (planesDisponibles.length === 0) {
      return null;
    }

    const random = planesDisponibles[Math.floor(Math.random() * planesDisponibles.length)];
    setPlanActual(random);
    setIntentosRuleta(prev => prev + 1);

    return random;
  };

  return {
    planes,
    planesPorDia,
    planActual,
    intentosRuleta,
    loaded,

    setPlanes,
    setPlanesPorDia,
    setPlanActual,
    setIntentosRuleta,
    setLoaded,

    guardarPlanesPorDia,
    agregarPlan,
    editarPlan,
    marcarComoCompletado,
    eliminarPlan,
    girarRuleta,
    guardarEnSupabase,
    planTieneFecha,
  };
};