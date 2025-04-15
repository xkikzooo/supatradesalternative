'use client';

import { Toaster as Sonner } from 'sonner';

export function ToasterProvider() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
        className: 'toast-custom',
        duration: 3000,
        closeButton: true,
      }}
    />
  );
} 