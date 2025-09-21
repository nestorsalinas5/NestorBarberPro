import React from 'react';
import type { BarberShop } from '../types';

interface ShopCardProps {
  shop: BarberShop;
  onSelect: (shopId: string) => void;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop, onSelect }) => {
  return (
    <div className="bg-brand-surface rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col">
      <div className="p-6 flex-grow">
        <h3 
            className="text-2xl font-bold text-brand-primary" 
            style={{ fontFamily: "'Playfair Display', serif" }}
        >
            {shop.name}
        </h3>
        {shop.slogan && <p className="mt-2 text-brand-text-secondary text-sm">{shop.slogan}</p>}
      </div>
      <div className="p-6 bg-black/20">
        <button
          onClick={() => onSelect(shop.id)}
          className="w-full bg-brand-primary text-brand-bg font-bold py-3 px-4 rounded-lg hover:bg-brand-secondary transition-colors"
        >
          Reservar Ahora
        </button>
      </div>
    </div>
  );
};
