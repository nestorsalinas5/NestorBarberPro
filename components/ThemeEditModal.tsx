import React, { useState, useEffect } from 'react';
import type { BarberShopWithUser } from '../types';

interface ThemeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (theme: { primary_color: string; secondary_color: string }) => Promise<void>;
  barberShop: BarberShopWithUser;
}

export const ThemeEditModal: React.FC<ThemeEditModalProps> = ({ isOpen, onClose, onSave, barberShop }) => {
  const [primaryColor, setPrimaryColor] = useState('#D4AF37');
  const [secondaryColor, setSecondaryColor] = useState('#F0C44D');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (barberShop) {
      setPrimaryColor(barberShop.primary_color || '#D4AF37');
      setSecondaryColor(barberShop.secondary_color || '#F0C44D');
    }
  }, [barberShop, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({ primary_color: primaryColor, secondary_color: secondaryColor });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-brand-surface rounded-lg shadow-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-brand-primary mb-2">Personalizar Tema</h2>
        <p className="text-brand-text-secondary mb-6">Editando colores para <span className="font-bold text-brand-text">{barberShop.name}</span></p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label htmlFor="primary-color" className="text-sm font-medium text-brand-text-secondary">Color Primario (botones, acentos)</label>
              <input 
                type="color" 
                id="primary-color" 
                value={primaryColor} 
                onChange={e => setPrimaryColor(e.target.value)} 
                className="w-12 h-12 p-1 bg-transparent border-2 border-gray-600 rounded-md cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="secondary-color" className="text-sm font-medium text-brand-text-secondary">Color Secundario (hover, brillos)</label>
              <input 
                type="color" 
                id="secondary-color" 
                value={secondaryColor} 
                onChange={e => setSecondaryColor(e.target.value)} 
                className="w-12 h-12 p-1 bg-transparent border-2 border-gray-600 rounded-md cursor-pointer"
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-brand-text hover:bg-brand-bg">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-bg bg-brand-primary hover:bg-brand-secondary disabled:bg-gray-500">
              {isSaving ? 'Guardando...' : 'Guardar Tema'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
