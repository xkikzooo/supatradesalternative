'use client';

import { TradeCard } from "@/components/ui/TradeCard";
import { TradeGalleryCard } from "@/components/ui/TradeGalleryCard";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Check, X, Download, Grid, List } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { TradeFilter } from "@/components/ui/trade-filter";
import { startOfToday, startOfWeek, startOfMonth, isAfter, endOfMonth } from "date-fns";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { AdvancedTradeFilter, TradeFilters } from "@/components/ui/advanced-trade-filter";
import { exportToExcel, exportToCSV, exportToPDF } from "@/lib/export-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocalStorage } from "@/lib/use-local-storage";
import { cn } from "@/lib/utils";
import { useTrades, useTradingPairs, useAccounts, useDeleteTrade } from "@/hooks/useTrades";

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
  result: 'WIN' | 'LOSS' | 'BREAKEVEN';
  account?: {
    id: string;
    name: string;
    broker: string;
    type: string;
  };
}

export default function TradesPage() {
  const router = useRouter();
  
  // Usar React Query hooks
  const { data: trades = [], isLoading, error } = useTrades();
  const { data: tradingPairs = [] } = useTradingPairs();
  const { data: tradingAccounts = [] } = useAccounts();
  const deleteTradeMutation = useDeleteTrade();
  
  // Estado local para filtros y UI
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [filterValue, setFilterValue] = useState('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<TradeFilters>({});
  const [viewMode, setSavedViewMode] = useLocalStorage<'list' | 'gallery'>(
    'trade-view-mode',
    'list'
  );

  // Filtrar trades cuando cambien los datos o filtros
  useEffect(() => {
    if (!trades) return;
    
    const filterTrades = () => {
      const today = startOfToday();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const monthStart = startOfMonth(today);

      let filtered = trades.filter(trade => {
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
        
        let dateMatch = true;
        switch (filterValue) {
          case 'today':
            dateMatch = isAfter(tradeDate, today);
            break;
          case 'week':
            dateMatch = isAfter(tradeDate, weekStart);
            break;
          case 'month':
            dateMatch = isAfter(tradeDate, monthStart);
            break;
          default:
            dateMatch = true;
        }
        
        if (!dateMatch) return false;
        
        // Filtros avanzados
        if (advancedFilters.direction && trade.direction !== advancedFilters.direction) {
          return false;
        }
        
        if (advancedFilters.result && trade.result !== advancedFilters.result) {
          return false;
        }
        
        if (advancedFilters.pair && trade.tradingPair.id !== advancedFilters.pair) {
          return false;
        }
        
        if (advancedFilters.account && trade.account?.id !== advancedFilters.account) {
          return false;
        }
        
        if (advancedFilters.pnlMin !== undefined && trade.pnl < advancedFilters.pnlMin) {
          return false;
        }
        
        if (advancedFilters.pnlMax !== undefined && trade.pnl > advancedFilters.pnlMax) {
          return false;
        }
        
        return true;
      });
      
      setFilteredTrades(filtered);
    };

    filterTrades();
  }, [trades, filterValue, advancedFilters]);

  const handleEdit = (id: string) => {
    router.push(`/trades/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTradeMutation.mutateAsync(id);
      showToast("Trade eliminado correctamente", "success");
      // Limpiar selección si el trade eliminado estaba seleccionado
      setSelectedTrades(prev => prev.filter(tradeId => tradeId !== id));
    } catch (error) {
      console.error("Error al eliminar trade:", error);
      showToast("Error al eliminar el trade", "error");
    }
  };

  const handleSelectTrade = (id: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedTrades(prev => [...prev, id]);
    } else {
      setSelectedTrades(prev => prev.filter(tradeId => tradeId !== id));
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedTrades.map(id => deleteTradeMutation.mutateAsync(id)));
      showToast(`${selectedTrades.length} trades eliminados correctamente`, "success");
      setSelectedTrades([]);
      setSelectionMode(false);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error al eliminar trades:", error);
      showToast("Error al eliminar algunos trades", "error");
    }
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedTrades([]);
    }
  };

  const handleExport = (format: 'excel' | 'csv' | 'pdf') => {
    if (filteredTrades.length === 0) {
      showToast("No hay trades para exportar", "warning");
      return;
    }

    try {
      switch (format) {
        case 'excel':
          exportToExcel(filteredTrades, 'trades');
          break;
        case 'csv':
          exportToCSV(filteredTrades, 'trades');
          break;
        case 'pdf':
          exportToPDF(filteredTrades, 'trades');
          break;
      }
      showToast(`Trades exportados a ${format.toUpperCase()} correctamente`, "success");
    } catch (error) {
      console.error("Error al exportar:", error);
      showToast("Error al exportar los trades", "error");
    }
  };

  const handleSaveFilter = (name: string, filters: TradeFilters) => {
    // Implementar guardado de filtros si es necesario
    showToast("Filtro guardado", "success");
  };

  const handleLoadFilter = (filters: TradeFilters) => {
    setAdvancedFilters(filters);
    showToast("Filtro aplicado", "success");
  };

  // Mostrar error si hay algún problema
  if (error) {
    return (
      <div className="rounded-2xl bg-red-500/10 backdrop-blur-xl p-6 text-sm text-red-300 border border-red-500/20">
        Error al cargar los trades: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
        <h1 className="text-3xl font-bold text-white">Trades</h1>
        <div className="flex space-x-3">
          {/* Botones de cambio de vista */}
          <div className="flex items-center border border-white/20 rounded-xl bg-white/5 backdrop-blur-sm">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSavedViewMode('list')}
              className={cn(
                "rounded-r-none border-r border-white/20 transition-all duration-200",
                viewMode === 'list' 
                  ? "bg-white/20 text-white border-white/30" 
                  : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'gallery' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSavedViewMode('gallery')}
              className={cn(
                "rounded-l-none transition-all duration-200",
                viewMode === 'gallery' 
                  ? "bg-white/20 text-white border-white/30" 
                  : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/15 hover:border-white/30 rounded-xl transition-all duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
              <DropdownMenuItem onClick={() => handleExport('excel')} className="text-white/80 hover:text-white hover:bg-white/10">
                Exportar a Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')} className="text-white/80 hover:text-white hover:bg-white/10">
                Exportar a CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')} className="text-white/80 hover:text-white hover:bg-white/10">
                Exportar a PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            onClick={() => router.push('/trades/new')} 
            size="sm"
            className="px-4 py-2.5 bg-blue-500/80 text-white hover:bg-blue-500 rounded-xl backdrop-blur-sm transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Trade
          </Button>
          {filteredTrades.length > 0 && (
            <Button
              onClick={toggleSelectionMode}
              variant={selectionMode ? "default" : "outline"}
              size="sm"
              className={cn(
                "px-4 py-2.5 rounded-xl transition-all duration-200",
                selectionMode 
                  ? "bg-white/20 text-white border-white/30" 
                  : "border border-white/20 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/15 hover:border-white/30"
              )}
            >
              {selectionMode ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar selección
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Seleccionar
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <TradeFilter 
        value={filterValue} 
        onChange={setFilterValue} 
        onFilterChange={(type, value) => {
          setAdvancedFilters(prev => ({
            ...prev,
            [type]: value || undefined
          }));
        }}
        tradingPairs={tradingPairs}
        accounts={tradingAccounts}
      />

      <AdvancedTradeFilter
        onFiltersChange={setAdvancedFilters}
        tradingPairs={tradingPairs}
        accounts={tradingAccounts}
        onSaveFilter={handleSaveFilter}
        savedFilters={[]}
        onLoadFilter={handleLoadFilter}
      />

      <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
        <span className="text-sm text-white/70 font-medium">
          {filteredTrades.length} {filteredTrades.length === 1 ? 'trade' : 'trades'}
        </span>
        {selectionMode && selectedTrades.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-blue-300 font-medium">
              {selectedTrades.length} seleccionado{selectedTrades.length > 1 ? 's' : ''}
            </span>
            <Button
              onClick={() => setIsDeleteModalOpen(true)}
              size="sm"
              variant="destructive"
              className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg backdrop-blur-sm transition-all duration-200"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="text-center text-white/60 py-12">Cargando trades...</div>
      ) : filteredTrades.length === 0 ? (
        <div className="text-center text-white/60 py-12">No hay trades registrados</div>
      ) : viewMode === 'gallery' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTrades.map((trade) => (
            <TradeGalleryCard
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
      ) : (
        <div className="space-y-4">
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

      {/* Modal de confirmación para eliminación múltiple */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteSelected}
        title="Eliminar trades seleccionados"
        description={`¿Estás seguro de que quieres eliminar ${selectedTrades.length} ${selectedTrades.length === 1 ? 'trade' : 'trades'}? Esta acción no se puede deshacer.`}
        type="danger"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
} 