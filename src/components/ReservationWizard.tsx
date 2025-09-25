import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProgressBar } from './reservation/ProgressBar';
import { DateTimeSelection } from './reservation/DateTimeSelection';
import { PersonalInfoForm } from './reservation/PersonalInfoForm';
import { ConfirmationScreen } from './reservation/ConfirmationScreen';
import { ConfirmationModal } from './reservation/ConfirmationModal';

export interface ReservationData {
  date: Date | null;
  time: string;
  timeSlot: {
    value: string;
    label: string;
    available: number;
  } | null;
  name: string;
  email: string;
  phone: string;
  guests: number;
}

const ReservationWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [reservationData, setReservationData] = useState<ReservationData>({
    date: null,
    time: '',
    timeSlot: null,
    name: '',
    email: '',
    phone: '',
    guests: 1
  });

  const updateReservationData = (data: Partial<ReservationData>) => {
    setReservationData(prev => ({ ...prev, ...data }));
  };

  const handleStepComplete = (step: number, data?: Partial<ReservationData>) => {
    if (data) {
      updateReservationData(data);
    }
    
    if (step < 3) {
      setCurrentStep(step + 1);
    } else {
      // Step 3 completed - show modal
      setShowConfirmationModal(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleModalClose = () => {
    setShowConfirmationModal(false);
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
          <Alert className="mb-8 border-olive bg-olive/5">
            <AlertDescription className="text-center">
              <strong>Vista previa del sistema de reservación.</strong> Este formulario necesita conectarse a Supabase para funcionar completamente con disponibilidad en tiempo real.
            </AlertDescription>
          </Alert>

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