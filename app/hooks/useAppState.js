import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../supabaseClient';
import { Alert } from 'react-native';

export const useAppState = () => {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('vinculo');
  const [coupleId, setCoupleId] = useState(null);
  const [fechaAniversario, setFechaAniversario] = useState(null);
  const [toast, setToast] = useState({ text: '', visible: false });

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

  // 1. FUNCIÓN PARA CREAR (Solo para IDs nuevos)
  const crearPareja = async () => {
    try {
      setLoading(true);
      const newId = Math.random().toString(36).substring(2, 8).toUpperCase(); // ID más corto y bonito
      
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
      };

      // Usamos .insert() en lugar de .upsert() por seguridad
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

  // 2. FUNCIÓN PARA VINCULAR (Para recuperar planes borrados o conectar otro móvil)
  const conectarPareja = async (idAMano) => {
    if (!idAMano || idAMano.trim() === '') {
      Alert.alert("Error", "Introduce un código válido.");
      return;
    }

    try {
      setLoading(true);
      const idLimpio = idAMano.trim();

      // Buscamos si el ID existe y traemos sus datos
      const { data, error } = await supabase
        .from('app_state')
        .select('contenido')
        .eq('id', idLimpio)
        .single();

      if (error || !data) {
        Alert.alert("Vínculo no encontrado", "Este código no existe en la base de datos.");
        return { success: false };
      }

      // SI EXISTE: Guardamos localmente y cambiamos de vista
      // IMPORTANTE: NO hacemos upsert aquí, solo leemos.
      await AsyncStorage.setItem('couple_id', idLimpio);
      setCoupleId(idLimpio);
      
      if (data.contenido?.fechaAniversario) {
        setFechaAniversario(data.contenido.fechaAniversario);
        await AsyncStorage.setItem('fecha_aniversario', data.contenido.fechaAniversario);
      }

      setView('inicio');
      mostrarToast("¡Pareja conectada con éxito!");
      return { success: true };

    } catch (error) {
      console.error('Error al conectar:', error);
      Alert.alert("Error", "Hubo un problema al conectar.");
    } finally {
      setLoading(false);
    }
  };

  const mostrarToast = (text, duration = 3000) => {
    setToast({ text, visible: true });
    setTimeout(() => setToast({ text: '', visible: false }), duration);
  };

  const eliminarPareja = async () => {
    try {
      await AsyncStorage.removeItem('couple_id');
      setCoupleId(null);
      setView('vinculo');
      mostrarToast('Vínculo eliminado localmente');
    } catch (error) {
      console.error('Error eliminando pareja:', error);
    }
  };

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
    conectarPareja, // <-- Debe estar aquí
    eliminarPareja,
    mostrarToast,
  };
};