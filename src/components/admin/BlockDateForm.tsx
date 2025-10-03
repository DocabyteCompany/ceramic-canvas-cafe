import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, FileText, CheckCircle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import BlockTimeSlotSelection from './BlockTimeSlotSelection';
import { useAdminDateUtils } from '@/hooks/useAdminDateUtils';

interface BlockDateFormProps {
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  adminUserId: string;
}

interface FormData {
  selectedDate: string;
  blockType: 'full' | 'specific';
  selectedTimeSlots: number[];
  guestsPerSlot: number;
  blockReason: string;
}

const BlockDateForm = ({ onSuccess, onError, adminUserId }: BlockDateFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    selectedDate: '',
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

  // Limpiar formulario cuando se desmonta
  useEffect(() => {
    return () => {
      setFormData({
        selectedDate: '',
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
      const dateInfo = getDateInfo(formData.selectedDate);
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
            const dateInfo = getDateInfo(formData.selectedDate);
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
      
      let result;
      
      if (formData.blockType === 'full') {
        // Bloquear día completo
        result = await BlockedDatesService.blockFullDay(
          formData.selectedDate,
          formData.blockReason.trim(),
          adminUserId
        );
      } else {
        // Bloquear horarios específicos
        result = await BlockedDatesService.blockSpecificTimeSlots(
          formData.selectedDate,
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

      const blockCount = result.data?.length || 0;
      const message = formData.blockType === 'full' 
        ? `Día completo bloqueado exitosamente (${blockCount} horarios)`
        : `Horarios específicos bloqueados exitosamente (${blockCount} horarios)`;
      
      onSuccess(message);
      
      // Limpiar formulario
      setFormData({
        selectedDate: '',
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
              <Label htmlFor="date" className="text-sm font-medium">Fecha a bloquear</Label>
              <Input
                id="date"
                type="date"
                value={formData.selectedDate}
                onChange={(e) => updateFormData({ selectedDate: e.target.value })}
                min={getTodayString()}
                max={getMaxDateString()}
                className="mt-1 w-full"
              />
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
                    Fecha seleccionada: {formatDisplayDate(formData.selectedDate)}
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
            <BlockTimeSlotSelection
              selectedDate={formData.selectedDate}
              selectedTimeSlots={formData.selectedTimeSlots}
              onTimeSlotChange={(timeSlots) => updateFormData({ selectedTimeSlots: timeSlots })}
              guestsPerSlot={formData.guestsPerSlot}
              onGuestsPerSlotChange={(guests) => updateFormData({ guestsPerSlot: guests })}
            />
          );
        }
        return (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p>Día completo seleccionado</p>
            <p className="text-sm">Se bloquearán todos los horarios disponibles</p>
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
                <div>• Fecha: {formatDisplayDate(formData.selectedDate)}</div>
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

export default BlockDateForm;
