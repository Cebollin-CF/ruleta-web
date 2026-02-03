import { useState } from 'react';
import { supabase } from '../../supabaseClient';

export const useDesafios = (coupleId, initialDesafioActual = null, initialProgreso = 0, initialUltimaActualizacion = null, initialIntentos = 0) => {
  const [desafioActual, setDesafioActual] = useState(initialDesafioActual);
  const [progresoDesafio, setProgresoDesafio] = useState(initialProgreso);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(initialUltimaActualizacion);
  const [intentosCambio, setIntentosCambio] = useState(initialIntentos);

  // 📋 LISTA AMPLIADA DE DESAFÍOS
  const desafiosDisponibles = [
    // CORTOS (1-3 días)
    { emoji: "💬", texto: "Enviaos 1 mensaje bonito cada día", meta: 3, duracion: "corto" },
    { emoji: "☕", texto: "Desayunad juntos 3 días seguidos", meta: 3, duracion: "corto" },
    { emoji: "🎬", texto: "Ved 2 películas juntos esta semana", meta: 2, duracion: "corto" },
    { emoji: "🍕", texto: "Pedid comida juntos 2 veces", meta: 2, duracion: "corto" },
    { emoji: "😘", texto: "Daos un beso de buenos días 3 días", meta: 3, duracion: "corto" },
    { emoji: "🎮", texto: "Jugad juntos 2 partidas", meta: 2, duracion: "corto" },

    // MEDIOS (5-7 días)
    { emoji: "📸", texto: "Enviaos 1 foto diaria durante 7 días", meta: 7, duracion: "medio" },
    { emoji: "💌", texto: "Escribid 1 cosa bonita al día durante 5 días", meta: 5, duracion: "medio" },
    { emoji: "🚶", texto: "Dad un paseo juntos 6 días seguidos", meta: 6, duracion: "medio" },
    { emoji: "🍽️", texto: "Cocinad juntos 5 comidas esta semana", meta: 5, duracion: "medio" },
    { emoji: "📱", texto: "Llamaos cada noche durante 5 días", meta: 5, duracion: "medio" },
    { emoji: "🎵", texto: "Compartid 1 canción diaria 7 días", meta: 7, duracion: "medio" },
    { emoji: "🌅", texto: "Ved el amanecer o atardecer juntos 5 veces", meta: 5, duracion: "medio" },

    // LARGOS (10+ días)
    { emoji: "❤️", texto: "Decidnos 'te quiero' sin motivo 10 veces", meta: 10, duracion: "largo" },
    { emoji: "🎁", texto: "Sorprendeos con detalles pequeños 10 veces", meta: 10, duracion: "largo" },
    { emoji: "📖", texto: "Leed un libro juntos (15 páginas al día)", meta: 15, duracion: "largo" },
    { emoji: "💪", texto: "Haced ejercicio juntos 12 días", meta: 12, duracion: "largo" },
    { emoji: "🎨", texto: "Cread algo juntos 10 veces (dibujo, craft, etc)", meta: 10, duracion: "largo" },
    { emoji: "🌟", texto: "Compartid 1 cosa que amáis del otro 14 días", meta: 14, duracion: "largo" },
    { emoji: "🧘", texto: "Meditad o relajaos juntos 10 sesiones", meta: 10, duracion: "largo" },

    // DE UNA VEZ (evento único)
    { emoji: "🎭", texto: "Id juntos a un evento especial", meta: 1, duracion: "unico" },
    { emoji: "🗺️", texto: "Planead un viaje o escapada", meta: 1, duracion: "unico" },
    { emoji: "💑", texto: "Haced una sesión de fotos juntos", meta: 1, duracion: "unico" },
    { emoji: "🍷", texto: "Cena romántica en casa o fuera", meta: 1, duracion: "unico" },
    { emoji: "🎪", texto: "Visitad un lugar nuevo juntos", meta: 1, duracion: "unico" },
    { emoji: "🎁", texto: "Sorprendeos con un regalo hecho a mano", meta: 1, duracion: "unico" },
  ];

  // ✅ GUARDAR EN SUPABASE
  const guardarEnSupabase = async (nuevoDesafio, nuevoProgreso, fechaActualizacion = null, nuevosIntentos = 0) => {
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
            desafioActual: nuevoDesafio,
            progresoDesafio: nuevoProgreso,
            ultimaActualizacionDesafio: fechaActualizacion,
            intentosCambio: nuevosIntentos,
          },
        })
        .eq('id', coupleId);

      return true;
    } catch (err) {
      console.error('Error guardando desafío:', err);
      return false;
    }
  };

  // ✅ GENERAR NUEVO DESAFÍO
  const generarNuevoDesafio = async () => {
    if (intentosCambio >= 5) {
      return { success: false, error: 'Has alcanzado el límite de 5 cambios.' };
    }
    const randomIndex = Math.floor(Math.random() * desafiosDisponibles.length);
    const nuevoDesafio = desafiosDisponibles[randomIndex];

    // Actualizar estado local
    setDesafioActual(nuevoDesafio);
    setProgresoDesafio(0);
    setIntentosCambio(prev => prev + 1);

    // Guardar en Supabase
    await guardarEnSupabase(nuevoDesafio, 0, null, intentosCambio + 1);
  };

  // ✅ COMPLETAR UN PASO DEL DESAFÍO
  const completarDesafio = async () => {
    if (!desafioActual) return { success: false, error: 'No hay desafío activo' };

    const hoy = new Date().toISOString().split('T')[0];

    // Verificar si ya se completó hoy (solo para desafíos de más de 1 día)
    if (desafioActual.meta > 1 && ultimaActualizacion === hoy) {
      return { success: false, error: 'Ya has avanzado hoy. ¡Vuelve mañana!' };
    }

    const nuevoProgreso = progresoDesafio + 1;

    // Actualizar estado local
    setProgresoDesafio(nuevoProgreso);
    if (desafioActual.meta > 1) {
      setUltimaActualizacion(hoy);
    }

    // Si se completó el desafío, limpiarlo
    if (nuevoProgreso >= desafioActual.meta) {
      setTimeout(async () => {
        setDesafioActual(null);
        setProgresoDesafio(0);
        setUltimaActualizacion(null);
        setIntentosCambio(0);
        await guardarEnSupabase(null, 0, null, 0);
      }, 2000);
      return { success: true, completado: true };
    } else {
      // Guardar progreso en Supabase
      const fechaParaGuardar = desafioActual.meta > 1 ? hoy : null;
      await guardarEnSupabase(desafioActual, nuevoProgreso, fechaParaGuardar, intentosCambio);
      return { success: true, completado: false };
    }
  };

  return {
    desafioActual,
    progresoDesafio,
    ultimaActualizacion,
    intentosCambio,
    setDesafioActual,
    setProgresoDesafio,
    setUltimaActualizacion,
    setIntentosCambio,
    generarNuevoDesafio,
    completarDesafio,
    desafiosDisponibles, // Exportamos la lista para mostrarla en la pantalla
  };
};