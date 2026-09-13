
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import { getBrazilTime, getBrazilTimestamp, getBrazilDateForInput } from '@/utils/dateUtils';

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

  const addStoppage = async (stoppage: Omit<StoppageInsert, 'timestamp' | 'is_active' | 'user_id'>) => {
    try {
      const newStoppage = {
        ...stoppage,
        timestamp: getBrazilTimestamp(),
        is_active: true,
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
      const now = getBrazilTime();
      const stoppage = stoppages.find(s => s.id === id);
      
      if (!stoppage) throw new Error('Stoppage not found');
      
      const startDateTime = new Date(`${stoppage.start_date} ${stoppage.start_time}`);
      const duration = now.getTime() - startDateTime.getTime();

      const { data, error } = await supabase
        .from('stoppages')
        .update({
          end_date: getBrazilDateForInput(now),
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

  const deleteStoppage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('stoppages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setStoppages(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting stoppage:', error);
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
    deleteStoppage,
    getStoppagesByDate,
    getActiveStoppages,
    refetch: fetchStoppages
  };
};
