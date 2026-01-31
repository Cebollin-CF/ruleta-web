import { useState } from 'react';
import { supabase } from '../../supabaseClient';

export const usePlanes = (coupleId, initialPlanes = [], initialPlanesPorDia = {}) => {
  const [planes, setPlanes] = useState(initialPlanes);
  const [planesPorDia, setPlanesPorDia] = useState(initialPlanesPorDia);
  const [planActual, setPlanActual] = useState(null);
  const [intentosRuleta, setIntentosRuleta] = useState(0);

  // Guardar planes en Supabase
  const guardarPlanesEnSupabase = async (nuevosPlanes, nuevosPlanesPorDia) => {
    if (!coupleId) return false;

    try {
      await supabase
        .from('app_state')
        .update({
          contenido: {
            planes: nuevosPlanes || planes,
            planesPorDia: nuevosPlanesPorDia || planesPorDia,
          },
        })
        .eq('id', coupleId);
      return true;
    } catch (err) {
      console.error('Error guardando planes:', err);
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

    // Actualizar estado local
    setPlanesPorDia(nuevosPlanesPorDia);

    // Persistir en Supabase
    try {
      await supabase
        .from('app_state')
        .update({
          contenido: {
            planes,
            planesPorDia: nuevosPlanesPorDia,
          },
        })
        .eq('id', coupleId);
      return true;
    } catch (err) {
      console.error('Error guardando planesPorDia:', err);
      return false;
    }
  };

  // Agregar nuevo plan
  const agregarPlan = async (nuevoPlan) => {
    if (!coupleId) return false;

    const nuevosPlanes = [nuevoPlan, ...planes];
    setPlanes(nuevosPlanes);

    try {
      await supabase
        .from('app_state')
        .update({
          contenido: {
            planes: nuevosPlanes,
            planesPorDia,
          },
        })
        .eq('id', coupleId);
      return true;
    } catch (err) {
      console.error('Error agregando plan:', err);
      return false;
    }
  };

  // Eliminar plan
  const eliminarPlan = async (planId) => {
    const nuevosPlanes = planes.filter(p => p.id !== planId);
    setPlanes(nuevosPlanes);

    return await guardarPlanesEnSupabase(nuevosPlanes, planesPorDia);
  };

  // Girar ruleta
  const girarRuleta = () => {
    const planesDisponibles = planes.filter(p => !p.completado);
    
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
    guardarPlanesEnSupabase,
  };
};
