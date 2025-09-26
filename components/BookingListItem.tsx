import React from 'react';
import type { Booking, Service } from '../types';

interface BookingListItemProps {
  booking: Booking;
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  onSelect: (booking: Booking) => void;
}

const statusStyles: Record<Booking['status'], { bg: string, text: string, border: string }> = {
  'Confirmada': { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
  'Completada': { bg: 'bg-green-500/10', text: 'text-green-700', border: 'border-green-500/20' },
  'Cancelada': { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20' },
};

export const BookingListItem: React.FC<BookingListItemProps> = ({ booking, onUpdateBookingStatus, onSelect }) => {
  const { bg, text, border } = statusStyles[booking.status];
  
  const serviceNames = Array.isArray(booking.service)
    ? booking.service.map(s => s.name).join(', ')
    : (booking.service as unknown as Service)?.name || 'Servicio no especificado';

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Prevent modal from opening when clicking action buttons
    action();
  };

  return (
    <button 
      onClick={() => onSelect(booking)}
      className={`w-full text-left p-3 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all duration-200 hover:shadow-md hover:border-brand-dark-charcoal/30 bg-white ${border}`}
    >
      <div className="flex-grow">
        <div className="flex items-center gap-3">
           <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${bg} ${text}`}>
            {booking.status}
          </span>
          <p className="font-bold text-base text-brand-dark-charcoal">{booking.customer.name}</p>
        </div>
        <div className="mt-1 text-sm text-brand-dark-charcoal/80">
           <p><span className="font-semibold">{booking.time}</span> - {serviceNames}</p>
        </div>
      </div>
      
      {booking.status === 'Confirmada' && (
        <div className="flex gap-2 self-end sm:self-center flex-shrink-0">
          <button 
            onClick={(e) => handleActionClick(e, () => onUpdateBookingStatus(booking.id, 'Cancelada'))}
            className="px-2 py-1 text-xs font-semibold rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={(e) => handleActionClick(e, () => onUpdateBookingStatus(booking.id, 'Completada'))}
            className="px-2 py-1 text-xs font-semibold rounded-md bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
          >
            Completar
          </button>
        </div>
      )}
    </button>
  );
};
