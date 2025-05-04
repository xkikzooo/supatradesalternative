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
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            WIN
          </span>
        );
      case 'LOSS':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
            LOSS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            BE
          </span>
        );
    }
  };

  // En caso de que no haya trades
  if (trades.length === 0) {
    return (
      <div className="text-center text-gray-400 p-4">
        No hay trades registrados. Comienza a añadir trades para verlos aquí.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-gray-800">
      <table className="w-full caption-bottom text-sm">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-900/50">
            <th className="h-10 px-4 text-left font-medium text-gray-400">Fecha</th>
            <th className="h-10 px-4 text-left font-medium text-gray-400">Par</th>
            <th className="h-10 px-4 text-left font-medium text-gray-400">Dirección</th>
            <th className="h-10 px-4 text-right font-medium text-gray-400">PnL</th>
            <th className="h-10 px-4 text-center font-medium text-gray-400">Resultado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {trades.map((trade) => (
            <tr 
              key={trade.id} 
              className="hover:bg-gray-800/50 cursor-pointer transition-colors"
              onClick={() => router.push(`/trades/edit/${trade.id}`)}
            >
              <td className="p-4 text-left align-middle text-sm text-gray-300">
                {format(new Date(trade.date), 'dd/MM/yyyy', { locale: es })}
              </td>
              <td className="p-4 text-left align-middle font-medium text-white">
                {trade.tradingPair?.name || 'N/A'}
              </td>
              <td className="p-4 text-left align-middle">
                <span className={cn(
                  "px-2 py-1 rounded-md text-xs font-medium",
                  trade.direction === 'LONG' 
                    ? "bg-green-500/10 text-green-500" 
                    : "bg-red-500/10 text-red-500"
                )}>
                  {trade.direction || 'N/A'}
                </span>
              </td>
              <td className={cn(
                "p-4 text-right align-middle font-medium",
                trade.pnl > 0 ? "text-green-400" : 
                trade.pnl < 0 ? "text-red-400" : "text-yellow-400"
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