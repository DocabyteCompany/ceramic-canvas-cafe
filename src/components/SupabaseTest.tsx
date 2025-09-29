import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Verificar conexión al cargar el componente
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('checking');
      setError('');
      
      // Verificar que las variables de entorno estén disponibles
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Variables de entorno de Supabase no encontradas');
      }

      // Probar conexión con una consulta simple
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .limit(1);

      if (error) {
        throw error;
      }

      setConnectionStatus('success');
    } catch (err: any) {
      setConnectionStatus('error');
      setError(err.message);
    }
  };

  const testTimeSlotsQuery = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .order('day_of_week')
        .order('start_time');

      if (error) {
        throw error;
      }

      setTimeSlots(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'Verificando conexión...';
      case 'success':
        return 'Conexión exitosa a Supabase';
      case 'error':
        return 'Error de conexión';
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Prueba de Conexión Supabase
        </CardTitle>
        <CardDescription>
          Verificación de la configuración y conexión a la base de datos
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estado de conexión */}
        <Alert className={connectionStatus === 'success' ? 'border-green-200 bg-green-50' : 
                          connectionStatus === 'error' ? 'border-red-200 bg-red-50' : 
                          'border-yellow-200 bg-yellow-50'}>
          <AlertDescription>
            <strong>{getStatusText()}</strong>
            {error && (
              <div className="mt-2 text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}
          </AlertDescription>
        </Alert>

        {/* Variables de entorno */}
        <div className="space-y-2">
          <h4 className="font-medium">Variables de Entorno:</h4>
          <div className="text-sm space-y-1">
            <div>
              <strong>VITE_SUPABASE_URL:</strong> 
              <span className={import.meta.env.VITE_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}>
                {import.meta.env.VITE_SUPABASE_URL ? '✓ Configurada' : '✗ No encontrada'}
              </span>
            </div>
            <div>
              <strong>VITE_SUPABASE_ANON_KEY:</strong> 
              <span className={import.meta.env.VITE_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}>
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Configurada' : '✗ No encontrada'}
              </span>
            </div>
          </div>
        </div>

        {/* Botón para probar consulta de time slots */}
        <div className="space-y-2">
          <Button 
            onClick={testTimeSlotsQuery} 
            disabled={connectionStatus !== 'success' || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Consultando time slots...
              </>
            ) : (
              'Probar consulta de Time Slots'
            )}
          </Button>
        </div>

        {/* Resultados de la consulta */}
        {timeSlots.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Time Slots encontrados ({timeSlots.length}):</h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {timeSlots.map((slot, index) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                  <div><strong>Día:</strong> {slot.day_of_week === 0 ? 'Domingo' : 
                    slot.day_of_week === 2 ? 'Martes' :
                    slot.day_of_week === 3 ? 'Miércoles' :
                    slot.day_of_week === 4 ? 'Jueves' :
                    slot.day_of_week === 5 ? 'Viernes' : 'Desconocido'}</div>
                  <div><strong>Horario:</strong> {slot.start_time} - {slot.end_time}</div>
                  <div><strong>Capacidad:</strong> {slot.max_capacity}</div>
                  <div><strong>Activo:</strong> {slot.is_active ? 'Sí' : 'No'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón para reintentar conexión */}
        {connectionStatus === 'error' && (
          <Button onClick={testConnection} variant="outline" className="w-full">
            Reintentar Conexión
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SupabaseTest;

