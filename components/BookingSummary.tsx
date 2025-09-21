import React from 'react';
import type { Service, TimeSlot } from '../types';

interface BookingSummaryProps {
  service: Service | null;
  date: Date | null;
  timeSlot: TimeSlot | null;
}

const SummaryItem: React.FC<{ label: string; value: string | null }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-3">
    <span className="text-sm text-brand-text-secondary">{label}</span>
    <span className="text-sm font-semibold text-brand-text">{value || '...'}</span>
  </div>
);

export const BookingSummary: React.FC<BookingSummaryProps> = ({ service, date, timeSlot }) => {
  const formattedDate = date ? date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : null;
  const capitalizedDate = formattedDate ? formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1) : null;


  return (
    <div className="sticky top-8">
      <h3 className="text-xl font-bold text-brand-primary mb-4 border-b-2 border-brand-primary/30 pb-2">
        Tu Cita
      </h3>
      <div className="space-y-2 divide-y divide-gray-700/50">
        <SummaryItem label="Servicio" value={service?.name || 'No seleccionado'} />
        <SummaryItem label="Fecha" value={capitalizedDate} />
        <SummaryItem label="Hora" value={timeSlot?.time || null} />
        <div className="flex justify-between items-center pt-4">
          <span className="text-lg font-bold text-brand-text-secondary">Total</span>
          <span className="text-2xl font-bold text-brand-primary">
            ₲{service ? service.price.toLocaleString('es-PY') : '0'}
          </span>
        </div>
      </div>
       <div className="mt-6 p-4 bg-brand-bg rounded-lg text-center">
        <p className="text-sm text-brand-text-secondary">Por favor, revisa tus selecciones. Puedes volver y cambiarlas en cualquier momento antes de confirmar.</p>
      </div>
    </div>
  );
};