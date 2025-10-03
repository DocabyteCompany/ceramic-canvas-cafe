import { useState, useEffect, useCallback, useRef } from 'react';
import { useReservations } from './useReservations';
import { useTimeSlots } from './useTimeSlots';
import { useCache } from './useCache';
import type { TimeSlotWithAvailability } from '@/services/timeSlotsService';

export interface AvailabilityData {
  timeSlotId: number;
  date: string;
  available: number;
  maxCapacity: number;
  canReserve: boolean;
  occupancyPercentage: number;
  isAvailable: boolean;
}

export interface UseAvailabilityOptimizedReturn {
  availability: AvailabilityData[];
  loading: boolean;
  error: string | null;
  getAvailabilityForDate: (date: string) => Promise<AvailabilityData[]>;
  checkSpecificAvailability: (timeSlotId: number, date: string, requestedGuests?: number) => Promise<AvailabilityData | null>;
  refreshAvailability: (date: string) => Promise<void>;
  cacheStats: {
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
  };
}

export const useAvailabilityOptimized = (): UseAvailabilityOptimizedReturn => {
  const [availability, setAvailability] = useState<AvailabilityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { checkAvailability } = useReservations();
  const { getTimeSlotsForDate } = useTimeSlots();
  
  // Cache para disponibilidad (TTL de 1 minuto)
  const availabilityCache = useCache<AvailabilityData[]>({ 
    ttl: 60 * 1000, 
    maxSize: 50 
  });

  // Cache para verificaciones específicas (TTL de 30 segundos)
  const specificAvailabilityCache = useCache<AvailabilityData>({ 
    ttl: 30 * 1000, 
    maxSize: 100 
  });

  // Debounce timer para evitar llamadas excesivas
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Función de debounce para verificaciones de disponibilidad
  const debouncedCheck = useCallback((fn: () => void, delay: number = 500) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(fn, delay);
  }, []);

  // Obtener disponibilidad para una fecha específica con caché y optimización
  const getAvailabilityForDate = useCallback(async (date: string): Promise<AvailabilityData[]> => {
    const cacheKey = `availability-${date}`;
    const cached = availabilityCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      setLoading(true);
      setError(null);

      // Validar que la fecha no sea pasada
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setError('No se pueden hacer reservaciones para fechas pasadas');
        return [];
      }

      // Validar que sea un día laboral
      const dayOfWeek = selectedDate.getDay();
      if (![0, 2, 3, 4, 5].includes(dayOfWeek)) {
        setError('Solo se permiten reservaciones de martes a viernes y domingos');
        return [];
      }

      // Obtener time slots para la fecha
      const timeSlots = await getTimeSlotsForDate(date);
      
      if (timeSlots.length === 0) {
        setError('No hay horarios disponibles para esta fecha');
        return [];
      }

      // Obtener IDs de time slots para consulta optimizada
      const timeSlotIds = timeSlots.map(slot => slot.id);
      
      // Verificar disponibilidad para todos los time slots en paralelo
      const availabilityPromises = timeSlotIds.map(async (timeSlotId) => {
        const specificCacheKey = `specific-${timeSlotId}-${date}`;
        const cachedSpecific = specificAvailabilityCache.get(specificCacheKey);
        
        if (cachedSpecific) {
          return cachedSpecific;
        }

        const { available, canReserve, error } = await checkAvailability(timeSlotId, date);
        
        if (error) {
          console.error(`Error verificando disponibilidad para slot ${timeSlotId}:`, error);
          return null;
        }

        const timeSlot = timeSlots.find(slot => slot.id === timeSlotId);
        if (!timeSlot) return null;

        const occupancyPercentage = ((timeSlot.max_capacity - available) / timeSlot.max_capacity) * 100;

        const result = {
          timeSlotId,
          date,
          available,
          maxCapacity: timeSlot.max_capacity,
          canReserve,
          occupancyPercentage,
          isAvailable: available > 0
        };

        // Guardar en caché específico
        specificAvailabilityCache.set(specificCacheKey, result);
        
        return result;
      });

      const availabilityResults = await Promise.all(availabilityPromises);
      const validResults = availabilityResults.filter((result): result is AvailabilityData => result !== null);

      // Guardar en caché principal
      availabilityCache.set(cacheKey, validResults);

      return validResults;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getTimeSlotsForDate, checkAvailability, availabilityCache, specificAvailabilityCache]);

  // Verificar disponibilidad para un time slot específico con caché
  const checkSpecificAvailability = useCallback(async (
    timeSlotId: number, 
    date: string, 
    requestedGuests: number = 1
  ): Promise<AvailabilityData | null> => {
    const cacheKey = `specific-${timeSlotId}-${date}`;
    const cached = specificAvailabilityCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const { available, canReserve, error } = await checkAvailability(timeSlotId, date, requestedGuests);
      
      if (error) {
        setError(error);
        return null;
      }

      // Obtener información del time slot para calcular porcentaje de ocupación
      const timeSlots = await getTimeSlotsForDate(date);
      const timeSlot = timeSlots.find(slot => slot.id === timeSlotId);
      
      if (!timeSlot) {
        setError('Time slot no encontrado');
        return null;
      }

      const occupancyPercentage = ((timeSlot.max_capacity - available) / timeSlot.max_capacity) * 100;

      const result = {
        timeSlotId,
        date,
        available,
        maxCapacity: timeSlot.max_capacity,
        canReserve,
        occupancyPercentage,
        isAvailable: available > 0
      };

      // Guardar en caché
      specificAvailabilityCache.set(cacheKey, result);
      
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [checkAvailability, getTimeSlotsForDate, specificAvailabilityCache]);

  // Refrescar disponibilidad para una fecha (invalida caché)
  const refreshAvailability = useCallback(async (date: string) => {
    const cacheKey = `availability-${date}`;
    availabilityCache.invalidate(cacheKey);
    
    // Invalidar también las verificaciones específicas para esta fecha
    const timeSlots = await getTimeSlotsForDate(date);
    timeSlots.forEach(slot => {
      const specificCacheKey = `specific-${slot.id}-${date}`;
      specificAvailabilityCache.invalidate(specificCacheKey);
    });
    
    const newAvailability = await getAvailabilityForDate(date);
    setAvailability(newAvailability);
  }, [getAvailabilityForDate, availabilityCache, specificAvailabilityCache, getTimeSlotsForDate]);

  // Función para actualizar disponibilidad localmente después de una reservación
  const updateAvailabilityAfterReservation = useCallback((timeSlotId: number, guests: number) => {
    setAvailability(prev => prev.map(item => {
      if (item.timeSlotId === timeSlotId) {
        const newAvailable = Math.max(0, item.available - guests);
        const newOccupancyPercentage = ((item.maxCapacity - newAvailable) / item.maxCapacity) * 100;
        
        return {
          ...item,
          available: newAvailable,
          canReserve: newAvailable > 0,
          occupancyPercentage: newOccupancyPercentage,
          isAvailable: newAvailable > 0
        };
      }
      return item;
    }));
  }, []);

  // Limpiar caché expirado periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      availabilityCache.cleanup();
      specificAvailabilityCache.cleanup();
    }, 30000); // Limpiar cada 30 segundos

    return () => clearInterval(interval);
  }, [availabilityCache, specificAvailabilityCache]);

  // Limpiar timer de debounce al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    availability,
    loading,
    error,
    getAvailabilityForDate,
    checkSpecificAvailability,
    refreshAvailability,
    cacheStats: availabilityCache.getStats()
  };
};


