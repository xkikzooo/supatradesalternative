import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Trade = Database['public']['Tables']['Trade']['Row'];
type InsertTrade = Database['public']['Tables']['Trade']['Insert'];

// Función para obtener trades con paginación
const fetchTrades = async (page: number = 1, limit: number = 20, accountId?: string) => {
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  let query = supabase
    .from('Trade')
    .select('*, TradingPair(name), TradingAccount(name, balance)', { count: 'exact' })
    .order('date', { ascending: false })
    .range(start, end);

  if (accountId) {
    query = query.eq('accountId', accountId);
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    trades: data || [],
    totalCount: count || 0,
    hasMore: (count || 0) > end + 1,
    currentPage: page,
  };
};

// Función para obtener un trade específico
const fetchTrade = async (id: string) => {
  const { data, error } = await supabase
    .from('Trade')
    .select('*, TradingPair(name), TradingAccount(name, balance)')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const useTrades = (page: number = 1, limit: number = 20, accountId?: string) => {
  return useQuery({
    queryKey: ['trades', page, limit, accountId],
    queryFn: () => fetchTrades(page, limit, accountId),
    placeholderData: (previousData) => previousData, // Mantiene datos anteriores mientras carga nuevos
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

export const useTrade = (id: string) => {
  return useQuery({
    queryKey: ['trade', id],
    queryFn: () => fetchTrade(id),
    enabled: !!id, // Solo ejecuta si hay un ID
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useCreateTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trade: Omit<InsertTrade, 'id'>) => {
      const { data, error } = await supabase
        .from('Trade')
        .insert({
          ...trade,
          id: crypto.randomUUID(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidar todas las queries de trades para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    },
  });
};

export const useUpdateTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, trade }: { id: string; trade: Partial<Trade> }) => {
      const { data, error } = await supabase
        .from('Trade')
        .update(trade)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Actualizar el trade específico en caché
      queryClient.setQueryData(['trade', data.id], data);
      // Invalidar queries de trades
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    },
  });
};

export const useDeleteTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/trades/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar el trade');
      }

      return id;
    },
    onSuccess: (id) => {
      // Remover el trade de la caché
      queryClient.removeQueries({ queryKey: ['trade', id] });
      // Invalidar queries de trades y dashboard
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}; 