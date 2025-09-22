import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Users, Mail, Phone, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ReservationForm = () => {
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [guests, setGuests] = useState('1');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Horarios disponibles (intervalos de 1h45min)
  const timeSlots = [
    { value: '10:00', label: '10:00 AM - 11:45 AM', available: 16 },
    { value: '12:00', label: '12:00 PM - 1:45 PM', available: 12 },
    { value: '14:15', label: '2:15 PM - 4:00 PM', available: 8 },
    { value: '16:30', label: '4:30 PM - 6:15 PM', available: 6 },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aquí necesitarías conectar con Supabase para guardar la reserva
    alert(`¡Gracias! Tu reserva ha sido recibida.\n\nDetalles:\nFecha: ${date ? format(date, 'PPP', { locale: es }) : ''}\nHora: ${selectedTime}\nPersonas: ${guests}\n\nTe contactaremos pronto para confirmar.`);
  };

  const isFormValid = date && selectedTime && guests && formData.name && formData.email && formData.phone;

  return (
    <Card className="max-w-2xl mx-auto shadow-warm">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-3xl text-primary mb-2">
          Aparta tu lugar
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          Deja que la creatividad fluya en una experiencia única
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Alert className="mb-6 border-olive bg-olive/5">
          <AlertDescription>
            <strong>Nota importante:</strong> Este formulario necesita conectarse a Supabase para funcionar completamente. 
            Por ahora muestra una vista previa de la experiencia de reserva.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User size={16} />
                Nombre completo *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Tu nombre completo"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone size={16} />
                Teléfono *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+52 999 123 4567"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail size={16} />
              Correo electrónico *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="tu@correo.com"
              required
            />
          </div>

          {/* Selección de Fecha */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon size={16} />
              Fecha de tu sesión *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: es }) : "Selecciona una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0} // No domingos
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Selección de Hora */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock size={16} />
              Horario disponible *
            </Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Elige tu horario preferido" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem 
                    key={slot.value} 
                    value={slot.value}
                    className="flex justify-between"
                  >
                    <div className="flex justify-between w-full">
                      <span>{slot.label}</span>
                      <span className="text-sm text-muted-foreground ml-4">
                        {slot.available} lugares disponibles
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Número de Personas */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users size={16} />
              Número de personas *
            </Label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'persona' : 'personas'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botón de Confirmación */}
          <Button 
            type="submit" 
            className="btn-ceramica w-full text-lg py-6"
            disabled={!isFormValid}
          >
            Confirmar mi experiencia
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Recibirás una confirmación por correo electrónico y te contactaremos para finalizar los detalles.
        </p>
      </CardContent>
    </Card>
  );
};

export default ReservationForm;