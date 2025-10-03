import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBlockedDates } from '@/hooks/useBlockedDates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  Trash2, 
  LogOut, 
  Plus, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

  // Estados para el formulario de bloqueo
  const [selectedDate, setSelectedDate] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockType, setBlockType] = useState<'full' | 'specific'>('full');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<number[]>([]);
  const [guestsPerSlot, setGuestsPerSlot] = useState<number>(20);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (!result.success) {
        alert('Error al cerrar sesión: ' + result.error);
      }
    } catch (error) {
      console.error('Error en logout:', error);
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
      alert('Error al eliminar bloqueo: ' + result.error);
    }
  };

  const handleBlockDate = async () => {
    if (!selectedDate || !blockReason.trim()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      let result;

      if (blockType === 'full') {
        // Bloquear día completo
        result = await blockFullDay(selectedDate, blockReason.trim(), user?.id || '');
      } else {
        // Bloquear horarios específicos
        if (selectedTimeSlots.length === 0) {
          alert('Selecciona al menos un horario para bloquear');
          return;
        }
        result = await blockSpecificTimeSlots(
          selectedDate, 
          selectedTimeSlots, 
          blockReason.trim(), 
          user?.id || '', 
          guestsPerSlot
        );
      }

      if (result.success) {
        setSuccessMessage(
          blockType === 'full' 
            ? 'Día completo bloqueado exitosamente' 
            : 'Horarios específicos bloqueados exitosamente'
        );
        setShowBlockModal(false);
        setSelectedDate('');
        setBlockReason('');
        setSelectedTimeSlots([]);
      } else {
        alert('Error al crear bloqueo: ' + result.error);
      }
    } catch (error: any) {
      alert('Error inesperado: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-amber-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Panel de Administración
                </h1>
                <p className="text-sm text-gray-600">
                  Cerámico, Arte & Café
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.email}
                </p>
                <Badge variant="secondary" className="text-xs">
                  Administrador
                </Badge>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario de Bloqueo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Bloquear Fechas
              </CardTitle>
              <CardDescription>
                Selecciona fechas para bloquearlas del calendario público
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Fecha */}
              <div>
                <Label htmlFor="date">Fecha a bloquear</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
              </div>

              {/* Razón del bloqueo */}
              <div>
                <Label htmlFor="reason">Razón del bloqueo</Label>
                <Input
                  id="reason"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Ej: Mantenimiento, Evento privado..."
                  className="mt-1"
                />
              </div>

              {/* Tipo de bloqueo */}
              <div>
                <Label>Tipo de bloqueo</Label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="blockType"
                      value="full"
                      checked={blockType === 'full'}
                      onChange={(e) => setBlockType(e.target.value as 'full')}
                      className="mr-2"
                    />
                    <span className="text-sm">Día completo (todos los horarios)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="blockType"
                      value="specific"
                      checked={blockType === 'specific'}
                      onChange={(e) => setBlockType(e.target.value as 'specific')}
                      className="mr-2"
                    />
                    <span className="text-sm">Horarios específicos</span>
                  </label>
                </div>
              </div>

              {/* Configuración para horarios específicos */}
              {blockType === 'specific' && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-md">
                  <Label>Cupos a bloquear por horario</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={guestsPerSlot}
                    onChange={(e) => setGuestsPerSlot(parseInt(e.target.value) || 20)}
                    className="w-24"
                  />
                  <p className="text-xs text-gray-600">
                    Nota: Los horarios específicos se seleccionarán en el siguiente paso
                  </p>
                </div>
              )}

              {/* Botón de bloqueo */}
              <Button 
                onClick={handleBlockDate}
                disabled={!selectedDate || !blockReason.trim() || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando bloqueo...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Bloqueo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Bloqueos Activos */}
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
      </main>
    </div>
  );
};

export default AdminSite;
