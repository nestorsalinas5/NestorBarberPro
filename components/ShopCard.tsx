import React from 'react';
import type { BarberShop } from '../types';

interface ShopCardProps {
  shop: BarberShop;
  onSelect: (shopId: string) => void;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop, onSelect }) => {
  return (
    <div className="bg-brand-light-beige/90 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col text-center">
      <div className="p-8 flex-grow flex flex-col items-center justify-center">
         {shop.logo_url && (
            <img src={shop.logo_url} alt={`${shop.name} logo`} className="h-24 w-24 rounded-full object-cover mb-5 border-4 border-white/20 shadow-md" />
          )}
        <h3 
            className="text-2xl font-bold text-brand-dark-charcoal font-serif"
        >
            {shop.name}
        </h3>
        {shop.slogan && <p className="mt-2 text-brand-dark-charcoal/70 text-sm">{shop.slogan}</p>}
      </div>
      <div className="p-4 bg-black/10">
        <button
          onClick={() => onSelect(shop.id)}
          className="w-full border-2 border-brand-gold bg-brand-gold text-brand-dark-charcoal font-bold py-3 px-4 rounded-lg hover:bg-transparent hover:text-brand-gold transition-colors duration-300"
        >
          Reservar Ahora
        </button>
      </div>
    </div>
  );
};
