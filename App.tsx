import { useState, useEffect } from 'react';
import type { Booking, BarberShop, Service, Profile, BarberShopWithUser } from './types';
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
  const [adminBarberShops, setAdminBarberShops] = useState<BarberShopWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'booking' | 'login'>('booking');

  const fetchClientData = async () => {
    const { data: shopsData, error: shopsError } = await supabase
      .from('barber_shops')
      .select('*')
      .eq('status', 'Activa');
    if (shopsError) console.error('Error fetching active barber shops:', shopsError);
    else setBarberShops(shopsData || []);
  };

  const fetchAdminData = async () => {
    const { data: shopsData, error: shopsError } = await supabase.rpc('get_barbershops_with_users');
    if (shopsError) console.error('Error fetching admin barber shops:', shopsError);
    else setAdminBarberShops(shopsData || []);

    const { data: bookingsData, error: bookingsError } = await supabase.from('bookings').select('*');
    if (bookingsError) console.error('Error fetching all bookings:', bookingsError);
    else setBookings(bookingsData as Booking[] || []);
  };

  const fetchBarberData = async (shopId: string) => {
    const { data: shopsData, error: shopsError } = await supabase.from('barber_shops').select('*').eq('id', shopId);
    if (shopsError) console.error('Error fetching barber shop:', shopsError);
    else setBarberShops(shopsData || []);

    const { data: bookingsData, error: bookingsError } = await supabase.from('bookings').select('*').eq('barber_shop_id', shopId);
    if (bookingsError) console.error('Error fetching barber bookings:', bookingsError);
    else setBookings(bookingsData as Booking[] || []);
  };


  useEffect(() => {
    const initializeApp = async (session: Session | null) => {
      setIsLoading(true);
      if (session?.user) {
        const userProfile = await authService.getUserProfile(session.user.id);
        setProfile(userProfile);
        if (userProfile?.role === 'Admin') {
          await fetchAdminData();
        } else if (userProfile?.role === 'Barber' && userProfile.barber_shop_id) {
          await fetchBarberData(userProfile.barber_shop_id);
        } else {
           await fetchClientData();
        }
      } else {
        setProfile(null);
        await fetchClientData();
      }
      setIsLoading(false);
    };

    authService.getSession().then(({ data: { session } }) => {
      setSession(session);
      initializeApp(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setSession(session);
        initializeApp(session);
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

  const handleAddBarberShopAndUser = async (details: { name: string; email: string; password: string }) => {
    const { error } = await supabase.rpc('create_barbershop_with_user', {
      shop_name: details.name,
      user_email: details.email,
      user_password: details.password
    });
    if (error) {
      console.error('Error creating barber shop and user:', error);
      alert(`Error: ${error.message}`);
    } else {
      // Refetch admin data to show the new shop
      await fetchAdminData();
    }
  };

  const handleUpdateBarberShopStatus = async (shopId: string, status: BarberShop['status']) => {
    const { data, error } = await supabase.from('barber_shops').update({ status }).eq('id', shopId).select().single();
    if (error) {
      console.error('Error updating shop status:', error);
    } else if (data) {
      setAdminBarberShops(prev => prev.map(s => (s.id === shopId ? { ...s, status: data.status } : s)));
    }
  };

  const handleUpdateBarberShopServices = async (shopId: string, updatedServices: Service[]) => {
    const { data, error } = await supabase.from('barber_shops').update({ services: updatedServices }).eq('id', shopId).select().single();
    if (error) {
      console.error('Error updating services:', error);
    } else if (data) {
      setBarberShops(prev => prev.map(s => (s.id === shopId ? data : s)));
    }
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
                 barberShops={adminBarberShops}
                 bookings={bookings}
                 onAddBarberShopAndUser={handleAddBarberShopAndUser}
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
      const clientBookings = bookings.filter(b => b.barber_shop_id === activeShopForClient.id)
      return <ClientBookingView 
               barberShop={activeShopForClient}
               bookings={clientBookings} 
               onBookingConfirmed={(bookingData) => handleBookingConfirmed({...bookingData, barber_shop_id: activeShopForClient.id})} 
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
