import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Estado para almacenar nuestro valor
  // Pasa la función de inicialización a useState para que la lógica se ejecute solo una vez
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // Obtener del localStorage por clave
      const item = window.localStorage.getItem(key);
      // Parsear el JSON almacenado o devolver initialValue si no hay nada
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Si hay error, devolver el valor inicial
      console.error(error);
      return initialValue;
    }
  });
  
  // Función para actualizar tanto el state como el localStorage
  const setValue = (value: T) => {
    try {
      // Permitir que value sea una función para seguir el mismo patrón que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Guardar al estado
      setStoredValue(valueToStore);
      // Guardar a localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  // Efecto para manejar cambios en localStorage de otras ventanas/tabs
  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue));
      }
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [key]);
  
  return [storedValue, setValue];
} 