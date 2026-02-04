import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Razon, Usuario } from '../utils/types';

export const useRazones = (coupleId: string | null, usuarioActual: Usuario | null) => {
  const [razones, setRazones] = useState<Razon[]>([]);
  const [razonDelDia, setRazonDelDia] = useState<Razon | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);

  const actualizarContenidoCompleto = async (nuevasRazones: Razon[], nuevaRazonDelDia: Razon | null = null): Promise<boolean> => {
    if (!coupleId) return false;

    // 🛡️ SEGURIDAD: Evitar sobreescribir con datos vacíos si no se ha cargado
    if (!loaded && nuevasRazones.length === 0 && razones.length === 0) {
      console.warn("⚠️ Guardado de razones ignorado: Pendiente de carga");
      return false;
    }

    try {
      const { data: registro, error: fetchError } = await supabase
        .from('app_state')
        .select('contenido')
        .eq('id', coupleId)
        .maybeSingle();

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

  const agregarRazon = async (texto: string) => {
    if (!coupleId || !texto.trim() || !usuarioActual || !loaded) return false;

    const nuevaRazon: Razon = {
      id: Date.now().toString(),
      texto: texto.trim(),
      autor: usuarioActual.nombre,
      autorId: usuarioActual.id,
      fecha: new Date().toISOString(),
      usuarioNumero: usuarioActual.usuario_numero
    };

    const nuevasRazones = [nuevaRazon, ...razones];
    const result = await actualizarContenidoCompleto(nuevasRazones, razonDelDia || nuevaRazon);

    if (result) {
      setRazones(nuevasRazones);
      if (!razonDelDia) setRazonDelDia(nuevaRazon);
      return { success: true, razon: nuevaRazon };
    }
    return { success: false };
  };

  const eliminarRazon = async (razonId: string) => {
    if (!loaded) return { success: false };
    const razonAEliminar = razones.find(r => r.id === razonId);

    if (usuarioActual && razonAEliminar?.autorId && razonAEliminar.autorId !== usuarioActual.id) {
      return { success: false, error: 'Solo el autor puede eliminar esta razón' };
    }

    const nuevasRazones = razones.filter(r => r.id !== razonId);
    let nuevaRazonDelDia = razonDelDia;
    if (razonDelDia?.id === razonId) {
      nuevaRazonDelDia = nuevasRazones.length > 0 ? nuevasRazones[Math.floor(Math.random() * nuevasRazones.length)] : null;
    }

    const success = await actualizarContenidoCompleto(nuevasRazones, nuevaRazonDelDia);
    if (success) {
      setRazones(nuevasRazones);
      setRazonDelDia(nuevaRazonDelDia);
    }
    return { success };
  };

  const editarRazon = async (razonId: string, nuevoTexto: string) => {
    if (!loaded) return { success: false };
    const razonAEditar = razones.find(r => r.id === razonId);

    if (usuarioActual && razonAEditar?.autorId && razonAEditar.autorId !== usuarioActual.id) {
      return { success: false, error: 'Solo el autor puede editar esta razón' };
    }

    const nuevasRazones = razones.map(r => r.id === razonId ? { ...r, texto: nuevoTexto } : r);
    let nuevaRazonDelDia = razonDelDia;
    if (razonDelDia?.id === razonId) {
      nuevaRazonDelDia = { ...razonDelDia, texto: nuevoTexto };
    }

    const success = await actualizarContenidoCompleto(nuevasRazones, nuevaRazonDelDia);
    if (success) {
      setRazones(nuevasRazones);
      if (razonDelDia?.id === razonId) setRazonDelDia(nuevaRazonDelDia);
    }
    return { success };
  };

  const seleccionarRazonDelDiaAleatoria = () => {
    if (razones.length === 0 || !loaded) return null;
    const randomRazon = razones[Math.floor(Math.random() * razones.length)];
    setRazonDelDia(randomRazon);
    actualizarContenidoCompleto(razones, randomRazon);
    return randomRazon;
  };

  const getRazonesPorUsuario = (usuarioId: string) => {
    return razones.filter(r => r.autorId === usuarioId);
  };

  return {
    razones,
    razonDelDia,
    loaded,
    setRazones,
    setRazonDelDia,
    setLoaded,
    agregarRazon,
    eliminarRazon,
    editarRazon,
    seleccionarRazonDelDiaAleatoria,
    getRazonesPorUsuario
  };
};