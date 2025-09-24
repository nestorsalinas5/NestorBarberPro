import React, { useState, useMemo } from 'react';
import type { Product } from '../types';
import { ProductEditModal } from './ProductEditModal';

interface InventoryManagementViewProps {
  products: Product[];
  onAddProduct: (productData: Omit<Product, 'id' | 'created_at' | 'barber_shop_id'>) => Promise<void>;
  onUpdateProduct: (productData: Product) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
}

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /> </svg> );
const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /> </svg> );

export const InventoryManagementView: React.FC<InventoryManagementViewProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return products
      .filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, searchTerm]);

  const openModalForNew = () => { setEditingProduct(null); setIsModalOpen(true); };
  const openModalForEdit = (product: Product) => { setEditingProduct(product); setIsModalOpen(true); };
  
  const handleSaveProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'barber_shop_id'> | Product) => {
    if ('id' in productData) {
      await onUpdateProduct(productData);
    } else {
      await onAddProduct(productData);
    }
    setIsModalOpen(false);
  };

  const getStockColor = (stock: number) => {
    if (stock <= 5) return 'text-red-400';
    if (stock <= 15) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <>
    <div className="bg-brand-surface rounded-lg shadow-2xl overflow-hidden p-6 md:p-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h3 className="text-2xl font-bold text-brand-text">Gestión de Inventario</h3>
                <p className="text-sm text-brand-text-secondary">Controla el stock de los productos que vendes.</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
                <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:max-w-xs bg-brand-bg border border-gray-600 rounded-md shadow-sm py-2 px-3 text-brand-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                />
                 <button onClick={openModalForNew} className="bg-brand-primary text-brand-bg font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors whitespace-nowrap">+ Añadir</button>
            </div>
        </div>
        
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-black/20">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">Producto</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">Precio</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">Stock</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-brand-text-secondary uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {filteredProducts.map(product => (
                        <tr key={product.id} className="hover:bg-black/20 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-brand-text">{product.name}</div>
                                <div className="text-xs text-brand-text-secondary max-w-xs truncate">{product.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">₲{product.price.toLocaleString('es-PY')}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${getStockColor(product.stock_quantity)}`}>{product.stock_quantity} unidades</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <button onClick={() => openModalForEdit(product)} className="text-brand-primary hover:text-brand-secondary p-2"><PencilIcon className="w-5 h-5" /></button>
                                <button onClick={() => onDeleteProduct(product.id)} className="text-red-400 hover:text-red-500 p-2"><TrashIcon className="w-5 h-5" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {filteredProducts.length === 0 && (
            <div className="text-center py-16">
                <p className="text-lg text-brand-text-secondary">No tienes productos en tu inventario.</p>
                <p className="text-sm text-gray-500">{searchTerm ? 'Intenta con otra búsqueda.' : 'Haz clic en "+ Añadir" para empezar.'}</p>
            </div>
        )}
    </div>
    <ProductEditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
    />
    </>
  );
};
