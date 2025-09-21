import { useState, useCallback, useMemo } from 'react';
import type { Service, TimeSlot, Booking, ScheduleConfig } from '../types';

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

  const generateTimeSlots = useCallback((date: Date): TimeSlot[] => {
    if (!date) return [];
    
    const day = date.getDay();
    const dateString = date.toISOString().split('T')[0];
    const todaysBooked = bookings
      .filter(b => b.date === dateString && b.status !== 'Cancelada')
      .map(b => b.time);
    
    // Friday (5) or Saturday (6)
    if (day === 5 || day === 6) { 
      const slots: TimeSlot[] = [];
      for (let i = 0; i < schedule.weekend_slots_count; i++) {
        const slotLabel = `Cupo ${i + 1}`;
        slots.push({
          time: slotLabel,
          isAvailable: !todaysBooked.includes(slotLabel),
        });
      }
      return slots;
    } else { // Monday to Thursday
      const slots: TimeSlot[] = [];
      const { startHour, endHour, slotInterval } = schedule.weekdayConfig;
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotInterval) {
          const d = new Date(date);
          d.setHours(hour, minute, 0, 0);
          const time = d.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit', hour12: false });
          slots.push({
            time: time,
            isAvailable: !todaysBooked.includes(time),
          });
        }
      }
      return slots;
    }
  }, [bookings, schedule]);
  
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
