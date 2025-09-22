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

  // Normalize schedule data to prevent crashes with old data formats.
  const normalizedSchedule = useMemo(() => {
    const defaults: ScheduleConfig = {
      weekdayConfig: { startTime: "09:30", endTime: "19:30", slotInterval: 30 },
      weekendConfig: { slotsCount: 20, startTime: "08:20" }
    };
    return {
      weekdayConfig: {
        ...defaults.weekdayConfig,
        ...(schedule?.weekdayConfig || {}),
      },
      weekendConfig: {
        ...defaults.weekendConfig,
        ...(schedule?.weekendConfig || {}),
      },
    };
  }, [schedule]);


  const totalDurationOfSelectedServices = useMemo(() => {
    return selectedServices.reduce((total, s) => total + s.duration, 0);
  }, [selectedServices]);


  const generateTimeSlots = useCallback((date: Date): TimeSlot[] => {
    if (!date || totalDurationOfSelectedServices === 0) return [];

    const day = date.getDay();
    const dateString = date.toISOString().split('T')[0];

    // Weekend logic (Friday/Saturday) is slot-based with calculated times
    if (day === 5 || day === 6) {
      const { slotsCount, startTime } = normalizedSchedule.weekendConfig;
      if (slotsCount === 0 || totalDurationOfSelectedServices === 0) return [];

      const startMinutes = timeToMinutes(startTime);
      if (startMinutes === -1) return [];

      const bookedSlotNumbers = new Set(
        bookings
          .filter(b => b.date === dateString && b.status !== 'Cancelada' && b.time.startsWith('Cupo #'))
          .map(b => {
            const match = b.time.match(/Cupo #(\d+)/);
            return match ? parseInt(match[1], 10) : NaN;
          })
          .filter(num => !isNaN(num))
      );
      
      const slots: TimeSlot[] = [];
      let currentMinutes = startMinutes;

      for (let i = 1; i <= slotsCount; i++) {
        const hours = Math.floor(currentMinutes / 60);
        const minutes = currentMinutes % 60;
        const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        
        slots.push({
          time: `Cupo #${i} - ${timeString}`,
          isAvailable: !bookedSlotNumbers.has(i),
        });

        // Calculate the start time for the next slot
        currentMinutes += totalDurationOfSelectedServices;
      }
      return slots;
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
    
    const { startTime, endTime, slotInterval } = normalizedSchedule.weekdayConfig;
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
  }, [bookings, normalizedSchedule, totalDurationOfSelectedServices]);
  
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
    
    const bookingData = {
      service: selectedServices,
      date: selectedDate.toISOString().split('T')[0], // Format as YYYY-MM-DD string for DB
      time: selectedTimeSlot.time, // The selected time is now always correct, for both weekdays and weekends
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
