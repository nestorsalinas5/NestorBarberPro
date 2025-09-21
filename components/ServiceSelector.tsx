import React from 'react';
import type { Service } from '../types';

interface ServiceSelectorProps {
  services: Service[];
  selectedService: Service | null;
  onSelectService: (service: Service) => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({ services, onSelectService, selectedService }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      {services.map((service) => (
        <button
          key={service.id}
          onClick={() => onSelectService(service)}
          className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ease-in-out transform hover:-translate-y-1
            ${selectedService?.id === service.id 
              ? 'bg-brand-primary/20 border-brand-primary shadow-lg' 
              : 'bg-brand-surface border-gray-700 hover:border-brand-secondary'}`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-brand-text">{service.name}</h3>
              <p className="text-sm text-brand-text-secondary">{service.duration} minutos</p>
            </div>
            <p className="font-semibold text-xl text-brand-primary">₲{service.price.toLocaleString('es-PY')}</p>
          </div>
        </button>
      ))}
    </div>
  );
};