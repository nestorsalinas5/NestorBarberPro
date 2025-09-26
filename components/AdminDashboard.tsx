

import React, { useState } from 'react';
import type { BarberShop, BarberShopWithUser, Booking } from '../types';
import { BarberShopList } from './BarberShopList';
import { AddBarberShopModal } from './AddBarberShopModal';
import { LicenseModal } from './LicenseModal';
import { StatCard } from './StatCard';
import { PoweredByFooter } from './PoweredByFooter.tsx';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { ThemeEditModal } from './ThemeEditModal';
import { supabase } from '../services/supabaseClient';

interface AdminDashboardProps {
  barberShops: BarberShopWithUser[];
  bookings: Booking[];
  onAddBarberShopAndUser: (details: { name: string; email: string; password: string }) => Promise<void>;
  onUpdateBarberShopStatus: (shopId: string, status: BarberShopWithUser['status']) => Promise<void>;
  onUpdateBarberShopLicense: (shopId: string, license: { type: BarberShop['license_type']; expiresAt: string | null }) => Promise<void>;
  onDeleteBarberShop: (shopId: string, userId: string) => Promise<void>;
  onUpdateBarberShopTheme: (shopId: string, theme: { color_primario: string; color_secundario: string }) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ barberShops, bookings, onAddBarberShopAndUser, onUpdateBarberShopStatus, onUpdateBarberShopLicense, onDeleteBarberShop, onUpdateBarberShopTheme }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<BarberShopWithUser | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState<{ shopId: string; userId: string; shopName: string } | null>(null);


  const handleAddSubmit = async (details: { name: string; email: string; password: string }) => {
    await onAddBarberShopAndUser(details);
    setIsAddModalOpen(false);
  }

  const openLicenseModal = (shop: BarberShopWithUser) => {
    setSelectedShop(shop);
    setIsLicenseModalOpen(true);
  };

  const openThemeModal = (shop: BarberShopWithUser) => {
    setSelectedShop(shop);
    setIsThemeModalOpen(true);
  };

  const handleLicenseSubmit = async (license: { type: BarberShop['license_type']; expiresAt: string | null }) => {
    if (selectedShop) {
        await onUpdateBarberShopLicense(selectedShop.id, license);
        setIsLicenseModalOpen(false);
        setSelectedShop(null);
    }
  };
  
  const handleThemeSubmit = async (theme: { color_primario: string; color_secundario: string }) => {
    if (selectedShop) {
      await onUpdateBarberShopTheme(selectedShop.id, theme);
      setIsThemeModalOpen(false);
      setSelectedShop(null);
    }
  };

  const openDeleteModal = async (shop: BarberShopWithUser) => {
    // A robust way to get the user ID is to query the profiles table for the user associated with this shop.
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('barber_shop_id', shop.id)
      .single();
    
    if (error || !profile) {
      alert("Error: No se pudo encontrar el usuario asociado a esta barbería para eliminarlo. Puede que ya no exista.");
      return;
    }
    
    setShopToDelete({ shopId: shop.id, userId: profile.id, shopName: shop.name });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (shopToDelete) {
      await onDeleteBarberShop(shopToDelete.shopId, shopToDelete.userId);
    }
    setIsDeleteModalOpen(false);
    setShopToDelete(null);
  };

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
        <div className="bg-brand-surface rounded-lg shadow-2xl overflow-hidden p-6 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-700/50 pb-4 gap-4">
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
              className="bg-brand-primary text-brand-bg font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors w-full sm:w-auto"
            >
              + Añadir Barbería
            </button>
          </div>

          <BarberShopList 
            barberShops={barberShops} 
            onUpdateStatus={onUpdateBarberShopStatus} 
            onManageLicense={openLicenseModal}
            onManageTheme={openThemeModal}
            onDelete={openDeleteModal}
          />
        </div>
      </div>

      <PoweredByFooter />

      <AddBarberShopModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSubmit}
      />

      {selectedShop && (
        <LicenseModal
            isOpen={isLicenseModalOpen}
            onClose={() => setIsLicenseModalOpen(false)}
            onSave={handleLicenseSubmit}
            barberShop={selectedShop}
        />
      )}

      {selectedShop && (
          <ThemeEditModal
              isOpen={isThemeModalOpen}
              onClose={() => setIsThemeModalOpen(false)}
              onSave={handleThemeSubmit}
              barberShop={selectedShop}
          />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={shopToDelete?.shopName || ''}
      />
    </>
  );
};
