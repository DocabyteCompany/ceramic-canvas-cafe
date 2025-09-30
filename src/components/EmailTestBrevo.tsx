import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendReservationConfirmation } from '@/services/brevoEmailService';
import { CheckCircle, AlertCircle, Mail, Loader2 } from 'lucide-react';

export const EmailTestBrevo = () => {
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestEmail = async () => {
    if (!testEmail) {
      setResult({ success: false, message: 'Por favor ingresa un email válido' });
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      const testData = {
        reservationId: 'TEST-' + Date.now(),
        customerName: 'Usuario de Prueba',
        customerEmail: testEmail,
        customerPhone: '+52 999 123 4567',
        reservationDate: new Date().toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        timeSlotLabel: '10:00 AM - 11:45 AM',
        guests: 2
      };

      const emailResult = await sendReservationConfirmation(testData);
      
      if (emailResult.success) {
        setResult({ success: true, message: 'Correo de prueba enviado exitosamente' });
      } else {
        setResult({ success: false, message: emailResult.error || 'Error al enviar correo' });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Error inesperado' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Prueba de Correo con Brevo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="test-email">Email de prueba</Label>
          <Input
            id="test-email"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="tu@email.com"
            className="mt-1"
          />
        </div>

        <Button
          onClick={handleTestEmail}
          disabled={isSending || !testEmail}
          className="w-full"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar Correo de Prueba'
          )}
        </Button>

        {result && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            result.success 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {result.success ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{result.message}</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p><strong>Nota:</strong> Asegúrate de que la Edge Function esté desplegada y las variables de entorno configuradas en Supabase.</p>
        </div>
      </CardContent>
    </Card>
  );
};
