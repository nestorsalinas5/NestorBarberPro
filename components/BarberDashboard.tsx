import React, { useState, useMemo } from 'react';
import type { Booking, BarberShop, Service, Client, Expense } from '../types';
import { BookingList } from './BookingList';
import { BarberSettingsView } from './BarberSettingsView';
import { AgendaCalendarView } from './AgendaCalendarView';
import { ClientManagementView } from './ClientManagementView';
import { ReportingView } from './ReportingView';
import { BookingDetailModal } from './BookingDetailModal';
import { PoweredByFooter } from './PoweredByFooter';
import { LicenseWarningBanner } from './LicenseWarningBanner';

interface BarberDashboardProps {
  barberShop: BarberShop;
  bookings: Booking[];
  clients: Client[];
  expenses: Expense[];
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  onUpdateServices: (shopId: string, services: Service[]) => Promise<void>;
  onUploadLogo: (file: File, shopId: string) => Promise<void>;
  onAddExpense: (expenseData: Omit<Expense, 'id' | 'created_at' | 'barber_shop_id'>) => Promise<void>;
  onDeleteExpense: (expenseId: string) => Promise<void>;
  onUpdateClient: (clientData: Pick<Client, 'id' | 'name' | 'email' | 'phone'>) => Promise<void>;
}

type Tab = 'agenda' | 'clients' | 'reports' | 'settings';

export const BarberDashboard: React.FC<BarberDashboardProps> = (props) => {
  const { barberShop, bookings, clients, expenses, onUpdateBookingStatus, onUpdateServices, onUploadLogo, onAddExpense, onDeleteExpense, onUpdateClient } = props;
  
  const [activeTab, setActiveTab] = useState<Tab>('agenda');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const filteredBookingsForDay = useMemo(() => {
    const todayString = selectedDate.toISOString().split('T')[0];
    return bookings
      .filter(b => b.date === todayString)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [bookings, selectedDate]);

  const TabButton: React.FC<{tabId: Tab; children: React.ReactNode}> = ({ tabId, children }) => (
    <button onClick={() => setActiveTab(tabId)} className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${activeTab === tabId ? 'bg-brand-surface text-brand-primary border-b-2 border-brand-primary' : 'text-brand-text-secondary hover:text-brand-text'}`}>
      {children}
    </button>
  );

  return (
    <>
    <div className="animate-fade-in">
      <LicenseWarningBanner licenseExpiresAt={barberShop.license_expires_at} />

      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-3xl font-bold text-brand-primary" style={{ fontFamily: "'Playfair Display', serif" }}>Panel del Barbero</h2>
          <p className="text-brand-text-secondary">Gestiona tu negocio y la configuración de <span className="font-semibold text-brand-text">{barberShop.name}</span></p>
        </div>
      </div>
      
      <div className="border-b border-gray-700/50 mb-6">
        <TabButton tabId="agenda">Agenda</TabButton>
        <TabButton tabId="clients">Clientes</TabButton>
        <TabButton tabId="reports">Reportes</TabButton>
        <TabButton tabId="settings">Configuración</TabButton>
      </div>

      {activeTab === 'agenda' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-brand-surface rounded-lg shadow-2xl p-6"><AgendaCalendarView bookings={bookings} selectedDate={selectedDate} onDateSelect={setSelectedDate} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} /></div>
          <div className="lg:col-span-1"><div className="sticky top-8 bg-brand-surface rounded-lg shadow-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold text-brand-text capitalize">{selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}</h3>
                  <p className="text-sm text-brand-text-secondary">{selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-brand-primary">{filteredBookingsForDay.length}</div>
                    <div className="text-xs text-brand-text-secondary">Citas</div>
                </div>
              </div>
              <BookingList bookings={filteredBookingsForDay} onUpdateBookingStatus={onUpdateBookingStatus} onSelectBooking={setSelectedBooking} />
          </div></div>
        </div>
      )}

      {activeTab === 'clients' && <ClientManagementView clients={clients} onUpdateClient={onUpdateClient} />}
      {activeTab === 'reports' && <ReportingView barberShop={barberShop} bookings={bookings} expenses={expenses} onAddExpense={onAddExpense} onDeleteExpense={onDeleteExpense} />}
      {activeTab === 'settings' && <BarberSettingsView barberShop={barberShop} onUpdateServices={onUpdateServices} onUploadLogo={onUploadLogo} />}
      
      <PoweredByFooter />
    </div>

    <BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
    </>
  );
};
