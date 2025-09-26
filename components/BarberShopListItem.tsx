import React from 'react';
import type { BarberShopWithUser } from '../types';

interface BarberShopListItemProps {
  barberShop: BarberShopWithUser;
  onUpdateStatus: (shopId: string, status: BarberShopWithUser['status']) => void;
  onManageLicense: (shop: BarberShopWithUser) => void;
  onDelete: (shop: BarberShopWithUser) => void;
}

const statusStyles: Record<BarberShopWithUser['status'], { indicator: string, text: string }> = {
  'Activa': { indicator: 'bg-green-500', text: 'text-green-700' },
  'Suspendida': { indicator: 'bg-red-500', text: 'text-red-600' },
};

export const BarberShopListItem: React.FC<BarberShopListItemProps> = ({ barberShop, onUpdateStatus, onManageLicense, onDelete }) => {
  const { indicator, text } = statusStyles[barberShop.status];
  const isSuspended = barberShop.status === 'Suspendida';

  const getLicenseStatus = () => {
    if (!barberShop.license_type || !barberShop.license_expires_at) {
        return { text: 'Sin Licencia', color: 'text-yellow-600' };
    }
    const expires = new Date(barberShop.license_expires_at);
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const formattedDate = expires.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    if (expires < now) {
        return { text: `Expiró el ${formattedDate}`, color: 'text-red-600' };
    }
    if (expires < sevenDaysFromNow) {
        return { text: `Expira el ${formattedDate}`, color: 'text-yellow-600' };
    }
    return { text: `${barberShop.license_type} - Vence ${formattedDate}`, color: 'text-green-700' };
  };

  const licenseStatus = getLicenseStatus();

  return (
    <div className="bg-white p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors hover:bg-gray-50 border border-transparent hover:border-gray-200">
      <div className="flex-grow">
        <p className="font-bold text-lg text-brand-dark-charcoal">{barberShop.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`h-2 w-2 rounded-full ${indicator}`}></span>
          <span className={`text-xs font-semibold ${text}`}>{barberShop.status}</span>
        </div>
        {barberShop.user_email ? (
           <p className="text-xs text-brand-dark-charcoal/70 mt-2 pl-1">{barberShop.user_email}</p>
        ) : (
           <p className="text-xs text-yellow-600 mt-2 pl-1">Sin usuario asignado</p>
        )}
         <p className={`text-xs mt-1 pl-1 font-semibold ${licenseStatus.color}`}>
            {licenseStatus.text}
        </p>
      </div>
      <div className="w-full sm:w-auto self-end sm:self-center flex items-center flex-wrap gap-2">
        <button
            onClick={() => onManageLicense(barberShop)}
            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
        >
            Licencia
        </button>
        {isSuspended ? (
          <button
            onClick={() => onUpdateStatus(barberShop.id, 'Activa')}
            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
          >
            Reactivar
          </button>
        ) : (
          <button
            onClick={() => onUpdateStatus(barberShop.id, 'Suspendida')}
            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors"
          >
            Suspender
          </button>
        )}
        <button
            onClick={() => onDelete(barberShop)}
            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gray-200 text-gray-700 hover:bg-red-200 hover:text-red-800 transition-colors"
        >
            Eliminar
        </button>
      </div>
    </div>
  );
};
