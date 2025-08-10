'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { startOfToday, startOfWeek, startOfMonth } from 'date-fns';
import { 
  useTrades, 
  useCreateTrade, 
  useUpdateTrade, 
  useDeleteTrade 
} from '@/hooks/useTradesOptimized';
import { 
  useTradingAccounts 
} from '@/hooks/useTradingAccountsOptimized';
import { TradesTableSkeleton, TradesCardSkeleton } from '@/components/ui/skeletons';
import { Pagination } from '@/components/ui/pagination';
import { showToast } from '@/lib/toast';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface TradeFilters {
  dateRange?: 'today' | 'week' | 'month' | 'all';
  result?: 'WIN' | 'LOSS' | 'BREAKEVEN';
  direction?: 'LONG' | 'SHORT';
  tradingPairId?: string;
  accountId?: string;
}

export default function TradesPageOptimized() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Estados locales
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [filterValue, setFilterValue] = useState('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<TradeFilters>({});
  const [viewMode, setViewMode] = useLocalStorage<'list' | 'gallery'>(
    'trade-view-mode',
    'list'
  );

  // React Query hooks
  const { 
    data: tradesData, 
    isLoading: tradesLoading, 
    error: tradesError 
  } = useTrades(currentPage, itemsPerPage);
  
  const { 
    data: accountsData, 
    isLoading: accountsLoading 
  } = useTradingAccounts();

  // Mutations
  const deleteTradeMutation = useDeleteTrade();

  // Redirección si no está autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Calcular datos derivados
  const trades = tradesData?.trades || [];
  const totalItems = tradesData?.totalCount || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasMore = tradesData?.hasMore || false;

  // Filtros
  const filteredTrades = trades.filter(trade => {
    if (filterValue === 'all') return true;
    
    const today = startOfToday();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const monthStart = startOfMonth(today);
    const tradeDate = new Date(trade.date);

    switch (filterValue) {
      case 'today':
        return tradeDate >= today;
      case 'week':
        return tradeDate >= weekStart;
      case 'month':
        return tradeDate >= monthStart;
      default:
        return true;
    }
  });

  // Manejadores
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTrade = async (id: string) => {
    try {
      await deleteTradeMutation.mutateAsync(id);
      showToast("Trade eliminado correctamente", "success");
    } catch (error) {
      console.error("Error al eliminar trade:", error);
      showToast("Error al eliminar el trade", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedTrades.map(id => deleteTradeMutation.mutateAsync(id)));
      setSelectedTrades([]);
      setSelectionMode(false);
      showToast("Trades eliminados correctamente", "success");
    } catch (error) {
      console.error("Error al eliminar trades:", error);
      showToast("Error al eliminar los trades", "error");
    }
  };

  // Loading states
  if (tradesLoading && currentPage === 1) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Trades</h1>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-white/10 animate-pulse rounded-lg" />
            <div className="h-10 w-32 bg-white/10 animate-pulse rounded-lg" />
          </div>
        </div>
        
        {viewMode === 'list' ? <TradesTableSkeleton /> : <TradesCardSkeleton />}
      </div>
    );
  }

  // Error state
  if (tradesError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-2">Error al cargar los trades</div>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Trades</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'gallery' : 'list')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            {viewMode === 'list' ? 'Vista Galería' : 'Vista Lista'}
          </button>
          <button
            onClick={() => router.push('/trades/new')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
          >
            Nuevo Trade
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 flex-wrap">
        <select
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
        >
          <option value="all">Todos los trades</option>
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
        </select>
        
        {/* Más filtros aquí... */}
      </div>

      {/* Modo selección */}
      {selectionMode && (
        <div className="flex items-center justify-between p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
          <span className="text-blue-300">
            {selectedTrades.length} trades seleccionados
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
            >
              Eliminar Seleccionados
            </button>
            <button
              onClick={() => {
                setSelectionMode(false);
                setSelectedTrades([]);
              }}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-white text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Contenido */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {/* Tabla de trades */}
          <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
            {/* Implementar tabla aquí */}
            <div className="p-4 text-center text-white/60">
              Tabla de trades implementada con React Query
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Vista galería */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrades.map((trade) => (
              <div key={trade.id} className="bg-white/5 rounded-xl border border-white/10 p-6">
                {/* Implementar tarjeta de trade aquí */}
                <div className="text-white/60">
                  Trade: {trade.tradingPair?.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          className="mt-8"
        />
      )}

      {/* Información de carga */}
      {tradesLoading && currentPage > 1 && (
        <div className="text-center py-4 text-white/60">
          Cargando página {currentPage}...
        </div>
      )}
    </div>
  );
} 