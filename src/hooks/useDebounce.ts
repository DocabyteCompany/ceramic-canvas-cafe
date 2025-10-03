import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseDebounceOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
}

export const useDebounce = <T>(
  value: T, 
  options: UseDebounceOptions = {}
): T => {
  const { delay = 500, leading = false, trailing = true } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstCallRef = useRef(true);

  useEffect(() => {
    // Si es la primera llamada y leading es true, ejecutar inmediatamente
    if (isFirstCallRef.current && leading) {
      setDebouncedValue(value);
      isFirstCallRef.current = false;
      return;
    }

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Si trailing es true, configurar nuevo timeout
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
        isFirstCallRef.current = true;
      }, delay);
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, leading, trailing]);

  return debouncedValue;
};

export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500,
  options: { leading?: boolean; trailing?: boolean } = {}
): T => {
  const { leading = false, trailing = true } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstCallRef = useRef(true);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Si es la primera llamada y leading es true, ejecutar inmediatamente
      if (isFirstCallRef.current && leading) {
        callback(...args);
        isFirstCallRef.current = false;
        return;
      }

      // Limpiar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Si trailing es true, configurar nuevo timeout
      if (trailing) {
        timeoutRef.current = setTimeout(() => {
          callback(...args);
          isFirstCallRef.current = true;
        }, delay);
      }
    },
    [callback, delay, leading, trailing]
  ) as T;

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

export const useDebouncedState = <T>(
  initialValue: T,
  delay: number = 500
): [T, T, (value: T) => void] => {
  const [value, setValue] = useState<T>(initialValue);
  const debouncedValue = useDebounce(value, { delay });

  return [value, debouncedValue, setValue];
};


