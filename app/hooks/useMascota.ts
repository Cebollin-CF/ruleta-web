import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Mascota, Usuario } from '../utils/types';

// Función para crear estado inicial seguro
const crearEstadoInicial = (): Mascota => ({
  nombre: 'Alorix',
  nivel: 1,
  experiencia: 0,
  experienciaNecesaria: 100,
  especie: 'gatito',
  estado: 'feliz',
  accesorios: [],
  felicidad: 0,
  ultimaInteraccion: new Date().toISOString(),
  temporizadores: {
    usuario1: {
      acariciar: null,
      alimentar: null,
      jugar: null
    },
    usuario2: {
      acariciar: null,
      alimentar: null,
      jugar: null
    }
  },
  recompensasDesbloqueadas: []
});

export const useMascota = (
  coupleId: string | null,
  puntosTotales: number,
  logrosHook: any,
  usuarioActual: Usuario | null
) => {
  const [mascota, setMascota] = useState<Mascota>(crearEstadoInicial());
  const [loaded, setLoaded] = useState<boolean>(false);

  // Cargar mascota desde Supabase
  useEffect(() => {
    if (!coupleId) return;

    const cargarMascota = async () => {
      try {
        const { data, error } = await supabase
          .from('app_state')
          .select('contenido')
          .eq('id', coupleId)
          .maybeSingle();

        if (error) {
          console.error('Error cargando mascota:', error);
          setLoaded(true);
          return;
        }

        if (data?.contenido?.mascota) {
          const mascotaCargada = data.contenido.mascota;

          const mascotaCompleta = {
            ...crearEstadoInicial(),
            ...mascotaCargada,
            temporizadores: mascotaCargada.temporizadores || crearEstadoInicial().temporizadores
          };

          setMascota(mascotaCompleta);
        }
      } catch (error) {
        console.error('Error en cargarMascota:', error);
      } finally {
        setLoaded(true);
      }
    };

    cargarMascota();
  }, [coupleId]);

  useEffect(() => {
    if (puntosTotales > 0) {
      const nuevoNivel = Math.floor(puntosTotales / 100) + 1;
      const expNecesaria = nuevoNivel * 100;
      const expActual = puntosTotales % 100;

      let nuevaEspecie = 'gatito';
      if (nuevoNivel >= 5) nuevaEspecie = 'gato adolescente';
      if (nuevoNivel >= 10) nuevaEspecie = 'gato adulto';
      if (nuevoNivel >= 20) nuevaEspecie = 'gato legendario';

      setMascota(prev => ({
        ...prev,
        nivel: nuevoNivel,
        experiencia: expActual,
        experienciaNecesaria: expNecesaria,
        especie: nuevaEspecie
      }));
    }
  }, [puntosTotales]);

  const guardarMascota = async (nuevaMascota: Mascota): Promise<boolean> => {
    if (!coupleId) return false;

    if (!loaded && nuevaMascota.nivel === 1 && mascota.felicidad === 0) {
      console.warn("⚠️ Guardado de mascota ignorado: Pendiente de carga");
      return false;
    }

    try {
      const { data: registro, error: fetchError } = await supabase
        .from('app_state')
        .select('contenido')
        .eq('id', coupleId)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Error obteniendo datos para mascota:', fetchError);
        return false;
      }

      const contenidoPrevio = registro?.contenido || {};

      const { error: updateError } = await supabase
        .from('app_state')
        .update({
          contenido: {
            ...contenidoPrevio,
            mascota: nuevaMascota
          }
        })
        .eq('id', coupleId);

      if (updateError) {
        console.error('❌ Error actualizando mascota en Supabase:', updateError);
        return false;
      }

      console.log("✅ Mascota persistida correctamente");
      return true;
    } catch (error) {
      console.error('❌ Excepción guardando mascota:', error);
      return false;
    }
  };

  const getTiempoRestante = (tipo: 'acariciar' | 'alimentar' | 'jugar', usuario: Usuario | null) => {
    if (!usuario || !mascota.temporizadores) return 0;
    const usuarioKey = `usuario${usuario.usuario_numero}`;
    const ultimaAccion = (mascota.temporizadores as any)[usuarioKey]?.[tipo];
    if (!ultimaAccion) return 0;
    const ahora = new Date().getTime();
    const ultima = new Date(ultimaAccion).getTime();
    const horasPasadas = (ahora - ultima) / (1000 * 60 * 60);
    if (horasPasadas >= 10) return 0;
    return Math.ceil(10 - horasPasadas);
  };

  const puedeInteractuar = (tipo: 'acariciar' | 'alimentar' | 'jugar', usuario: Usuario | null) => {
    return getTiempoRestante(tipo, usuario) === 0;
  };

  const interactuar = async (tipo: 'acariciar' | 'alimentar' | 'jugar', usuarioActual: Usuario | null) => {
    if (!loaded) return { success: false, error: 'Sincronizando mascota...' };
    if (!usuarioActual) return { success: false, error: "No hay usuario seleccionado" };

    if (!puedeInteractuar(tipo, usuarioActual)) {
      const horas = getTiempoRestante(tipo, usuarioActual);
      return { success: false, error: `${usuarioActual.nombre}, espera ${horas} horas para ${tipo} de nuevo` };
    }

    const usuarioKey = `usuario${usuarioActual.usuario_numero}`;
    let nuevoEstado = mascota.estado, incrementoFelicidad = 0, mensaje = '';

    switch (tipo) {
      case 'acariciar': nuevoEstado = 'feliz'; incrementoFelicidad = 25; mensaje = `¡${usuarioActual.nombre} acarició a ${mascota.nombre}! ❤️ +25 felicidad`; break;
      case 'alimentar': nuevoEstado = 'satisfecho'; incrementoFelicidad = 25; mensaje = `¡${usuarioActual.nombre} alimentó a ${mascota.nombre}! 🍎 +25 felicidad`; break;
      case 'jugar': nuevoEstado = 'jugueton'; incrementoFelicidad = 25; mensaje = `¡${usuarioActual.nombre} jugó con ${mascota.nombre}! 🎾 +25 felicidad`; break;
      default: return { success: false, error: 'Acción no válida' };
    }

    const nuevaFelicidad = Math.min(mascota.felicidad + incrementoFelicidad, 100);
    let recompensaDesbloqueada: any = null;

    if (nuevaFelicidad === 100 && mascota.felicidad < 100) {
      recompensaDesbloqueada = { id: `recompensa_${Date.now()}`, tipo: 'felicidad_completa', titulo: '¡Felicidad al máximo! 🎉', descripcion: `${usuarioActual.nombre} llenó la barra de felicidad`, recompensa: 'Accesorio exclusivo: Collar de Diamantes 💎', fecha: new Date().toISOString(), usuario: usuarioActual.nombre };
    }

    const nuevaMascota = {
      ...mascota,
      estado: nuevoEstado,
      felicidad: nuevaFelicidad,
      ultimaInteraccion: new Date().toISOString(),
      temporizadores: {
        ...mascota.temporizadores,
        [usuarioKey]: {
          ...((mascota.temporizadores as any)?.[usuarioKey] || { acariciar: null, alimentar: null, jugar: null }),
          [tipo]: new Date().toISOString()
        }
      },
      recompensasDesbloqueadas: recompensaDesbloqueada ? [...(mascota.recompensasDesbloqueadas || []), recompensaDesbloqueada] : (mascota.recompensasDesbloqueadas || [])
    };

    setMascota(nuevaMascota);
    const saved = await guardarMascota(nuevaMascota);
    return saved ? { success: true, mensaje, recompensa: recompensaDesbloqueada, mensajeExtra: recompensaDesbloqueada ? `🎊 ¡Felicidad completa! ${recompensaDesbloqueada.recompensa}` : null } : { success: false, error: 'Error al guardar' };
  };

  const comprarAccesorio = async (accesorio: any, usuarioActual: Usuario | null) => {
    if (!loaded) return { success: false, error: 'Cargando tienda...' };
    if (!usuarioActual) return { success: false, error: 'No hay usuario seleccionado' };
    if ((mascota.accesorios || []).some(a => a.id === accesorio.id)) return { success: false, error: 'Ya tienes este accesorio' };
    if (puntosTotales < (accesorio.precio as number)) return { success: false, error: `${usuarioActual.nombre}, necesitas ${accesorio.precio} puntos` };

    if (logrosHook?.gastarPuntos) {
      const resultadoGasto = await logrosHook.gastarPuntos(accesorio.precio);
      if (!resultadoGasto.success) return resultadoGasto;
    }

    const nuevaMascota = { ...mascota, accesorios: [...(mascota.accesorios || []), { ...accesorio, equipado: true, compradoPor: usuarioActual.nombre }] };
    setMascota(nuevaMascota);
    const saved = await guardarMascota(nuevaMascota);
    return saved ? { success: true, mensaje: `¡${usuarioActual.nombre} compró ${accesorio.nombre}!` } : { success: false, error: 'Error al guardar' };
  };

  const toggleAccesorio = async (accesorioId: string, equipar = true, usuarioActual: Usuario | null) => {
    if (!loaded) return { success: false };
    const nuevaMascota = { ...mascota, accesorios: (mascota.accesorios || []).map(acc => acc.id === accesorioId ? { ...acc, equipado: equipar, ultimoEquipadoPor: usuarioActual?.nombre } : acc) };
    setMascota(nuevaMascota);
    const saved = await guardarMascota(nuevaMascota);
    return saved ? { success: true } : { success: false };
  };

  const cambiarNombre = async (nuevoNombre: string, usuarioActual: Usuario | null) => {
    if (!loaded) return { success: false };
    const nuevaMascota = { ...mascota, nombre: nuevoNombre.trim() };
    setMascota(nuevaMascota);
    const saved = await guardarMascota(nuevaMascota);
    return saved ? { success: true } : { success: false };
  };

  return {
    mascota,
    loaded,
    setLoaded,
    cambiarNombre,
    comprarAccesorio,
    interactuar,
    toggleAccesorio,
    getTiempoRestante,
    puedeInteractuar,
    guardarMascota
  };
};