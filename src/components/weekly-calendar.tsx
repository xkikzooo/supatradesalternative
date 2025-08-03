'use client';

import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Trade {
  id: string;
  pnl: number;
  result: string;
  date: string;
  tradingPair?: {
    name: string;
  };
}

export function WeeklyCalendar() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Lunes
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 }); // Domingo
  
  // Obtener todos los días de la semana actual
  const daysOfWeek = eachDayOfInterval({
    start: startOfCurrentWeek,
    end: endOfCurrentWeek,
  });

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/trades");
        if (!response.ok) {
          throw new Error("Error al cargar los trades");
        }
        const data = await response.json();
        setTrades(data || []);
      } catch (error) {
        console.error("Error al obtener trades:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  // Filtrar trades por día de la semana
  const getTradesForDay = (day: Date) => {
    return trades.filter(trade => 
      isSameDay(new Date(trade.date), day)
    );
  };

  // Obtener el color de la celda según el resultado de los trades
  const getCellColor = (trades: Trade[]) => {
    if (trades.length === 0) return 'bg-white/5 border-white/10';
    
    const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    
    if (totalPnL > 0) return 'bg-emerald-500/10 border-emerald-500/30 backdrop-blur-sm';
    if (totalPnL < 0) return 'bg-rose-500/10 border-rose-500/30 backdrop-blur-sm';
    return 'bg-amber-500/10 border-amber-500/30 backdrop-blur-sm';
  };

  // Formatear PnL
  const formatPnL = (pnl: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(pnl);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white/60">Cargando calendario...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-3">
      {/* Encabezados de días */}
      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => (
        <div key={`header-${i}`} className="text-center text-sm font-medium text-white/70 py-3">
          {day}
        </div>
      ))}
      
      {/* Celdas de días */}
      {daysOfWeek.map(day => {
        const dayTrades = getTradesForDay(day);
        const cellColor = getCellColor(dayTrades);
        const totalPnL = dayTrades.reduce((sum, trade) => sum + trade.pnl, 0);
        const isToday = isSameDay(day, today);
        
        return (
          <div 
            key={format(day, 'yyyy-MM-dd')}
            className={cn(
              "border rounded-xl p-3 min-h-[90px] transition-all duration-200 hover:scale-[1.02] backdrop-blur-sm",
              cellColor,
              isToday ? "border-blue-400/50 ring-2 ring-blue-400/30 shadow-lg" : "border-white/10",
              dayTrades.length > 0 ? "hover:shadow-xl" : ""
            )}
          >
            <div className="text-right text-xs font-medium text-white/60">
              {format(day, 'd', { locale: es })}
            </div>
            
            {dayTrades.length > 0 ? (
              <>
                <div className={cn(
                  "text-center mt-2 font-bold text-sm",
                  totalPnL > 0 ? "text-emerald-300" : 
                  totalPnL < 0 ? "text-rose-300" : "text-amber-300"
                )}>
                  {formatPnL(totalPnL)}
                </div>
                <div className="text-center text-xs text-white/50 mt-1">
                  {dayTrades.length} trade{dayTrades.length !== 1 ? 's' : ''}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[42px] text-xs text-white/40">
                Sin trades
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 