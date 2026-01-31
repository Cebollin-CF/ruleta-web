import { useState } from 'react';
import { supabase } from '../../supabaseClient';

export const useRazones = (coupleId, contenidoCompleto) => {
  const [razones, setRazones] = useState(contenidoCompleto?.razones || []);
  const [razonDelDia, setRazonDelDia] = useState(contenidoCompleto?.razonDelDia || null);

  // Función para actualizar contenido completo en Supabase
  const actualizarContenidoCompleto = async (nuevasRazones, nuevaRazonDelDia = null) => {
    if (!coupleId) return false;

    try {
      await supabase
        .from('app_state')
        .update({
          contenido: {
            ...contenidoCompleto,
            razones: nuevasRazones,
            razonDelDia: nuevaRazonDelDia !== null ? nuevaRazonDelDia : razonDelDia,
          },
        })
        .eq('id', coupleId);
      return true;
    } catch (err) {
      console.error('Error actualizando razones:', err);
      return false;
    }
  };

  // Agregar razón
  const agregarRazon = async (texto) => {
    if (!coupleId || !texto.trim()) return false;

    const nuevaRazon = {
      id: Date.now().toString(),
      texto: texto.trim(),
      autor: 'Tú',
      fecha: new Date().toISOString(),
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

  // Eliminar razón
  const eliminarRazon = async (razonId) => {
    const razonAEliminar = razones.find(r => r.id === razonId);
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

  // Editar razón
  const editarRazon = async (razonId, nuevoTexto) => {
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
  };
};
