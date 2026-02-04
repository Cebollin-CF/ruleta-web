import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../supabaseClient';
import { Alert } from 'react-native';
import colors from '../utils/colors';

export const useAppState = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [view, setView] = useState<string>('vinculo');
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [fechaAniversario, setFechaAniversario] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; visible: boolean; tipo?: string; color?: string }>({ text: '', visible: false });

  useEffect(() => {
    const init = async () => {
      try {
        const savedCoupleId = await AsyncStorage.getItem('couple_id');
        const savedAniversario = await AsyncStorage.getItem('fecha_aniversario');

        if (savedCoupleId && savedCoupleId.trim() !== '') {
          setCoupleId(savedCoupleId);
          setView('inicio');
        } else {
          setView('vinculo');
        }

        if (savedAniversario) {
          setFechaAniversario(savedAniversario);
        } else {
          const hoy = new Date().toISOString().split('T')[0];
          setFechaAniversario(hoy);
          await AsyncStorage.setItem('fecha_aniversario', hoy);
        }
      } catch (error) {
        console.error('useAppState init error:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const mostrarToast = (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info' = "success", emoji?: string) => {
    const colores: Record<string, string> = {
      success: colors?.primary || "#6BD18A",
      error: colors?.danger || "#FF6B6B",
      warning: colors?.warning || "#F7C56D",
      info: colors?.secondary || "#B28DFF"
    };

    const textoFinal = emoji ? `${emoji} ${mensaje}` : mensaje;

    setToast({
      text: textoFinal,
      visible: true,
      tipo,
      color: colores[tipo] || colores.success
    });

    setTimeout(() => setToast({ text: '', visible: false }), 3000);
  };

  const crearPareja = async () => {
    try {
      setLoading(true);
      const newId = Math.random().toString(36).substring(2, 8).toUpperCase();

      const initialData = {
        planes: [],
        planesPorDia: {},
        notas: [],
        avatarUrl: null,
        fechaAniversario: new Date().toISOString().split('T')[0],
        razones: [],
        desafioActual: null,
        progresoDesafio: 0,
        historialMoods: [],
        moodHoy: {},
        logros: [],
        puntos: 0,
        logrosDesbloqueados: [],
      };

      const { error } = await supabase
        .from('app_state')
        .insert([{ id: newId, contenido: initialData }]);

      if (error) throw error;

      await AsyncStorage.setItem('couple_id', newId);
      setCoupleId(newId);
      setView('inicio');

      return { success: true, coupleId: newId };
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el código nuevo.");
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const conectarPareja = async (idAMano: string) => {
    if (!idAMano || idAMano.trim() === '') {
      Alert.alert("Error", "Introduce un código válido.");
      return { success: false };
    }

    try {
      setLoading(true);
      const idLimpio = idAMano.trim();

      const { data, error } = await supabase
        .from('app_state')
        .select('contenido')
        .eq('id', idLimpio)
        .maybeSingle();

      if (error || !data) {
        Alert.alert("Vínculo no encontrado", "Este código no existe en la base de datos.");
        return { success: false };
      }

      await AsyncStorage.setItem('couple_id', idLimpio);
      setCoupleId(idLimpio);

      const contenido = data.contenido as any;
      if (contenido?.fechaAniversario) {
        setFechaAniversario(contenido.fechaAniversario);
        await AsyncStorage.setItem('fecha_aniversario', contenido.fechaAniversario);
      }

      setView('inicio');
      mostrarToast("¡Pareja conectada con éxito!");
      return { success: true };

    } catch (error) {
      console.error('Error al conectar:', error);
      Alert.alert("Error", "Hubo un problema al conectar.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const eliminarPareja = async () => {
    try {
      await AsyncStorage.removeItem('couple_id');
      setCoupleId(null);
      setView('vinculo');
      mostrarToast('Vínculo eliminado localmente', 'info', '🚽');
    } catch (error) {
      console.error('Error eliminando pareja:', error);
    }
  };

  // Alias para retrocompatibilidad y comodidad
  const mostrarNotificacion = (mensaje: string, emoji: string = "✅") => mostrarToast(mensaje, 'success', emoji);
  const mostrarNotificacionGuardado = (mensaje: string) => mostrarToast(mensaje, 'success', '💾');

  return {
    loading,
    view,
    coupleId,
    fechaAniversario,
    toast,
    setView,
    setCoupleId,
    setFechaAniversario,
    crearPareja,
    conectarPareja,
    eliminarPareja,
    mostrarToast,
    mostrarNotificacion,
    mostrarNotificacionGuardado
  };
};