import React, { useState } from 'react';

interface BookingFormProps {
  onSubmit: (details: { name: string; email: string; phone?: string }) => void;
  isSubmitting: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, isSubmitting }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ name, email, phone });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-brand-dark-charcoal/80">Nombre Completo</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full bg-brand-light-beige border-b-2 border-brand-dark-charcoal/20 rounded-none shadow-sm py-2 px-1 text-brand-dark-charcoal focus:outline-none focus:ring-transparent focus:border-brand-dark-charcoal sm:text-sm"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-brand-dark-charcoal/80">Correo Electrónico</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full bg-brand-light-beige border-b-2 border-brand-dark-charcoal/20 rounded-none shadow-sm py-2 px-1 text-brand-dark-charcoal focus:outline-none focus:ring-transparent focus:border-brand-dark-charcoal sm:text-sm"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-brand-dark-charcoal/80">Número de Teléfono (Opcional)</label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 block w-full bg-brand-light-beige border-b-2 border-brand-dark-charcoal/20 rounded-none shadow-sm py-2 px-1 text-brand-dark-charcoal focus:outline-none focus:ring-transparent focus:border-brand-dark-charcoal sm:text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-3 px-4 border-2 border-brand-dark-charcoal rounded-md shadow-sm text-sm font-bold bg-brand-light-beige text-brand-dark-charcoal hover:bg-brand-dark-charcoal hover:text-brand-light-beige focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark-charcoal disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isSubmitting ? 'Confirmando...' : 'Confirmar Reserva'}
      </button>
    </form>
  );
};
