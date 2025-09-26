import React, { useState } from 'react';
import * as authService from '../services/auth';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await authService.signIn(email, password);

    if (error) {
      setError(error.message);
    } 
    // On success, the onAuthStateChange listener in App.tsx will handle the navigation
    
    setIsLoading(false);
  };

  return (
    <div className="bg-brand-light-beige rounded-lg shadow-2xl overflow-hidden max-w-md mx-auto animate-fade-in">
      <div className="p-8">
        <h2 
          className="text-center text-3xl font-bold text-brand-dark-charcoal font-serif"
        >
          Acceso al Portal
        </h2>
        <p className="text-center mt-2 text-brand-dark-charcoal/80">
          Inicia sesión para gestionar tu barbería.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-dark-charcoal/80">Correo Electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full bg-brand-light-beige border-b-2 border-brand-dark-charcoal/20 rounded-none shadow-sm py-2 px-1 text-brand-dark-charcoal focus:outline-none focus:ring-transparent focus:border-brand-dark-charcoal sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-dark-charcoal/80">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full bg-brand-light-beige border-b-2 border-brand-dark-charcoal/20 rounded-none shadow-sm py-2 px-1 text-brand-dark-charcoal focus:outline-none focus:ring-transparent focus:border-brand-dark-charcoal sm:text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-700 text-sm p-3 rounded-md">
              <p>{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border-2 border-brand-dark-charcoal rounded-md shadow-sm text-sm font-bold bg-brand-light-beige text-brand-dark-charcoal hover:bg-brand-dark-charcoal hover:text-brand-light-beige focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark-charcoal disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
