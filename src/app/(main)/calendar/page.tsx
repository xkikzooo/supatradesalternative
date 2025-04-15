import { TradesCalendar } from "@/components/trades-calendar";

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Calendario</h1>
        <p className="text-sm text-gray-400">
          Visualiza tus trades en un calendario para identificar patrones y tendencias.
        </p>
      </div>
      <TradesCalendar />
    </div>
  );
} 