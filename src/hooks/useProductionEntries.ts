
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import { getBrazilTimestamp } from '@/utils/dateUtils';

type ProductionEntry = Tables<'production_entries'>;
type ProductionEntryInsert = TablesInsert<'production_entries'>;

export const useProductionEntries = () => {
  const [entries, setEntries] = useState<ProductionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('production_entries')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching production entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (entry: Omit<ProductionEntryInsert, 'timestamp' | 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newEntry = {
        ...entry,
        timestamp: getBrazilTimestamp(),
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('production_entries')
        .insert([newEntry])
        .select()
        .single();

      if (error) throw error;
      setEntries(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding production entry:', error);
      throw error;
    }
  };

  const getEntriesByDate = (date: string) => {
    return entries.filter(entry => entry.date === date);
  };

  const getEntriesByHour = (date: string) => {
    const dateEntries = getEntriesByDate(date);
    const hourlyData: { [key: string]: { caixa01: number; caixa02: number } } = {};
    
    dateEntries.forEach((entry) => {
      const hour = entry.time.split(':')[0] + ':00';
      if (!hourlyData[hour]) {
        hourlyData[hour] = { caixa01: 0, caixa02: 0 };
      }
      
      if (entry.box === 'caixa01') {
        hourlyData[hour].caixa01 += entry.quantity;
      } else {
        hourlyData[hour].caixa02 += entry.quantity;
      }
    });
    
    return Object.entries(hourlyData).map(([hour, data]) => ({
      hour,
      ...data,
    }));
  };

  const getTotalByBox = (date: string) => {
    const dateEntries = getEntriesByDate(date);
    return dateEntries.reduce(
      (acc, entry) => {
        if (entry.box === 'caixa01') {
          acc.caixa01 += entry.quantity;
        } else {
          acc.caixa02 += entry.quantity;
        }
        return acc;
      },
      { caixa01: 0, caixa02: 0 }
    );
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return {
    entries,
    loading,
    addEntry,
    getEntriesByDate,
    getEntriesByHour,
    getTotalByBox,
    refetch: fetchEntries
  };
};
