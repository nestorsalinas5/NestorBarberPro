import React from 'react';
import type { Role } from '../types';

interface LoginPageProps {
  onLogin: (role: Role) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="bg-brand-surface rounded-lg shadow-2xl overflow-hidden max-w-md mx-auto animate-fade-in">
      <div className="p-8">
        <h2 
          className="text-center text-3xl font-bold text-brand-primary" 
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Acceso al Portal
        </h2>
        <p className="text-center mt-2 text-brand-text-secondary">
          Inicia sesión para gestionar tu barbería.
        </p>

        <div className="mt-8 space-y-4">
           {/* In a real app, this would be a form with username/password */}
          <button
            onClick={() => onLogin('Barber')}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-bg bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors duration-200"
          >
            Iniciar sesión como Barbero
          </button>
          <button
            onClick={() => onLogin('Admin')}
            className="w-full flex justify-center py-3 px-4 border border-brand-secondary rounded-md shadow-sm text-sm font-bold text-brand-primary bg-transparent hover:bg-brand-secondary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary transition-colors duration-200"
          >
            Iniciar sesión como Admin
          </button>
        </div>
      </div>
    </div>
  );
};
