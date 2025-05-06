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
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="active">Activos</TabsTrigger>
            <TabsTrigger value="completed">Completados</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => {
                setEditingGoal(null);
                resetForm();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo objetivo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGoal ? 'Editar objetivo' : 'Nuevo objetivo'}</DialogTitle>
                <DialogDescription>
                  Define un objetivo de trading para hacer seguimiento a tu progreso.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Objetivo mensual de ganancias"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={newGoal.type}
                      onValueChange={(value: 'profit' | 'winrate' | 'trades' | 'drawdown') => 
                        setNewGoal({ ...newGoal, type: value })
                      }
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Tipo de objetivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="profit">Ganancias</SelectItem>
                        <SelectItem value="winrate">Tasa de éxito</SelectItem>
                        <SelectItem value="trades">Número de trades</SelectItem>
                        <SelectItem value="drawdown">Drawdown máximo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="period">Período</Label>
                    <Select
                      value={newGoal.period}
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => 
                        setNewGoal({ ...newGoal, period: value })
                      }
                    >
                      <SelectTrigger id="period">
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diario</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target">Valor objetivo</Label>
                  <Input
                    id="target"
                    type="number"
                    placeholder="Ej: 1000"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: parseFloat(e.target.value) })}
                  />
                  <p className="text-sm text-gray-500">
                    {newGoal.type === 'profit' && 'Ganancia objetivo en dólares'}
                    {newGoal.type === 'winrate' && 'Tasa de éxito objetivo en porcentaje'}
                    {newGoal.type === 'trades' && 'Número de trades a realizar'}
                    {newGoal.type === 'drawdown' && 'Drawdown máximo permitido en porcentaje'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha de inicio</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newGoal.startDate}
                      onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Fecha de fin (opcional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newGoal.endDate || ''}
                      onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value || undefined })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  setEditingGoal(null);
                  resetForm();
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveGoal}>
                  {editingGoal ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <TabsContent value="active" className="m-0">
          <div className="grid gap-4 md:grid-cols-2">
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
                <p className="text-gray-500">No hay objetivos activos. Crea un nuevo objetivo para empezar a hacer seguimiento.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="m-0">
          <div className="grid gap-4 md:grid-cols-2">
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
                <p className="text-gray-500">No hay objetivos completados aún.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="m-0">
          <div className="grid gap-4 md:grid-cols-2">
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
                <p className="text-gray-500">No hay objetivos. Crea un nuevo objetivo para empezar a hacer seguimiento.</p>
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
    ? 'bg-green-500' 
    : progress >= 75 
      ? 'bg-amber-500' 
      : 'bg-blue-500';
  
  return (
    <Card className={isCompleted ? 'border-green-500/50' : ''}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{goal.name}</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          {goal.period.charAt(0).toUpperCase() + goal.period.slice(1)} • 
          {goal.startDate && ` Desde ${new Date(goal.startDate).toLocaleDateString()}`}
          {goal.endDate && ` hasta ${new Date(goal.endDate).toLocaleDateString()}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="mb-2">
          <Progress value={progress} className={`h-2 ${progressColor}`} />
        </div>
        <div className="flex justify-between text-sm">
          <div>
            <span className="text-gray-500">Actual: </span>
            <span>{formatValue(goal.current, goal.type)}</span>
          </div>
          <div>
            <span className="text-gray-500">Objetivo: </span>
            <span>{formatValue(goal.target, goal.type)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="w-full flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {isCompleted 
              ? '¡Objetivo completado!' 
              : `Progreso: ${Math.round(progress)}%`}
          </span>
          {isCompleted && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
              Completado
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
} 