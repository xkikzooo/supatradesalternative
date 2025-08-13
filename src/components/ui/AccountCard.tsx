'use client';

import { cn } from "@/lib/utils";
import { Pencil, Trash2, LineChart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { AccountTradesModal } from "./account-trades-modal";

interface AccountCardProps {
  account: {
    id: string;
    name: string;
    balance: number;
    initialBalance: number;
    broker: string;
    type: 'Fondeada' | 'Challenge';
    currency: string;
    createdAt: string;
    updatedAt: string;
    riskPerTrade?: string;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const [isTradesModalOpen, setIsTradesModalOpen] = useState(false);
  
  // Calcular el porcentaje de cambio
  const calculatePercentageChange = () => {
    if (account.initialBalance === 0) return { value: "0.00", show: false };
    
    const change = ((account.balance - account.initialBalance) / Math.abs(account.initialBalance)) * 100;
    const formattedChange = change.toFixed(2);
    
    return {
      value: formattedChange,
      show: true,
      isPositive: change > 0,
      isNegative: change < 0
    };
  };

  const percentageInfo = calculatePercentageChange();

  return (
    <>
      <div className="rounded-xl bg-[#0A0A0A]/60 p-6 border border-gray-800/50 backdrop-blur-sm hover:border-gray-700/50 transition-all">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">{account.name}</h3>
          <span className={cn(
            "px-3 py-1 text-xs font-medium rounded-full",
            account.type === 'Fondeada' 
              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
              : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
          )}>
            {account.type}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">Balance</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold text-white tracking-tight">
                {formatCurrency(account.balance, account.currency)}
              </p>
              {percentageInfo.show && (
                <span className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1",
                  percentageInfo.isPositive ? "bg-green-500/10 text-green-400 border border-green-500/20" : 
                  percentageInfo.isNegative ? "bg-red-500/10 text-red-400 border border-red-500/20" : 
                  "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                )}>
                  {percentageInfo.isPositive && '+'}{percentageInfo.value}%
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Prop Firm</p>
              <p className="text-sm text-white">{account.broker}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Moneda</p>
              <p className="text-sm text-white">{account.currency}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Fecha de creación</p>
              <p className="text-sm text-white">{new Date(account.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Última actualización</p>
              <p className="text-sm text-white">{new Date(account.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {account.riskPerTrade && (
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Riesgo por trade</p>
              <p className="text-sm text-white">{account.riskPerTrade}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6 border-t border-gray-800/50 pt-4">
          <button
            onClick={() => setIsTradesModalOpen(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
          >
            <LineChart className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(account.id)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AccountTradesModal
        isOpen={isTradesModalOpen}
        onClose={() => setIsTradesModalOpen(false)}
        accountId={account.id}
        accountName={account.name}
      />
    </>
  );
} 