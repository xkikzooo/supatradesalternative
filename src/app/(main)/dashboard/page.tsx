'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Percent, ChevronRight, DollarSign, Target, BarChart3 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { WeeklyCalendar } from "@/components/weekly-calendar";
import { AccountPreview } from "@/components/account-preview";
import { RecentTradesTable } from "@/components/recent-trades-table";
import { calculateMaxDrawdown, calculateSharpeRatio, calculateSortinoRatio, calculateProfitFactor, calculateExpectancy } from "@/lib/financial-metrics";
import { TradingGoals } from "@/components/trading-goals";
import { cn } from "@/lib/utils";

interface Trade {
  id: string;
  pnl: number;
  result: 'WIN' | 'LOSS' | 'BREAKEVEN';
  date: string;
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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalPnL: 0,
    pnlThisMonth: 0,
    pnlLastMonth: 0,
    winrate: 0,
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    breakEvenTrades: 0,
  });
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [advancedStats, setAdvancedStats] = useState({
    sharpeRatio: 0,
    sortinoRatio: 0,
    maxDrawdown: 0,
    profitFactor: 0,
    expectancy: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchAndCalculateStats = async () => {
      try {
        const response = await fetch('/api/trades');
        if (!response.ok) {
          throw new Error('Error al cargar los trades');
        }
        const trades: Trade[] = await response.json();
        
        // Guardar los trades recientes
        setRecentTrades(trades.slice(0, 4));
        
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

        // Calcular métricas financieras avanzadas
        setAdvancedStats({
          sharpeRatio: calculateSharpeRatio(trades),
          sortinoRatio: calculateSortinoRatio(trades),
          maxDrawdown: calculateMaxDrawdown(trades),
          profitFactor: calculateProfitFactor(trades),
          expectancy: calculateExpectancy(trades)
        });

        setStats({
          totalPnL: trades.reduce((sum, trade) => {
            // Si el trade es una pérdida, el PnL ya viene negativo
            return sum + trade.pnl;
          }, 0),
          pnlThisMonth,
          pnlLastMonth,
          winrate,
          totalTrades,
          winningTrades,
          losingTrades,
          breakEvenTrades,
        });
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchAndCalculateStats();
  }, []);

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white/60 text-lg">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/70">
          Vista general de tu rendimiento en trading
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 aspect-square">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-white/70">Ganancia Total</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className={cn(
              "text-lg font-bold",
              stats.totalPnL > 0 ? "text-emerald-300" : "text-rose-300"
            )}>
              {formatCurrency(stats.totalPnL)}
            </div>
            <p className="text-xs text-white/60 mt-1">
              {stats.totalTrades} trades
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 aspect-square">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-white/70">Winrate</CardTitle>
            <Target className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-bold text-white">{stats.winrate.toFixed(1)}%</div>
            <p className="text-xs text-white/60 mt-1">
              {stats.winningTrades + stats.losingTrades} trades
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 aspect-square">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-white/70">Factor de beneficio</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-bold text-white">{advancedStats.profitFactor.toFixed(2)}</div>
            <p className="text-xs text-white/60 mt-1">Ganancia/pérdida</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 aspect-square">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-white/70">Expectativa</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className={cn(
              "text-lg font-bold",
              advancedStats.expectancy > 0 ? "text-emerald-300" : "text-rose-300"
            )}>
              ${advancedStats.expectancy.toFixed(2)}
            </div>
            <p className="text-xs text-white/60 mt-1">Por trade</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 aspect-square">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-white/70">Trades Ganadores</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-bold text-emerald-300">{stats.winningTrades}</div>
            <p className="text-xs text-white/60 mt-1">
              {((stats.winningTrades / stats.totalTrades) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 aspect-square">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-white/70">Trades Perdedores</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-bold text-rose-300">{stats.losingTrades}</div>
            <p className="text-xs text-white/60 mt-1">
              {((stats.losingTrades / stats.totalTrades) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 aspect-square">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-white/70">Breakeven</CardTitle>
            <Minus className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-bold text-amber-300">{stats.breakEvenTrades}</div>
            <p className="text-xs text-white/60 mt-1">
              {((stats.breakEvenTrades / stats.totalTrades) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendario Semanal */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl font-semibold text-white">Semana Actual</CardTitle>
          <Button 
            variant="ghost" 
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2 p-2 hover:bg-white/10 rounded-xl transition-all duration-200"
            onClick={() => router.push('/calendar')}
          >
            Ver calendario completo <ChevronRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <WeeklyCalendar />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Últimos Trades */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-xl font-semibold text-white">Últimos Trades</CardTitle>
            <Button 
              variant="ghost" 
              className="text-blue-400 hover:text-blue-300 flex items-center gap-2 p-2 hover:bg-white/10 rounded-xl transition-all duration-200"
              onClick={() => router.push('/trades')}
            >
              Ver todos <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <RecentTradesTable trades={recentTrades} />
          </CardContent>
        </Card>

        {/* Cuentas */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-xl font-semibold text-white">Mis Cuentas</CardTitle>
            <Button 
              variant="ghost" 
              className="text-blue-400 hover:text-blue-300 flex items-center gap-2 p-2 hover:bg-white/10 rounded-xl transition-all duration-200"
              onClick={() => router.push('/accounts')}
            >
              Ver todas <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <AccountPreview />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 