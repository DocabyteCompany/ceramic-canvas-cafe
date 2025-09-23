import { useState } from 'react';
import { format, addDays, isSameDay, isAfter, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ReservationData } from '../ReservationWizard';

interface DateTimeSelectionProps {
  reservationData: ReservationData;
  onComplete: (data: Partial<ReservationData>) => void;
}

// Mock data for available time slots
const timeSlots = [
  { value: '10:00', label: '10:00 AM - 11:45 AM', available: 16, maxCapacity: 20 },
  { value: '12:00', label: '12:00 PM - 1:45 PM', available: 12, maxCapacity: 20 },
  { value: '14:15', label: '2:15 PM - 4:00 PM', available: 8, maxCapacity: 20 },
  { value: '16:30', label: '4:30 PM - 6:15 PM', available: 6, maxCapacity: 20 },
];

// Mock function to get availability for a specific date
const getAvailabilityForDate = (date: Date) => {
  // Simulate different availability patterns
  const dayOfWeek = date.getDay();
  const randomFactor = Math.sin(date.getTime()) * 0.3 + 0.7; // Creates variation
  
  return timeSlots.map(slot => ({
    ...slot,
    available: Math.max(0, Math.floor(slot.available * randomFactor)),
    // Sundays closed
    isAvailable: dayOfWeek !== 0 && slot.available > 0
  }));
};

export const DateTimeSelection = ({ reservationData, onComplete }: DateTimeSelectionProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(reservationData.date);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{value: string; label: string; available: number} | null>(reservationData.timeSlot);

  // Generate next 7 days (excluding Sundays)
  const availableDates = Array.from({ length: 10 }, (_, i) => addDays(new Date(), i))
    .filter(date => date.getDay() !== 0) // Exclude Sundays
    .slice(0, 6); // Take 6 weekdays

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Reset time selection when date changes
  };

  const handleTimeSlotSelect = (slot: any) => {
    // Convert the slot back to the expected format
    const timeSlot = {
      value: slot.value,
      label: slot.label,
      available: slot.available
    };
    setSelectedTimeSlot(timeSlot);
  };

  const handleContinue = () => {
    if (selectedDate && selectedTimeSlot) {
      onComplete({
        date: selectedDate,
        time: selectedTimeSlot.value,
        timeSlot: selectedTimeSlot
      });
    }
  };

  const selectedDateAvailability = selectedDate ? getAvailabilityForDate(selectedDate) : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="font-display text-2xl text-foreground mb-2">
          Selecciona el día y la hora de tu sesión
        </h3>
        <p className="text-muted-foreground">
          Elige el momento perfecto para tu experiencia creativa
        </p>
      </div>

      {/* Date Selection */}
      <div>
        <h4 className="flex items-center gap-2 font-medium text-lg mb-4">
          <CalendarIcon size={20} className="text-primary" />
          Fecha disponible
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableDates.map((date, index) => {
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            
            return (
              <Button
                key={index}
                variant="outline"
                className={`p-4 h-auto flex flex-col items-center gap-2 transition-all duration-150 ${
                  isSelected 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleDateSelect(date)}
              >
                <span className="text-sm font-medium">
                  {format(date, 'EEEE', { locale: es })}
                </span>
                <span className="text-lg font-semibold">
                  {format(date, 'd')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(date, 'MMM', { locale: es })}
                  {isToday && ' (hoy)'}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="animate-fade-in">
          <h4 className="flex items-center gap-2 font-medium text-lg mb-4">
            <Clock size={20} className="text-primary" />
            Horario disponible para {format(selectedDate, 'EEEE, d MMMM', { locale: es })}
          </h4>
          
          <div className="grid gap-4">
            {selectedDateAvailability.map((slot, index) => {
              const isSelected = selectedTimeSlot?.value === slot.value;
              const occupancyPercentage = ((slot.maxCapacity - slot.available) / slot.maxCapacity) * 100;
              
              return (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-150 hover:shadow-md ${
                    isSelected ? 'border-primary bg-primary/5' : ''
                  } ${!slot.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => slot.isAvailable && handleTimeSlotSelect(slot)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h5 className="font-semibold text-lg">{slot.label}</h5>
                          <span className="text-sm text-muted-foreground">
                            1h 45m
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Users size={16} className="text-primary" />
                            <span className="font-medium">{slot.available}</span>
                            <span className="text-muted-foreground">lugares disponibles</span>
                          </div>
                          
                          <div className="flex-1 max-w-32">
                            <Progress 
                              value={occupancyPercentage} 
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        disabled={!slot.isAvailable}
                        className={isSelected ? "bg-primary" : ""}
                      >
                        {!slot.isAvailable ? 'Lleno' : isSelected ? 'Seleccionado' : 'Reservar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Continue Button */}
      {selectedDate && selectedTimeSlot && (
        <div className="flex justify-center pt-4 animate-fade-in">
          <Button 
            onClick={handleContinue}
            className="btn-ceramica text-lg px-12"
          >
            Continuar al siguiente paso
          </Button>
        </div>
      )}
    </div>
  );
};