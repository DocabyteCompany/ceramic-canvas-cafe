import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, Users, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useReservations } from '@/hooks/useReservations';
import type { ReservationData } from '../ReservationWizard';

interface PersonalInfoFormProps {
  reservationData: ReservationData;
  onComplete: (data: Partial<ReservationData>) => void;
  onBack: () => void;
  maxGuests: number;
}

export const PersonalInfoForm = ({ reservationData, onComplete, onBack, maxGuests }: PersonalInfoFormProps) => {
  const [formData, setFormData] = useState({
    name: reservationData.name || '',
    email: reservationData.email || '',
    phone: reservationData.phone || '',
    guests: reservationData.guests || 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [currentAvailability, setCurrentAvailability] = useState<number>(maxGuests);

  const { checkAvailability } = useReservations();

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Verificar disponibilidad cuando cambia el número de huéspedes
    if (field === 'guests' && typeof value === 'number') {
      checkRealTimeAvailability(value);
    }
  };

  // Verificar disponibilidad en tiempo real cuando cambia el número de huéspedes
  const checkRealTimeAvailability = async (guests: number) => {
    if (!reservationData.date || !reservationData.timeSlot) {
      return;
    }

    try {
      setCheckingAvailability(true);
      setAvailabilityError(null);

      // Obtener el time_slot_id real del time slot seleccionado
      // Por ahora usamos un valor temporal basado en el horario seleccionado
      // En una implementación completa, esto vendría del time slot seleccionado
      const timeSlotId = getTimeSlotIdFromTime(reservationData.timeSlot.value);
      const dateString = reservationData.date.toISOString().split('T')[0];
      
      const { available, canReserve, error } = await checkAvailability(timeSlotId, dateString, guests);
      
      if (error) {
        setAvailabilityError(error);
        return;
      }

      setCurrentAvailability(available);
      
      if (!canReserve) {
        setErrors(prev => ({ 
          ...prev, 
          guests: `Solo hay ${available} lugares disponibles para este horario` 
        }));
      }
    } catch (error: any) {
      setAvailabilityError(error.message);
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Función temporal para obtener time_slot_id basado en el horario
  // En una implementación completa, esto vendría del time slot seleccionado
  const getTimeSlotIdFromTime = (time: string): number => {
    // Mapeo temporal de horarios a IDs
    // En la implementación real, esto vendría del time slot seleccionado
    const timeToIdMap: Record<string, number> = {
      '10:00': 1,
      '12:00': 2,
      '14:00': 3,
      '16:00': 4,
      '18:15': 5,
      '11:45': 6,
      '13:30': 7
    };
    
    return timeToIdMap[time] || 1;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^[\+]?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Ingresa un número de teléfono válido';
    }

    if (formData.guests < 1) {
      newErrors.guests = 'Debe ser al menos 1 persona';
    } else if (formData.guests > 5) {
      newErrors.guests = 'Máximo 5 personas por reservación';
    } else if (formData.guests > currentAvailability) {
      newErrors.guests = `Solo hay ${currentAvailability} lugares disponibles`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onComplete(formData);
    }
  };

  const isFormValid = formData.name && formData.email && formData.phone && formData.guests <= currentAvailability && formData.guests >= 1 && !checkingAvailability;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="font-display text-2xl text-foreground mb-2">
          Cuéntanos quién viene a crear arte
        </h3>
        <p className="text-muted-foreground">
          Necesitamos algunos datos para confirmar tu reserva
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2 text-base">
            <User size={18} className="text-primary" />
            Nombre completo *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Tu nombre completo"
            className={`h-12 text-base ${errors.name ? 'border-destructive' : ''}`}
            required
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2 text-base">
            <Mail size={18} className="text-primary" />
            Correo electrónico *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="tu@correo.com"
            className={`h-12 text-base ${errors.email ? 'border-destructive' : ''}`}
            required
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2 text-base">
            <Phone size={18} className="text-primary" />
            Teléfono *
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+52 999 123 4567"
            className={`h-12 text-base ${errors.phone ? 'border-destructive' : ''}`}
            required
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>

        {/* Number of Guests */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-base">
            <Users size={18} className="text-primary" />
            Número de personas *
            {checkingAvailability && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
          </Label>
          <Select 
            value={formData.guests.toString()} 
            onValueChange={(value) => handleInputChange('guests', parseInt(value))}
            disabled={checkingAvailability}
          >
            <SelectTrigger className={`h-12 text-base ${errors.guests ? 'border-destructive' : ''}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: Math.min(5, currentAvailability) }, (_, i) => i + 1).map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'persona' : 'personas'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.guests && (
            <p className="text-sm text-destructive">{errors.guests}</p>
          )}
          {availabilityError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {availabilityError}
              </AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground">
            Lugares disponibles en este horario: {currentAvailability}
            {checkingAvailability && ' (verificando...)'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 h-12 text-base"
          >
            <ArrowLeft size={18} className="mr-2" />
            Volver
          </Button>
          
          <Button
            type="submit"
            className="flex-1 btn-ceramica h-12 text-base"
            disabled={!isFormValid}
          >
            Continuar
          </Button>
        </div>
      </form>
    </div>
  );
};