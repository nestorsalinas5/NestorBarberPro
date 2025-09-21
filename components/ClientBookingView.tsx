import React from 'react';
import { ServiceSelector } from './ServiceSelector';
import { DatePicker } from './DatePicker';
import { TimeSlotGrid } from './TimeSlotGrid';
import { BookingForm } from './BookingForm';
import { ConfirmationModal } from './ConfirmationModal';
import { BookingSummary } from './BookingSummary';
import { useBookingLogic } from '../hooks/useBookingLogic';
import type { Booking, BarberShop } from '../types';

interface ClientBookingViewProps {
  barberShop: BarberShop;
  bookings: Booking[];
  onBookingConfirmed: (booking: Omit<Booking, 'id' | 'status' | 'created_at'>) => void;
}

export const ClientBookingView: React.FC<ClientBookingViewProps> = ({ barberShop, bookings, onBookingConfirmed }) => {
  const {
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
  } = useBookingLogic(bookings, barberShop.schedule, (bookingData) => onBookingConfirmed({ ...bookingData, barber_shop_id: barberShop.id }));

  const getStepComponent = () => {
    switch (step) {
      case 1:
        return <ServiceSelector services={barberShop.services} onSelectService={handleServiceSelect} selectedService={selectedService} />;
      case 2:
        return <DatePicker selectedDate={selectedDate} onDateSelect={handleDateSelect} />;
      case 3:
        return <TimeSlotGrid timeSlots={timeSlots} onSelectTimeSlot={handleTimeSlotSelect} selectedTimeSlot={selectedTimeSlot} selectedDate={selectedDate} weekend_slots_count={barberShop.schedule.weekend_slots_count} />;
      case 4:
        return <BookingForm onSubmit={handleBookingSubmit} isSubmitting={isSubmitting} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "1. Selecciona un Servicio";
      case 2: return "2. Elige una Fecha";
      case 3: return "3. Escoge un Horario";
      case 4: return "4. Confirma tus Datos";
      default: return "";
    }
  };

  return (
    <>
      <div className="bg-brand-surface rounded-lg shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 p-6 md:p-8 border-r border-gray-700/50">
            <h2 className="text-2xl font-bold text-brand-primary mb-6">{getStepTitle()}</h2>
            {getStepComponent()}
          </div>
          
          <aside className="md:col-span-1 p-6 md:p-8 bg-black/20">
            <BookingSummary 
              service={selectedService}
              date={selectedDate}
              timeSlot={selectedTimeSlot}
            />
          </aside>
        </div>
      </div>
      
      <footer className="text-center mt-8 text-brand-text-secondary text-sm">
        <p>Potenciado por NestorBarberPro</p>
      </footer>

      <ConfirmationModal
        isOpen={isConfirmed}
        onClose={handleReset}
        service={selectedService}
        date={selectedDate}
        timeSlot={selectedTimeSlot}
      />
    </>
  );
};
