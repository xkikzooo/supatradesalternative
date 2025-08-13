'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash, 
  Eye, 
  Check, 
  X,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Checkbox } from './checkbox';

interface Trade {
  id: string;
  date: string;
  tradingPair?: {
    id: string;
    name: string;
  };
  direction: 'LONG' | 'SHORT';
  result: 'WIN' | 'LOSS' | 'BREAKEVEN';
  pnl: number;
  account?: {
    id: string;
    name: string;
    broker: string;
  };
  bias?: string;
  psychology?: string;
  images?: string[];
}

interface TradesTableOptimizedProps {
  trades: Trade[];
  selectionMode: boolean;
  selectedTrades: string[];
  onSelectTrade: (tradeId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onEdit: (tradeId: string) => void;
  onDelete: (tradeId: string) => void;
  onView: (tradeId: string) => void;
  isLoading?: boolean;
}

export function TradesTableOptimized({
  trades,
  selectionMode,
  selectedTrades,
  onSelectTrade,
  onSelectAll,
  onEdit,
  onDelete,
  onView,
  isLoading = false
}: TradesTableOptimizedProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<keyof Trade>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const selectAllRef = useRef<HTMLButtonElement>(null);

  // Función para ordenar trades
  const sortedTrades = [...trades].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Manejo especial para fechas
    if (sortField === 'date') {
      aValue = new Date(a.date).getTime();
      bValue = new Date(b.date).getTime();
    }

    // Manejo especial para números
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Manejo para strings
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  const handleSort = (field: keyof Trade) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'WIN':
        return <TrendingUp className="h-4 w-4 text-emerald-400" />;
      case 'LOSS':
        return <TrendingDown className="h-4 w-4 text-rose-400" />;
      case 'BREAKEVEN':
        return <Minus className="h-4 w-4 text-amber-400" />;
      default:
        return null;
    }
  };

  const getResultTag = (result: string) => {
    const baseClasses = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium";
    
    switch (result) {
      case 'WIN':
        return (
          <span className={cn(baseClasses, "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30")}>
            {getResultIcon(result)}
            {result}
          </span>
        );
      case 'LOSS':
        return (
          <span className={cn(baseClasses, "bg-rose-500/20 text-rose-300 border border-rose-500/30")}>
            {getResultIcon(result)}
            {result}
          </span>
        );
      case 'BREAKEVEN':
        return (
          <span className={cn(baseClasses, "bg-amber-500/20 text-amber-300 border border-amber-500/30")}>
            {getResultIcon(result)}
            {result}
          </span>
        );
      default:
        return (
          <span className={cn(baseClasses, "bg-gray-500/20 text-gray-300 border border-gray-500/30")}>
            {result || 'N/A'}
          </span>
        );
    }
  };

  const getDirectionTag = (direction: string) => {
    const baseClasses = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium";
    
    switch (direction) {
      case 'LONG':
        return (
          <span className={cn(baseClasses, "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30")}>
            {direction}
          </span>
        );
      case 'SHORT':
        return (
          <span className={cn(baseClasses, "bg-rose-500/20 text-rose-300 border border-rose-500/30")}>
            {direction}
          </span>
        );
      default:
        return (
          <span className={cn(baseClasses, "bg-gray-500/20 text-gray-300 border border-gray-500/30")}>
            {direction || 'N/A'}
          </span>
        );
    }
  };

  const allSelected = trades.length > 0 && selectedTrades.length === trades.length;
  const someSelected = selectedTrades.length > 0 && selectedTrades.length < trades.length;

  // Actualizar el estado indeterminate del checkbox usando useEffect
  useEffect(() => {
    if (selectAllRef.current) {
      const checkbox = selectAllRef.current.querySelector('input[type="checkbox"]') as HTMLInputElement;
      if (checkbox) {
        checkbox.indeterminate = someSelected;
      }
    }
  }, [someSelected, selectedTrades.length, trades.length]);

  if (isLoading) {
    return (
      <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-white/10" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 border-t border-white/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/10 backdrop-blur-sm">
              {selectionMode && (
                <th className="h-12 px-4 text-left">
                  <Checkbox
                    ref={selectAllRef}
                    checked={allSelected}
                    onCheckedChange={onSelectAll}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </th>
              )}
              <th 
                className="h-12 px-4 text-left font-medium text-white/70 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-2">
                  Fecha
                  {sortField === 'date' && (
                    <span className="text-xs">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="h-12 px-4 text-left font-medium text-white/70 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('tradingPair')}
              >
                <div className="flex items-center gap-2">
                  Par
                  {sortField === 'tradingPair' && (
                    <span className="text-xs">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="h-12 px-4 text-left font-medium text-white/70 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('direction')}
              >
                <div className="flex items-center gap-2">
                  Dirección
                  {sortField === 'direction' && (
                    <span className="text-xs">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="h-12 px-4 text-left font-medium text-white/70 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('result')}
              >
                <div className="flex items-center gap-2">
                  Resultado
                  {sortField === 'result' && (
                    <span className="text-xs">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="h-12 px-4 text-right font-medium text-white/70 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('pnl')}
              >
                <div className="flex items-center justify-end gap-2">
                  PnL
                  {sortField === 'pnl' && (
                    <span className="text-xs">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="h-12 px-4 text-left font-medium text-white/70">
                Cuenta
              </th>
              <th className="h-12 px-4 text-center font-medium text-white/70">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {sortedTrades.map((trade) => (
              <tr 
                key={trade.id} 
                className={cn(
                  "hover:bg-white/10 transition-all duration-200 backdrop-blur-sm",
                  selectedTrades.includes(trade.id) && "bg-blue-500/10 border-l-2 border-l-blue-500"
                )}
              >
                {selectionMode && (
                  <td className="p-4">
                    <Checkbox
                      checked={selectedTrades.includes(trade.id)}
                      onCheckedChange={(checked) => onSelectTrade(trade.id, checked as boolean)}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                  </td>
                )}
                <td className="p-4 text-left align-middle text-sm text-white/80">
                  {format(new Date(trade.date), 'dd/MM/yyyy', { locale: es })}
                </td>
                <td className="p-4 text-left align-middle font-medium text-white">
                  {trade.tradingPair?.name || 'N/A'}
                </td>
                <td className="p-4 text-left align-middle">
                  {getDirectionTag(trade.direction)}
                </td>
                <td className="p-4 text-left align-middle">
                  {getResultTag(trade.result)}
                </td>
                <td className={cn(
                  "p-4 text-right align-middle font-bold",
                  trade.pnl > 0 ? "text-emerald-300" : 
                  trade.pnl < 0 ? "text-rose-300" : "text-amber-300"
                )}>
                  {formatCurrency(trade.pnl)}
                </td>
                <td className="p-4 text-left align-middle text-sm text-white/70">
                  {trade.account?.name || 'N/A'}
                  {trade.account?.broker && (
                    <div className="text-xs text-white/50">
                      {trade.account.broker}
                    </div>
                  )}
                </td>
                <td className="p-4 text-center align-middle">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/20">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white/10 backdrop-blur-xl border border-white/20">
                      <DropdownMenuItem onClick={() => onView(trade.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(trade.id)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(trade.id)}
                        className="text-red-400 focus:text-red-300 focus:bg-red-500/20"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {trades.length === 0 && (
        <div className="p-8 text-center text-white/60">
          No hay trades para mostrar
        </div>
      )}
    </div>
  );
} 