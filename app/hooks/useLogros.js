// hooks/useLogros.js - VERSIÓN MEJORADA
import { useState } from 'react';
import { supabase } from '../../supabaseClient';

export const useLogros = (coupleId, initialPuntos = 0, initialLogrosDesbloqueados = []) => {
  const [puntos, setPuntos] = useState(initialPuntos);
  const [logrosDesbloqueados, setLogrosDesbloqueados] = useState(initialLogrosDesbloqueados);

  // 📋 LISTA AMPLIADA DE LOGROS (muchos más y repetibles)
  const LOGROS_DISPONIBLES = [
    // 🎯 PLANES (repetibles por cantidad)
    {
      id: 'primer_plan',
      titulo: 'Primer plan 🥇',
      descripcion: 'Completar vuestro primer plan juntos',
      puntos: 10,
      icono: '🥇',
      tipo: 'unico',
      condicion: (datos) => datos.totalPlanesCompletados >= 1,
    },
    {
      id: 'planificador_novato',
      titulo: 'Planificador novato 📝',
      descripcion: 'Completar 5 planes',
      puntos: 15,
      icono: '📝',
      tipo: 'repetible',
      niveles: [5, 10, 25, 50, 100],
      condicion: (datos) => datos.totalPlanesCompletados,
    },
    {
      id: 'experto_planes',
      titulo: 'Experto en planes 🎯',
      descripcion: 'Completar 25 planes',
      puntos: 50,
      icono: '🎯',
      tipo: 'repetible',
      niveles: [25, 50, 100],
      condicion: (datos) => datos.totalPlanesCompletados,
    },

    // 📸 FOTOS (repetibles)
    {
      id: 'primer_foto',
      titulo: 'Primera foto 📸',
      descripcion: 'Subir vuestra primera foto',
      puntos: 5,
      icono: '📸',
      tipo: 'unico',
      condicion: (datos) => datos.totalFotos >= 1,
    },
    {
      id: 'coleccionista_fotos',
      titulo: 'Coleccionista de fotos 📷',
      descripcion: 'Subir 10 fotos',
      puntos: 20,
      icono: '📷',
      tipo: 'repetible',
      niveles: [10, 25, 50, 100],
      condicion: (datos) => datos.totalFotos,
    },

    // 💌 RAZONES (repetibles)
    {
      id: 'primer_razon',
      titulo: 'Primera razón 💌',
      descripcion: 'Escribir vuestra primera razón',
      puntos: 5,
      icono: '💌',
      tipo: 'unico',
      condicion: (datos) => datos.totalRazones >= 1,
    },
    {
      id: 'romantico_serial',
      titulo: 'Romántico serial 💝',
      descripcion: 'Escribir 20 razones',
      puntos: 25,
      icono: '💝',
      tipo: 'repetible',
      niveles: [20, 50, 100, 200],
      condicion: (datos) => datos.totalRazones,
    },

    // 📅 FRECUENCIA (repetibles)
    {
      id: 'planificador_consistente',
      titulo: 'Planificador consistente 📅',
      descripcion: 'Tener planes en 7 días diferentes',
      puntos: 30,
      icono: '📅',
      tipo: 'repetible',
      niveles: [7, 14, 30, 60],
      condicion: (datos) => datos.diasConPlanes,
    },
    {
      id: 'pareja_activa',
      titulo: 'Pareja activa 🏃‍♂️💨',
      descripcion: 'Plan en 3 días seguidos',
      puntos: 25,
      icono: '🏃‍♂️💨',
      tipo: 'repetible',
      niveles: [3, 7, 14, 30],
      condicion: (datos) => datos.maxDiasSeguidosConPlanes,
    },

    // ⏳ TIEMPO JUNTOS (aniversarios)
    {
      id: 'primer_mes',
      titulo: 'Primer mes 🌙',
      descripcion: '30 días juntos',
      puntos: 20,
      icono: '🌙',
      tipo: 'unico',
      condicion: (datos) => datos.diasJuntos >= 30,
    },
    {
      id: 'aniversario_100',
      titulo: '100 días 💯',
      descripcion: '100 días juntos',
      puntos: 30,
      icono: '💯',
      tipo: 'unico',
      condicion: (datos) => datos.diasJuntos >= 100,
    },
    {
      id: 'aniversario_365',
      titulo: 'Un año completo 🎉',
      descripcion: '365 días juntos',
      puntos: 100,
      icono: '🎉',
      tipo: 'unico',
      condicion: (datos) => datos.diasJuntos >= 365,
    },
    {
      id: 'aniversario_500',
      titulo: '500 días ✨',
      descripcion: '500 días juntos',
      puntos: 150,
      icono: '✨',
      tipo: 'unico',
      condicion: (datos) => datos.diasJuntos >= 500,
    },

    // 🎯 DESAFÍOS
    {
      id: 'primer_desafio',
      titulo: 'Primer desafío 🎯',
      descripcion: 'Completar vuestro primer desafío',
      puntos: 15,
      icono: '🎯',
      tipo: 'unico',
      condicion: (datos) => datos.desafiosCompletados >= 1,
    },
    {
      id: 'campeones_desafios',
      titulo: 'Campeones de desafíos 🏆',
      descripcion: 'Completar 10 desafíos',
      puntos: 50,
      icono: '🏆',
      tipo: 'repetible',
      niveles: [10, 25, 50],
      condicion: (datos) => datos.desafiosCompletados,
    },

    // 😊 MOOD TRACKER
    {
      id: 'primer_mood',
      titulo: 'Primer estado de ánimo 😊',
      descripcion: 'Registrar vuestro primer estado de ánimo',
      puntos: 5,
      icono: '😊',
      tipo: 'unico',
      condicion: (datos) => datos.totalMoods >= 1,
    },
    {
      id: 'emociones_registradas',
      titulo: 'Emociones registradas 📊',
      descripcion: 'Registrar 30 estados de ánimo',
      puntos: 40,
      icono: '📊',
      tipo: 'repetible',
      niveles: [30, 60, 100],
      condicion: (datos) => datos.totalMoods,
    },

    // ⭐ ESPECIALES (combinaciones)
    {
      id: 'pareja_completa',
      titulo: 'Pareja completa ⭐',
      descripcion: 'Completar 1 plan, 1 foto, 1 razón y 1 desafío',
      puntos: 50,
      icono: '⭐',
      tipo: 'unico',
      condicion: (datos) => 
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
      condicion: (datos) => datos.finesDeSemanaCompletos,
    },
  ];

  // 💾 GUARDAR EN SUPABASE
  const guardarEnSupabase = async (desbloqueados, totalPuntos) => {
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
            logrosDesbloqueados: desbloqueados,
            puntos: totalPuntos,
          },
        })
        .eq('id', coupleId);
    } catch (err) {
      console.error('Error guardando logros:', err);
    }
  };

  // ✅ CALCULAR NIVEL ACTUAL PARA LOGROS REPETIBLES
  const calcularNivelActual = (logro, valorActual) => {
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

  // ✅ CALCULAR PROGRESO PARA EL SIGUIENTE NIVEL
  const calcularProgreso = (logro, valorActual) => {
    if (logro.tipo !== 'repetible' || !logro.niveles) return { actual: valorActual, siguiente: null, porcentaje: 100 };
    
    const nivelActual = calcularNivelActual(logro, valorActual);
    
    if (nivelActual >= logro.niveles.length) {
      return { 
        actual: valorActual, 
        siguiente: null, 
        porcentaje: 100 
      };
    }
    
    const objetivoActual = logro.niveles[nivelActual - 1] || 0;
    const objetivoSiguiente = logro.niveles[nivelActual];
    
    const progreso = valorActual - objetivoActual;
    const totalParaSiguiente = objetivoSiguiente - objetivoActual;
    const porcentaje = Math.min((progreso / totalParaSiguiente) * 100, 100);
    
    return {
      actual: valorActual,
      siguiente: objetivoSiguiente,
      porcentaje: Math.round(porcentaje)
    };
  };
  
  // useLogros.js - Añade después de actualizarLogros

// ✅ FUNCIÓN PARA CARGAR LOGROS SIN NOTIFICACIONES
  const cargarLogrosSilenciosamente = async (datosUsuario) => {
    return await actualizarLogros(datosUsuario, false); // false = sin notificaciones
  };

  // ✅ ACTUALIZAR LOGROS AUTOMÁTICAMENTE
  // useLogros.js - Modifica la función actualizarLogros

  const actualizarLogros = async (datosUsuario, mostrarNotificaciones = true) => {
    // ✅ Parámetro para controlar si mostrar notificaciones
    if (!coupleId) return null;

    const nuevosDesbloqueos = [];
    let nuevosPuntos = 0;
    const notificaciones = [];

    // Verificar cada logro
    LOGROS_DISPONIBLES.forEach(logro => {
      const valorActual = logro.condicion(datosUsuario);
      
      if (logro.tipo === 'unico') {
        const logroId = `${logro.id}`;
        const yaDesbloqueado = logrosDesbloqueados.includes(logroId);
        
        if (!yaDesbloqueado && valorActual) {
          nuevosDesbloqueos.push(logroId);
          nuevosPuntos += logro.puntos;
          
          // ✅ SOLO agregar notificación si se permite
          if (mostrarNotificaciones) {
            notificaciones.push({
              titulo: logro.titulo,
              puntos: logro.puntos,
              icono: logro.icono
            });
          }
        }
      } 
      else if (logro.tipo === 'repetible' && logro.niveles) {
        const nivelActual = calcularNivelActual(logro, valorActual);
        
        // Desbloquear cada nivel alcanzado
        for (let nivel = 1; nivel <= nivelActual; nivel++) {
          const logroId = `${logro.id}_nivel${nivel}`;
          const yaDesbloqueado = logrosDesbloqueados.includes(logroId);
          
          if (!yaDesbloqueado) {
            nuevosDesbloqueos.push(logroId);
            
            const puntosNivel = logro.puntos * nivel;
            nuevosPuntos += puntosNivel;
            
            // ✅ SOLO agregar notificación si se permite
            if (mostrarNotificaciones) {
              notificaciones.push({
                titulo: `${logro.titulo} (Nivel ${nivel})`,
                puntos: puntosNivel,
                icono: logro.icono
              });
            }
          }
        }
      }
    });

    if (nuevosDesbloqueos.length > 0) {
      const todosDesbloqueados = [...logrosDesbloqueados, ...nuevosDesbloqueos];
      const totalPuntos = puntos + nuevosPuntos;
      
      // Actualizar estado local
      setLogrosDesbloqueados(todosDesbloqueados);
      setPuntos(totalPuntos);

      // Guardar en Supabase
      await guardarEnSupabase(todosDesbloqueados, totalPuntos);
      
      return { 
        nuevosDesbloqueos, 
        puntosGanados: nuevosPuntos,
        notificaciones: mostrarNotificaciones ? notificaciones : [] // ✅ Solo si se permite
      };
    }

    return null;
  };

  // Añade después de las otras funciones:
  const gastarPuntos = async (cantidad) => {
    if (puntos < cantidad) {
      return { success: false, error: "Puntos insuficientes" };
    }

    const nuevosPuntos = puntos - cantidad;
    setPuntos(nuevosPuntos);

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
            puntos: nuevosPuntos,
          },
        })
        .eq('id', coupleId);

      return { success: true, nuevosPuntos };
    } catch (err) {
      console.error('Error gastando puntos:', err);
      return { success: false, error: err.message };
    }
  };

  // ✅ OBTENER INFORMACIÓN DE UN LOGRO ESPECÍFICO
  const getLogroInfo = (logroId) => {
    // Extraer ID base y nivel si es repetible
    let idBase = logroId;
    let nivel = 1;
    
    if (logroId.includes('_nivel')) {
      const parts = logroId.split('_nivel');
      idBase = parts[0];
      nivel = parseInt(parts[1]) || 1;
    }
    
    const logro = LOGROS_DISPONIBLES.find(l => l.id === idBase);
    if (!logro) return null;
    
    return {
      ...logro,
      nivelActual: nivel,
      idCompleto: logroId
    };
  };

  // ✅ OBTENER TODOS LOS LOGROS CON SU ESTADO
  const getTodosLogrosConEstado = (datosUsuario) => {
    return LOGROS_DISPONIBLES.map(logro => {
      const valorActual = logro.condicion(datosUsuario);
      
      if (logro.tipo === 'unico') {
        const desbloqueado = logrosDesbloqueados.includes(logro.id);
        return {
          ...logro,
          desbloqueado,
          valorActual,
          progreso: desbloqueado ? 100 : (valorActual ? 100 : 0),
          nivelActual: desbloqueado ? 1 : 0,
          nivelMaximo: 1
        };
      }
      else if (logro.tipo === 'repetible') {
        const nivelActual = calcularNivelActual(logro, valorActual);
        const progresoInfo = calcularProgreso(logro, valorActual);
        
        // Verificar qué niveles están desbloqueados
        const nivelesDesbloqueados = [];
        for (let i = 1; i <= nivelActual; i++) {
          if (logrosDesbloqueados.includes(`${logro.id}_nivel${i}`)) {
            nivelesDesbloqueados.push(i);
          }
        }
        
        return {
          ...logro,
          desbloqueado: nivelActual > 0,
          valorActual,
          progreso: progresoInfo.porcentaje,
          nivelActual,
          nivelMaximo: logro.niveles?.length || 0,
          objetivoActual: logro.niveles?.[nivelActual - 1] || null,
          objetivSiguiente: progresoInfo.siguiente,
          nivelesDesbloqueados
        };
      }
      
      return { ...logro, desbloqueado: false, valorActual, progreso: 0 };
    });
  };

  return {
    logros: LOGROS_DISPONIBLES,
    puntos,
    logrosDesbloqueados,
    actualizarLogros,
    setLogrosDesbloqueados,
    setPuntos,
    getLogroInfo,
    getTodosLogrosConEstado,
    calcularProgreso,
    gastarPuntos,
  };
};