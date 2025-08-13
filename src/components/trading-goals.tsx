import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';

// Tipo para los objetivos
interface TradingGoal {
  id: string;
  name: string;
  type: 'profit' | 'winrate' | 'trades' | 'drawdown';
  target: number;
  current: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
}

interface TradingGoalsProps {
  totalProfit: number;
  winRate: number;
  tradeCount: number;
  maxDrawdown: number;
}

export function TradingGoals({ totalProfit, winRate, tradeCount, maxDrawdown }: TradingGoalsProps) {
  // Usar localStorage para persistir los objetivos
  const [goals, setGoals] = useLocalStorage<TradingGoal[]>('trading-goals', []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<TradingGoal | null>(null);
  const [selectedTab, setSelectedTab] = useState('active');
  
  // Formulario para nuevo/editar objetivo
  const [newGoal, setNewGoal] = useState<Omit<TradingGoal, 'id'>>({
    name: '',
    type: 'profit',
    target: 0,
    current: 0,
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
  });
  
  // Actualizar los valores actuales basados en las métricas proporcionadas
  useEffect(() => {
    if (goals.length > 0) {
      const updatedGoals = goals.map(goal => {
        let currentValue = goal.current;
        
        // Solo actualizar si el objetivo está activo (no tiene fecha de fin o la fecha de fin es futura)
        const isActive = !goal.endDate || new Date(goal.endDate) > new Date();
        
        if (isActive) {
          switch (goal.type) {
            case 'profit':
              currentValue = totalProfit;
              break;
            case 'winrate':
              currentValue = winRate;
              break;
            case 'trades':
              currentValue = tradeCount;
              break;
            case 'drawdown':
              currentValue = maxDrawdown;
              break;
          }
        }
        
        return { ...goal, current: currentValue };
      });
      
      setGoals(updatedGoals);
    }
  }, [totalProfit, winRate, tradeCount, maxDrawdown]);
  
  // Manejar creación/edición de objetivo
  const handleSaveGoal = () => {
    if (editingGoal) {
      // Actualizar objetivo existente
      setGoals(goals.map(goal => 
        goal.id === editingGoal.id ? { ...newGoal, id: goal.id } : goal
      ));
    } else {
      // Crear nuevo objetivo
      setGoals([...goals, { ...newGoal, id: crypto.randomUUID() }]);
    }
    
    setIsDialogOpen(false);
    setEditingGoal(null);
    resetForm();
  };
  
  // Eliminar objetivo
  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };
  
  // Editar objetivo
  const handleEditGoal = (goal: TradingGoal) => {
    setEditingGoal(goal);
    setNewGoal({
      name: goal.name,
      type: goal.type,
      target: goal.target,
      current: goal.current,
      period: goal.period,
      startDate: goal.startDate,
      endDate: goal.endDate,
    });
    setIsDialogOpen(true);
  };
  
  // Resetear formulario
  const resetForm = () => {
    setNewGoal({
      name: '',
      type: 'profit',
      target: 0,
      current: 0,
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
    });
  };
  
  // Calcular progreso de objetivo
  const calculateProgress = (goal: TradingGoal): number => {
    if (goal.target === 0) return 0;
    
    // Para drawdown, menor es mejor
    if (goal.type === 'drawdown') {
      if (goal.current <= goal.target) return 100;
      return Math.max(0, 100 - ((goal.current - goal.target) / goal.target) * 100);
    }
    
    return Math.min(100, (goal.current / goal.target) * 100);
  };
  
  // Formatear valor según tipo
  const formatValue = (value: number, type: string): string => {
    switch (type) {
      case 'profit':
        return `$${value.toFixed(2)}`;
      case 'winrate':
        return `${value.toFixed(1)}%`;
      case 'trades':
        return value.toString();
      case 'drawdown':
        return `${value.toFixed(2)}%`;
      default:
        return value.toString();
    }
  };
  
  // Verificar si un objetivo está completado
  const isGoalCompleted = (goal: TradingGoal): boolean => {
    if (goal.type === 'drawdown') {
      return goal.current <= goal.target;
    }
    return goal.current >= goal.target;
  };
  
  // Filtrar objetivos según la pestaña seleccionada
  const filteredGoals = goals.filter(goal => {
    if (selectedTab === 'completed') {
      return isGoalCompleted(goal);
    }
    if (selectedTab === 'active') {
      return !isGoalCompleted(goal) && (!goal.endDate || new Date(goal.endDate) > new Date());
    }
    return true; // 'all'
  });
  
  return (
    <div>
      <Tabs defaultValue="active" value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList className="bg-white/10 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="active" className="text-white/80 data-[state=active]:text-white data-[state=active]:bg-white/20">Activos</TabsTrigger>
            <TabsTrigger value="completed" className="text-white/80 data-[state=active]:text-white data-[state=active]:bg-white/20">Completados</TabsTrigger>
            <TabsTrigger value="all" className="text-white/80 data-[state=active]:text-white data-[state=active]:bg-white/20">Todos</TabsTrigger>
          </TabsList>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/15 hover:border-white/30 rounded-xl transition-all duration-200"
                onClick={() => {
                  setEditingGoal(null);
                  resetForm();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo objetivo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-white font-semibold">{editingGoal ? 'Editar objetivo' : 'Nuevo objetivo'}</DialogTitle>
                <DialogDescription className="text-white/70">
                  Define un objetivo de trading para hacer seguimiento a tu progreso.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white/70 font-medium">Nombre</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Objetivo mensual de ganancias"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    className="px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-white/70 font-medium">Tipo</Label>
                    <Select
                      value={newGoal.type}
                      onValueChange={(value: 'profit' | 'winrate' | 'trades' | 'drawdown') => 
                        setNewGoal({ ...newGoal, type: value })
                      }
                    >
                      <SelectTrigger id="type" className="px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/15 hover:border-white/30 rounded-xl transition-all duration-200">
                        <SelectValue placeholder="Tipo de objetivo" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                        <SelectItem value="profit" className="text-white/80 hover:text-white hover:bg-white/10">Ganancias</SelectItem>
                        <SelectItem value="winrate" className="text-white/80 hover:text-white hover:bg-white/10">Tasa de éxito</SelectItem>
                        <SelectItem value="trades" className="text-white/80 hover:text-white hover:bg-white/10">Número de trades</SelectItem>
                        <SelectItem value="drawdown" className="text-white/80 hover:text-white hover:bg-white/10">Drawdown máximo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="period" className="text-white/70 font-medium">Período</Label>
                    <Select
                      value={newGoal.period}
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => 
                        setNewGoal({ ...newGoal, period: value })
                      }
                    >
                      <SelectTrigger id="period" className="px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/15 hover:border-white/30 rounded-xl transition-all duration-200">
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                        <SelectItem value="daily" className="text-white/80 hover:text-white hover:bg-white/10">Diario</SelectItem>
                        <SelectItem value="weekly" className="text-white/80 hover:text-white hover:bg-white/10">Semanal</SelectItem>
                        <SelectItem value="monthly" className="text-white/80 hover:text-white hover:bg-white/10">Mensual</SelectItem>
                        <SelectItem value="yearly" className="text-white/80 hover:text-white hover:bg-white/10">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target" className="text-white/70 font-medium">Valor objetivo</Label>
                  <Input
                    id="target"
                    type="number"
                    placeholder="Ej: 1000"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: parseFloat(e.target.value) })}
                    className="px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
                  />
                  <p className="text-sm text-white/50">
                    {newGoal.type === 'profit' && 'Ganancia objetivo en dólares'}
                    {newGoal.type === 'winrate' && 'Tasa de éxito objetivo en porcentaje'}
                    {newGoal.type === 'trades' && 'Número de trades a realizar'}
                    {newGoal.type === 'drawdown' && 'Drawdown máximo permitido en porcentaje'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-white/70 font-medium">Fecha de inicio</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newGoal.startDate}
                      onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                      className="px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-white/70 font-medium">Fecha de fin (opcional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newGoal.endDate || ''}
                      onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value || undefined })}
                      className="px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingGoal(null);
                    resetForm();
                  }}
                  className="px-4 py-2.5 border border-white/20 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/15 hover:border-white/30 rounded-xl transition-all duration-200"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveGoal}
                  className="px-4 py-2.5 bg-blue-500/80 text-white hover:bg-blue-500 rounded-xl backdrop-blur-sm transition-all duration-200"
                >
                  {editingGoal ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <TabsContent value="active" className="m-0">
          <div className="grid gap-6 md:grid-cols-2">
            {filteredGoals.length > 0 ? (
              filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  progress={calculateProgress(goal)}
                  formatValue={formatValue}
                  onEdit={() => handleEditGoal(goal)}
                  onDelete={() => handleDeleteGoal(goal.id)}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-white/60">No hay objetivos activos. Crea un nuevo objetivo para empezar a hacer seguimiento.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="m-0">
          <div className="grid gap-6 md:grid-cols-2">
            {filteredGoals.length > 0 ? (
              filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  progress={calculateProgress(goal)}
                  formatValue={formatValue}
                  onEdit={() => handleEditGoal(goal)}
                  onDelete={() => handleDeleteGoal(goal.id)}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-white/60">No hay objetivos completados aún.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="m-0">
          <div className="grid gap-6 md:grid-cols-2">
            {filteredGoals.length > 0 ? (
              filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  progress={calculateProgress(goal)}
                  formatValue={formatValue}
                  onEdit={() => handleEditGoal(goal)}
                  onDelete={() => handleDeleteGoal(goal.id)}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-white/60">No hay objetivos. Crea un nuevo objetivo para empezar a hacer seguimiento.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente para la tarjeta de objetivo
interface GoalCardProps {
  goal: TradingGoal;
  progress: number;
  formatValue: (value: number, type: string) => string;
  onEdit: () => void;
  onDelete: () => void;
}

function GoalCard({ goal, progress, formatValue, onEdit, onDelete }: GoalCardProps) {
  const isCompleted = goal.type === 'drawdown' 
    ? goal.current <= goal.target 
    : goal.current >= goal.target;
  
  const progressColor = isCompleted 
    ? 'bg-emerald-500' 
    : progress >= 75 
      ? 'bg-amber-500' 
      : 'bg-blue-500';
  
  return (
    <Card className={cn(
      "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300",
      isCompleted && "border-emerald-500/50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base text-white">{goal.name}</CardTitle>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onEdit}
              className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200"
            >
              <Edit2 className="h-4 w-4 text-white/60" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onDelete}
              className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200"
            >
              <Trash2 className="h-4 w-4 text-white/60" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-white/60">
          {goal.period.charAt(0).toUpperCase() + goal.period.slice(1)} • 
          {goal.startDate && ` Desde ${new Date(goal.startDate).toLocaleDateString()}`}
          {goal.endDate && ` hasta ${new Date(goal.endDate).toLocaleDateString()}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="mb-3">
          <Progress value={progress} className={`h-3 ${progressColor} rounded-full`} />
        </div>
        <div className="flex justify-between text-sm">
          <div>
            <span className="text-white/60">Actual: </span>
            <span className="text-white font-medium">{formatValue(goal.current, goal.type)}</span>
          </div>
          <div>
            <span className="text-white/60">Objetivo: </span>
            <span className="text-white font-medium">{formatValue(goal.target, goal.type)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        <div className="w-full flex justify-between items-center">
          <span className="text-sm text-white/60">
            {isCompleted 
              ? '¡Objetivo completado!' 
              : `Progreso: ${Math.round(progress)}%`}
          </span>
          {isCompleted && (
            <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
              Completado
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
} 