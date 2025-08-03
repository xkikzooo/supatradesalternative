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
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterValue, setFilterValue] = useState('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<TradeFilters>({});
  const [tradingPairs, setTradingPairs] = useState<{id: string, name: string}[]>([]);
  const [tradingAccounts, setTradingAccounts] = useState<{id: string, name: string}[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'gallery'>('list');
  const [savedFilters, setSavedFilters] = useLocalStorage<{name: string, filters: TradeFilters}[]>(
    'saved-trade-filters', 
    []
  );
  const [savedViewMode, setSavedViewMode] = useLocalStorage<'list' | 'gallery'>(
    'trade-view-mode',
    'list'
  );

  // Inicializar el modo de vista desde localStorage
  useEffect(() => {
    setViewMode(savedViewMode);
  }, [savedViewMode]);

  // Actualizar localStorage cuando cambie el modo de vista
  const handleViewModeChange = (mode: 'list' | 'gallery') => {
    setViewMode(mode);
    setSavedViewMode(mode);
  };

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

  const fetchTradesData = async () => {
    try {
      // Obtener pares de trading
      const pairsResponse = await fetch("/api/trading-pairs");
      if (pairsResponse.ok) {
        const pairsData = await pairsResponse.json();
        setTradingPairs(pairsData);
      }

      // Obtener cuentas
      const accountsResponse = await fetch("/api/accounts");
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        setTradingAccounts(accountsData);
      }
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  useEffect(() => {
    fetchTradesData();
  }, []);

  useEffect(() => {
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
        
        if (advancedFilters.bias && trade.bias !== advancedFilters.bias) {
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
  }, [filterValue, trades, advancedFilters]);

  const router = useRouter();

  const handleEdit = (id: string) => {
    router.push(`/trades/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/trades/${id}`, {
        method: 'DELETE',
      });

      // Intentar obtener detalles específicos del error si la respuesta no es exitosa
      if (!response.ok) {
        let errorMessage = "Error al eliminar el trade";
        try {
          const errorData = await response.json();
          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch (_) {
          // Si no podemos parsear el JSON, usamos el mensaje genérico
        }
        throw new Error(errorMessage);
      }

      // Actualizamos la UI después de una eliminación exitosa
      showToast("Trade eliminado correctamente", "success");
      
      // Refrescar los trades después de un pequeño retardo
      setTimeout(() => {
        fetchTrades();
      }, 500);
    } catch (error) {
      console.error("Error al eliminar:", error);
      // No mostramos toast aquí porque ya lo manejamos en el componente TradeCard
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
    let successCount = 0;
    let errorCount = 0;
    let lastErrorMessage = "Error desconocido";
    
    // Mostrar mensaje de inicio con duración corta
    showToast(`Eliminando ${selectedTrades.length} trades...`, 'info');
    
    // Eliminar cada trade seleccionado
    for (const id of selectedTrades) {
      try {
        const response = await fetch(`/api/trades/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          successCount++;
        } else {
          try {
            const errorData = await response.json();
            if (errorData?.error) {
              lastErrorMessage = errorData.error;
            }
          } catch (_) {
            // Si no podemos parsear el JSON, usamos el mensaje genérico
          }
          errorCount++;
        }
      } catch (error) {
        console.error(`Error al eliminar trade ${id}:`, error);
        if (error instanceof Error) {
          lastErrorMessage = error.message;
        }
        errorCount++;
      }
    }
    
    // Refrescar la lista y limpiar selección
    await fetchTrades();
    setSelectedTrades([]);
    setSelectionMode(false);
    
    // Agregar un pequeño retraso para mostrar el resultado después de actualizar la UI
    setTimeout(() => {
      // Mostrar resultados con duración más larga
      if (errorCount === 0) {
        showToast(`${successCount} trades eliminados correctamente`, "success");
      } else if (successCount === 0) {
        showToast(`Error al eliminar trades: ${lastErrorMessage}`, "error");
      } else {
        showToast(`${successCount} trades eliminados, ${errorCount} errores`, "warning");
      }
    }, 500);
  };

  const toggleSelectionMode = () => {
    if (selectionMode) {
      setSelectedTrades([]);
    }
    setSelectionMode(!selectionMode);
  };

  // Manejar exportación de datos
  const handleExport = (format: 'excel' | 'csv' | 'pdf') => {
    if (filteredTrades.length === 0) {
      showToast("No hay trades para exportar", "error");
      return;
    }
    
    try {
      const fileName = `supatrades_${format === 'excel' ? 'xlsx' : format}`;
      
      switch (format) {
        case 'excel':
          exportToExcel(filteredTrades, fileName);
          break;
        case 'csv':
          exportToCSV(filteredTrades, fileName);
          break;
        case 'pdf':
          exportToPDF(filteredTrades, fileName);
          break;
      }
      
      showToast(`Exportación a ${format.toUpperCase()} completada`, "success");
    } catch (error) {
      console.error(`Error al exportar a ${format}:`, error);
      showToast(`Error al exportar a ${format}`, "error");
    }
  };
  
  // Manejar guardado de filtros
  const handleSaveFilter = (name: string, filters: TradeFilters) => {
    setSavedFilters([...savedFilters, { name, filters }]);
    showToast(`Filtro "${name}" guardado correctamente`, "success");
  };
  
  // Manejar carga de filtros
  const handleLoadFilter = (filters: TradeFilters) => {
    setAdvancedFilters(filters);
    showToast("Filtro aplicado", "success");
  };

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
              onClick={() => handleViewModeChange('list')}
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
              onClick={() => handleViewModeChange('gallery')}
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
        savedFilters={savedFilters}
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
      
      {error ? (
        <div className="rounded-2xl bg-red-500/10 backdrop-blur-xl p-6 text-sm text-red-300 border border-red-500/20">
          {error}
        </div>
      ) : isLoading ? (
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