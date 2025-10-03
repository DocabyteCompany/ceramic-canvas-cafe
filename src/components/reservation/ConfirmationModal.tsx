import { useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CheckCircle, Calendar, Clock, Users, MapPin, X, ExternalLink } from 'lucide-react';
import type { ReservationData } from '../ReservationWizard';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationData: ReservationData;
}

export const ConfirmationModal = ({ isOpen, onClose, reservationData }: ConfirmationModalProps) => {
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleAddToCalendar = () => {
    if (!reservationData.date || !reservationData.timeSlot) return;

    // Create calendar event details
    const startTime = new Date(reservationData.date);
    const [hours, minutes] = reservationData.time.split(':').map(Number);
    startTime.setHours(hours, minutes, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(hours + 1, minutes + 45, 0, 0); // Add 1h 45m

    const eventDetails = {
      title: 'Sesión de Cerámica - Cerámico Arte & Café',
      start: startTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      end: endTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      description: `Sesión de cerámica para ${reservationData.guests} ${reservationData.guests === 1 ? 'persona' : 'personas'}. Duración: 1h 45m. ID: ${reservationData.timeSlot ? reservationData.timeSlot.id : ''}`,
      location: 'Av Acueducto 902, Chapultepec Nte., 58260 Morelia, Mich.'
    };

    // Create Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.title)}&dates=${eventDetails.start}/${eventDetails.end}&details=${encodeURIComponent(eventDetails.description)}&location=${encodeURIComponent(eventDetails.location)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  const handleWhatsAppConfirmation = () => {
    const message = `¡Hola! He reservado mi lugar en Cerámico Arte & Café:

📅 ${reservationData.date ? format(reservationData.date, 'EEEE, d MMMM yyyy', { locale: es }) : ''}
⏰ ${reservationData.timeSlot?.label}
👥 ${reservationData.guests} ${reservationData.guests === 1 ? 'persona' : 'personas'}
👤 ${reservationData.name}

¡Nos vemos pronto! 🎨☕`;

    const whatsappUrl = `https://wa.me/529991234567?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-lg mx-auto p-0 gap-0 bg-background border-primary/20"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10"
          aria-label="Cerrar modal de confirmación"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Content */}
        <div className="p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-primary" />
            </div>
          </div>

          {/* Title */}
          <h2 id="confirmation-title" className="font-display text-2xl text-primary mb-2">
            ¡Reserva confirmada!
          </h2>
          <p className="text-muted-foreground mb-6">
            Tu lugar ha sido reservado. Te enviamos un correo con los detalles.
          </p>

          {/* Reservation Summary */}
          <div className="bg-primary/5 rounded-lg p-6 mb-6 text-left space-y-3">
            <div className="flex items-center gap-3">
              <Users size={16} className="text-primary" />
              <span className="font-medium">{reservationData.name}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-primary" />
              <span>
                {reservationData.date && format(reservationData.date, 'EEEE, d MMMM', { locale: es })}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-primary" />
              <span>{reservationData.timeSlot?.label}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Users size={16} className="text-primary" />
              <span>{reservationData.guests} {reservationData.guests === 1 ? 'lugar' : 'lugares'}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-primary" />
              <span>Cerámico, Arte & Café</span>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-olive/10 rounded-lg p-4 mb-6 text-sm text-left">
            <p className="font-medium text-olive-dark mb-1">Nota importante:</p>
            <p>La sesión dura 1:45h; bebidas y postres se pagan por separado.</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={onClose}
              className="w-full btn-ceramica"
            >
              Entendido, cerrar
            </Button>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleAddToCalendar}
                className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Calendar size={16} />
                <span>Añadir a calendario</span>
                <ExternalLink size={14} />
              </Button>
              
              <Button
                variant="outline"
                onClick={handleWhatsAppConfirmation}
                className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <span>WhatsApp</span>
                <ExternalLink size={14} />
              </Button>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-muted-foreground mt-6">
            Si no ves el correo, revisa tu carpeta de spam.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};