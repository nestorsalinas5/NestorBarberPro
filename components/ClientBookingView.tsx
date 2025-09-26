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

const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    // Unify steps 2 and 3 for the indicator
    const displaySteps = [
        { number: 1, title: 'Servicios' },
        { number: 2, title: 'Fecha y Hora' },
        { number: 4, title: 'Confirmar' }
    ];

    const getStepStatus = (stepNumber: number) => {
        let normalizedCurrentStep = currentStep;
        if (currentStep === 3) normalizedCurrentStep = 2;

        if (stepNumber < normalizedCurrentStep) return 'completed';
        if (stepNumber === normalizedCurrentStep) return 'current';
        return 'upcoming';
    };


    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {displaySteps.map((step, stepIdx) => (
                    <li key={step.title} className={`relative ${stepIdx !== displaySteps.length - 1 ? 'flex-1' : ''}`}>
                        {(() => {
                            const status = getStepStatus(step.number);
                            if (status === 'completed') {
                                return (
                                    <>
                                        <div className="absolute inset-0 top-6 flex items-center" aria-hidden="true">
                                            <div className="h-0.5 w-full bg-brand-gold" />
                                        </div>
                                        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold">
                                            <svg className="h-5 w-5 text-brand-dark-charcoal" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </>
                                );
                            } else if (status === 'current') {
                                return (
                                     <>
                                        <div className="absolute inset-0 top-6 flex items-center" aria-hidden="true">
                                            <div className="h-0.5 w-full bg-brand-dark-charcoal/20" />
                                        </div>
                                        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-gold bg-brand-light-beige">
                                            <span className="h-3 w-3 rounded-full bg-brand-gold" />
                                        </div>
                                     </>
                                );
                            } else { // upcoming
                                return (
                                     <>
                                        <div className="absolute inset-0 top-6 flex items-center" aria-hidden="true">
                                            <div className="h-0.5 w-full bg-brand-dark-charcoal/20" />
                                        </div>
                                        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-dark-charcoal/20 bg-brand-light-beige" />
                                     </>
                                );
                            }
                        })()}
                         <p className="absolute top-14 w-max -ml-2 text-center text-sm font-semibold text-brand-dark-charcoal">{step.title}</p>
                    </li>
                ))}
            </ol>
        </nav>
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

  return (
    <>
      <div className="mb-4">
        <button 
            onClick={onReturnToShopSelection}
            className="text-sm text-brand-light-beige/80 hover:text-white transition-colors font-semibold"
        >
            &larr; Volver a la lista de barberías
        </button>
      </div>
      
      <div className="bg-brand-light-beige/90 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl overflow-hidden max-w-6xl mx-auto">
        <div className="p-6 sm:p-8 border-b border-brand-dark-charcoal/10">
            <StepIndicator currentStep={step} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3">
          
           <aside className="lg:col-span-1 p-6 sm:p-8 bg-brand-dark-charcoal/5 lg:border-r lg:border-brand-dark-charcoal/10">
            <BookingSummary 
              services={selectedServices}
              date={selectedDate}
              timeSlot={selectedTimeSlot}
            />
          </aside>
          
          <div className="lg:col-span-2 p-6 sm:p-8">
            <PromotionsBanner promotions={barberShop.promotions} />
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
