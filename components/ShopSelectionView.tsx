import React from 'react';
import type { BarberShop } from '../types';
import { ShopCard } from './ShopCard';
import { PoweredByFooter } from './PoweredByFooter';

interface ShopSelectionViewProps {
  barberShops: BarberShop[];
  onSelectShop: (shopId: string) => void;
}

export const ShopSelectionView: React.FC<ShopSelectionViewProps> = ({ barberShops, onSelectShop }) => {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <h2 
            className="text-3xl font-bold text-brand-light-beige font-serif"
        >
            - BARBER SHOP -
        </h2>
        <p className="mt-2 text-brand-light-beige/80 tracking-widest text-sm uppercase">
            Booking Apps
        </p>
      </div>

      {barberShops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {barberShops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} onSelect={onSelectShop} />
          ))}
        </div>
      ) : (
        <div className="text-center p-16 bg-brand-light-beige rounded-lg">
            <h2 className="text-2xl font-bold text-brand-dark-charcoal">No hay barberías disponibles</h2>
            <p className="text-brand-dark-charcoal/80 mt-2">Por favor, vuelva a intentarlo más tarde.</p>
        </div>
      )}

      <PoweredByFooter />
    </div>
  );
};
