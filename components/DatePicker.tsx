import React, { useState } from 'react';

interface DatePickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
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

export const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (newDate >= today) {
      onDateSelect(newDate);
    }
  };

  const weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

  return (
    <div className="bg-white/80 p-4 rounded-lg animate-fade-in border border-brand-dark-charcoal/10">
       <h3 className="text-2xl font-bold text-brand-dark-charcoal font-serif mb-4">2. Elige una Fecha</h3>
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-brand-dark-charcoal/10 transition">
          <ChevronLeftIcon className="w-5 h-5 text-brand-dark-charcoal" />
        </button>
        <h3 className="font-bold text-lg text-brand-dark-charcoal capitalize">
          {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-brand-dark-charcoal/10 transition">
          <ChevronRightIcon className="w-5 h-5 text-brand-dark-charcoal" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map(day => <div key={day} className="text-xs font-semibold text-brand-dark-charcoal/60 p-2">{day}</div>)}
        {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {days.map(day => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const isPast = date < today;
          const isSunday = date.getDay() === 0; // Disable Sundays

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={isPast || isSunday}
              className={`p-2 rounded-md transition-colors duration-200 text-sm font-semibold
                ${isPast || isSunday ? 'text-brand-dark-charcoal/30 cursor-not-allowed' : 'hover:bg-brand-gold/20'}
                ${isSelected ? 'bg-brand-gold text-brand-dark-charcoal' : 'text-brand-dark-charcoal'}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
