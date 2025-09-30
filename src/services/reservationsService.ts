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

export class ReservationsService {
  // Crear nueva reservación
  static async createReservation(reservationData: CreateReservationData): Promise<{ data: Reservation | null; error: string | null }> {
    try {
      // Validar datos antes de enviar
      const validation = this.validateReservationData(reservationData);
      if (!validation.isValid) {
        return { data: null, error: validation.error };
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

  // Obtener reservación por ID
  static async getReservationById(id: string): Promise<{ data: ReservationWithDetails | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          time_slot:time_slots(start_time, end_time, max_capacity)
        `)
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Obtener reservaciones por fecha
  static async getReservationsByDate(date: string): Promise<{ data: Reservation[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('reservation_date', date)
        .order('created_at');

      return { data, error: error?.message || null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Obtener reservaciones por email del cliente
  static async getReservationsByEmail(email: string): Promise<{ data: ReservationWithDetails[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          time_slot:time_slots(start_time, end_time, max_capacity)
        `)
        .eq('customer_email', email)
        .order('reservation_date', { ascending: false })
        .order('created_at', { ascending: false });

      return { data, error: error?.message || null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Obtener resumen de reservaciones para una fecha
  static async getReservationsSummaryByDate(date: string): Promise<{ data: ReservationSummary[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          reservation_date,
          customer_name,
          guests,
          time_slot:time_slots(start_time, end_time)
        `)
        .eq('reservation_date', date)
        .order('created_at');

      if (error) {
        return { data: null, error: error.message };
      }

      const summaries = data?.map(reservation => ({
        id: reservation.id,
        date: reservation.reservation_date,
        time: `${reservation.time_slot.start_time} - ${reservation.time_slot.end_time}`,
        customer_name: reservation.customer_name,
        guests: reservation.guests,
        status: 'confirmed' as const
      })) || [];

      return { data: summaries, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Verificar disponibilidad para un time slot específico en una fecha
  static async checkAvailability(timeSlotId: number, date: string, requestedGuests: number = 1): Promise<{ available: number; canReserve: boolean; error: string | null }> {
    try {
      // Obtener capacidad máxima del time slot
      const { data: timeSlot, error: timeSlotError } = await supabase
        .from('time_slots')
        .select('max_capacity')
        .eq('id', timeSlotId)
        .single();

      if (timeSlotError) {
        return { available: 0, canReserve: false, error: timeSlotError.message };
      }

      // Obtener reservaciones existentes para ese time slot y fecha
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('guests')
        .eq('time_slot_id', timeSlotId)
        .eq('reservation_date', date);

      if (reservationsError) {
        return { available: 0, canReserve: false, error: reservationsError.message };
      }

      // Calcular ocupación actual
      const totalGuests = reservations?.reduce((sum, reservation) => sum + reservation.guests, 0) || 0;
      const available = Math.max(0, timeSlot.max_capacity - totalGuests);
      const canReserve = available >= requestedGuests;

      return { available, canReserve, error: null };
    } catch (error: any) {
      return { available: 0, canReserve: false, error: error.message };
    }
  }

  // Validar datos de reservación antes de enviar
  static validateReservationData(data: CreateReservationData): { isValid: boolean; error?: string } {
    // Validar nombre
    if (!data.customer_name || data.customer_name.trim().length < 2) {
      return { isValid: false, error: 'El nombre debe tener al menos 2 caracteres' };
    }

    if (data.customer_name.trim().length > 100) {
      return { isValid: false, error: 'El nombre no puede exceder 100 caracteres' };
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.customer_email || !emailRegex.test(data.customer_email)) {
      return { isValid: false, error: 'El correo electrónico no es válido' };
    }

    if (data.customer_email.length > 255) {
      return { isValid: false, error: 'El correo electrónico no puede exceder 255 caracteres' };
    }

    // Validar teléfono
    const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
    if (!data.customer_phone || !phoneRegex.test(data.customer_phone)) {
      return { isValid: false, error: 'El número de teléfono no es válido' };
    }

    if (data.customer_phone.length > 20) {
      return { isValid: false, error: 'El número de teléfono no puede exceder 20 caracteres' };
    }

    // Validar número de huéspedes - REGLA DE NEGOCIO: máximo 6 personas por reservación
    if (data.guests < 1) {
      return { isValid: false, error: 'Debe ser al menos 1 persona' };
    }

    if (data.guests > 6) {
      return { isValid: false, error: 'Máximo 6 personas por reservación' };
    }

    // Validar fecha - CORREGIDO: usar parseISO y startOfDay para evitar problemas de zona horaria
    const reservationDate = startOfDay(parseISO(data.reservation_date));
    const today = startOfDay(new Date());
    
    if (reservationDate < today) {
      return { isValid: false, error: 'No se pueden hacer reservaciones para fechas pasadas' };
    }

    // Validar que la fecha no sea más de 3 meses en el futuro
    const maxDate = startOfDay(new Date());
    maxDate.setMonth(maxDate.getMonth() + 3);
    if (reservationDate > maxDate) {
      return { isValid: false, error: 'No se pueden hacer reservaciones con más de 3 meses de anticipación' };
    }

    // Validar que la fecha sea un día laboral
    const dayOfWeek = reservationDate.getDay();
    if (![0, 2, 3, 4, 5, 6].includes(dayOfWeek)) {
      return { isValid: false, error: 'Solo se permiten reservaciones de martes a sábado y domingos' };
    }

    // Validar time_slot_id
    if (!data.time_slot_id || data.time_slot_id < 1) {
      return { isValid: false, error: 'Debe seleccionar un horario válido' };
    }

    return { isValid: true };
  }

  // Formatear fecha para Supabase (YYYY-MM-DD)
  static formatDateForSupabase(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Formatear fecha para mostrar al usuario
  static formatDateForDisplay(date: string): string {
    const dateObj = startOfDay(parseISO(date));
    return dateObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Formatear hora para mostrar al usuario
  static formatTimeForDisplay(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }
}
