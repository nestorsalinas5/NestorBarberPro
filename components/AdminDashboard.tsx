import React, { useState } from 'react';
import type { BarberShopWithUser, Booking } from '../types';
import { BarberShopList } from './BarberShopList';
import { AddBarberShopModal } from './AddBarberShopModal';
import { StatCard } from './StatCard';

interface AdminDashboardProps {
  barberShops: BarberShopWithUser[];
  bookings: Booking[];
  onAddBarberShopAndUser: (details: { name: string; email: string; password: string }) => Promise<void>;
  onUpdateBarberShopStatus: (shopId: string, status: BarberShopWithUser['status']) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ barberShops, bookings, onAddBarberShopAndUser, onUpdateBarberShopStatus }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddSubmit = async (details: { name: string; email: string; password: string }) => {
    await onAddBarberShopAndUser(details);
    setIsAddModalOpen(false);
  }

  const totalShops = barberShops.length;
  const activeShops = barberShops.filter(s => s.status === 'Activa').length;
  const totalBookings = bookings.length;

  return (
    <>
      <div className="animate-fade-in">
        {/* Stats Dashboard */}
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-brand-text mb-4">Dashboard Global</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total de Barberías" value={totalShops.toString()} />
                <StatCard title="Barberías Activas" value={activeShops.toString()} />
                <StatCard title="Total de Reservas" value={totalBookings.toString()} />
            </div>
        </div>

        {/* Management Panel */}
        <div className="bg-brand-surface rounded-lg shadow-2xl overflow-hidden p-8">
          <div className="flex justify-between items-center mb-6 border-b border-gray-700/50 pb-4">
            <div>
              <h2 
                className="text-3xl font-bold text-brand-primary"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Panel de Administrador
              </h2>
              <p className="mt-1 text-brand-text-secondary">
                Gestiona todas las barberías de la plataforma.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-brand-primary text-brand-bg font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors"
            >
              + Añadir Barbería
            </button>
          </div>

          <BarberShopList 
            barberShops={barberShops} 
            onUpdateStatus={onUpdateBarberShopStatus} 
          />
        </div>
      </div>


      <AddBarberShopModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSubmit}
      />
    </>
  );
};
