import React, { useState } from 'react';
import type { BarberShop } from '../types';
import { BarberShopList } from './BarberShopList';
import { AddBarberShopModal } from './AddBarberShopModal';

interface AdminDashboardProps {
  barberShops: BarberShop[];
  onAddBarberShop: (name: string) => void;
  onUpdateBarberShopStatus: (shopId: string, status: BarberShop['status']) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ barberShops, onAddBarberShop, onUpdateBarberShopStatus }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddSubmit = (name: string) => {
    onAddBarberShop(name);
    setIsAddModalOpen(false);
  }

  return (
    <>
      <div className="bg-brand-surface rounded-lg shadow-2xl overflow-hidden p-8 animate-fade-in">
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

      <AddBarberShopModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSubmit}
      />
    </>
  );
};