import { useState, useEffect } from 'react';
import { BlockedDatesService, type BlockedDateData, type BlockedDate } from '@/services/blockedDatesService';

export interface UseBlockedDatesReturn {
  blockedDates: BlockedDate[];
  loading: boolean;
  error: string | null;
  loadBlockedDates: () => Promise<void>;
  createBlock: (blockData: BlockedDateData, adminUserId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  removeBlock: (blockId: string, reloadList?: boolean) => Promise<{ success: boolean; error?: string }>;
  removeMultipleBlocks: (blockIds: string[]) => Promise<{ success: boolean; error?: string }>;
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
      
      const { data, error } = await BlockedDatesService.getBlockedDates();
      
      if (error) {
        console.error('❌ [useBlockedDates] Error cargando bloqueos:', error);
        setError(error);
        return;
      }
      
      setBlockedDates(data || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Error inesperado al cargar bloqueos';
      console.error('❌ [useBlockedDates] Error inesperado:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crear un nuevo bloqueo
   * @param blockData - Datos del bloqueo
   * @param adminUserId - ID del administrador
   * @returns Resultado de la operación
   */
  const createBlock = async (blockData: BlockedDateData, adminUserId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      setError(null);
      
      const { data, error } = await BlockedDatesService.createBlock(blockData, adminUserId);
      
      if (error) {
        console.error('❌ [useBlockedDates] Error creando bloqueo:', error);
        return { success: false, error };
      }

      // Recargar la lista de bloqueos
      await loadBlockedDates();
      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err.message || 'Error inesperado al crear bloqueo';
      console.error('❌ [useBlockedDates] Error inesperado:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Eliminar un bloqueo específico
   * @param blockId - ID del bloqueo a eliminar
   * @param reloadList - Si recargar la lista después de eliminar
   * @returns Resultado de la operación
   */
  const removeBlock = async (blockId: string, reloadList: boolean = true): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);

      const { error } = await BlockedDatesService.removeBlock(blockId);
      
      if (error) {
        console.error('❌ [useBlockedDates] Error eliminando bloqueo:', error);
        return { success: false, error };
      }

      // Recargar la lista si se solicita
      if (reloadList) {
        await loadBlockedDates();
      }
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Error inesperado al eliminar bloqueo';
      console.error('❌ [useBlockedDates] Error inesperado:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Eliminar múltiples bloqueos
   * @param blockIds - Array de IDs de bloqueos a eliminar
   * @returns Resultado de la operación
   */
  const removeMultipleBlocks = async (blockIds: string[]): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      
      // Eliminar cada bloqueo individualmente (sin recargar la lista en cada uno)
      for (const blockId of blockIds) {
        const { error } = await BlockedDatesService.removeBlock(blockId);
        if (error) {
          console.error(`❌ [useBlockedDates] Error eliminando bloqueo ${blockId}:`, error);
          return { success: false, error };
        }
      }

      // Recargar la lista una sola vez al final
      await loadBlockedDates();
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Error inesperado al eliminar bloqueos';
      console.error('❌ [useBlockedDates] Error inesperado:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Bloquear un día completo
   * @param date - Fecha a bloquear
   * @param reason - Razón del bloqueo
   * @param adminUserId - ID del administrador
   * @returns Resultado de la operación
   */
  const blockFullDay = async (date: string, reason: string, adminUserId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      setError(null);

      const { data, error } = await BlockedDatesService.blockFullDay(date, reason, adminUserId);
      
      if (error) {
        console.error('❌ [useBlockedDates] Error bloqueando día completo:', error);
        return { success: false, error };
      }

      // Recargar la lista de bloqueos
      await loadBlockedDates();
      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err.message || 'Error inesperado al bloquear día completo';
      console.error('❌ [useBlockedDates] Error inesperado:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Bloquear horarios específicos
   * @param date - Fecha a bloquear
   * @param timeSlotIds - IDs de horarios a bloquear
   * @param reason - Razón del bloqueo
   * @param adminUserId - ID del administrador
   * @param guestsPerSlot - Cupos por horario
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
      setError(null);

      const { data, error } = await BlockedDatesService.blockSpecificTimeSlots(
        date, 
        timeSlotIds, 
        reason, 
        adminUserId, 
        guestsPerSlot
      );
      
      if (error) {
        console.error('❌ [useBlockedDates] Error bloqueando horarios específicos:', error);
        return { success: false, error };
      }

      // Recargar la lista de bloqueos
      await loadBlockedDates();
      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err.message || 'Error inesperado al bloquear horarios específicos';
      console.error('❌ [useBlockedDates] Error inesperado:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Verificar si una fecha/horario está bloqueado
   * @param date - Fecha a verificar
   * @param timeSlotId - ID del horario
   * @returns true si está bloqueado
   */
  const isBlocked = async (date: string, timeSlotId: number): Promise<boolean> => {
    try {
      return await BlockedDatesService.isBlocked(date, timeSlotId);
    } catch (err: any) {
      console.error('❌ [useBlockedDates] Error verificando bloqueo:', err.message);
      return false;
    }
  };

  // Cargar bloqueos al montar el componente
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
    removeMultipleBlocks,
    blockFullDay,
    blockSpecificTimeSlots,
    isBlocked
  };
};