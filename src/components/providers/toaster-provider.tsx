'use client';

import { Toaster as Sonner } from 'sonner';

export function ToasterProvider() {
  return (
    <Sonner
      position="top-center"
      expand={false}
      closeButton={true}
      visibleToasts={3}
      richColors
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'calc(var(--radius) - 2px)',
          zIndex: '9999',
        },
        className: 'toast-custom',
        classNames: {
          toast: 'group toast-custom',
          success: 'toast-success',
          error: 'toast-error',
          warning: 'toast-warning',
          info: 'toast-info',
          closeButton: 'bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white rounded-full'
        },
        duration: 3000,
      }}
    />
  );
} 