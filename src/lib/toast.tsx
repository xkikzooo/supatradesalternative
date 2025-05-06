import React from 'react';
import { toast } from 'sonner';
import { 
  BadgeCheck,
  AlertOctagon,
  Bell,
  ShieldAlert,
} from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

// Componente personalizado para el botón de cierre
const CloseButton = ({ closeToast }: { closeToast: () => void }) => {
  return (
    <button
      onClick={closeToast}
      className="absolute top-1 right-1 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
      aria-label="Cerrar notificación"
    >
      <X className="h-4 w-4 text-zinc-300" />
    </button>
  );
};

export function showToast(message: string, type: ToastType = 'success') {
  let icon: React.ReactNode = null;
  
  switch (type) {
    case 'success':
      icon = <BadgeCheck className="h-5 w-5 text-green-500" />;
      break;
    case 'error':
      icon = <AlertOctagon className="h-5 w-5 text-red-500" />;
      break;
    case 'warning':
      icon = <ShieldAlert className="h-5 w-5 text-yellow-500" />;
      break;
    case 'info':
      icon = <Bell className="h-5 w-5 text-blue-500" />;
      break;
  }
  
  // Duración según el tipo
  const duration = type === 'error' ? 5000 : 
                  type === 'warning' ? 4000 : 3000;
  
  // Limpiar toasts existentes si es un error o advertencia
  if (type === 'error' || type === 'warning') {
    toast.dismiss();
  }
  
  return toast(message, {
    className: `toast-${type}`,
    duration: duration,
    icon,
    style: {
      zIndex: 9999,
    },
  });
} 