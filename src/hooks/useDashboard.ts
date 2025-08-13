import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Trade {
  id: string;
  pnl: number;
  result: 'WIN' | 'LOSS' | 'BREAKEVEN';
  date: string;
  tradingPair?: {
    name: string;
  };
  direction?: 'LONG' | 'SHORT';
}

interface DashboardStats {
  totalPnL: number;
  pnlThisMonth: number;
  pnlLastMonth: number;
  winrate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
}

interface AdvancedStats {
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  profitFactor: number;
  expectancy: number;
}

interface DashboardData {
  trades: Trade[];
  stats: DashboardStats;
  advancedStats: AdvancedStats;
  recentTrades: Trade[];
}

// Función para calcular estadísticas del dashboard
const calculateDashboardStats = (trades: Trade[]) => {
  if (!trades || trades.length === 0) {
    return {
      stats: {
        totalPnL: 0,
        pnlThisMonth: 0,
        pnlLastMonth: 0,
        winrate: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        breakEvenTrades: 0,
      },
      advancedStats: {
        sharpeRatio: 0,
        sortinoRatio: 0,
        maxDrawdown: 0,
        profitFactor: 0,
        expectancy: 0,
      },
      recentTrades: [],
    };
  }

  // Obtener fechas para filtrar trades por mes
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Filtrar trades por mes
  const tradesThisMonth = trades.filter(trade => 
    new Date(trade.date) >= firstDayOfMonth
  );
  const tradesLastMonth = trades.filter(trade => {
    const tradeDate = new Date(trade.date);
    return tradeDate >= firstDayOfLastMonth && tradeDate <= lastDayOfLastMonth;
  });

  // Calcular PnL por mes
  const pnlThisMonth = tradesThisMonth.reduce((sum, trade) => sum + trade.pnl, 0);
  const pnlLastMonth = tradesLastMonth.reduce((sum, trade) => sum + trade.pnl, 0);

  // Calcular totales por resultado
  const winningTrades = trades.filter(trade => trade.result === 'WIN').length;
  const losingTrades = trades.filter(trade => trade.result === 'LOSS').length;
  const breakEvenTrades = trades.filter(trade => trade.result === 'BREAKEVEN').length;
  const totalTrades = trades.length;

  // Calcular winrate (excluyendo breakeven)
  const tradesExcludingBreakeven = winningTrades + losingTrades;
  const winrate = tradesExcludingBreakeven > 0 
    ? (winningTrades / tradesExcludingBreakeven) * 100 
    : 0;

  // Calcular métricas financieras avanzadas (simplificadas por ahora)
  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0;
  
  const advancedStats = {
    sharpeRatio: 0, // TODO: Implementar cálculo real
    sortinoRatio: 0, // TODO: Implementar cálculo real
    maxDrawdown: 0, // TODO: Implementar cálculo real
    profitFactor: 0, // TODO: Implementar cálculo real
    expectancy: avgPnL,
  };

  return {
    stats: {
      totalPnL,
      pnlThisMonth,
      pnlLastMonth,
      winrate,
      totalTrades,
      winningTrades,
      losingTrades,
      breakEvenTrades,
    },
    advancedStats,
    recentTrades: trades.slice(0, 4),
  };
};

// Función para obtener datos del dashboard
const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await fetch('/api/trades');
  if (!response.ok) {
    throw new Error('Error al cargar los trades');
  }
  const trades: Trade[] = await response.json();
  
  const { stats, advancedStats, recentTrades } = calculateDashboardStats(trades);
  
  return {
    trades,
    stats,
    advancedStats,
    recentTrades,
  };
};

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
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
      // Invalidar todas las queries relacionadas con el dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.removeQueries({ queryKey: ['trade', id] });
    },
    onError: (error) => {
      console.error('Error al eliminar trade:', error);
    },
  });
}; 