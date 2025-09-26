import React, { useState } from 'react';
import type { BarberShop, BarberShopWithUser, Booking } from '../types';
import { BarberShopList } from './BarberShopList';
import { AddBarberShopModal } from './AddBarberShopModal';
import { LicenseModal } from './LicenseModal';
import { StatCard } from './StatCard';
import { PoweredByFooter } from './PoweredByFooter.tsx';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { supabase } from '../services/supabaseClient';

interface AdminDashboardProps {
  barberShops: BarberShopWithUser[];
  bookings: Booking[];
  onAddBarberShopAndUser: (details: { name: string; email: string; password: string }) => Promise<void>;
  onUpdateBarberShopStatus: (shopId: string, status: BarberShopWithUser['status']) => Promise<void>;
  onUpdateBarberShopLicense: (shopId: string, license: { type: BarberShop['license_type']; expiresAt: string | null }) => Promise<void>;
  onDeleteBarberShop: (shopId: string, userId: string) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ barberShops, bookings, onAddBarberShopAndUser, onUpdateBarberShopStatus, onUpdateBarberShopLicense, onDeleteBarberShop }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
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

  const handleLicenseSubmit = async (license: { type: BarberShop['license_type']; expiresAt: string | null }) => {
    if (selectedShop) {
        await onUpdateBarberShopLicense(selectedShop.id, license);
        setIsLicenseModalOpen(false);
        setSelectedShop(null);
    }
  };
  
  const openDeleteModal = async (shop: BarberShopWithUser) => {
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
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-brand-light-beige mb-4">Dashboard Global</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total de Barberías" value={totalShops.toString()} />
                <StatCard title="Barberías Activas" value={activeShops.toString()} />
                <StatCard title="Total de Reservas" value={totalBookings.toString()} />
            </div>
        </div>

        <div className="bg-brand-light-beige text-brand-dark-charcoal rounded-lg shadow-2xl overflow-hidden p-6 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-brand-dark-charcoal/20 pb-4 gap-4">
            <div>
              <h2 
                className="text-3xl font-bold text-brand-dark-charcoal font-serif"
              >
                Panel de Administrador
              </h2>
              <p className="mt-1 text-brand-dark-charcoal/80">
                Gestiona todas las barberías de la plataforma.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-brand-dark-charcoal text-brand-light-beige font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors w-full sm:w-auto"
            >
              + Añadir Barbería
            </button>
          </div>

          <BarberShopList 
            barberShops={barberShops} 
            onUpdateStatus={onUpdateBarberShopStatus} 
            onManageLicense={openLicenseModal}
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

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={shopToDelete?.shopName || ''}
      />
    </>
  );
};
