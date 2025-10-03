import { useState, useEffect, useCallback } from 'react';
import { TimeSlotsService, type TimeSlotWithAvailability, type DayTimeSlots } from '@/services/timeSlotsService';

export interface UseTimeSlotsReturn {
  timeSlots: TimeSlotWithAvailability[];
  groupedTimeSlots: DayTimeSlots[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getTimeSlotsForDate: (date: string) => Promise<TimeSlotWithAvailability[]>;
  isDayAvailable: (dayOfWeek: number) => boolean;
}

export const useTimeSlots = (): UseTimeSlotsReturn => {
  const [timeSlots, setTimeSlots] = useState<TimeSlotWithAvailability[]>([]);
  const [groupedTimeSlots, setGroupedTimeSlots] = useState<DayTimeSlots[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los time slots
  const loadTimeSlots = useCallback(async () => {
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

        setTimeSlots(timeSlotsWithAvailability);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar time slots agrupados por día
  const loadGroupedTimeSlots = useCallback(async () => {
    try {
      const { data, error } = await TimeSlotsService.getTimeSlotsByDayGrouped();
      
      if (error) {
        setError(error);
        return;
      }

      if (data) {
        setGroupedTimeSlots(data);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  // Obtener time slots con disponibilidad para una fecha específica
  const getTimeSlotsForDate = useCallback(async (date: string): Promise<TimeSlotWithAvailability[]> => {
    try {
      const { data, error } = await TimeSlotsService.getTimeSlotsWithAvailability(date);
      
      if (error) {
        console.error('Error al obtener time slots para fecha:', error);
        return [];
      }

      return data || [];
    } catch (err: any) {
      console.error('Error al obtener time slots para fecha:', err.message);
      return [];
    }
  }, []);

  // Verificar si un día está disponible
  const isDayAvailable = useCallback((dayOfWeek: number): boolean => {
    return TimeSlotsService.isDayAvailable(dayOfWeek);
  }, []);

  // Función para recargar datos
  const refetch = useCallback(async () => {
    await Promise.all([
      loadTimeSlots(),
      loadGroupedTimeSlots()
    ]);
  }, [loadTimeSlots, loadGroupedTimeSlots]);

  // Cargar datos al montar el hook
  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    timeSlots,
    groupedTimeSlots,
    loading,
    error,
    refetch,
    getTimeSlotsForDate,
    isDayAvailable
  };
};


