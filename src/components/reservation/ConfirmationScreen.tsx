import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Calendar, Clock, Users, Mail, Phone, MapPin } from 'lucide-react';
import type { ReservationData } from '../ReservationWizard';

interface ConfirmationScreenProps {
  reservationData: ReservationData;
  onComplete: () => void;
}

export const ConfirmationScreen = ({ reservationData, onComplete }: ConfirmationScreenProps) => {
  const handleConfirm = () => {
    // Simulate reservation processing
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle size={64} className="text-primary" />
        </div>
        <h3 className="font-display text-2xl text-foreground mb-2">
          ¡Tu lugar ha sido reservado!
        </h3>
        <p className="text-muted-foreground text-lg">
          Te esperamos con café y creatividad
        </p>
      </div>

      {/* Reservation Summary */}
      <Card className="max-w-md mx-auto border-primary/20 bg-primary/5">
        <CardContent className="p-6 space-y-4">
          <h4 className="font-semibold text-lg text-center mb-4 text-primary">
            Resumen de tu reserva
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Users size={18} className="text-primary" />
              <div>
                <p className="font-medium">{reservationData.name}</p>
                <p className="text-sm text-muted-foreground">
                  {reservationData.guests} {reservationData.guests === 1 ? 'persona' : 'personas'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-primary" />
              <div>
                <p className="font-medium">
                  {reservationData.date && format(reservationData.date, 'EEEE, d MMMM yyyy', { locale: es })}
                </p>
                <p className="text-sm text-muted-foreground">Fecha de tu sesión</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock size={18} className="text-primary" />
              <div>
                <p className="font-medium">{reservationData.timeSlot?.label}</p>
                <p className="text-sm text-muted-foreground">Duración: 1 hora 45 minutos</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail size={18} className="text-primary" />
              <div>
                <p className="font-medium">{reservationData.email}</p>
                <p className="text-sm text-muted-foreground">Correo de confirmación</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={18} className="text-primary" />
              <div>
                <p className="font-medium">{reservationData.phone}</p>
                <p className="text-sm text-muted-foreground">Teléfono de contacto</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-primary" />
              <div>
                <p className="font-medium">Cerámico, Arte & Café</p>
                <p className="text-sm text-muted-foreground">Calle 47 #463-A x 52 y 54, Centro</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="max-w-md mx-auto border-olive/30 bg-olive/10">
        <CardContent className="p-6">
          <h5 className="font-semibold mb-3 text-olive-dark">Información importante:</h5>
          <ul className="text-sm space-y-2 text-foreground">
            <li>• La sesión dura 1 hora 45 minutos</li>
            <li>• Las bebidas y postres se pagan por separado</li>
            <li>• Tu pieza estará lista para recoger en 2-3 días</li>
            <li>• Te notificaremos cuando esté lista</li>
          </ul>
        </CardContent>
      </Card>

      {/* Confirm Button */}
      <div className="flex justify-center pt-4">
        <Button 
          onClick={handleConfirm}
          className="btn-ceramica text-lg px-16 py-6"
        >
          Confirmar mi experiencia
        </Button>
      </div>
    </div>
  );
};