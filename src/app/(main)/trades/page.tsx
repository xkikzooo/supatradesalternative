'use client';

import { TradeCard } from "@/components/ui/TradeCard";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// TradeModal eliminado - ahora se usa página completa
import { showToast } from "@/lib/toast";
import { TradeFilter } from "@/components/ui/trade-filter";
import { startOfToday, startOfWeek, startOfMonth, isAfter, endOfMonth } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  // Modal eliminado - ahora se usa página completa
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterValue, setFilterValue] = useState('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
        
        // Si el valor comienza con 'month_', es un mes específico
        if (filterValue.startsWith('month_')) {
          const [yearStr, monthStr] = filterValue.replace('month_', '').split('-');
          const year = parseInt(yearStr);
          const month = parseInt(monthStr) - 1; // Meses en JS son 0-indexed
          
          const filterMonthStart = new Date(year, month, 1);
          const filterMonthEnd = endOfMonth(filterMonthStart);
          
          return tradeDate >= filterMonthStart && tradeDate <= filterMonthEnd;
        }
        
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

  const router = useRouter();

  const handleEdit = (id: string) => {
    router.push(`/trades/edit/${id}`);
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

  const handleSelectTrade = (id: string, isSelected: boolean) => {
    setSelectedTrades(prev => {
      if (isSelected) {
        return [...prev, id];
      } else {
        return prev.filter(tradeId => tradeId !== id);
      }
    });
  };

  const handleDeleteSelected = async () => {
    setIsDeleteDialogOpen(false);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Mostrar mensaje de inicio
    showToast('Eliminando ' + selectedTrades.length + ' trades...', 'info');
    
    // Eliminar cada trade seleccionado
    for (const id of selectedTrades) {
      try {
        const response = await fetch(`/api/trades/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error(`Error al eliminar trade ${id}:`, error);
        errorCount++;
      }
    }
    
    // Mostrar resultados
    if (errorCount === 0) {
      showToast(`${successCount} trades eliminados correctamente`, "success");
    } else if (successCount === 0) {
      showToast(`Error al eliminar los trades`, "error");
    } else {
      showToast(`${successCount} trades eliminados, ${errorCount} errores`, "warning");
    }
    
    // Refrescar la lista y limpiar selección
    fetchTrades();
    setSelectedTrades([]);
    setSelectionMode(false);
  };

  const toggleSelectionMode = () => {
    if (selectionMode) {
      setSelectedTrades([]);
    }
    setSelectionMode(!selectionMode);
  };

  // Función de éxito del modal eliminada - ahora se maneja en las páginas completas

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trades</h1>
          <p className="text-sm text-gray-400">
            Aquí puedes ver y gestionar todos tus trades registrados.
          </p>
        </div>
        <div className="flex gap-2">
          {selectionMode ? (
            <>
              <Button 
                onClick={toggleSelectionMode}
                variant="outline"
                className="border-gray-800 hover:bg-gray-800"
              >
                <X className="h-5 w-5 mr-1" />
                Cancelar
              </Button>
              <Button 
                onClick={() => setIsDeleteDialogOpen(true)}
                variant="destructive"
                disabled={selectedTrades.length === 0}
                className="hover:bg-red-600"
              >
                <Trash2 className="h-5 w-5 mr-1" />
                Eliminar ({selectedTrades.length})
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={toggleSelectionMode}
                className="bg-[#1c1c1c] hover:bg-[#2a2a2a] text-white rounded-lg px-4 py-2 h-10 font-medium border border-gray-800/50 hover:border-gray-700/50 transition-all flex items-center gap-2"
              >
                <Check className="h-5 w-5" />
                Seleccionar
              </Button>
              <Button 
                onClick={() => router.push('/trades/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 h-10 font-medium transition-all flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Nuevo Trade
              </Button>
            </>
          )}
        </div>
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
              selectionMode={selectionMode}
              isSelected={selectedTrades.includes(trade.id)}
              onSelectChange={handleSelectTrade}
            />
          ))}
        </div>
      )}

      {/* Modal eliminado - ahora se usa una página completa */}

      {/* Diálogo de confirmación para eliminación múltiple */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Eliminar trades seleccionados</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar {selectedTrades.length} {selectedTrades.length === 1 ? 'trade' : 'trades'}?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              className="bg-red-500 hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 