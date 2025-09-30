import { supabase } from '@/lib/supabase';
import type { Reservation, CreateReservationData } from './supabaseService';
import { parseISO, startOfDay } from 'date-fns';

export interface ReservationWithDetails extends Reservation {
  time_slot: {
    start_time: string;
    end_time: string;
    max_capacity: number;
  };
}

export interface ReservationSummary {
  id: string;
  date: string;
  time: string;
  customer_name: string;
  guests: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface AvailabilityCheck {
  timeSlotId: number;
  date: string;
  available: number;
  maxCapacity: number;
  canReserve: boolean;
}

export class ReservationsServiceOptimized {
  // Crear nueva reservación con validación optimizada
  static async createReservation(reservationData: CreateReservationData): Promise<{ data: Reservation | null; error: string | null }> {
    try {
      // Validar datos antes de enviar
      const validation = this.validateReservationData(reservationData);
      if (!validation.isValid) {
        return { data: null, error: validation.error };
      }

      // Verificar disponibilidad antes de crear la reservación
      const availabilityCheck = await this.checkAvailability(reservationData.time_slot_id, reservationData.reservation_date, reservationData.guests);
      if (!availabilityCheck.canReserve) {
        return { 
          data: null, 
          error: `No hay suficiente disponibilidad. Solo quedan ${availabilityCheck.available} lugares disponibles.` 
        };
      }

      const { data, error } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Verificar disponibilidad optimizada con una sola consulta
  static async checkAvailability(timeSlotId: number, date: string, requestedGuests: number = 1): Promise<AvailabilityCheck> {
    try {
      // Consulta optimizada que obtiene capacidad y ocupación en una sola llamada
      const { data, error } = await supabase
        .from('time_slots')
        .select(`
          id,
          max_capacity,
          reservations!inner(
            guests
          )
        `)
        .eq('id', timeSlotId)
        .eq('reservations.reservation_date', date)
        .single();

      if (error) {
        // Si no hay reservaciones, obtener solo la capacidad
        const { data: timeSlotData, error: timeSlotError } = await supabase
          .from('time_slots')
          .select('id, max_capacity')
          .eq('id', timeSlotId)
          .single();

        if (timeSlotError) {
          return {
            timeSlotId,
            date,
            available: 0,
            maxCapacity: 0,
            canReserve: false
          };
        }

        const available = timeSlotData.max_capacity;
        return {
          timeSlotId,
          date,
          available,
          maxCapacity: timeSlotData.max_capacity,
          canReserve: available >= requestedGuests
        };
      }

      // Calcular ocupación actual
      const totalGuests = data.reservations?.reduce((sum: number, res: any) => sum + res.guests, 0) || 0;
      const available = Math.max(0, data.max_capacity - totalGuests);

      return {
        timeSlotId,
        date,
        available,
        maxCapacity: data.max_capacity,
        canReserve: available >= requestedGuests
      };
    } catch (error: any) {
      return {
        timeSlotId,
        date,
        available: 0,
        maxCapacity: 0,
        canReserve: false
      };
    }
  }

  // Obtener disponibilidad para múltiples time slots en una sola consulta
  static async getAvailabilityForMultipleSlots(timeSlotIds: number[], date: string): Promise<AvailabilityCheck[]> {
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select(`
          id,
          max_capacity,
          reservations!inner(
            guests
          )
        `)
        .in('id', timeSlotIds)
        .eq('reservations.reservation_date', date);

      if (error) {
        // Si hay error, obtener solo las capacidades
        const { data: timeSlotsData, error: timeSlotsError } = await supabase
          .from('time_slots')
          .select('id, max_capacity')
          .in('id', timeSlotIds);

        if (timeSlotsError) {
          return [];
        }

        return timeSlotsData.map(slot => ({
          timeSlotId: slot.id,
          date,
          available: slot.max_capacity,
          maxCapacity: slot.max_capacity,
          canReserve: true
        }));
      }

      // Procesar resultados
      const availabilityMap = new Map<number, AvailabilityCheck>();
      
      data.forEach(slot => {
        const totalGuests = slot.reservations?.reduce((sum: number, res: any) => sum + res.guests, 0) || 0;
        const available = Math.max(0, slot.max_capacity - totalGuests);
        
        availabilityMap.set(slot.id, {
          timeSlotId: slot.id,
          date,
          available,
          maxCapacity: slot.max_capacity,
          canReserve: available > 0
        });
      });

      // Asegurar que todos los time slots solicitados estén en el resultado
      return timeSlotIds.map(id => 
        availabilityMap.get(id) || {
          timeSlotId: id,
          date,
          available: 0,
          maxCapacity: 0,
          canReserve: false
        }
      );
    } catch (error: any) {
      return [];
    }
  }

  // Obtener reservaciones por fecha con paginación
  static async getReservationsByDatePaginated(
    date: string, 
    page: number = 1, 
    pageSize: number = 20
  ): Promise<{ data: Reservation[]; total: number; error: string | null }> {
    try {
      const offset = (page - 1) * pageSize;

      // Obtener total de reservaciones
      const { count, error: countError } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('reservation_date', date);

      if (countError) {
        return { data: [], total: 0, error: countError.message };
      }

      // Obtener reservaciones paginadas
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('reservation_date', date)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        return { data: [], total: 0, error: error.message };
      }

      return { 
        data: data || [], 
        total: count || 0, 
        error: null 
      };
    } catch (error: any) {
      return { data: [], total: 0, error: error.message };
    }
  }

