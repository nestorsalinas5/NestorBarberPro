import React from 'react';
import type { Service, TimeSlot } from '../types';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  date: Date | null;
  timeSlot: TimeSlot | null;
  googleSyncStatus: 'pending' | 'success' | 'error' | null;
}

// Icons
const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);


export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, services, date, timeSlot, googleSyncStatus }) => {
  if (!isOpen) return null;

  const formattedDate = date?.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' });
  const capitalizedDate = formattedDate ? formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1) : null;

  const renderSyncStatus = () => {
    switch (googleSyncStatus) {
      case 'pending':
        return (
          <div className="flex items-center justify-center gap-2 text-sm text-yellow-400">
            <ClockIcon className="w-5 h-5 animate-spin" />
            <span>Sincronizando con Google Calendar...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center justify-center gap-2 text-sm text-green-400">
            <CheckCircleIcon className="w-5 h-5" />
            <span>Se ha enviado una invitación a tu calendario.</span>
          </div>
        );
      case 'error':
        return (
          <div className="text-center p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-sm text-red-400 font-semibold">
              <XCircleIcon className="w-5 h-5 flex-shrink-0" />
              <span>Error al sincronizar con Google Calendar</span>
            </div>
            <p className="mt-1 text-xs text-red-400/80">
              Tu cita está confirmada. Si lo deseas, puedes añadirla manualmente a tu calendario.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-brand-surface rounded-lg shadow-2xl p-8 max-w-md w-full text-center transform transition-all scale-100">
        <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4"/>
        <h2 className="text-2xl font-bold text-brand-primary mb-2">¡Reserva Confirmada!</h2>
        <p className="text-brand-text-secondary mb-6">Tu cita está agendada. Hemos enviado los detalles a tu correo.</p>
        
        <div className="text-left bg-black/20 p-4 rounded-lg">
          <div className="space-y-2">
            <div>
              <strong className="text-brand-text-secondary w-16 inline-block">Servicios:</strong> 
              <ul className="inline-block list-disc list-inside ml-2">
                {services.map(s => <li key={s.id}>{s.name}</li>)}
              </ul>
            </div>
            <p><strong className="text-brand-text-secondary w-16 inline-block">Fecha:</strong> {capitalizedDate}</p>
            <p><strong className="text-brand-text-secondary w-16 inline-block">Hora:</strong> {timeSlot?.time}</p>
          </div>
        </div>

        <div className="my-6 min-h-[56px] flex items-center justify-center">
          {renderSyncStatus()}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-brand-bg bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors"
        >
          Agendar otra Cita
        </button>
      </div>
    </div>
  );
};
