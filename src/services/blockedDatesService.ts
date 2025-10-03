import { supabase } from '@/lib/supabase';

export interface BlockedDateData {
  time_slot_id: number;
  reservation_date: string;
  guests: number; // Cantidad de cupos a bloquear
  block_reason: string;
}

export interface BlockedDate {
  id: string;
  time_slot_id: number;
  reservation_date: string;
  guests: number;
  block_reason: string;
  created_at: string;
  time_slots?: {
    start_time: string;
    end_time: string;
    max_capacity: number;
  };
}

export class BlockedDatesService {
  /**
   * Crear un bloqueo específico para un horario
   * @param blockData - Datos del bloqueo
   * @param adminUserId - ID del administrador que crea el bloqueo
   * @returns Objeto con data (bloqueo creado) y error (si hay)
   */
  static async createBlock(blockData: BlockedDateData, adminUserId: string) {
    try {
      console.log('🔒 [BlockedDatesService] Creando bloqueo:', blockData);
      
      const reservationData = {
        time_slot_id: blockData.time_slot_id,
        reservation_date: blockData.reservation_date,
        customer_name: 'BLOQUEO ADMINISTRATIVO',
        customer_email: 'admin@ceramiccanvascafe.com',
        customer_phone: '0000000000',
        guests: blockData.guests,
        reservation_type: 'admin_block',
        blocked_by: adminUserId,
        block_reason: blockData.block_reason
      };

      const { data, error } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select(`
          id,
          time_slot_id,
          reservation_date,
          guests,
          block_reason,
          created_at,
          time_slots(start_time, end_time, max_capacity)
        `)
        .single();

      if (error) {
        console.error('❌ [BlockedDatesService] Error creando bloqueo:', error.message);
        return { data: null, error: error.message };
      }

      console.log('✅ [BlockedDatesService] Bloqueo creado exitosamente:', data.id);
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ [BlockedDatesService] Error inesperado creando bloqueo:', error);
      return { data: null, error: error.message || 'Error inesperado al crear bloqueo' };
    }
  }

