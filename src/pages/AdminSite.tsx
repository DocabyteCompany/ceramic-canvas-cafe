import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBlockedDates } from '@/hooks/useBlockedDates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  Trash2, 
  LogOut, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import BlockDateForm from '@/components/admin/BlockDateForm';

const AdminSite = () => {
  const { user, logout } = useAuth();
  const { 
    blockedDates, 
    loading, 
    error, 
    removeBlock, 
    blockFullDay, 
    blockSpecificTimeSlots 
  } = useBlockedDates();

  // Estados para mensajes
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (!result.success) {
        setErrorMessage('Error al cerrar sesión: ' + result.error);
      }
    } catch (error) {
      console.error('Error en logout:', error);
      setErrorMessage('Error inesperado al cerrar sesión');
    }
  };

  const handleRemoveBlock = async (blockId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este bloqueo?')) {
      return;
    }

    const result = await removeBlock(blockId);
    if (result.success) {
      setSuccessMessage('Bloqueo eliminado exitosamente');
    } else {
      setErrorMessage('Error al eliminar bloqueo: ' + result.error);
    }
  };

  const handleBlockSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const handleBlockError = (error: string) => {
    setErrorMessage(error);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE, d MMMM yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/src/assets/imago_terracota.png" 
                alt="Cerámico Logo" 
                className="h-8 sm:h-10 w-auto"
              />
            </div>
            
            {/* Información del usuario - Responsive */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Información del usuario - Oculto en móvil muy pequeño */}
              <div className="hidden sm:block text-right">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-32 lg:max-w-none">
                  {user?.email}
                </p>
                <Badge variant="secondary" className="text-xs">
                  Administrador
                </Badge>
              </div>
              
              {/* Solo badge en móvil muy pequeño */}
              <div className="block sm:hidden">
                <Badge variant="secondary" className="text-xs">
                  Admin
                </Badge>
              </div>
              
              {/* Botón de logout - Responsive */}
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Título del Panel */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-amber-600" />
            <h1 className="text-2xl font-semibold text-gray-900">
              Panel de Administración
            </h1>
          </div>
        </div>

        {/* Mensajes de éxito */}
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Mensajes de error */}
        {(error || errorMessage) && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Formulario de Bloqueo */}
          <div className="xl:col-span-1">
            <BlockDateForm
              onSuccess={handleBlockSuccess}
              onError={handleBlockError}
              adminUserId={user?.id || ''}
            />
          </div>

          {/* Lista de Bloqueos Activos */}
          <div className="xl:col-span-1">
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Bloqueos Activos
              </CardTitle>
              <CardDescription>
                Fechas y horarios actualmente bloqueados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Cargando bloqueos...</span>
                </div>
              ) : blockedDates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay bloqueos activos</p>
                  <p className="text-sm">Los bloqueos aparecerán aquí una vez creados</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {blockedDates.map((block) => (
                    <div key={block.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {formatDate(block.reservation_date)}
                          </span>
                        </div>
                        
                        {block.time_slots && (
                          <div className="flex items-center space-x-2 mb-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {formatTime(block.time_slots.start_time)} - {formatTime(block.time_slots.end_time)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {block.guests} cupos bloqueados
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          <strong>Razón:</strong> {block.block_reason}
                        </div>
                        
                        <div className="text-xs text-gray-400 mt-1">
                          Creado: {format(new Date(block.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveBlock(block.id)}
                        className="ml-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSite;
