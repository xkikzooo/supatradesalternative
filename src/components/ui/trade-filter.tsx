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

interface TradeFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function TradeFilter({ value, onChange }: TradeFilterProps) {
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
    <div className="flex gap-2">
      <button
        onClick={() => onChange('all')}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
          "border border-gray-800",
          "focus:outline-none",
          value === 'all'
            ? "bg-gray-800 text-white"
            : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/70"
        )}
      >
        Todo
      </button>
      <button
        onClick={() => onChange('today')}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
          "border border-gray-800",
          "focus:outline-none",
          value === 'today'
            ? "bg-gray-800 text-white"
            : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/70"
        )}
      >
        Hoy
      </button>
      <button
        onClick={() => onChange('week')}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
          "border border-gray-800",
          "focus:outline-none",
          value === 'week'
            ? "bg-gray-800 text-white"
            : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/70"
        )}
      >
        Semanal
      </button>
      <Select
        value={value.startsWith('month_') ? value : 'month'}
        onValueChange={(selectedValue) => {
          onChange(selectedValue);
        }}
      >
        <SelectTrigger 
          className={cn(
            "px-3 py-1.5 h-auto text-sm font-medium rounded-md transition-colors min-w-[120px]",
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
  );
} 