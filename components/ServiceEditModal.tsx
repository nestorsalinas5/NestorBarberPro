import React, { useState, useEffect } from 'react';
import type { Service } from '../types';

interface ServiceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Service) => void;
  service: Service | null;
}

export const ServiceEditModal: React.FC<ServiceEditModalProps> = ({ isOpen, onClose, onSave, service }) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<{ name?: string; duration?: string; price?: string }>({});

  useEffect(() => {
    if (service) {
      setName(service.name);
      setDuration(String(service.duration));
      setPrice(String(service.price));
    } else {
      setName('');
      setDuration('');
      setPrice('');
    }
    setErrors({});
  }, [service, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'El nombre es requerido.';
    const durationNum = Number(duration);
    if (!duration.trim() || isNaN(durationNum) || durationNum <= 0) {
      newErrors.duration = 'La duración debe ser un número positivo.';
    }
    const priceNum = Number(price);
    if (!price.trim() || isNaN(priceNum) || priceNum < 0) {
      newErrors.price = 'El precio debe ser un número válido.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        id: service?.id || 0, // ID will be properly set in the parent
        name,
        duration: Number(duration),
        price: Number(price),
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-brand-light-beige text-brand-dark-charcoal rounded-lg shadow-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-brand-dark-charcoal mb-4">
          {service ? 'Editar Servicio' : 'Añadir Nuevo Servicio'}
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="service-name" className="block text-sm font-medium text-brand-dark-charcoal/80">
                Nombre del Servicio
              </label>
              <input
                type="text"
                id="service-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full bg-transparent border-b-2 border-brand-dark-charcoal/20 rounded-none shadow-sm py-2 px-1 focus:outline-none focus:ring-transparent focus:border-brand-dark-charcoal"
                autoFocus
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="service-duration" className="block text-sm font-medium text-brand-dark-charcoal/80">
                Duración (en minutos)
              </label>
              <input
                type="number"
                id="service-duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1 block w-full bg-transparent border-b-2 border-brand-dark-charcoal/20 rounded-none shadow-sm py-2 px-1 focus:outline-none focus:ring-transparent focus:border-brand-dark-charcoal"
              />
              {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
            </div>
            <div>
              <label htmlFor="service-price" className="block text-sm font-medium text-brand-dark-charcoal/80">
                Precio (en ₲)
              </label>
              <input
                type="number"
                id="service-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 block w-full bg-transparent border-b-2 border-brand-dark-charcoal/20 rounded-none shadow-sm py-2 px-1 focus:outline-none focus:ring-transparent focus:border-brand-dark-charcoal"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-brand-dark-charcoal/30 rounded-md shadow-sm text-sm font-medium hover:bg-brand-dark-charcoal/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-light-beige bg-brand-dark-charcoal hover:bg-opacity-90"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
