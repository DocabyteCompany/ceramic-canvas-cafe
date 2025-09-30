import { useState, useEffect, useCallback } from 'react';
import { useReservations } from './useReservations';
import { useTimeSlots } from './useTimeSlots';
import { TimeSlotsService } from '@/services/timeSlotsService';
import type { TimeSlotWithAvailability } from '@/services/timeSlotsService';
import { parseISO, startOfDay } from 'date-fns';

export interface AvailabilityData {
  timeSlotId: number;
  date: string;
  available: number;
  maxCapacity: number;
  canReserve: boolean;
  occupancyPercentage: number;
  isAvailable: boolean;
}

export interface UseAvailabilityReturn {
  availability: TimeSlotWithAvailability[];
  loading: boolean;
  error: string | null;
  getAvailabilityForDate: (date: string) => Promise<TimeSlotWithAvailability[]>;
  checkSpecificAvailability: (timeSlotId: number, date: string, requestedGuests?: number) => Promise<TimeSlotWithAvailability | null>;
  refreshAvailability: (date: string) => Promise<void>;
}

export const useAvailability = (): UseAvailabilityReturn => {
  const [availability, setAvailability] = useState<TimeSlotWithAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { checkAvailability } = useReservations();
  const { getTimeSlotsForDate } = useTimeSlots();

  // Obtener disponibilidad para una fecha específica
  const getAvailabilityForDate = useCallback(async (date: string): Promise<TimeSlotWithAvailability[]> => {
    console.log('🔍 useAvailability - getAvailabilityForDate llamada con fecha:', date);
    try {
      setLoading(true);
      setError(null);

      // Validar que la fecha no sea pasada - CORREGIDO: usar parseISO y startOfDay
      const selectedDate = startOfDay(parseISO(date));
      const today = startOfDay(new Date());
      
      console.log('🔍 useAvailability - Validando fecha:', {
        selectedDate,
        today,
        isPast: selectedDate < today
      });
      
      if (selectedDate < today) {
        console.log('❌ useAvailability - Fecha pasada, retornando array vacío');
        setError('No se pueden hacer reservaciones para fechas pasadas');
        return [];
      }

      // Validar que sea un día laboral
      const dayOfWeek = selectedDate.getDay();
      console.log('🔍 useAvailability - Día de la semana:', dayOfWeek, 'Días permitidos:', [0, 2, 3, 4, 5, 6]);
      
      if (![0, 2, 3, 4, 5, 6].includes(dayOfWeek)) {
        console.log('❌ useAvailability - Día no laboral, retornando array vacío');
        setError('Solo se permiten reservaciones de martes a sábado y domingo');
        return [];
      }

      // Obtener time slots con disponibilidad directamente del servicio
      console.log('🔍 useAvailability - Llamando a TimeSlotsService.getTimeSlotsWithAvailability...');
      const { data: timeSlots, error: timeSlotsError } = await TimeSlotsService.getTimeSlotsWithAvailability(date);
      
      console.log('🔍 useAvailability - Respuesta del servicio:', {
        timeSlots: timeSlots?.length || 0,
        timeSlotsError,
        data: timeSlots
      });
      
      if (timeSlotsError) {
        console.log('❌ useAvailability - Error del servicio:', timeSlotsError);
        setError(timeSlotsError);
        return [];
      }
      
      if (!timeSlots || timeSlots.length === 0) {
        console.log('❌ useAvailability - No hay time slots disponibles');
        setError('No hay horarios disponibles para esta fecha');
        return [];
      }

      // Devolver los time slots directamente (ya tienen toda la información necesaria)
      console.log('🔍 useAvailability - Resultados convertidos:', timeSlots);
      return timeSlots;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [checkAvailability]);

  // Verificar disponibilidad para un time slot específico
  const checkSpecificAvailability = useCallback(async (
    timeSlotId: number, 
    date: string, 
    requestedGuests: number = 1
  ): Promise<TimeSlotWithAvailability | null> => {
    try {
      const { available, canReserve, error } = await checkAvailability(timeSlotId, date, requestedGuests);
      
      if (error) {
        setError(error);
        return null;
      }

      // Obtener información del time slot para calcular porcentaje de ocupación
      const { data: timeSlots, error: timeSlotsError } = await TimeSlotsService.getTimeSlotsWithAvailability(date);
      
      if (timeSlotsError) {
        setError(timeSlotsError);
        return null;
      }
      
      const timeSlot = timeSlots?.find(slot => slot.id === timeSlotId);
      
      if (!timeSlot) {
        setError('Time slot no encontrado');
        return null;
      }

      return timeSlot;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [checkAvailability]);

  // Refrescar disponibilidad para una fecha
  const refreshAvailability = useCallback(async (date: string) => {
    const newAvailability = await getAvailabilityForDate(date);
    setAvailability(newAvailability);
  }, [getAvailabilityForDate]);

  // Función para actualizar disponibilidad localmente después de una reservación
  const updateAvailabilityAfterReservation = useCallback((timeSlotId: number, guests: number) => {
    setAvailability(prev => prev.map(item => {
      if (item.id === timeSlotId) {
        const newAvailable = Math.max(0, item.available - guests);
        const newOccupancyPercentage = ((item.max_capacity - newAvailable) / item.max_capacity) * 100;
        
        return {
          ...item,
          available: newAvailable,
          isAvailable: newAvailable > 0,
          occupancyPercentage: newOccupancyPercentage
        };
      }
      return item;
    }));
  }, []);

  // Función para verificar si hay suficiente disponibilidad para un número específico de huéspedes
  const hasEnoughAvailability = useCallback((timeSlotId: number, requestedGuests: number): boolean => {
    const slotAvailability = availability.find(item => item.id === timeSlotId);
    return slotAvailability ? slotAvailability.available >= requestedGuests : false;
  }, [availability]);

  // Función para obtener el porcentaje de ocupación de un time slot
  const getOccupancyPercentage = useCallback((timeSlotId: number): number => {
    const slotAvailability = availability.find(item => item.id === timeSlotId);
    return slotAvailability ? slotAvailability.occupancyPercentage : 0;
  }, [availability]);

  // Función para obtener la disponibilidad de un time slot específico
  const getSlotAvailability = useCallback((timeSlotId: number): TimeSlotWithAvailability | undefined => {
    return availability.find(item => item.id === timeSlotId);
  }, [availability]);

  return {
    availability,
    loading,
    error,
    getAvailabilityForDate,
    checkSpecificAvailability,
    refreshAvailability
  };
};