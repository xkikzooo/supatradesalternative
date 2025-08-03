'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Edit, TrendingUp, TrendingDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, eachWeekOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from './button';
import { useRouter } from 'next/navigation';

interface Trade {
  id: string;
  pnl: number;
  date: string;
  tradingPair: {
    name: string;
  };
  result: string;
  direction: 'LONG' | 'SHORT';
  bias?: string;
  psychology?: string;
  images?: string[];
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
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [displayMode, setDisplayMode] = useState<'money' | 'percentage'>('money');
  const [monthlyPnL, setMonthlyPnL] = useState(0);
  const [weeklyPnLs, setWeeklyPnLs] = useState<{ [key: string]: number }>({});
  const [dailyPnLs, setDailyPnLs] = useState<{ [key: string]: number }>({});
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

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

  const getResultColor = (result: string) => {
    switch (result.toUpperCase()) {
      case 'WIN':
        return 'text-emerald-300';
      case 'LOSS':
        return 'text-rose-300';
      case 'BREAKEVEN':
        return 'text-amber-300';
      default:
        return 'text-white/60';
    }
  };

  const getResultText = (result: string) => {
    switch (result.toUpperCase()) {
      case 'WIN':
        return 'Profit';
      case 'LOSS':
        return 'Loss';
      case 'BREAKEVEN':
        return 'Breakeven';
      default:
        return 'Unknown';
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'LONG' ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const handleTradeClick = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsTradeModalOpen(true);
  };

  const previousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronLeft className="h-5 w-5 text-white/70" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronRight className="h-5 w-5 text-white/70" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDisplayMode('money')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200",
              displayMode === 'money' 
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" 
                : "bg-white/10 text-white/60 border border-white/20 hover:bg-white/15 hover:text-white/80"
            )}
          >
            Dinero
          </button>
          <button
            onClick={() => setDisplayMode('percentage')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200",
              displayMode === 'percentage' 
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" 
                : "bg-white/10 text-white/60 border border-white/20 hover:bg-white/15 hover:text-white/80"
            )}
          >
            Porcentaje
          </button>
        </div>
      </div>

      <div className="text-lg font-medium mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        PnL Mensual: <span className={cn(
          monthlyPnL > 0 ? "text-emerald-300" : 
          monthlyPnL < 0 ? "text-rose-300" : 
          trades.filter(trade => isSameMonth(new Date(trade.date), currentMonth)).length > 0 ? "text-amber-300" : "text-white/60"
        )}>
          {monthlyPnL !== 0 ? formatPnL(monthlyPnL) : 
           trades.filter(trade => isSameMonth(new Date(trade.date), currentMonth)).length > 0 ? "Breakeven" : "$0"}
        </span>
      </div>

      <div className="grid grid-cols-8 gap-4">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Semana'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-white/70">
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
                      <button
                        type="button"
                        className={cn(
                          "min-h-[100px] p-3 border rounded-xl relative cursor-pointer w-full text-left backdrop-blur-sm transition-all duration-200",
                          isCurrentMonth ? "border-white/20" : "border-white/10",
                          "hover:bg-white/10 hover:border-white/30 hover:scale-[1.02]",
                          dayPnL > 0 ? "bg-emerald-500/10 border-emerald-500/30" : 
                          dayPnL < 0 ? "bg-rose-500/10 border-rose-500/30" : 
                          tradesCount > 0 && isCurrentMonth ? "bg-amber-500/10 border-amber-500/30" : "bg-white/5",
                          !isCurrentMonth && "opacity-50",
                          isToday && "ring-2 ring-blue-400/50 ring-offset-2 ring-offset-black/50 shadow-lg"
                        )}
                      >
                        <div className="absolute top-2 left-2">
                          <span className={cn(
                            "text-sm font-medium",
                            isToday ? "text-white" : "text-white/60"
                          )}>{format(day, 'd')}</span>
                        </div>
                        <div className="h-full flex flex-col items-center justify-center">
                          {dayPnL !== 0 ? (
                            <div className={cn(
                              "text-base font-semibold",
                              dayPnL > 0 ? "text-emerald-300" : "text-rose-300"
                            )}>
                              {formatPnL(dayPnL)}
                            </div>
                          ) : tradesCount > 0 && isCurrentMonth && (
                            <div className="text-base font-semibold text-amber-300">
                              Breakeven
                            </div>
                          )}
                        </div>
                        {tradesCount > 0 && (
                          <div className="absolute bottom-2 right-2 text-xs text-white/50">
                            {tradesCount} {tradesCount === 1 ? 'trade' : 'trades'}
                          </div>
                        )}
                      </button>
                    </PopoverTrigger>
                    {tradesCount > 0 && (
                      <PopoverContent 
                        className="w-[350px] p-4 z-50 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl"
                        align="center"
                        sideOffset={5}
                      >
                        <div className="space-y-2">
                          {dayTrades.map(trade => (
                            <button
                              key={trade.id}
                              onClick={() => handleTradeClick(trade)}
                              className="w-full p-3 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-200 border border-white/10 text-left"
                            >
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-white">{trade.tradingPair.name}</span>
                                  <span className={cn(
                                    "text-sm font-medium",
                                    trade.pnl > 0 ? "text-emerald-300" : "text-rose-300"
                                  )}>
                                    {formatPnL(trade.pnl)}
                                  </span>
                                </div>
                                {trade.account && (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="px-2 py-1 text-xs font-medium rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-sm">
                                      {trade.account.broker}
                                    </span>
                                    <span className="px-2 py-1 text-xs font-medium rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-sm">
                                      {trade.account.type}
                                    </span>
                                    {trade.account.initialBalance && (
                                      <span className="px-2 py-1 text-xs font-medium rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                                        {formatBalance(trade.account.initialBalance)}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    )}
                  </Popover>
                );
              })}
              <button
                type="button"
                className={cn(
                  "min-h-[100px] p-3 border rounded-xl flex flex-col justify-center items-center w-full backdrop-blur-sm transition-all duration-200",
                  "border-white/20 hover:bg-white/10 hover:border-white/30",
                  weekPnL > 0 ? "bg-emerald-500/10 border-emerald-500/30" : 
                  weekPnL < 0 ? "bg-rose-500/10 border-rose-500/30" : 
                  trades.filter(trade => {
                    const tradeDate = new Date(trade.date);
                    return tradeDate >= weekStart && tradeDate <= endOfWeek(week, { weekStartsOn: 0 }) && 
                           isSameMonth(tradeDate, currentMonth);
                  }).length > 0 ? "bg-amber-500/10 border-amber-500/30" : "bg-white/5"
                )}
              >
                {weekPnL !== 0 ? (
                  <div className={cn(
                    "text-sm font-medium",
                    weekPnL > 0 ? "text-emerald-300" : "text-rose-300"
                  )}>
                    {formatPnL(weekPnL)}
                  </div>
                ) : trades.filter(trade => {
                  const tradeDate = new Date(trade.date);
                  return tradeDate >= weekStart && tradeDate <= endOfWeek(week, { weekStartsOn: 0 }) && 
                         isSameMonth(tradeDate, currentMonth);
                }).length > 0 && (
                  <div className="text-sm font-medium text-amber-300">
                    Breakeven
                  </div>
                )}
                <div className="text-xs text-white/50 mt-1">
                  {trades.filter(trade => {
                    const tradeDate = new Date(trade.date);
                    return tradeDate >= weekStart && tradeDate <= endOfWeek(week, { weekStartsOn: 0 });
                  }).length} trades
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Modal de resumen del trade */}
      <Dialog open={isTradeModalOpen} onOpenChange={setIsTradeModalOpen}>
        <DialogContent className="bg-white/10 backdrop-blur-xl text-white border border-white/20 shadow-2xl rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center gap-3">
            <DialogTitle className="text-xl font-semibold text-white">
              Resumen del Trade
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsTradeModalOpen(false)}
              className="ml-auto text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>
          
          {selectedTrade && (
            <div className="space-y-6">
              {/* Resultado */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Resultado</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className={cn("text-2xl font-bold", getResultColor(selectedTrade.result))}>
                      {formatPnL(selectedTrade.pnl)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        selectedTrade.result === 'WIN' ? 'bg-emerald-400' : 
                        selectedTrade.result === 'LOSS' ? 'bg-rose-400' : 'bg-amber-400'
                      )} />
                      <span className={cn("text-sm font-medium", getResultColor(selectedTrade.result))}>
                        {getResultText(selectedTrade.result)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-white/60">Par de Trading</div>
                    <div className="text-lg font-semibold text-white">{selectedTrade.tradingPair.name}</div>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Información Adicional</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-white/60">Dirección</div>
                    <div className="flex items-center gap-2">
                      {getDirectionIcon(selectedTrade.direction)}
                      <span className="text-white font-medium">{selectedTrade.direction}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-white/60">Fecha</div>
                    <div className="text-white font-medium">
                      {format(new Date(selectedTrade.date), 'dd/MM/yyyy', { locale: es })}
                    </div>
                  </div>
                  {selectedTrade.account && (
                    <div className="space-y-2">
                      <div className="text-sm text-white/60">Cuenta</div>
                      <div className="text-white font-medium">{selectedTrade.account.name}</div>
                    </div>
                  )}
                  {selectedTrade.bias && (
                    <div className="space-y-2">
                      <div className="text-sm text-white/60">Bias</div>
                      <div className="text-white font-medium">{selectedTrade.bias}</div>
                    </div>
                  )}
                </div>
                
                {selectedTrade.psychology && (
                  <div className="space-y-2">
                    <div className="text-sm text-white/60">Psicología</div>
                    <div className="text-white">{selectedTrade.psychology}</div>
                  </div>
                )}
              </div>

              {/* Botón de editar */}
              <div className="flex justify-end pt-4 border-t border-white/10">
                <Button
                  onClick={() => {
                    setIsTradeModalOpen(false);
                    router.push(`/trades/edit/${selectedTrade.id}`);
                  }}
                  className="bg-blue-500/80 hover:bg-blue-500 text-white flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar Trade
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 