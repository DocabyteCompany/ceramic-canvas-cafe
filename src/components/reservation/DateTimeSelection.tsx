import { useState, useEffect, memo, useCallback } from 'react';
import { format, addDays, isSameDay, isAfter, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Clock, Users, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useAvailability } from '@/hooks/useAvailability';
import type { ReservationData } from '../ReservationWizard';
import type { TimeSlotWithAvailability } from '@/services/timeSlotsService';

interface DateTimeSelectionProps {
  reservationData: ReservationData;
  onComplete: (data: Partial<ReservationData>) => void;
}

// Función para formatear time slot para el componente
const formatTimeSlotForDisplay = (slot: TimeSlotWithAvailability) => {
  const startTime = slot.start_time.substring(0, 5); // HH:MM
  const endTime = slot.end_time.substring(0, 5); // HH:MM
  
  // Formatear para mostrar
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return {
    value: startTime,
    label: `${formatTime(startTime)} - ${formatTime(endTime)}`,
    available: slot.available,
    maxCapacity: slot.max_capacity,
    isAvailable: slot.isAvailable,
    occupancyPercentage: slot.occupancyPercentage
  };
};

const DateTimeSelectionComponent = ({ reservationData, onComplete }: DateTimeSelectionProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(reservationData.date);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{value: string; label: string; available: number} | null>(reservationData.timeSlot);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlotWithAvailability[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [timeSlotsError, setTimeSlotsError] = useState<string | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const { isDayAvailable } = useTimeSlots();
  const { getAvailabilityForDate } = useAvailability();

  // Logs para debugging
  console.log('🔍 DateTimeSelection - Estado actual:', {
    selectedDate,
    selectedTimeSlot,
    availableTimeSlots: availableTimeSlots.length,
    loadingTimeSlots,
    timeSlotsError
  });

  // Disable Mondays (business closed day)
  const isDateDisabled = (date: Date) => {
    const dayOfWeek = date.getDay();
    const today = startOfDay(new Date());
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // Máximo 3 meses en el futuro
    
    // No permitir fechas pasadas
    if (date < today) {
      return true;
    }
    
    // No permitir fechas más de 3 meses en el futuro
    if (date > maxDate) {
      return true;
    }
    
    // No permitir lunes (1)
    if (dayOfWeek === 1) {
      return true;
    }
    
    // Verificar si el día está disponible según las reglas de negocio
    return !isDayAvailable(dayOfWeek);
  };

  const handleDateSelect = useCallback(async (date: Date) => {
    console.log('📅 handleDateSelect - Fecha seleccionada:', date);
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Reset time selection when date changes
    setTimeSlotsError(null);
    
    // Cargar time slots disponibles para la fecha seleccionada
    try {
      setLoadingTimeSlots(true);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
      console.log('📅 handleDateSelect - Fecha formateada:', dateString);
      
      console.log('📅 handleDateSelect - Llamando a getAvailabilityForDate...');
      const timeSlots = await getAvailabilityForDate(dateString);
      console.log('📅 handleDateSelect - Time slots recibidos:', timeSlots);
      
      setAvailableTimeSlots(timeSlots);
      console.log('📅 handleDateSelect - Time slots establecidos en estado');
    } catch (error: any) {
      console.error('❌ handleDateSelect - Error:', error);
      setTimeSlotsError(error.message || 'Error al cargar horarios disponibles');
      setAvailableTimeSlots([]);
    } finally {
      setLoadingTimeSlots(false);
    }
  }, [getAvailabilityForDate]);

  const handleTimeSlotSelect = useCallback((slot: TimeSlotWithAvailability) => {
    // Limpiar timeout anterior si existe
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Convert the slot back to the expected format
    const timeSlot = {
      value: slot.start_time.substring(0, 5), // HH:MM
      label: formatTimeSlotForDisplay(slot).label,
      available: slot.available,
      id: slot.id // Incluir el ID del time slot
    };
    setSelectedTimeSlot(timeSlot);
    
    // Avanzar automáticamente después de 1.5 segundos
    const newTimeoutId = setTimeout(() => {
      if (selectedDate && timeSlot) {
        onComplete({
          date: selectedDate,
          time: timeSlot.value,
          timeSlot: timeSlot
        });
      }
    }, 1500);
    
    setTimeoutId(newTimeoutId);
  }, [selectedDate, onComplete, timeoutId]);


  // Cargar time slots cuando se selecciona una fecha
  useEffect(() => {
    if (selectedDate) {
      handleDateSelect(selectedDate);
    }
  }, [selectedDate]);

  // Cleanup del timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="font-display text-2xl text-foreground mb-2">
          Selecciona el día y la hora de tu sesión
        </h3>
        <p className="text-muted-foreground">
          Elige el momento perfecto para tu experiencia creativa
        </p>
      </div>

      {/* Date Selection with Calendar */}
      <div>
        <h4 className="flex items-center gap-2 font-medium text-lg mb-4">
          <CalendarIcon size={20} className="text-primary" />
          Fecha disponible
        </h4>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })
              ) : (
                <span>Selecciona una fecha</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={(date) => date && handleDateSelect(date)}
              disabled={isDateDisabled}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
              locale={es}
            />
          </PopoverContent>
        </Popover>
        
        {selectedDate && (
          <div className="mt-2 text-sm text-muted-foreground text-center">
            {selectedDate.getDay() === 0 && (
              <span className="text-primary font-medium">
                Domingo - Horarios especiales disponibles
              </span>
            )}
            {selectedDate.getDay() >= 2 && selectedDate.getDay() <= 5 && (
              <span>
                Horarios completos disponibles
              </span>
            )}
          </div>
        )}

        {/* Información sobre días disponibles - removida por solicitud */}
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="animate-fade-in">
          <h4 className="flex items-center gap-2 font-medium text-lg mb-4">
            <Clock size={20} className="text-primary" />
            Horario disponible para {format(selectedDate, 'EEEE, d MMMM', { locale: es })}
          </h4>
          
          {/* Loading State */}
          {loadingTimeSlots && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Cargando horarios disponibles...</span>
            </div>
          )}

          {/* Error State */}
          {timeSlotsError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {timeSlotsError}
              </AlertDescription>
            </Alert>
          )}

          {/* Time Slots */}
          {!loadingTimeSlots && !timeSlotsError && (
            <div className="time-slots-mobile md:grid md:gap-4">
              {availableTimeSlots.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No hay horarios disponibles para esta fecha.
                  </AlertDescription>
                </Alert>
              ) : (
                availableTimeSlots
                  .filter(slot => slot.start_time && slot.end_time) // Filtrar slots inválidos
                  .map((slot, index) => {
                    const isSelected = selectedTimeSlot?.value === slot.start_time.substring(0, 5);
                    const displaySlot = formatTimeSlotForDisplay(slot);
                    
                    return (
                    <div
                      key={slot.id || index}
                      className={`time-slot-card-mobile md:hidden ${
                        isSelected ? 'selected' : ''
                      } ${!slot.isAvailable ? 'disabled' : ''}`}
                      onClick={() => slot.isAvailable && handleTimeSlotSelect(slot)}
                    >
                      {/* Mobile Layout */}
                      <div className="md:hidden">
                        <div className="time-slot-header-mobile">
                          <div className="time-slot-time-mobile">{displaySlot.label}</div>
                          <div className="time-slot-duration-mobile">
                            {selectedDate?.getDay() === 0 && slot.start_time === '13:30:00' ? '1h 30m' : '1h 45m'}
                          </div>
                        </div>
                        
                        <div className="time-slot-info-mobile">
                          <div className="time-slot-availability-mobile">
                            <Users size={16} className="text-primary" />
                            <span className="font-medium">{slot.available}</span>
                            <span className="text-muted-foreground">lugares disponibles</span>
                          </div>
                          
                          <div className="time-slot-progress-mobile">
                            <div 
                              className="time-slot-progress-fill-mobile"
                              style={{ width: `${slot.occupancyPercentage}%` }}
                            />
                          </div>
                        </div>
                        
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          disabled={!slot.isAvailable}
                          className={`time-slot-button-mobile ${isSelected ? "bg-primary" : ""}`}
                        >
                          {!slot.isAvailable ? 'Lleno' : isSelected ? 'Seleccionado' : 'Reservar'}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
              
              {/* Desktop Layout - Keep original */}
              {availableTimeSlots
                .filter(slot => slot.start_time && slot.end_time)
                .map((slot, index) => {
                  const isSelected = selectedTimeSlot?.value === slot.start_time.substring(0, 5);
                  const displaySlot = formatTimeSlotForDisplay(slot);
                  
                  return (
                    <Card
                      key={`desktop-${slot.id || index}`}
                      className={`hidden md:block cursor-pointer transition-all duration-150 hover:shadow-md ${
                        isSelected ? 'border-primary bg-primary/5' : ''
                      } ${!slot.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => slot.isAvailable && handleTimeSlotSelect(slot)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                             <div className="flex items-center gap-3 mb-2">
                               <h5 className="font-semibold text-lg">{displaySlot.label}</h5>
                               <span className="text-sm text-muted-foreground">
                                 {selectedDate?.getDay() === 0 && slot.start_time === '13:30:00' ? '1h 30m' : '1h 45m'}
                               </span>
                             </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-sm">
                                <Users size={16} className="text-primary" />
                                <span className="font-medium">{slot.available}</span>
                                <span className="text-muted-foreground">lugares disponibles</span>
                              </div>
                              
                              <div className="flex-1 max-w-32">
                                <Progress 
                                  value={slot.occupancyPercentage} 
                                  className="h-2"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant={isSelected ? "default" : "outline"}
                            disabled={!slot.isAvailable}
                            className={isSelected ? "bg-primary" : ""}
                          >
                            {!slot.isAvailable ? 'Lleno' : isSelected ? 'Seleccionado' : 'Reservar'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              }
            </div>
          )}
        </div>
      )}

    </div>
  );
};

// Exportar con memo para optimización
export const DateTimeSelection = memo(DateTimeSelectionComponent);