'use client';

import { useState, useEffect } from 'react';
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
}

interface TradeCalendarProps {
  trades: Trade[];
}

export function TradeCalendar({ trades }: TradeCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [monthlyPnL, setMonthlyPnL] = useState(0);
  const [weeklyPnLs, setWeeklyPnLs] = useState<{ [key: string]: number }>({});
  const [dailyPnLs, setDailyPnLs] = useState<{ [key: string]: number }>({});
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    calculatePnLs();
  }, [trades, currentMonth]);

  const calculatePnLs = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    // Calcular PnL mensual
    const monthlyTotal = trades
      .filter(trade => {
        const tradeDate = new Date(trade.date);
        return isSameMonth(tradeDate, currentMonth);
      })
      .reduce((sum, trade) => sum + trade.pnl, 0);

    setMonthlyPnL(monthlyTotal);

    // Calcular PnL diario
    const dailyTotals: { [key: string]: number } = {};
    trades.forEach(trade => {
      const tradeDate = new Date(trade.date);
      if (isSameMonth(tradeDate, currentMonth)) {
        const dateKey = format(tradeDate, 'yyyy-MM-dd');
        dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + trade.pnl;
      }
    });
    setDailyPnLs(dailyTotals);

    // Calcular PnL semanal
    const weeklyTotals: { [key: string]: number } = {};
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    days.forEach(day => {
      const weekStart = startOfWeek(day, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(day, { weekStartsOn: 1 });
      const weekKey = format(weekStart, 'yyyy-MM-dd');

      if (!weeklyTotals[weekKey]) {
        const weeklyTotal = trades
          .filter(trade => {
            const tradeDate = new Date(trade.date);
            return tradeDate >= weekStart && tradeDate <= weekEnd;
          })
          .reduce((sum, trade) => sum + trade.pnl, 0);

        weeklyTotals[weekKey] = weeklyTotal;
      }
    });

    setWeeklyPnLs(weeklyTotals);
  };

  const getTradesForDay = (day: Date) => {
    return trades.filter(trade => 
      isSameDay(new Date(trade.date), day)
    );
  };

  const formatPnL = (pnl: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(pnl);
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

      <div className="text-lg font-medium mb-4">
        PnL Mensual: <span className={cn(
          monthlyPnL > 0 ? "text-green-400" : monthlyPnL < 0 ? "text-red-400" : "text-gray-400"
        )}>{formatPnL(monthlyPnL)}</span>
      </div>

      <div className="grid grid-cols-8 gap-4">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom', 'Semana'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-400">
            {day}
          </div>
        ))}

        {eachWeekOfInterval({
          start: startOfMonth(currentMonth),
          end: endOfMonth(currentMonth)
        }).map((week) => {
          const weekStart = startOfWeek(week, { weekStartsOn: 1 });
          const weekKey = format(weekStart, 'yyyy-MM-dd');
          const weekPnL = weeklyPnLs[weekKey] || 0;
          const weekDays = eachDayOfInterval({
            start: weekStart,
            end: endOfWeek(week, { weekStartsOn: 1 })
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
                          dayPnL > 0 ? "bg-green-900/20" : dayPnL < 0 ? "bg-red-900/20" : "bg-gray-900/50",
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
                          {dayPnL !== 0 && (
                            <div className={cn(
                              "text-base font-semibold",
                              dayPnL > 0 ? "text-green-400" : "text-red-400"
                            )}>
                              {formatPnL(dayPnL)}
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
                weekPnL > 0 ? "bg-green-900/20" : weekPnL < 0 ? "bg-red-900/20" : "bg-gray-900/50"
              )}>
                <div className={cn(
                  "text-sm font-medium",
                  weekPnL > 0 ? "text-green-400" : "text-red-400"
                )}>
                  {formatPnL(weekPnL)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {trades.filter(trade => {
                    const tradeDate = new Date(trade.date);
                    return tradeDate >= weekStart && tradeDate <= endOfWeek(week, { weekStartsOn: 1 });
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