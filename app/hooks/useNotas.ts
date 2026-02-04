import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Nota } from '../utils/types';

export const useNotas = (coupleId: string | null) => {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loaded, setLoaded] = useState(false); // ✅ Bandera de carga

  // ✅ FUNCIÓN MEJORADA PARA GUARDAR EN SUPABASE
  const guardarEnSupabase = async (nuevasNotas: Nota[]) => {
    if (!coupleId) {
      console.error("❌ No hay coupleId para guardar notas");
      return false;
    }

    // 🛡️ SEGURIDAD: Evitar sobreescribir con datos vacíos si no se ha cargado
    if (!loaded && nuevasNotas.length === 0 && notas.length === 0) {
      console.warn("⚠️ Guardado de notas ignorado: Pendiente de carga");
      return false;
    }

    try {
      console.log("💾 Guardando notas en Supabase...");

      const { data: registro, error: fetchError } = await supabase
        .from('app_state')
        .select('contenido')
        .eq('id', coupleId)
        .maybeSingle();

      if (fetchError) {
        console.error("❌ Error obteniendo datos:", fetchError);
        return false;
      }

      const contenidoPrevio = registro?.contenido || {};

      const { error: updateError } = await supabase
        .from('app_state')
        .update({
          contenido: {
            ...contenidoPrevio,
            notas: nuevasNotas,
          },
        })
        .eq('id', coupleId);

      if (updateError) {
        console.error("❌ Error actualizando notas:", updateError);
        return false;
      }

      console.log("✅ Notas guardadas correctamente");
      return true;
    } catch (err) {
      console.error('❌ Error guardando notas:', err);
      return false;
    }
  };

  // ✅ AGREGAR NOTA
  const agregarNota = async (texto: string, categoria = "💭 General") => {
    if (!coupleId || !texto.trim() || !loaded) {
      console.error("❌ Datos inválidos o hook no cargado para agregar nota");
      return false;
    }

    const nuevaNota: Nota = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      texto: texto.trim(),
      categoria: categoria,
      fecha: new Date().toISOString(),
    };

    const nuevasNotas = [nuevaNota, ...notas];
    const success = await guardarEnSupabase(nuevasNotas);

    if (success) {
      setNotas(nuevasNotas);
      console.log("✅ Nota agregada y guardada");
    }

    return success;
  };

  // ✅ ELIMINAR NOTA
  const eliminarNota = async (id: string) => {
    if (!coupleId || !loaded) return false;

    try {
      const nuevasNotas = notas.filter(n => n.id !== id);
      const success = await guardarEnSupabase(nuevasNotas);

      if (success) {
        setNotas(nuevasNotas);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al eliminar nota:", error);
      return false;
    }
  };

  // ✅ EDITAR NOTA
  const editarNota = async (notaId: string, nuevoTexto: string, nuevaCategoria: string | null = null) => {
    if (!coupleId || !loaded) return false;

    const nuevasNotas = notas.map(n =>
      n.id === notaId
        ? {
          ...n,
          texto: nuevoTexto,
          categoria: nuevaCategoria !== null ? nuevaCategoria : n.categoria
        }
        : n
    );

    const success = await guardarEnSupabase(nuevasNotas);

    if (success) {
      setNotas(nuevasNotas);
    }

    return success;
  };

  return {
    notas,
    loaded,
    setNotas,
    setLoaded,
    agregarNota,
    eliminarNota,
    editarNota,
  };
};