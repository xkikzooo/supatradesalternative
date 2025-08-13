import { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from './select';
import { Button } from './button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from './dialog';
import { Input } from './input';
import { Label } from './label';
import { Save, X, Filter } from 'lucide-react';

// Interfaz para los filtros
export interface TradeFilters {
  date?: string;
  direction?: string;
  result?: string;
  pair?: string;
  account?: string;
  pnlMin?: number;
  pnlMax?: number;
  bias?: string;
}

// Interfaz para las propiedades del componente
interface AdvancedTradeFilterProps {
  onFiltersChange: (filters: TradeFilters) => void;
  tradingPairs: { id: string; name: string }[];
  accounts: { id: string; name: string }[];
  onSaveFilter?: (name: string, filters: TradeFilters) => void;
  savedFilters?: { name: string; filters: TradeFilters }[];
  onLoadFilter?: (filters: TradeFilters) => void;
}

export function AdvancedTradeFilter({
  onFiltersChange,
  tradingPairs,
  accounts,
  onSaveFilter,
  savedFilters = [],
  onLoadFilter
}: AdvancedTradeFilterProps) {
  const [filters, setFilters] = useState<TradeFilters>({});
  const [isOpen, setIsOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  
  // Función para actualizar los filtros
  const updateFilters = (newFilters: Partial<TradeFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };
  
  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };
  
  // Función para guardar un filtro
  const handleSaveFilter = () => {
    if (filterName.trim() && onSaveFilter) {
      onSaveFilter(filterName, filters);
      setFilterName('');
      setIsSaveDialogOpen(false);
    }
  };
  
  // Contar filtros activos
  const activeFilterCount = Object.keys(filters).filter(key => 
    filters[key as keyof TradeFilters] !== undefined && 
    filters[key as keyof TradeFilters] !== ''
  ).length;
  
  return (
    <div className="mb-6">
      {savedFilters.length > 0 && (
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-3">
            <Select onValueChange={(value) => onLoadFilter && onLoadFilter(
              savedFilters.find(f => f.name === value)?.filters || {}
            )}>
              <SelectTrigger className="w-[200px] px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl text-white/80 hover:text-white hover:bg-white/15 hover:border-white/30 transition-all duration-200">
                <SelectValue placeholder="Filtros guardados" />
              </SelectTrigger>
              <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                <SelectGroup>
                  <SelectLabel className="text-white/60 font-medium">Filtros guardados</SelectLabel>
                  {savedFilters.map((filter) => (
                    <SelectItem key={filter.name} value={filter.name} className="text-white/80 hover:text-white hover:bg-white/10">
                      {filter.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {activeFilterCount > 0 && (
              <>
                <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/15 hover:border-white/30 rounded-xl transition-all duration-200"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Guardar filtro
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white font-semibold">Guardar filtro</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <Label htmlFor="filter-name" className="text-white/70 font-medium">Nombre del filtro</Label>
                      <Input
                        id="filter-name"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        placeholder="Mi filtro personalizado"
                        className="mt-2 px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
                      />
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsSaveDialogOpen(false)}
                        className="px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/15 hover:border-white/30 rounded-xl transition-all duration-200"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleSaveFilter}
                        className="px-4 py-2.5 bg-blue-500/80 text-white hover:bg-blue-500 rounded-xl backdrop-blur-sm transition-all duration-200"
                      >
                        Guardar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={clearFilters} 
                  className="px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/15 hover:border-white/30 rounded-xl transition-all duration-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 