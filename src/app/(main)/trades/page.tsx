'use client';

import { TradeCard } from "@/components/ui/TradeCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { TradeModal } from "@/components/ui/TradeModal";
import { showToast } from "@/lib/toast";
import { TradeFilter } from "@/components/ui/trade-filter";
import { startOfToday, startOfWeek, startOfMonth, isAfter } from "date-fns";

interface Trade {
  id: string;
  tradingPair: {
    id: string;
    name: string;
  };
  date: string;
  pnl: number;
  bias: string;
  psychology?: string;
  images: string[];
  direction: 'LONG' | 'SHORT';
  account?: {
    id: string;
    name: string;
    broker: string;
    type: string;
  };
}

export default function TradesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterValue, setFilterValue] = useState('all');

  const fetchTrades = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/trades");
      if (!response.ok) {
        throw new Error("Error al cargar los trades");
      }
      const data = await response.json();
      setTrades(data || []);
      setFilteredTrades(data || []);
    } catch (error) {
      console.error("Error al obtener trades:", error);
      setError("Error al cargar los trades");
      showToast("Error al cargar los trades", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  useEffect(() => {
    const filterTrades = () => {
      const today = startOfToday();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const monthStart = startOfMonth(today);

      const filtered = trades.filter(trade => {
        const tradeDate = new Date(trade.date);
        switch (filterValue) {
          case 'today':
            return isAfter(tradeDate, today);
          case 'week':
            return isAfter(tradeDate, weekStart);
          case 'month':
            return isAfter(tradeDate, monthStart);
          default:
            return true;
        }
      });
      setFilteredTrades(filtered);
    };

    filterTrades();
  }, [filterValue, trades]);

  const handleEdit = (id: string) => {
    console.log("Editar trade:", id);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/trades/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el trade");
      }

      showToast("Trade eliminado correctamente", "success");
      fetchTrades();
    } catch (error) {
      console.error("Error al eliminar:", error);
      showToast("Error al eliminar el trade", "error");
    }
  };

  const handleModalSuccess = () => {
    fetchTrades();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trades</h1>
          <p className="text-sm text-gray-400">
            Aquí puedes ver y gestionar todos tus trades registrados.
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1c1c1c] hover:bg-[#2a2a2a] text-white rounded-lg px-4 py-2 h-10 font-medium border border-gray-800/50 hover:border-gray-700/50 transition-all flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nuevo Trade
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <TradeFilter value={filterValue} onChange={setFilterValue} />
        <span className="text-sm text-gray-400">
          {filteredTrades.length} {filteredTrades.length === 1 ? 'trade' : 'trades'}
        </span>
      </div>
      
      {error ? (
        <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      ) : isLoading ? (
        <div className="text-center text-gray-400">Cargando trades...</div>
      ) : filteredTrades.length === 0 ? (
        <div className="text-center text-gray-400">No hay trades registrados</div>
      ) : (
        <div className="grid gap-4">
          {filteredTrades.map((trade) => (
            <TradeCard
              key={trade.id}
              {...trade}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <TradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
} 