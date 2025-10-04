import { useState, useEffect, useMemo } from 'react';
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
import { format, parseISO, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { DateUtils } from '@/lib/dateUtils';
import BlockDateForm from '@/components/admin/BlockDateForm';

const AdminSite = () => {
  const { user, logout } = useAuth();
  const { 
    blockedDates, 
    loading, 
    error, 
    removeBlock, 
    removeMultipleBlocks,
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

  const handleRemoveBlock = async (groupedBlock: any) => {
    // Crear mensaje de confirmación específico según el tipo de bloqueo
    const confirmMessage = groupedBlock.isFullDay 
      ? `¿Estás seguro de que quieres eliminar el bloqueo de día completo?\n\nFecha: ${formatDate(groupedBlock.reservation_date)}\nCupos totales: ${groupedBlock.totalGuests}\nHorarios bloqueados: ${groupedBlock.blockedTimeSlots?.length || 0} horarios\n\nEsto eliminará todos los bloqueos de este día.`
      : `¿Estás seguro de que quieres eliminar este bloqueo?\n\nFecha: ${formatDate(groupedBlock.reservation_date)}\nCupos: ${groupedBlock.totalGuests}\nHorario: ${groupedBlock.time_slots ? `${formatTime(groupedBlock.time_slots.start_time)} - ${formatTime(groupedBlock.time_slots.end_time)}` : 'N/A'}`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      // Usar la función optimizada para eliminar múltiples bloqueos
      const result = await removeMultipleBlocks(groupedBlock.blockIds);
      
      if (result.success) {
        const successMessage = groupedBlock.isFullDay
          ? `Día completo desbloqueado exitosamente (${groupedBlock.blockIds.length} bloque${groupedBlock.blockIds.length > 1 ? 's' : ''} individual${groupedBlock.blockIds.length > 1 ? 'es' : ''} eliminados)`
          : `Bloqueo eliminado exitosamente (${groupedBlock.blockIds.length} bloque${groupedBlock.blockIds.length > 1 ? 's' : ''} individual${groupedBlock.blockIds.length > 1 ? 'es' : ''})`;
        setSuccessMessage(successMessage);
      } else {
        setErrorMessage(result.error || 'Error al eliminar bloqueo');
      }
    } catch (error) {
      console.error('Error eliminando bloqueo:', error);
      setErrorMessage('Error inesperado al eliminar bloqueo');
    }
  };

  const handleBlockSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const handleBlockError = (error: string) => {
    setErrorMessage(error);
  };

  // Los bloqueos ya vienen filtrados del servicio (solo admin_block)
  const adminBlocks = blockedDates;

  // Agrupar bloqueos administrativos por fecha (días completos) o por fecha y time_slot (horarios específicos)
  const groupedBlocks = useMemo(() => {
    const groups = new Map();
    
    adminBlocks.forEach(block => {
      // Determinar clave de agrupación basada en si es día completo
      const key = block.isFullDay 
        ? `full-day-${block.reservation_date}` // Agrupar por fecha para días completos
        : `${block.reservation_date}-${block.time_slot_id}`; // Agrupar por fecha y time_slot para horarios específicos
      
      if (!groups.has(key)) {
        groups.set(key, {
          id: key,
          reservation_date: block.reservation_date,
          time_slot_id: block.isFullDay ? null : block.time_slot_id, // null para días completos
          time_slots: block.isFullDay ? null : block.time_slots, // null para días completos
          totalGuests: 0,
          blockReasons: [],
          created_at: block.created_at,
          blockIds: [],
          isFullDay: block.isFullDay,
          blockedTimeSlots: block.blockedTimeSlots,
          totalActiveSlots: block.totalActiveSlots,
          blockedByAdmin: block.blockedByAdmin
        });
      }
      
      const group = groups.get(key);
      group.totalGuests += block.guests;
      group.blockReasons.push(block.block_reason);
      group.blockIds.push(block.id);
      
      // Usar la fecha de creación más reciente
      if (new Date(block.created_at) > new Date(group.created_at)) {
        group.created_at = block.created_at;
      }
    });
    
    return Array.from(groups.values());
  }, [adminBlocks]);

  const formatDate = (dateString: string) => {
    try {
      // CORREGIDO: Usar parseISO + startOfDay para evitar problemas de zona horaria
      const date = startOfDay(parseISO(dateString));
      return format(date, 'EEEE, d MMMM yyyy', { locale: es });
    } catch (error) {
      console.error('❌ [AdminSite] Error formateando fecha:', error);
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

  // Función para extraer la razón limpia de bloqueos de día completo
  const getCleanReason = (blockReasons: string[]): string => {
    if (blockReasons.length === 0) return 'Sin especificar';
    
    // Tomar la primera razón y limpiarla
    const firstReason = blockReasons[0];
    
    // Remover el sufijo de numeración "(Día completo - Bloqueo X/Y)"
    const cleanReason = firstReason.replace(/\s*\(Día completo - Bloqueo \d+\/\d+\)\s*$/, '');
    
    return cleanReason;
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
              ) : groupedBlocks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay bloqueos activos</p>
                  <p className="text-sm">Los bloqueos aparecerán aquí una vez creados</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {groupedBlocks.map((group) => (
                    <div key={group.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {formatDate(group.reservation_date)}
                          </span>
                          {group.isFullDay && (
                            <Badge variant="destructive" className="text-xs">
                              DÍA COMPLETO
                            </Badge>
                          )}
                        </div>
                        
                        {group.isFullDay ? (
                          <div className="flex items-center space-x-2 mb-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Todo el día
                            </span>
                          </div>
                        ) : (
                          group.time_slots && (
                            <div className="flex items-center space-x-2 mb-1">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {formatTime(group.time_slots.start_time)} - {formatTime(group.time_slots.end_time)}
                              </span>
                            </div>
                          )
                        )}
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {group.isFullDay ? 'Todos los cupos' : `${group.totalGuests} cupos bloqueados`}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          <strong>Razón:</strong> {group.isFullDay ? getCleanReason(group.blockReasons) : group.blockReasons.join('; ')}
                        </div>
                        
                        <div className="text-xs text-gray-400 mt-1">
                          Creado: {format(new Date(group.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveBlock(group)}
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
