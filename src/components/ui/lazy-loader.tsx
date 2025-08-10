'use client';

import { Suspense, lazy, ComponentType } from 'react';
import { ModalSkeleton, FormSkeleton } from './skeletons';

interface LazyLoaderProps {
  component: ComponentType<any>;
  fallback?: React.ReactNode;
  props?: any;
}

// Componente genérico para lazy loading
export function LazyLoader({ 
  component: Component, 
  fallback = <FormSkeleton />, 
  props = {} 
}: LazyLoaderProps) {
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
}

// Lazy loading específico para modales
export function LazyModal({ 
  component: Component, 
  fallback = <ModalSkeleton />, 
  props = {} 
}: LazyLoaderProps) {
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
}

// Lazy loading específico para formularios
export function LazyForm({ 
  component: Component, 
  fallback = <FormSkeleton />, 
  props = {} 
}: LazyLoaderProps) {
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
}

// Función helper para crear componentes lazy
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <FormSkeleton />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
} 