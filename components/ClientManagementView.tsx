import React, { useState, useMemo } from 'react';
import type { Client } from '../types';

interface ClientManagementViewProps {
  clients: Client[];
}

export const ClientManagementView: React.FC<ClientManagementViewProps> = ({ clients }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = useMemo(() => {
    return clients
      .filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.phone && client.phone.includes(searchTerm))
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [clients, searchTerm]);
  
  const formatDate = (dateString?: string | null) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  return (
    <div className="bg-brand-surface rounded-lg shadow-2xl overflow-hidden p-6 md:p-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-2xl font-bold text-brand-text">Gestión de Clientes</h3>
                <p className="text-sm text-brand-text-secondary">Aquí puedes ver toda tu base de datos de clientes.</p>
            </div>
             <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-xs bg-brand-bg border border-gray-600 rounded-md shadow-sm py-2 px-3 text-brand-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            />
        </div>

        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-black/20">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">Nombre</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">Contacto</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">Citas Totales</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">Última Visita</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {filteredClients.map(client => (
                        <tr key={client.id} className="hover:bg-black/20 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-semibold text-brand-text">{client.name}</div></td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-brand-text">{client.email}</div>
                                <div className="text-xs text-brand-text-secondary">{client.phone || 'Sin teléfono'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">{client.total_bookings}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary">{formatDate(client.last_visit)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredClients.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-lg text-brand-text-secondary">No se encontraron clientes.</p>
                    <p className="text-sm text-gray-500">{searchTerm ? 'Intenta con otra búsqueda.' : 'Los clientes aparecerán aquí automáticamente después de su primera reserva.'}</p>
                </div>
            )}
        </div>
    </div>
  );
};
