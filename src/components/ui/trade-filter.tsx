'use client';

import { cn } from "@/lib/utils";

interface TradeFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function TradeFilter({ value, onChange }: TradeFilterProps) {
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
      <button
        onClick={() => onChange('month')}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
          "border border-gray-800",
          "focus:outline-none",
          value === 'month'
            ? "bg-gray-800 text-white"
            : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/70"
        )}
      >
        Mensual
      </button>
    </div>
  );
} 