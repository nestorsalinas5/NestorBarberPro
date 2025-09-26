import React from 'react';
import type { TimeSlot } from '../types';

interface TimeSlotGridProps {
  timeSlots: TimeSlot[];
  selectedTimeSlot: TimeSlot | null;
  onSelectTimeSlot: (timeSlot: TimeSlot) => void;
  selectedDate: Date | null;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({ timeSlots, onSelectTimeSlot, selectedTimeSlot, selectedDate }) => {
  if (!timeSlots || timeSlots.length === 0) {
    return <div className="text-center text-brand-dark-charcoal/70 py-8">No hay horarios disponibles para este día.</div>;
  }

  const isWeekend = selectedDate && (selectedDate.getDay() === 5 || selectedDate.getDay() === 6);
  
  return (
    <div className="animate-fade-in">
      {isWeekend && (
        <div className="mb-4 p-3 bg-brand-dark-charcoal/5 border border-brand-dark-charcoal/20 rounded-lg text-center">
          <p className="font-semibold text-brand-dark-charcoal">
            Sistema de Citas por Cupos
          </p>
          <p className="text-sm text-brand-dark-charcoal/70">Los fines de semana operan con un número limitado de citas.</p>
        </div>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {timeSlots.map((slot) => (
          <button
            key={slot.time}
            disabled={!slot.isAvailable}
            onClick={() => onSelectTimeSlot(slot)}
            className={`p-3 rounded-md text-sm font-semibold transition-all duration-200 border-2
              ${!slot.isAvailable ? 'bg-brand-light-beige/50 text-brand-dark-charcoal/40 border-transparent cursor-not-allowed line-through' : ''}
              ${slot.isAvailable && selectedTimeSlot?.time === slot.time ? 'bg-brand-dark-charcoal text-brand-light-beige border-brand-dark-charcoal shadow-lg scale-105' : ''}
              ${slot.isAvailable && selectedTimeSlot?.time !== slot.time ? 'bg-brand-light-beige text-brand-dark-charcoal border-brand-light-beige hover:border-brand-dark-charcoal/50' : ''}
            `}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
};
