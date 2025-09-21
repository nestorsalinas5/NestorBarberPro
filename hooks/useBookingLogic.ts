import { useState, useCallback, useMemo } from 'react';
import type { Service, TimeSlot, Booking, ScheduleConfig } from '../types';
import { syncBookingToSheet } from '../services/googleSheets';

export const useBookingLogic = (
  bookings: Booking[],
  schedule: ScheduleConfig,
  onBookingConfirmed: (booking: Omit<Booking, 'id' | 'status'>) => void
) => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const generateTimeSlots = useCallback((date: Date): TimeSlot[] => {
    if (!date) return [];
    
    const day = date.getDay();
    const dateString = date.toISOString().split('T')[0];
    const todaysBooked = bookings
      .filter(b => b.date.toISOString().split('T')[0] === dateString && b.status !== 'Cancelada')
      .map(b => b.time);
    
    if (day === 5 || day === 6) { // Friday or Saturday
      const slots: TimeSlot[] = [];
      for (let i = 0; i < schedule.weekendSlots; i++) {
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
    setSelectedService(service);
    setStep(2);
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
    if (!selectedService || !selectedDate || !selectedTimeSlot) return;

    setIsSubmitting(true);
    
    const bookingData = {
      service: selectedService,
      date: selectedDate,
      time: selectedTimeSlot.time,
      customer: customerDetails,
    };
    
    // Sync to Google Sheets (Simulated via Gemini)
    try {
      await syncBookingToSheet(bookingData);
    } catch (error) {
      console.error('Failed to sync to Google Sheets:', error);
    }
    
    onBookingConfirmed(bookingData);
    
    setIsSubmitting(false);
    setIsConfirmed(true);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setIsConfirmed(false);
  };

  return {
    step,
    selectedService,
    selectedDate,
    selectedTimeSlot,
    timeSlots,
    isSubmitting,
    isConfirmed,
    handleServiceSelect,
    handleDateSelect,
    handleTimeSlotSelect,
    handleBookingSubmit,
    handleReset,
  };
};