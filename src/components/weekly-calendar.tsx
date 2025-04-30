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
    if (trades.length === 0) return '';
    
    const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    
    if (totalPnL > 0) return 'bg-green-500/10 border-green-500/20';
    if (totalPnL < 0) return 'bg-red-500/10 border-red-500/20';
    return 'bg-yellow-500/10 border-yellow-500/20';
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
    return <div className="text-center py-4">Cargando calendario...</div>;
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {/* Encabezados de días */}
      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => (
        <div key={`header-${i}`} className="text-center text-sm font-medium text-gray-400 py-2">
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
              "border rounded-md p-2 min-h-[80px] transition-colors",
              cellColor,
              isToday ? "border-blue-500 ring-1 ring-blue-500/30" : "border-gray-800",
            )}
          >
            <div className="text-right text-xs font-medium text-gray-400">
              {format(day, 'd', { locale: es })}
            </div>
            
            {dayTrades.length > 0 ? (
              <>
                <div className={cn(
                  "text-center mt-2 font-medium",
                  totalPnL > 0 ? "text-green-400" : 
                  totalPnL < 0 ? "text-red-400" : "text-yellow-400"
                )}>
                  {formatPnL(totalPnL)}
                </div>
                <div className="text-center text-xs text-gray-400 mt-1">
                  {dayTrades.length} trade{dayTrades.length !== 1 ? 's' : ''}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[42px] text-xs text-gray-500">
                Sin trades
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 