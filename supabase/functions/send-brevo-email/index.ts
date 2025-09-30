import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createTransport } from "npm:nodemailer@6.9.7";

// Configuración del transportador de Nodemailer con Brevo
const transporter = createTransport({
  host: 'smtp-relay.brevo.com', // Servidor SMTP de Brevo
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: Deno.env.get("BREVO_USER"), // Tu email de login de Brevo
    pass: Deno.env.get("BREVO_SMTP_KEY"), // Tu contraseña SMTP de Brevo
  },
});

// Headers CORS para permitir peticiones desde el frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Manejar preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  try {
    // Solo permitir POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extrae los datos del cuerpo de la solicitud (destinatario, asunto, etc.)
    const { to, subject, html } = await req.json();

    // Validar datos requeridos
    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, html' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const mailOptions = {
      // Usamos tu correo verificado como el remitente "from"
      from: `"Cerámico Café" <ceramico.cafe@gmail.com>`,
      to: to,
      subject: subject,
      html: html,
    };

    // Envía el correo usando Brevo
    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: "Email sent successfully via Brevo" }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});