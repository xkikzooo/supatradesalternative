import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type TradingAccount = Database['public']['Tables']['TradingAccount']['Row'];
type InsertTradingAccount = Database['public']['Tables']['TradingAccount']['Insert'];

// Función para obtener cuentas con paginación
const fetchTradingAccounts = async (page: number = 1, limit: number = 20) => {
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const { data, error, count } = await supabase
    .from('TradingAccount')
    .select('*', { count: 'exact' })
    .order('createdAt', { ascending: false })
    .range(start, end);

  if (error) {
    throw error;
  }

  return {
    accounts: data || [],
    totalCount: count || 0,
    hasMore: (count || 0) > end + 1,
    currentPage: page,
  };
};

// Función para obtener una cuenta específica
const fetchTradingAccount = async (id: string) => {
  const { data, error } = await supabase
    .from('TradingAccount')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const useTradingAccounts = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['tradingAccounts', page, limit],
    queryFn: () => fetchTradingAccounts(page, limit),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useTradingAccount = (id: string) => {
  return useQuery({
    queryKey: ['tradingAccount', id],
    queryFn: () => fetchTradingAccount(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useCreateTradingAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: Omit<InsertTradingAccount, 'id'>) => {
      const { data, error } = await supabase
        .from('TradingAccount')
        .insert({
          ...account,
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
      queryClient.invalidateQueries({ queryKey: ['tradingAccounts'] });
    },
  });
};

export const useUpdateTradingAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, account }: { id: string; account: Partial<TradingAccount> }) => {
      const { data, error } = await supabase
        .from('TradingAccount')
        .update(account)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['tradingAccount', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['tradingAccounts'] });
    },
  });
};

export const useDeleteTradingAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('TradingAccount')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: (id) => {
      queryClient.removeQueries({ queryKey: ['tradingAccount', id] });
      queryClient.invalidateQueries({ queryKey: ['tradingAccounts'] });
    },
  });
}; 