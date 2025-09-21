import React from 'react';
import type { Booking, Service } from '../types';

interface BookingListItemProps {
  booking: Booking;
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  onSelect: (booking: Booking) => void;
}

const statusStyles: Record<Booking['status'], { bg: string, text: string, border: string }> = {
  'Confirmada': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  'Completada': { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  'Cancelada': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
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
      className={`w-full text-left p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-200 hover:shadow-lg hover:border-brand-primary/50 ${bg} ${border}`}
    >
      <div className="flex-grow">
        <div className="flex items-center gap-4">
           <span className={`px-3 py-1 text-xs font-semibold rounded-full ${bg} ${text} border ${border}`}>
            {booking.status}
          </span>
          <p className="font-bold text-lg text-brand-text">{booking.customer.name}</p>
        </div>
        <div className="mt-2 text-sm text-brand-text-secondary pl-2 border-l-2 border-gray-700">
           <p><span className="font-semibold">{booking.time}</span> - {serviceNames}</p>
           <p className="text-xs">{booking.customer.email}</p>
        </div>
      </div>
      
      {booking.status === 'Confirmada' && (
        <div className="flex gap-2 self-end sm:self-center flex-shrink-0">
          <button 
            onClick={(e) => handleActionClick(e, () => onUpdateBookingStatus(booking.id, 'Cancelada'))}
            className="px-3 py-1 text-xs font-semibold rounded-md bg-red-500/20 text-red-300 hover:bg-red-500/40 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={(e) => handleActionClick(e, () => onUpdateBookingStatus(booking.id, 'Completada'))}
            className="px-3 py-1 text-xs font-semibold rounded-md bg-green-500/20 text-green-300 hover:bg-green-500/40 transition-colors"
          >
            Completar
          </button>
        </div>
      )}
    </button>
  );
};
