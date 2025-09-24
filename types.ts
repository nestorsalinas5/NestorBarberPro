
import type { User as AuthUser } from '@supabase/supabase-js';

export type { AuthUser };

// Profile table matches our custom public.profiles table
export interface Profile {
  id: string; // Foreign key to auth.users.id
  role: 'Admin' | 'Barber';
  barber_shop_id?: string | null; // Foreign key to barber_shops.id
}

export interface Service {
  id: number;
  name: string;
  duration: number; // in minutes
  price: number;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

// Booking table matches public.bookings
export interface Booking {
  id: string;
  barber_shop_id: string;
  service: Service[]; // Changed to accept multiple services
  date: string; // Stored as 'YYYY-MM-DD'
  time: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  status: 'Confirmada' | 'Completada' | 'Cancelada';
  created_at: string;
}

export interface ScheduleConfig {
  weekdayConfig: {
    startTime: string; // "HH:mm" format for precision
    endTime: string;   // "HH:mm" format
    slotInterval: number; // in minutes
  };
  weekendConfig: {
    slotsCount: number;
    startTime: string; // "HH:mm" format
  };
}

// NEW: Promotion for marketing
export interface Promotion {
  id: number;
  title: string;
  description: string;
}


// BarberShop table matches public.barber_shops
export interface BarberShop {
  id: string;
  name: string;
  slogan?: string;
  status: 'Activa' | 'Suspendida';
  services: Service[];
  schedule: ScheduleConfig;
  created_at: string;
  license_type: 'Trial' | 'Mensual' | 'Anual' | null;
  license_expires_at: string | null;
  logo_url?: string | null;
  promotions?: Promotion[] | null;
  // FIX: Renamed theme properties to match database schema (color_primario, color_secundario)
  color_primario?: string | null;
  color_secundario?: string | null;
}

// Type for the admin view, combining BarberShop with user info from an RPC call
export interface BarberShopWithUser extends BarberShop {
  user_email: string | null;
}

// NEW: Client table matches public.clients
export interface Client {
  id: string;
  barber_shop_id: string;
  name: string;
  email: string;
  phone?: string | null;
  total_bookings: number;
  last_visit?: string | null;
  created_at: string;
}

// NEW: Expense table matches public.expenses
export interface Expense {
  id: string;
  barber_shop_id: string;
  description: string;
  amount: number;
  category?: string | null;
  date: string;
  created_at: string;
}

// NEW: Product table for inventory
export interface Product {
  id: string;
  barber_shop_id: string;
  name: string;
  description?: string | null;
  price: number;
  stock_quantity: number;
  created_at: string;
}
