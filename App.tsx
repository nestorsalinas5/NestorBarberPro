
import { useState, useEffect, useCallback } from 'react';
import type { Booking, BarberShop, Service, Profile, BarberShopWithUser, Client, Expense, ScheduleConfig, Product, Promotion } from './types';
import { BarberShopHeader } from './components/BarberShopHeader';
import { ClientBookingView } from './components/ClientBookingView';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { BarberDashboard } from './components/BarberDashboard';
import { ShopSelectionView } from './components/ShopSelectionView';
import { supabase } from './services/supabaseClient';
import * as authService from './services/auth';
import type { Session } from '@supabase/supabase-js';


function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [barberShops, setBarberShops] = useState<BarberShop[]>([]);
  const [adminBarberShops, setAdminBarberShops] = useState<BarberShopWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'booking' | 'login'>('booking');
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

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

  const fetchBarberData = useCallback(async (shopId: string): Promise<BarberShop | null> => {
    // Fetch barber shop details
    const { data: shopData, error: shopError } = await supabase.from('barber_shops').select('*').eq('id', shopId).single();
    if (shopError) { console.error('Error fetching barber shop:', shopError); return null; }
    
    setBarberShops([shopData]);

    // Fetch bookings for the shop
    const { data: bookingsData, error: bookingsError } = await supabase.from('bookings').select('*').eq('barber_shop_id', shopId);
    if (bookingsError) console.error('Error fetching barber bookings:', bookingsError);
    else setBookings(bookingsData as Booking[] || []);
    
    // Fetch clients for the shop
    const { data: clientsData, error: clientsError } = await supabase.from('clients').select('*').eq('barber_shop_id', shopId);
    if (clientsError) console.error('Error fetching clients:', clientsError);
    else setClients(clientsData || []);

    // Fetch expenses for the shop
    const { data: expensesData, error: expensesError } = await supabase.from('expenses').select('*').eq('barber_shop_id', shopId);
    if (expensesError) console.error('Error fetching expenses:', expensesError);
    else setExpenses(expensesData || []);

     // Fetch products for the shop
    const { data: productsData, error: productsError } = await supabase.from('productos').select('*').eq('barber_shop_id', shopId);
    if (productsError) console.error('Error fetching products:', productsError);
    else setProducts(productsData || []);

    return shopData;
  }, []);


  useEffect(() => {
    const initializeApp = async (session: Session | null) => {
      setIsLoading(true);
      if (session?.user) {
        setSelectedShopId(null);
        const userProfile = await authService.getUserProfile(session.user.id);
        setProfile(userProfile);

        if (userProfile?.role === 'Admin') {
          await fetchAdminData();
        } else if (userProfile?.role === 'Barber' && userProfile.barber_shop_id) {
          const barberShop = await fetchBarberData(userProfile.barber_shop_id);
          
          // CRITICAL: Security check for license and status
          if (barberShop) {
            const isSuspended = barberShop.status === 'Suspendida';
            const licenseExpired = barberShop.license_expires_at ? new Date(barberShop.license_expires_at) < new Date() : true;
            
            if (isSuspended) {
              alert('Tu cuenta ha sido suspendida. Por favor, contacta al administrador.');
              await authService.signOut();
            } else if (licenseExpired) {
              alert('Tu licencia ha expirado. Por favor, contacta al administrador para renovarla.');
              await authService.signOut();
            }
          }

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
          setSelectedShopId(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchBarberData]);
  
  const loggedInBarberShop = barberShops.find(s => s.id === profile?.barber_shop_id);
  const clientSelectedShop = barberShops.find(s => s.id === selectedShopId);

  // THEME MANAGEMENT
  useEffect(() => {
    const activeShop = clientSelectedShop || loggedInBarberShop;
    const root = document.documentElement;
    if (activeShop?.primary_color) {
      root.style.setProperty('--color-primary', activeShop.primary_color);
      root.style.setProperty('--color-secondary', activeShop.secondary_color || activeShop.primary_color);
    } else {
      // Reset to default if no shop is active or if the shop has no custom color
      root.style.setProperty('--color-primary', '#D4AF37');
      root.style.setProperty('--color-secondary', '#F0C44D');
    }
  }, [clientSelectedShop, loggedInBarberShop]);


  const handleSelectShop = (shopId: string) => setSelectedShopId(shopId);
  const handleReturnToShopSelection = () => setSelectedShopId(null);
  const handleLogout = async () => { await authService.signOut(); setView('booking'); };
  const handleNavigateToLogin = () => setView('login');

  const handleBookingConfirmed = async (bookingData: Omit<Booking, 'id' | 'status' | 'created_at'>): Promise<boolean> => {
    const { data: functionData, error: functionError } = await supabase.functions.invoke('create-booking', {
      body: bookingData,
    });

    if (functionError || functionData.error) {
      const error = functionError || functionData.error;
      console.error('Error creating booking:', error);
      alert(`Error al crear la reserva: ${error.message || error}. Por favor, inténtalo de nuevo.`);
      return false;
    }

    if (functionData.success && functionData.booking) {
      const newBooking = functionData.booking as Booking;
      setBookings(prev => [...prev, newBooking]);
      
      // Refetch clients as a new one might have been created/updated
      if (profile?.role === 'Barber' && profile.barber_shop_id) {
          fetchBarberData(profile.barber_shop_id);
      }
      
      return true;
    }
    
    console.error("Unexpected response from create-booking function", functionData);
    alert("Se recibió una respuesta inesperada del servidor.");
    return false;
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    const { data, error } = await supabase.from('bookings').update({ status }).eq('id', bookingId).select().single();
    if (error) {
      console.error('Error updating booking status:', error);
      alert('Error al actualizar la reserva.');
    } else if (data) {
      setBookings(prev => prev.map(b => b.id === bookingId ? data as Booking : b));
      // After completing a booking, we should refetch clients to update their last_visit and total_bookings
      if (profile?.role === 'Barber' && profile.barber_shop_id) {
          fetchBarberData(profile.barber_shop_id);
      }
    }
  };
  
  // --- ADMIN HANDLERS ---
  const handleAddBarberShopAndUser = async (details: { name: string; email: string; password: string }) => {
    // This assumes a Supabase function named 'create-barbershop-with-user' exists.
    const { data, error } = await supabase.functions.invoke('create-barbershop-with-user', {
        body: details,
    });

    if (error || data?.error) {
        console.error('Error creating barbershop and user:', error || data.error);
        alert(`Error: ${error?.message || data.error}`);
    } else {
        alert('Barbería y usuario creados exitosamente.');
        fetchAdminData();
    }
  };
  
  const handleUpdateBarberShopStatus = async (shopId: string, status: BarberShop['status']) => {
    const { data, error } = await supabase.from('barber_shops').update({ status }).eq('id', shopId).select().single();
    if (error) {
      console.error('Error updating shop status:', error);
    } else if (data) {
      setAdminBarberShops(prev => prev.map(s => s.id === shopId ? { ...s, ...data } : s));
    }
  };

  const handleUpdateBarberShopLicense = async (shopId: string, license: { type: BarberShop['license_type']; expiresAt: string | null }) => {
    const { data, error } = await supabase.from('barber_shops').update({ license_type: license.type, license_expires_at: license.expiresAt }).eq('id', shopId).select().single();
     if (error) {
      console.error('Error updating license:', error);
    } else if (data) {
      setAdminBarberShops(prev => prev.map(s => s.id === shopId ? { ...s, ...data } : s));
    }
  };
  
  const handleDeleteBarberShop = async (shopId: string, userId: string) => {
    // This assumes a Supabase function named 'delete-barbershop-and-user' exists.
    const { error } = await supabase.functions.invoke('delete-barbershop-and-user', {
        body: { shopId, userId },
    });
    if (error) {
        alert(`Error al eliminar la barbería: ${error.message}`);
        console.error('Error deleting barbershop:', error);
    } else {
        alert('Barbería eliminada correctamente.');
        fetchAdminData();
    }
  };

  const handleUpdateBarberShopTheme = async (shopId: string, theme: { primary_color: string; secondary_color: string }) => {
    const { data, error } = await supabase.from('barber_shops').update(theme).eq('id', shopId).select().single();
    if (error) {
        console.error('Error updating theme:', error);
        alert('Error al actualizar el tema.');
    } else if (data) {
        setAdminBarberShops(prev => prev.map(s => s.id === shopId ? { ...s, ...data } : s));
        setBarberShops(prev => prev.map(s => s.id === shopId ? { ...s, ...data } as BarberShop : s));
    }
  };

  // --- BARBER HANDLERS ---
  const handleUpdateServices = async (shopId: string, services: Service[]) => {
    const { data, error } = await supabase.from('barber_shops').update({ services }).eq('id', shopId).select().single();
    if (error) console.error('Error updating services:', error);
    else if (data) setBarberShops(prev => prev.map(s => s.id === shopId ? data as BarberShop : s));
  };

  const handleUpdateSchedule = async (shopId: string, schedule: ScheduleConfig) => {
    const { data, error } = await supabase.from('barber_shops').update({ schedule }).eq('id', shopId).select().single();
    if (error) console.error('Error updating schedule:', error);
    else if (data) setBarberShops(prev => prev.map(s => s.id === shopId ? data as BarberShop : s));
  };
  
  const handleUploadLogo = async (file: File, shopId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${shopId}-${Math.random()}.${fileExt}`;
    const filePath = `logos/${fileName}`;
    
    const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, file, { upsert: true });

    if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        alert('Error al subir el logo.');
        return;
    }

    const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(filePath);

    const { data, error: dbError } = await supabase.from('barber_shops').update({ logo_url: publicUrl }).eq('id', shopId).select().single();
    if (dbError) {
        console.error('Error updating logo_url:', dbError);
        alert('Error al guardar la URL del logo.');
    } else if (data) {
        setBarberShops(prev => prev.map(s => s.id === shopId ? data as BarberShop : s));
    }
  };
  
  const handleAddExpense = async (expenseData: Omit<Expense, 'id' | 'created_at' | 'barber_shop_id'>) => {
    if (!profile?.barber_shop_id) return;
    const { data, error } = await supabase.from('expenses').insert({ ...expenseData, barber_shop_id: profile.barber_shop_id }).select().single();
    if (error) console.error('Error adding expense:', error);
    else if (data) setExpenses(prev => [...prev, data as Expense]);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
    if (error) console.error('Error deleting expense:', error);
    else setExpenses(prev => prev.filter(e => e.id !== expenseId));
  };
  
  const handleUpdateClient = async (clientData: Pick<Client, 'id' | 'name' | 'email' | 'phone'>) => {
    const { data, error } = await supabase.from('clients').update({ name: clientData.name, email: clientData.email, phone: clientData.phone }).eq('id', clientData.id).select().single();
    if (error) {
        console.error('Error updating client:', error);
        alert('Error al actualizar el cliente.');
    } else if (data) {
        setClients(prev => prev.map(c => c.id === clientData.id ? data as Client : c));
    }
  };

  const handleAddProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'barber_shop_id'>) => {
    if (!profile?.barber_shop_id) return;
    const { data, error } = await supabase.from('productos').insert({ ...productData, barber_shop_id: profile.barber_shop_id }).select().single();
    if (error) { console.error('Error adding product:', error); alert(`Error al añadir producto: ${error.message}`); }
    else if (data) setProducts(prev => [...prev, data as Product]);
  };

  const handleUpdateProduct = async (productData: Product) => {
    const { data, error } = await supabase.from('productos').update(productData).eq('id', productData.id).select().single();
    if (error) { console.error('Error updating product:', error); alert(`Error al actualizar producto: ${error.message}`); }
    else if (data) setProducts(prev => prev.map(p => p.id === productData.id ? data as Product : p));
  };

  const handleDeleteProduct = async (productId: string) => {
    const { error } = await supabase.from('productos').delete().eq('id', productId);
    if (error) { console.error('Error deleting product:', error); alert(`Error al eliminar producto: ${error.message}`); }
    else setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleUpdatePromotions = async (shopId: string, promotions: Promotion[]) => {
    const { data, error } = await supabase.from('barber_shops').update({ promotions }).eq('id', shopId).select().single();
    if (error) console.error('Error updating promotions:', error);
    else if (data) setBarberShops(prev => prev.map(s => s.id === shopId ? data as BarberShop : s));
  };


  // --- RENDER LOGIC ---
  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-8 text-brand-text-secondary">Cargando plataforma...</div>;
    }

    if (profile?.role === 'Admin') {
      return <AdminDashboard 
        barberShops={adminBarberShops} 
        bookings={bookings} 
        onAddBarberShopAndUser={handleAddBarberShopAndUser} 
        onUpdateBarberShopStatus={handleUpdateBarberShopStatus}
        onUpdateBarberShopLicense={handleUpdateBarberShopLicense}
        onDeleteBarberShop={handleDeleteBarberShop}
        onUpdateBarberShopTheme={handleUpdateBarberShopTheme}
      />;
    }

    if (profile?.role === 'Barber' && loggedInBarberShop) {
      return <BarberDashboard 
        barberShop={loggedInBarberShop} 
        bookings={bookings} 
        clients={clients}
        expenses={expenses}
        products={products}
        onUpdateBookingStatus={handleUpdateBookingStatus}
        onUpdateServices={handleUpdateServices}
        onUpdateSchedule={handleUpdateSchedule}
        onUploadLogo={handleUploadLogo}
        onAddExpense={handleAddExpense}
        onDeleteExpense={handleDeleteExpense}
        onUpdateClient={handleUpdateClient}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onUpdatePromotions={handleUpdatePromotions}
        onUpdateTheme={handleUpdateBarberShopTheme}
      />;
    }

    if (view === 'login') {
      return <LoginPage />;
    }

    if (clientSelectedShop) {
      return <ClientBookingView 
                barberShop={clientSelectedShop} 
                bookings={bookings.filter(b => b.barber_shop_id === selectedShopId)} 
                onBookingConfirmed={handleBookingConfirmed}
                onReturnToShopSelection={handleReturnToShopSelection}
              />;
    }
    
    return <ShopSelectionView barberShops={barberShops} onSelectShop={handleSelectShop} />;
  };

  const activeShop = clientSelectedShop || loggedInBarberShop;

  return (
    <div className="min-h-screen font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <BarberShopHeader 
          user={session?.user || null}
          onNavigateToLogin={handleNavigateToLogin}
          onLogout={handleLogout}
          barberShopName={activeShop?.name}
          slogan={activeShop?.slogan}
          logoUrl={activeShop?.logo_url}
        />
        <div className="mt-8 sm:mt-12">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
