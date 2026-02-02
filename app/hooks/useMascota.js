import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

// Función para crear estado inicial seguro
const crearEstadoInicial = () => ({
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

export const useMascota = (coupleId, puntosTotales, logrosHook, usuarioId = 'user1') => {
  const [mascota, setMascota] = useState(crearEstadoInicial());

  // Cargar mascota desde Supabase
  useEffect(() => {
    if (!coupleId) return;
    
    const cargarMascota = async () => {
      try {
        const { data, error } = await supabase
          .from('app_state')
          .select('contenido')
          .eq('id', coupleId)
          .single();
        
        if (error) {
          console.error('Error cargando mascota:', error);
          return;
        }
        
        if (data?.contenido?.mascota) {
          const mascotaCargada = data.contenido.mascota;
          
          // Crear objeto completo con valores por defecto
          const mascotaCompleta = {
            ...crearEstadoInicial(),
            ...mascotaCargada,
            // Asegurar temporizadores existe
            temporizadores: mascotaCargada.temporizadores || crearEstadoInicial().temporizadores
          };
          
          setMascota(mascotaCompleta);
        }
      } catch (error) {
        console.error('Error en cargarMascota:', error);
      }
    };
    
    cargarMascota();
  }, [coupleId]);

  // Calcular nivel basado en puntos
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

  // Guardar mascota en Supabase
  const guardarMascota = async (nuevaMascota) => {
    if (!coupleId) return false;
    
    try {
      const { data: registro, error: fetchError } = await supabase
        .from('app_state')
        .select('contenido')
        .eq('id', coupleId)
        .single();
      
      if (fetchError) {
        console.error('Error obteniendo datos:', fetchError);
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
        console.error('Error actualizando mascota:', updateError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error guardando mascota:', error);
      return false;
    }
  };

  // Calcular tiempo restante para una acción
  const getTiempoRestante = (tipo) => {
    // Verificar que temporizadores existe
    if (!mascota.temporizadores) {
      return 0;
    }
    
    const usuario = usuarioId === 'user1' ? 'usuario1' : 'usuario2';
    
    // Verificar que el usuario existe en temporizadores
    if (!mascota.temporizadores[usuario]) {
      return 0;
    }
    
    const ultimaAccion = mascota.temporizadores[usuario][tipo];
    
    if (!ultimaAccion) return 0;
    
    const ahora = new Date().getTime();
    const ultima = new Date(ultimaAccion).getTime();
    const horasPasadas = (ahora - ultima) / (1000 * 60 * 60);
    
    if (horasPasadas >= 10) return 0;
    
    return Math.ceil(10 - horasPasadas);
  };

  const puedeInteractuar = (tipo) => {
    return getTiempoRestante(tipo) === 0;
  };

  // Interactuar con la mascota
  const interactuar = async (tipo) => {
    if (!puedeInteractuar(tipo)) {
      const horas = getTiempoRestante(tipo);
      return { 
        success: false, 
        error: `Debes esperar ${horas} horas para ${tipo} de nuevo` 
      };
    }

    const usuario = usuarioId === 'user1' ? 'usuario1' : 'usuario2';
    let nuevoEstado = mascota.estado;
    let incrementoFelicidad = 0;
    let mensaje = '';

    switch(tipo) {
      case 'acariciar':
        nuevoEstado = 'feliz';
        incrementoFelicidad = 25;
        mensaje = `¡Acariciaste a ${mascota.nombre}! ❤️ +25 felicidad`;
        break;
      case 'alimentar':
        nuevoEstado = 'satisfecho';
        incrementoFelicidad = 25;
        mensaje = `¡Alimentaste a ${mascota.nombre}! 🍎 +25 felicidad`;
        break;
      case 'jugar':
        nuevoEstado = 'jugueton';
        incrementoFelicidad = 25;
        mensaje = `¡Jugaste con ${mascota.nombre}! 🎾 +25 felicidad`;
        break;
      default:
        return { success: false, error: 'Acción no válida' };
    }

    // Nueva felicidad (máximo 100)
    const nuevaFelicidad = Math.min(mascota.felicidad + incrementoFelicidad, 100);
    let recompensaDesbloqueada = null;

    // Verificar si alcanzó 100 de felicidad
    if (nuevaFelicidad === 100 && mascota.felicidad < 100) {
      recompensaDesbloqueada = {
        id: `recompensa_${Date.now()}`,
        tipo: 'felicidad_completa',
        titulo: '¡Felicidad al máximo! 🎉',
        descripcion: 'Has llenado la barra de felicidad',
        recompensa: 'Accesorio exclusivo: Collar de Diamantes 💎',
        fecha: new Date().toISOString()
      };
    }

    const nuevaMascota = {
      ...mascota,
      estado: nuevoEstado,
      felicidad: nuevaFelicidad,
      ultimaInteraccion: new Date().toISOString(),
      temporizadores: {
        ...mascota.temporizadores,
        [usuario]: {
          ...(mascota.temporizadores?.[usuario] || {
            acariciar: null,
            alimentar: null,
            jugar: null
          }),
          [tipo]: new Date().toISOString()
        }
      },
      recompensasDesbloqueadas: recompensaDesbloqueada 
        ? [...(mascota.recompensasDesbloqueadas || []), recompensaDesbloqueada]
        : (mascota.recompensasDesbloqueadas || [])
    };

    setMascota(nuevaMascota);
    const saved = await guardarMascota(nuevaMascota);

    if (saved) {
      const resultado = { success: true, mensaje };
      if (recompensaDesbloqueada) {
        resultado.recompensa = recompensaDesbloqueada;
        resultado.mensajeExtra = `🎊 ¡Felicidad completa! ${recompensaDesbloqueada.recompensa}`;
      }
      return resultado;
    } else {
      return { success: false, error: 'Error al guardar' };
    }
  };

  // Comprar accesorio
  const comprarAccesorio = async (accesorio) => {
    const yaComprado = (mascota.accesorios || []).some(a => a.id === accesorio.id);
    if (yaComprado) {
      return { success: false, error: 'Ya tienes este accesorio' };
    }
    
    if (puntosTotales < accesorio.precio) {
      return { 
        success: false, 
        error: `Necesitas ${accesorio.precio} puntos, tienes ${puntosTotales}` 
      };
    }
    
    if (logrosHook?.gastarPuntos) {
      const resultadoGasto = await logrosHook.gastarPuntos(accesorio.precio);
      if (!resultadoGasto.success) return resultadoGasto;
    }
    
    const nuevaMascota = {
      ...mascota,
      accesorios: [...(mascota.accesorios || []), { ...accesorio, equipado: true }]
    };
    
    setMascota(nuevaMascota);
    const saved = await guardarMascota(nuevaMascota);
    
    if (saved) {
      return { 
        success: true, 
        mensaje: `¡Comprado ${accesorio.nombre} por ${accesorio.precio} puntos!` 
      };
    } else {
      return { success: false, error: 'Error al guardar' };
    }
  };

  // Equipar/des-equipar accesorio
  const toggleAccesorio = async (accesorioId, equipar = true) => {
    const nuevaMascota = {
      ...mascota,
      accesorios: (mascota.accesorios || []).map(acc =>
        acc.id === accesorioId ? { ...acc, equipado: equipar } : acc
      )
    };
    
    setMascota(nuevaMascota);
    const saved = await guardarMascota(nuevaMascota);
    
    if (saved) {
      return { success: true, mensaje: `Accesorio ${equipar ? 'equipado' : 'removido'}` };
    } else {
      return { success: false, error: 'Error al actualizar' };
    }
  };

  // Cambiar nombre
  const cambiarNombre = async (nuevoNombre) => {
    if (!nuevoNombre.trim()) {
      return { success: false, error: 'Nombre no puede estar vacío' };
    }
    
    const nuevaMascota = { ...mascota, nombre: nuevoNombre.trim() };
    setMascota(nuevaMascota);
    const saved = await guardarMascota(nuevaMascota);
    
    if (saved) {
      return { success: true, mensaje: `¡Nombre cambiado a ${nuevoNombre.trim()}!` };
    } else {
      return { success: false, error: 'Error al guardar' };
    }
  };

  // Resetear felicidad
  const resetearFelicidad = async () => {
    const nuevaMascota = {
      ...mascota,
      felicidad: 0
    };
    
    setMascota(nuevaMascota);
    const saved = await guardarMascota(nuevaMascota);
    
    if (saved) {
      return { success: true, mensaje: 'Felicidad reseteada' };
    } else {
      return { success: false, error: 'Error al resetear' };
    }
  };

  return {
    mascota,
    cambiarNombre,
    comprarAccesorio,
    interactuar,
    toggleAccesorio,
    resetearFelicidad,
    getTiempoRestante,
    puedeInteractuar,
    guardarMascota
  };
};