import React from 'react';
import type { BarberShop } from '../types';

interface ShopCardProps {
  shop: BarberShop;
  onSelect: (shopId: string) => void;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop, onSelect }) => {
  return (
    <div className="bg-brand-light-beige rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col text-center">
      <div className="p-8 flex-grow flex flex-col items-center justify-center">
         {shop.logo_url && (
            <img src={shop.logo_url} alt={`${shop.name} logo`} className="h-20 w-20 rounded-md object-cover mb-4" />
          )}
        <h3 
            className="text-2xl font-bold text-brand-dark-charcoal font-serif"
        >
            {shop.name}
        </h3>
        {shop.slogan && <p className="mt-2 text-brand-dark-charcoal/70 text-sm">{shop.slogan}</p>}
      </div>
      <div className="p-4 bg-brand-light-beige border-t border-brand-dark-charcoal/10">
        <button
          onClick={() => onSelect(shop.id)}
          className="w-full border-2 border-brand-dark-charcoal text-brand-dark-charcoal font-bold py-3 px-4 rounded-lg hover:bg-brand-dark-charcoal hover:text-brand-light-beige transition-colors"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};
