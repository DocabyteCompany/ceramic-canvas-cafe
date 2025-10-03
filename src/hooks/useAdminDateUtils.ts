import { useState, useCallback } from 'react';
import { DateUtils } from '@/lib/dateUtils';

export interface AdminDateInfo {
  isValid: boolean;
  isAvailable: boolean;
  dayOfWeek: number;
  dayName: string;
  formattedDate: string;
  error?: string;
}

export interface UseAdminDateUtilsReturn {
  // Información de fecha
  getDateInfo: (dateString: string) => AdminDateInfo;
  
  // Validaciones
  isValidDate: (dateString: string) => boolean;
  isDateAvailable: (dateString: string) => boolean;
  isDayAvailable: (dayOfWeek: number) => boolean;
  
  // Formateo
  formatDisplayDate: (dateString: string) => string;
  formatShortDate: (dateString: string) => string;
  getDayName: (dayOfWeek: number) => string;
  
  // Fechas del sistema
  getTodayString: () => string;
  getMaxDateString: () => string;
  
  // Comparaciones
  compareDates: (date1: string, date2: string) => number;
  isBefore: (date1: string, date2: string) => boolean;
  isAfter: (date1: string, date2: string) => boolean;
  isEqual: (date1: string, date2: string) => boolean;
  
  // Estado para validación en tiempo real
  validationState: {
    isValidating: boolean;
    lastValidatedDate: string | null;
    lastValidationResult: AdminDateInfo | null;
  };
  
  // Función para validar con estado
  validateDateWithState: (dateString: string) => Promise<AdminDateInfo>;
}

export const useAdminDateUtils = (): UseAdminDateUtilsReturn => {
  const [validationState, setValidationState] = useState({
    isValidating: false,
    lastValidatedDate: null as string | null,
    lastValidationResult: null as AdminDateInfo | null,
  });

  // Wrapper para getDateInfo con logging
  const getDateInfo = useCallback((dateString: string): AdminDateInfo => {
    console.log('🔍 [useAdminDateUtils] Validando fecha:', dateString);
    
    try {
      const result = DateUtils.getDateInfo(dateString);
      console.log('✅ [useAdminDateUtils] Resultado validación:', {
        date: dateString,
        isValid: result.isValid,
        isAvailable: result.isAvailable,
        dayOfWeek: result.dayOfWeek,
        dayName: result.dayName,
        error: result.error
      });
      
      return result;
    } catch (error: any) {
      console.error('❌ [useAdminDateUtils] Error validando fecha:', error);
      return {
        isValid: false,
        isAvailable: false,
        dayOfWeek: -1,
        dayName: 'Error',
        formattedDate: dateString,
        error: error.message || 'Error validando fecha'
      };
    }
  }, []);

  // Validación con estado para UI
  const validateDateWithState = useCallback(async (dateString: string): Promise<AdminDateInfo> => {
    setValidationState(prev => ({
      ...prev,
      isValidating: true,
      lastValidatedDate: dateString
    }));

    try {
      // Simular delay mínimo para mostrar estado de carga
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = getDateInfo(dateString);
      
      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        lastValidationResult: result
      }));

      return result;
    } catch (error: any) {
      const errorResult: AdminDateInfo = {
        isValid: false,
        isAvailable: false,
        dayOfWeek: -1,
        dayName: 'Error',
        formattedDate: dateString,
        error: error.message || 'Error validando fecha'
      };

      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        lastValidationResult: errorResult
      }));

      return errorResult;
    }
  }, [getDateInfo]);

  // Wrappers para las funciones de DateUtils
  const isValidDate = useCallback((dateString: string): boolean => {
    return DateUtils.isValidDate(dateString);
  }, []);

  const isDateAvailable = useCallback((dateString: string): boolean => {
    return DateUtils.isDateAvailable(dateString);
  }, []);

  const isDayAvailable = useCallback((dayOfWeek: number): boolean => {
    return DateUtils.isDayAvailable(dayOfWeek);
  }, []);

  const formatDisplayDate = useCallback((dateString: string): string => {
    return DateUtils.formatDisplayDate(dateString);
  }, []);

  const formatShortDate = useCallback((dateString: string): string => {
    return DateUtils.formatShortDate(dateString);
  }, []);

  const getDayName = useCallback((dayOfWeek: number): string => {
    return DateUtils.getDayName(dayOfWeek);
  }, []);

  const getTodayString = useCallback((): string => {
    return DateUtils.getTodayString();
  }, []);

  const getMaxDateString = useCallback((): string => {
    return DateUtils.getMaxDateString();
  }, []);

  const compareDates = useCallback((date1: string, date2: string): number => {
    return DateUtils.compareDates(date1, date2);
  }, []);

  const isBefore = useCallback((date1: string, date2: string): boolean => {
    return DateUtils.isBefore(date1, date2);
  }, []);

  const isAfter = useCallback((date1: string, date2: string): boolean => {
    return DateUtils.isAfter(date1, date2);
  }, []);

  const isEqual = useCallback((date1: string, date2: string): boolean => {
    return DateUtils.isEqual(date1, date2);
  }, []);

  return {
    // Información de fecha
    getDateInfo,
    
    // Validaciones
    isValidDate,
    isDateAvailable,
    isDayAvailable,
    
    // Formateo
    formatDisplayDate,
    formatShortDate,
    getDayName,
    
    // Fechas del sistema
    getTodayString,
    getMaxDateString,
    
    // Comparaciones
    compareDates,
    isBefore,
    isAfter,
    isEqual,
    
    // Estado para validación en tiempo real
    validationState,
    validateDateWithState,
  };
};
