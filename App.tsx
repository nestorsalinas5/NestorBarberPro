import { useState, useEffect } from 'react';
import type { Booking, BarberShop, Service, Profile, BarberShopWithUser } from './types';
import { BarberShopHeader } from './components/BarberShopHeader';
import { ClientBookingView } from './components/ClientBookingView';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { BarberDashboard } from './components/BarberDashboard';
import { ShopSelectionView } from './components/ShopSelectionView'; // Import the new component
import { supabase } from './services/supabaseClient';
import * as authService from './services/auth';
import type { Session } from '@supabase/supabase-js';


function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [barberShops, setBarberShops] = useState<BarberShop[]>([]);
  const [adminBarberShops, setAdminBarberShops] = useState<BarberShopWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'booking' | 'login'>('booking');
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null); // New state for client view

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
        setSelectedShopId(null); // Reset client selection on login
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
        if (!session) {
          setView('booking');
          setSelectedShopId(null); // Reset shop selection on logout
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);
  
  const handleSelectShop = (shopId: string) => setSelectedShopId(shopId);
  const handleReturnToShopSelection = () => setSelectedShopId(null);

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
    // Step 1: Create the user by calling the new, secure Edge Function
    const { data: functionData, error: functionError } = await supabase.functions.invoke('create-barber-user', {
        body: { email: details.email, password: details.password },
    });

    if (functionError) {
        console.error('Error invoking edge function:', functionError);
        alert(`Error al contactar el servidor para crear el usuario: ${functionError.message}`);
        return;
    }

    // The function itself might return an error in its data payload (e.g., user already exists)
    if (functionData.error) {
        console.error('Error from function:', functionData.error);
        alert(`Error al crear el usuario: ${functionData.error}`);
        return;
    }

    const newUserId = functionData.userId;
    if (!newUserId) {
        console.error('User creation successful but no ID was returned.');
        alert('Error inesperado: El usuario se creó pero no se recibió su ID.');
        return;
    }

    // Step 2: Create the barber shop
    const { data: newShop, error: shopError } = await supabase
      .from('barber_shops')
      .insert({
        name: details.name,
        status: 'Activa',
        license_type: 'Trial',
        license_expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        services: [],
        schedule: {
          weekdayConfig: { startHour: 9, endHour: 18, slotInterval: 30 },
          weekend_slots_count: 10
        }
      })
      .select('id')
      .single();

    if (shopError || !newShop) {
      console.error('Error creating barber shop:', shopError);
      alert(`Se creó el usuario pero hubo un error al crear la barbería: ${shopError?.message}. Por favor, asigna la barbería manualmente.`);
      return;
    }

    // Step 3: UPDATE the user's existing profile to link user and shop
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'Barber',
        barber_shop_id: newShop.id
      })
      .eq('id', newUserId);


    if (profileError) {
      console.error('Error updating profile:', profileError);
      alert(`Usuario y barbería creados, pero falló la asignación: ${profileError.message}. Por favor, asigna el perfil manualmente.`);
      return;
    }

    // Everything was successful, refetch data
    alert('Barbería y usuario creados y asignados con éxito.');
    await fetchAdminData();
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
    const { data, error } = await supabase
      .from('barber_shops')
      .update({ services: updatedServices })
      .eq('id', shopId)
      .select()
      .single();

    if (error) {
      console.error('Error updating services:', error);
      alert(`Error al guardar los cambios: ${error.message}. Es probable que falte una política de seguridad (RLS) para la actualización en tu base de datos.`);
    } else if (data) {
      const updatedShop = data as BarberShop;
      // Update both state lists to ensure consistency
      setBarberShops(prev => prev.map(s => (s.id === shopId ? updatedShop : s)));
      setAdminBarberShops(prev => prev.map(s => (s.id === shopId ? { ...s, ...updatedShop } : s)));
      alert('Servicios actualizados con éxito.');
    }
  };

  const handleUpdateBarberShopLicense = async (shopId: string, license: { type: BarberShop['license_type']; expiresAt: string | null }) => {
    const { data, error } = await supabase
      .from('barber_shops')
      .update({ license_type: license.type, license_expires_at: license.expiresAt })
      .eq('id', shopId)
      .select()
      .single();
    if (error) {
      console.error('Error updating shop license:', error);
    } else if (data) {
      // Update the local state to reflect the change immediately
      setAdminBarberShops(prev => prev.map(s => (s.id === shopId ? { ...s, license_type: data.license_type, license_expires_at: data.license_expires_at } : s)));
    }
  };

  const loggedInBarberShop = barberShops.find(s => s.id === profile?.barber_shop_id);
  const clientSelectedShop = barberShops.find(s => s.id === selectedShopId);

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
                 onUpdateBarberShopLicense={handleUpdateBarberShopLicense}
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
    
    // User is not logged in (Client View)
    if (view === 'login') {
      return <LoginPage />;
    }

    if (clientSelectedShop) {
      const clientBookings = bookings.filter(b => b.barber_shop_id === clientSelectedShop.id)
      return <ClientBookingView 
               barberShop={clientSelectedShop}
               bookings={clientBookings} 
               onBookingConfirmed={(bookingData) => handleBookingConfirmed({...bookingData, barber_shop_id: clientSelectedShop.id})}
               onReturnToShopSelection={handleReturnToShopSelection}
             />;
    }

    return <ShopSelectionView 
             barberShops={barberShops} 
             onSelectShop={handleSelectShop} 
           />;
  };
  
  return (
    <div className="bg-brand-bg text-brand-text min-h-screen font-sans">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <BarberShopHeader 
          user={session?.user ?? null}
          onNavigateToLogin={handleNavigateToLogin}
          onLogout={handleLogout}
          barberShopName={clientSelectedShop?.name || loggedInBarberShop?.name}
          slogan={clientSelectedShop?.slogan || loggedInBarberShop?.slogan}
        />
        <div className="mt-8">{renderContent()}</div>
      </main>
    </div>
  );
}

export default App;
