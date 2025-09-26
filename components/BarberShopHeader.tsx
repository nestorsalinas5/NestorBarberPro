import React from 'react';
import type { AuthUser } from '../types';

interface BarberShopHeaderProps {
  user: AuthUser | null;
  onNavigateToLogin: () => void;
  onLogout: () => void;
  barberShopName?: string;
  slogan?: string;
  logoUrl?: string | null;
}

export const BarberShopHeader: React.FC<BarberShopHeaderProps> = ({ user, onNavigateToLogin, onLogout, barberShopName, slogan, logoUrl }) => {
  return (
    <header>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          {logoUrl && (
            <img src={logoUrl} alt={`${barberShopName} logo`} className="h-14 w-14 sm:h-16 sm:w-16 rounded-md object-cover" />
          )}
          <div className="text-left">
            <h1 
              className="text-3xl sm:text-5xl font-bold text-brand-light-beige font-serif"
              style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}
            >
              {barberShopName || 'NestorBarberPro'}
            </h1>
            {slogan && <p className="mt-1 text-base sm:text-lg text-brand-light-beige/80" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{slogan}</p>}
          </div>
        </div>
        <div className="w-full sm:w-auto">
          {user ? (
            <div className="text-left sm:text-right bg-black/20 sm:bg-transparent p-3 sm:p-0 rounded-lg">
              <p className="text-sm text-brand-light-beige/80">Conectado como</p>
              <p className="font-bold text-brand-light-beige break-all">{user.email}</p>
              <button 
                onClick={onLogout}
                className="mt-2 text-sm font-semibold text-brand-gold hover:text-white transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <button 
              onClick={onNavigateToLogin}
              className="bg-brand-light-beige text-brand-dark-charcoal font-bold py-2 px-5 rounded-lg hover:bg-brand-gold hover:text-brand-dark-charcoal transition-all w-full sm:w-auto shadow-lg"
            >
              Portal de Barberos
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
