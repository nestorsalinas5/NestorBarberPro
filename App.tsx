import { useState } from 'react';
import type { User, Role, Booking, BarberShop, Service } from './types';
import { BarberShopHeader } from './components/BarberShopHeader';
import { ClientBookingView } from './components/ClientBookingView';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { BarberDashboard } from './components/BarberDashboard';
import { initialBarberShopsData, initialBookingsData } from './constants';


function App() {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(initialBookingsData);
  const [barberShops, setBarberShops] = useState<BarberShop[]>(initialBarberShopsData);
  const [currentPage, setCurrentPage] = useState<'booking' | 'login' | 'dashboard'>('booking');

  const handleLogin = (role: Role) => {
    // In a real app, user would be associated with a specific barber shop
    const loggedInUser: User = {
      name: role === 'Admin' ? 'Admin User' : 'Barbero Nestor',
      role: role,
      barberShopId: role === 'Barber' ? 'BS-1' : undefined,
    };
    setUser(loggedInUser);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('booking');
  };

  const handleNavigateToLogin = () => {
    setCurrentPage('login');
  };

  const handleBookingConfirmed = (bookingData: Omit<Booking, 'id' | 'status'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: `BK-${Date.now()}`, // Simple unique ID generation
      status: 'Confirmada',
    };
    setBookings(prevBookings => [...prevBookings, newBooking]);
    // The UI will show a confirmation modal, and the user can reset the flow from there.
  };

  const handleUpdateBookingStatus = (bookingId: string, status: Booking['status']) => {
    setBookings(prevBookings =>
      prevBookings.map(b => (b.id === bookingId ? { ...b, status } : b))
    );
  };

  const handleAddBarberShop = (name: string) => {
    const newShop: BarberShop = {
      id: `BS-${Date.now()}`,
      name,
      status: 'Activa',
      services: [], // Start with no services
      schedule: { // Default schedule
        weekdayConfig: { startHour: 9, endHour: 18, slotInterval: 30 },
        weekendSlots: 20
      }
    };
    setBarberShops(prevShops => [...prevShops, newShop]);
  };

  const handleUpdateBarberShopStatus = (shopId: string, status: BarberShop['status']) => {
    setBarberShops(prevShops => 
      prevShops.map(s => s.id === shopId ? { ...s, status } : s)
    );
  };
  
  const handleUpdateBarberShopServices = (shopId: string, updatedServices: Service[]) => {
    setBarberShops(prevShops => 
      prevShops.map(s => s.id === shopId ? { ...s, services: updatedServices } : s)
    );
  };

  // For client view, find the first active barber shop to display
  const activeShopForClient = barberShops.find(s => s.status === 'Activa');
  
  // For barber view, find the shop associated with the logged-in user
  const loggedInBarberShop = barberShops.find(s => s.id === user?.barberShopId);

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen font-sans">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <BarberShopHeader 
          user={user}
          onNavigateToLogin={handleNavigateToLogin}
          onLogout={handleLogout}
          barberShopName={activeShopForClient?.name}
          slogan={activeShopForClient?.slogan}
        />
        <div className="mt-8">
          {currentPage === 'booking' && activeShopForClient && (
            <ClientBookingView 
              barberShop={activeShopForClient}
              bookings={bookings} 
              onBookingConfirmed={handleBookingConfirmed} 
            />
          )}
          {currentPage === 'booking' && !activeShopForClient && (
             <div className="text-center p-16 bg-brand-surface rounded-lg">
                <h2 className="text-2xl font-bold text-brand-primary">No hay barberías disponibles</h2>
                <p className="text-brand-text-secondary mt-2">Por favor, vuelva a intentarlo más tarde.</p>
            </div>
          )}
          {currentPage === 'login' && (
            <LoginPage onLogin={handleLogin} />
          )}
          {currentPage === 'dashboard' && user?.role === 'Admin' && (
            <AdminDashboard 
              barberShops={barberShops}
              onAddBarberShop={handleAddBarberShop}
              onUpdateBarberShopStatus={handleUpdateBarberShopStatus}
            />
          )}
          {currentPage === 'dashboard' && user?.role === 'Barber' && loggedInBarberShop && (
            <BarberDashboard 
              barberShop={loggedInBarberShop}
              bookings={bookings} 
              onUpdateBookingStatus={handleUpdateBookingStatus} 
              onUpdateServices={handleUpdateBarberShopServices}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
