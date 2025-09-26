import React, { useState, useMemo } from 'react';
import type { Client } from '../types';
import { ClientEditModal } from './ClientEditModal';

interface ClientManagementViewProps {
  clients: Client[];
  onUpdateClient: (clientData: Pick<Client, 'id' | 'name' | 'email' | 'phone'>) => Promise<void>;
}

const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /> </svg> );


export const ClientManagementView: React.FC<ClientManagementViewProps> = ({ clients, onUpdateClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);

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

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
  };

  const handleModalClose = () => {
    setEditingClient(null);
  };

  const handleUpdate = async (clientData: Pick<Client, 'id' | 'name' | 'email' | 'phone'>) => {
    await onUpdateClient(clientData);
    handleModalClose();
  };

  return (
    <>
    <div className="bg-brand-light-beige text-brand-dark-charcoal rounded-lg shadow-2xl overflow-hidden p-6 md:p-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h3 className="text-2xl font-bold">Gestión de Clientes</h3>
                <p className="text-sm text-brand-dark-charcoal/80">Aquí puedes ver toda tu base de datos de clientes.</p>
            </div>
             <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:max-w-xs bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-dark-green focus:border-brand-dark-green"
            />
        </div>

        {/* Mobile View: Card List */}
        <div className="md:hidden space-y-4">
            {filteredClients.map(client => (
                <div key={client.id} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold">{client.name}</p>
                            <p className="text-sm text-brand-dark-charcoal/80">{client.email}</p>
                            <p className="text-xs text-gray-500">{client.phone || 'Sin teléfono'}</p>
                        </div>
                        <button onClick={() => handleEditClick(client)} className="text-brand-dark-green hover:text-opacity-80 p-1">
                            <PencilIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm">
                        <span className="text-brand-dark-charcoal/80">Última Visita: <span className="font-semibold text-brand-dark-charcoal">{formatDate(client.last_visit)}</span></span>
                        <span className="text-brand-dark-charcoal/80">Citas: <span className="font-semibold text-brand-dark-charcoal">{client.total_bookings}</span></span>
                    </div>
                </div>
            ))}
        </div>

        {/* Desktop View: Table */}
        <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-dark-charcoal/70 uppercase tracking-wider">Nombre</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-dark-charcoal/70 uppercase tracking-wider">Contacto</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-dark-charcoal/70 uppercase tracking-wider">Citas Totales</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-dark-charcoal/70 uppercase tracking-wider">Última Visita</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-dark-charcoal/70 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map(client => (
                        <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-semibold">{client.name}</div></td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm">{client.email}</div>
                                <div className="text-xs text-brand-dark-charcoal/80">{client.phone || 'Sin teléfono'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{client.total_bookings}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-dark-charcoal/80">{formatDate(client.last_visit)}</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button onClick={() => handleEditClick(client)} className="text-brand-dark-green hover:text-opacity-80">
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {filteredClients.length === 0 && (
            <div className="text-center py-16">
                <p className="text-lg text-brand-dark-charcoal/70">No se encontraron clientes.</p>
                <p className="text-sm text-gray-500">{searchTerm ? 'Intenta con otra búsqueda.' : 'Los clientes aparecerán aquí automáticamente después de su primera reserva.'}</p>
            </div>
        )}
    </div>
    {editingClient && (
        <ClientEditModal
            client={editingClient}
            onClose={handleModalClose}
            onSave={handleUpdate}
        />
    )}
    </>
  );
};
