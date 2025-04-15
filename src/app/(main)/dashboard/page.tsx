'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Percent } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

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
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400">
          Vista general de tu rendimiento en trading
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Ganancia Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalPnL)}</div>
            <p className="text-xs text-gray-400">
              {calculatePercentageChange(stats.pnlThisMonth, stats.pnlLastMonth) > 0 ? '+' : ''}
              {calculatePercentageChange(stats.pnlThisMonth, stats.pnlLastMonth).toFixed(1)}% vs. mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Winrate</CardTitle>
            <Percent className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.winrate.toFixed(1)}%</div>
            <p className="text-xs text-gray-400">
              De {stats.winningTrades + stats.losingTrades} trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Trades Ganadores</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.winningTrades}</div>
            <p className="text-xs text-gray-400">
              {((stats.winningTrades / stats.totalTrades) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Trades Perdedores</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.losingTrades}</div>
            <p className="text-xs text-gray-400">
              {((stats.losingTrades / stats.totalTrades) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Breakeven</CardTitle>
            <Minus className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.breakEvenTrades}</div>
            <p className="text-xs text-gray-400">
              {((stats.breakEvenTrades / stats.totalTrades) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 