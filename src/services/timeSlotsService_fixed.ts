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
    console.log('🔍 TimeSlotsService - getTimeSlotsWithAvailability llamada con fecha:', date);
    try {
      // CORREGIDO: usar parseISO y startOfDay para evitar problemas de zona horaria
      const dateObj = startOfDay(parseISO(date));
      const dayOfWeek = dateObj.getDay();
      
      console.log('🔍 TimeSlotsService - Día de la semana:', dayOfWeek);

      // Validar que sea un día laboral
      if (!this.isDayAvailable(dayOfWeek)) {
        console.log('❌ TimeSlotsService - Día no disponible:', dayOfWeek);
        return { data: [], error: 'No hay horarios disponibles para este día' };
      }

      // Obtener time slots para el día de la semana
      console.log('🔍 TimeSlotsService - Consultando time_slots para día:', dayOfWeek);
      const { data: timeSlots, error: timeSlotsError } = await supabase
        .from('time_slots')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .order('start_time');

      console.log('🔍 TimeSlotsService - Respuesta de time_slots:', {
        timeSlots: timeSlots?.length || 0,
        timeSlotsError,
        data: timeSlots
      });

      if (timeSlotsError) {
        console.log('❌ TimeSlotsService - Error en consulta time_slots:', timeSlotsError);
        return { data: null, error: timeSlotsError.message };
      }

      if (!timeSlots || timeSlots.length === 0) {
        console.log('❌ TimeSlotsService - No hay time slots en la base de datos');
        return { data: [], error: null };
      }

      // Obtener reservaciones existentes para esa fecha
      console.log('🔍 TimeSlotsService - Consultando reservaciones para fecha:', date);
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('time_slot_id, guests')
        .eq('reservation_date', date);

      console.log('🔍 TimeSlotsService - Respuesta de reservaciones:', {
        reservations: reservations?.length || 0,
        reservationsError,
        data: reservations
      });

      if (reservationsError) {
        console.log('❌ TimeSlotsService - Error en consulta reservaciones:', reservationsError);
        return { data: null, error: reservationsError.message };
      }

      // Calcular disponibilidad para cada time slot
      console.log('🔍 TimeSlotsService - Calculando disponibilidad...');
      const timeSlotsWithAvailability = timeSlots.map(slot => {
        const slotReservations = reservations?.filter(r => r.time_slot_id === slot.id) || [];
        const totalGuests = slotReservations.reduce((sum, res) => sum + res.guests, 0);
        const available = Math.max(0, slot.max_capacity - totalGuests);
        const occupancyPercentage = ((slot.max_capacity - available) / slot.max_capacity) * 100;

        console.log('🔍 TimeSlotsService - Time slot procesado:', {
          id: slot.id,
          start_time: slot.start_time,
          max_capacity: slot.max_capacity,
          totalGuests,
          available,
          isAvailable: available > 0
        });

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

      console.log('🔍 TimeSlotsService - Resultado final:', {
        totalSlots: timeSlotsWithAvailability.length,
        availableSlots: timeSlotsWithAvailability.filter(s => s.isAvailable).length,
        data: timeSlotsWithAvailability
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

  // Verificar si un día está disponible
  static isDayAvailable(dayOfWeek: number): boolean {
    // Días laborales: Domingo (0), Martes (2), Miércoles (3), Jueves (4), Viernes (5)
    return [0, 2, 3, 4, 5].includes(dayOfWeek);
  }

  // Obtener nombre del día
  static getDayName(dayOfWeek: number): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayOfWeek] || 'Día inválido';
  }

  // Formatear horario para mostrar
  static formatTimeSlot(slot: TimeSlot): string {
    const startTime = slot.start_time.substring(0, 5); // HH:MM
    const endTime = slot.end_time.substring(0, 5); // HH:MM
    
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  }

  // Calcular duración de la sesión
  static getSessionDuration(slot: TimeSlot): string {
    const startTime = slot.start_time.substring(0, 5);
    const endTime = slot.end_time.substring(0, 5);
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const durationMinutes = endMinutes - startMinutes;
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  // Validar horarios para domingo (debe estar entre 10:00 y 15:00)
  static validateSundayTimeSlot(slot: TimeSlot): boolean {
    const startTime = slot.start_time;
    const endTime = slot.end_time;
    
    return startTime >= '10:00:00' && endTime <= '15:00:00';
  }

  // Obtener horarios de domingo válidos
  static getValidSundayTimeSlots(timeSlots: TimeSlot[]): TimeSlot[] {
    return timeSlots.filter(slot => this.validateSundayTimeSlot(slot));
  }
}

