import React, { useState } from 'react';

interface AddBarberShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export const AddBarberShopModal: React.FC<AddBarberShopModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre de la barbería no puede estar vacío.');
      return;
    }
    onAdd(name);
    setName('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-brand-surface rounded-lg shadow-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-brand-primary mb-4">Añadir Nueva Barbería</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="shop-name" className="block text-sm font-medium text-brand-text-secondary">
                Nombre de la Barbería
              </label>
              <input
                type="text"
                id="shop-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if(error) setError('');
                }}
                className="mt-1 block w-full bg-brand-bg border border-gray-600 rounded-md shadow-sm py-2 px-3 text-brand-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                autoFocus
              />
              {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-brand-text hover:bg-brand-bg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-bg bg-brand-primary hover:bg-brand-secondary"
            >
              Añadir Barbería
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};