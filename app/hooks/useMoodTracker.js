import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export const useMoodTracker = (coupleId, usuarioActual) => {
  const [moodHoy, setMoodHoy] = useState({});
  const [historialMoods, setHistorialMoods] = useState([]);
  const [moodsPorUsuario, setMoodsPorUsuario] = useState({});

  // Cargar moods desde la nueva tabla por usuario
  useEffect(() => {
    if (!coupleId) return;

    const cargarMoodsUsuarios = async () => {
      try {
        // Cargar de la tabla moods_usuario
        const { data: moodsData, error } = await supabase
          .from('moods_usuario')
          .select(`
            *,
            usuario:usuarios(*)
          `)
          .eq('couple_id', coupleId)
          .order('fecha', { ascending: false })
          .limit(50);

        if (error) throw error;

        if (moodsData) {
          // Organizar por usuario
          const porUsuario = {};
          const historialUnificado = [];

          moodsData.forEach(mood => {
            const usuarioId = mood.usuario_id;
            if (!porUsuario[usuarioId]) {
              porUsuario[usuarioId] = [];
            }
            porUsuario[usuarioId].push({
              id: mood.id,
              emoji: mood.emoji,
              nombre: mood.nombre,
              fecha: mood.fecha,
              creado_en: mood.creado_en,
              usuario: mood.usuario
            });

            historialUnificado.push({
              id: mood.id,
              emoji: mood.emoji,
              nombre: mood.nombre,
              fecha: mood.fecha,
              creado_en: mood.creado_en,
              usuarioId: usuarioId,
              usuarioNombre: mood.usuario?.nombre || 'Usuario'
            });
          });

          setMoodsPorUsuario(porUsuario);
          setHistorialMoods(historialUnificado);

          // Calcular mood de hoy por usuario
          const hoy = new Date().toISOString().split("T")[0];
          const moodsHoy = {};
          
          Object.keys(porUsuario).forEach(usuarioId => {
            const moodHoyUsuario = porUsuario[usuarioId].find(m => m.fecha === hoy);
            if (moodHoyUsuario) {
              moodsHoy[usuarioId] = moodHoyUsuario;
            }
          });
          
          setMoodHoy(moodsHoy);
        }
      } catch (error) {
        console.error('Error cargando moods por usuario:', error);
      }
    };

    cargarMoodsUsuarios();
  }, [coupleId]);

  // Registrar mood para usuario específico
  const registrarMood = async (mood) => {
    if (!coupleId || !usuarioActual) {
      console.error('No hay usuario o coupleId para registrar mood');
      return;
    }

    try {
      const hoy = new Date().toISOString().split("T")[0];
      
      // Primero eliminar mood de hoy si ya existe
      const { error: deleteError } = await supabase
        .from('moods_usuario')
        .delete()
        .eq('usuario_id', usuarioActual.id)
        .eq('fecha', hoy);

      if (deleteError) {
        console.error('Error eliminando mood anterior:', deleteError);
      }

      // Insertar nuevo mood
      const { data: nuevoMood, error: insertError } = await supabase
        .from('moods_usuario')
        .insert({
          usuario_id: usuarioActual.id,
          couple_id: coupleId,
          emoji: mood.emoji,
          nombre: mood.nombre,
          fecha: hoy
        })
        .select(`
          *,
          usuario:usuarios(*)
        `)
        .single();

      if (insertError) throw insertError;

      // Actualizar estado local
      const nuevoRegistro = {
        id: nuevoMood.id,
        emoji: nuevoMood.emoji,
        nombre: nuevoMood.nombre,
        fecha: nuevoMood.fecha,
        creado_en: nuevoMood.creado_en,
        usuarioId: usuarioActual.id,
        usuarioNombre: usuarioActual.nombre
      };

      // Actualizar historial
      const historialSinHoy = historialMoods.filter(m => 
        !(m.fecha === hoy && m.usuarioId === usuarioActual.id)
      );
      setHistorialMoods([nuevoRegistro, ...historialSinHoy]);

      // Actualizar mood hoy
      setMoodHoy(prev => ({
        ...prev,
        [usuarioActual.id]: {
          id: nuevoMood.id,
          emoji: nuevoMood.emoji,
          nombre: nuevoMood.nombre,
          fecha: nuevoMood.fecha,
          usuario: usuarioActual
        }
      }));

      return { success: true, mood: nuevoRegistro };
    } catch (error) {
      console.error('Error registrando mood:', error);
      return { success: false, error };
    }
  };

  // Eliminar mood específico
  const eliminarMood = async (moodId, usuarioId) => {
    try {
      const { error } = await supabase
        .from('moods_usuario')
        .delete()
        .eq('id', moodId);

      if (error) throw error;

      // Actualizar estado local
      const nuevoHistorial = historialMoods.filter(m => m.id !== moodId);
      setHistorialMoods(nuevoHistorial);

      // Actualizar mood hoy si corresponde
      const hoy = new Date().toISOString().split("T")[0];
      const moodEliminado = historialMoods.find(m => m.id === moodId);
      
      if (moodEliminado && moodEliminado.fecha === hoy) {
        setMoodHoy(prev => {
          const nuevo = { ...prev };
          delete nuevo[usuarioId];
          return nuevo;
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error eliminando mood:', error);
      return { success: false, error };
    }
  };

  // Cambiar mood de hoy (eliminar)
  const cambiarMoodHoy = async () => {
    if (!usuarioActual) return;

    const hoy = new Date().toISOString().split("T")[0];
    const moodHoyUsuario = moodHoy[usuarioActual.id];

    if (moodHoyUsuario) {
      return await eliminarMood(moodHoyUsuario.id, usuarioActual.id);
    }

    return { success: true };
  };

  // Obtener historial de usuario específico
  const getHistorialUsuario = (usuarioId) => {
    return historialMoods.filter(m => m.usuarioId === usuarioId);
  };

  // Obtener mood de hoy de usuario específico
  const getMoodHoyUsuario = (usuarioId) => {
    return moodHoy[usuarioId] || null;
  };

  return { 
    moodHoy, 
    setMoodHoy, 
    historialMoods, 
    setHistorialMoods, 
    registrarMood, 
    eliminarMood, 
    cambiarMoodHoy,
    getHistorialUsuario,
    getMoodHoyUsuario,
    moodsPorUsuario
  };
};