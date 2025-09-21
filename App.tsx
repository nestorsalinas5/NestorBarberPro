import { useState, useEffect } from 'react';
import type { Booking, BarberShop, Service, Profile } from './types';
import { BarberShopHeader } from './components/BarberShopHeader';
import { ClientBookingView } from './components/ClientBookingView';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { BarberDashboard } from './components/BarberDashboard';
import { supabase } from './services/supabaseClient';
import * as authService from './services/auth';
import type { Session, User as AuthUser } from '@supabase/supabase-js';


function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [barberShops, setBarberShops] = useState<BarberShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'booking' | 'login'>('booking');

  useEffect(() => {
    const fetchInitialData = async (user: AuthUser | null) => {
      setIsLoading(true);
      
      const { data: shopsData, error: shopsError } = await supabase
        .from('barber_shops')
        .select('*');
      if (shopsError) console.error('Error fetching barber shops:', shopsError);
      else setBarberShops(shopsData || []);

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*');
      if (bookingsError) console.error('Error fetching bookings:', bookingsError);
      else setBookings(bookingsData as Booking[] || []);

      if (user) {
        const userProfile = await authService.getUserProfile(user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      
      setIsLoading(false);
    };

    authService.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchInitialData(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setSession(session);
        fetchInitialData(session?.user ?? null);
        if (!session) setView('booking');
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await authService.signOut();
    setView('booking');
  };

  const handleNavigateToLogin = () => setView('login');

  const handleBookingConfirmed = async (bookingData: Omit<Booking, 'id' | 'status' | 'created_at'>) => {
    const { data, error } = await supabase.from('bookings').insert([bookingData]).select();
    if (error) {
      console.error('Error creating booking:', error);
    } else if (data) {
      setBookings(prev => [...prev, data[0] as Booking]);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select();
    if (error) {
      console.error('Error updating booking status:', error);
    } else if (data) {
      setBookings(prev => prev.map(b => (b.id === bookingId ? (data[0] as Booking) : b)));
    }
  };

  const handleAddBarberShop = async (name: string) => {
    const newShopData = { name, status: 'Activa' as const, services: [], schedule: { weekdayConfig: { startHour: 9, endHour: 18, slotInterval: 30 }, weekend_slots_count: 20 } };
    const { data, error } = await supabase.from('barber_shops').insert([newShopData]).select();
    if (error) console.error('Error adding barber shop:', error);
    else if (data) setBarberShops(prev => [...prev, data[0]]);
  };

  const handleUpdateBarberShopStatus = async (shopId: string, status: BarberShop['status']) => {
    const { data, error } = await supabase.from('barber_shops').update({ status }).eq('id', shopId).select();
    if (error) console.error('Error updating shop status:', error);
    else if (data) setBarberShops(prev => prev.map(s => (s.id === shopId ? data[0] : s)));
  };

  const handleUpdateBarberShopServices = async (shopId: string, updatedServices: Service[]) => {
    const { data, error } = await supabase.from('barber_shops').update({ services: updatedServices }).eq('id', shopId).select();
    if (error) console.error('Error updating services:', error);
    else if (data) setBarberShops(prev => prev.map(s => (s.id === shopId ? data[0] : s)));
  };

  const activeShopForClient = barberShops.find(s => s.status === 'Activa');
  const loggedInBarberShop = barberShops.find(s => s.id === profile?.barber_shop_id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
            Cargando NestorBarberPro...
          </h1>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (session && profile) { // User is logged in
      if (profile.role === 'Admin') {
        return <AdminDashboard 
                 barberShops={barberShops}
                 onAddBarberShop={handleAddBarberShop}
                 onUpdateBarberShopStatus={handleUpdateBarberShopStatus}
               />;
      }
      if (profile.role === 'Barber' && loggedInBarberShop) {
        return <BarberDashboard
                 barberShop={loggedInBarberShop}
                 bookings={bookings.filter(b => b.barber_shop_id === loggedInBarberShop.id)}
                 onUpdateBookingStatus={handleUpdateBookingStatus}
                 onUpdateServices={handleUpdateBarberShopServices}
               />;
      }
      return <div className="text-center p-8"><p>Error: Rol de usuario no reconocido o barbería no asignada.</p></div>;
    }
    
    // User is not logged in
    if (view === 'login') {
      return <LoginPage />;
    }

    if (activeShopForClient) {
      return <ClientBookingView 
               barberShop={activeShopForClient}
               bookings={bookings.filter(b => b.barber_shop_id === activeShopForClient.id)} 
               onBookingConfirmed={handleBookingConfirmed} 
             />;
    }
    
    return (
      <div className="text-center p-16 bg-brand-surface rounded-lg">
        <h2 className="text-2xl font-bold text-brand-primary">No hay barberías disponibles</h2>
        <p className="text-brand-text-secondary mt-2">Por favor, vuelva a intentarlo más tarde.</p>
      </div>
    );
  };
  
  return (
    <div className="bg-brand-bg text-brand-text min-h-screen font-sans">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <BarberShopHeader 
          user={session?.user ?? null}
          onNavigateToLogin={handleNavigateToLogin}
          onLogout={handleLogout}
          barberShopName={activeShopForClient?.name}
          slogan={activeShopForClient?.slogan}
        />
        <div className="mt-8">{renderContent()}</div>
      </main>
    </div>
  );
}

export default App;
