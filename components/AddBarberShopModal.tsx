import React, { useState } from 'react';

interface AddBarberShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (details: { name: string; email: string; password: string }) => void;
}

export const AddBarberShopModal: React.FC<AddBarberShopModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string, email?: string, password?: string }>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'El nombre de la barbería es requerido.';
    if (!email.trim()) {
      newErrors.email = 'El correo es requerido.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El correo no es válido.';
    }
    if (!password.trim() || password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onAdd({ name, email, password });
      // Reset fields on success in parent component
    }
  };

  const closeModal = () => {
    setName('');
    setEmail('');
    setPassword('');
    setErrors({});
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={closeModal}>
      <div className="bg-brand-light-beige text-brand-dark-charcoal rounded-lg shadow-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-brand-dark-charcoal mb-4">Añadir Nueva Barbería</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="shop-name" className="block text-sm font-medium text-brand-dark-charcoal/80">
                Nombre de la Barbería
              </label>
              <input
                type="text" id="shop-name" value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full bg-transparent border-b-2 border-brand-dark-charcoal/20 rounded-none shadow-sm py-2 px-1 focus:outline-none focus:ring-transparent focus:border-brand-dark-charcoal"
                autoFocus
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="user-email" className="block text-sm font-medium text-brand-dark-charcoal/80">
                Email del Barbero
              </label>
              <input
                type="email" id="user-email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full bg-transparent border-b-2 border-brand-dark-charcoal/20 rounded-none shadow-sm py-2 px-1 focus:outline-none focus:ring-transparent focus:border-brand-dark-charcoal"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="user-password" className="block text-sm font-medium text-brand-dark-charcoal/80">
                Contraseña Inicial
              </label>
              <input
                type="password" id="user-password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full bg-transparent border-b-2 border-brand-dark-charcoal/20 rounded-none shadow-sm py-2 px-1 focus:outline-none focus:ring-transparent focus:border-brand-dark-charcoal"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button type="button" onClick={closeModal} className="py-2 px-4 border border-brand-dark-charcoal/30 rounded-md shadow-sm text-sm font-medium hover:bg-brand-dark-charcoal/10">
              Cancelar
            </button>
            <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-light-beige bg-brand-dark-charcoal hover:bg-opacity-90">
              Crear y Asignar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
