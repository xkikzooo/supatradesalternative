'use client';

import { Toaster as Sonner } from 'sonner';

export function ToasterProvider() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'calc(var(--radius) - 2px)',
        },
        className: 'toast-custom',
        classNames: {
          toast: 'group toast-custom',
          success: 'toast-success',
          error: 'toast-error',
          warning: 'toast-warning',
          info: 'toast-info',
        },
        duration: 4000,
        closeButton: true,
      }}
    />
  );
} 