import React from 'react';
import type { Service } from '../types';

interface ServiceSelectorProps {
  services: Service[];
  selectedServices: Service[];
  onSelectService: (service: Service) => void;
  onConfirm: () => void;
}

const ServiceIcon: React.FC<{ name: string }> = ({ name }) => {
  const getIcon = () => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('cort')) return 'M6.133 8.35a1.5 1.5 0 0 0 0 2.121l4.95 4.95a1.5 1.5 0 0 0 2.121 0l4.95-4.95a1.5 1.5 0 0 0-2.121-2.121L12 12.293l-3.768-3.768a1.5 1.5 0 0 0-2.1-0.175Z';
    if (lowerName.includes('afeita') || lowerName.includes('barba')) return 'M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8-3 1 3m0 0-1.125-1.688M13.25 16.5 12 19.5m0 0-1.25-3M3.75 9h16.5';
    if (lowerName.includes('crema') || lowerName.includes('baño')) return 'M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.82m5.84-2.56a17.96 17.96 0 0 0-5.84-2.56m0 0A17.965 17.965 0 0 1 12 2.25a17.965 17.965 0 0 1 5.84 2.56m-5.84 0a17.965 17.965 0 0 0-5.84 2.56m5.84 0a6 6 0 0 1 5.84 2.56m0 0a6 6 0 0 1-5.84 2.56m0 0v4.82a6 6 0 0 1 5.84-7.38m-5.84 2.56a17.965 17.965 0 0 1-5.84-2.56';
    if (lowerName.includes('color') || lowerName.includes('tinte')) return 'm15.83 5.42-2.25-2.25a2.25 2.25 0 0 0-3.18 0l-8.25 8.25a2.25 2.25 0 0 0 0 3.18l2.25 2.25a2.25 2.25 0 0 0 3.18 0l8.25-8.25a2.25 2.25 0 0 0 0-3.18ZM12.53 18.53l-2.25-2.25a.75.75 0 0 0-1.06 0l-.75.75a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 0 0 1.06 0l.75-.75a.75.75 0 0 0 0-1.06Z';
    return 'M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.47 2.118 2.25 2.25 0 0 0-2.47 2.118c0 1.243.99 2.25 2.23 2.25h15.5c1.243 0 2.25-.99 2.25-2.25a2.25 2.25 0 0 0-2.47-2.118 2.25 2.25 0 0 1-2.47-2.118 3 3 0 0 0-5.78-1.128Z';
  };
  return (
    <div className="flex-shrink-0 w-10 h-10 bg-brand-light-beige border-2 border-brand-dark-charcoal rounded-md flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-brand-dark-charcoal">
        <path strokeLinecap="round" strokeLinejoin="round" d={getIcon()} />
      </svg>
    </div>
  );
};

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({ services, onSelectService, selectedServices, onConfirm }) => {
  const canConfirm = selectedServices.length > 0;
  const totalDuration = selectedServices.reduce((total, s) => total + s.duration, 0);
  const totalPrice = selectedServices.reduce((total, s) => total + s.price, 0);


  return (
    <div className="space-y-3 animate-fade-in">
      {services.map((service) => {
        const isSelected = selectedServices.some(s => s.id === service.id);
        return (
          <button
            key={service.id}
            onClick={() => onSelectService(service)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ease-in-out flex items-center gap-4
              ${isSelected
                ? 'bg-brand-dark-charcoal border-brand-dark-charcoal shadow-lg' 
                : 'bg-brand-light-beige border-brand-light-beige hover:border-brand-dark-charcoal/50'}`}
          >
            <ServiceIcon name={service.name} />
            <div className="flex-grow">
              <h3 className={`font-bold text-base ${isSelected ? 'text-brand-light-beige' : 'text-brand-dark-charcoal'}`}>{service.name}</h3>
              <p className={`text-sm ${isSelected ? 'text-brand-light-beige/80' : 'text-brand-dark-charcoal/70'}`}>{service.duration} minutos</p>
            </div>
            <p className={`font-semibold text-lg ${isSelected ? 'text-brand-light-beige' : 'text-brand-dark-charcoal'}`}>₲{service.price.toLocaleString('es-PY')}</p>
          </button>
        )
      })}
      {canConfirm && (
        <div className="pt-6">
           <div className="text-center mb-4">
              <p className="font-bold">Total: ₲{totalPrice.toLocaleString('es-PY')}</p>
              <p className="text-sm text-brand-dark-charcoal/70">Duración total: {totalDuration} minutos</p>
            </div>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className="w-full flex justify-center py-3 px-4 border-2 border-brand-dark-charcoal rounded-md shadow-sm text-sm font-bold bg-brand-light-beige text-brand-dark-charcoal hover:bg-brand-dark-charcoal hover:text-brand-light-beige focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark-charcoal disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Elegir Fecha y Hora
          </button>
        </div>
      )}
    </div>
  );
};
