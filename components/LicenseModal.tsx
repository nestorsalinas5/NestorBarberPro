import React, { useState, useEffect } from 'react';
import type { BarberShop, BarberShopWithUser } from '../types';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (license: { type: BarberShop['license_type']; expiresAt: string | null }) => void;
  barberShop: BarberShopWithUser;
}

const licenseTypes: NonNullable<BarberShop['license_type']>[] = ['Trial', 'Mensual', 'Anual'];

export const LicenseModal: React.FC<LicenseModalProps> = ({ isOpen, onClose, onSave, barberShop }) => {
  const [licenseType, setLicenseType] = useState<BarberShop['license_type']>('Trial');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    if (barberShop) {
      setLicenseType(barberShop.license_type || 'Trial');
      const currentExpiry = barberShop.license_expires_at 
        ? new Date(barberShop.license_expires_at).toISOString().split('T')[0] 
        : '';
      setExpiresAt(currentExpiry);
    }
  }, [barberShop, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expiryDate = expiresAt ? new Date(expiresAt).toISOString() : null;
    onSave({ type: licenseType, expiresAt: expiryDate });
  };
  
  const closeModal = () => {
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={closeModal}>
      <div className="bg-brand-surface rounded-lg shadow-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-brand-primary mb-2">Gestionar Licencia</h2>
        <p className="text-brand-text-secondary mb-6">Editando licencia para <span className="font-bold text-brand-text">{barberShop.name}</span></p>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="license-type" className="block text-sm font-medium text-brand-text-secondary">
                Tipo de Licencia
              </label>
              <select
                id="license-type"
                value={licenseType || ''}
                onChange={(e) => setLicenseType(e.target.value as BarberShop['license_type'])}
                className="mt-1 block w-full bg-brand-bg border border-gray-600 rounded-md shadow-sm py-2 px-3 text-brand-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              >
                {licenseTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="license-expires" className="block text-sm font-medium text-brand-text-secondary">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                id="license-expires"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="mt-1 block w-full bg-brand-bg border border-gray-600 rounded-md shadow-sm py-2 px-3 text-brand-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button type="button" onClick={closeModal} className="py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-brand-text hover:bg-brand-bg">
              Cancelar
            </button>
            <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-bg bg-brand-primary hover:bg-brand-secondary">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
