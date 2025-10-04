import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sendReservationConfirmation } from './src/server/emailService.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint para enviar correos
app.post('/api/send-email', async (req, res) => {
  try {
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
      res.status(400).json({ 
        success: false, 
        error: 'Faltan datos requeridos: email, nombre o ID de reservación' 
      });
      return;
    }

    // Preparar datos para el correo
    const emailData = {
      reservationId,
      customerName,
      customerEmail,
      customerPhone: customerPhone || 'No proporcionado',
      reservationDate: reservationDate || 'Fecha no especificada',
      timeSlotLabel: timeSlotLabel || 'Horario no especificado',
      guests: guests || 1
    };

    // Enviar correo
    const result = await sendReservationConfirmation(emailData);

    if (result.success) {
      res.status(200).json({ 
        success: true, 
        message: 'Correo enviado exitosamente',
        data: result.data 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error || 'Error al enviar correo' 
      });
    }
  } catch (error) {
    console.error('❌ [Servidor] Error en endpoint send-email:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor de correos funcionando' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de correos ejecutándose en puerto ${PORT}`);
  console.log(`📧 Endpoint: http://localhost:${PORT}/api/send-email`);
  console.log(`🔑 RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'Configurada' : 'No configurada'}`);
});






