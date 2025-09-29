import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProgressBar } from './reservation/ProgressBar';
import { DateTimeSelection } from './reservation/DateTimeSelection';
import { PersonalInfoForm } from './reservation/PersonalInfoForm';
import { ConfirmationScreen } from './reservation/ConfirmationScreen';
import { ConfirmationModal } from './reservation/ConfirmationModal';
import { useTimeSlots } from '@/hooks/useTimeSlots';

export interface ReservationData {
  date: Date | null;
  time: string;
  timeSlot: {
    value: string;
    label: string;
    available: number;
    id: number;
  } | null;
  name: string;
  email: string;
  phone: string;
  guests: number;
}

const ReservationWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservationData, setReservationData] = useState<ReservationData>({
    date: null,
    time: '',
    timeSlot: null,
    name: '',
    email: '',
    phone: '',
    guests: 1
  });

  const { loading: timeSlotsLoading, error: timeSlotsError } = useTimeSlots();

  const updateReservationData = (data: Partial<ReservationData>) => {
    setReservationData(prev => ({ ...prev, ...data }));
  };

  const handleStepComplete = (step: number, data?: Partial<ReservationData>) => {
    try {
      setError(null);
      
      if (data) {
        updateReservationData(data);
      }
      
      if (step < 3) {
        setCurrentStep(step + 1);
      } else {
        // Step 3 completed - show modal
        setShowConfirmationModal(true);
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar el paso');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleModalClose = () => {
    setShowConfirmationModal(false);
    setError(null);
    setIsLoading(false);
    // Reset wizard to step 1 for new reservation
    setCurrentStep(1);
    setReservationData({
      date: null,
      time: '',
      timeSlot: null,
      name: '',
      email: '',
      phone: '',
      guests: 1
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <DateTimeSelection
            reservationData={reservationData}
            onComplete={(data) => handleStepComplete(1, data)}
          />
        );
      case 2:
        return (
          <PersonalInfoForm
            reservationData={reservationData}
            onComplete={(data) => handleStepComplete(2, data)}
            onBack={handleBack}
            maxGuests={reservationData.timeSlot?.available || 20}
          />
        );
      case 3:
        return (
          <ConfirmationScreen
            reservationData={reservationData}
            onComplete={() => handleStepComplete(3)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Section Title & Subtitle - outside card for visual homogeneity */}
      <div className="text-center mb-12">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
          Aparta tu lugar
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Deja que la creatividad fluya en una experiencia única
        </p>
      </div>

      <Card className="max-w-4xl mx-auto shadow-warm">
        <CardHeader className="text-center pb-8">
          <div className="mt-8">
            <ProgressBar currentStep={currentStep} totalSteps={3} />
          </div>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          {/* Error de time slots */}
          {timeSlotsError && (
            <Alert className="mb-8 border-red-200 bg-red-50">
              <AlertDescription className="text-center">
                <strong>Error de conexión:</strong> {timeSlotsError}
              </AlertDescription>
            </Alert>
          )}

          {/* Error general */}
          {error && (
            <Alert className="mb-8 border-red-200 bg-red-50">
              <AlertDescription className="text-center">
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading state */}
          {timeSlotsLoading && (
            <Alert className="mb-8 border-blue-200 bg-blue-50">
              <AlertDescription className="text-center">
                <strong>Cargando horarios disponibles...</strong> Por favor espera mientras cargamos la información.
              </AlertDescription>
            </Alert>
          )}

          {/* Success state - solo mostrar si no hay errores y no está cargando */}
          {!timeSlotsError && !error && !timeSlotsLoading && (
            <Alert className="mb-8 border-green-200 bg-green-50">
              <AlertDescription className="text-center">
                <strong>Sistema de reservación activo.</strong> Ahora puedes hacer reservaciones en tiempo real con disponibilidad actualizada.
              </AlertDescription>
            </Alert>
          )}

          <div className="animate-fade-in">
            {renderStep()}
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleModalClose}
        reservationData={reservationData}
      />
    </>
  );
};

export default ReservationWizard;