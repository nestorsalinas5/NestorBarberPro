import React, { useMemo } from 'react';
import type { Booking } from '../types';

interface AgendaCalendarViewProps {
  bookings: Pick<Booking, 'date'>[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
}

const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);


export const AgendaCalendarView: React.FC<AgendaCalendarViewProps> = ({ bookings, selectedDate, onDateSelect, currentMonth, setCurrentMonth }) => {
  const bookedDates = useMemo(() => {
    const dates = new Set<string>();
    bookings.forEach(b => dates.add(b.date));
    return dates;
  }, [bookings]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

  return (
    <div className="text-brand-dark-charcoal">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-brand-dark-charcoal/10 transition">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h3 className="font-bold text-lg capitalize">
          {currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-brand-dark-charcoal/10 transition">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map(day => <div key={day} className="text-xs font-semibold text-brand-dark-charcoal/60 p-2">{day}</div>)}
        {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {days.map(day => {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const dateString = date.toISOString().split('T')[0];
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const isToday = today.toDateString() === date.toDateString();
          const hasBookings = bookedDates.has(dateString);

          return (
            <button
              key={day}
              onClick={() => onDateSelect(date)}
              className={`p-2 rounded-md transition-colors duration-200 text-sm relative font-semibold
                hover:bg-brand-dark-charcoal/10
                ${isSelected ? 'bg-brand-dark-charcoal text-brand-light-beige' : ''}
                ${isToday && !isSelected ? 'border border-brand-dark-green' : ''}
              `}
            >
              {day}
              {hasBookings && <span className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-brand-light-beige' : 'bg-brand-dark-green'}`}></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
