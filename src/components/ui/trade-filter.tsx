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
    <div className="flex flex-wrap gap-3 items-end">
      <div>
        <Label htmlFor="date-filter" className="text-sm text-gray-400 mb-1 block">Fecha</Label>
        <Select
          value={value.startsWith('month_') ? value : 'month'}
          onValueChange={(selectedValue) => {
            onChange(selectedValue);
          }}
        >
          <SelectTrigger 
            id="date-filter"
            className={cn(
              "px-3 py-1.5 h-auto text-sm font-medium rounded-md transition-colors min-w-[150px]",
              "border border-gray-800",
              "focus:outline-none focus:ring-0",
              value.startsWith('month_') || value === 'month'
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/70"
            )}
          >
            <SelectValue placeholder="Mes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Mes actual</SelectItem>
            {availableMonths.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {onFilterChange && (
        <>
          <div>
            <Label htmlFor="result-filter" className="text-sm text-gray-400 mb-1 block">Resultado</Label>
            <Select
              onValueChange={(value) => onFilterChange('result', value === 'all' ? '' : value)}
            >
              <SelectTrigger 
                id="result-filter"
                className="px-3 py-1.5 h-auto text-sm font-medium rounded-md transition-colors min-w-[150px] border border-gray-800 focus:outline-none focus:ring-0"
              >
                <SelectValue placeholder="Cualquier resultado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquier resultado</SelectItem>
                <SelectItem value="WIN">Ganador</SelectItem>
                <SelectItem value="LOSS">Perdedor</SelectItem>
                <SelectItem value="BREAKEVEN">Break-even</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="direction-filter" className="text-sm text-gray-400 mb-1 block">Dirección</Label>
            <Select
              onValueChange={(value) => onFilterChange('direction', value === 'all' ? '' : value)}
            >
              <SelectTrigger 
                id="direction-filter"
                className="px-3 py-1.5 h-auto text-sm font-medium rounded-md transition-colors min-w-[150px] border border-gray-800 focus:outline-none focus:ring-0"
              >
                <SelectValue placeholder="Cualquier dirección" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquier dirección</SelectItem>
                <SelectItem value="LONG">Long</SelectItem>
                <SelectItem value="SHORT">Short</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="pair-filter" className="text-sm text-gray-400 mb-1 block">Par</Label>
            <Select
              onValueChange={(value) => onFilterChange('pair', value === 'all' ? '' : value)}
            >
              <SelectTrigger 
                id="pair-filter"
                className="px-3 py-1.5 h-auto text-sm font-medium rounded-md transition-colors min-w-[150px] border border-gray-800 focus:outline-none focus:ring-0"
              >
                <SelectValue placeholder="Cualquier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquier par</SelectItem>
                {tradingPairs.map((pair) => (
                  <SelectItem key={pair.id} value={pair.id}>
                    {pair.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="account-filter" className="text-sm text-gray-400 mb-1 block">Cuenta</Label>
            <Select
              onValueChange={(value) => onFilterChange('account', value === 'all' ? '' : value)}
            >
              <SelectTrigger 
                id="account-filter"
                className="px-3 py-1.5 h-auto text-sm font-medium rounded-md transition-colors min-w-[150px] border border-gray-800 focus:outline-none focus:ring-0"
              >
                <SelectValue placeholder="Cualquier cuenta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquier cuenta</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bias-filter" className="text-sm text-gray-400 mb-1 block">Bias</Label>
            <Select
              onValueChange={(value) => onFilterChange('bias', value === 'all' ? '' : value)}
            >
              <SelectTrigger 
                id="bias-filter"
                className="px-3 py-1.5 h-auto text-sm font-medium rounded-md transition-colors min-w-[150px] border border-gray-800 focus:outline-none focus:ring-0"
              >
                <SelectValue placeholder="Cualquier bias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquier bias</SelectItem>
                <SelectItem value="BULLISH">Alcista</SelectItem>
                <SelectItem value="BEARISH">Bajista</SelectItem>
                <SelectItem value="NEUTRAL">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
} 