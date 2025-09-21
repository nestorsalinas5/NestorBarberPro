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
  service: Service;
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
    startHour: number;
    endHour: number;
    slotInterval: number;
  };
  weekend_slots_count: number;
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
}
