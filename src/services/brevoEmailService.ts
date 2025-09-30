import { supabase } from '@/lib/supabase';

export interface EmailReservationData {
  reservationId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  reservationDate: string;
  timeSlotLabel: string;
  guests: number;
}

// Template HTML para el correo de confirmación
const createEmailTemplate = (data: EmailReservationData): string => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Reservación - Cerámico, Arte & Café</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f0e6;
        }
        .container {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #8B5E3C;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #8B5E3C;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #A6A48D;
          font-size: 16px;
        }
        .reservation-details {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 25px;
          margin: 25px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          color: #8B5E3C;
          min-width: 120px;
        }
        .detail-value {
          color: #333;
          text-align: right;
        }
        .important-info {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
        }
        .important-info h3 {
          color: #856404;
          margin-top: 0;
          font-size: 18px;
        }
        .important-info ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .important-info li {
          margin: 8px 0;
          color: #856404;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          color: #6c757d;
        }
                .reservation-id {
                  background-color: hsl(38, 30%, 85%);
                  color: #45403b;
                  padding: 8px 16px;
                  border-radius: 20px;
                  font-size: 14px;
                  font-weight: bold;
                  display: inline-block;
                  margin: 10px 0;
                }
                .cta-button {
                  display: inline-block;
                  background-color: white;
                  color: hsl(38, 30%, 85%);
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: bold;
                  margin: 20px 0;
                  border: 2px solid hsl(38, 30%, 85%);
                }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Cerámico, Arte & Café</div>
          <div class="subtitle">Tu reservación ha sido confirmada</div>
        </div>

        <div class="reservation-details">
          <h2 style="color: #8B5E3C; margin-top: 0; text-align: center;">Detalles de tu Reservación</h2>
          
          <div class="detail-row">
            <span class="detail-label">Cliente:</span>
            <span class="detail-value">${data.customerName}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${data.customerEmail}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Teléfono:</span>
            <span class="detail-value">${data.customerPhone}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Fecha:</span>
            <span class="detail-value">${data.reservationDate}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Horario:</span>
            <span class="detail-value">${data.timeSlotLabel}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Personas:</span>
            <span class="detail-value">${data.guests} ${data.guests === 1 ? 'persona' : 'personas'}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Duración:</span>
            <span class="detail-value">1 hora 45 minutos</span>
          </div>
          
                  <div class="detail-row">
                    <span class="detail-label">Ubicación:</span>
                    <span class="detail-value">Av Acueducto 902, Chapultepec Nte., 58260 Morelia, Mich.</span>
                  </div>
        </div>

        <div class="important-info">
          <h3>📋 Información Importante</h3>
          <ul>
            <li>Tu reserva dura <strong>1 hora 45 min</strong> para que disfrutes de esta experiencia.</li>
            <li>Después de pintar, <strong>dejamos tu pieza con nosotros</strong> para esmaltarla y hornearla. El tiempo estimado para que esté completamente finalizada es de <strong>1 a 3 semanas</strong>, dependiendo de la demanda.</li>
            <li>Para poder entregarte tu pieza, deberás <strong>mostrar una fotografía visible</strong> de la misma en la sucursal. <em>No enviamos avisos por mensaje o correo</em>.</li>
            <li>Guardaremos tu pieza por <strong>30 días</strong> después del tiempo definido para recogerla.</li>
            <li>Recuerda que <strong>los postres y bebidas NO están incluidos</strong> en el precio de la cerámica.</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <div class="reservation-id">ID de Reservación: ${data.reservationId}</div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://wa.me/529991234567" class="cta-button">
            💬 Contactar por WhatsApp
          </a>
        </div>

        <div class="footer">
          <p><strong>¡Te esperamos con café y creatividad!</strong></p>
          <p>Cerámico, Arte & Café</p>
          <p>📧 info@ceramico.com | 📞 (999) 123-4567</p>
          <p style="font-size: 12px; margin-top: 15px;">
            Si tienes alguna pregunta, no dudes en contactarnos.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Función principal para enviar correo de confirmación usando Supabase Edge Function
export const sendReservationConfirmation = async (data: EmailReservationData): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('📧 [Cliente] Enviando correo de confirmación a:', data.customerEmail);
    
    // Obtener la URL de la Edge Function desde las variables de entorno
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL no está configurada');
    }

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-brevo-email`;
    
    // Crear el template HTML
    const htmlContent = createEmailTemplate(data);
    
    // Preparar los datos para la Edge Function
    const emailPayload = {
      to: data.customerEmail,
      subject: `Reservación confirmada - Cerámico Arte & Café (${data.reservationId})`,
      html: htmlContent
    };

    // Llamar a la Edge Function usando Supabase
    const { data: result, error } = await supabase.functions.invoke('send-brevo-email', {
      body: emailPayload
    });

    if (error) {
      console.error('❌ [Cliente] Error al llamar Edge Function:', error);
      return { 
        success: false, 
        error: error.message || 'Error al enviar correo' 
      };
    }

    console.log('✅ [Cliente] Correo enviado exitosamente:', result);
    return { success: true };
  } catch (error: any) {
    console.error('❌ [Cliente] Error inesperado al enviar correo:', error);
    return { 
      success: false, 
      error: error.message || 'Error inesperado al enviar correo' 
    };
  }
};

// Función helper para convertir ReservationData a EmailReservationData
export const convertToEmailData = (reservationData: any, reservationId: string): EmailReservationData => {
  return {
    reservationId,
    customerName: reservationData.name,
    customerEmail: reservationData.email,
    customerPhone: reservationData.phone,
    reservationDate: reservationData.date ? reservationData.date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '',
    timeSlotLabel: reservationData.timeSlot?.label || '',
    guests: reservationData.guests
  };
};
