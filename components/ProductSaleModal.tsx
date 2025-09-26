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
      <div className="bg-brand-light-beige text-brand-dark-charcoal rounded-lg shadow-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">Registrar Venta</h2>
        <div className="space-y-4">
            <div>
                <p className="text-sm text-brand-dark-charcoal/80">Producto</p>
                <p className="font-semibold text-lg">{product.name}</p>
                <p className="text-sm text-brand-dark-charcoal/80">Stock disponible: {product.stock_quantity}</p>
            </div>
            <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-brand-dark-charcoal/80">Cantidad a vender</label>
                <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max={product.stock_quantity}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-dark-green focus:border-brand-dark-green"
                    autoFocus
                />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-lg font-bold text-brand-dark-charcoal/80">Total</span>
                <span className="text-2xl font-bold text-brand-dark-green">
                    ₲{totalPrice.toLocaleString('es-PY')}
                </span>
            </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium hover:bg-gray-100">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={quantity <= 0 || quantity > product.stock_quantity || isSubmitting}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-light-beige bg-brand-dark-charcoal hover:bg-opacity-90 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Confirmando...' : 'Confirmar Venta'}
          </button>
        </div>
      </div>
    </div>
  );
};