  // Validar datos de reservación (optimizada)
  static validateReservationData(data: CreateReservationData): { isValid: boolean; error?: string } {
    // Validaciones básicas
    if (!data.customer_name?.trim() || data.customer_name.trim().length < 2) {
      return { isValid: false, error: 'El nombre debe tener al menos 2 caracteres' };
    }

    if (!data.customer_email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customer_email)) {
      return { isValid: false, error: 'El correo electrónico no es válido' };
    }

    if (!data.customer_phone?.trim() || !/^[\+]?[\d\s\-\(\)]+$/.test(data.customer_phone)) {
      return { isValid: false, error: 'El número de teléfono no es válido' };
    }

    if (data.guests < 1 || data.guests > 6) {
      return { isValid: false, error: 'El número de huéspedes debe estar entre 1 y 6' };
    }

    // Validar fecha - CORREGIDO: usar parseISO y startOfDay para evitar problemas de zona horaria
    const reservationDate = startOfDay(parseISO(data.reservation_date));
    const today = startOfDay(new Date());
    
    if (reservationDate < today) {
      return { isValid: false, error: 'No se pueden hacer reservaciones para fechas pasadas' };
    }

    const maxDate = startOfDay(new Date());
    maxDate.setMonth(maxDate.getMonth() + 3);
    if (reservationDate > maxDate) {
      return { isValid: false, error: 'No se pueden hacer reservaciones con más de 3 meses de anticipación' };
    }

    const dayOfWeek = reservationDate.getDay();
    if (![0, 2, 3, 4, 5, 6].includes(dayOfWeek)) {
      return { isValid: false, error: 'Solo se permiten reservaciones de martes a sábado y domingos' };
    }

    if (!data.time_slot_id || data.time_slot_id < 1) {
      return { isValid: false, error: 'Debe seleccionar un horario válido' };
    }

    return { isValid: true };
  }

  // Obtener estadísticas de reservaciones
  static async getReservationStats(date: string): Promise<{
    totalReservations: number;
    totalGuests: number;
    timeSlotStats: Array<{
      timeSlotId: number;
      reservations: number;
      guests: number;
      available: number;
    }>;
  }> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          time_slot_id,
          guests,
          time_slots!inner(
            id,
            max_capacity
          )
        `)
        .eq('reservation_date', date);

      if (error) {
        return {
          totalReservations: 0,
          totalGuests: 0,
          timeSlotStats: []
        };
      }

      const totalReservations = data.length;
      const totalGuests = data.reduce((sum, res) => sum + res.guests, 0);

      // Agrupar por time slot
      const timeSlotMap = new Map<number, { reservations: number; guests: number; maxCapacity: number }>();
      
      data.forEach(res => {
        const slotId = res.time_slot_id;
        const current = timeSlotMap.get(slotId) || { reservations: 0, guests: 0, maxCapacity: res.time_slots.max_capacity };
        current.reservations += 1;
        current.guests += res.guests;
        timeSlotMap.set(slotId, current);
      });

      const timeSlotStats = Array.from(timeSlotMap.entries()).map(([timeSlotId, stats]) => ({
        timeSlotId,
        reservations: stats.reservations,
        guests: stats.guests,
        available: Math.max(0, stats.maxCapacity - stats.guests)
      }));

      return {
        totalReservations,
        totalGuests,
        timeSlotStats
      };
    } catch (error: any) {
      return {
        totalReservations: 0,
        totalGuests: 0,
        timeSlotStats: []
      };
    }
  }
}
