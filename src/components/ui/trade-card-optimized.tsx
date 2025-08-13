'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash, 
  Eye, 
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  DollarSign,
  Target,
  Brain
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

interface TradeCardOptimizedProps {
  trade: Trade;
  selectionMode: boolean;
  isSelected: boolean;
  onSelectChange: (tradeId: string, selected: boolean) => void;
  onEdit: (tradeId: string) => void;
  onDelete: (tradeId: string) => void;
  onView: (tradeId: string) => void;
}

export function TradeCardOptimized({
  trade,
  selectionMode,
  isSelected,
  onSelectChange,
  onEdit,
  onDelete,
  onView
}: TradeCardOptimizedProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'WIN':
        return <TrendingUp className="h-5 w-5 text-emerald-400" />;
      case 'LOSS':
        return <TrendingDown className="h-5 w-5 text-rose-400" />;
      case 'BREAKEVEN':
        return <Minus className="h-5 w-5 text-amber-400" />;
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

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className={cn(
        "group relative bg-white/5 rounded-xl border border-white/10 p-6 transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/5",
        isSelected && "ring-2 ring-blue-500/50 bg-blue-500/10 border-blue-500/30"
      )}
    >
      {/* Checkbox de selección */}
      {selectionMode && (
        <div className="absolute top-4 right-4 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectChange(trade.id, checked as boolean)}
            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
        </div>
      )}

      {/* Imagen del trade */}
      {trade.images && trade.images.length > 0 && !imageError ? (
        <div className="relative mb-4 aspect-video rounded-lg overflow-hidden bg-white/5">
          <img
            src={trade.images[0]}
            alt={`Trade ${trade.tradingPair?.name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      ) : (
        <div className="mb-4 aspect-video rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
          <div className="text-center text-white/40">
            <Target className="h-8 w-8 mx-auto mb-2" />
            <span className="text-sm">Sin imagen</span>
          </div>
        </div>
      )}

      {/* Header con par y fecha */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {trade.tradingPair?.name || 'N/A'}
          </h3>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Calendar className="h-4 w-4" />
            {format(new Date(trade.date), 'dd/MM/yyyy', { locale: es })}
          </div>
        </div>
        
        {/* Dropdown de acciones */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
            >
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
      </div>

      {/* Tags de dirección y resultado */}
      <div className="flex flex-wrap gap-2 mb-4">
        {getDirectionTag(trade.direction)}
        {getResultTag(trade.result)}
      </div>

      {/* PnL */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">PnL</span>
          <span className={cn(
            "text-lg font-bold",
            trade.pnl > 0 ? "text-emerald-300" : 
            trade.pnl < 0 ? "text-rose-300" : "text-amber-300"
          )}>
            {formatCurrency(trade.pnl)}
          </span>
        </div>
      </div>

      {/* Información adicional */}
      <div className="space-y-2 text-sm">
        {trade.account && (
          <div className="flex items-center gap-2 text-white/70">
            <DollarSign className="h-4 w-4" />
            <span>{trade.account.name}</span>
            {trade.account.broker && (
              <span className="text-white/50 text-xs">({trade.account.broker})</span>
            )}
          </div>
        )}
        
        {trade.bias && (
          <div className="flex items-center gap-2 text-white/70">
            <Target className="h-4 w-4" />
            <span className="truncate">{trade.bias}</span>
          </div>
        )}
        
        {trade.psychology && (
          <div className="flex items-center gap-2 text-white/70">
            <Brain className="h-4 w-4" />
            <span className="truncate">{trade.psychology}</span>
          </div>
        )}
      </div>

      {/* Overlay de hover para acciones rápidas */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
    </div>
  );
} 