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

const PromotionsBanner: React.FC<{ promotions: BarberShop['promotions'] }> = ({ promotions }) => {
  if (!promotions || promotions.length === 0) return null;

  return (
    <div className="mb-6 p-4 bg-brand-dark-charcoal/5 border border-brand-dark-charcoal/10 rounded-lg animate-fade-in">
      <h3 className="font-bold text-brand-dark-charcoal mb-2">¡Promociones Especiales!</h3>
      <ul className="space-y-2">
        {promotions.map(promo => (
          <li key={promo.id}>
            <p className="font-semibold text-brand-dark-charcoal">{promo.title}</p>
            <p className="text-sm text-brand-dark-charcoal/80">{promo.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};


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
            className="text-sm text-brand-light-beige hover:text-white transition-colors font-semibold"
        >
            &larr; Volver a la lista de barberías
        </button>
      </div>
      
      <div className="bg-brand-light-beige rounded-lg shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          
           <aside className="lg:col-span-1 p-6 bg-brand-dark-charcoal/5 lg:border-r lg:border-brand-dark-charcoal/10">
            <BookingSummary 
              services={selectedServices}
              date={selectedDate}
              timeSlot={selectedTimeSlot}
            />
          </aside>
          
          <div className="lg:col-span-2 p-6">
            <PromotionsBanner promotions={barberShop.promotions} />
            <h2 className="text-2xl font-bold text-brand-dark-charcoal mb-6">{getStepTitle()}</h2>
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
