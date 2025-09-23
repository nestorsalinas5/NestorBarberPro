import React from 'react';
import { ServiceSelector } from './ServiceSelector';
import { DatePicker } from './DatePicker';
import { TimeSlotGrid } from './TimeSlotGrid';
import { BookingForm } from './BookingForm';
import { ConfirmationModal } from './ConfirmationModal';
import { BookingSummary } from './BookingSummary';
import { useBookingLogic } from '../hooks/useBookingLogic';
import type { Booking, BarberShop } from '../types';
import { PoweredByFooter } from './PoweredByFooter';

interface ClientBookingViewProps {
  barberShop: BarberShop;
  bookings: Booking[];
  onBookingConfirmed: (booking: Omit<Booking, 'id' | 'status' | 'created_at'>) => Promise<boolean>;
  onReturnToShopSelection: () => void;
}

export const ClientBookingView: React.FC<ClientBookingViewProps> = ({ barberShop, bookings, onBookingConfirmed, onReturnToShopSelection }) => {
  const {
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
  } = useBookingLogic(bookings, barberShop.schedule, (bookingData) => onBookingConfirmed({ ...bookingData, barber_shop_id: barberShop.id }));

  const getStepComponent = () => {
    switch (step) {
      case 1:
        return <ServiceSelector 
                 services={barberShop.services} 
                 onSelectService={handleServiceSelect} 
                 selectedServices={selectedServices}
                 onConfirm={handleConfirmServices} 
               />;
      case 2:
        return <DatePicker selectedDate={selectedDate} onDateSelect={handleDateSelect} />;
      case 3:
        return <TimeSlotGrid timeSlots={timeSlots} onSelectTimeSlot={handleTimeSlotSelect} selectedTimeSlot={selectedTimeSlot} selectedDate={selectedDate} />;
      case 4:
        return <BookingForm onSubmit={handleBookingSubmit} isSubmitting={isSubmitting} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "1. Selecciona tus Servicios";
      case 2: return "2. Elige una Fecha";
      case 3: return "3. Escoge un Horario";
      case 4: return "4. Confirma tus Datos";
      default: return "";
    }
  };

  return (
    <>
      <div className="mb-4">
        <button 
            onClick={onReturnToShopSelection}
            className="text-sm text-brand-primary hover:text-brand-secondary transition-colors font-semibold"
        >
            &larr; Volver a la lista de barberías
        </button>
      </div>

      <div className="bg-brand-surface rounded-lg shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          
           <aside className="lg:col-span-1 p-6 bg-black/20 lg:border-r lg:border-gray-700/50">
            <BookingSummary 
              services={selectedServices}
              date={selectedDate}
              timeSlot={selectedTimeSlot}
            />
          </aside>
          
          <div className="lg:col-span-2 p-6">
            <h2 className="text-2xl font-bold text-brand-primary mb-6">{getStepTitle()}</h2>
            {getStepComponent()}
          </div>
          
        </div>
      </div>
      
      <PoweredByFooter />

      <ConfirmationModal
        isOpen={isConfirmed}
        onClose={handleReset}
        services={selectedServices}
        date={selectedDate}
        timeSlot={selectedTimeSlot}
      />
    </>
  );
};
