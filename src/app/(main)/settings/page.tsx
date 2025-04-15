import { SettingsForm } from "@/components/settings-form";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-sm text-gray-400">
          Administra tu cuenta y preferencias.
        </p>
      </div>
      <SettingsForm />
    </div>
  );
} 