import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Calendar, Clock, Users, Mail, Phone, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useReservations } from '@/hooks/useReservations';
import { useNotification } from '@/contexts/NotificationContext';
import { sendReservationConfirmation, convertToEmailData } from '@/services/brevoEmailService';
import type { ReservationData } from '../ReservationWizard';

interface ConfirmationScreenProps {
  reservationData: ReservationData;
  onComplete: () => void;
}

export const ConfirmationScreen = ({ reservationData, onComplete }: ConfirmationScreenProps) => {
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [createdReservationId, setCreatedReservationId] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const { createReservation } = useReservations();
  const { showSuccess, showError } = useNotification();

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleConfirm = async () => {
    if (!reservationData.date || !reservationData.timeSlot) {
      setReservationError('Datos de reservación incompletos');
      return;
    }

    try {
      setIsCreatingReservation(true);
      setReservationError(null);

      // Preparar datos para la reservación
      const reservationPayload = {
        time_slot_id: reservationData.timeSlot?.id || 1, // Usar el ID real del time slot seleccionado
        reservation_date: reservationData.date.toISOString().split('T')[0],
        customer_name: reservationData.name,
        customer_email: reservationData.email,
        customer_phone: reservationData.phone,
        guests: reservationData.guests
      };

      // Marcar tiempo de inicio para garantizar mínimo 2.5s en éxito
      const startedAt = performance.now();
      const { success, data, error } = await createReservation(reservationPayload);

      // Si falla, mostramos error inmediatamente (sin esperar)
      if (!success || !data) {
        const errorMessage = error || 'Error al crear la reservación';
        setReservationError(errorMessage);
        showError('Error al crear reservación', errorMessage);
        setIsCreatingReservation(false);
        return;
      }

      // Éxito: asegurar mínimo 2.5s en estado "Confirmando…"
      const elapsedMs = performance.now() - startedAt;
      const remainingMs = Math.max(0, 2500 - elapsedMs);
      if (remainingMs > 0) {
        await sleep(remainingMs);
      }

      setCreatedReservationId(data.id);
      setReservationSuccess(true);

      // Salir del estado de carga después del mínimo garantizado
      setIsCreatingReservation(false);

      // Enviar correo de confirmación
      setIsSendingEmail(true);
      setEmailError(null);
      
      try {
        const emailData = convertToEmailData(reservationData, data.id);
        const emailResult = await sendReservationConfirmation(emailData);
        
        if (emailResult.success) {
          setEmailSent(true);
          showSuccess(
            '¡Reservación confirmada!',
            `Tu reservación ha sido creada exitosamente. Se ha enviado un correo de confirmación a ${reservationData.email}`,
            5000
          );
        } else {
          setEmailError(emailResult.error || 'Error al enviar correo');
          showSuccess(
            '¡Reservación confirmada!',
            `Tu reservación ha sido creada exitosamente. ID: ${data.id}. Nota: No se pudo enviar el correo de confirmación.`,
            5000
          );
        }
      } catch (error: any) {
        setEmailError(error.message || 'Error al enviar correo');
        showSuccess(
          '¡Reservación confirmada!',
          `Tu reservación ha sido creada exitosamente. ID: ${data.id}. Nota: No se pudo enviar el correo de confirmación.`,
          5000
        );
      } finally {
        setIsSendingEmail(false);
      }

      // Continuar al cierre/next step
      onComplete();
    } catch (error: any) {
      const errorMessage = error.message || 'Error inesperado al crear la reservación';
      setReservationError(errorMessage);
      showError('Error inesperado', errorMessage);
      setIsCreatingReservation(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {reservationSuccess ? (
            <CheckCircle size={64} className="text-green-500" />
          ) : isCreatingReservation ? (
            <Loader2 size={64} className="text-primary animate-spin" />
          ) : (
            <CheckCircle size={64} className="text-primary" />
          )}
        </div>
        <h3 className="font-display text-2xl text-foreground mb-2">
          {reservationSuccess ? '¡Reservación confirmada!' : 
           isCreatingReservation ? 'Procesando tu reservación...' : 
           'Confirma tu reservación'}
        </h3>
        <p className="text-muted-foreground text-lg">
          {reservationSuccess ? 'Te esperamos con café y creatividad' :
           isCreatingReservation ? 'Por favor espera mientras procesamos tu solicitud' :
           'Revisa los detalles y confirma tu experiencia'}
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
                <p className="text-sm text-muted-foreground">Av Acueducto 902, Chapultepec Nte., 58260 Morelia, Mich.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {reservationError && (
        <Alert className="max-w-md mx-auto border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {reservationError}
          </AlertDescription>
        </Alert>
      )}


      {/* Important Notes */}
      <Card className="max-w-md mx-auto border-olive/30 bg-olive/10">
        <CardContent className="p-6">
          <h5 className="font-semibold mb-3 text-olive-dark">Información importante:</h5>
          <ul className="text-sm space-y-2 text-foreground">
            <li>• Tu reserva dura 1 hora 45 min para que disfrutes de esta experiencia.</li>
            <li>• Después de pintar, dejamos tu pieza con nosotros para esmaltarla y hornearla. El tiempo estimado para que esté completamente finalizada es de 1 a 3 semanas, dependiendo de la demanda.</li>
            <li>• Para poder entregarte tu pieza, deberás mostrar una fotografía visible de la misma en la sucursal. No enviamos avisos por mensaje o correo.</li>
            <li>• Guardaremos tu pieza por 30 días después del tiempo definido para recogerla.</li>
            <li>• Recuerda que los postres y bebidas NO están incluidos en el precio de la cerámica.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Confirm Button */}
      <div className="flex justify-center pt-4">
        <Button 
          onClick={handleConfirm}
          disabled={isCreatingReservation || isSendingEmail || reservationSuccess}
          className="btn-ceramica text-lg px-16 py-6 relative overflow-hidden"
        >
          {isCreatingReservation ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 animate-pulse" />
              <div className="relative z-10 flex items-center justify-center w-full">
                <div className="w-full bg-white/40 rounded-full h-2 mr-4 overflow-hidden">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-1000 ease-out shimmer-2-5s" 
                    style={{ 
                      width: '100%',
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.8) 100%)'
                    }} 
                  />
                </div>
                <span className="text-white font-medium">Confirmando...</span>
              </div>
            </>
          ) : isSendingEmail ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 animate-pulse" />
              <div className="relative z-10 flex items-center justify-center w-full">
                <div className="w-full bg-white/40 rounded-full h-2 mr-4 overflow-hidden">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-1000 ease-out shimmer-2-5s" 
                    style={{ 
                      width: '100%',
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.8) 100%)'
                    }} 
                  />
                </div>
                <span className="text-white font-medium">Enviando correo...</span>
              </div>
            </>
          ) : reservationSuccess ? (
            '¡Reservación confirmada!'
          ) : (
            'Confirmar mi experiencia'
          )}
        </Button>
      </div>

      {/* Email Status Messages */}
      {isSendingEmail && (
        <div className="flex justify-center pt-4">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Enviando correo de confirmación...</span>
          </div>
        </div>
      )}

      {emailSent && (
        <div className="flex justify-center pt-4">
          <div className="text-sm text-green-600 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Correo de confirmación enviado exitosamente</span>
          </div>
        </div>
      )}

      {emailError && (
        <div className="flex justify-center pt-4">
          <div className="text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Error al enviar correo: {emailError}</span>
          </div>
        </div>
      )}
    </div>
  );
};