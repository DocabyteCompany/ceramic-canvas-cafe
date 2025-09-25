import { useState } from 'react';
import { format, addDays, isSameDay, isAfter, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { ReservationData } from '../ReservationWizard';

interface DateTimeSelectionProps {
  reservationData: ReservationData;
  onComplete: (data: Partial<ReservationData>) => void;
}

// Time slots for different days
const weekdayTimeSlots = [
  { value: '10:00', label: '10:00 AM - 11:45 AM', available: 16, maxCapacity: 20 },
  { value: '12:00', label: '12:00 PM - 1:45 PM', available: 12, maxCapacity: 20 },
  { value: '14:00', label: '2:00 PM - 3:45 PM', available: 8, maxCapacity: 20 },
  { value: '16:00', label: '4:00 PM - 5:45 PM', available: 6, maxCapacity: 20 },
  { value: '18:15', label: '6:15 PM - 8:00 PM', available: 4, maxCapacity: 20 },
];

const sundayTimeSlots = [
  { value: '10:00', label: '10:00 AM - 11:45 AM', available: 12, maxCapacity: 15 },
  { value: '11:45', label: '11:45 AM - 1:30 PM', available: 8, maxCapacity: 15 },
  { value: '13:30', label: '1:30 PM - 3:00 PM', available: 5, maxCapacity: 15 },
];

// Mock function to get availability for a specific date
const getAvailabilityForDate = (date: Date) => {
  const dayOfWeek = date.getDay();
  const randomFactor = Math.sin(date.getTime()) * 0.3 + 0.7; // Creates variation
  
  // Monday (1) and Saturday (6) are closed
  if (dayOfWeek === 1 || dayOfWeek === 6) {
    return [];
  }
  
  // Sunday (0) has special hours
  const slots = dayOfWeek === 0 ? sundayTimeSlots : weekdayTimeSlots;
  
  return slots.map(slot => ({
    ...slot,
    available: Math.max(0, Math.floor(slot.available * randomFactor)),
    isAvailable: slot.available > 0
  }));
};

export const DateTimeSelection = ({ reservationData, onComplete }: DateTimeSelectionProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(reservationData.date);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{value: string; label: string; available: number} | null>(reservationData.timeSlot);

  // Disable Mondays and Saturdays (business closed days)
  const isDateDisabled = (date: Date) => {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 1 || dayOfWeek === 6 || date < startOfDay(new Date());
  };

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

      {/* Date Selection with Calendar */}
      <div>
        <h4 className="flex items-center gap-2 font-medium text-lg mb-4">
          <CalendarIcon size={20} className="text-primary" />
          Fecha disponible
        </h4>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })
              ) : (
                <span>Selecciona una fecha</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={(date) => date && handleDateSelect(date)}
              disabled={isDateDisabled}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
              locale={es}
            />
          </PopoverContent>
        </Popover>
        
        {selectedDate && (
          <div className="mt-2 text-sm text-muted-foreground text-center">
            {selectedDate.getDay() === 0 && (
              <span className="text-primary font-medium">
                Domingo - Horarios especiales disponibles
              </span>
            )}
            {selectedDate.getDay() >= 2 && selectedDate.getDay() <= 5 && (
              <span>
                Horarios completos disponibles
              </span>
            )}
          </div>
        )}
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
                             {selectedDate?.getDay() === 0 && slot.value === '13:30' ? '1h 30m' : '1h 45m'}
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