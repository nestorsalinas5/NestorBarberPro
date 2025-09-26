import React, { useState, useEffect } from 'react';
import type { Client } from '../types';

interface ClientEditModalProps {
  client: Client;
  onClose: () => void;
  onSave: (clientData: Pick<Client, 'id' | 'name' | 'email' | 'phone'>) => Promise<void>;
}

export const ClientEditModal: React.FC<ClientEditModalProps> = ({ client, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setName(client.name);
      setEmail(client.email);
      setPhone(client.phone || '');
    }
  }, [client]);

  const validate = () => {
    const newErrors: { name?: string; email?: string } = {};
    if (!name.trim()) newErrors.name = 'El nombre es requerido';
    if (!email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El correo no es válido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSaving(true);
      await onSave({ id: client.id, name, email, phone });
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-brand-light-beige text-brand-dark-charcoal rounded-lg shadow-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">Editar Cliente</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="client-name" className="block text-sm font-medium text-brand-dark-charcoal/80">
                Nombre Completo
              </label>
              <input
                type="text" id="client-name" value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full bg-transparent border-b-2 border-brand-dark-charcoal/20 rounded-none shadow-sm py-2 px-1 focus:outline-none focus:ring-transparent focus:border-brand-dark-charcoal"
                autoFocus
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="client-email" className="block text-sm font-medium text-brand-dark-charcoal/80">
                Correo Electrónico
              </label>
              <input
                type="email" id="client-email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full bg-transparent border-b-2 border-brand-dark-charcoal/20 rounded-none shadow-sm py-2 px-1 focus:outline-none focus:ring-transparent focus:border-brand-dark-charcoal"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="client-phone" className="block text-sm font-medium text-brand-dark-charcoal/80">
                Teléfono (Opcional)
              </label>
              <input
                type="tel" id="client-phone" value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full bg-transparent border-b-2 border-brand-dark-charcoal/20 rounded-none shadow-sm py-2 px-1 focus:outline-none focus:ring-transparent focus:border-brand-dark-charcoal"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="py-2 px-4 border border-brand-dark-charcoal/30 rounded-md shadow-sm text-sm font-medium hover:bg-brand-dark-charcoal/10">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-light-beige bg-brand-dark-charcoal hover:bg-opacity-90 disabled:bg-gray-500">
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
