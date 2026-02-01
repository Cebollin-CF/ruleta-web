import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export const useMoodTracker = (coupleId, initialMoodHoy = {}, initialHistorial = []) => {
  const [moodHoy, setMoodHoy] = useState(initialMoodHoy || {});
  const [historialMoods, setHistorialMoods] = useState(initialHistorial || []);

  // 1. SINCRONIZACIÓN OBLIGATORIA
  // Esto asegura que el hook tenga datos reales en cuanto lleguen de Supabase
  useEffect(() => {
    if (initialHistorial) setHistorialMoods(initialHistorial);
    if (initialMoodHoy) setMoodHoy(initialMoodHoy);
  }, [initialHistorial, initialMoodHoy]);

  // 2. BORRADO INFALIBLE (Por fecha, no por índice)
  // Línea ~22, reemplaza la función eliminarMood:
  const eliminarMood = async (fecha, index) => {
    try {
      console.log("Eliminando mood con fecha:", fecha);
      
      // MODIFICACIÓN: Filtrar por fecha EXACTA
      const nuevoHistorial = (historialMoods || []).filter(m => {
        // Comparar solo la parte de fecha (YYYY-MM-DD)
        const moodFecha = m.fecha.split("T")[0];
        const fechaTarget = fecha.split("T")[0];
        return moodFecha !== fechaTarget;
      });
      
      const hoy = new Date().toISOString().split("T")[0];
      const esHoy = fecha && fecha.startsWith(hoy);

      // Actualizamos la pantalla INMEDIATAMENTE
      setHistorialMoods(nuevoHistorial);
      if (esHoy) setMoodHoy({});

      // Guardamos en Supabase
      if (coupleId) {
        const { data: registro } = await supabase
          .from('app_state')
          .select('contenido')
          .eq('id', coupleId)
          .single();

        const contenidoPrevio = registro?.contenido || {};

        await supabase
          .from('app_state')
          .update({
            contenido: {
              ...contenidoPrevio,
              historialMoods: nuevoHistorial,
              moodHoy: esHoy ? {} : (contenidoPrevio.moodHoy || {})
            }
          })
          .eq('id', coupleId);
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const registrarMood = async (mood) => {
    try {
      const hoy = new Date().toISOString().split("T")[0];
      const nuevoRegistro = { ...mood, fecha: new Date().toISOString() };
      
      // Filtramos para asegurar que no hay duplicados de hoy
      const historialFiltrado = (historialMoods || []).filter(m => !m.fecha.startsWith(hoy));
      const nuevoHistorial = [nuevoRegistro, ...historialFiltrado];

      setMoodHoy({ [hoy]: nuevoRegistro });
      setHistorialMoods(nuevoHistorial);

      if (coupleId) {
        const { data: registro } = await supabase.from('app_state').select('contenido').eq('id', coupleId).single();
        const contenidoPrevio = registro?.contenido || {};
        
        await supabase.from('app_state').update({
          contenido: { 
            ...contenidoPrevio, 
            moodHoy: { [hoy]: nuevoRegistro }, 
            historialMoods: nuevoHistorial 
          }
        }).eq('id', coupleId);
      }
    } catch (error) { console.error(error); }
  };

  const cambiarMoodHoy = () => {
    const hoy = new Date().toISOString().split("T")[0];
    const itemHoy = (historialMoods || []).find(m => m.fecha.startsWith(hoy));
    
    if (itemHoy) {
      eliminarMood(itemHoy.fecha); // Usamos la fecha directamente
    } else {
      setMoodHoy({});
    }
  };

  return { 
    moodHoy, 
    setMoodHoy, 
    historialMoods, 
    setHistorialMoods, 
    registrarMood, 
    eliminarMood, 
    cambiarMoodHoy 
  };
};