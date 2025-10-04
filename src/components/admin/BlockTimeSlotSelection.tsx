import { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBlockTimeSlots } from '@/hooks/useBlockTimeSlots';
import { useAdminDateUtils } from '@/hooks/useAdminDateUtils';
import type { BlockTimeSlotWithAvailability } from '@/services/blockedDatesService';

interface BlockTimeSlotSelectionProps {
  selectedDate: string;
  selectedTimeSlots: number[];
  onTimeSlotChange: (timeSlotIds: number[]) => void;
  guestsPerSlot: number;
  onGuestsPerSlotChange: (guests: number) => void;
  adminUserId?: string;
}

const BlockTimeSlotSelection = ({
  selectedDate,
  selectedTimeSlots,
  onTimeSlotChange,
  guestsPerSlot,
  onGuestsPerSlotChange,
  adminUserId
}: BlockTimeSlotSelectionProps) => {
  const { timeSlots, loading, error, loadTimeSlotsForDate } = useBlockTimeSlots(adminUserId);
  const { formatDisplayDate } = useAdminDateUtils();
  const [availabilityErrors, setAvailabilityErrors] = useState<Map<number, string>>(new Map());

  // Cargar horarios cuando cambia la fecha
  useEffect(() => {
    if (selectedDate) {
      loadTimeSlotsForDate(selectedDate);
    }
  }, [selectedDate, loadTimeSlotsForDate]);

  // Formatear hora para mostrar
  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  // Manejar selección/deselección de horario
  const handleTimeSlotToggle = (timeSlotId: number) => {
    const isSelected = selectedTimeSlots.includes(timeSlotId);
    
    if (isSelected) {
      // Deseleccionar
      const newSelection = selectedTimeSlots.filter(id => id !== timeSlotId);
      onTimeSlotChange(newSelection);
      
      // Limpiar error de disponibilidad si existe
      const newErrors = new Map(availabilityErrors);
      newErrors.delete(timeSlotId);
      setAvailabilityErrors(newErrors);
    } else {
      // Seleccionar
      const newSelection = [...selectedTimeSlots, timeSlotId];
      onTimeSlotChange(newSelection);
    }
  };

  // Verificar disponibilidad para un horario específico
  const checkSlotAvailability = (slot: BlockTimeSlotWithAvailability) => {
    console.log('🔍 [BlockTimeSlotSelection] Verificando slot:', {
      slotId: slot.id,
      isBlocked: slot.isBlocked,
      available: slot.available,
      blockedGuests: slot.blockedGuests,
      guestsPerSlot,
      adminUserId
    });

    // Bloquear selección si no hay cupos configurados
    if (guestsPerSlot === 0) {
      return {
        canBlock: false,
        available: 0,
        message: 'Configura los cupos a bloquear'
      };
    }

    if (slot.isBlocked) {
      return {
        canBlock: false,
        available: 0,
        message: 'Horario ya bloqueado'
      };
    }

    if (slot.available < guestsPerSlot) {
      return {
        canBlock: false,
        available: slot.available,
        message: `Solo ${slot.available} cupos disponibles`
      };
    }

    return {
      canBlock: true,
      available: slot.available,
      message: `${slot.available} cupos disponibles`
    };
  };

  // Obtener color del badge según el estado
  const getBadgeColor = (slot: BlockTimeSlotWithAvailability) => {
    if (slot.isBlocked) return 'bg-red-100 text-red-800';
    if (slot.available === 0) return 'bg-gray-100 text-gray-800';
    if (slot.available < guestsPerSlot) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Obtener texto del badge
  const getBadgeText = (slot: BlockTimeSlotWithAvailability) => {
    if (slot.isBlocked) return 'Bloqueado';
    if (slot.available === 0) return 'Sin cupos';
    if (slot.available < guestsPerSlot) return 'Cupos limitados';
    return 'Disponible';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Seleccionar Horarios
          </CardTitle>
          <CardDescription>
            Cargando horarios disponibles para {formatDisplayDate(selectedDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Cargando horarios...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Seleccionar Horarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar horarios: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!timeSlots || timeSlots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Seleccionar Horarios
          </CardTitle>
          <CardDescription>
            No hay horarios disponibles para {formatDisplayDate(selectedDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay horarios disponibles para esta fecha</p>
            <p className="text-sm">Selecciona otra fecha o verifica la configuración</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="flex items-center text-base sm:text-lg">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Seleccionar Horarios
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Selecciona los horarios que quieres bloquear para {formatDisplayDate(selectedDate)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 sm:px-6">
        {/* Configuración de cupos por horario */}
        <div className="p-3 bg-gray-50 rounded-md">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Cupos a bloquear por horario
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={guestsPerSlot}
              onChange={(e) => {
                const value = e.target.value;
                // Permitir campo vacío temporalmente
                if (value === '') {
                  onGuestsPerSlotChange(0); // Usar 0 para representar campo vacío
                } else {
                  const numValue = parseInt(value);
                  // Solo aceptar números válidos entre 1 y 20
                  if (!isNaN(numValue) && numValue >= 1 && numValue <= 20) {
                    onGuestsPerSlotChange(numValue);
                  }
                  // Si es un número inválido, no hacer nada (mantener el valor anterior)
                }
              }}
              onBlur={(e) => {
                // Al perder el foco, si está vacío o es 0, establecer valor por defecto
                const value = e.target.value;
                if (value === '' || value === '0') {
                  onGuestsPerSlotChange(1);
                }
              }}
              className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
            />
            <span className="text-xs sm:text-sm text-gray-600">cupos por horario</span>
          </div>
        </div>

        {/* Lista de horarios */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {timeSlots.map((slot) => {
            const isSelected = selectedTimeSlots.includes(slot.id);
            const availability = checkSlotAvailability(slot);
            const badgeColor = getBadgeColor(slot);
            const badgeText = getBadgeText(slot);

            return (
              <div
                key={slot.id}
                className={`p-3 sm:p-4 border rounded-lg transition-colors ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-2 sm:space-x-3">
                  {/* Checkbox */}
                  <Checkbox
                    id={`slot-${slot.id}`}
                    checked={isSelected}
                    onCheckedChange={() => handleTimeSlotToggle(slot.id)}
                    disabled={!availability.canBlock}
                    className="mt-1 flex-shrink-0"
                  />

                  {/* Información del horario */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <label
                        htmlFor={`slot-${slot.id}`}
                        className="text-xs sm:text-sm font-medium text-gray-900 cursor-pointer"
                      >
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </label>
                      <Badge className={`${badgeColor} text-xs`}>
                        {badgeText}
                      </Badge>
                    </div>

                    {/* Información de cupos */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>
                          {slot.available} / {slot.max_capacity} disponibles
                        </span>
                      </div>
                      
                      {slot.isBlocked && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{slot.blockedGuests} cupos bloqueados</span>
                        </div>
                      )}
                    </div>

                    {/* Barra de progreso */}
                    <div className="mt-2">
                      <Progress 
                        value={slot.occupancyPercentage} 
                        className="h-2"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {slot.occupancyPercentage}% ocupado
                      </div>
                    </div>

                    {/* Mensaje de disponibilidad */}
                    {!availability.canBlock && (
                      <div className="mt-2 text-xs text-red-600">
                        {availability.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen de selección */}
        {selectedTimeSlots.length > 0 && (
          <div className="p-3 bg-blue-50 rounded-md">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {selectedTimeSlots.length} horario{selectedTimeSlots.length !== 1 ? 's' : ''} seleccionado{selectedTimeSlots.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-xs text-blue-700 mt-1">
              Se bloquearán {guestsPerSlot * selectedTimeSlots.length} cupos en total
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlockTimeSlotSelection;
