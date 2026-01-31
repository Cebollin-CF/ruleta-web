import { useState } from 'react';
import { supabase } from '../../supabaseClient';

export const useNotas = (coupleId, initialNotas = []) => {
  const [notas, setNotas] = useState(initialNotas);

  // ✅ GUARDAR EN SUPABASE
  const guardarEnSupabase = async (nuevasNotas) => {
    if (!coupleId) return false;

    try {
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
            notas: nuevasNotas,
          },
        })
        .eq('id', coupleId);

      return true;
    } catch (err) {
      console.error('Error guardando notas:', err);
      return false;
    }
  };

  // ✅ AGREGAR NOTA
  const agregarNota = async (texto, categoria = "💭 General") => {
    if (!coupleId || !texto.trim()) return false;

    const nuevaNota = {
      id: Date.now().toString(),
      texto: texto.trim(),
      categoria: categoria,
      fecha: new Date().toISOString(),
    };

    const nuevasNotas = [nuevaNota, ...notas];
    
    // Actualizar estado local primero
    setNotas(nuevasNotas);

    // Guardar en Supabase
    return await guardarEnSupabase(nuevasNotas);
  };

  // ✅ ELIMINAR NOTA
  const eliminarNota = async (notaId) => {
    const nuevasNotas = notas.filter(n => n.id !== notaId);
    
    // Actualizar estado local
    setNotas(nuevasNotas);

    // Guardar en Supabase
    return await guardarEnSupabase(nuevasNotas);
  };

  // ✅ EDITAR NOTA
  const editarNota = async (notaId, nuevoTexto, nuevaCategoria = null) => {
    const nuevasNotas = notas.map(n =>
      n.id === notaId 
        ? { 
            ...n, 
            texto: nuevoTexto, 
            categoria: nuevaCategoria !== null ? nuevaCategoria : n.categoria 
          }
        : n
    );

    // Actualizar estado local
    setNotas(nuevasNotas);

    // Guardar en Supabase
    return await guardarEnSupabase(nuevasNotas);
  };

  return { 
    notas, 
    setNotas,
    agregarNota,
    eliminarNota,
    editarNota,
  };
};