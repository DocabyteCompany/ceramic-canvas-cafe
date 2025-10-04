import { useState, useEffect, useCallback } from 'react';
import { TimeSlotsService, type TimeSlotWithAvailability, type DayTimeSlots } from '@/services/timeSlotsService';
import { useCache } from './useCache';

export interface UseTimeSlotsOptimizedReturn {
  timeSlots: TimeSlotWithAvailability[];
  groupedTimeSlots: DayTimeSlots[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getTimeSlotsForDate: (date: string) => Promise<TimeSlotWithAvailability[]>;
  isDayAvailable: (dayOfWeek: number) => boolean;
  cacheStats: {
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
  };
}

export const useTimeSlotsOptimized = (): UseTimeSlotsOptimizedReturn => {
  const [timeSlots, setTimeSlots] = useState<TimeSlotWithAvailability[]>([]);
  const [groupedTimeSlots, setGroupedTimeSlots] = useState<DayTimeSlots[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache para time slots (TTL de 10 minutos)
  const timeSlotsCache = useCache<TimeSlotWithAvailability[]>({ 
    ttl: 10 * 60 * 1000, 
    maxSize: 50 
  });

  // Cache para time slots agrupados (TTL de 30 minutos)
  const groupedTimeSlotsCache = useCache<DayTimeSlots[]>({ 
    ttl: 30 * 60 * 1000, 
    maxSize: 10 
  });

  // Cache para disponibilidad por fecha (TTL de 2 minutos)
  const availabilityCache = useCache<TimeSlotWithAvailability[]>({ 
    ttl: 2 * 60 * 1000, 
    maxSize: 100 
  });

  // Cargar todos los time slots con caché
  const loadTimeSlots = useCallback(async () => {
    const cacheKey = 'all-time-slots';
    const cached = timeSlotsCache.get(cacheKey);
    
    if (cached) {
      setTimeSlots(cached);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await TimeSlotsService.getAllTimeSlots();
      
      if (error) {
        setError(error);
        return;
      }

      if (data) {
        // Convertir a TimeSlotWithAvailability con disponibilidad por defecto
        const timeSlotsWithAvailability = data.map(slot => ({
          ...slot,
          available: slot.max_capacity,
          isAvailable: true,
          occupancyPercentage: 0
        }));

        // Guardar en caché
        timeSlotsCache.set(cacheKey, timeSlotsWithAvailability);
        setTimeSlots(timeSlotsWithAvailability);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [timeSlotsCache]);

  // Cargar time slots agrupados con caché
  const loadGroupedTimeSlots = useCallback(async () => {
    const cacheKey = 'grouped-time-slots';
    const cached = groupedTimeSlotsCache.get(cacheKey);
    
    if (cached) {
      setGroupedTimeSlots(cached);
      return;
    }

    try {
      const { data, error } = await TimeSlotsService.getTimeSlotsByDayGrouped();
      
      if (error) {
        setError(error);
        return;
      }

      if (data) {
        // Guardar en caché
        groupedTimeSlotsCache.set(cacheKey, data);
        setGroupedTimeSlots(data);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [groupedTimeSlotsCache]);

  // Obtener time slots con disponibilidad para una fecha específica con caché
  const getTimeSlotsForDate = useCallback(async (date: string): Promise<TimeSlotWithAvailability[]> => {
    const cacheKey = `availability-${date}`;
    const cached = availabilityCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const timeSlots = await TimeSlotsService.getTimeSlotsWithAvailability(date);
      
      if (timeSlots.data) {
        // Guardar en caché
        availabilityCache.set(cacheKey, timeSlots.data);
        return timeSlots.data;
      }
      
      return [];
    } catch (err: any) {
      console.error('Error al obtener time slots para fecha:', err.message);
      return [];
    }
  }, [availabilityCache]);

  // Verificar si un día está disponible
  const isDayAvailable = useCallback((dayOfWeek: number): boolean => {
    return TimeSlotsService.isDayAvailable(dayOfWeek);
  }, []);

  // Función para recargar datos (invalida caché)
  const refetch = useCallback(async () => {
    // Limpiar caché
    timeSlotsCache.clear();
    groupedTimeSlotsCache.clear();
    availabilityCache.clear();
    
    // Recargar datos
    await Promise.all([
      loadTimeSlots(),
      loadGroupedTimeSlots()
    ]);
  }, [loadTimeSlots, loadGroupedTimeSlots, timeSlotsCache, groupedTimeSlotsCache, availabilityCache]);

  // Cargar datos al montar el hook
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Limpiar caché expirado periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      timeSlotsCache.cleanup();
      groupedTimeSlotsCache.cleanup();
      availabilityCache.cleanup();
    }, 60000); // Limpiar cada minuto

    return () => clearInterval(interval);
  }, [timeSlotsCache, groupedTimeSlotsCache, availabilityCache]);

  return {
    timeSlots,
    groupedTimeSlots,
    loading,
    error,
    refetch,
    getTimeSlotsForDate,
    isDayAvailable,
    cacheStats: timeSlotsCache.getStats()
  };
};






