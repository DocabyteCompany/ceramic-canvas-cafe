import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, Mail } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado como admin
  useEffect(() => {
    if (user && isAdmin) {
      console.log('🔄 [AdminLogin] Usuario ya autenticado, redirigiendo...');
      navigate('/adminsite', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setError('');
    setIsSubmitting(true);
    setLoading(true);

    try {
      // Validaciones básicas
      if (!email.trim()) {
        setError('El email es requerido');
        return;
      }
      
      if (!password.trim()) {
        setError('La contraseña es requerida');
        return;
      }

      if (!email.includes('@')) {
        setError('El email no es válido');
        return;
      }

      console.log('🔐 [AdminLogin] Intentando login para:', email);
      
      const result = await login(email.trim(), password);
      
      if (result.success) {
        console.log('✅ [AdminLogin] Login exitoso, redirigiendo...');
        navigate('/adminsite', { replace: true });
      } else {
        console.error('❌ [AdminLogin] Error en login:', result.error);
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err: any) {
      console.error('❌ [AdminLogin] Error inesperado:', err);
      setError(err.message || 'Error inesperado al iniciar sesión');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(''); // Limpiar error al escribir
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(''); // Limpiar error al escribir
  };

  // Renderizado condicional sin return temprano
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {authLoading ? (
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      ) : (
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Acceso Administrativo
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Ingresa tus credenciales para acceder al panel de administración
            </p>
          </div>

          {/* Formulario */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-xl">Iniciar Sesión</CardTitle>
              <CardDescription className="text-center">
                Solo personal autorizado puede acceder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Campo Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      required
                      disabled={loading}
                      placeholder="admin@ejemplo.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {/* Campo Contraseña */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={handlePasswordChange}
                      required
                      disabled={loading}
                      placeholder="••••••••"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Mensaje de Error */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Botón de Envío */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || isSubmitting}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Cerámico, Arte & Café - Panel de Administración
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Si tienes problemas para acceder, contacta al administrador del sistema
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;