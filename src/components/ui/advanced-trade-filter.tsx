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
import { Save, X } from 'lucide-react';

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
        <div className="flex justify-end mb-2">
              <Select onValueChange={(value) => onLoadFilter && onLoadFilter(
                savedFilters.find(f => f.name === value)?.filters || {}
              )}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtros guardados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Filtros guardados</SelectLabel>
                    {savedFilters.map((filter) => (
                      <SelectItem key={filter.name} value={filter.name}>
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
                  <Button size="sm" variant="outline" className="ml-2">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar filtro
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Guardar filtro</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <Label htmlFor="filter-name">Nombre del filtro</Label>
                      <Input
                        id="filter-name"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        placeholder="Mi filtro personalizado"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={handleSaveFilter}>Guardar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
              <Button size="sm" variant="outline" onClick={clearFilters} className="ml-2">
                  <X className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              </>
            )}
          </div>
      )}
    </div>
  );
} 