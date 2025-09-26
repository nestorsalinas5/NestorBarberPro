import React, { useState, useEffect } from 'react';
import type { Product } from '../types';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'created_at' | 'barber_shop_id'> | Product) => void;
  product: Product | null;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({ isOpen, onClose, onSave, product }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [errors, setErrors] = useState<{ name?: string; price?: string; stock?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setName(product.name);
        setDescription(product.description || '');
        setPrice(String(product.price));
        setStock(String(product.stock_quantity));
      } else {
        setName('');
        setDescription('');
        setPrice('');
        setStock('');
      }
      setErrors({});
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'El nombre es requerido.';
    const priceNum = Number(price);
    if (!price.trim() || isNaN(priceNum) || priceNum < 0) {
      newErrors.price = 'El precio debe ser un número válido.';
    }
    const stockNum = Number(stock);
    if (!stock.trim() || !Number.isInteger(stockNum) || stockNum < 0) {
      newErrors.stock = 'El stock debe ser un número entero positivo.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const productData = {
        name,
        description,
        price: Number(price),
        stock_quantity: Number(stock),
      };

      if (product) {
        onSave({ ...product, ...productData });
      } else {
        onSave(productData);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-brand-light-beige text-brand-dark-charcoal rounded-lg shadow-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">
          {product ? 'Editar Producto' : 'Añadir Nuevo Producto'}
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="product-name" className="block text-sm font-medium text-brand-dark-charcoal/80">
                Nombre del Producto
              </label>
              <input
                type="text" id="product-name" value={name} onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full bg-transparent border-b-2 border-brand-dark-charcoal/20 rounded-none shadow-sm py-2 px-1 focus:outline-none focus:ring-transparent focus:border-brand-dark-charcoal"
                autoFocus
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="product-description" className="block text-sm font-medium text-brand-dark-charcoal/80">
                Descripción (Opcional)
              </label>
              <textarea
                id="product-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-dark-green focus:border-brand-dark-green"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="product-price" className="block text-sm font-medium text-brand-dark-charcoal/80">
                  Precio (₲)
                </label>
                <input
                  type="number" id="product-price" value={price} onChange={(e) => setPrice(e.target.value)}
                  className="mt-1 block w-full bg-transparent border-b-2 border-brand-dark-charcoal/20 rounded-none shadow-sm py-2 px-1 focus:outline-none focus:ring-transparent focus:border-brand-dark-charcoal"
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>
              <div>
                <label htmlFor="product-stock" className="block text-sm font-medium text-brand-dark-charcoal/80">
                  Stock
                </label>
                <input
                  type="number" id="product-stock" value={stock} onChange={(e) => setStock(e.target.value)}
                  className="mt-1 block w-full bg-transparent border-b-2 border-brand-dark-charcoal/20 rounded-none shadow-sm py-2 px-1 focus:outline-none focus:ring-transparent focus:border-brand-dark-charcoal"
                />
                {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="py-2 px-4 border border-brand-dark-charcoal/30 rounded-md shadow-sm text-sm font-medium hover:bg-brand-dark-charcoal/10">
              Cancelar
            </button>
            <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-light-beige bg-brand-dark-charcoal hover:bg-opacity-90">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
