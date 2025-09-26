import React from 'react';
import type { Booking } from '../types';

interface BookingDetailModalProps {
  booking: Booking | null;
  onClose: () => void;
}

const statusStyles: Record<Booking['status'], { bg: string, text: string, border: string }> = {
  'Confirmada': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  'Completada': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  'Cancelada': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
};

const InfoRow: React.FC<{ label: string, value: React.ReactNode }> = ({ label, value }) => (
    <div className="py-2 grid grid-cols-3 gap-4">
        <dt className="text-sm font-medium text-brand-dark-charcoal/70">{label}</dt>
        <dd className="text-sm text-brand-dark-charcoal col-span-2">{value || '-'}</dd>
    </div>
);


export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ booking, onClose }) => {
  if (!booking) return null;

  const { bg, text, border } = statusStyles[booking.status];
  const serviceList = Array.isArray(booking.service) ? booking.service : [booking.service];
  const totalPrice = serviceList.reduce((acc, s) => acc + s.price, 0);
  const formattedDate = new Date(`${booking.date}T00:00:00`).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-brand-light-beige text-brand-dark-charcoal rounded-lg shadow-2xl p-8 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-brand-dark-charcoal">Detalles de la Cita</h2>
                <p className="text-sm text-brand-dark-charcoal/70">ID: {booking.id.substring(0, 8)}</p>
            </div>
             <span className={`px-3 py-1 text-xs font-semibold rounded-full ${bg} ${text} border ${border}`}>
                {booking.status}
            </span>
        </div>
        
        <div className="mt-6 space-y-6">
            <section>
                <h3 className="font-semibold border-b border-gray-200 pb-2 mb-2">Cliente</h3>
                <dl className="divide-y divide-gray-200">
                    <InfoRow label="Nombre" value={booking.customer.name} />
                    <InfoRow label="Email" value={<a href={`mailto:${booking.customer.email}`} className="text-brand-dark-green hover:underline">{booking.customer.email}</a>} />
                    <InfoRow label="Teléfono" value={booking.customer.phone || 'No proporcionado'} />
                </dl>
            </section>
            
            <section>
                <h3 className="font-semibold border-b border-gray-200 pb-2 mb-2">Cita</h3>
                <dl className="divide-y divide-gray-200">
                     <InfoRow label="Fecha" value={formattedDate} />
                     <InfoRow label="Hora" value={booking.time} />
                     <InfoRow label="Servicios" value={(
                         <ul className="space-y-1">
                             {serviceList.map(s => <li key={s.id} className="flex justify-between"><span>{s.name}</span> <span>₲{s.price.toLocaleString('es-PY')}</span></li>)}
                         </ul>
                     )} />
                     <InfoRow label="Total" value={<span className="font-bold text-brand-dark-green text-base">₲{totalPrice.toLocaleString('es-PY')}</span>} />
                </dl>
            </section>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium hover:bg-gray-100">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
