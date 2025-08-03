'use client';

import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Trade {
  id: string;
  pnl: number;
  result: 'WIN' | 'LOSS' | 'BREAKEVEN';
  date: string;
  tradingPair?: {
    name: string;
  };
  direction?: 'LONG' | 'SHORT';
}

interface RecentTradesTableProps {
  trades: Trade[];
}

export function RecentTradesTable({ trades }: RecentTradesTableProps) {
  const router = useRouter();

  const getResultTag = (result: string) => {
    switch (result) {
      case 'WIN':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
            WIN
          </span>
        );
      case 'LOSS':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-sm">
            LOSS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-sm">
            BE
          </span>
        );
    }
  };

  // En caso de que no haya trades
  if (trades.length === 0) {
    return (
      <div className="text-center text-white/60 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        No hay trades registrados. Comienza a añadir trades para verlos aquí.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <table className="w-full caption-bottom text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/10 backdrop-blur-sm">
            <th className="h-12 px-4 text-left font-medium text-white/70">Fecha</th>
            <th className="h-12 px-4 text-left font-medium text-white/70">Par</th>
            <th className="h-12 px-4 text-left font-medium text-white/70">Dirección</th>
            <th className="h-12 px-4 text-right font-medium text-white/70">PnL</th>
            <th className="h-12 px-4 text-center font-medium text-white/70">Resultado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {trades.map((trade) => (
            <tr 
              key={trade.id} 
              className="hover:bg-white/10 cursor-pointer transition-all duration-200 backdrop-blur-sm"
              onClick={() => router.push(`/trades/edit/${trade.id}`)}
            >
              <td className="p-4 text-left align-middle text-sm text-white/80">
                {format(new Date(trade.date), 'dd/MM/yyyy', { locale: es })}
              </td>
              <td className="p-4 text-left align-middle font-medium text-white">
                {trade.tradingPair?.name || 'N/A'}
              </td>
              <td className="p-4 text-left align-middle">
                <span className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm",
                  trade.direction === 'LONG' 
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                )}>
                  {trade.direction || 'N/A'}
                </span>
              </td>
              <td className={cn(
                "p-4 text-right align-middle font-bold",
                trade.pnl > 0 ? "text-emerald-300" : 
                trade.pnl < 0 ? "text-rose-300" : "text-amber-300"
              )}>
                {formatCurrency(trade.pnl)}
              </td>
              <td className="p-4 text-center align-middle">
                {getResultTag(trade.result)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 