import React from 'react';
import type { Service, TimeSlot } from '../types';

interface BookingSummaryProps {
  services: Service[];
  date: Date | null;
  timeSlot: TimeSlot | null;
}

const SummaryItem: React.FC<{ label: string; value: string | null }> = ({ label, value }) => (
  <div className="flex justify-between items-start py-3">
    <span className="text-sm text-brand-text-secondary flex-shrink-0">{label}</span>
    <span className="text-sm font-semibold text-brand-text text-right">{value || '...'}</span>
  </div>
);

export const BookingSummary: React.FC<BookingSummaryProps> = ({ services, date, timeSlot }) => {
  const formattedDate = date ? date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : null;
  const capitalizedDate = formattedDate ? formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1) : null;
  
  const totalPrice = services.reduce((total, s) => total + s.price, 0);
  const totalDuration = services.reduce((total, s) => total + s.duration, 0);

  return (
    <div className="lg:sticky top-8">
      <h3 className="text-xl font-bold text-brand-primary mb-4 border-b-2 border-brand-primary/30 pb-2">
        Tu Cita
      </h3>
      <div className="space-y-2 divide-y divide-gray-700/50">
        
        <div className="py-3">
          <span className="text-sm text-brand-text-secondary">Servicios</span>
          {services.length > 0 ? (
            <ul className="mt-2 space-y-1 text-right">
              {services.map(s => (
                <li key={s.id} className="text-sm font-semibold text-brand-text flex justify-between">
                  <span>{s.name}</span>
                  <span>₲{s.price.toLocaleString('es-PY')}</span>
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-sm font-semibold text-brand-text text-right">No seleccionado</p>
          )}
        </div>

        <SummaryItem label="Duración Total" value={services.length > 0 ? `${totalDuration} minutos` : null} />
        <SummaryItem label="Fecha" value={capitalizedDate} />
        <SummaryItem label="Hora" value={timeSlot?.time || null} />

        <div className="flex justify-between items-center pt-4">
          <span className="text-lg font-bold text-brand-text-secondary">Total</span>
          <span className="text-2xl font-bold text-brand-primary">
            ₲{totalPrice.toLocaleString('es-PY')}
          </span>
        </div>
      </div>
       <div className="mt-6 p-4 bg-brand-bg rounded-lg text-center hidden lg:block">
        <p className="text-sm text-brand-text-secondary">Por favor, revisa tus selecciones. Puedes volver y cambiarlas en cualquier momento antes de confirmar.</p>
      </div>
    </div>
  );
};
