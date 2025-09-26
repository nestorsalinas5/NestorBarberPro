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
      <div className="text-center mb-16 mt-8">
        <h2 
            className="text-4xl md:text-6xl font-bold text-brand-light-beige font-serif"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}
        >
            Elige tu Estilo, Reserva tu Momento
        </h2>
        <p className="mt-4 text-brand-light-beige/80 tracking-wide text-md md:text-lg max-w-2xl mx-auto" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
            Selecciona una de nuestras barberías para comenzar y agenda tu cita en segundos.
        </p>
      </div>

      {barberShops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {barberShops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} onSelect={onSelectShop} />
          ))}
        </div>
      ) : (
        <div className="text-center p-16 bg-brand-light-beige/90 backdrop-blur-sm rounded-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-brand-dark-charcoal">Actualmente no hay barberías disponibles</h2>
            <p className="text-brand-dark-charcoal/80 mt-2">Por favor, revisa de nuevo más tarde.</p>
        </div>
      )}

      <PoweredByFooter />
    </div>
  );
};
