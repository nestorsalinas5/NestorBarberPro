import { useState, useCallback, useMemo } from 'react';
import type { Service, TimeSlot, Booking, ScheduleConfig } from '../types';

// Helper function to convert "HH:mm" time string to minutes from midnight for easier calculation.
const timeToMinutes = (time: string): number => {
  if (!time || !time.includes(':')) return -1; 
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};


export const useBookingLogic = (
  bookings: Booking[],
  schedule: ScheduleConfig,
  onBookingConfirmed: (booking: Omit<Booking, 'id' | 'status' | 'created_at'>) => Promise<boolean>
) => {
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const totalDurationOfSelectedServices = useMemo(() => {
    return selectedServices.reduce((total, s) => total + s.duration, 0);
  }, [selectedServices]);


  const generateTimeSlots = useCallback((date: Date): TimeSlot[] => {
    if (!date || totalDurationOfSelectedServices === 0 || !schedule) return [];

    const day = date.getDay();
    const dateString = date.toISOString().split('T')[0];

    // Weekend logic (Friday/Saturday) is slot-based
    if (day === 5 || day === 6) {
      const todaysBookedCount = bookings.filter(b => b.date === dateString && b.status !== 'Cancelada').length;
      
      const slots: TimeSlot[] = [];
      const totalSlots = schedule.weekendConfig?.slotsCount || 0;
      
      if (todaysBookedCount < totalSlots) {
         slots.push({
           time: `Cupo disponible`,
           isAvailable: true,
         });
      } else {
         slots.push({
           time: 'Cupos agotados',
           isAvailable: false
         })
      }
      // For simplicity, we just show one button for weekends now.
      // Logic could be expanded to show N available slots.
      // In this version, we handle booking one by one. The logic will prevent overbooking.
      // A more accurate slot representation for weekends:
      const availableSlots = totalSlots - todaysBookedCount;
      if (availableSlots > 0) {
        return [{ time: `Reservar uno de los ${availableSlots} cupos`, isAvailable: true }];
      }
      return [{ time: "Todos los cupos ocupados", isAvailable: false }];
    }

    // Weekday logic: duration-aware conflict detection
    const bookedRanges = bookings
      .filter(b => b.date === dateString && b.status !== 'Cancelada' && b.time.includes(':'))
      .map(b => {
        const startTime = timeToMinutes(b.time);
        const bookingDuration = Array.isArray(b.service)
          ? b.service.reduce((acc, s) => acc + s.duration, 0)
          : (b.service as any).duration || 30;
        const endTime = startTime + bookingDuration;
        return { start: startTime, end: endTime };
      });

    const potentialSlots: TimeSlot[] = [];
    if (!schedule.weekdayConfig) return [];
    
    const { startTime, endTime, slotInterval } = schedule.weekdayConfig;
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (startMinutes === -1 || endMinutes === -1) return [];

    for (let currentMinutes = startMinutes; currentMinutes < endMinutes; currentMinutes += slotInterval) {
      const slotStartMinutes = currentMinutes;
      const slotEndMinutes = slotStartMinutes + totalDurationOfSelectedServices;

      if (slotEndMinutes > endMinutes) continue;

      let isAvailable = true;
      for (const bookedRange of bookedRanges) {
        if (slotStartMinutes < bookedRange.end && slotEndMinutes > bookedRange.start) {
          isAvailable = false;
          break;
        }
      }

      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

      potentialSlots.push({ time: timeString, isAvailable });
    }

    return potentialSlots;
  }, [bookings, schedule, totalDurationOfSelectedServices]);
  
  const timeSlots = useMemo(() => {
    return selectedDate ? generateTimeSlots(selectedDate) : [];
  }, [selectedDate, generateTimeSlots]);

  const handleServiceSelect = (service: Service) => {
    setSelectedServices(prev => {
        const isSelected = prev.find(s => s.id === service.id);
        if (isSelected) {
            return prev.filter(s => s.id !== service.id);
        } else {
            return [...prev, service];
        }
    });
  };

  const handleConfirmServices = () => {
    if (selectedServices.length > 0) {
        setStep(2);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    setStep(3);
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setStep(4);
  };

  const handleBookingSubmit = async (customerDetails: { name: string; email: string; phone?: string }) => {
    if (selectedServices.length === 0 || !selectedDate || !selectedTimeSlot) return;

    setIsSubmitting(true);
    
    let bookingTime = selectedTimeSlot.time;
    // For weekends, we need to assign a real time or a sequential slot number if we are to prevent duplicates
    // Let's refine the weekend logic.
    const day = selectedDate.getDay();
    if (day === 5 || day === 6) {
        const dateString = selectedDate.toISOString().split('T')[0];
        const todaysBookedCount = bookings.filter(b => b.date === dateString && b.status !== 'Cancelada').length;
        bookingTime = `Cupo #${todaysBookedCount + 1}`;
    }


    const bookingData = {
      service: selectedServices,
      date: selectedDate.toISOString().split('T')[0], // Format as YYYY-MM-DD string for DB
      time: bookingTime,
      customer: customerDetails,
    };
    
    const success = await onBookingConfirmed(bookingData as any);
    
    setIsSubmitting(false);
    if (success) {
      setIsConfirmed(true);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedServices([]);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setIsConfirmed(false);
  };

  return {
    step,
    selectedServices,
    selectedDate,
    selectedTimeSlot,
    timeSlots,
    isSubmitting,
    isConfirmed,
    handleServiceSelect,
    handleConfirmServices,
    handleDateSelect,
    handleTimeSlotSelect,
    handleBookingSubmit,
    handleReset,
  };
};
