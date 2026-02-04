import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { MoodUsuario, Usuario } from '../utils/types';

export const useMoodTracker = (coupleId: string | null, usuarioActual: Usuario | null) => {
  const [moodHoy, setMoodHoy] = useState<Record<string, any>>({});
  const [historialMoods, setHistorialMoods] = useState<any[]>([]);
  const [moodsPorUsuario, setMoodsPorUsuario] = useState<Record<string, any[]>>({});
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!coupleId) return;

    const cargarMoodsUsuarios = async () => {
      try {
        setLoaded(false);
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
          const porUsuario: Record<string, any[]> = {};
          const historialUnificado: any[] = [];

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

          const hoy = new Date().toISOString().split("T")[0];
          const moodsHoyObj: Record<string, any> = {};

          Object.keys(porUsuario).forEach(usuarioId => {
            const moodHoyUsuario = porUsuario[usuarioId].find(m => m.fecha === hoy);
            if (moodHoyUsuario) {
              moodsHoyObj[usuarioId] = moodHoyUsuario;
            }
          });

          setMoodHoy(moodsHoyObj);
        }
        setLoaded(true);
      } catch (error) {
        console.error('Error cargando moods por usuario:', error);
        setLoaded(true);
      }
    };

    cargarMoodsUsuarios();
  }, [coupleId]);

  const registrarMood = async (mood: { emoji: string; nombre: string }) => {
    if (!coupleId || !usuarioActual || !loaded) {
      console.error('No hay usuario, coupleId o hook no cargado');
      return { success: false };
    }

    try {
      const hoy = new Date().toISOString().split("T")[0];

      const { error: deleteError } = await supabase
        .from('moods_usuario')
        .delete()
        .eq('usuario_id', usuarioActual.id)
        .eq('fecha', hoy);

      if (deleteError) {
        console.error('Error eliminando mood anterior:', deleteError);
      }

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
        .maybeSingle();

      if (insertError) throw insertError;

      const nuevoRegistro = {
        id: (nuevoMood as any).id,
        emoji: (nuevoMood as any).emoji,
        nombre: (nuevoMood as any).nombre,
        fecha: (nuevoMood as any).fecha,
        creado_en: (nuevoMood as any).creado_en,
        usuarioId: usuarioActual.id,
        usuarioNombre: usuarioActual.nombre
      };

      const historialSinHoy = historialMoods.filter(m =>
        !(m.fecha === hoy && m.usuarioId === usuarioActual.id)
      );
      setHistorialMoods([nuevoRegistro, ...historialSinHoy]);

      setMoodHoy(prev => ({
        ...prev,
        [usuarioActual.id]: {
          id: (nuevoMood as any).id,
          emoji: (nuevoMood as any).emoji,
          nombre: (nuevoMood as any).nombre,
          fecha: (nuevoMood as any).fecha,
          usuario: usuarioActual
        }
      }));

      return { success: true, mood: nuevoRegistro };
    } catch (error) {
      console.error('Error registrando mood:', error);
      return { success: false, error };
    }
  };

  const eliminarMood = async (moodId: string, usuarioId: string) => {
    if (!loaded) return { success: false };
    try {
      const { error } = await supabase
        .from('moods_usuario')
        .delete()
        .eq('id', moodId);

      if (error) throw error;

      const nuevoHistorial = historialMoods.filter(m => m.id !== moodId);
      setHistorialMoods(nuevoHistorial);

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

  const cambiarMoodHoy = async () => {
    if (!usuarioActual || !loaded) return;
    const hoy = new Date().toISOString().split("T")[0];
    const moodHoyUsuario = moodHoy[usuarioActual.id];
    if (moodHoyUsuario) {
      return await eliminarMood(moodHoyUsuario.id, usuarioActual.id);
    }
    return { success: true };
  };

  const getHistorialUsuario = (usuarioId: string) => {
    return historialMoods.filter(m => m.usuarioId === usuarioId);
  };

  const getMoodHoyUsuario = (usuarioId: string) => {
    return moodHoy[usuarioId] || null;
  };

  return {
    moodHoy,
    historialMoods,
    loaded,
    setLoaded,
    registrarMood,
    eliminarMood,
    cambiarMoodHoy,
    getHistorialUsuario,
    getMoodHoyUsuario,
    moodsPorUsuario
  };
};