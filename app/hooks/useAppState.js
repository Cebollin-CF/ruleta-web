import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../supabaseClient';

export const useAppState = () => {
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('vinculo');
  const [coupleId, setCoupleId] = useState(null);
  const [fechaAniversario, setFechaAniversario] = useState(null);
  const [toast, setToast] = useState({ text: '', visible: false });

  // Cargar estado inicial
  useEffect(() => {
    const init = async () => {
      try {
        const savedCoupleId = await AsyncStorage.getItem('couple_id');
        const savedAniversario = await AsyncStorage.getItem('fecha_aniversario');

        console.log('useAppState: savedCoupleId =', savedCoupleId);

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

  // Función para crear nueva pareja
  const crearPareja = async () => {
    try {
      const newId = Date.now().toString();
      
      // Guardar en AsyncStorage
      await AsyncStorage.setItem('couple_id', newId);
      
      // Actualizar estado
      setCoupleId(newId);
      
      // Crear registro en Supabase
      await supabase.from('app_state').upsert({
        id: newId,
        contenido: {
          planes: [],
          planesPorDia: {},
          notas: [],
          avatarUrl: null,
          fechaAniversario: null,
          razones: [],
          desafioActual: null,
          progresoDesafio: 0,
          historialMoods: [],
          moodHoy: {},
        },
      });
      
      // Cambiar vista
      setView('inicio');
      
      return { success: true, coupleId: newId };
    } catch (error) {
      console.error('Error en crearPareja:', error);
      return { success: false, error };
    }
  };

  // Función toast
  const mostrarToast = (text, duration = 3000) => {
    setToast({ text, visible: true });
    setTimeout(() => setToast({ text: '', visible: false }), duration);
  };

  // Eliminar pareja
  const eliminarPareja = async () => {
    try {
      await AsyncStorage.removeItem('couple_id');
      setCoupleId(null);
      setView('vinculo');
      mostrarToast('Vínculo eliminado');
    } catch (error) {
      console.error('Error eliminando pareja:', error);
    }
  };

  return {
    // Estados
    loading,
    view,
    coupleId,
    fechaAniversario,
    toast,
    
    // Setters
    setView,
    setCoupleId,
    setFechaAniversario,
    
    // Funciones
    crearPareja,
    eliminarPareja,
    mostrarToast,
  };
};
