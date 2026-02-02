import { useState } from 'react';
import { supabase } from '../../supabaseClient';

export const useNotas = (coupleId, initialNotas = []) => {
  const [notas, setNotas] = useState(initialNotas);

  // ✅ FUNCIÓN MEJORADA PARA GUARDAR EN SUPABASE
  const guardarEnSupabase = async (nuevasNotas) => {
    if (!coupleId) {
      console.error("❌ No hay coupleId para guardar notas");
      return false;
    }

    try {
      console.log("💾 Guardando notas en Supabase...");
      
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
  const agregarNota = async (texto, categoria = "💭 General") => {
    if (!coupleId || !texto.trim()) {
      console.error("❌ Datos inválidos para agregar nota");
      return false;
    }

    const nuevaNota = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      texto: texto.trim(),
      categoria: categoria,
      fecha: new Date().toISOString(),
    };

    const nuevasNotas = [nuevaNota, ...notas];
    
    setNotas(nuevasNotas);

    const success = await guardarEnSupabase(nuevasNotas);
    
    if (success) {
      console.log("✅ Nota agregada y guardada");
    } else {
      console.error("❌ Nota no se pudo guardar en Supabase");
      setNotas(notas);
    }
    
    return success;
  };

  // ✅ ELIMINAR NOTA
  const eliminarNota = async (notaId) => {
    if (!coupleId) {
      console.error("❌ No hay coupleId para eliminar nota");
      return false;
    }

    try {
      const nuevasNotas = notas.filter(n => n.id !== notaId);
      
      setNotas(nuevasNotas);

      const success = await guardarEnSupabase(nuevasNotas);
      
      if (success) {
        console.log("✅ Nota eliminada");
        return true;
      } else {
        console.error("❌ Nota no se pudo eliminar de Supabase");
        setNotas(notas);
        return false;
      }
    } catch (error) {
      console.error("Error al eliminar nota:", error);
      return false;
    }
  };

  // ✅ EDITAR NOTA
  const editarNota = async (notaId, nuevoTexto, nuevaCategoria = null) => {
    if (!coupleId) {
      console.error("❌ No hay coupleId para editar nota");
      return false;
    }

    const nuevasNotas = notas.map(n =>
      n.id === notaId 
        ? { 
            ...n, 
            texto: nuevoTexto, 
            categoria: nuevaCategoria !== null ? nuevaCategoria : n.categoria 
          }
        : n
    );

    setNotas(nuevasNotas);

    const success = await guardarEnSupabase(nuevasNotas);
    
    if (success) {
      console.log("✅ Nota editada");
    } else {
      console.error("❌ Nota no se pudo editar en Supabase");
      setNotas(notas);
    }
    
    return success;
  };

  return { 
    notas, 
    setNotas,
    agregarNota,
    eliminarNota, // ✅ OBLIGATORIO INCLUIR
    editarNota,
  };
};