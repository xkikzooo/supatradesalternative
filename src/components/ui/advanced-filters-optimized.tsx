'use client';

import { useState, useEffect } from 'react';
import { 
  Filter, 
  X, 
  Save, 
  Loader2,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Target
} from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Checkbox } from './checkbox';
import { useTradingAccounts } from '@/hooks/useTradingAccountsOptimized';
import { cn } from '@/lib/utils';

interface TradeFilters {
  dateRange?: 'today' | 'week' | 'month' | 'all' | 'custom';
  startDate?: string;
  endDate?: string;
  result?: 'WIN' | 'LOSS' | 'BREAKEVEN';
  direction?: 'LONG' | 'SHORT';
  tradingPairId?: string;
  accountId?: string;
  minPnl?: number;
  maxPnl?: number;
  hasImages?: boolean;
  hasBias?: boolean;
  hasPsychology?: boolean;
}

interface AdvancedFiltersOptimizedProps {
  filters: TradeFilters;
  onFiltersChange: (filters: TradeFilters) => void;
  onReset: () => void;
  tradingPairs?: Array<{ id: string; name: string }>;
  className?: string;
}

export function AdvancedFiltersOptimized({
  filters,
  onFiltersChange,
  onReset,
  tradingPairs = [],
  className
}: AdvancedFiltersOptimizedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<TradeFilters>(filters);
  const [savedFilters, setSavedFilters] = useState<Array<{ name: string; filters: TradeFilters }>>([]);
  const [saveFilterName, setSaveFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const { data: accountsData, isLoading: accountsLoading } = useTradingAccounts();

  // Cargar filtros guardados desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('saved-trade-filters');
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (error) {
        console.error('Error al cargar filtros guardados:', error);
      }
    }
  }, []);

  // Guardar filtros guardados en localStorage
  useEffect(() => {
    localStorage.setItem('saved-trade-filters', JSON.stringify(savedFilters));
  }, [savedFilters]);

  const updateLocalFilter = (key: keyof TradeFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: TradeFilters = {};
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onReset();
  };

  const handleSaveFilter = () => {
    if (!saveFilterName.trim()) return;
    
    const newSavedFilter = {
      name: saveFilterName.trim(),
      filters: localFilters
    };
    
    setSavedFilters(prev => [...prev, newSavedFilter]);
    setSaveFilterName('');
    setShowSaveDialog(false);
  };

  const handleLoadFilter = (savedFilter: { name: string; filters: TradeFilters }) => {
    setLocalFilters(savedFilter.filters);
    onFiltersChange(savedFilter.filters);
  };

  const handleDeleteSavedFilter = (filterName: string) => {
    setSavedFilters(prev => prev.filter(f => f.name !== filterName));
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== '' && value !== 'all'
    ).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header de filtros */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-white/60" />
          <h3 className="text-lg font-medium text-white">Filtros</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
              {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            {isExpanded ? 'Ocultar' : 'Mostrar'} Filtros
          </Button>
          
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Filtros expandibles */}
      {isExpanded && (
        <div className="bg-white/5 rounded-lg border border-white/10 p-6 space-y-6">
          {/* Filtros básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Rango de fechas */}
            <div className="space-y-2">
              <Label className="text-white/80">Rango de fechas</Label>
              <Select
                value={localFilters.dateRange || 'all'}
                onValueChange={(value) => updateLocalFilter('dateRange', value)}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/10 border-white/20">
                  <SelectItem value="all">Todas las fechas</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fechas personalizadas */}
            {localFilters.dateRange === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label className="text-white/80">Fecha inicio</Label>
                  <Input
                    type="date"
                    value={localFilters.startDate || ''}
                    onChange={(e) => updateLocalFilter('startDate', e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Fecha fin</Label>
                  <Input
                    type="date"
                    value={localFilters.endDate || ''}
                    onChange={(e) => updateLocalFilter('endDate', e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </>
            )}

            {/* Resultado */}
            <div className="space-y-2">
              <Label className="text-white/80">Resultado</Label>
              <Select
                value={localFilters.result || ''}
                onValueChange={(value) => updateLocalFilter('result', value || undefined)}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Todos los resultados" />
                </SelectTrigger>
                <SelectContent className="bg-white/10 border-white/20">
                  <SelectItem value="">Todos los resultados</SelectItem>
                  <SelectItem value="WIN">Ganancia</SelectItem>
                  <SelectItem value="LOSS">Pérdida</SelectItem>
                  <SelectItem value="BREAKEVEN">Empate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label className="text-white/80">Dirección</Label>
              <Select
                value={localFilters.direction || ''}
                onValueChange={(value) => updateLocalFilter('direction', value || undefined)}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Todas las direcciones" />
                </SelectTrigger>
                <SelectContent className="bg-white/10 border-white/20">
                  <SelectItem value="">Todas las direcciones</SelectItem>
                  <SelectItem value="LONG">Largo</SelectItem>
                  <SelectItem value="SHORT">Corto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Par de trading */}
            <div className="space-y-2">
              <Label className="text-white/80">Par de trading</Label>
              <Select
                value={localFilters.tradingPairId || ''}
                onValueChange={(value) => updateLocalFilter('tradingPairId', value || undefined)}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Todos los pares" />
                </SelectTrigger>
                <SelectContent className="bg-white/10 border-white/20">
                  <SelectItem value="">Todos los pares</SelectItem>
                  {tradingPairs.map((pair) => (
                    <SelectItem key={pair.id} value={pair.id}>
                      {pair.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cuenta */}
            <div className="space-y-2">
              <Label className="text-white/80">Cuenta</Label>
              <Select
                value={localFilters.accountId || ''}
                onValueChange={(value) => updateLocalFilter('accountId', value || undefined)}
                disabled={accountsLoading}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder={accountsLoading ? "Cargando..." : "Todas las cuentas"} />
                </SelectTrigger>
                <SelectContent className="bg-white/10 border-white/20">
                  <SelectItem value="">Todas las cuentas</SelectItem>
                  {accountsData?.accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.broker})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros de PnL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/80">PnL mínimo</Label>
              <Input
                type="number"
                placeholder="0"
                value={localFilters.minPnl || ''}
                onChange={(e) => updateLocalFilter('minPnl', e.target.value ? Number(e.target.value) : undefined)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">PnL máximo</Label>
              <Input
                type="number"
                placeholder="1000"
                value={localFilters.maxPnl || ''}
                onChange={(e) => updateLocalFilter('maxPnl', e.target.value ? Number(e.target.value) : undefined)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          {/* Filtros de características */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasImages"
                checked={localFilters.hasImages || false}
                onCheckedChange={(checked) => updateLocalFilter('hasImages', checked)}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label htmlFor="hasImages" className="text-white/80">Con imágenes</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasBias"
                checked={localFilters.hasBias || false}
                onCheckedChange={(checked) => updateLocalFilter('hasBias', checked)}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label htmlFor="hasBias" className="text-white/80">Con sesgo</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPsychology"
                checked={localFilters.hasPsychology || false}
                onCheckedChange={(checked) => updateLocalFilter('hasPsychology', checked)}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label htmlFor="hasPsychology" className="text-white/80">Con psicología</Label>
            </div>
          </div>

          {/* Filtros guardados */}
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white/80">Filtros guardados</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar filtros
              </Button>
            </div>
            
            {savedFilters.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {savedFilters.map((savedFilter) => (
                  <div
                    key={savedFilter.name}
                    className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm text-white/80 hover:bg-white/20 transition-colors"
                  >
                    <button
                      onClick={() => handleLoadFilter(savedFilter)}
                      className="hover:text-white transition-colors"
                    >
                      {savedFilter.name}
                    </button>
                    <button
                      onClick={() => handleDeleteSavedFilter(savedFilter.name)}
                      className="text-white/60 hover:text-red-400 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/60">No hay filtros guardados</p>
            )}
          </div>
        </div>
      )}

      {/* Dialog para guardar filtros */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-white mb-4">Guardar filtros</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-white/80">Nombre del filtro</Label>
                <Input
                  value={saveFilterName}
                  onChange={(e) => setSaveFilterName(e.target.value)}
                  placeholder="Ej: Trades ganadores de esta semana"
                  className="bg-white/10 border-white/20 text-white mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveFilter}
                  disabled={!saveFilterName.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Guardar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 