  /**
   * Obtener todos los bloqueos activos
   * @returns Array de bloqueos o error
   */
  static async getBlockedDates() {
    try {
      console.log('🔍 [BlockedDatesService] Obteniendo bloqueos activos');
      
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          time_slot_id,
          reservation_date,
          guests,
          block_reason,
          created_at,
          time_slots(start_time, end_time, max_capacity)
        `)
        .eq('reservation_type', 'admin_block')
        .order('reservation_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [BlockedDatesService] Error obteniendo bloqueos:', error.message);
        return { data: null, error: error.message };
      }

      console.log(`✅ [BlockedDatesService] Obtenidos ${data?.length || 0} bloqueos`);
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('❌ [BlockedDatesService] Error inesperado obteniendo bloqueos:', error);
      return { data: null, error: error.message || 'Error inesperado al obtener bloqueos' };
    }
  }

  /**
   * Eliminar un bloqueo específico
   * @param blockId - ID del bloqueo a eliminar
   * @returns Objeto con error (si hay)
   */
  static async removeBlock(blockId: string) {
    try {
      console.log('🗑️ [BlockedDatesService] Eliminando bloqueo:', blockId);
      
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', blockId)
        .eq('reservation_type', 'admin_block');

      if (error) {
        console.error('❌ [BlockedDatesService] Error eliminando bloqueo:', error.message);
        return { error: error.message };
      }

      console.log('✅ [BlockedDatesService] Bloqueo eliminado exitosamente');
      return { error: null };
    } catch (error: any) {
      console.error('❌ [BlockedDatesService] Error inesperado eliminando bloqueo:', error);
      return { error: error.message || 'Error inesperado al eliminar bloqueo' };
    }
  }

  /**
   * Bloquear un día completo (todos los horarios)
   * @param date - Fecha a bloquear (formato YYYY-MM-DD)
   * @param reason - Razón del bloqueo
   * @param adminUserId - ID del administrador
   * @returns Objeto con data (bloqueos creados) y error (si hay)
   */
  static async blockFullDay(date: string, reason: string, adminUserId: string) {
    try {
      console.log('🔒 [BlockedDatesService] Bloqueando día completo:', date);
      
      // Obtener todos los time slots activos
      const { data: timeSlots, error: timeSlotsError } = await supabase
        .from('time_slots')
        .select('id, max_capacity')
        .eq('is_active', true);

      if (timeSlotsError) {
        console.error('❌ [BlockedDatesService] Error obteniendo time slots:', timeSlotsError.message);
        return { data: null, error: timeSlotsError.message };
      }

      if (!timeSlots || timeSlots.length === 0) {
        console.warn('⚠️ [BlockedDatesService] No hay time slots activos');
        return { data: [], error: null };
      }

      // Crear bloqueo para cada time slot
      const blocks = timeSlots.map(slot => ({
        time_slot_id: slot.id,
        reservation_date: date,
        customer_name: 'BLOQUEO ADMINISTRATIVO',
        customer_email: 'admin@ceramiccanvascafe.com',
        customer_phone: '0000000000',
        guests: slot.max_capacity, // Bloquear todos los cupos
        reservation_type: 'admin_block',
        blocked_by: adminUserId,
        block_reason: reason
      }));

      const { data, error } = await supabase
        .from('reservations')
        .insert(blocks)
        .select(`
          id,
          time_slot_id,
          reservation_date,
          guests,
          block_reason,
          created_at,
          time_slots(start_time, end_time, max_capacity)
        `);

      if (error) {
        console.error('❌ [BlockedDatesService] Error creando bloqueos de día completo:', error.message);
        return { data: null, error: error.message };
      }

      console.log(`✅ [BlockedDatesService] Día completo bloqueado: ${data?.length || 0} horarios`);
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('❌ [BlockedDatesService] Error inesperado bloqueando día completo:', error);
      return { data: null, error: error.message || 'Error inesperado al bloquear día completo' };
    }
  }

  /**
   * Bloquear horarios específicos de un día
   * @param date - Fecha a bloquear
   * @param timeSlotIds - Array de IDs de horarios a bloquear
   * @param reason - Razón del bloqueo
   * @param adminUserId - ID del administrador
   * @param guestsPerSlot - Cupos a bloquear por horario (opcional, por defecto todos)
   * @returns Objeto con data (bloqueos creados) y error (si hay)
   */
  static async blockSpecificTimeSlots(
    date: string, 
    timeSlotIds: number[], 
    reason: string, 
    adminUserId: string,
    guestsPerSlot?: number
  ) {
    try {
      console.log('🔒 [BlockedDatesService] Bloqueando horarios específicos:', { date, timeSlotIds });
      
      // Obtener información de los time slots
      const { data: timeSlots, error: timeSlotsError } = await supabase
        .from('time_slots')
        .select('id, max_capacity')
        .in('id', timeSlotIds)
        .eq('is_active', true);

      if (timeSlotsError) {
        console.error('❌ [BlockedDatesService] Error obteniendo time slots:', timeSlotsError.message);
        return { data: null, error: timeSlotsError.message };
      }

      if (!timeSlots || timeSlots.length === 0) {
        console.warn('⚠️ [BlockedDatesService] No se encontraron time slots válidos');
        return { data: [], error: null };
      }

      // Crear bloqueos para los horarios seleccionados
      const blocks = timeSlots.map(slot => ({
        time_slot_id: slot.id,
        reservation_date: date,
        customer_name: 'BLOQUEO ADMINISTRATIVO',
        customer_email: 'admin@ceramiccanvascafe.com',
        customer_phone: '0000000000',
        guests: guestsPerSlot || slot.max_capacity, // Usar cupos específicos o todos
        reservation_type: 'admin_block',
        blocked_by: adminUserId,
        block_reason: reason
      }));

      const { data, error } = await supabase
        .from('reservations')
        .insert(blocks)
        .select(`
          id,
          time_slot_id,
          reservation_date,
          guests,
          block_reason,
          created_at,
          time_slots(start_time, end_time, max_capacity)
        `);

      if (error) {
        console.error('❌ [BlockedDatesService] Error creando bloqueos específicos:', error.message);
        return { data: null, error: error.message };
      }

      console.log(`✅ [BlockedDatesService] Horarios específicos bloqueados: ${data?.length || 0} horarios`);
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('❌ [BlockedDatesService] Error inesperado bloqueando horarios específicos:', error);
      return { data: null, error: error.message || 'Error inesperado al bloquear horarios específicos' };
    }
  }

  /**
   * Verificar si una fecha/horario está bloqueado
   * @param date - Fecha a verificar
   * @param timeSlotId - ID del horario a verificar
   * @returns true si está bloqueado, false si no
   */
  static async isBlocked(date: string, timeSlotId: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('id')
        .eq('reservation_date', date)
        .eq('time_slot_id', timeSlotId)
        .eq('reservation_type', 'admin_block')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ [BlockedDatesService] Error verificando bloqueo:', error.message);
        return false;
      }

      return !!data;
    } catch (error: any) {
      console.error('❌ [BlockedDatesService] Error inesperado verificando bloqueo:', error);
      return false;
    }
  }
}

