'use client';

import { cn } from "@/lib/utils";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useEffect } from "react";
import { Label } from "./label";

interface TradeFilterProps {
  value: string;
  onChange: (value: string) => void;
  onFilterChange?: (type: string, value: string) => void;
  tradingPairs?: { id: string; name: string }[];
  accounts?: { id: string; name: string }[];
}

export function TradeFilter({ 
  value, 
  onChange, 
  onFilterChange,
  tradingPairs = [],
  accounts = []
}: TradeFilterProps) {
  const [availableMonths, setAvailableMonths] = useState<{value: string, label: string}[]>([]);
  
  useEffect(() => {
    // Generar últimos 12 meses
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const monthDate = subMonths(today, i);
      const monthValue = `month_${format(monthDate, 'yyyy-MM')}`;
      const monthLabel = format(monthDate, 'MMMM yyyy', { locale: es });
      
      months.push({
        value: monthValue,
        label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)
      });
    }
    
    setAvailableMonths(months);
  }, []);

  return (
    <div className="flex flex-wrap gap-4 items-end p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
      <div>
        <Label htmlFor="date-filter" className="text-sm text-white/70 mb-2 block font-medium">Fecha</Label>
        <Select
          value={value.startsWith('month_') ? value : 'month'}
          onValueChange={(selectedValue) => {
            onChange(selectedValue);
          }}
        >
          <SelectTrigger 
            id="date-filter"
            className={cn(
              "px-4 py-2.5 h-auto text-sm font-medium rounded-xl transition-all duration-200 min-w-[160px]",
              "border border-white/20 bg-white/10 backdrop-blur-sm",
              "focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50",
              "hover:bg-white/15 hover:border-white/30",
              value.startsWith('month_') || value === 'month'
                ? "bg-white/15 text-white border-white/30"
                : "text-white/80 hover:text-white"
            )}
          >
            <SelectValue placeholder="Mes" />
          </SelectTrigger>
          <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
            <SelectItem value="month" className="text-white/80 hover:text-white hover:bg-white/10">Mes actual</SelectItem>
            {availableMonths.map((month) => (
              <SelectItem key={month.value} value={month.value} className="text-white/80 hover:text-white hover:bg-white/10">
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {onFilterChange && (
        <>
          <div>
            <Label htmlFor="result-filter" className="text-sm text-white/70 mb-2 block font-medium">Resultado</Label>
            <Select
              onValueChange={(value) => onFilterChange('result', value === 'all' ? '' : value)}
            >
              <SelectTrigger 
                id="result-filter"
                className="px-4 py-2.5 h-auto text-sm font-medium rounded-xl transition-all duration-200 min-w-[160px] border border-white/20 bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 hover:bg-white/15 hover:border-white/30 text-white/80 hover:text-white"
              >
                <SelectValue placeholder="Cualquier resultado" />
              </SelectTrigger>
              <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                <SelectItem value="all" className="text-white/80 hover:text-white hover:bg-white/10">Cualquier resultado</SelectItem>
                <SelectItem value="WIN" className="text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/20">Ganador</SelectItem>
                <SelectItem value="LOSS" className="text-rose-300 hover:text-rose-200 hover:bg-rose-500/20">Perdedor</SelectItem>
                <SelectItem value="BREAKEVEN" className="text-amber-300 hover:text-amber-200 hover:bg-amber-500/20">Break-even</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="direction-filter" className="text-sm text-white/70 mb-2 block font-medium">Dirección</Label>
            <Select
              onValueChange={(value) => onFilterChange('direction', value === 'all' ? '' : value)}
            >
              <SelectTrigger 
                id="direction-filter"
                className="px-4 py-2.5 h-auto text-sm font-medium rounded-xl transition-all duration-200 min-w-[160px] border border-white/20 bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 hover:bg-white/15 hover:border-white/30 text-white/80 hover:text-white"
              >
                <SelectValue placeholder="Cualquier dirección" />
              </SelectTrigger>
              <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                <SelectItem value="all" className="text-white/80 hover:text-white hover:bg-white/10">Cualquier dirección</SelectItem>
                <SelectItem value="LONG" className="text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/20">Long</SelectItem>
                <SelectItem value="SHORT" className="text-rose-300 hover:text-rose-200 hover:bg-rose-500/20">Short</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="pair-filter" className="text-sm text-white/70 mb-2 block font-medium">Par</Label>
            <Select
              onValueChange={(value) => onFilterChange('pair', value === 'all' ? '' : value)}
            >
              <SelectTrigger 
                id="pair-filter"
                className="px-4 py-2.5 h-auto text-sm font-medium rounded-xl transition-all duration-200 min-w-[160px] border border-white/20 bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 hover:bg-white/15 hover:border-white/30 text-white/80 hover:text-white"
              >
                <SelectValue placeholder="Cualquier par" />
              </SelectTrigger>
              <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                <SelectItem value="all" className="text-white/80 hover:text-white hover:bg-white/10">Cualquier par</SelectItem>
                {tradingPairs.map((pair) => (
                  <SelectItem key={pair.id} value={pair.id} className="text-white/80 hover:text-white hover:bg-white/10">
                    {pair.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="account-filter" className="text-sm text-white/70 mb-2 block font-medium">Cuenta</Label>
            <Select
              onValueChange={(value) => onFilterChange('account', value === 'all' ? '' : value)}
            >
              <SelectTrigger 
                id="account-filter"
                className="px-4 py-2.5 h-auto text-sm font-medium rounded-xl transition-all duration-200 min-w-[160px] border border-white/20 bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 hover:bg-white/15 hover:border-white/30 text-white/80 hover:text-white"
              >
                <SelectValue placeholder="Cualquier cuenta" />
              </SelectTrigger>
              <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                <SelectItem value="all" className="text-white/80 hover:text-white hover:bg-white/10">Cualquier cuenta</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id} className="text-white/80 hover:text-white hover:bg-white/10">
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bias-filter" className="text-sm text-white/70 mb-2 block font-medium">Bias</Label>
            <Select
              onValueChange={(value) => onFilterChange('bias', value === 'all' ? '' : value)}
            >
              <SelectTrigger 
                id="bias-filter"
                className="px-4 py-2.5 h-auto text-sm font-medium rounded-xl transition-all duration-200 min-w-[160px] border border-white/20 bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 hover:bg-white/15 hover:border-white/30 text-white/80 hover:text-white"
              >
                <SelectValue placeholder="Cualquier bias" />
              </SelectTrigger>
              <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                <SelectItem value="all" className="text-white/80 hover:text-white hover:bg-white/10">Cualquier bias</SelectItem>
                <SelectItem value="BULLISH" className="text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/20">Alcista</SelectItem>
                <SelectItem value="BEARISH" className="text-rose-300 hover:text-rose-200 hover:bg-rose-500/20">Bajista</SelectItem>
                <SelectItem value="NEUTRAL" className="text-amber-300 hover:text-amber-200 hover:bg-amber-500/20">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
} 