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
      <div className="bg-brand-light-beige text-brand-dark-charcoal rounded-lg shadow-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-brand-dark-charcoal mb-2">Gestionar Licencia</h2>
        <p className="text-brand-dark-charcoal/80 mb-6">Editando licencia para <span className="font-bold text-brand-dark-charcoal">{barberShop.name}</span></p>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="license-type" className="block text-sm font-medium text-brand-dark-charcoal/80">
                Tipo de Licencia
              </label>
              <select
                id="license-type"
                value={licenseType || ''}
                onChange={(e) => setLicenseType(e.target.value as BarberShop['license_type'])}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-dark-green focus:border-brand-dark-green"
              >
                {licenseTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="license-expires" className="block text-sm font-medium text-brand-dark-charcoal/80">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                id="license-expires"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-dark-green focus:border-brand-dark-green"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button type="button" onClick={closeModal} className="py-2 px-4 border border-brand-dark-charcoal/30 rounded-md shadow-sm text-sm font-medium hover:bg-brand-dark-charcoal/10">
              Cancelar
            </button>
            <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-light-beige bg-brand-dark-charcoal hover:bg-opacity-90">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
