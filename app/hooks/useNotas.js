// app/hooks/useNotas.js
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export const useNotas = () => {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotas = async () => {
    try {
      const { data, error } = await supabase
        .from('notas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNotas(data || []);
    } catch (error) {
      console.error('Error fetching notas:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNota = async (titulo, contenido) => {
    try {
      const { data, error } = await supabase
        .from('notas')
        .insert([{ titulo, contenido }])
        .select();
      
      if (error) throw error;
      await fetchNotas();
      return data;
    } catch (error) {
      console.error('Error adding nota:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchNotas();
  }, []);

  return { 
    notas, 
    setNotas,  // ← AÑADE ESTA LÍNEA
    loading, 
    refetch: fetchNotas, 
    addNota 
  };
};