import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { TradeCard } from "./TradeCard";
import { showToast } from "@/lib/toast";
import { X } from "lucide-react";

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

interface AccountTradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  accountName: string;
}

export function AccountTradesModal({ isOpen, onClose, accountId, accountName }: AccountTradesModalProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      if (!isOpen) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/trades?accountId=${accountId}`);
        if (!response.ok) {
          throw new Error("Error al cargar los trades");
        }
        const data = await response.json();
        setTrades(data || []);
      } catch (error) {
        console.error("Error al obtener trades:", error);
        showToast("Error al cargar los trades", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrades();
  }, [accountId, isOpen]);

  const handleEdit = (id: string) => {
    // Implementar edición si es necesario
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

      toast.success("Trade eliminado correctamente");
      // Recargar los trades
      const updatedTrades = trades.filter(trade => trade.id !== id);
      setTrades(updatedTrades);
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error("Error al eliminar el trade");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="mb-6">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-xl font-bold">Trades de {accountName}</DialogTitle>
            <span className="text-sm font-normal text-gray-400">
              {trades.length} {trades.length === 1 ? 'trade' : 'trades'}
            </span>
          </div>
        </DialogHeader>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </button>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4">
          {isLoading ? (
            <div className="text-center text-gray-400">Cargando trades...</div>
          ) : trades.length === 0 ? (
            <div className="text-center text-gray-400">No hay trades registrados para esta cuenta</div>
          ) : (
            trades.map((trade) => (
              <TradeCard
                key={trade.id}
                {...trade}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 