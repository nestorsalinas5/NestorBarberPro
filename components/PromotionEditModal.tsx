import React, { useState, useEffect } from 'react';
import type { Promotion } from '../types';

interface PromotionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promotion: Promotion) => void;
  promotion: Promotion | null;
}

export const PromotionEditModal: React.FC<PromotionEditModalProps> = ({ isOpen, onClose, onSave, promotion }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (promotion) {
      setTitle(promotion.title);
      setDescription(promotion.description);
    } else {
      setTitle('');
      setDescription('');
    }
    setError(null);
  }, [promotion, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título es requerido.');
      return;
    }
    onSave({
      id: promotion?.id || 0, // ID will be properly set in the parent
      title,
      description,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-brand-surface rounded-lg shadow-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-brand-primary mb-4">
          {promotion ? 'Editar Promoción' : 'Añadir Nueva Promoción'}
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="promo-title" className="block text-sm font-medium text-brand-text-secondary">
                Título de la Promoción
              </label>
              <input
                type="text"
                id="promo-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full bg-brand-bg border border-gray-600 rounded-md shadow-sm py-2 px-3 text-brand-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                autoFocus
              />
              {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
            </div>
            <div>
              <label htmlFor="promo-description" className="block text-sm font-medium text-brand-text-secondary">
                Descripción (Opcional)
              </label>
              <textarea
                id="promo-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full bg-brand-bg border border-gray-600 rounded-md shadow-sm py-2 px-3 text-brand-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              />
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
