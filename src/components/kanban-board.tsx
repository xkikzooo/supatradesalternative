'use client';

import { useMemo, useState, useEffect, type ReactNode } from 'react';
import { Plus, Clock, TrendingUp, CheckCircle, Flame, Percent } from 'lucide-react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCorners, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type ColumnId = 'quemado' | 'en-espera' | 'en-evaluacion' | 'fondeada';

type KanbanItem = {
  id: string;
  accountName: string;
  propFirm: string;
  minisRisk: string; // "Riesgo por trade en Minis"
  status: ColumnId;
  createdAt: string; // ISO
  percent: number; // porcentaje de la cuenta
};

const COLUMNS: { id: ColumnId; title: string; color: string; icon: React.ReactNode }[] = [
  { id: 'quemado', title: 'Quemado', color: 'bg-red-500/20 border-red-500/30', icon: <Flame className="h-5 w-5 text-red-400" /> },
  { id: 'en-espera', title: 'En Espera', color: 'bg-yellow-500/20 border-yellow-500/30', icon: <Clock className="h-5 w-5 text-yellow-400" /> },
  { id: 'en-evaluacion', title: 'En Evaluación', color: 'bg-blue-500/20 border-blue-500/30', icon: <TrendingUp className="h-5 w-5 text-blue-400" /> },
  { id: 'fondeada', title: 'Fondeada', color: 'bg-green-500/20 border-green-500/30', icon: <CheckCircle className="h-5 w-5 text-green-400" /> },
];

function ColumnDroppable({ id, children }: { id: ColumnId; children: ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef}>
      {children}
    </div>
  );
}

function daysLeft(createdAtISO: string) {
  const created = new Date(createdAtISO).getTime();
  const now = Date.now();
  const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  const remaining = 30 - diffDays;
  return remaining > 0 ? remaining : 0;
}

