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

serve(async (req) => {
  try {
    // Extrae los datos del cuerpo de la solicitud (destinatario, asunto, etc.)
    const { to, subject, html } = await req.json();

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
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});