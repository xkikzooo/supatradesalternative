'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, eachWeekOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Trade {
  id: string;
  pnl: number;
  date: string;
  tradingPair: {
    name: string;
  };
  result: string;
  account?: {
    name: string;
    broker: string;
    type: string;
    initialBalance?: number;
  };
  pnlPercentage?: number;
}

interface TradeCalendarProps {
  trades: Trade[];
}

export function TradeCalendar({ trades }: TradeCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [displayMode, setDisplayMode] = useState<'money' | 'percentage'>('money');
  const [monthlyPnL, setMonthlyPnL] = useState(0);
  const [weeklyPnLs, setWeeklyPnLs] = useState<{ [key: string]: number }>({});
  const [dailyPnLs, setDailyPnLs] = useState<{ [key: string]: number }>({});
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const calculatePnLs = useCallback(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    // Procesar porcentajes si es necesario
    const tradesWithPercentage = trades.map(trade => {
      let pnlPercentage = 0;
      if (trade.account?.initialBalance) {
        pnlPercentage = (trade.pnl / trade.account.initialBalance) * 100;
      }
      return {
        ...trade,
        pnlPercentage
      };
    });

    // Calcular PnL mensual
    const monthlyTotal = tradesWithPercentage
      .filter(trade => {
        const tradeDate = new Date(trade.date);
        return isSameMonth(tradeDate, currentMonth);
      })
      .reduce((sum, trade) => sum + trade.pnl, 0);

    setMonthlyPnL(monthlyTotal);

    // Calcular PnL diario para todos los días visibles en el calendario
    const dailyTotals: { [key: string]: number } = {};
    
    // Obtener el primer día y el último día visibles en el calendario
    const firstWeekStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const lastWeekEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    // Procesar todos los trades que podrían estar en el rango visible
    tradesWithPercentage.forEach(trade => {
      const tradeDate = new Date(trade.date);
      if (tradeDate >= firstWeekStart && tradeDate <= lastWeekEnd) {
        const dateKey = format(tradeDate, 'yyyy-MM-dd');
        const value = displayMode === 'money' ? trade.pnl : trade.pnlPercentage || 0;
        dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + value;
      }
    });
    
    setDailyPnLs(dailyTotals);

    // Calcular PnL semanal
    const weeklyTotals: { [key: string]: number } = {};
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    days.forEach(day => {
      const weekStart = startOfWeek(day, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(day, { weekStartsOn: 0 });
      const weekKey = format(weekStart, 'yyyy-MM-dd');

      if (!weeklyTotals[weekKey]) {
        const weeklyTotal = tradesWithPercentage
          .filter(trade => {
            const tradeDate = new Date(trade.date);
            return tradeDate >= weekStart && tradeDate <= weekEnd;
          })
          .reduce((sum, trade) => {
            const value = displayMode === 'money' ? trade.pnl : trade.pnlPercentage || 0;
            return sum + value;
          }, 0);

        weeklyTotals[weekKey] = weeklyTotal;
      }
    });

    setWeeklyPnLs(weeklyTotals);
  }, [trades, currentMonth, displayMode]);

  useEffect(() => {
    calculatePnLs();
  }, [calculatePnLs]);

  const getTradesForDay = (day: Date) => {
    return trades.filter(trade => 
      isSameDay(new Date(trade.date), day)
    );
  };

  const formatPnL = (pnl: number) => {
    if (displayMode === 'money') {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(pnl);
    } else {
      return new Intl.NumberFormat('es-ES', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(pnl / 100);
    }
  };

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(0)}M`;
    }
    if (balance >= 1000) {
      return `${(balance / 1000).toFixed(0)}K`;
    }
    return balance.toString();
  };

  const previousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          {format(currentMonth, 'MMMM yyyy', { locale: es }).replace(/^\w/, c => c.toUpperCase())}
        </h2>
        <div className="flex gap-4 items-center">
          <div className="flex border border-gray-700 rounded-md overflow-hidden">
            <button
              onClick={() => setDisplayMode('money')}
              className={cn(
                "px-3 py-1.5 text-sm",
                displayMode === 'money' 
                  ? "bg-gray-700 text-white" 
                  : "bg-transparent text-gray-400 hover:bg-gray-800"
              )}
            >
              Dinero
            </button>
            <button
              onClick={() => setDisplayMode('percentage')}
              className={cn(
                "px-3 py-1.5 text-sm",
                displayMode === 'percentage' 
                  ? "bg-gray-700 text-white" 
                  : "bg-transparent text-gray-400 hover:bg-gray-800"
              )}
            >
              Porcentaje
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-800 rounded-md transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-800 rounded-md transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="text-lg font-medium mb-4">
        PnL Mensual: <span className={cn(
          monthlyPnL > 0 ? "text-green-400" : 
          monthlyPnL < 0 ? "text-red-400" : 
          trades.filter(trade => isSameMonth(new Date(trade.date), currentMonth)).length > 0 ? "text-yellow-400" : "text-gray-400"
        )}>
          {monthlyPnL !== 0 ? formatPnL(monthlyPnL) : 
           trades.filter(trade => isSameMonth(new Date(trade.date), currentMonth)).length > 0 ? "Breakeven" : "$0"}
        </span>
      </div>

      <div className="grid grid-cols-8 gap-4">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Semana'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-400">
            {day}
          </div>
        ))}

        {eachWeekOfInterval({
          start: startOfMonth(currentMonth),
          end: endOfMonth(currentMonth)
        }).map((week) => {
          const weekStart = startOfWeek(week, { weekStartsOn: 0 });
          const weekKey = format(weekStart, 'yyyy-MM-dd');
          const weekPnL = weeklyPnLs[weekKey] || 0;
          const weekDays = eachDayOfInterval({
            start: weekStart,
            end: endOfWeek(week, { weekStartsOn: 0 })
          });

          return (
            <React.Fragment key={weekKey}>
              {weekDays.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayPnL = dailyPnLs[dateKey] || 0;
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());
                const dayTrades = getTradesForDay(day);
                const tradesCount = dayTrades.length;

                return (
                  <Popover key={day.toString()}>
                    <PopoverTrigger asChild>
                      <div
                        className={cn(
                          "min-h-[100px] p-3 border rounded-lg relative cursor-pointer",
                          isCurrentMonth ? "border-gray-800" : "border-gray-800/50",
                          "hover:bg-gray-800/50 transition-colors",
                          dayPnL > 0 ? "bg-green-900/20" : 
                          dayPnL < 0 ? "bg-red-900/20" : 
                          tradesCount > 0 && isCurrentMonth ? "bg-yellow-900/20" : "bg-gray-900/50",
                          !isCurrentMonth && "opacity-50",
                          isToday && "ring-[1px] ring-white/30 ring-offset-2 ring-offset-black shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300"
                        )}
                      >
                        <div className="absolute top-2 left-2">
                          <span className={cn(
                            "text-sm font-medium",
                            isToday ? "text-white" : "text-gray-400"
                          )}>{format(day, 'd')}</span>
                        </div>
                        <div className="h-full flex flex-col items-center justify-center">
                          {dayPnL !== 0 ? (
                            <div className={cn(
                              "text-base font-semibold",
                              dayPnL > 0 ? "text-green-400" : "text-red-400"
                            )}>
                              {formatPnL(dayPnL)}
                            </div>
                          ) : tradesCount > 0 && isCurrentMonth && (
                            <div className="text-base font-semibold text-yellow-400">
                              Breakeven
                            </div>
                          )}
                        </div>
                        {tradesCount > 0 && (
                          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                            {tradesCount} {tradesCount === 1 ? 'trade' : 'trades'}
                          </div>
                        )}
                      </div>
                    </PopoverTrigger>
                    {tradesCount > 0 && (
                      <PopoverContent className="w-[350px] p-4">
                        <div className="space-y-2">
                          {dayTrades.map(trade => (
                            <div
                              key={trade.id}
                              className="p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{trade.tradingPair.name}</span>
                                  <span className={cn(
                                    "text-sm font-medium",
                                    trade.pnl > 0 ? "text-green-400" : "text-red-400"
                                  )}>
                                    {formatPnL(trade.pnl)}
                                  </span>
                                </div>
                                {trade.account && (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-500/20 text-blue-300">
                                      {trade.account.broker}
                                    </span>
                                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-purple-500/20 text-purple-300">
                                      {trade.account.type}
                                    </span>
                                    {trade.account.initialBalance && (
                                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-green-500/20 text-green-300">
                                        {formatBalance(trade.account.initialBalance)}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    )}
                  </Popover>
                );
              })}
              <div className={cn(
                "min-h-[100px] p-3 border border-gray-800 rounded-lg flex flex-col justify-center items-center",
                weekPnL > 0 ? "bg-green-900/20" : 
                weekPnL < 0 ? "bg-red-900/20" : 
                trades.filter(trade => {
                  const tradeDate = new Date(trade.date);
                  return tradeDate >= weekStart && tradeDate <= endOfWeek(week, { weekStartsOn: 0 }) && 
                         isSameMonth(tradeDate, currentMonth);
                }).length > 0 ? "bg-yellow-900/20" : "bg-gray-900/50"
              )}>
                {weekPnL !== 0 ? (
                  <div className={cn(
                    "text-sm font-medium",
                    weekPnL > 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {formatPnL(weekPnL)}
                  </div>
                ) : trades.filter(trade => {
                  const tradeDate = new Date(trade.date);
                  return tradeDate >= weekStart && tradeDate <= endOfWeek(week, { weekStartsOn: 0 }) && 
                         isSameMonth(tradeDate, currentMonth);
                }).length > 0 && (
                  <div className="text-sm font-medium text-yellow-400">
                    Breakeven
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  {trades.filter(trade => {
                    const tradeDate = new Date(trade.date);
                    return tradeDate >= weekStart && tradeDate <= endOfWeek(week, { weekStartsOn: 0 });
                  }).length} trades
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
} 