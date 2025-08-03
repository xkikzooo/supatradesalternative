import { SettingsForm } from "@/components/settings-form";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
        <h1 className="text-3xl font-bold text-white mb-2">Configuración</h1>
        <p className="text-white/70">
          Administra tu cuenta y preferencias de trading.
        </p>
      </div>
      
      {/* Contenido */}
      <div className="space-y-6">
        <SettingsForm />
      </div>
    </div>
  );
} 