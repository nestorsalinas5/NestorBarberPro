

import React from 'react';
import type { BarberShopWithUser } from '../types';

interface BarberShopListItemProps {
  barberShop: BarberShopWithUser;
  onUpdateStatus: (shopId: string, status: BarberShopWithUser['status']) => void;
  onManageLicense: (shop: BarberShopWithUser) => void;
  onManageTheme: (shop: BarberShopWithUser) => void;
  onDelete: (shop: BarberShopWithUser) => void;
}

const statusStyles: Record<BarberShopWithUser['status'], { indicator: string, text: string }> = {
  'Activa': { indicator: 'bg-green-500', text: 'text-green-400' },
  'Suspendida': { indicator: 'bg-red-500', text: 'text-red-400' },
};

export const BarberShopListItem: React.FC<BarberShopListItemProps> = ({ barberShop, onUpdateStatus, onManageLicense, onManageTheme, onDelete }) => {
  const { indicator, text } = statusStyles[barberShop.status];
  const isSuspended = barberShop.status === 'Suspendida';

  const getLicenseStatus = () => {
    if (!barberShop.license_type || !barberShop.license_expires_at) {
        return { text: 'Sin Licencia', color: 'text-yellow-500' };
    }
    const expires = new Date(barberShop.license_expires_at);
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const formattedDate = expires.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    if (expires < now) {
        return { text: `Expiró el ${formattedDate}`, color: 'text-red-400' };
    }
    if (expires < sevenDaysFromNow) {
        return { text: `Expira el ${formattedDate}`, color: 'text-yellow-500' };
    }
    return { text: `${barberShop.license_type} - Vence ${formattedDate}`, color: 'text-green-400' };
  };

  const licenseStatus = getLicenseStatus();

  return (
    <div className="bg-black/20 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors hover:bg-black/40">
      <div className="flex-grow">
        <div className="flex items-center gap-4">
            <p className="font-bold text-lg text-brand-text">{barberShop.name}</p>
            {barberShop.color_primario && <span className="h-4 w-4 rounded-full" style={{ backgroundColor: barberShop.color_primario }}></span>}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`h-2 w-2 rounded-full ${indicator}`}></span>
          <span className={`text-xs font-semibold ${text}`}>{barberShop.status}</span>
        </div>
        {barberShop.user_email ? (
           <p className="text-xs text-brand-text-secondary mt-2 pl-1">{barberShop.user_email}</p>
        ) : (
           <p className="text-xs text-yellow-500 mt-2 pl-1">Sin usuario asignado</p>
        )}
         <p className={`text-xs mt-1 pl-1 font-semibold ${licenseStatus.color}`}>
            {licenseStatus.text}
        </p>
      </div>
      <div className="w-full sm:w-auto self-end sm:self-center flex items-center flex-wrap gap-2">
        <button
            onClick={() => onManageLicense(barberShop)}
            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 transition-colors"
        >
            Licencia
        </button>
         <button
            onClick={() => onManageTheme(barberShop)}
            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-purple-500/20 text-purple-300 hover:bg-purple-500/40 transition-colors"
        >
            Personalizar
        </button>
        {isSuspended ? (
          <button
            onClick={() => onUpdateStatus(barberShop.id, 'Activa')}
            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-green-500/20 text-green-300 hover:bg-green-500/40 transition-colors"
          >
            Reactivar
          </button>
        ) : (
          <button
            onClick={() => onUpdateStatus(barberShop.id, 'Suspendida')}
            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-red-500/20 text-red-300 hover:bg-red-500/40 transition-colors"
          >
            Suspender
          </button>
        )}
        <button
            onClick={() => onDelete(barberShop)}
            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gray-600/20 text-gray-400 hover:bg-red-500/40 hover:text-red-300 transition-colors"
        >
            Eliminar
        </button>
      </div>
    </div>
  );
};
