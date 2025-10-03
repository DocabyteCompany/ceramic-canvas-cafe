import { useState, useEffect } from 'react';
import { BlockedDatesService, type BlockedDateData, type BlockedDate } from '@/services/blockedDatesService';

export interface UseBlockedDatesReturn {
  blockedDates: BlockedDate[];
  loading: boolean;
  error: string | null;
  loadBlockedDates: () => Promise<void>;
  createBlock: (blockData: BlockedDateData, adminUserId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  removeBlock: (blockId: string) => Promise<{ success: boolean; error?: string }>;
  blockFullDay: (date: string, reason: string, adminUserId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  blockSpecificTimeSlots: (
    date: string, 
    timeSlotIds: number[], 
    reason: string, 
    adminUserId: string, 
    guestsPerSlot?: number
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  isBlocked: (date: string, timeSlotId: number) => Promise<boolean>;
}

export const useBlockedDates = (): UseBlockedDatesReturn => {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar todos los bloqueos activos
   */
  const loadBlockedDates = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [useBlockedDates] Cargando bloqueos...');
      const { data, error } = await BlockedDatesService.getBlockedDates();
      
      if (error) {
        console.error('❌ [useBlockedDates] Error cargando bloqueos:', error);
        setError(error);
        return;
      }
      
      setBlockedDates(data || []);
      console.log(`✅ [useBlockedDates] Cargados ${data?.length || 0} bloqueos`);
    } catch (err: any) {
      const errorMessage = err.message || 'Error inesperado al cargar bloqueos';
      console.error('❌ [useBlockedDates] Error inesperado:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crear un bloqueo específico
   * @param blockData - Datos del bloqueo
   * @param adminUserId - ID del administrador
   * @returns Resultado de la operación
   */
  const createBlock = async (
    blockData: BlockedDateData, 
    adminUserId: string
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔒 [useBlockedDates] Creando bloqueo:', blockData);
      const { data, error } = await BlockedDatesService.createBlock(blockData, adminUserId);
      
      if (error) {
        console.error('❌ [useBlockedDates] Error creando bloqueo:', error);
        setError(error);
        return { success: false, error };
      }
      
      // Recargar la lista de bloqueos
      await loadBlockedDates();
      console.log('✅ [useBlockedDates] Bloqueo creado exitosamente');
      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err.message || 'Error inesperado al crear bloqueo';
      console.error('❌ [useBlockedDates] Error inesperado:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar un bloqueo
   * @param blockId - ID del bloqueo a eliminar
   * @returns Resultado de la operación
   */
  const removeBlock = async (blockId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🗑️ [useBlockedDates] Eliminando bloqueo:', blockId);
      const { error } = await BlockedDatesService.removeBlock(blockId);
      
      if (error) {
        console.error('❌ [useBlockedDates] Error eliminando bloqueo:', error);
        setError(error);
        return { success: false, error };
      }
      
      // Recargar la lista de bloqueos
      await loadBlockedDates();
      console.log('✅ [useBlockedDates] Bloqueo eliminado exitosamente');
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Error inesperado al eliminar bloqueo';
      console.error('❌ [useBlockedDates] Error inesperado:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Bloquear un día completo
   * @param date - Fecha a bloquear
   * @param reason - Razón del bloqueo
   * @param adminUserId - ID del administrador
   * @returns Resultado de la operación
   */
  const blockFullDay = async (
    date: string, 
    reason: string, 
    adminUserId: string
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔒 [useBlockedDates] Bloqueando día completo:', date);
      const { data, error } = await BlockedDatesService.blockFullDay(date, reason, adminUserId);
      
      if (error) {
        console.error('❌ [useBlockedDates] Error bloqueando día completo:', error);
        setError(error);
        return { success: false, error };
      }
      
      // Recargar la lista de bloqueos
      await loadBlockedDates();
      console.log('✅ [useBlockedDates] Día completo bloqueado exitosamente');
      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err.message || 'Error inesperado al bloquear día completo';
      console.error('❌ [useBlockedDates] Error inesperado:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Bloquear horarios específicos
   * @param date - Fecha a bloquear
   * @param timeSlotIds - IDs de horarios a bloquear
   * @param reason - Razón del bloqueo
   * @param adminUserId - ID del administrador
   * @param guestsPerSlot - Cupos a bloquear por horario
   * @returns Resultado de la operación
   */
  const blockSpecificTimeSlots = async (
    date: string, 
    timeSlotIds: number[], 
    reason: string, 
    adminUserId: string, 
    guestsPerSlot?: number
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔒 [useBlockedDates] Bloqueando horarios específicos:', { date, timeSlotIds });
      const { data, error } = await BlockedDatesService.blockSpecificTimeSlots(
        date, 
        timeSlotIds, 
        reason, 
        adminUserId, 
        guestsPerSlot
      );
      
      if (error) {
        console.error('❌ [useBlockedDates] Error bloqueando horarios específicos:', error);
        setError(error);
        return { success: false, error };
      }
      
      // Recargar la lista de bloqueos
      await loadBlockedDates();
      console.log('✅ [useBlockedDates] Horarios específicos bloqueados exitosamente');
      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err.message || 'Error inesperado al bloquear horarios específicos';
      console.error('❌ [useBlockedDates] Error inesperado:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verificar si una fecha/horario está bloqueado
   * @param date - Fecha a verificar
   * @param timeSlotId - ID del horario a verificar
   * @returns true si está bloqueado, false si no
   */
  const isBlocked = async (date: string, timeSlotId: number): Promise<boolean> => {
    try {
      return await BlockedDatesService.isBlocked(date, timeSlotId);
    } catch (err: any) {
      console.error('❌ [useBlockedDates] Error verificando bloqueo:', err);
      return false;
    }
  };

  // Cargar bloqueos al montar el hook
  useEffect(() => {
    loadBlockedDates();
  }, []);

  return {
    blockedDates,
    loading,
    error,
    loadBlockedDates,
    createBlock,
    removeBlock,
    blockFullDay,
    blockSpecificTimeSlots,
    isBlocked
  };
};

