import { parseISO, startOfDay, format, addDays, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Utilidades centralizadas para el manejo de fechas
 * Evita problemas de zona horaria usando parseISO y startOfDay
 */
export class DateUtils {
  /**
   * Convierte una fecha string (YYYY-MM-DD) a objeto Date usando UTC
   * @param dateString - Fecha en formato YYYY-MM-DD
   * @returns Objeto Date en UTC
   */
  static parseDate(dateString: string): Date {
    if (!dateString) {
      throw new Error('Fecha no proporcionada');
    }
    
    try {
      // Usar parseISO para parsear correctamente y startOfDay para evitar problemas de zona horaria
      return startOfDay(parseISO(dateString));
    } catch (error) {
      throw new Error(`Fecha inválida: ${dateString}`);
    }
  }

  /**
   * Obtiene el día de la semana (0=Domingo, 1=Lunes, etc.) de una fecha string
   * @param dateString - Fecha en formato YYYY-MM-DD
   * @returns Número del día de la semana
   */
  static getDayOfWeek(dateString: string): number {
    const date = this.parseDate(dateString);
    return date.getDay();
  }

  /**
   * Verifica si una fecha es válida para reservaciones/bloqueos
   * @param dateString - Fecha en formato YYYY-MM-DD
   * @returns true si la fecha es válida
   */
  static isValidDate(dateString: string): boolean {
    try {
      const date = this.parseDate(dateString);
      const today = startOfDay(new Date());
      
      // No permitir fechas pasadas
      if (isBefore(date, today)) {
        return false;
      }
      
      // No permitir fechas más de 6 meses en el futuro
      const maxDate = addDays(today, 180); // 6 meses aproximadamente
      if (isAfter(date, maxDate)) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verifica si un día de la semana está disponible para el negocio
   * @param dayOfWeek - Número del día (0=Domingo, 1=Lunes, etc.)
   * @returns true si el día está disponible
   */
  static isDayAvailable(dayOfWeek: number): boolean {
    // Días laborales: Domingo (0), Martes (2), Miércoles (3), Jueves (4), Viernes (5), Sábado (6)
    // Lunes (1) está cerrado
    return [0, 2, 3, 4, 5, 6].includes(dayOfWeek);
  }

  /**
   * Verifica si una fecha está disponible para reservaciones/bloqueos
   * @param dateString - Fecha en formato YYYY-MM-DD
   * @returns true si la fecha está disponible
   */
  static isDateAvailable(dateString: string): boolean {
    try {
      if (!this.isValidDate(dateString)) {
        return false;
      }
      
      const dayOfWeek = this.getDayOfWeek(dateString);
      return this.isDayAvailable(dayOfWeek);
    } catch {
      return false;
    }
  }

  /**
   * Obtiene el nombre del día en español
   * @param dayOfWeek - Número del día (0=Domingo, 1=Lunes, etc.)
   * @returns Nombre del día en español
   */
  static getDayName(dayOfWeek: number): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayOfWeek] || 'Día inválido';
  }

  /**
   * Formatea una fecha para mostrar al usuario
   * @param dateString - Fecha en formato YYYY-MM-DD
   * @returns Fecha formateada en español (ej: "lunes, 20 octubre 2025")
   */
  static formatDisplayDate(dateString: string): string {
    try {
      const date = this.parseDate(dateString);
      return format(date, 'EEEE, d MMMM yyyy', { locale: es });
    } catch {
      return dateString;
    }
  }

  /**
   * Formatea una fecha para mostrar en formato corto
   * @param dateString - Fecha en formato YYYY-MM-DD
   * @returns Fecha formateada en español (ej: "20 oct 2025")
   */
  static formatShortDate(dateString: string): string {
    try {
      const date = this.parseDate(dateString);
      return format(date, 'd MMM yyyy', { locale: es });
    } catch {
      return dateString;
    }
  }

  /**
   * Obtiene la fecha actual en formato YYYY-MM-DD
   * @returns Fecha actual en formato string
   */
  static getTodayString(): string {
    return startOfDay(new Date()).toISOString().split('T')[0];
  }

  /**
   * Obtiene la fecha máxima permitida (6 meses en el futuro) en formato YYYY-MM-DD
   * @returns Fecha máxima en formato string
   */
  static getMaxDateString(): string {
    const maxDate = addDays(startOfDay(new Date()), 180);
    return maxDate.toISOString().split('T')[0];
  }

  /**
   * Valida y obtiene información completa de una fecha
   * @param dateString - Fecha en formato YYYY-MM-DD
   * @returns Objeto con información de la fecha
   */
  static getDateInfo(dateString: string): {
    isValid: boolean;
    isAvailable: boolean;
    dayOfWeek: number;
    dayName: string;
    formattedDate: string;
    error?: string;
  } {
    try {
      const dayOfWeek = this.getDayOfWeek(dateString);
      const isValid = this.isValidDate(dateString);
      const isAvailable = this.isDateAvailable(dateString);
      const dayName = this.getDayName(dayOfWeek);
      const formattedDate = this.formatDisplayDate(dateString);

      let error: string | undefined;

      if (!isValid) {
        const today = startOfDay(new Date());
        const date = this.parseDate(dateString);
        
        if (isBefore(date, today)) {
          error = 'No puedes seleccionar fechas pasadas';
        } else {
          error = 'No puedes seleccionar fechas más de 6 meses en el futuro';
        }
      } else if (!isAvailable) {
        if (dayOfWeek === 1) {
          error = 'Los lunes el negocio está cerrado';
        } else {
          error = 'Este día no está disponible para reservaciones';
        }
      }

      return {
        isValid,
        isAvailable,
        dayOfWeek,
        dayName,
        formattedDate,
        error
      };
    } catch (err) {
      return {
        isValid: false,
        isAvailable: false,
        dayOfWeek: -1,
        dayName: 'Fecha inválida',
        formattedDate: dateString,
        error: 'Fecha inválida'
      };
    }
  }

  /**
   * Compara dos fechas string
   * @param date1 - Primera fecha en formato YYYY-MM-DD
   * @param date2 - Segunda fecha en formato YYYY-MM-DD
   * @returns -1 si date1 < date2, 0 si son iguales, 1 si date1 > date2
   */
  static compareDates(date1: string, date2: string): number {
    try {
      const d1 = this.parseDate(date1);
      const d2 = this.parseDate(date2);
      
      if (isBefore(d1, d2)) return -1;
      if (isAfter(d1, d2)) return 1;
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Verifica si una fecha string es anterior a otra
   * @param date1 - Primera fecha en formato YYYY-MM-DD
   * @param date2 - Segunda fecha en formato YYYY-MM-DD
   * @returns true si date1 es anterior a date2
   */
  static isBefore(date1: string, date2: string): boolean {
    return this.compareDates(date1, date2) < 0;
  }

  /**
   * Verifica si una fecha string es posterior a otra
   * @param date1 - Primera fecha en formato YYYY-MM-DD
   * @param date2 - Segunda fecha en formato YYYY-MM-DD
   * @returns true si date1 es posterior a date2
   */
  static isAfter(date1: string, date2: string): boolean {
    return this.compareDates(date1, date2) > 0;
  }

  /**
   * Verifica si una fecha string es igual a otra
   * @param date1 - Primera fecha en formato YYYY-MM-DD
   * @param date2 - Segunda fecha en formato YYYY-MM-DD
   * @returns true si las fechas son iguales
   */
  static isEqual(date1: string, date2: string): boolean {
    return this.compareDates(date1, date2) === 0;
  }
}
