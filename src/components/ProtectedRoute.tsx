import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2, AlertCircle, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isAdmin, loading, verifyingAdmin } = useAuth();

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    console.log('🔒 [ProtectedRoute] No hay usuario autenticado, redirigiendo al login');
    return <Navigate to="/adminsite/login" replace />;
  }

  // Si hay usuario pero aún se está verificando si es admin, mostrar loading
  if (user && verifyingAdmin) {
    console.log('⏳ [ProtectedRoute] Verificando permisos de admin para:', user.email);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  // Si hay usuario pero no es admin (después de verificar), mostrar error
  if (user && !isAdmin && !verifyingAdmin) {
    console.log('🚫 [ProtectedRoute] Usuario no es administrador:', user.email);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="text-center mb-6">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Acceso Denegado
            </h1>
            <p className="text-gray-600">
              No tienes permisos de administrador para acceder a esta sección
            </p>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Usuario:</strong> {user.email}<br />
              <strong>Estado:</strong> No autorizado como administrador
            </AlertDescription>
          </Alert>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Volver al sitio principal
            </a>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Si crees que esto es un error, contacta al administrador del sistema
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si todo está bien, mostrar el contenido protegido
  console.log('✅ [ProtectedRoute] Acceso autorizado para admin:', user.email);
  return <>{children}</>;
};

export default ProtectedRoute;
