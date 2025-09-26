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
    <div className="animate-fade-in">
        <h3 className="text-2xl font-bold text-brand-dark-charcoal font-serif mb-6">4. Confirma tus Datos</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-brand-dark-charcoal/80">Nombre Completo</label>
                <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full bg-white/80 border-2 border-brand-dark-charcoal/10 rounded-md shadow-sm py-2 px-3 text-brand-dark-charcoal focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
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
                className="mt-1 block w-full bg-white/80 border-2 border-brand-dark-charcoal/10 rounded-md shadow-sm py-2 px-3 text-brand-dark-charcoal focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
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
                className="mt-1 block w-full bg-white/80 border-2 border-brand-dark-charcoal/10 rounded-md shadow-sm py-2 px-3 text-brand-dark-charcoal focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                />
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border-2 border-brand-gold rounded-md shadow-sm text-sm font-bold bg-brand-gold text-brand-dark-charcoal hover:bg-brand-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
                {isSubmitting ? 'Confirmando...' : 'Confirmar Reserva'}
            </button>
        </form>
    </div>
  );
};
