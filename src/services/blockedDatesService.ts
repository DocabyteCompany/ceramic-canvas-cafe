import { supabase } from '@/lib/supabase';
import { TimeSlotsService } from './timeSlotsService';
import { DateUtils } from '@/lib/dateUtils';
import type { TimeSlotWithAvailability } from './timeSlotsService';
import { parseISO, startOfDay } from 'date-fns';

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
  isFullDay?: boolean;
  blockedTimeSlots?: number[];
  totalActiveSlots?: number;
  blockedByAdmin?: string;
}

export interface BlockTimeSlotWithAvailability extends TimeSlotWithAvailability {
  isBlocked: boolean;
  blockedGuests: number;
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

      return { data, error: null };
    } catch (error: any) {
      console.error('❌ [BlockedDatesService] Error inesperado creando bloqueo:', error);
      return { data: null, error: error.message || 'Error inesperado al crear bloqueo' };
    }
  }

  /**
   * Obtener todos los bloqueos activos con información de día completo
   * @returns Array de bloqueos o error
   */
  static async getBlockedDates() {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          time_slot_id,
          reservation_date,
          guests,
          block_reason,
          reservation_type,
          blocked_by,
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

      if (!data || data.length === 0) {
        return { data: [], error: null };
      }

      // Agrupar bloqueos por fecha para detectar días completos
      const datesMap = new Map<string, any[]>();
      data.forEach(block => {
        const date = block.reservation_date;
        if (!datesMap.has(date)) {
          datesMap.set(date, []);
        }
        datesMap.get(date)!.push(block);
      });

      // Enriquecer cada bloqueo con información de día completo
      const enrichedData: BlockedDate[] = [];
      
      for (const [date, blocks] of datesMap) {
        // Detectar si es día completo
        const { isFullDay, blockedSlots, totalActiveSlots, blockedByAdmin } = 
          await BlockedDatesService.detectFullDayBlocks(date);
        
        // Enriquecer cada bloqueo con información de día completo
        blocks.forEach(block => {
          enrichedData.push({
            ...block,
            isFullDay,
            blockedTimeSlots: blockedSlots,
            totalActiveSlots,
            blockedByAdmin
          });
        });
      }

      return { data: enrichedData, error: null };
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
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', blockId)
        .eq('reservation_type', 'admin_block');

      if (error) {
        console.error('❌ [BlockedDatesService] Error eliminando bloqueo:', error.message);
        return { error: error.message };
      }

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
      // Verificar bloqueos existentes antes de proceder
      const { hasBlocks, existingBlocks, blockedTimeSlots, canBlockFullDay, error: checkError } = 
        await BlockedDatesService.checkExistingBlocks(date, adminUserId);
      
      if (checkError) {
        console.error('❌ [BlockedDatesService] Error verificando bloqueos existentes:', checkError);
        return { data: null, error: checkError };
      }

      if (hasBlocks && !canBlockFullDay) {
        console.warn('⚠️ [BlockedDatesService] Ya existen bloqueos de otro administrador para esta fecha');
        return { 
          data: null, 
          error: `Ya existen bloqueos en esta fecha creados por otro administrador. No se puede bloquear el día completo.` 
        };
      }

      // CORREGIDO: Usar parseISO + startOfDay para evitar problemas de zona horaria
      const dateObj = startOfDay(parseISO(date));
      const dayOfWeek = dateObj.getDay();
      
      const { data: timeSlots, error: timeSlotsError } = await supabase
        .from('time_slots')
        .select('id, max_capacity')
        .eq('is_active', true)
        .eq('day_of_week', dayOfWeek);

      if (timeSlotsError) {
        console.error('❌ [BlockedDatesService] Error obteniendo time slots:', timeSlotsError.message);
        return { data: null, error: timeSlotsError.message };
      }

      if (!timeSlots || timeSlots.length === 0) {
        console.warn('⚠️ [BlockedDatesService] No hay time slots activos');
        return { data: [], error: null };
      }

      // Filtrar time slots ya bloqueados (si el admin actual ya bloqueó algunos)
      const timeSlotsToBlock = timeSlots.filter(slot => !blockedTimeSlots.includes(slot.id));

      if (timeSlotsToBlock.length === 0) {
        return { 
          data: [], 
          error: null,
          message: 'Todos los horarios ya están bloqueados por este administrador'
        };
      }

      // Crear bloqueos solo para time slots no bloqueados
      const blocks = [];
      
      timeSlotsToBlock.forEach(slot => {
        const totalGuests = slot.max_capacity;
        let remainingGuests = totalGuests;
        let blockNumber = 1;
        const totalBlocks = Math.ceil(totalGuests / 6);
        
        // Dividir en bloques de máximo 6 cupos para cumplir restricción CHECK
        while (remainingGuests > 0) {
          const blockGuests = Math.min(remainingGuests, 6);
          
          blocks.push({
            time_slot_id: slot.id,
            reservation_date: date,
            customer_name: 'BLOQUEO ADMINISTRATIVO',
            customer_email: 'admin@ceramiccanvascafe.com',
            customer_phone: '0000000000',
            guests: blockGuests,
            reservation_type: 'admin_block',
            blocked_by: adminUserId,
            block_reason: `${reason} (Día completo - Bloqueo ${blockNumber}/${totalBlocks})`
          });
          
          remainingGuests -= blockGuests;
          blockNumber++;
        }
      });

      // Si no hay bloques nuevos que crear, retornar éxito
      if (blocks.length === 0) {
        return { data: [], error: null };
      }

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

      const totalBlocks = blocks.length;
      const totalSlots = timeSlotsToBlock.length;
      const alreadyBlocked = blockedTimeSlots.length;
      
      return { 
        data: data || [], 
        error: null,
        message: `${totalSlots} horarios bloqueados exitosamente${alreadyBlocked > 0 ? ` (${alreadyBlocked} ya estaban bloqueados)` : ''}`
      };
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
      // Verificar bloqueos existentes para los time slots seleccionados
      const { hasBlocks, existingBlocks, blockedTimeSlots, error: checkError } = 
        await BlockedDatesService.checkExistingBlocks(date, adminUserId);
      
      if (checkError) {
        console.error('❌ [BlockedDatesService] Error verificando bloqueos existentes:', checkError);
        return { data: null, error: checkError };
      }

      // Identificar time slots ya bloqueados por otros admins
      const conflictingSlots = timeSlotIds.filter(slotId => 
        blockedTimeSlots.includes(slotId) && 
        existingBlocks?.some(block => 
          block.time_slot_id === slotId && block.blocked_by !== adminUserId
        )
      );

      if (conflictingSlots.length > 0) {
        console.warn('⚠️ [BlockedDatesService] Algunos horarios ya están bloqueados por otro administrador:', conflictingSlots);
        return { 
          data: null, 
          error: `Los siguientes horarios ya están bloqueados por otro administrador: ${conflictingSlots.join(', ')}` 
        };
      }

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

      // Filtrar time slots ya bloqueados por este admin (para evitar duplicados)
      const timeSlotsToBlock = timeSlots.filter(slot => !blockedTimeSlots.includes(slot.id));

      if (timeSlotsToBlock.length === 0) {
        return { 
          data: [], 
          error: null,
          message: 'Todos los horarios seleccionados ya están bloqueados por este administrador'
        };
      }

      // Crear bloqueos solo para time slots no bloqueados
      const blocks = [];
      const totalGuests = guestsPerSlot || timeSlotsToBlock[0]?.max_capacity || 6;
      
      // Dividir en bloques de máximo 6 cupos para cumplir restricción CHECK
      let remainingGuests = totalGuests;
      let blockNumber = 1;
      const totalBlocks = Math.ceil(totalGuests / 6);
      
      while (remainingGuests > 0) {
        const blockGuests = Math.min(remainingGuests, 6);
        
        timeSlotsToBlock.forEach(slot => {
          blocks.push({
            time_slot_id: slot.id,
            reservation_date: date,
            customer_name: 'BLOQUEO ADMINISTRATIVO',
            customer_email: 'admin@ceramiccanvascafe.com',
            customer_phone: '0000000000',
            guests: blockGuests,
            reservation_type: 'admin_block',
            blocked_by: adminUserId,
            block_reason: `${reason} (Bloqueo ${blockNumber}/${totalBlocks})`
          });
        });
        
        remainingGuests -= blockGuests;
        blockNumber++;
      }

      // Si no hay bloques nuevos que crear, retornar éxito
      if (blocks.length === 0) {
        return { data: [], error: null };
      }

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

      const totalNewBlocks = blocks.length;
      const totalSlotsBlocked = timeSlotsToBlock.length;
      const alreadyBlocked = timeSlotIds.length - timeSlotsToBlock.length;
      
      return { 
        data: data || [], 
        error: null,
        message: `${totalSlotsBlocked} horarios bloqueados exitosamente${alreadyBlocked > 0 ? ` (${alreadyBlocked} ya estaban bloqueados)` : ''}`
      };
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

  /**
   * Obtener horarios disponibles para bloqueo en una fecha específica
   * @param date - Fecha para obtener horarios (formato YYYY-MM-DD)
   * @param currentAdminId - ID del administrador actual (opcional)
   * @returns Array de horarios con disponibilidad y estado de bloqueo
   */
  static async getTimeSlotsForDate(date: string, currentAdminId?: string): Promise<{ data: BlockTimeSlotWithAvailability[] | null; error: string | null }> {
    try {
      // Validar fecha usando DateUtils
      const dateInfo = DateUtils.getDateInfo(date);

      if (!dateInfo.isValid) {
        console.error('❌ [BlockedDatesService] Fecha inválida:', dateInfo.error);
        return { data: null, error: dateInfo.error || 'Fecha inválida' };
      }

      if (!dateInfo.isAvailable) {
        console.error('❌ [BlockedDatesService] Fecha no disponible:', dateInfo.error);
        return { data: null, error: dateInfo.error || 'Fecha no disponible para bloqueos' };
      }

      // Obtener horarios con disponibilidad usando el servicio existente
      const { data: timeSlots, error: timeSlotsError } = await TimeSlotsService.getTimeSlotsWithAvailability(date);
      
      if (timeSlotsError) {
        console.error('❌ [BlockedDatesService] Error obteniendo horarios:', timeSlotsError);
        return { data: null, error: timeSlotsError };
      }

      if (!timeSlots || timeSlots.length === 0) {
        return { data: [], error: null };
      }

      // Obtener bloqueos existentes para esta fecha
      const { data: existingBlocks, error: blocksError } = await supabase
        .from('reservations')
        .select('time_slot_id, guests, blocked_by')
        .eq('reservation_date', date)
        .eq('reservation_type', 'admin_block');

      if (blocksError) {
        console.error('❌ [BlockedDatesService] Error obteniendo bloqueos existentes:', blocksError.message);
        return { data: null, error: blocksError.message };
      }

      // Crear mapa de bloqueos por time_slot_id
      const blockedSlots = new Map<number, number>();
      existingBlocks?.forEach(block => {
        blockedSlots.set(block.time_slot_id, block.guests);
      });

      // Función helper para verificar si un bloqueo es del admin actual
      const isOwnBlock = (timeSlotId: number): boolean => {
        if (!currentAdminId) return false;
        return existingBlocks?.some(block => 
          block.time_slot_id === timeSlotId && block.blocked_by === currentAdminId
        ) || false;
      };

      // Enriquecer horarios con información de bloqueo
      const enrichedTimeSlots: BlockTimeSlotWithAvailability[] = timeSlots.map(slot => {
        const blockedGuests = blockedSlots.get(slot.id) || 0;
        const isOwnBlocked = isOwnBlock(slot.id);
        // Solo considerar bloqueado si NO es del admin actual
        const isBlocked = blockedGuests > 0 && !isOwnBlocked;
        
        // Para el admin actual: mostrar disponibilidad original
        // Para otros: restar bloqueos administrativos
        const adjustedAvailable = isOwnBlocked 
          ? slot.available  // Admin ve disponibilidad original
          : Math.max(0, slot.available - blockedGuests); // Otros ven disponibilidad reducida
        
        return {
          ...slot,
          isBlocked,
          blockedGuests,
          // Ajustar disponibilidad según si es el admin actual
          available: adjustedAvailable,
          // Recalcular porcentaje de ocupación
          occupancyPercentage: Math.round(((slot.max_capacity - adjustedAvailable) / slot.max_capacity) * 100)
        };
      });

      return { data: enrichedTimeSlots, error: null };
    } catch (error: any) {
      console.error('❌ [BlockedDatesService] Error inesperado obteniendo horarios para bloqueo:', error);
      return { data: null, error: error.message || 'Error inesperado al obtener horarios para bloqueo' };
    }
  }

  /**
   * Verificar si ya existen bloqueos para una fecha específica
   * @param date - Fecha a verificar (formato YYYY-MM-DD)
   * @param adminUserId - ID del administrador actual (opcional)
   * @returns Objeto con información de bloqueos existentes
   */
  static async checkExistingBlocks(date: string, adminUserId?: string): Promise<{
    hasBlocks: boolean;
    existingBlocks: any[];
    blockedTimeSlots: number[];
    canBlockFullDay: boolean;
    error: string | null;
  }> {
    try {
      // Validar fecha usando DateUtils
      const dateInfo = DateUtils.getDateInfo(date);
      if (!dateInfo.isValid || !dateInfo.isAvailable) {
        console.error('❌ [BlockedDatesService] Fecha inválida:', dateInfo.error);
        return { 
          hasBlocks: false, 
          existingBlocks: [], 
          blockedTimeSlots: [], 
          canBlockFullDay: false, 
          error: dateInfo.error || 'Fecha inválida' 
        };
      }

      // Obtener bloqueos existentes para esta fecha
      const { data: existingBlocks, error: blocksError } = await supabase
        .from('reservations')
        .select(`
          id,
          time_slot_id,
          guests,
          block_reason,
          blocked_by,
          created_at,
          time_slots(start_time, end_time, max_capacity)
        `)
        .eq('reservation_date', date)
        .eq('reservation_type', 'admin_block')
        .order('time_slot_id');

      if (blocksError) {
        console.error('❌ [BlockedDatesService] Error obteniendo bloqueos existentes:', blocksError.message);
        return { 
          hasBlocks: false, 
          existingBlocks: [], 
          blockedTimeSlots: [], 
          canBlockFullDay: false, 
          error: blocksError.message 
        };
      }

      // Obtener todos los time slots activos para esta fecha
      const { data: timeSlots, error: timeSlotsError } = await supabase
        .from('time_slots')
        .select('id, max_capacity')
        .eq('is_active', true);

      if (timeSlotsError) {
        console.error('❌ [BlockedDatesService] Error obteniendo time slots:', timeSlotsError.message);
        return { 
          hasBlocks: false, 
          existingBlocks: [], 
          blockedTimeSlots: [], 
          canBlockFullDay: false, 
          error: timeSlotsError.message 
        };
      }

      // Crear mapa de time slots bloqueados
      const blockedTimeSlots = new Set<number>();
      existingBlocks?.forEach(block => {
        blockedTimeSlots.add(block.time_slot_id);
      });

      const blockedTimeSlotsArray = Array.from(blockedTimeSlots);
      const hasBlocks = existingBlocks && existingBlocks.length > 0;
      
      // Determinar si se puede bloquear día completo
      // Solo se puede si NO hay bloqueos existentes O si el admin actual es quien bloqueó
      const canBlockFullDay = !hasBlocks || 
        (adminUserId && existingBlocks?.every(block => block.blocked_by === adminUserId));

      return {
        hasBlocks,
        existingBlocks: existingBlocks || [],
        blockedTimeSlots: blockedTimeSlotsArray,
        canBlockFullDay,
        error: null
      };
    } catch (error: any) {
      console.error('❌ [BlockedDatesService] Error inesperado verificando bloqueos existentes:', error);
      return { 
        hasBlocks: false, 
        existingBlocks: [], 
        blockedTimeSlots: [], 
        canBlockFullDay: false, 
        error: error.message || 'Error inesperado al verificar bloqueos existentes' 
      };
    }
  }

  /**
   * Detectar si un día está completamente bloqueado por un administrador
   * @param date - Fecha a verificar (formato YYYY-MM-DD)
   * @param adminUserId - ID del administrador (opcional)
   * @returns Objeto con información sobre si es día completo
   */
  static async detectFullDayBlocks(date: string, adminUserId?: string): Promise<{
    isFullDay: boolean;
    blockedSlots: number[];
    totalActiveSlots: number;
    blockedByAdmin: string | null;
    error: string | null;
  }> {
    try {
      // Validar fecha usando DateUtils
      const dateInfo = DateUtils.getDateInfo(date);
      if (!dateInfo.isValid || !dateInfo.isAvailable) {
        console.error('❌ [BlockedDatesService] Fecha inválida:', dateInfo.error);
        return { 
          isFullDay: false, 
          blockedSlots: [], 
          totalActiveSlots: 0, 
          blockedByAdmin: null,
          error: dateInfo.error || 'Fecha inválida' 
        };
      }

      // CORREGIDO: Usar parseISO + startOfDay para evitar problemas de zona horaria
      const dateObj = startOfDay(parseISO(date));
      const dayOfWeek = dateObj.getDay();
      
      const { data: timeSlots, error: timeSlotsError } = await supabase
        .from('time_slots')
        .select('id, max_capacity')
        .eq('is_active', true)
        .eq('day_of_week', dayOfWeek);

      if (timeSlotsError) {
        console.error('❌ [BlockedDatesService] Error obteniendo time slots:', timeSlotsError.message);
        return { 
          isFullDay: false, 
          blockedSlots: [], 
          totalActiveSlots: 0, 
          blockedByAdmin: null,
          error: timeSlotsError.message 
        };
      }

      if (!timeSlots || timeSlots.length === 0) {
        return { 
          isFullDay: false, 
          blockedSlots: [], 
          totalActiveSlots: 0, 
          blockedByAdmin: null,
          error: null 
        };
      }

      // Obtener bloqueos existentes para esta fecha
      const { data: existingBlocks, error: blocksError } = await supabase
        .from('reservations')
        .select('time_slot_id, blocked_by')
        .eq('reservation_date', date)
        .eq('reservation_type', 'admin_block');

      if (blocksError) {
        console.error('❌ [BlockedDatesService] Error obteniendo bloqueos existentes:', blocksError.message);
        return { 
          isFullDay: false, 
          blockedSlots: [], 
          totalActiveSlots: timeSlots.length, 
          blockedByAdmin: null,
          error: blocksError.message 
        };
      }

      // Crear mapa de time slots bloqueados por admin
      const blockedSlotsMap = new Map<number, string>();
      existingBlocks?.forEach(block => {
        blockedSlotsMap.set(block.time_slot_id, block.blocked_by);
      });

      const blockedSlots = Array.from(blockedSlotsMap.keys());
      const totalActiveSlots = timeSlots.length;

      // Verificar si todos los time slots están bloqueados
      const isFullDay = blockedSlots.length === totalActiveSlots && totalActiveSlots > 0;

      // Si es día completo, verificar si todos los bloqueos son del mismo admin
      let blockedByAdmin: string | null = null;
      if (isFullDay && existingBlocks && existingBlocks.length > 0) {
        const adminIds = new Set(existingBlocks.map(block => block.blocked_by));
        if (adminIds.size === 1) {
          blockedByAdmin = Array.from(adminIds)[0];
        }
      }

      return {
        isFullDay,
        blockedSlots,
        totalActiveSlots,
        blockedByAdmin,
        error: null
      };
    } catch (error: any) {
      console.error('❌ [BlockedDatesService] Error inesperado detectando bloqueos de día completo:', error);
      return { 
        isFullDay: false, 
        blockedSlots: [], 
        totalActiveSlots: 0, 
        blockedByAdmin: null,
        error: error.message || 'Error inesperado al detectar bloqueos de día completo' 
      };
    }
  }

  /**
   * Verificar disponibilidad para bloquear un horario específico
   * @param timeSlotId - ID del horario
   * @param date - Fecha del bloqueo
   * @param requestedGuests - Cupos que se quieren bloquear
   * @returns Objeto con disponibilidad y si se puede bloquear
   */
  static async checkBlockAvailability(
    timeSlotId: number, 
    date: string, 
    requestedGuests: number
  ): Promise<{ available: number; canBlock: boolean; error: string | null }> {
    try {
      // Validar fecha usando DateUtils
      const dateInfo = DateUtils.getDateInfo(date);
      if (!dateInfo.isValid || !dateInfo.isAvailable) {
        console.error('❌ [BlockedDatesService] Fecha inválida para bloqueo:', dateInfo.error);
        return { available: 0, canBlock: false, error: dateInfo.error || 'Fecha inválida para bloqueo' };
      }
      
      // Obtener información del time slot
      const { data: timeSlot, error: timeSlotError } = await supabase
        .from('time_slots')
        .select('max_capacity')
        .eq('id', timeSlotId)
        .single();

      if (timeSlotError) {
        console.error('❌ [BlockedDatesService] Error obteniendo time slot:', timeSlotError.message);
        return { available: 0, canBlock: false, error: timeSlotError.message };
      }

      // Obtener reservaciones existentes (normales y bloqueos)
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('guests, reservation_type')
        .eq('time_slot_id', timeSlotId)
        .eq('reservation_date', date);

      if (reservationsError) {
        console.error('❌ [BlockedDatesService] Error obteniendo reservaciones:', reservationsError.message);
        return { available: 0, canBlock: false, error: reservationsError.message };
      }

      // Calcular ocupación total
      const totalGuests = reservations?.reduce((sum, reservation) => sum + reservation.guests, 0) || 0;
      const available = Math.max(0, timeSlot.max_capacity - totalGuests);
      const canBlock = available >= requestedGuests;

      return { available, canBlock, error: null };
    } catch (error: any) {
      console.error('❌ [BlockedDatesService] Error inesperado verificando disponibilidad:', error);
      return { available: 0, canBlock: false, error: error.message || 'Error inesperado al verificar disponibilidad' };
    }
  }
}
