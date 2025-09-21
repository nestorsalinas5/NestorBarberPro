import React from 'react';
import type { BarberShop } from '../types';
import { ShopCard } from './ShopCard';
import { PoweredByFooter } from './PoweredByFooter.tsx';

interface ShopSelectionViewProps {
  barberShops: BarberShop[];
  onSelectShop: (shopId: string) => void;
}

export const ShopSelectionView: React.FC<ShopSelectionViewProps> = ({ barberShops, onSelectShop }) => {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <h2 
            className="text-3xl font-bold text-brand-primary"
            style={{ fontFamily: "'Playfair Display', serif" }}
        >
            Nuestras Barberías
        </h2>
        <p className="mt-2 text-brand-text-secondary">
            Selecciona una para ver sus servicios y agendar una cita.
        </p>
      </div>

      {barberShops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {barberShops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} onSelect={onSelectShop} />
          ))}
        </div>
      ) : (
        <div className="text-center p-16 bg-brand-surface rounded-lg">
            <h2 className="text-2xl font-bold text-brand-primary">No hay barberías disponibles</h2>
            <p className="text-brand-text-secondary mt-2">Por favor, vuelva a intentarlo más tarde.</p>
        </div>
      )}

      <PoweredByFooter />
    </div>
  );
};
