import React from 'react';
import type { TimeSlot } from '../types';

interface TimeSlotGridProps {
  timeSlots: TimeSlot[];
  selectedTimeSlot: TimeSlot | null;
  onSelectTimeSlot: (timeSlot: TimeSlot) => void;
  selectedDate: Date | null;
  weekendSlotsCount: number;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({ timeSlots, onSelectTimeSlot, selectedTimeSlot, selectedDate, weekendSlotsCount }) => {
  if (!timeSlots || timeSlots.length === 0) {
    return <div className="text-center text-brand-text-secondary py-8">No hay horarios disponibles para este día.</div>;
  }

  const isWeekend = selectedDate && (selectedDate.getDay() === 5 || selectedDate.getDay() === 6);
  const availableWeekendSlots = timeSlots.filter(s => s.isAvailable).length;

  return (
    <div className="animate-fade-in">
      {isWeekend && (
        <div className="mb-4 p-3 bg-brand-primary/10 border border-brand-primary/30 rounded-lg text-center">
          <p className="font-semibold text-brand-primary">
            {availableWeekendSlots} / {weekendSlotsCount} Cupos Disponibles
          </p>
          <p className="text-sm text-brand-text-secondary">Los viernes y sábados usamos un sistema de cupos limitados.</p>
        </div>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {timeSlots.map((slot) => (
          <button
            key={slot.time}
            disabled={!slot.isAvailable}
            onClick={() => onSelectTimeSlot(slot)}
            className={`p-3 rounded-md text-sm font-semibold transition-all duration-200
              ${!slot.isAvailable ? 'bg-gray-800 text-gray-600 cursor-not-allowed line-through' : ''}
              ${slot.isAvailable && selectedTimeSlot?.time === slot.time ? 'bg-brand-primary text-brand-bg shadow-lg scale-105' : ''}
              ${slot.isAvailable && selectedTimeSlot?.time !== slot.time ? 'bg-black/30 text-brand-text hover:bg-brand-secondary hover:text-brand-bg' : ''}
            `}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
};