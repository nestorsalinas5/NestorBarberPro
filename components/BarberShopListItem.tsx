import React from 'react';
import type { BarberShop } from '../types';

interface BarberShopListItemProps {
  barberShop: BarberShop;
  onUpdateStatus: (shopId: string, status: BarberShop['status']) => void;
}

const statusStyles: Record<BarberShop['status'], { indicator: string, text: string }> = {
  'Activa': { indicator: 'bg-green-500', text: 'text-green-400' },
  'Suspendida': { indicator: 'bg-red-500', text: 'text-red-400' },
};

export const BarberShopListItem: React.FC<BarberShopListItemProps> = ({ barberShop, onUpdateStatus }) => {
  const { indicator, text } = statusStyles[barberShop.status];
  const isSuspended = barberShop.status === 'Suspendida';

  return (
    <div className="bg-black/20 p-4 rounded-lg flex justify-between items-center transition-colors hover:bg-black/40">
      <div>
        <p className="font-bold text-lg text-brand-text">{barberShop.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`h-2 w-2 rounded-full ${indicator}`}></span>
          <span className={`text-xs font-semibold ${text}`}>{barberShop.status}</span>
        </div>
      </div>
      <div>
        {isSuspended ? (
          <button
            onClick={() => onUpdateStatus(barberShop.id, 'Activa')}
            className="px-3 py-1 text-xs font-semibold rounded-md bg-green-500/20 text-green-300 hover:bg-green-500/40 transition-colors"
          >
            Reactivar
          </button>
        ) : (
          <button
            onClick={() => onUpdateStatus(barberShop.id, 'Suspendida')}
            className="px-3 py-1 text-xs font-semibold rounded-md bg-red-500/20 text-red-300 hover:bg-red-500/40 transition-colors"
          >
            Suspender
          </button>
        )}
      </div>
    </div>
  );
};