import { supabase } from '@/lib/supabase';

// Tipos para TypeScript
export interface TimeSlot {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  max_capacity: number;
  is_active: boolean;
  created_at: string;
}

export interface Reservation {
  id: string;
  time_slot_id: number;
  reservation_date: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  guests: number;
  created_at: string;
}

export interface CreateReservationData {
  time_slot_id: number;
  reservation_date: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  guests: number;
}

// Servicio básico de conexión y operaciones
export class SupabaseService {
  // Verificar conexión a Supabase
  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .limit(1);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Obtener todos los time slots
  static async getTimeSlots(): Promise<{ data: TimeSlot[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('is_active', true)
        .order('day_of_week')
        .order('start_time');

      return { data, error: error?.message || null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Obtener time slots por día de la semana
  static async getTimeSlotsByDay(dayOfWeek: number): Promise<{ data: TimeSlot[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .order('start_time');

      return { data, error: error?.message || null };
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
        .eq('reservation_date', date);

      return { data, error: error?.message || null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Crear nueva reservación
  static async createReservation(reservationData: CreateReservationData): Promise<{ data: Reservation | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select()
        .single();

      return { data, error: error?.message || null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Calcular disponibilidad para un time slot específico en una fecha
  static async getAvailability(timeSlotId: number, date: string): Promise<{ available: number; error: string | null }> {
    try {
      // Obtener capacidad máxima del time slot
      const { data: timeSlot, error: timeSlotError } = await supabase
        .from('time_slots')
        .select('max_capacity')
        .eq('id', timeSlotId)
        .single();

      if (timeSlotError) {
        return { available: 0, error: timeSlotError.message };
      }

      // Obtener reservaciones existentes para ese time slot y fecha
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('guests')
        .eq('time_slot_id', timeSlotId)
        .eq('reservation_date', date);

      if (reservationsError) {
        return { available: 0, error: reservationsError.message };
      }

      // Calcular ocupación actual
      const totalGuests = reservations?.reduce((sum, reservation) => sum + reservation.guests, 0) || 0;
      const available = Math.max(0, timeSlot.max_capacity - totalGuests);

      return { available, error: null };
    } catch (error: any) {
      return { available: 0, error: error.message };
    }
  }
}

