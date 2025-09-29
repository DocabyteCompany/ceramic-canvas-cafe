import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';

// Cargar variables de entorno
dotenv.config();

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor de correos funcionando',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Endpoint simple para probar
app.post('/api/send-email', async (req, res) => {
  try {
    console.log('📧 [Debug] Petición recibida:', req.body);
    
    const {
      customerName,
      customerEmail,
      customerPhone,
      reservationDate,
      timeSlotLabel,
      guests,
      reservationId
    } = req.body;

    // Validar datos requeridos
    if (!customerEmail || !customerName || !reservationId) {
      console.log('❌ [Debug] Datos faltantes:', { customerEmail, customerName, reservationId });
      res.status(400).json({ 
        success: false, 
        error: 'Faltan datos requeridos: email, nombre o ID de reservación' 
      });
      return;
    }

    // Enviar correo real con Resend
    console.log('📧 [Debug] Enviando correo real con Resend...');
    
    try {
      const { data: emailData, error } = await resend.emails.send({
        from: 'Cerámico Arte & Café <noreply@ceramico.com>',
        to: [customerEmail],
        subject: 'Reservación para Cerámico, Arte & Café',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f0e6;">
            <div style="background-color: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #8B5E3C; padding-bottom: 20px;">
                <h1 style="color: #8B5E3C; margin: 0; font-size: 28px;">Cerámico, Arte & Café</h1>
                <p style="color: #A6A48D; margin: 10px 0 0 0;">Tu reservación ha sido confirmada</p>
              </div>
              
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0;">
                <h2 style="color: #8B5E3C; text-align: center; margin-top: 0;">Detalles de tu Reservación</h2>
                
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                  <strong style="color: #8B5E3C;">Cliente:</strong>
                  <span>${customerName}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                  <strong style="color: #8B5E3C;">Email:</strong>
                  <span>${customerEmail}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                  <strong style="color: #8B5E3C;">Teléfono:</strong>
                  <span>${customerPhone}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                  <strong style="color: #8B5E3C;">Fecha:</strong>
                  <span>${reservationDate}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                  <strong style="color: #8B5E3C;">Horario:</strong>
                  <span>${timeSlotLabel}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                  <strong style="color: #8B5E3C;">Personas:</strong>
                  <span>${guests} ${guests === 1 ? 'persona' : 'personas'}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                  <strong style="color: #8B5E3C;">Duración:</strong>
                  <span>1 hora 45 minutos</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 12px 0;">
                  <strong style="color: #8B5E3C;">Ubicación:</strong>
                  <span>Calle 47 #463-A x 52 y 54, Centro</span>
                </div>
              </div>
              
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h3 style="color: #856404; margin-top: 0;">📋 Información Importante</h3>
                <ul style="color: #856404; margin: 10px 0; padding-left: 20px;">
                  <li>La sesión dura 1 hora 45 minutos</li>
                  <li>Las bebidas y postres se pagan por separado</li>
                  <li>Tu pieza estará lista para recoger en 2-3 días</li>
                  <li>Te notificaremos cuando esté lista</li>
                  <li>Llega 5 minutos antes de tu horario</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 25px 0;">
                <div style="background-color: #8B5E3C; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold;">
                  ID de Reservación: ${reservationId}
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d;">
                <p><strong>¡Te esperamos con café y creatividad!</strong></p>
                <p>Cerámico, Arte & Café</p>
                <p>📧 info@ceramico.com | 📞 (999) 123-4567</p>
              </div>
            </div>
          </div>
        `
      });

      if (error) {
        console.error('❌ [Debug] Error de Resend:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Error al enviar correo: ' + error.message 
        });
        return;
      }

      console.log('✅ [Debug] Correo enviado exitosamente:', emailData);
      res.status(200).json({ 
        success: true, 
        message: 'Correo enviado exitosamente',
        data: emailData
      });
      
    } catch (resendError) {
      console.error('❌ [Debug] Error inesperado con Resend:', resendError);
      res.status(500).json({ 
        success: false, 
        error: 'Error inesperado al enviar correo: ' + resendError.message 
      });
    }
  } catch (error) {
    console.error('❌ [Debug] Error en endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor: ' + error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 [Debug] Servidor de correos ejecutándose en puerto ${PORT}`);
  console.log(`📧 [Debug] Endpoint: http://localhost:${PORT}/api/send-email`);
  console.log(`🔑 [Debug] RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'Configurada' : 'No configurada'}`);
  console.log(`🌐 [Debug] Health check: http://localhost:${PORT}/health`);
});
