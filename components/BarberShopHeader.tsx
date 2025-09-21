import React from 'react';
import type { User } from '../types';

interface BarberShopHeaderProps {
  user: User | null;
  onNavigateToLogin: () => void;
  onLogout: () => void;
  barberShopName?: string;
  slogan?: string;
}

export const BarberShopHeader: React.FC<BarberShopHeaderProps> = ({ user, onNavigateToLogin, onLogout, barberShopName, slogan }) => {
  return (
    <header>
      <div className="flex justify-between items-start">
        <div className="text-left">
          <h1 
            className="text-4xl sm:text-5xl font-bold text-brand-primary" 
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {barberShopName || 'NestorBarberPro'}
          </h1>
          {slogan && <p className="mt-1 text-lg text-brand-text-secondary">{slogan}</p>}
        </div>
        <div>
          {user ? (
            <div className="text-right">
              <p className="text-brand-text-secondary">Bienvenido, <span className="font-bold text-brand-text">{user.name}</span></p>
              <button 
                onClick={onLogout}
                className="mt-1 text-sm text-brand-primary hover:text-brand-secondary transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <button 
              onClick={onNavigateToLogin}
              className="bg-brand-primary text-brand-bg font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors"
            >
              Portal de Barberos
            </button>
          )}
        </div>
      </div>
    </header>
  );
};