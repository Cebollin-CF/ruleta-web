import { useState } from 'react';
import { supabase } from '../../supabaseClient';

export const useRazones = (coupleId, usuarioActual) => {
  const [razones, setRazones] = useState([]);
  const [razonDelDia, setRazonDelDia] = useState(null);

  // Función para actualizar contenido completo en Supabase
  const actualizarContenidoCompleto = async (nuevasRazones, nuevaRazonDelDia = null) => {
    if (!coupleId) return false;

    try {
      // Obtener el contenido actual para no sobreescribir otros datos (planes, fotos, etc.)
      const { data: registro, error: fetchError } = await supabase
        .from('app_state')
        .select('contenido')
        .eq('id', coupleId)
        .single();

      if (fetchError) {
        console.error('❌ Error obteniendo contenido actual:', fetchError);
        return false;
      }

      const contenidoPrevio = registro?.contenido || {};
      const contenidoActualizado = {
        ...contenidoPrevio,
        razones: nuevasRazones,
        razonDelDia: nuevaRazonDelDia !== null
          ? nuevaRazonDelDia
          : (contenidoPrevio.razonDelDia ?? razonDelDia),
      };

      const { error: updateError } = await supabase
        .from('app_state')
        .update({ contenido: contenidoActualizado })
        .eq('id', coupleId);

      if (updateError) {
        console.error('❌ Error actualizando razones:', updateError);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error actualizando razones:', err);
      return false;
    }
  };

  // Agregar razón con usuario
  const agregarRazon = async (texto) => {
    if (!coupleId || !texto.trim() || !usuarioActual) return false;

    const nuevaRazon = {
      id: Date.now().toString(),
      texto: texto.trim(),
      autor: usuarioActual.nombre,
      autorId: usuarioActual.id,
      fecha: new Date().toISOString(),
      usuarioNumero: usuarioActual.usuario_numero
    };

    const nuevasRazones = [nuevaRazon, ...razones];
    setRazones(nuevasRazones);

    // Actualizar razón del día si no hay
    let nuevaRazonDelDia = razonDelDia;
    if (!razonDelDia) {
      setRazonDelDia(nuevaRazon);
      nuevaRazonDelDia = nuevaRazon;
    }

    const success = await actualizarContenidoCompleto(nuevasRazones, nuevaRazonDelDia);
    return { success, razon: nuevaRazon };
  };

  // Eliminar razón (solo el autor puede eliminar)
  const eliminarRazon = async (razonId) => {
    const razonAEliminar = razones.find(r => r.id === razonId);
    
    // Verificar que el usuario actual es el autor
    if (usuarioActual && razonAEliminar?.autorId !== usuarioActual.id) {
      return { 
        success: false, 
        error: 'Solo el autor puede eliminar esta razón' 
      };
    }

    const nuevasRazones = razones.filter(r => r.id !== razonId);
    
    setRazones(nuevasRazones);

    // Si la razón eliminada era la razón del día, actualizarla
    let nuevaRazonDelDia = razonDelDia;
    if (razonDelDia?.id === razonId) {
      if (nuevasRazones.length > 0) {
        const randomIndex = Math.floor(Math.random() * nuevasRazones.length);
        setRazonDelDia(nuevasRazones[randomIndex]);
        nuevaRazonDelDia = nuevasRazones[randomIndex];
      } else {
        setRazonDelDia(null);
        nuevaRazonDelDia = null;
      }
    }

    const success = await actualizarContenidoCompleto(nuevasRazones, nuevaRazonDelDia);
    return { success };
  };

  // Editar razón (solo el autor puede editar)
  const editarRazon = async (razonId, nuevoTexto) => {
    const razonAEditar = razones.find(r => r.id === razonId);
    
    // Verificar que el usuario actual es el autor
    if (usuarioActual && razonAEditar?.autorId !== usuarioActual.id) {
      return { 
        success: false, 
        error: 'Solo el autor puede editar esta razón' 
      };
    }

    const nuevasRazones = razones.map(r =>
      r.id === razonId ? { ...r, texto: nuevoTexto } : r
    );

    setRazones(nuevasRazones);

    // Actualizar razón del día si la razón editada era la del día
    let nuevaRazonDelDia = razonDelDia;
    if (razonDelDia?.id === razonId) {
      setRazonDelDia({ ...razonDelDia, texto: nuevoTexto });
      nuevaRazonDelDia = { ...razonDelDia, texto: nuevoTexto };
    }

    const success = await actualizarContenidoCompleto(nuevasRazones, nuevaRazonDelDia);
    return { success };
  };

  // Seleccionar razón del día aleatoria
  const seleccionarRazonDelDiaAleatoria = () => {
    if (razones.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * razones.length);
    const randomRazon = razones[randomIndex];
    setRazonDelDia(randomRazon);
    
    // También guardar en Supabase
    actualizarContenidoCompleto(razones, randomRazon);
    
    return randomRazon;
  };

  // Obtener razones por usuario
  const getRazonesPorUsuario = (usuarioId) => {
    return razones.filter(r => r.autorId === usuarioId);
  };

  return {
    // Estados
    razones,
    razonDelDia,
    
    // Setters
    setRazones,
    setRazonDelDia,
    
    // Funciones
    agregarRazon,
    eliminarRazon,
    editarRazon,
    seleccionarRazonDelDiaAleatoria,
    getRazonesPorUsuario
  };
};