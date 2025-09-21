import React from 'react';
import type { BarberShopWithUser } from '../types';
import { BarberShopListItem } from './BarberShopListItem';

interface BarberShopListProps {
  barberShops: BarberShopWithUser[];
  onUpdateStatus: (shopId: string, status: BarberShopWithUser['status']) => void;
  onManageLicense: (shop: BarberShopWithUser) => void;
  onDelete: (shop: BarberShopWithUser) => void;
}

export const BarberShopList: React.FC<BarberShopListProps> = ({ barberShops, onUpdateStatus, onManageLicense, onDelete }) => {
  if (barberShops.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-brand-text-secondary">No hay barberías registradas.</p>
        <p className="text-sm text-gray-500">Usa el botón "+ Añadir Barbería" para empezar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {barberShops.map(shop => (
        <BarberShopListItem
          key={shop.id}
          barberShop={shop}
          onUpdateStatus={onUpdateStatus}
          onManageLicense={onManageLicense}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
