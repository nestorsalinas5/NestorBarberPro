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
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          {logoUrl && (
            <img src={logoUrl} alt={`${barberShopName} logo`} className="h-16 w-16 rounded-md object-cover" />
          )}
          <div className="text-left">
            <h1 
              className="text-4xl sm:text-5xl font-bold text-brand-primary" 
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {barberShopName || 'NestorBarberPro'}
            </h1>
            {slogan && <p className="mt-1 text-lg text-brand-text-secondary">{slogan}</p>}
          </div>
        </div>
        <div>
          {user ? (
            <div className="text-right">
              <p className="text-brand-text-secondary">Conectado como</p>
              <p className="font-bold text-brand-text break-all">{user.email}</p>
              <button 
                onClick={onLogout}
                className="mt-2 text-sm text-brand-primary hover:text-brand-secondary transition-colors"
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
