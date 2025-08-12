
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import { getBrazilTimestamp } from '@/utils/dateUtils';

type PackagingEntry = Tables<'packaging_entries'>;
type PackagingEntryInsert = TablesInsert<'packaging_entries'>;

export const usePackagingEntries = () => {
  const [entries, setEntries] = useState<PackagingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('packaging_entries')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching packaging entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (entry: Omit<PackagingEntryInsert, 'timestamp' | 'user_id'>) => {
    try {
      const newEntry = {
        ...entry,
        timestamp: getBrazilTimestamp(),
      };

      const { data, error } = await supabase
        .from('packaging_entries')
        .insert([newEntry])
        .select()
        .single();

      if (error) throw error;
      setEntries(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding packaging entry:', error);
      throw error;
    }
  };

  const getEntriesByDate = (date: string) => {
    return entries.filter(entry => entry.date === date);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return {
    entries,
    loading,
    addEntry,
    getEntriesByDate,
    refetch: fetchEntries
  };
};
