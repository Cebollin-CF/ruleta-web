import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Desafio } from '../utils/types';

export const useDesafios = (
  coupleId: string | null,
  initialDesafioActual: Desafio | null = null,
  initialProgreso: number = 0,
  initialUltimaActualizacion: string | null = null,
  initialIntentos: number = 0
) => {
  const [desafioActual, setDesafioActual] = useState<Desafio | null>(initialDesafioActual);
  const [progresoDesafio, setProgresoDesafio] = useState<number>(initialProgreso);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string | null>(initialUltimaActualizacion);
  const [intentosCambio, setIntentosCambio] = useState<number>(initialIntentos);
  const [loaded, setLoaded] = useState<boolean>(false);

  const desafiosDisponibles: Desafio[] = [
    // 💖 ROMANCE & AFECTO
    { emoji: "💬", texto: "Enviaos 1 mensaje bonito cada día", meta: 3, duracion: "corto", categoria: "Romance" },
    { emoji: "😘", texto: "Daos un beso de buenos días 3 días", meta: 3, duracion: "corto", categoria: "Romance" },
    { emoji: "💌", texto: "Escribid 1 cosa bonita al día durante 5 días", meta: 5, duracion: "medio", categoria: "Romance" },
    { emoji: "❤️", texto: "Decidnos 'te quiero' sin motivo 10 veces", meta: 10, duracion: "largo", categoria: "Romance" },
    { emoji: "🌟", texto: "Compartid 1 cosa que amáis del otro 14 días", meta: 14, duracion: "largo", categoria: "Romance" },
    { emoji: "🫂", texto: "Abrazaos durante 1 minuto cada día", meta: 5, duracion: "medio", categoria: "Romance" },
    { emoji: "🌹", texto: "Sorprende con un detalle sin motivo", meta: 1, duracion: "unico", categoria: "Romance" },

    // 🍳 HOGAR & COMIDA
    { emoji: "☕", texto: "Desayunad juntos 3 días seguidos", meta: 3, duracion: "corto", categoria: "Hogar" },
    { emoji: "🍕", texto: "Pedid comida juntos 2 veces", meta: 2, duracion: "corto", categoria: "Hogar" },
    { emoji: "🍽️", texto: "Cocinad juntos 5 comidas esta semana", meta: 5, duracion: "medio", categoria: "Hogar" },
    { emoji: "🍷", texto: "Cena romántica en casa o fuera", meta: 1, duracion: "unico", categoria: "Hogar" },
    { emoji: "🍰", texto: "Hornead algo juntos por primera vez", meta: 1, duracion: "unico", categoria: "Hogar" },
    { emoji: "🧼", texto: "Limpieza profunda juntos con música", meta: 1, duracion: "unico", categoria: "Hogar" },

    // 🎭 OCIO & AVENTURA
    { emoji: "🎬", texto: "Ved 2 películas juntos esta semana", meta: 2, duracion: "corto", categoria: "Ocio" },
    { emoji: "🎮", texto: "Jugad juntos 2 partidas", meta: 2, duracion: "corto", categoria: "Ocio" },
    { emoji: "🎭", texto: "Id juntos a un evento especial", meta: 1, duracion: "unico", categoria: "Ocio" },
    { emoji: "🗺️", texto: "Planead un viaje o escapada", meta: 1, duracion: "unico", categoria: "Ocio" },
    { emoji: "🎪", texto: "Visitad un lugar nuevo juntos", meta: 1, duracion: "unico", categoria: "Ocio" },
    { emoji: "🎡", texto: "Id a un parque de atracciones o feria", meta: 1, duracion: "unico", categoria: "Ocio" },
    { emoji: "🚲", texto: "Dad un paseo en bici o patines", meta: 1, duracion: "unico", categoria: "Ocio" },

    // 📸 DIGITAL & RECUERDOS
    { emoji: "📸", texto: "Enviaos 1 foto diaria durante 7 días", meta: 7, duracion: "medio", categoria: "Recuerdos" },
    { emoji: "🎵", texto: "Compartid 1 canción diaria 7 días", meta: 7, duracion: "medio", categoria: "Recuerdos" },
    { emoji: "💑", texto: "Haced una sesión de fotos juntos", meta: 1, duracion: "unico", categoria: "Recuerdos" },
    { emoji: "📽️", texto: "Haced un vídeo divertido de 30s", meta: 1, duracion: "unico", categoria: "Recuerdos" },
    { emoji: "📅", texto: "Organizad vuestras fotos del último mes", meta: 1, duracion: "unico", categoria: "Recuerdos" },

    // 🧘 BIENESTAR & PERSONAL
    { emoji: "🚶", texto: "Dad un paseo juntos 6 días seguidos", meta: 6, duracion: "medio", categoria: "Bienestar" },
    { emoji: "🌅", texto: "Ved el amanecer o atardecer juntos 5 veces", meta: 5, duracion: "medio", categoria: "Bienestar" },
    { emoji: "📖", texto: "Leed un libro juntos (15 páginas al día)", meta: 15, duracion: "largo", categoria: "Bienestar" },
    { emoji: "💪", texto: "Haced ejercicio juntos 12 días", meta: 12, duracion: "largo", categoria: "Bienestar" },
    { emoji: "🧘", texto: "Meditad o relajaos juntos 10 sesiones", meta: 10, duracion: "largo", categoria: "Bienestar" },
    { emoji: "🍎", texto: "Comed sano juntos durante 3 días", meta: 3, duracion: "corto", categoria: "Bienestar" },
  ];

  const guardarEnSupabase = async (
    nuevoDesafio: Desafio | null,
    nuevoProgreso: number,
    fechaActualizacion: string | null = null,
    nuevosIntentos: number = 0
  ): Promise<boolean> => {
    if (!coupleId) return false;

    if (!loaded && nuevoDesafio === null && progresoDesafio === 0) {
      console.warn("⚠️ Guardado de desafíos ignorado: Pendiente de carga");
      return false;
    }

    try {
      const { data: registro, error: fetchError } = await supabase
        .from('app_state')
        .select('contenido')
        .eq('id', coupleId)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Error obteniendo datos para desafíos:', fetchError);
        return false;
      }

      const contenidoPrevio = registro?.contenido || {};

      const { error: updateError } = await supabase
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

      if (updateError) {
        console.error('❌ Error actualizando desafío en Supabase:', updateError);
        return false;
      }

      console.log("✅ Desafío persistido correctamente");
      return true;
    } catch (err) {
      console.error('❌ Excepción guardando desafío:', err);
      return false;
    }
  };

  const generarNuevoDesafio = async () => {
    if (!loaded) return { success: false, error: 'Esperando sincronización...' };

    if (intentosCambio >= 5) {
      return { success: false, error: 'Has alcanzado el límite de 5 cambios.' };
    }
    const randomIndex = Math.floor(Math.random() * desafiosDisponibles.length);
    const nuevoDesafio = desafiosDisponibles[randomIndex];

    const success = await guardarEnSupabase(nuevoDesafio, 0, null, intentosCambio + 1);

    if (success) {
      setDesafioActual(nuevoDesafio);
      setProgresoDesafio(0);
      setIntentosCambio(prev => prev + 1);
      return { success: true };
    }
    return { success: false, error: 'Error al conectar con el servidor' };
  };

  const completarDesafio = async () => {
    if (!loaded) return { success: false, error: 'Esperando sincronización...' };
    if (!desafioActual) return { success: false, error: 'No hay desafío activo' };

    const hoy = new Date().toISOString().split('T')[0];

    if (desafioActual.meta > 1 && ultimaActualizacion === hoy) {
      return { success: false, error: 'Ya has avanzado hoy. ¡Vuelve mañana!' };
    }

    const nuevoProgreso = progresoDesafio + 1;
    const fechaParaGuardar = desafioActual.meta > 1 ? hoy : null;

    if (nuevoProgreso >= desafioActual.meta) {
      const success = await guardarEnSupabase(null, 0, null, 0);
      if (success) {
        setProgresoDesafio(nuevoProgreso);
        setTimeout(() => {
          setDesafioActual(null);
          setProgresoDesafio(0);
          setUltimaActualizacion(null);
          setIntentosCambio(0);
        }, 2000);
        return { success: true, completado: true };
      }
    } else {
      const success = await guardarEnSupabase(desafioActual, nuevoProgreso, fechaParaGuardar, intentosCambio);
      if (success) {
        setProgresoDesafio(nuevoProgreso);
        if (desafioActual.meta > 1) {
          setUltimaActualizacion(hoy);
        }
        return { success: true, completado: false };
      }
    }

    return { success: false, error: 'Error de conexión' };
  };

  return {
    desafioActual,
    progresoDesafio,
    ultimaActualizacion,
    intentosCambio,
    loaded,
    setDesafioActual,
    setProgresoDesafio,
    setUltimaActualizacion,
    setIntentosCambio,
    setLoaded,
    generarNuevoDesafio,
    completarDesafio,
    desafiosDisponibles,
  };
};