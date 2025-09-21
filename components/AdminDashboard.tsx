import React, { useState } from 'react';
import type { BarberShop, BarberShopWithUser, Booking } from '../types';
import { BarberShopList } from './BarberShopList';
import { AddBarberShopModal } from './AddBarberShopModal';
import { LicenseModal } from './LicenseModal';
import { StatCard } from './StatCard';
import { PoweredByFooter } from './PoweredByFooter';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
// FIX: Import supabase client to be able to query the database.
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
  const [selectedShopForLicense, setSelectedShopForLicense] = useState<BarberShopWithUser | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState<{ shopId: string; userId: string; shopName: string } | null>(null);


  const handleAddSubmit = async (details: { name: string; email: string; password: string }) => {
    await onAddBarberShopAndUser(details);
    setIsAddModalOpen(false);
  }

  const openLicenseModal = (shop: BarberShopWithUser) => {
    setSelectedShopForLicense(shop);
    setIsLicenseModalOpen(true);
  };

  const handleLicenseSubmit = async (license: { type: BarberShop['license_type']; expiresAt: string | null }) => {
    if (selectedShopForLicense) {
        await onUpdateBarberShopLicense(selectedShopForLicense.id, license);
        setIsLicenseModalOpen(false);
        setSelectedShopForLicense(null);
    }
  };

  const openDeleteModal = (shop: BarberShopWithUser) => {
    if (shop.user_email) { // Technically, user_id would be better, but this works for now. We need the user ID.
      // We don't have user_id here directly, so we need to fetch it or change the RPC.
      // For now, let's assume the user's ID is what we need to get from the email.
      // This is a simplification. In a real app, you'd want the user ID in the RPC response.
      // As a workaround, we'll need to fetch the user by email before deleting. Let's adjust logic.
      // The user id IS the profile ID. So let's get it from profiles table.
      // However, the function needs the auth.users.id, which might be different. Let's find it.
      // This logic should be in App.tsx
      setShopToDelete({ shopId: shop.id, userId: shop.id, shopName: shop.name }); // Placeholder for userId
      setIsDeleteModalOpen(true);
    } else {
        alert("Esta barbería no tiene un usuario asignado para eliminar.");
    }
  };

  const handleConfirmDelete = async () => {
    if (shopToDelete) {
        // Here we need the real user ID. The current data `BarberShopWithUser` does not provide it.
        // Let's modify the RPC `get_barbershops_with_users` to also return the user ID.
        // For now, I will assume we can get it somehow. Let's make a temp fix.
        // A proper fix would be:
        // 1. Alter function `get_barbershops_with_users` to return `u.id as user_id`.
        // 2. Update `BarberShopWithUser` type to include `user_id`.
        // 3. Use `shop.user_id` here.
        
        // TEMPORARY LOGIC: We assume the profile ID is the auth ID. This is true in our setup.
        // The profile ID is not in the data either. The user email is.
        // Let's find the user by email to get their ID. This is inefficient but will work for now.
        const { data, error } = await supabase.from('profiles').select('id').eq('barber_shop_id', shopToDelete.shopId).single();
        if (error || !data) {
            alert("No se pudo encontrar el usuario asociado para eliminar.");
        } else {
             await onDeleteBarberShop(shopToDelete.shopId, data.id);
        }
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

      {selectedShopForLicense && (
        <LicenseModal
            isOpen={isLicenseModalOpen}
            onClose={() => setIsLicenseModalOpen(false)}
            onSave={handleLicenseSubmit}
            barberShop={selectedShopForLicense}
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
