import React, { useState, useMemo } from 'react';
import type { Booking, BarberShop, Service } from '../types';
import { BookingList } from './BookingList';
import { BarberSettingsView } from './BarberSettingsView';
import { AgendaCalendarView } from './AgendaCalendarView'; // Import the new component

interface BarberDashboardProps {
  barberShop: BarberShop;
  bookings: Booking[];
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  onUpdateServices: (shopId: string, services: Service[]) => Promise<void>;
}

type Tab = 'agenda' | 'settings';

export const BarberDashboard: React.FC<BarberDashboardProps> = ({ barberShop, bookings, onUpdateBookingStatus, onUpdateServices }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<Tab>('agenda');

  const filteredBookings = useMemo(() => {
    const todayString = selectedDate.toISOString().split('T')[0];
    return bookings
      .filter(b => b.date === todayString)
      .sort((a, b) => a.time.localeCompare(b.time)); // Sort by time
  }, [bookings, selectedDate]);

  const TabButton: React.FC<{tabId: Tab; children: React.ReactNode}> = ({ tabId, children }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors
        ${activeTab === tabId 
          ? 'bg-brand-surface text-brand-primary border-b-2 border-brand-primary' 
          : 'text-brand-text-secondary hover:text-brand-text'
        }`
      }
    >
      {children}
    </button>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 
            className="text-3xl font-bold text-brand-primary"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Panel del Barbero
          </h2>
          <p className="text-brand-text-secondary">
            Gestiona tu agenda y la configuración de <span className="font-semibold text-brand-text">{barberShop.name}</span>
          </p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-700/50 mb-6">
        <TabButton tabId="agenda">Agenda</TabButton>
        <TabButton tabId="settings">Configuración</TabButton>
      </div>

      {activeTab === 'agenda' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Calendar */}
          <div className="lg:col-span-2 bg-brand-surface rounded-lg shadow-2xl p-6">
            <AgendaCalendarView 
              bookings={bookings}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
            />
          </div>

          {/* Right Column: Appointments for selected day */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-brand-surface rounded-lg shadow-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold text-brand-text capitalize">
                    {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}
                  </h3>
                  <p className="text-sm text-brand-text-secondary">
                    {selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-brand-primary">{filteredBookings.length}</div>
                    <div className="text-xs text-brand-text-secondary">Citas</div>
                </div>
              </div>
              <BookingList bookings={filteredBookings} onUpdateBookingStatus={onUpdateBookingStatus} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-brand-surface rounded-lg shadow-2xl overflow-hidden p-6 md:p-8">
            <BarberSettingsView 
                barberShop={barberShop}
                onUpdateServices={onUpdateServices}
            />
        </div>
      )}
    </div>
  );
};
