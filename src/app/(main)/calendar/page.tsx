import { TradesCalendar } from "@/components/trades-calendar";

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
        <h1 className="text-3xl font-bold text-white mb-2">Calendario de Trades</h1>
        <p className="text-white/70">
          Visualiza tus trades en un calendario para identificar patrones y tendencias.
        </p>
      </div>
      
      {/* Calendario */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <TradesCalendar />
      </div>
    </div>
  );
} 