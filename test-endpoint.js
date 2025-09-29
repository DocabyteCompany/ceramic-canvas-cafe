// Script para probar el endpoint directamente
import fetch from 'node-fetch';

const testEmail = async () => {
  try {
    console.log('🧪 Probando endpoint directamente...');
    
    const response = await fetch('http://localhost:3001/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: 'Usuario de Prueba',
        customerEmail: 'test@example.com',
        customerPhone: '+52 999 123 4567',
        reservationDate: 'Martes, 1 de octubre de 2024',
        timeSlotLabel: '10:00 AM - 11:45 AM',
        guests: 2,
        reservationId: 'TEST-12345'
      }),
    });

    const result = await response.json();
    console.log('📧 Respuesta del servidor:', result);
    
    if (response.ok) {
      console.log('✅ Endpoint funcionando correctamente');
    } else {
      console.log('❌ Error en el endpoint:', result);
    }
  } catch (error) {
    console.error('❌ Error al probar endpoint:', error.message);
  }
};

testEmail();

