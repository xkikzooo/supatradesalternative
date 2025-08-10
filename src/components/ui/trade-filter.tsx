'use client';

import { cn } from "@/lib/utils";
import { format, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useMemo } from "react";
import { Label } from "./label";
import { ChevronDown } from "lucide-react";

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
  // Estados para manejar los valores de cada select individualmente
  const [selectedResult, setSelectedResult] = useState<string>('');
  const [selectedDirection, setSelectedDirection] = useState<string>('');
  const [selectedPair, setSelectedPair] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedBias, setSelectedBias] = useState<string>('');

  // Memoizar los meses disponibles para evitar re-cálculos innecesarios
  const availableMonths = useMemo(() => {
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
    
    return months;
  }, []);

  // Componente Select personalizado que imita el diseño de Radix UI
  function CustomSelect({ 
    value, 
    onValueChange, 
    placeholder, 
    options,
    className,
    active = false 
  }: {
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    options: Array<{ value: string; label: string; className?: string }>;
    className?: string;
    active?: boolean;
  }) {
    return (
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className={cn(
            "w-full appearance-none cursor-pointer",
            "px-4 py-2.5 text-sm font-medium rounded-xl",
            "border border-white/20 bg-white/10 backdrop-blur-sm",
            "focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50",
            "hover:bg-white/15 hover:border-white/30 transition-all duration-200",
            active 
              ? "bg-white/15 text-white border-white/30" 
              : "text-white/80 hover:text-white",
            className
          )}
        >
          <option value="" disabled className="bg-gray-900 text-white/60">
            {placeholder}
          </option>
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value} 
              className={`bg-gray-900 ${option.className || 'text-white'}`}
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 items-end p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
      <div>
        <Label htmlFor="date-filter" className="text-sm text-white/70 mb-2 block font-medium">
          Fecha
        </Label>
        <CustomSelect
          value={value.startsWith('month_') || value === 'month' ? value : ''}
          onValueChange={onChange}
          placeholder="Seleccionar mes"
          className="min-w-[160px]"
          active={value.startsWith('month_') || value === 'month'}
          options={[
            { value: 'month', label: 'Mes actual' },
            ...availableMonths.map(month => ({ value: month.value, label: month.label }))
          ]}
        />
      </div>

      {onFilterChange && (
        <>
          <div>
            <Label htmlFor="result-filter" className="text-sm text-white/70 mb-2 block font-medium">
              Resultado
            </Label>
            <CustomSelect
              value={selectedResult}
              onValueChange={(value) => {
                setSelectedResult(value);
                onFilterChange('result', value === 'all' ? '' : value);
              }}
              placeholder="Cualquier resultado"
              className="min-w-[160px]"
              active={selectedResult !== ''}
              options={[
                { value: 'all', label: 'Cualquier resultado' },
                { value: 'WIN', label: 'Ganador', className: 'text-emerald-300' },
                { value: 'LOSS', label: 'Perdedor', className: 'text-rose-300' },
                { value: 'BREAKEVEN', label: 'Break-even', className: 'text-amber-300' }
              ]}
            />
          </div>

          <div>
            <Label htmlFor="direction-filter" className="text-sm text-white/70 mb-2 block font-medium">
              Dirección
            </Label>
            <CustomSelect
              value={selectedDirection}
              onValueChange={(value) => {
                setSelectedDirection(value);
                onFilterChange('direction', value === 'all' ? '' : value);
              }}
              placeholder="Cualquier dirección"
              className="min-w-[160px]"
              active={selectedDirection !== ''}
              options={[
                { value: 'all', label: 'Cualquier dirección' },
                { value: 'LONG', label: 'Long', className: 'text-emerald-300' },
                { value: 'SHORT', label: 'Short', className: 'text-rose-300' }
              ]}
            />
          </div>

          <div>
            <Label htmlFor="pair-filter" className="text-sm text-white/70 mb-2 block font-medium">
              Par
            </Label>
            <CustomSelect
              value={selectedPair}
              onValueChange={(value) => {
                setSelectedPair(value);
                onFilterChange('pair', value === 'all' ? '' : value);
              }}
              placeholder="Cualquier par"
              className="min-w-[160px]"
              active={selectedPair !== ''}
              options={[
                { value: 'all', label: 'Cualquier par' },
                ...tradingPairs.map(pair => ({ value: pair.id, label: pair.name }))
              ]}
            />
          </div>

          <div>
            <Label htmlFor="account-filter" className="text-sm text-white/70 mb-2 block font-medium">
              Cuenta
            </Label>
            <CustomSelect
              value={selectedAccount}
              onValueChange={(value) => {
                setSelectedAccount(value);
                onFilterChange('account', value === 'all' ? '' : value);
              }}
              placeholder="Cualquier cuenta"
              className="min-w-[160px]"
              active={selectedAccount !== ''}
              options={[
                { value: 'all', label: 'Cualquier cuenta' },
                ...accounts.map(account => ({ value: account.id, label: account.name }))
              ]}
            />
          </div>

          <div>
            <Label htmlFor="bias-filter" className="text-sm text-white/70 mb-2 block font-medium">
              Bias
            </Label>
            <CustomSelect
              value={selectedBias}
              onValueChange={(value) => {
                setSelectedBias(value);
                onFilterChange('bias', value === 'all' ? '' : value);
              }}
              placeholder="Cualquier bias"
              className="min-w-[160px]"
              active={selectedBias !== ''}
              options={[
                { value: 'all', label: 'Cualquier bias' },
                { value: 'BULLISH', label: 'Alcista', className: 'text-emerald-300' },
                { value: 'BEARISH', label: 'Bajista', className: 'text-rose-300' },
                { value: 'NEUTRAL', label: 'Neutral', className: 'text-amber-300' }
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
} 