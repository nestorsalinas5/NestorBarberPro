import React from 'react';
import type { Booking } from '../types';
import { BookingListItem } from './BookingListItem';

interface BookingListProps {
  bookings: Booking[];
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  onSelectBooking: (booking: Booking) => void;
}

export const BookingList: React.FC<BookingListProps> = ({ bookings, onUpdateBookingStatus, onSelectBooking }) => {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-brand-dark-charcoal/80">No hay citas agendadas.</p>
        <p className="text-sm text-brand-dark-charcoal/60">¡Un buen momento para un café!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map(booking => (
        <BookingListItem 
          key={booking.id} 
          booking={booking} 
          onUpdateBookingStatus={onUpdateBookingStatus}
          onSelect={onSelectBooking}
        />
      ))}
    </div>
  );
};
