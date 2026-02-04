import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Logro } from '../utils/types';

export const useLogros = (coupleId: string | null, initialPuntos: number = 0, initialLogrosDesbloqueados: string[] = []) => {
  const [puntos, setPuntos] = useState<number>(initialPuntos);
  const [logrosDesbloqueados, setLogrosDesbloqueados] = useState<string[]>(initialLogrosDesbloqueados);
  const [loaded, setLoaded] = useState<boolean>(false);

  const LOGROS_DISPONIBLES: Logro[] = [
    {
      id: 'primer_plan',
      titulo: 'Primer plan 🥇',
      descripcion: 'Completar vuestro primer plan juntos',
      puntos: 10,
      icono: '🥇',
      tipo: 'unico',
      condicion: (datos: any) => datos.totalPlanesCompletados >= 1,
    },
    {
      id: 'planificador_novato',
      titulo: 'Planificador novato 📝',
      descripcion: 'Completar 5 planes',
      puntos: 15,
      icono: '📝',
      tipo: 'repetible',
      niveles: [5, 10, 25, 50, 100],
      condicion: (datos: any) => datos.totalPlanesCompletados,
    },
    {
      id: 'experto_planes',
      titulo: 'Experto en planes 🎯',
      descripcion: 'Completar 25 planes',
      puntos: 50,
      icono: '🎯',
      tipo: 'repetible',
      niveles: [25, 50, 100],
      condicion: (datos: any) => datos.totalPlanesCompletados,
    },
    {
      id: 'primer_foto',
      titulo: 'Primera foto 📸',
      descripcion: 'Subir vuestra primera foto',
      puntos: 5,
      icono: '📸',
      tipo: 'unico',
      condicion: (datos: any) => datos.totalFotos >= 1,
    },
    {
      id: 'coleccionista_fotos',
      titulo: 'Coleccionista de fotos 📷',
      descripcion: 'Subir 10 fotos',
      puntos: 20,
      icono: '📷',
      tipo: 'repetible',
      niveles: [10, 25, 50, 100],
      condicion: (datos: any) => datos.totalFotos,
    },
    {
      id: 'primer_razon',
      titulo: 'Primera razón 💌',
      descripcion: 'Escribir vuestra primera razón',
      puntos: 5,
      icono: '💌',
      tipo: 'unico',
      condicion: (datos: any) => datos.totalRazones >= 1,
    },
    {
      id: 'romantico_serial',
      titulo: 'Romántico serial 💝',
      descripcion: 'Escribir 20 razones',
      puntos: 25,
      icono: '💝',
      tipo: 'repetible',
      niveles: [20, 50, 100, 200],
      condicion: (datos: any) => datos.totalRazones,
    },
    {
      id: 'planificador_consistente',
      titulo: 'Planificador consistente 📅',
      descripcion: 'Tener planes en 7 días diferentes',
      puntos: 30,
      icono: '📅',
      tipo: 'repetible',
      niveles: [7, 14, 30, 60],
      condicion: (datos: any) => datos.diasConPlanes,
    },
    {
      id: 'pareja_activa',
      titulo: 'Pareja activa 🏃‍♂️💨',
      descripcion: 'Plan en 3 días seguidos',
      puntos: 25,
      icono: '🏃‍♂️💨',
      tipo: 'repetible',
      niveles: [3, 7, 14, 30],
      condicion: (datos: any) => datos.maxDiasSeguidosConPlanes,
    },
    {
      id: 'primer_mes',
      titulo: 'Primer mes 🌙',
      descripcion: '30 días juntos',
      puntos: 20,
      icono: '🌙',
      tipo: 'unico',
      condicion: (datos: any) => datos.diasJuntos >= 30,
    },
    {
      id: 'aniversario_100',
      titulo: '100 días 💯',
      descripcion: '100 días juntos',
      puntos: 30,
      icono: '💯',
      tipo: 'unico',
      condicion: (datos: any) => datos.diasJuntos >= 100,
    },
    {
      id: 'aniversario_365',
      titulo: 'Un año completo 🎉',
      descripcion: '365 días juntos',
      puntos: 100,
      icono: '🎉',
      tipo: 'unico',
      condicion: (datos: any) => datos.diasJuntos >= 365,
    },
    {
      id: 'aniversario_500',
      titulo: '500 días ✨',
      descripcion: '500 días juntos',
      puntos: 150,
      icono: '✨',
      tipo: 'unico',
      condicion: (datos: any) => datos.diasJuntos >= 500,
    },
    {
      id: 'primer_desafio',
      titulo: 'Primer desafío 🎯',
      descripcion: 'Completar vuestro primer desafío',
      puntos: 15,
      icono: '🎯',
      tipo: 'unico',
      condicion: (datos: any) => datos.desafiosCompletados >= 1,
    },
    {
      id: 'campeones_desafios',
      titulo: 'Campeones de desafíos 🏆',
      descripcion: 'Completar 10 desafíos',
      puntos: 50,
      icono: '🏆',
      tipo: 'repetible',
      niveles: [10, 25, 50],
      condicion: (datos: any) => datos.desafiosCompletados,
    },
    {
      id: 'primer_mood',
      titulo: 'Primer estado de ánimo 😊',
      descripcion: 'Registrar vuestro primer estado de ánimo',
      puntos: 5,
      icono: '😊',
      tipo: 'unico',
      condicion: (datos: any) => datos.totalMoods >= 1,
    },
    {
      id: 'emociones_registradas',
      titulo: 'Emociones registradas 📊',
      descripcion: 'Registrar 30 estados de ánimo',
      puntos: 40,
      icono: '📊',
      tipo: 'repetible',
      niveles: [30, 60, 100],
      condicion: (datos: any) => datos.totalMoods,
    },
    {
      id: 'pareja_completa',
      titulo: 'Pareja completa ⭐',
      descripcion: 'Completar 1 plan, 1 foto, 1 razón y 1 desafío',
      puntos: 50,
      icono: '⭐',
      tipo: 'unico',
      condicion: (datos: any) =>
        datos.totalPlanesCompletados >= 1 &&
        datos.totalFotos >= 1 &&
        datos.totalRazones >= 1 &&
        datos.desafiosCompletados >= 1,
    },
    {
      id: 'fin_de_semana_perfecto',
      titulo: 'Fin de semana perfecto 🌟',
      descripcion: 'Plan para viernes, sábado y domingo',
      puntos: 35,
      icono: '🌟',
      tipo: 'repetible',
      niveles: [1, 3, 5, 10],
      condicion: (datos: any) => datos.finesDeSemanaCompletos,
    },
  ];

  const guardarEnSupabase = async (desbloqueados: string[], totalPuntos: number): Promise<boolean> => {
    if (!coupleId) return false;

    if (!loaded && desbloqueados.length === 0 && totalPuntos === 0 && puntos === 0) {
      console.warn("⚠️ Guardado de logros ignorado: Pendiente de carga");
      return false;
    }

    try {
      const { data: registro, error: fetchError } = await supabase
        .from('app_state')
        .select('contenido')
        .eq('id', coupleId)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Error obteniendo datos para logros:', fetchError);
        return false;
      }

      const contenidoPrevio = registro?.contenido || {};

      const { error: updateError } = await supabase
        .from('app_state')
        .update({
          contenido: {
            ...contenidoPrevio,
            logrosDesbloqueados: desbloqueados,
            puntos: totalPuntos,
          },
        })
        .eq('id', coupleId);

      if (updateError) {
        console.error('❌ Error actualizando logros en Supabase:', updateError);
        return false;
      }

      console.log("✅ Logros persistidos correctamente");
      return true;
    } catch (err) {
      console.error('❌ Excepción guardando logros:', err);
      return false;
    }
  };

  const calcularNivelActual = (logro: Logro, valorActual: number): number => {
    if (logro.tipo !== 'repetible' || !logro.niveles) return 0;
    let nivel = 0;
    for (let i = 0; i < logro.niveles.length; i++) {
      if (valorActual >= logro.niveles[i]) {
        nivel = i + 1;
      } else {
        break;
      }
    }
    return nivel;
  };

  const calcularProgreso = (logro: Logro, valorActual: number) => {
    if (logro.tipo !== 'repetible' || !logro.niveles) return { actual: valorActual, siguiente: null as number | null, porcentaje: 100 };
    const nivelActual = calcularNivelActual(logro, valorActual);
    if (nivelActual >= logro.niveles.length) return { actual: valorActual, siguiente: null as number | null, porcentaje: 100 };
    const objetivoActual = logro.niveles[nivelActual - 1] || 0;
    const objetivoSiguiente = logro.niveles[nivelActual];
    const progreso = valorActual - objetivoActual;
    const totalParaSiguiente = objetivoSiguiente - objetivoActual;
    const porcentaje = Math.min((progreso / totalParaSiguiente) * 100, 100);
    return { actual: valorActual, siguiente: objetivoSiguiente, porcentaje: Math.round(porcentaje) };
  };

  const actualizarLogros = async (datosUsuario: any, mostrarNotificaciones: boolean = true) => {
    if (!coupleId || !loaded) return null;

    const nuevosDesbloqueos: string[] = [];
    let nuevosPuntos = 0;
    const notificaciones: any[] = [];

    LOGROS_DISPONIBLES.forEach(logro => {
      const valorActual = logro.condicion(datosUsuario);

      if (logro.tipo === 'unico') {
        const logroId = `${logro.id}`;
        if (!logrosDesbloqueados.includes(logroId) && valorActual) {
          nuevosDesbloqueos.push(logroId);
          nuevosPuntos += logro.puntos;
          if (mostrarNotificaciones) {
            notificaciones.push({ titulo: logro.titulo, puntos: logro.puntos, icono: logro.icono });
          }
        }
      } else if (logro.tipo === 'repetible' && logro.niveles) {
        const nivelActual = calcularNivelActual(logro, valorActual as number);
        for (let nivel = 1; nivel <= nivelActual; nivel++) {
          const logroId = `${logro.id}_nivel${nivel}`;
          if (!logrosDesbloqueados.includes(logroId)) {
            nuevosDesbloqueos.push(logroId);
            const puntosNivel = logro.puntos * nivel;
            nuevosPuntos += puntosNivel;
            if (mostrarNotificaciones) {
              notificaciones.push({ titulo: `${logro.titulo} (Nivel ${nivel})`, puntos: puntosNivel, icono: logro.icono });
            }
          }
        }
      }
    });

    if (nuevosDesbloqueos.length > 0) {
      const todosDesbloqueados = [...logrosDesbloqueados, ...nuevosDesbloqueos];
      const totalPuntos = puntos + nuevosPuntos;

      const success = await guardarEnSupabase(todosDesbloqueados, totalPuntos);
      if (success) {
        setLogrosDesbloqueados(todosDesbloqueados);
        setPuntos(totalPuntos);
        return { nuevosDesbloqueos, puntosGanados: nuevosPuntos, notificaciones: mostrarNotificaciones ? notificaciones : [] };
      }
    }
    return null;
  };

  const gastarPuntos = async (cantidad: number) => {
    if (!loaded) return { success: false, error: "Hook no cargado" };
    if (puntos < cantidad) return { success: false, error: "Puntos insuficientes" };

    const nuevosPuntos = puntos - cantidad;
    const success = await guardarEnSupabase(logrosDesbloqueados, nuevosPuntos);

    if (success) {
      setPuntos(nuevosPuntos);
      return { success: true, nuevosPuntos };
    }
    return { success: false, error: "Error de conexión con Supabase" };
  };

  const getLogroInfo = (logroId: string) => {
    let idBase = logroId, nivel = 1;
    if (logroId.includes('_nivel')) {
      const parts = logroId.split('_nivel');
      idBase = parts[0];
      nivel = parseInt(parts[1]) || 1;
    }
    const logro = LOGROS_DISPONIBLES.find(l => l.id === idBase);
    return logro ? { ...logro, nivelActual: nivel, idCompleto: logroId } : null;
  };

  const getTodosLogrosConEstado = (datosUsuario: any) => {
    return LOGROS_DISPONIBLES.map(logro => {
      const valorActual = logro.condicion(datosUsuario);
      if (logro.tipo === 'unico') {
        const desbloqueado = logrosDesbloqueados.includes(logro.id);
        return { ...logro, desbloqueado, valorActual, progreso: desbloqueado ? 100 : (valorActual ? 100 : 0), nivelActual: desbloqueado ? 1 : 0, nivelMaximo: 1 };
      } else if (logro.tipo === 'repetible') {
        const nivelActual = calcularNivelActual(logro, valorActual as number);
        const progresoInfo = calcularProgreso(logro, valorActual as number);
        const nivelesDesbloqueados: number[] = [];
        for (let i = 1; i <= nivelActual; i++) {
          if (logrosDesbloqueados.includes(`${logro.id}_nivel${i}`)) nivelesDesbloqueados.push(i);
        }
        return { ...logro, desbloqueado: nivelActual > 0, valorActual, progreso: progresoInfo.porcentaje, nivelActual, nivelMaximo: logro.niveles?.length || 0, objetivoActual: logro.niveles?.[nivelActual - 1] || null, objetivSiguiente: progresoInfo.siguiente, nivelesDesbloqueados };
      }
      return { ...logro, desbloqueado: false, valorActual, progreso: 0 };
    });
  };

  return {
    logros: LOGROS_DISPONIBLES,
    puntos,
    logrosDesbloqueados,
    loaded,
    actualizarLogros,
    setLogrosDesbloqueados,
    setPuntos,
    setLoaded,
    getLogroInfo,
    getTodosLogrosConEstado,
    calcularProgreso,
    gastarPuntos,
  };
};