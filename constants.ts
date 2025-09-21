import type { Service, Booking, BarberShop } from './types';

// This file now exports initial data for mock purposes, not global constants.
// In a real app, this data would come from a database.

export const initialServicesData: Service[] = [
  { id: 1, name: 'Corte de Pelo Clásico', duration: 30, price: 70000 },
  { id: 2, name: 'Recorte y Perfilado de Barba', duration: 20, price: 50000 },
  { id: 3, name: 'Corte y Recorte de Barba', duration: 50, price: 110000 },
  { id: 4, name: 'Afeitado con Toalla Caliente', duration: 45, price: 90000 },
  { id: 5, name: 'Afeitado de Cabeza', duration: 30, price: 60000 },
];

export const initialBarberShopsData: BarberShop[] = [
  { 
    id: 'BS-1', 
    name: 'La Navaja Dorada', 
    slogan: 'Cortes de Precisión, Estilo Atemporal',
    status: 'Activa',
    services: initialServicesData,
    schedule: {
      weekdayConfig: { startHour: 9, endHour: 19, slotInterval: 30 },
      // FIX: Renamed 'weekendSlots' to 'weekend_slots_count' to match the ScheduleConfig type.
      weekend_slots_count: 20
    },
    // FIX: Added missing 'created_at' property to conform to the BarberShop type.
    created_at: new Date().toISOString(),
  },
  { 
    id: 'BS-2', 
    name: 'Corte & Estilo Urbano', 
    slogan: 'Tu look, tu flow.',
    status: 'Activa',
    services: [
      { id: 1, name: 'Corte Urbano', duration: 40, price: 80000 },
      { id: 2, name: 'Diseño de Barba', duration: 30, price: 60000 },
      { id: 3, name: 'Fade Profesional', duration: 50, price: 95000 },
    ],
    schedule: {
      weekdayConfig: { startHour: 10, endHour: 20, slotInterval: 20 },
      // FIX: Renamed 'weekendSlots' to 'weekend_slots_count' to match the ScheduleConfig type.
      weekend_slots_count: 25
    },
    // FIX: Added missing 'created_at' property to conform to the BarberShop type.
    created_at: new Date().toISOString(),
  },
  { 
    id: 'BS-3', 
    name: 'Barbería Tradicional', 
    slogan: 'El arte del afeitado clásico.',
    status: 'Suspendida',
    services: [
        { id: 1, name: 'Corte a Navaja', duration: 45, price: 85000 },
        { id: 2, name: 'Afeitado Real', duration: 50, price: 100000 },
    ],
    schedule: {
      weekdayConfig: { startHour: 8, endHour: 17, slotInterval: 30 },
      // FIX: Renamed 'weekendSlots' to 'weekend_slots_count' to match the ScheduleConfig type.
      weekend_slots_count: 15
    },
    // FIX: Added missing 'created_at' property to conform to the BarberShop type.
    created_at: new Date().toISOString(),
  },
];

export const initialBookingsData: Booking[] = [
  {
    id: 'BK-1',
    // FIX: Added missing 'barber_shop_id' and 'created_at' properties to conform to the Booking type.
    barber_shop_id: 'BS-1',
    service: initialServicesData[0],
    // FIX: Changed Date object to a 'YYYY-MM-DD' string to match the Booking type.
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    customer: { name: 'Juan Pérez', email: 'juan.perez@example.com' },
    status: 'Confirmada',
    created_at: new Date().toISOString(),
  },
  {
    id: 'BK-2',
    // FIX: Added missing 'barber_shop_id' and 'created_at' properties to conform to the Booking type.
    barber_shop_id: 'BS-1',
    service: initialServicesData[1],
    // FIX: Changed Date object to a 'YYYY-MM-DD' string to match the Booking type.
    date: new Date().toISOString().split('T')[0],
    time: '11:30',
    customer: { name: 'Carlos Gómez', email: 'carlos.gomez@example.com' },
    status: 'Confirmada',
    created_at: new Date().toISOString(),
  },
];
