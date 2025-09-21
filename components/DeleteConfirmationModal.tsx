import React from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-brand-surface rounded-lg shadow-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-red-400 mb-4">Confirmar Eliminación</h2>
        <p className="text-brand-text-secondary mb-2">
          ¿Estás seguro de que quieres eliminar la barbería <strong className="text-brand-text">{itemName}</strong>?
        </p>
        <p className="text-sm text-yellow-500 bg-yellow-500/10 p-3 rounded-md border border-yellow-500/30">
          <strong>Advertencia:</strong> Esta acción es irreversible. Se eliminará la barbería, el usuario asociado y todos sus datos (citas, clientes, reportes, etc.).
        </p>
        <div className="mt-6 flex justify-end gap-4">
          <button 
            type="button" 
            onClick={onClose} 
            className="py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-brand-text hover:bg-brand-bg"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-bg bg-red-600 hover:bg-red-700"
          >
            Sí, Eliminar Permanentemente
          </button>
        </div>
      </div>
    </div>
  );
};
