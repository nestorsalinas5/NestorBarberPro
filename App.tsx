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
    const { data: productsData, error: productsError } = await supabase.from('products').select('*').eq('barber_shop_id', shopId);
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
    if (error) console.error('Error updating booking status:', error);
    else if (data) setBookings(prev => prev.map(b => (b.id === bookingId ? (data as Booking) : b)));
  };

  const handleAddBarberShopAndUser = async (details: { name: string; email: string; password: string }) => {
    const { data: functionData, error: functionError } = await supabase.functions.invoke('create-barber-user', { body: { email: details.email, password: details.password } });
    if (functionError || functionData.error) {
      console.error('Error creating user:', functionError || functionData.error);
      alert(`Error al crear el usuario: ${functionError?.message || functionData.error}`);
      return;
    }
    const newUserId = functionData.userId;
    if (!newUserId) { alert('Error inesperado: No se recibió el ID del nuevo usuario.'); return; }

    const newShopData = {
      name: details.name,
      status: 'Activa' as const,
      license_type: 'Trial' as const,
      license_expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      services: [],
      schedule: { 
        weekdayConfig: { startTime: "09:30", endTime: "19:30", slotInterval: 30 }, 
        weekendConfig: { slotsCount: 20, startTime: "08:20" } 
      }
    };

    const { data: newShop, error: shopError } = await supabase.from('barber_shops').insert(newShopData).select('id').single();
    if (shopError || !newShop) { alert(`Error al crear la barbería: ${shopError?.message}. Asigna la barbería manualmente.`); return; }

    const { error: profileError } = await supabase.from('profiles').update({ role: 'Barber', barber_shop_id: newShop.id }).eq('id', newUserId);
    if (profileError) { alert(`Error al asignar perfil: ${profileError.message}. Asigna el perfil manualmente.`); return; }
    
    alert('Barbería y usuario creados y asignados con éxito.');
    await fetchAdminData();
  };

  const handleDeleteBarberShopAndUser = async (shopId: string, userId: string) => {
    const { data, error } = await supabase.functions.invoke('delete-barber-user', {
      body: { shopId, userId },
    });

    if (error || data.error) {
      const err = error || data.error;
      console.error('Error deleting barber shop and user:', err);
      alert(`Error al eliminar: ${err.message || err}`);
      return;
    }
    alert('Barbería y usuario eliminados con éxito.');
    await fetchAdminData();
  };


  const handleUpdateBarberShopStatus = async (shopId: string, status: BarberShop['status']) => {
    const { data, error } = await supabase.from('barber_shops').update({ status }).eq('id', shopId).select().single();
    if (error) console.error('Error updating shop status:', error);
    else if (data) setAdminBarberShops(prev => prev.map(s => (s.id === shopId ? { ...s, status: data.status } : s)));
  };

  const handleUpdateBarberShopServices = async (shopId: string, updatedServices: Service[]) => {
    const { data, error } = await supabase.from('barber_shops').update({ services: updatedServices }).eq('id', shopId).select().single();
    if (error) { alert(`Error al guardar los cambios: ${error.message}.`); }
    else if (data) {
      const updatedShop = data as BarberShop;
      setBarberShops(prev => prev.map(s => (s.id === shopId ? updatedShop : s)));
      setAdminBarberShops(prev => prev.map(s => (s.id === shopId ? { ...s, ...updatedShop } : s)));
      alert('Servicios actualizados con éxito.');
    }
  };
  
  const handleUpdateBarberShopSchedule = async (shopId: string, schedule: ScheduleConfig) => {
    const { data, error } = await supabase.from('barber_shops').update({ schedule }).eq('id', shopId).select().single();
    if (error) { alert(`Error al guardar el horario: ${error.message}.`); }
    else if (data) {
      const updatedShop = data as BarberShop;
      setBarberShops(prev => prev.map(s => (s.id === shopId ? updatedShop : s)));
      setAdminBarberShops(prev => prev.map(s => (s.id === shopId ? { ...s, schedule: updatedShop.schedule } : s)));
      alert('Horario actualizado con éxito.');
    }
  };
  
  const handleUpdateBarberShopLicense = async (shopId: string, license: { type: BarberShop['license_type']; expiresAt: string | null }) => {
    const { data, error } = await supabase.from('barber_shops').update({ license_type: license.type, license_expires_at: license.expiresAt }).eq('id', shopId).select().single();
    if (error) console.error('Error updating shop license:', error);
    else if (data) setAdminBarberShops(prev => prev.map(s => (s.id === shopId ? { ...s, license_type: data.license_type, license_expires_at: data.license_expires_at } : s)));
  };
  
  const handleUploadLogo = async (file: File, shopId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${shopId}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, file, { upsert: true });
    if (uploadError) { alert(`Error al subir el logo: ${uploadError.message}`); return; }

    const { data } = supabase.storage.from('logos').getPublicUrl(filePath);
    const { data: updatedShop, error: updateError } = await supabase.from('barber_shops').update({ logo_url: data.publicUrl }).eq('id', shopId).select().single();
    if (updateError) { alert(`Error al guardar URL del logo: ${updateError.message}`); }
    else if (updatedShop) {
      setBarberShops(prev => prev.map(s => (s.id === shopId ? updatedShop : s)));
      alert('Logo actualizado con éxito.');
    }
  };

  const handleAddExpense = async (expenseData: Omit<Expense, 'id' | 'created_at' | 'barber_shop_id'>) => {
    if (!profile?.barber_shop_id) return;
    const { data, error } = await supabase.from('expenses').insert([{ ...expenseData, barber_shop_id: profile.barber_shop_id }]).select().single();
    if (error) { alert(`Error al añadir gasto: ${error.message}`); }
    else if (data) setExpenses(prev => [...prev, data]);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
    if (error) { alert(`Error al eliminar gasto: ${error.message}`); }
    else setExpenses(prev => prev.filter(e => e.id !== expenseId));
  };

  const handleUpdateClient = async (clientData: Pick<Client, 'id' | 'name' | 'email' | 'phone'>) => {
    const { data, error } = await supabase.from('clients').update({ name: clientData.name, email: clientData.email, phone: clientData.phone }).eq('id', clientData.id).select().single();
    if (error) { alert(`Error al actualizar cliente: ${error.message}`); }
    else if (data) {
      setClients(prev => prev.map(c => c.id === data.id ? data : c));
      alert('Cliente actualizado con éxito.');
    }
  };

  // Product Handlers
  const handleAddProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'barber_shop_id'>) => {
    if (!profile?.barber_shop_id) return;
    const { data, error } = await supabase.from('products').insert({ ...productData, barber_shop_id: profile.barber_shop_id }).select().single();
    if (error) { alert(`Error al añadir producto: ${error.message}`); }
    else if(data) { setProducts(prev => [...prev, data]); }
  };

  const handleUpdateProduct = async (productData: Product) => {
    const { data, error } = await supabase.from('products').update(productData).eq('id', productData.id).select().single();
     if (error) { alert(`Error al actualizar producto: ${error.message}`); }
    else if(data) { setProducts(prev => prev.map(p => p.id === data.id ? data : p)); }
  };

  const handleDeleteProduct = async (productId: string) => {
     const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) { alert(`Error al eliminar producto: ${error.message}`); }
    else { setProducts(prev => prev.filter(p => p.id !== productId)); }
  };

  // Promotion Handlers
  const handleUpdateBarberShopPromotions = async (shopId: string, updatedPromotions: Promotion[]) => {
    const { data, error } = await supabase.from('barber_shops').update({ promotions: updatedPromotions }).eq('id', shopId).select().single();
    if (error) { alert(`Error al guardar las promociones: ${error.message}.`); }
    else if (data) {
      const updatedShop = data as BarberShop;
      setBarberShops(prev => prev.map(s => (s.id === shopId ? updatedShop : s)));
      setAdminBarberShops(prev => prev.map(s => (s.id === shopId ? { ...s, promotions: updatedShop.promotions } : s)));
      alert('Promociones actualizadas con éxito.');
    }
  };

  // Theme Handlers
  const handleUpdateBarberShopTheme = async (shopId: string, theme: { primary_color: string; secondary_color: string }) => {
    const { data, error } = await supabase.from('barber_shops').update(theme).eq('id', shopId).select().single();
     if (error) { alert(`Error al guardar el tema: ${error.message}.`); }
    else if (data) {
      const updatedShop = data as BarberShop;
      setBarberShops(prev => prev.map(s => (s.id === shopId ? updatedShop : s)));
      setAdminBarberShops(prev => prev.map(s => (s.id === shopId ? { ...s, primary_color: updatedShop.primary_color, secondary_color: updatedShop.secondary_color } : s)));
      alert('Tema actualizado con éxito.');
    }
  };


  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><h1 className="text-3xl font-bold text-brand-primary" style={{ fontFamily: "'Playfair Display', serif" }}>Cargando NestorBarberPro...</h1></div>;
  }

  const renderContent = () => {
    if (session && profile) {
      if (profile.role === 'Admin') return <AdminDashboard barberShops={adminBarberShops} bookings={bookings} onAddBarberShopAndUser={handleAddBarberShopAndUser} onUpdateBarberShopStatus={handleUpdateBarberShopStatus} onUpdateBarberShopLicense={handleUpdateBarberShopLicense} onDeleteBarberShop={handleDeleteBarberShopAndUser} onUpdateBarberShopTheme={handleUpdateBarberShopTheme} />;
      if (profile.role === 'Barber' && loggedInBarberShop) return <BarberDashboard barberShop={loggedInBarberShop} bookings={bookings.filter(b => b.barber_shop_id === loggedInBarberShop.id)} clients={clients} expenses={expenses} products={products} onUpdateBookingStatus={handleUpdateBookingStatus} onUpdateServices={handleUpdateBarberShopServices} onUpdateSchedule={handleUpdateBarberShopSchedule} onUploadLogo={handleUploadLogo} onAddExpense={handleAddExpense} onDeleteExpense={handleDeleteExpense} onUpdateClient={handleUpdateClient} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} onUpdatePromotions={handleUpdateBarberShopPromotions} onUpdateTheme={handleUpdateBarberShopTheme} />;
      return <div className="text-center p-8"><p>Error: Rol de usuario no reconocido o barbería no asignada.</p></div>;
    }
    
    if (view === 'login') return <LoginPage />;
    if (clientSelectedShop) return <ClientBookingView barberShop={clientSelectedShop} bookings={bookings.filter(b => b.barber_shop_id === clientSelectedShop.id)} onBookingConfirmed={(bookingData) => handleBookingConfirmed({...bookingData, barber_shop_id: clientSelectedShop.id})} onReturnToShopSelection={handleReturnToShopSelection} />;
    return <ShopSelectionView barberShops={barberShops} onSelectShop={handleSelectShop} />;
  };
  
  return (
    <div className="bg-brand-bg text-brand-text min-h-screen font-sans">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <BarberShopHeader user={session?.user ?? null} onNavigateToLogin={handleNavigateToLogin} onLogout={handleLogout} barberShopName={clientSelectedShop?.name || loggedInBarberShop?.name} slogan={clientSelectedShop?.slogan || loggedInBarberShop?.slogan} logoUrl={clientSelectedShop?.logo_url || loggedInBarberShop?.logo_url} />
        <div className="mt-8">{renderContent()}</div>
      </main>
    </div>
  );
}

export default App;
