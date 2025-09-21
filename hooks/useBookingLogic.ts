import { useState, useCallback, useMemo } from 'react';
import type { Service, TimeSlot, Booking, ScheduleConfig } from '../types';

// Helper function to convert "HH:mm" time string to minutes from midnight for easier calculation.
const timeToMinutes = (time: string): number => {
  // Handles both "15:00" and "Cupo X" formats. Weekend slots are not time-based so they won't be converted.
  if (!time.includes(':')) return -1; 
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
    if (!date || totalDurationOfSelectedServices === 0) return [];

    const day = date.getDay();
    const dateString = date.toISOString().split('T')[0];

    // Weekend logic is slot-based, not time-based, so it remains simpler.
    if (day === 5 || day === 6) {
      const todaysBooked = bookings
        .filter(b => b.date === dateString && b.status !== 'Cancelada')
        .map(b => b.time);
      
      const slots: TimeSlot[] = [];
      for (let i = 0; i < schedule.weekend_slots_count; i++) {
        const slotLabel = `Cupo ${i + 1}`;
        slots.push({
          time: slotLabel,
          isAvailable: !todaysBooked.includes(slotLabel),
        });
      }
      return slots;
    }

    // Weekday logic: duration-aware conflict detection
    // 1. Get all booked time ranges for the day in minutes.
    const bookedRanges = bookings
      .filter(b => b.date === dateString && b.status !== 'Cancelada' && b.time.includes(':'))
      .map(b => {
        const startTime = timeToMinutes(b.time);
        // Handle both old (single service) and new (array of services) data structures
        const bookingDuration = Array.isArray(b.service)
          ? b.service.reduce((acc, s) => acc + s.duration, 0)
          : (b.service as any).duration || 30; // Fallback for old data
        const endTime = startTime + bookingDuration;
        return { start: startTime, end: endTime };
      });

    // 2. Generate potential slots and check for overlaps.
    const potentialSlots: TimeSlot[] = [];
    const { startHour, endHour, slotInterval } = schedule.weekdayConfig;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotInterval) {
        const slotStartMinutes = hour * 60 + minute;
        const slotEndMinutes = slotStartMinutes + totalDurationOfSelectedServices;

        // Don't create slots that would end after the barber shop closes.
        if (slotEndMinutes > endHour * 60) {
          continue;
        }

        // 3. Check for overlaps with existing bookings.
        let isAvailable = true;
        for (const bookedRange of bookedRanges) {
          // An overlap occurs if (StartA < EndB) and (EndA > StartB).
          if (slotStartMinutes < bookedRange.end && slotEndMinutes > bookedRange.start) {
            isAvailable = false;
            break; // An overlap was found, so this slot is unavailable.
          }
        }

        const d = new Date(date);
        d.setHours(hour, minute, 0, 0);
        const timeString = d.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit', hour12: false });

        potentialSlots.push({
          time: timeString,
          isAvailable,
        });
      }
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
    
    const bookingData = {
      service: selectedServices,
      date: selectedDate.toISOString().split('T')[0], // Format as YYYY-MM-DD string for DB
      time: selectedTimeSlot.time,
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
