import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Trade {
  id: string;
  tradingPair: {
    id: string;
    name: string;
  };
  date: string;
  pnl: number;
  bias: string;
  psychology?: string;
  images: string[];
  direction: 'LONG' | 'SHORT';
  result: 'WIN' | 'LOSS' | 'BREAKEVEN';
  account?: {
    id: string;
    name: string;
    broker: string;
    type: string;
  };
}

// Interfaces para creación y actualización
interface CreateTradeData {
  tradingPairId: string;
  direction: 'LONG' | 'SHORT';
  bias: string;
  biasExplanation?: string;
  psychology?: string;
  result: 'WIN' | 'LOSS' | 'BREAKEVEN';
  pnl: number;
  riskAmount?: number;
  images: string[];
  date: string;
  accountIds: string[];
}

interface UpdateTradeData {
  tradingPairId?: string;
  direction?: 'LONG' | 'SHORT';
  bias?: string;
  biasExplanation?: string;
  psychology?: string;
  result?: 'WIN' | 'LOSS' | 'BREAKEVEN';
  pnl?: number;
  riskAmount?: number;
  images?: string[];
  date?: string;
  accountIds?: string[];
}

interface TradingPair {
  id: string;
  name: string;
}

interface TradingAccount {
  id: string;
  name: string;
  broker: string;
  type: string;
}

// Función para obtener todos los trades
const fetchTrades = async (): Promise<Trade[]> => {
  const response = await fetch("/api/trades");
  if (!response.ok) {
    throw new Error("Error al cargar los trades");
  }
  return response.json();
};

// Función para obtener pares de trading
const fetchTradingPairs = async (): Promise<TradingPair[]> => {
  const response = await fetch("/api/trading-pairs");
  if (!response.ok) {
    throw new Error("Error al cargar los pares de trading");
  }
  return response.json();
};

// Función para obtener cuentas
const fetchAccounts = async (): Promise<TradingAccount[]> => {
  const response = await fetch("/api/accounts");
  if (!response.ok) {
    throw new Error("Error al cargar las cuentas");
  }
  return response.json();
};

// Hook para obtener trades
export const useTrades = () => {
  return useQuery({
    queryKey: ['trades'],
    queryFn: fetchTrades,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener pares de trading
export const useTradingPairs = () => {
  return useQuery({
    queryKey: ['trading-pairs'],
    queryFn: fetchTradingPairs,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });
};

// Hook para obtener cuentas
export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });
};

// Hook para crear un trade
export const useCreateTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tradeData: CreateTradeData) => {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tradeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el trade');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Error al crear trade:', error);
    },
  });
};

// Hook para actualizar un trade
export const useUpdateTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...tradeData }: UpdateTradeData & { id: string }) => {
      const response = await fetch(`/api/trades/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tradeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el trade');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Error al actualizar trade:', error);
    },
  });
};

// Hook para eliminar un trade
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
    onSuccess: () => {
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Error al eliminar trade:', error);
    },
  });
};

// Hook para crear un par de trading
export const useCreateTradingPair = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('/api/trading-pairs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.toUpperCase() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el par de trading');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar la query de pares de trading
      queryClient.invalidateQueries({ queryKey: ['trading-pairs'] });
    },
    onError: (error) => {
      console.error('Error al crear par de trading:', error);
    },
  });
};

// Hook para eliminar un par de trading
export const useDeleteTradingPair = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/trading-pairs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar el par de trading');
      }

      return id;
    },
    onSuccess: () => {
      // Invalidar la query de pares de trading
      queryClient.invalidateQueries({ queryKey: ['trading-pairs'] });
    },
    onError: (error) => {
      console.error('Error al eliminar par de trading:', error);
    },
  });
}; 