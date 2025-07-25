
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Stoppage = Tables<'stoppages'>;
type StoppageInsert = TablesInsert<'stoppages'>;

export const useStoppages = () => {
  const [stoppages, setStoppages] = useState<Stoppage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStoppages = async () => {
    try {
      const { data, error } = await supabase
        .from('stoppages')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setStoppages(data || []);
    } catch (error) {
      console.error('Error fetching stoppages:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStoppage = async (stoppage: Omit<StoppageInsert, 'timestamp' | 'is_active'>) => {
    try {
      const newStoppage = {
        ...stoppage,
        timestamp: Date.now(),
        is_active: true
      };

      const { data, error } = await supabase
        .from('stoppages')
        .insert([newStoppage])
        .select()
        .single();

      if (error) throw error;
      setStoppages(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding stoppage:', error);
      throw error;
    }
  };

  const endStoppage = async (id: string, endTime: string) => {
    try {
      const now = new Date();
      const stoppage = stoppages.find(s => s.id === id);
      
      if (!stoppage) throw new Error('Stoppage not found');
      
      const startDateTime = new Date(`${stoppage.start_date} ${stoppage.start_time}`);
      const duration = now.getTime() - startDateTime.getTime();

      const { data, error } = await supabase
        .from('stoppages')
        .update({
          end_date: now.toISOString().split('T')[0],
          end_time: endTime,
          duration,
          is_active: false
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setStoppages(prev => prev.map(s => s.id === id ? data : s));
      return data;
    } catch (error) {
      console.error('Error ending stoppage:', error);
      throw error;
    }
  };

  const getStoppagesByDate = (date: string) => {
    return stoppages.filter(stoppage => stoppage.start_date === date);
  };

  const getActiveStoppages = () => {
    return stoppages.filter(stoppage => stoppage.is_active);
  };

  useEffect(() => {
    fetchStoppages();
  }, []);

  return {
    stoppages,
    loading,
    addStoppage,
    endStoppage,
    getStoppagesByDate,
    getActiveStoppages,
    refetch: fetchStoppages
  };
};
