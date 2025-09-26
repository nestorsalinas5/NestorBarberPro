import React, { useState, useEffect } from 'react';
import type { Product } from '../types';

interface ProductSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (product: Product, quantity: number) => void;
  product: Product | null;
}

export const ProductSaleModal: React.FC<ProductSaleModalProps> = ({ isOpen, onClose, onConfirm, product }) => {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setIsSubmitting(false);
    }
  }, [isOpen]);
  
  if (!isOpen || !product) return null;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) {
      value = 1;
    }
    if (value > product.stock_quantity) {
      value = product.stock_quantity;
    }
    setQuantity(value);
  };

  const handleConfirm = async () => {
    if (quantity > 0 && quantity <= product.stock_quantity) {
      setIsSubmitting(true);
      await onConfirm(product, quantity);
      setIsSubmitting(false);
    }
  };

  const totalPrice = product.price * quantity;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-brand-surface rounded-lg shadow-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-brand-primary mb-4">Registrar Venta</h2>
        <div className="space-y-4">
            <div>
                <p className="text-sm text-brand-text-secondary">Producto</p>
                <p className="font-semibold text-lg text-brand-text">{product.name}</p>
                <p className="text-sm text-brand-text-secondary">Stock disponible: {product.stock_quantity}</p>
            </div>
            <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-brand-text-secondary">Cantidad a vender</label>
                <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max={product.stock_quantity}
                    className="mt-1 block w-full bg-brand-bg border border-gray-600 rounded-md shadow-sm py-2 px-3 text-brand-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                    autoFocus
                />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <span className="text-lg font-bold text-brand-text-secondary">Total</span>
                <span className="text-2xl font-bold text-brand-primary">
                    ₲{totalPrice.toLocaleString('es-PY')}
                </span>
            </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-brand-text hover:bg-brand-bg">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={quantity <= 0 || quantity > product.stock_quantity || isSubmitting}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-bg bg-brand-primary hover:bg-brand-secondary disabled:bg-gray-500"
          >
            {isSubmitting ? 'Confirmando...' : 'Confirmar Venta'}
          </button>
        </div>
      </div>
    </div>
  );
};
