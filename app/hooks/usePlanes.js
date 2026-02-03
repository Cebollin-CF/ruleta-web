import { useState } from 'react';
import { supabase } from '../../supabaseClient';

export const usePlanes = (coupleId, initialPlanes = [], initialPlanesPorDia = {}) => {
  const [planes, setPlanes] = useState(initialPlanes);
  const [planesPorDia, setPlanesPorDia] = useState(initialPlanesPorDia);
  const [planActual, setPlanActual] = useState(null);
  const [intentosRuleta, setIntentosRuleta] = useState(0);

  // ✅ FUNCIÓN MEJORADA PARA GUARDAR EN SUPABASE
  // ✅ FUNCIÓN MEJORADA PARA GUARDAR PLANES
  const guardarEnSupabase = async (nuevosPlanes = null, nuevosPlanesPorDia = null) => {
    if (!coupleId) {
      console.error("❌ No hay coupleId para guardar planes");
      return false;
    }

    try {
      // Primero obtener el contenido actual COMPLETO
      const { data: registro, error: fetchError } = await supabase
        .from('app_state')
        .select('contenido')
        .eq('id', coupleId)
        .single();

      if (fetchError) {
        console.error("❌ Error obteniendo datos:", fetchError);
        return false;
      }

      const contenidoPrevio = registro?.contenido || {};

      // Preparar datos para actualizar
      const datosActualizados = {
        ...contenidoPrevio,
      };

      if (nuevosPlanes !== null) {
        datosActualizados.planes = nuevosPlanes;
      }

      if (nuevosPlanesPorDia !== null) {
        datosActualizados.planesPorDia = nuevosPlanesPorDia;
      }

      // Actualizar en Supabase
      const { error: updateError } = await supabase
        .from('app_state')
        .update({
          contenido: datosActualizados
        })
        .eq('id', coupleId);

      if (updateError) {
        console.error("❌ Error actualizando planes:", updateError);
        return false;
      }

      console.log("✅ Planes guardados correctamente");
      return true;
    } catch (err) {
      console.error('❌ Error guardando planes:', err);
      return false;
    }
  };
  // Guardar planes por día
  const guardarPlanesPorDia = async (fecha, nuevaLista) => {
    if (!coupleId) return false;

    const nuevosPlanesPorDia = { ...planesPorDia };
    
    if (!nuevaLista || nuevaLista.length === 0) {
      delete nuevosPlanesPorDia[fecha];
    } else {
      nuevosPlanesPorDia[fecha] = nuevaLista;
    }

    // Actualizar estado local PRIMERO
    setPlanesPorDia(nuevosPlanesPorDia);

    // Luego persistir en Supabase
    return await guardarEnSupabase(planes, nuevosPlanesPorDia);
  };

  // Agregar nuevo plan
  const agregarPlan = async (nuevoPlan) => {
    if (!coupleId) return false;

    const nuevosPlanes = [nuevoPlan, ...planes];
    
    // Actualizar estado local PRIMERO
    setPlanes(nuevosPlanes);

    // Luego guardar en Supabase
    return await guardarEnSupabase(nuevosPlanes, planesPorDia);
  };

  // Eliminar plan
  const eliminarPlan = async (planId) => {
    const nuevosPlanes = planes.filter(p => p.id !== planId);
    
    // Actualizar estado local PRIMERO
    setPlanes(nuevosPlanes);

    // Luego guardar en Supabase
    return await guardarEnSupabase(nuevosPlanes, planesPorDia);
  };

  // ✅ FUNCIÓN PARA VERIFICAR SI UN PLAN TIENE FECHA
  const planTieneFecha = (planId) => {
    return Object.values(planesPorDia).some((lista) =>
      lista.some((p) => p.planId === planId && !p.completado)
    );
  };

  // ✅ GIRAR RULETA - EXCLUYE PLANES CON FECHA
  const girarRuleta = () => {
    // Filtrar planes que NO estén completados Y que NO tengan fecha asignada
    const planesDisponibles = planes.filter(p => {
      if (p.completado) return false;
      if (planTieneFecha(p.id)) return false; // ✅ Excluir planes con fecha
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
    // Estados
    planes,
    planesPorDia,
    planActual,
    intentosRuleta,
    
    // Setters
    setPlanes,
    setPlanesPorDia,
    setPlanActual,
    setIntentosRuleta,
    
    // Funciones
    guardarPlanesPorDia,
    agregarPlan,
    eliminarPlan,
    girarRuleta,
    guardarEnSupabase,
    planTieneFecha, // ✅ Exportar para usar en otros componentes
  };
};