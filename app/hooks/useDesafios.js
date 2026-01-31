import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export const useDesafios = () => {
  const [desafios, setDesafios] = useState([]);
  const [desafioActual, setDesafioActual] = useState(null);
  const [progresoDesafio, setProgresoDesafio] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDesafios = async () => {
    try {
      const { data, error } = await supabase
        .from('desafios')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDesafios(data || []);
    } catch (error) {
      console.error('Error fetching desafios:', error);
    } finally {
      setLoading(false);
    }
  };

  const completarDesafio = async (id) => {
    try {
      const { error } = await supabase
        .from('desafios')
        .update({ completado: true, completado_at: new Date() })
        .eq('id', id);
      
      if (error) throw error;
      await fetchDesafios();
    } catch (error) {
      console.error('Error completing desafio:', error);
    }
  };

  useEffect(() => {
    fetchDesafios();
  }, []);

  return { 
    desafios, 
    setDesafios,
    desafioActual,
    setDesafioActual,
    progresoDesafio,
    setProgresoDesafio,
    loading, 
    refetch: fetchDesafios, 
    completarDesafio 
  };
};