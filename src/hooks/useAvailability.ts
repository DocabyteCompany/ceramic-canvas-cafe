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
    try {
      setLoading(true);
      setError(null);

      // Validar que la fecha no sea pasada - CORREGIDO: usar parseISO y startOfDay
      const selectedDate = startOfDay(parseISO(date));
      const today = startOfDay(new Date());
      
      if (selectedDate < today) {
        setError('No se pueden hacer reservaciones para fechas pasadas');
        return [];
      }

      // Validar que sea un día laboral
      const dayOfWeek = selectedDate.getDay();
      
      if (![0, 2, 3, 4, 5, 6].includes(dayOfWeek)) {
        setError('Solo se permiten reservaciones de martes a sábado y domingo');
        return [];
      }

      // Obtener time slots con disponibilidad directamente del servicio
      const { data: timeSlots, error: timeSlotsError } = await TimeSlotsService.getTimeSlotsWithAvailability(date);
      
      if (timeSlotsError) {
        console.error('❌ useAvailability - Error del servicio:', timeSlotsError);
        setError(timeSlotsError);
        return [];
      }
      
      if (!timeSlots || timeSlots.length === 0) {
        setError('No hay horarios disponibles para esta fecha');
        return [];
      }

      // Devolver los time slots directamente (ya tienen toda la información necesaria)
      return timeSlots;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [checkAvailability]);

  // Verificar disponibilidad específica para un horario y fecha
  const checkSpecificAvailability = useCallback(async (
    timeSlotId: number, 
    date: string, 
    requestedGuests: number = 1
  ): Promise<TimeSlotWithAvailability | null> => {
    try {
      const timeSlots = await getAvailabilityForDate(date);
      const timeSlot = timeSlots.find(slot => slot.id === timeSlotId);
      
      if (!timeSlot) {
        return null;
      }

      // Verificar si puede reservar la cantidad solicitada
      const canReserve = timeSlot.available >= requestedGuests;
      
      return {
        ...timeSlot,
        isAvailable: canReserve
      };
    } catch (err: any) {
      console.error('❌ useAvailability - Error verificando disponibilidad específica:', err);
      return null;
    }
  }, [getAvailabilityForDate]);

  // Refrescar disponibilidad para una fecha
  const refreshAvailability = useCallback(async (date: string): Promise<void> => {
    try {
      const timeSlots = await getAvailabilityForDate(date);
      setAvailability(timeSlots);
    } catch (err: any) {
      console.error('❌ useAvailability - Error refrescando disponibilidad:', err);
    }
  }, [getAvailabilityForDate]);

  // Función para actualizar disponibilidad cuando se realice una reserva
  const updateAvailabilityAfterReservation = useCallback((timeSlotId: number, guests: number) => {
    setAvailability(prev => prev.map(slot => {
      if (slot.id === timeSlotId) {
        const newAvailable = Math.max(0, slot.available - guests);
        const newOccupancyPercentage = ((slot.max_capacity - newAvailable) / slot.max_capacity) * 100;
        
        return {
          ...slot,
          available: newAvailable,
          isAvailable: newAvailable > 0,
          occupancyPercentage: newOccupancyPercentage
        };
      }
      return slot;
    }));
  }, []);

  // Función para revertir disponibilidad si se cancela una reserva
  const revertAvailabilityAfterCancellation = useCallback((timeSlotId: number, guests: number) => {
    setAvailability(prev => prev.map(slot => {
      if (slot.id === timeSlotId) {
        const newAvailable = Math.min(slot.max_capacity, slot.available + guests);
        const newOccupancyPercentage = ((slot.max_capacity - newAvailable) / slot.max_capacity) * 100;
        
        return {
          ...slot,
          available: newAvailable,
          isAvailable: newAvailable > 0,
          occupancyPercentage: newOccupancyPercentage
        };
      }
      return slot;
    }));
  }, []);

  return {
    availability,
    loading,
    error,
    getAvailabilityForDate,
    checkSpecificAvailability,
    refreshAvailability
  };
};