import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, FileText, CheckCircle, ArrowLeft, ArrowRight, Loader2, CalendarIcon, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import BlockTimeSlotSelection from './BlockTimeSlotSelection';
import { useAdminDateUtils } from '@/hooks/useAdminDateUtils';

interface BlockDateFormProps {
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  adminUserId: string;
}

interface FormData {
  selectedDate: Date | null;
  blockType: 'full' | 'specific';
  selectedTimeSlots: number[];
  guestsPerSlot: number;
  blockReason: string;
}

const BlockDateForm = ({ onSuccess, onError, adminUserId }: BlockDateFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    selectedDate: null,
    blockType: 'full',
    selectedTimeSlots: [],
    guestsPerSlot: 20,
    blockReason: ''
  });

  const totalSteps = 5;
  
  // Hook para manejo de fechas
  const {
    getDateInfo,
    formatDisplayDate,
    getTodayString,
    getMaxDateString,
    isValidDate,
    isDateAvailable
  } = useAdminDateUtils();

  // Función para deshabilitar fechas (copiada de DateTimeSelection.tsx adaptada para admin)
  const isDateDisabled = (date: Date) => {
    const dayOfWeek = date.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Inicio del día
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6); // Máximo 6 meses en el futuro para admin
    
    // No permitir fechas pasadas
    if (date < today) {
      return true;
    }
    
    // No permitir fechas más de 6 meses en el futuro
    if (date > maxDate) {
      return true;
    }
    
    // No permitir lunes (1)
    if (dayOfWeek === 1) {
      return true;
    }
    
    // Verificar si el día está disponible según las reglas de negocio
    return !isDateAvailable(format(date, 'yyyy-MM-dd'));
  };

  // Limpiar formulario cuando se desmonta
  useEffect(() => {
    return () => {
      setFormData({
        selectedDate: null,
        blockType: 'full',
        selectedTimeSlots: [],
        guestsPerSlot: 20,
        blockReason: ''
      });
      setCurrentStep(1);
    };
  }, []);

  // Validar paso actual
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1: // Fecha
        return validateDate();
      case 2: // Tipo de bloqueo
        return !!formData.blockType;
      case 3: // Horarios específicos (solo si es necesario)
        if (formData.blockType === 'specific') {
          return validateTimeSlots();
        }
        return true;
      case 4: // Configuración de cupos (solo si es específico)
        if (formData.blockType === 'specific') {
          return validateGuestsPerSlot();
        }
        return true;
      case 5: // Razón
        return validateReason();
      default:
        return false;
    }
  };

  // Validar fecha usando DateUtils
  const validateDate = (): boolean => {
    if (!formData.selectedDate) return false;
    
    try {
      const dateString = format(formData.selectedDate, 'yyyy-MM-dd');
      const dateInfo = getDateInfo(dateString);
      return dateInfo.isValid && dateInfo.isAvailable;
    } catch {
      return false;
    }
  };

  // Validar horarios específicos
  const validateTimeSlots = (): boolean => {
    if (formData.selectedTimeSlots.length === 0) return false;
    
    // Verificar que no se excedan los horarios disponibles
    if (formData.selectedTimeSlots.length > 10) return false; // Límite razonable
    
    return true;
  };

  // Validar cupos por horario
  const validateGuestsPerSlot = (): boolean => {
    // Rechazar valores vacíos o 0
    if (formData.guestsPerSlot === 0) return false;
    
    if (formData.guestsPerSlot < 1 || formData.guestsPerSlot > 20) return false;
    
    // Verificar que sea un número entero
    if (!Number.isInteger(formData.guestsPerSlot)) return false;
    
    return true;
  };

  // Validar razón del bloqueo
  const validateReason = (): boolean => {
    const reason = formData.blockReason.trim();
    
    // Mínimo 5 caracteres, máximo 200
    if (reason.length < 5 || reason.length > 200) return false;
    
    // No permitir solo espacios o caracteres especiales
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:!?()-]+$/.test(reason)) return false;
    
    return true;
  };

  // Avanzar al siguiente paso
  const handleNext = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Retroceder al paso anterior
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Actualizar datos del formulario
  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Obtener mensajes de validación
  const getValidationMessage = (): string => {
    switch (currentStep) {
      case 1:
        if (!formData.selectedDate) return 'Selecciona una fecha';
        if (!validateDate()) {
          try {
            const dateString = format(formData.selectedDate, 'yyyy-MM-dd');
            const dateInfo = getDateInfo(dateString);
            return dateInfo.error || 'Fecha inválida';
          } catch {
            return 'Fecha inválida';
          }
        }
        return '';
      case 2:
        return !formData.blockType ? 'Selecciona un tipo de bloqueo' : '';
      case 3:
        if (formData.blockType === 'specific') {
          if (formData.selectedTimeSlots.length === 0) return 'Selecciona al menos un horario';
          if (formData.selectedTimeSlots.length > 10) return 'No puedes seleccionar más de 10 horarios';
        }
        return '';
      case 4:
        if (formData.blockType === 'specific') {
          if (formData.guestsPerSlot === 0) return 'Los cupos son requeridos';
          if (formData.guestsPerSlot < 1 || formData.guestsPerSlot > 20) return 'Los cupos deben estar entre 1 y 20';
          if (!Number.isInteger(formData.guestsPerSlot)) return 'Los cupos deben ser un número entero';
        }
        return '';
      case 5:
        const reason = formData.blockReason.trim();
        if (reason.length === 0) return 'La razón del bloqueo es requerida';
        if (reason.length < 5) return 'La razón debe tener al menos 5 caracteres';
        if (reason.length > 200) return 'La razón no puede tener más de 200 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:!?()-]+$/.test(reason)) return 'La razón contiene caracteres no válidos';
        return '';
      default:
        return '';
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      const message = getValidationMessage();
      onError(message || 'Por favor completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);

    try {
      // Importar el servicio dinámicamente para evitar problemas de dependencias
      const { BlockedDatesService } = await import('@/services/blockedDatesService');
      
      const dateString = format(formData.selectedDate!, 'yyyy-MM-dd');
      
      console.log('🔍 [BlockDateForm] Fecha seleccionada:', {
        originalDate: formData.selectedDate,
        formattedDate: dateString,
        dayOfWeek: formData.selectedDate!.getDay(),
        dayName: format(formData.selectedDate!, 'EEEE', { locale: es })
      });
      
      // Verificar bloqueos existentes antes de proceder
      const { hasBlocks, existingBlocks, blockedTimeSlots, canBlockFullDay, error: checkError } = 
        await BlockedDatesService.checkExistingBlocks(dateString, adminUserId);
      
      if (checkError) {
        onError('Error verificando bloqueos existentes: ' + checkError);
        return;
      }

      let result;
      
      if (formData.blockType === 'full') {
        // Verificar si se puede bloquear día completo
        if (hasBlocks && !canBlockFullDay) {
          onError('Ya existen bloqueos en esta fecha creados por otro administrador. No se puede bloquear el día completo.');
          return;
        }

        // Mostrar advertencia si hay bloqueos del admin actual
        if (hasBlocks && canBlockFullDay) {
          const confirmMessage = `Ya tienes bloqueos en esta fecha.\n\n¿Deseas continuar bloqueando los horarios restantes?\n\nHorarios ya bloqueados: ${blockedTimeSlots.length}\nHorarios a bloquear: ${existingBlocks ? 'Los restantes' : 'Todos'}`;
          
          if (!confirm(confirmMessage)) {
            setIsSubmitting(false);
            return;
          }
        }

        // Bloquear día completo
        result = await BlockedDatesService.blockFullDay(
          dateString,
          formData.blockReason.trim(),
          adminUserId
        );
      } else {
        // Verificar conflictos para horarios específicos
        const conflictingSlots = formData.selectedTimeSlots.filter(slotId => 
          blockedTimeSlots.includes(slotId) && 
          existingBlocks?.some(block => 
            block.time_slot_id === slotId && block.blocked_by !== adminUserId
          )
        );

        if (conflictingSlots.length > 0) {
          onError(`Los siguientes horarios ya están bloqueados por otro administrador: ${conflictingSlots.join(', ')}`);
          return;
        }

        // Mostrar advertencia si hay horarios ya bloqueados por el admin actual
        const alreadyBlockedByAdmin = formData.selectedTimeSlots.filter(slotId => 
          blockedTimeSlots.includes(slotId) && 
          existingBlocks?.some(block => 
            block.time_slot_id === slotId && block.blocked_by === adminUserId
          )
        );

        if (alreadyBlockedByAdmin.length > 0) {
          const confirmMessage = `Algunos horarios ya están bloqueados por ti:\n\nHorarios ya bloqueados: ${alreadyBlockedByAdmin.join(', ')}\nHorarios nuevos: ${formData.selectedTimeSlots.filter(id => !alreadyBlockedByAdmin.includes(id)).join(', ')}\n\n¿Deseas continuar?`;
          
          if (!confirm(confirmMessage)) {
            setIsSubmitting(false);
            return;
          }
        }

        // Bloquear horarios específicos
        result = await BlockedDatesService.blockSpecificTimeSlots(
          dateString,
          formData.selectedTimeSlots,
          formData.blockReason.trim(),
          adminUserId,
          formData.guestsPerSlot
        );
      }

      if (result.error) {
        onError('Error al crear bloqueo: ' + result.error);
        return;
      }

      // Usar mensaje del servicio si está disponible, sino crear uno genérico
      const message = result.message || (
        formData.blockType === 'full' 
          ? `Día completo bloqueado exitosamente (${result.data?.length || 0} horarios)`
          : `Horarios específicos bloqueados exitosamente (${result.data?.length || 0} horarios)`
      );
      
      onSuccess(message);
      
      // Limpiar formulario
      setFormData({
        selectedDate: null,
        blockType: 'full',
        selectedTimeSlots: [],
        guestsPerSlot: 20,
        blockReason: ''
      });
      setCurrentStep(1);
      
    } catch (error: any) {
      onError('Error inesperado: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatear fecha para mostrar (usando el hook)
  // const formatDisplayDate ya está disponible desde useAdminDateUtils

  // Renderizar contenido del paso actual
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Fecha
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Fecha a bloquear</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !formData.selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.selectedDate ? (
                      format(formData.selectedDate, "PPP", { locale: es })
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.selectedDate || undefined}
                    onSelect={(date) => updateFormData({ selectedDate: date || null })}
                    disabled={isDateDisabled}
                    locale={es}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <div className="text-xs text-gray-600 mt-2 space-y-1">
                <div>• No se pueden seleccionar fechas pasadas</div>
                <div>• Los lunes el negocio está cerrado</div>
                <div>• Máximo 6 meses en el futuro</div>
              </div>
            </div>
            
            {formData.selectedDate && (
              <div className={`p-3 rounded-md ${
                validateDate() ? 'bg-blue-50' : 'bg-red-50'
              }`}>
                <div className="flex items-center space-x-2">
                  <Calendar className={`h-4 w-4 ${
                    validateDate() ? 'text-blue-600' : 'text-red-600'
                  }`} />
                  <span className={`text-sm font-medium ${
                    validateDate() ? 'text-blue-900' : 'text-red-900'
                  }`}>
                    Fecha seleccionada: {formatDisplayDate(format(formData.selectedDate, 'yyyy-MM-dd'))}
                  </span>
                </div>
                {!validateDate() && (
                  <div className="text-xs text-red-700 mt-1">
                    {getValidationMessage()}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 2: // Tipo de bloqueo
        return (
          <div className="space-y-4">
            <Label>Tipo de bloqueo</Label>
            <div className="space-y-3">
              <label className="flex items-start sm:items-center p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="blockType"
                  value="full"
                  checked={formData.blockType === 'full'}
                  onChange={(e) => updateFormData({ blockType: e.target.value as 'full' })}
                  className="mr-3 mt-1 sm:mt-0"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm sm:text-base">Día completo</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">
                    Bloquear todos los horarios disponibles del día
                  </div>
                </div>
              </label>
              
              <label className="flex items-start sm:items-center p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="blockType"
                  value="specific"
                  checked={formData.blockType === 'specific'}
                  onChange={(e) => updateFormData({ blockType: e.target.value as 'specific' })}
                  className="mr-3 mt-1 sm:mt-0"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm sm:text-base">Horarios específicos</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">
                    Seleccionar horarios específicos para bloquear
                  </div>
                </div>
              </label>
            </div>
          </div>
        );

      case 3: // Horarios específicos
        if (formData.blockType === 'specific') {
          return (
            <div className="space-y-4">
              {/* Advertencia sobre bloqueos existentes */}
              {formData.selectedDate && (
                <ExistingBlocksWarning 
                  date={format(formData.selectedDate, 'yyyy-MM-dd')}
                  adminUserId={adminUserId}
                />
              )}
              
              <BlockTimeSlotSelection
                selectedDate={formData.selectedDate ? format(formData.selectedDate, 'yyyy-MM-dd') : ''}
                selectedTimeSlots={formData.selectedTimeSlots}
                onTimeSlotChange={(timeSlots) => updateFormData({ selectedTimeSlots: timeSlots })}
                guestsPerSlot={formData.guestsPerSlot}
                onGuestsPerSlotChange={(guests) => updateFormData({ guestsPerSlot: guests })}
                adminUserId={adminUserId}
              />
            </div>
          );
        }
        return (
          <div className="space-y-4">
            {/* Advertencia sobre bloqueos existentes para día completo */}
            {formData.selectedDate && (
              <ExistingBlocksWarning 
                date={format(formData.selectedDate, 'yyyy-MM-dd')}
                adminUserId={adminUserId}
                isFullDay={true}
              />
            )}
            
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>Día completo seleccionado</p>
              <p className="text-sm">Se bloquearán todos los horarios disponibles</p>
            </div>
          </div>
        );

      case 4: // Configuración de cupos
        if (formData.blockType === 'specific') {
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="guestsPerSlot" className="text-sm font-medium">Cupos a bloquear por horario</Label>
                <Input
                  id="guestsPerSlot"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.guestsPerSlot}
                  onChange={(e) => updateFormData({ guestsPerSlot: parseInt(e.target.value) || 1 })}
                  className="mt-1 w-24 sm:w-32"
                />
                <div className="text-xs text-gray-600 mt-2 space-y-1">
                  <div>• Mínimo 1 cupo por horario</div>
                  <div>• Máximo 20 cupos por horario</div>
                  <div>• Debe ser un número entero</div>
                </div>
                {!validateGuestsPerSlot() && (
                  <div className="text-xs text-red-600 mt-2">
                    {getValidationMessage()}
                  </div>
                )}
              </div>
              
              <div className={`p-3 rounded-md ${
                validateGuestsPerSlot() ? 'bg-blue-50' : 'bg-red-50'
              }`}>
                <div className={`text-sm ${
                  validateGuestsPerSlot() ? 'text-blue-900' : 'text-red-900'
                }`}>
                  <strong>Resumen:</strong>
                </div>
                <div className={`text-sm mt-1 ${
                  validateGuestsPerSlot() ? 'text-blue-700' : 'text-red-700'
                }`}>
                  • {formData.selectedTimeSlots.length} horario{formData.selectedTimeSlots.length !== 1 ? 's' : ''} seleccionado{formData.selectedTimeSlots.length !== 1 ? 's' : ''}
                </div>
                <div className={`text-sm ${
                  validateGuestsPerSlot() ? 'text-blue-700' : 'text-red-700'
                }`}>
                  • {formData.guestsPerSlot} cupos por horario
                </div>
                <div className={`text-sm ${
                  validateGuestsPerSlot() ? 'text-blue-700' : 'text-red-700'
                }`}>
                  • Total: {formData.guestsPerSlot * formData.selectedTimeSlots.length} cupos bloqueados
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p>Configuración de día completo</p>
            <p className="text-sm">Se bloquearán todos los cupos disponibles en cada horario</p>
          </div>
        );

      case 5: // Razón del bloqueo
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason" className="text-sm font-medium">Razón del bloqueo</Label>
              <Input
                id="reason"
                value={formData.blockReason}
                onChange={(e) => updateFormData({ blockReason: e.target.value })}
                placeholder="Ej: Mantenimiento, Evento privado, Capacitación..."
                className="mt-1 w-full"
                maxLength={200}
              />
              <div className="text-xs text-gray-600 mt-2 space-y-1">
                <div>• Mínimo 5 caracteres, máximo 200</div>
                <div>• Solo letras, números y caracteres básicos</div>
                <div>• Describe brevemente por qué se bloquean estos horarios</div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {formData.blockReason.length}/200 caracteres
              </div>
              {!validateReason() && (
                <div className="text-xs text-red-600 mt-2">
                  {getValidationMessage()}
                </div>
              )}
            </div>
            
            <div className={`p-3 rounded-md ${
              validateReason() ? 'bg-gray-50' : 'bg-red-50'
            }`}>
              <div className={`text-sm font-medium mb-2 ${
                validateReason() ? 'text-gray-900' : 'text-red-900'
              }`}>Resumen final:</div>
              <div className={`space-y-1 text-sm ${
                validateReason() ? 'text-gray-600' : 'text-red-700'
              }`}>
                <div>• Fecha: {formatDisplayDate(format(formData.selectedDate, 'yyyy-MM-dd'))}</div>
                <div>• Tipo: {formData.blockType === 'full' ? 'Día completo' : 'Horarios específicos'}</div>
                {formData.blockType === 'specific' && (
                  <>
                    <div>• Horarios: {formData.selectedTimeSlots.length} seleccionados</div>
                    <div>• Cupos por horario: {formData.guestsPerSlot}</div>
                  </>
                )}
                <div>• Razón: {formData.blockReason || 'Sin especificar'}</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Obtener título del paso actual
  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Seleccionar Fecha';
      case 2: return 'Tipo de Bloqueo';
      case 3: return 'Horarios Específicos';
      case 4: return 'Configuración de Cupos';
      case 5: return 'Razón del Bloqueo';
      default: return '';
    }
  };

  // Obtener descripción del paso actual
  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return 'Selecciona la fecha que quieres bloquear';
      case 2: return 'Elige si quieres bloquear el día completo o horarios específicos';
      case 3: return formData.blockType === 'specific' ? 'Selecciona los horarios a bloquear' : 'Día completo seleccionado';
      case 4: return formData.blockType === 'specific' ? 'Configura cuántos cupos bloquear por horario' : 'Configuración de día completo';
      case 5: return 'Describe la razón del bloqueo';
      default: return '';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="flex items-center text-lg sm:text-xl">
          <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
          Bloquear Fechas
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          {getStepTitle()} - Paso {currentStep} de {totalSteps}
        </CardDescription>
        
        {/* Barra de progreso */}
        <div className="mt-4">
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span className="hidden sm:inline">Fecha</span>
            <span className="hidden sm:inline">Tipo</span>
            <span className="hidden sm:inline">Horarios</span>
            <span className="hidden sm:inline">Cupos</span>
            <span className="hidden sm:inline">Razón</span>
            {/* Versión móvil */}
            <span className="sm:hidden">Paso {currentStep}/{totalSteps}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        {/* Contenido del paso actual */}
        <div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            {getStepTitle()}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            {getStepDescription()}
          </p>
          
          {renderStepContent()}
        </div>

        {/* Botones de navegación */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center justify-center order-2 sm:order-1 w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!validateCurrentStep()}
              className="flex items-center justify-center order-1 sm:order-2 w-full sm:w-auto"
            >
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!validateCurrentStep() || isSubmitting}
              className="flex items-center justify-center order-1 sm:order-2 w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Creando bloqueo...</span>
                  <span className="sm:hidden">Creando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Crear Bloqueo</span>
                  <span className="sm:hidden">Crear</span>
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para mostrar advertencias sobre bloqueos existentes
interface ExistingBlocksWarningProps {
  date: string;
  adminUserId: string;
  isFullDay?: boolean;
}

const ExistingBlocksWarning = ({ date, adminUserId, isFullDay = false }: ExistingBlocksWarningProps) => {
  const [existingBlocks, setExistingBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkExistingBlocks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { BlockedDatesService } = await import('@/services/blockedDatesService');
        const { hasBlocks, existingBlocks, blockedTimeSlots, canBlockFullDay } = 
          await BlockedDatesService.checkExistingBlocks(date, adminUserId);
        
        if (hasBlocks && existingBlocks) {
          setExistingBlocks(existingBlocks);
        } else {
          setExistingBlocks([]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (date) {
      checkExistingBlocks();
    }
  }, [date, adminUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-3 bg-gray-50 rounded-md">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400 mr-2" />
        <span className="text-sm text-gray-600">Verificando bloqueos existentes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al verificar bloqueos existentes: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (existingBlocks.length === 0) {
    return null; // No hay bloqueos existentes, no mostrar nada
  }

  // Agrupar bloqueos por admin
  const blocksByAdmin = existingBlocks.reduce((acc, block) => {
    const adminId = block.blocked_by;
    if (!acc[adminId]) {
      acc[adminId] = [];
    }
    acc[adminId].push(block);
    return acc;
  }, {} as Record<string, any[]>);

  const currentAdminBlocks = blocksByAdmin[adminUserId] || [];
  const otherAdminBlocks = Object.entries(blocksByAdmin)
    .filter(([adminId]) => adminId !== adminUserId)
    .flatMap(([, blocks]) => blocks);

  return (
    <div className="space-y-3">
      {/* Bloqueos de otros administradores */}
      {otherAdminBlocks.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">
              {isFullDay ? 'Día completo no disponible' : 'Horarios bloqueados por otros administradores'}
            </div>
            <div className="text-sm">
              {otherAdminBlocks.length} bloqueo{otherAdminBlocks.length > 1 ? 's' : ''} existente{otherAdminBlocks.length > 1 ? 's' : ''}
              {isFullDay && '. No se puede bloquear el día completo.'}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Bloqueos del administrador actual */}
      {currentAdminBlocks.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="font-medium mb-1">Ya tienes bloqueos en esta fecha</div>
            <div className="text-sm">
              {currentAdminBlocks.length} bloqueo{currentAdminBlocks.length > 1 ? 's' : ''} existente{currentAdminBlocks.length > 1 ? 's' : ''}
              {isFullDay ? '. Se bloquearán los horarios restantes.' : '. Puedes editar o agregar más horarios.'}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default BlockDateForm;