function KanbanCard({ item, onClick }: { item: KanbanItem; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  const remaining = daysLeft(item.createdAt);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`rounded-lg bg-[#0A0A0A]/60 p-3 border border-white/10 backdrop-blur-sm mb-3 ${isDragging ? 'rotate-1 scale-[1.01]' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-white text-sm font-medium truncate">{item.accountName}</h4>
        <button onClick={onClick} className="px-1.5 py-0.5 text-[11px] rounded-md bg-white/10 text-white/80 hover:bg-white/20 flex items-center gap-1">
          <Percent className="h-3 w-3" /> {item.percent}%
        </button>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/70 truncate">{item.propFirm}</span>
        <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10 truncate">{item.minisRisk}</span>
      </div>
      <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
        <span className="text-white/60">Evaluación</span>
        <span className={`px-2 py-0.5 rounded-full ${remaining > 0 ? 'bg-white/10 text-white/80' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>{remaining} días</span>
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [items, setItems] = useLocalStorage<KanbanItem[]>('kanban_items_v1', []);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPercentOpen, setIsPercentOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const byColumn = useMemo(() => {
    const map: Record<ColumnId, KanbanItem[]> = {
      'quemado': [], 'en-espera': [], 'en-evaluacion': [], 'fondeada': []
    };
    items.forEach(it => map[it.status].push(it));
    return map;
  }, [items]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Destination container via dnd-kit sortable data
    let destContainer = (over.data.current as any)?.sortable?.containerId as ColumnId | undefined;

    // If dropped over empty space in a column, over.id is the column id
    if (!destContainer && (['quemado','en-espera','en-evaluacion','fondeada'] as string[]).includes(overId)) {
      destContainer = overId as ColumnId;
    }

    if (!destContainer) return;

    // Only update status if container changed or to ensure consistency
    setItems(prev => prev.map(it => it.id === activeId ? { ...it, status: destContainer! } : it));
  };

  const [form, setForm] = useState({ accountName: '', propFirm: '', minisRisk: '', status: 'en-espera' as ColumnId });
  const createItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: KanbanItem = {
      id: crypto.randomUUID(),
      accountName: form.accountName.trim(),
      propFirm: form.propFirm.trim(),
      minisRisk: form.minisRisk.trim(),
      status: form.status,
      createdAt: new Date().toISOString(),
      percent: 0,
    };
    setItems(prev => [...prev, newItem]);
    setIsCreateOpen(false);
    setForm({ accountName: '', propFirm: '', minisRisk: '', status: 'en-espera' });
  };

  const openPercentModal = (id: string) => {
    setSelectedId(id);
    setIsPercentOpen(true);
  };

  const selected = selectedId ? items.find(i => i.id === selectedId) : undefined;
  const [percentInput, setPercentInput] = useState<string>('0');
  // Sync modal input when selected changes
  useEffect(() => {
    if (selected) setPercentInput(String(selected.percent ?? 0));
  }, [selected]);

  const submitPercent = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Math.max(0, Math.min(100, Number(percentInput)));
    if (Number.isNaN(value)) return;
    if (!selectedId) return;
    setItems(prev => prev.map(it => it.id === selectedId ? { ...it, percent: value } : it));
    setIsPercentOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Tablero Kanban</h1>
            <p className="text-white/70">Gestiona estados de evaluación de tus cuentas</p>
          </div>
          <button onClick={() => setIsCreateOpen(true)} className="px-4 py-2.5 bg-blue-500/80 hover:bg-blue-500 text-white rounded-xl transition-all duration-200 backdrop-blur-sm flex items-center gap-2">
            <Plus className="h-5 w-5" /> Crear ítem
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {COLUMNS.map(col => (
            <ColumnDroppable key={col.id} id={col.id}>
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border ${col.color} backdrop-blur-sm flex items-center gap-3`}>
                  {col.icon}
                  <h3 className="text-lg font-semibold text-white">{col.title}</h3>
                  <span className="ml-auto px-2 py-1 bg-white/10 text-white/80 text-sm rounded-full">{byColumn[col.id].length}</span>
                </div>

                <SortableContext id={col.id} items={byColumn[col.id].map(i => i.id)} strategy={verticalListSortingStrategy}>
                  <div id={col.id} className="min-h-[420px] p-4 rounded-xl border bg-white/5 border-white/10 backdrop-blur-sm">
                    {byColumn[col.id].map(item => (
                      <KanbanCard key={item.id} item={item} onClick={() => openPercentModal(item.id)} />
                    ))}
                  </div>
                </SortableContext>
              </div>
            </ColumnDroppable>
          ))}
        </div>
      </DndContext>

      {/* Modal Crear Item */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Nuevo ítem</DialogTitle>
          </DialogHeader>
          <form onSubmit={createItem} className="space-y-4">
            <div>
              <label className="text-sm text-white/80">Nombre de la cuenta</label>
              <Input value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} required className="bg-white/10 border-white/20 text-white" />
            </div>
            <div>
              <label className="text-sm text-white/80">Prop Firm</label>
              <Input value={form.propFirm} onChange={(e) => setForm({ ...form, propFirm: e.target.value })} required className="bg-white/10 border-white/20 text-white" />
            </div>
            <div>
              <label className="text-sm text-white/80">Riesgo por trade en Minis</label>
              <Input value={form.minisRisk} onChange={(e) => setForm({ ...form, minisRisk: e.target.value })} required className="bg-white/10 border-white/20 text-white" />
            </div>
            <div>
              <label className="text-sm text-white/80">Estado inicial</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ColumnId })} className="w-full rounded-md bg-white/10 border border-white/20 text-white px-3 py-2">
                {COLUMNS.map(c => <option key={c.id} value={c.id} className="bg-black">{c.title}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="bg-white/10 border-white/20 text-white/80">Cancelar</Button>
              <Button type="submit" className="bg-blue-500/80 hover:bg-blue-500 text-white">Crear</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Porcentaje */}
      <Dialog open={isPercentOpen} onOpenChange={setIsPercentOpen}>
        <DialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Actualizar porcentaje</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitPercent} className="space-y-4">
            <div>
              <label className="text-sm text-white/80">Porcentaje de la cuenta (0-100)</label>
              <Input type="number" min={0} max={100} step={1} value={percentInput} onChange={(e) => setPercentInput(e.target.value)} className="bg-white/10 border-white/20 text-white" />
            </div>
            {selected && (
              <p className="text-xs text-white/60">Editando: <span className="text-white">{selected.accountName}</span></p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsPercentOpen(false)} className="bg-white/10 border-white/20 text-white/80">Cancelar</Button>
              <Button type="submit" className="bg-blue-500/80 hover:bg-blue-500 text-white">Guardar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}