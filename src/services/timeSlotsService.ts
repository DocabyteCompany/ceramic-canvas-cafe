import { supabase } from '@/lib/supabase';
import type { TimeSlot } from './supabaseService';
import { parseISO, startOfDay } from 'date-fns';

export interface TimeSlotWithAvailability extends TimeSlot {
  available: number;
  isAvailable: boolean;
  occupancyPercentage: number;
}

export interface DayTimeSlots {
  dayOfWeek: number;
  dayName: string;
  timeSlots: TimeSlotWithAvailability[];
}

export class TimeSlotsService {
  // Obtener todos los time slots activos
  static async getAllTimeSlots(): Promise<{ data: TimeSlot[] | null; error: string | null }> {
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

  // Obtener time slots con disponibilidad para una fecha específica
  static async getTimeSlotsWithAvailability(date: string): Promise<{ data: TimeSlotWithAvailability[] | null; error: string | null }> {
    try {
      // CORREGIDO: usar parseISO y startOfDay para evitar problemas de zona horaria
      const dateObj = startOfDay(parseISO(date));
      const dayOfWeek = dateObj.getDay();

      // Validar que sea un día laboral
      if (!this.isDayAvailable(dayOfWeek)) {
        return { data: [], error: 'No hay horarios disponibles para este día' };
      }

      // Obtener time slots para el día de la semana
      const { data: timeSlots, error: timeSlotsError } = await supabase
        .from('time_slots')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .is('is_active', true)
        .order('start_time');

      if (timeSlotsError) {
        console.error('❌ TimeSlotsService - Error en consulta time_slots:', timeSlotsError);
        return { data: null, error: timeSlotsError.message };
      }

      if (!timeSlots || timeSlots.length === 0) {
        return { data: [], error: null };
      }

      // Obtener reservaciones existentes para esa fecha
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('time_slot_id, guests')
        .eq('reservation_date', date);

      if (reservationsError) {
        console.error('❌ TimeSlotsService - Error en consulta reservaciones:', reservationsError);
        return { data: null, error: reservationsError.message };
      }

      // Calcular disponibilidad para cada time slot
      const timeSlotsWithAvailability = timeSlots.map(slot => {
        const slotReservations = reservations?.filter(r => r.time_slot_id === slot.id) || [];
        const totalGuests = slotReservations.reduce((sum, res) => sum + res.guests, 0);
        const available = Math.max(0, slot.max_capacity - totalGuests);
        const occupancyPercentage = ((slot.max_capacity - available) / slot.max_capacity) * 100;

        // Validaciones específicas para domingo
        if (dayOfWeek === 0) {
          // Verificar que el horario esté dentro del rango permitido (10:00 - 15:00)
          const startTime = slot.start_time;
          const endTime = slot.end_time;
          
          if (startTime < '10:00:00' || endTime > '15:00:00') {
            return {
              ...slot,
              available: 0,
              isAvailable: false,
              occupancyPercentage: 100
            };
          }
        }

        return {
          ...slot,
          available,
          isAvailable: available > 0,
          occupancyPercentage
        };
      });

      return { data: timeSlotsWithAvailability, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Obtener time slots agrupados por día
  static async getTimeSlotsByDayGrouped(): Promise<{ data: DayTimeSlots[] | null; error: string | null }> {
    try {
      const { data: timeSlots, error } = await this.getAllTimeSlots();
      
      if (error) {
        return { data: null, error };
      }

      if (!timeSlots) {
        return { data: [], error: null };
      }

      // Agrupar por día de la semana
      const grouped: { [key: number]: TimeSlotWithAvailability[] } = {};
      timeSlots.forEach(slot => {
        if (!grouped[slot.day_of_week]) {
          grouped[slot.day_of_week] = [];
        }
        grouped[slot.day_of_week].push(slot as TimeSlotWithAvailability);
      });

      // Convertir a array con información del día
      const result: DayTimeSlots[] = Object.keys(grouped).map(dayKey => {
        const dayOfWeek = parseInt(dayKey);
        return {
          dayOfWeek,
          dayName: this.getDayName(dayOfWeek),
          timeSlots: grouped[dayOfWeek]
        };
      });

      return { data: result, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Verificar si un día de la semana está disponible para reservaciones
  static isDayAvailable(dayOfWeek: number): boolean {
    // 0 = Domingo, 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes, 6 = Sábado
    // Disponible: Domingo (0), Martes (2), Miércoles (3), Jueves (4), Viernes (5), Sábado (6)
    // No disponible: Lunes (1)
    return dayOfWeek !== 1; // Lunes no disponible
  }

  // Obtener el nombre del día de la semana
  static getDayName(dayOfWeek: number): string {
    const days = [
      'Domingo',
      'Lunes', 
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado'
    ];
    return days[dayOfWeek] || 'Desconocido';
  }

  // Obtener información de disponibilidad para una fecha específica
  static async getAvailabilityInfo(date: string): Promise<{ 
    totalSlots: number; 
    availableSlots: number; 
    totalCapacity: number; 
    availableCapacity: number;
    error: string | null;
  }> {
    try {
      const { data: timeSlots, error } = await this.getTimeSlotsWithAvailability(date);
      
      if (error) {
        return { 
          totalSlots: 0, 
          availableSlots: 0, 
          totalCapacity: 0, 
          availableCapacity: 0, 
          error 
        };
      }

      if (!timeSlots) {
        return { 
          totalSlots: 0, 
          availableSlots: 0, 
          totalCapacity: 0, 
          availableCapacity: 0, 
          error: null 
        };
      }

      const totalSlots = timeSlots.length;
      const availableSlots = timeSlots.filter(slot => slot.isAvailable).length;
      const totalCapacity = timeSlots.reduce((sum, slot) => sum + slot.max_capacity, 0);
      const availableCapacity = timeSlots.reduce((sum, slot) => sum + slot.available, 0);

      return {
        totalSlots,
        availableSlots,
        totalCapacity,
        availableCapacity,
        error: null
      };
    } catch (error: any) {
      return { 
        totalSlots: 0, 
        availableSlots: 0, 
        totalCapacity: 0, 
        availableCapacity: 0, 
        error: error.message 
      };
    }
  }
}