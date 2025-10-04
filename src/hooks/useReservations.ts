import { useState, useCallback } from 'react';
import { ReservationsService, type CreateReservationData, type Reservation, type ReservationWithDetails, type ReservationSummary } from '@/services/reservationsService';

export interface UseReservationsReturn {
  createReservation: (data: CreateReservationData) => Promise<{ success: boolean; data?: Reservation; error?: string }>;
  getReservationById: (id: string) => Promise<{ success: boolean; data?: ReservationWithDetails; error?: string }>;
  getReservationsByDate: (date: string) => Promise<{ success: boolean; data?: Reservation[]; error?: string }>;
  getReservationsByEmail: (email: string) => Promise<{ success: boolean; data?: ReservationWithDetails[]; error?: string }>;
  getReservationsSummaryByDate: (date: string) => Promise<{ success: boolean; data?: ReservationSummary[]; error?: string }>;
  checkAvailability: (timeSlotId: number, date: string, requestedGuests?: number) => Promise<{ available: number; canReserve: boolean; error?: string }>;
  loading: boolean;
  error: string | null;
}

export const useReservations = (): UseReservationsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Crear nueva reservación
  const createReservation = useCallback(async (data: CreateReservationData) => {
    try {
      setLoading(true);
      setError(null);

      const { data: reservation, error } = await ReservationsService.createReservation(data);
      
      if (error) {
        return { success: false, error };
      }

      return { success: true, data: reservation };
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear la reservación';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener reservación por ID
  const getReservationById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await ReservationsService.getReservationById(id);
      
      if (error) {
        return { success: false, error };
      }

      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener la reservación';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener reservaciones por fecha
  const getReservationsByDate = useCallback(async (date: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await ReservationsService.getReservationsByDate(date);
      
      if (error) {
        return { success: false, error };
      }

      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener las reservaciones';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener reservaciones por email
  const getReservationsByEmail = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await ReservationsService.getReservationsByEmail(email);
      
      if (error) {
        return { success: false, error };
      }

      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener las reservaciones';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener resumen de reservaciones por fecha
  const getReservationsSummaryByDate = useCallback(async (date: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await ReservationsService.getReservationsSummaryByDate(date);
      
      if (error) {
        return { success: false, error };
      }

      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener el resumen de reservaciones';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar disponibilidad
  const checkAvailability = useCallback(async (timeSlotId: number, date: string, requestedGuests: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const { available, canReserve, error } = await ReservationsService.checkAvailability(timeSlotId, date, requestedGuests);
      
      if (error) {
        return { available: 0, canReserve: false, error };
      }

      return { available, canReserve, error: undefined };
    } catch (err: any) {
      const errorMessage = err.message || 'Error al verificar disponibilidad';
      return { available: 0, canReserve: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createReservation,
    getReservationById,
    getReservationsByDate,
    getReservationsByEmail,
    getReservationsSummaryByDate,
    checkAvailability,
    loading,
    error
  };
};






