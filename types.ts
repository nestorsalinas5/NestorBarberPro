export type Role = 'Admin' | 'Barber';

export interface User {
  name: string;
  role: Role;
  barberShopId?: string; // Associates a barber user with their shop
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

export interface Booking {
  id: string;
  service: Service;
  date: Date;
  time: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  status: 'Confirmada' | 'Completada' | 'Cancelada';
}

export interface ScheduleConfig {
  weekdayConfig: {
    startHour: number;
    endHour: number;
    slotInterval: number;
  },
  weekendSlots: number;
}

export interface BarberShop {
  id: string;
  name:string;
  slogan?: string;
  status: 'Activa' | 'Suspendida';
  services: Service[];
  schedule: ScheduleConfig;
}