import React from 'react';
import type { Service } from '../types';

interface ServiceSelectorProps {
  services: Service[];
  selectedServices: Service[];
  onSelectService: (service: Service) => void;
  onConfirm: () => void;
}

const CheckIcon: React.FC = () => (
    <div className="flex-shrink-0 w-10 h-10 bg-brand-gold border-2 border-brand-gold rounded-md flex items-center justify-center">
        <svg className="w-6 h-6 text-brand-dark-charcoal" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    </div>
);


const ServiceIconPlaceholder: React.FC = () => (
    <div className="flex-shrink-0 w-10 h-10 bg-brand-light-beige border-2 border-brand-dark-charcoal/20 rounded-md" />
);


export const ServiceSelector: React.FC<ServiceSelectorProps> = ({ services, onSelectService, selectedServices, onConfirm }) => {
  const canConfirm = selectedServices.length > 0;

  return (
    <div className="space-y-3 animate-fade-in">
       <h3 className="text-2xl font-bold text-brand-dark-charcoal font-serif mb-4">1. Selecciona tus Servicios</h3>
      {services.map((service) => {
        const isSelected = selectedServices.some(s => s.id === service.id);
        return (
          <button
            key={service.id}
            onClick={() => onSelectService(service)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ease-in-out flex items-center gap-4
              ${isSelected
                ? 'bg-white border-brand-gold shadow-lg ring-2 ring-brand-gold/50' 
                : 'bg-white border-brand-dark-charcoal/10 hover:border-brand-gold'}`}
          >
            {isSelected ? <CheckIcon /> : <ServiceIconPlaceholder />}
            <div className="flex-grow">
              <h3 className="font-bold text-base text-brand-dark-charcoal">{service.name}</h3>
              <p className="text-sm text-brand-dark-charcoal/70">{service.duration} minutos</p>
            </div>
            <p className="font-semibold text-lg text-brand-dark-charcoal">₲{service.price.toLocaleString('es-PY')}</p>
          </button>
        )
      })}
      {canConfirm && (
        <div className="pt-6">
          <button
            onClick={onConfirm}
            className="w-full flex justify-center py-3 px-4 border-2 border-brand-gold rounded-md shadow-sm text-sm font-bold bg-brand-gold text-brand-dark-charcoal hover:bg-brand-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};
