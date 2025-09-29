import type { ReservationData } from '../components/ReservationWizard';

export interface EmailReservationData {
  reservationId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  reservationDate: string;
  reservationTime: string;
  guests: number;
  timeSlotLabel: string;
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
          background-color: #8B5E3C;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          display: inline-block;
          margin: 10px 0;
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
            <span class="detail-value">Calle 47 #463-A x 52 y 54, Centro</span>
          </div>
        </div>

        <div class="important-info">
          <h3>📋 Información Importante</h3>
          <ul>
            <li>La sesión dura 1 hora 45 minutos</li>
            <li>Las bebidas y postres se pagan por separado</li>
            <li>Tu pieza estará lista para recoger en 2-3 días</li>
            <li>Te notificaremos cuando esté lista</li>
            <li>Llega 5 minutos antes de tu horario</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <div class="reservation-id">ID de Reservación: ${data.reservationId}</div>
        </div>

        <div class="footer">
          <p><strong>¡Te esperamos con café y creatividad!</strong></p>
          <p>Cerámico, Arte & Café</p>
          <p>📧 info@ceramico.com | 📞 (999) 123-4567</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Función principal para enviar correo de confirmación usando servidor local
export const sendReservationConfirmation = async (data: EmailReservationData): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('📧 [Cliente] Enviando correo de confirmación a:', data.customerEmail);
    
    // Usar el servidor Express directamente
    const response = await fetch('http://localhost:3002/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        reservationDate: data.reservationDate,
        timeSlotLabel: data.timeSlotLabel,
        guests: data.guests,
        reservationId: data.reservationId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [Cliente] Error al enviar correo:', errorData);
      return { 
        success: false, 
        error: errorData.error || `Error HTTP ${response.status}: ${response.statusText}` 
      };
    }

    const result = await response.json();
    console.log('✅ [Cliente] Correo enviado exitosamente:', result);
    return { success: true };
  } catch (error: any) {
    console.error('❌ [Cliente] Error inesperado al enviar correo:', error);
    return { success: false, error: error.message || 'Error inesperado al enviar correo' };
  }
};

// Función helper para convertir ReservationData a EmailReservationData
export const convertToEmailData = (reservationData: ReservationData, reservationId: string): EmailReservationData => {
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
    reservationTime: reservationData.timeSlot?.label || '',
    guests: reservationData.guests,
    timeSlotLabel: reservationData.timeSlot?.label || ''
  };
};
