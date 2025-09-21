import React from 'react';
import type { Service } from '../types';

interface ServiceSelectorProps {
  services: Service[];
  selectedServices: Service[];
  onSelectService: (service: Service) => void;
  onConfirm: () => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({ services, onSelectService, selectedServices, onConfirm }) => {
  const canConfirm = selectedServices.length > 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {services.map((service) => {
        const isSelected = selectedServices.some(s => s.id === service.id);
        return (
          <button
            key={service.id}
            onClick={() => onSelectService(service)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ease-in-out transform hover:-translate-y-1
              ${isSelected
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
        )
      })}
      {canConfirm && (
        <div className="pt-6">
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-bg bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Confirmar Selección
          </button>
        </div>
      )}
    </div>
  );
};
