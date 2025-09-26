import React from 'react';
import type { Service, TimeSlot } from '../types';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  date: Date | null;
  timeSlot: TimeSlot | null;
}

// Icons
const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const CalendarPlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M12 12.75h.008v.008H12v-.008Zm-3.002 0h.008v.008h-.008v-.008Zm6.004 0h.008v.008h-.008v-.008Zm-3.002 3h.008v.008h-.008v-.008Zm3.002 0h.008v.008h-.008v-.008Zm-6.004 0h.008v.008h-.008v-.008Z" />
    </svg>
);


export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, services, date, timeSlot }) => {
  if (!isOpen) return null;

  const formattedDate = date?.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' });
  const capitalizedDate = formattedDate ? formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1) : null;
  
  const handleDownloadICS = () => {
    if (!date || !timeSlot) return;

    const totalDuration = services.reduce((total, s) => total + s.duration, 0);
    const serviceNames = services.map(s => s.name).join(', ');
    
    // Parse time, handling both "HH:mm" and "Cupo #X - HH:mm" formats
    const timeString = timeSlot.time.includes('-') ? timeSlot.time.split('-')[1].trim() : timeSlot.time;
    const [hours, minutes] = timeString.split(':').map(Number);

    const startDate = new Date(date);
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + totalDuration * 60000);
    
    // Format dates for ICS file (YYYYMMDDTHHMMSSZ)
    const formatICSDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//NestorBarberPro//Booking//ES',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@nestorbarber.pro`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:Cita de Barbería: ${serviceNames}`,
      `DESCRIPTION:Servicios: ${serviceNames}. ¡Gracias por tu reserva!`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cita-barberia.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-brand-light-beige rounded-lg shadow-2xl p-8 max-w-md w-full text-center transform transition-all scale-100">
        <CheckCircleIcon className="w-16 h-16 text-brand-dark-green mx-auto mb-4"/>
        <h2 className="text-2xl font-bold text-brand-dark-charcoal mb-2">¡Reserva Confirmada!</h2>
        <p className="text-brand-dark-charcoal/80 mb-6">Tu cita está agendada. Hemos enviado los detalles a tu correo.</p>
        
        <div className="text-left bg-brand-dark-charcoal/5 p-4 rounded-lg mb-6">
          <div className="space-y-2">
            <div>
              <strong className="text-brand-dark-charcoal/80 w-20 inline-block">Servicios:</strong> 
              <ul className="inline-block list-disc list-inside ml-2">
                {services.map(s => <li key={s.id}>{s.name}</li>)}
              </ul>
            </div>
            <p><strong className="text-brand-dark-charcoal/80 w-20 inline-block">Fecha:</strong> {capitalizedDate}</p>
            <p><strong className="text-brand-dark-charcoal/80 w-20 inline-block">Hora:</strong> {timeSlot?.time}</p>
          </div>
        </div>

        <div className="space-y-4">
            <button
              onClick={handleDownloadICS}
              className="w-full flex items-center justify-center gap-2 text-lg font-semibold bg-brand-dark-charcoal/10 text-brand-dark-charcoal hover:bg-brand-dark-charcoal/20 transition-colors py-3 px-4 rounded-lg"
            >
              <CalendarPlusIcon className="w-6 h-6" />
              Añadir a mi Calendario
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 px-4 border-2 border-brand-dark-charcoal rounded-lg shadow-sm text-sm font-medium text-brand-dark-charcoal hover:bg-brand-dark-charcoal hover:text-brand-light-beige transition-colors"
            >
              Agendar otra Cita
            </button>
        </div>

      </div>
    </div>
  );
};
