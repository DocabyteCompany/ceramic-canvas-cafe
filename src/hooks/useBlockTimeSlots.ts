import { useState, useEffect, useCallback } from 'react';
import { BlockedDatesService } from '@/services/blockedDatesService';
import type { BlockTimeSlotWithAvailability } from '@/services/blockedDatesService';

export interface UseBlockTimeSlotsReturn {
  timeSlots: BlockTimeSlotWithAvailability[];
  loading: boolean;
  error: string | null;
  loadTimeSlotsForDate: (date: string) => Promise<void>;
  checkAvailability: (timeSlotId: number, date: string, requestedGuests: number) => Promise<{ available: number; canBlock: boolean; error: string | null }>;
  refreshTimeSlots: (date: string) => Promise<void>;
}

export const useBlockTimeSlots = (adminUserId?: string): UseBlockTimeSlotsReturn => {
  const [timeSlots, setTimeSlots] = useState<BlockTimeSlotWithAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar horarios disponibles para bloqueo en una fecha específica
   * @param date - Fecha en formato YYYY-MM-DD
   */
  const loadTimeSlotsForDate = useCallback(async (date: string) => {
    if (!date) {
      console.log('⚠️ [useBlockTimeSlots] No se proporcionó fecha');
      setTimeSlots([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔍 [useBlockTimeSlots] Cargando horarios para fecha:', date);

      const { data, error: serviceError } = await BlockedDatesService.getTimeSlotsForDate(date, adminUserId);

      if (serviceError) {
        console.error('❌ [useBlockTimeSlots] Error del servicio:', serviceError);
        setError(serviceError);
        setTimeSlots([]);
        return;
      }

      if (data) {
        console.log(`✅ [useBlockTimeSlots] Cargados ${data.length} horarios para bloqueo`);
        setTimeSlots(data);
      } else {
        console.log('⚠️ [useBlockTimeSlots] No se encontraron horarios para esta fecha');
        setTimeSlots([]);
      }
    } catch (err: any) {
      console.error('❌ [useBlockTimeSlots] Error inesperado:', err);
      setError(err.message || 'Error inesperado al cargar horarios');
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Verificar disponibilidad para bloquear un horario específico
   * @param timeSlotId - ID del horario
   * @param date - Fecha del bloqueo
   * @param requestedGuests - Cupos que se quieren bloquear
   * @returns Objeto con disponibilidad y si se puede bloquear
   */
  const checkAvailability = useCallback(async (
    timeSlotId: number, 
    date: string, 
    requestedGuests: number
  ): Promise<{ available: number; canBlock: boolean; error: string | null }> => {
    try {
      console.log('🔍 [useBlockTimeSlots] Verificando disponibilidad:', { timeSlotId, date, requestedGuests });
      
      const result = await BlockedDatesService.checkBlockAvailability(timeSlotId, date, requestedGuests);
      
      if (result.error) {
        console.error('❌ [useBlockTimeSlots] Error verificando disponibilidad:', result.error);
        return result;
      }

      console.log(`✅ [useBlockTimeSlots] Disponibilidad verificada: ${result.available} cupos, puede bloquear: ${result.canBlock}`);
      return result;
    } catch (err: any) {
      console.error('❌ [useBlockTimeSlots] Error inesperado verificando disponibilidad:', err);
      return {
        available: 0,
        canBlock: false,
        error: err.message || 'Error inesperado al verificar disponibilidad'
      };
    }
  }, []);

  /**
   * Refrescar horarios para una fecha específica
   * @param date - Fecha a refrescar
   */
  const refreshTimeSlots = useCallback(async (date: string) => {
    console.log('🔄 [useBlockTimeSlots] Refrescando horarios para fecha:', date);
    await loadTimeSlotsForDate(date);
  }, [loadTimeSlotsForDate]);

  /**
   * Limpiar estado cuando se desmonta el componente
   */
  useEffect(() => {
    return () => {
      console.log('🧹 [useBlockTimeSlots] Limpiando estado del hook');
      setTimeSlots([]);
      setError(null);
      setLoading(false);
    };
  }, []);

  return {
    timeSlots,
    loading,
    error,
    loadTimeSlotsForDate,
    checkAvailability,
    refreshTimeSlots
  };
};
