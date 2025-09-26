

import React, { useState, useRef, useEffect } from 'react';
import type { BarberShop, Service, ScheduleConfig, Promotion } from '../types';
import { ServiceEditModal } from './ServiceEditModal';
import { PromotionEditModal } from './PromotionEditModal';

interface BarberSettingsViewProps {
  barberShop: BarberShop;
  onUpdateServices: (shopId: string, services: Service[]) => void;
  onUpdateSchedule: (shopId: string, schedule: ScheduleConfig) => Promise<void>;
  onUploadLogo: (file: File, shopId: string) => Promise<void>;
  onUpdatePromotions: (shopId: string, promotions: Promotion[]) => Promise<void>;
  onUpdateTheme: (shopId: string, theme: { primary_color: string; secondary_color: string }) => Promise<void>;
}

// Helper function to ensure schedule data is always in the correct, modern format.
const normalizeSchedule = (scheduleData: Partial<ScheduleConfig> | undefined): ScheduleConfig => {
  const defaults: ScheduleConfig = {
    weekdayConfig: { startTime: "09:30", endTime: "19:30", slotInterval: 30 },
    weekendConfig: { slotsCount: 20, startTime: "08:20" }
  };
  return {
    weekdayConfig: {
      ...defaults.weekdayConfig,
      ...(scheduleData?.weekdayConfig || {}),
    },
    weekendConfig: {
      ...defaults.weekendConfig,
      ...(scheduleData?.weekendConfig || {}),
    },
  };
};

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /> </svg> );
const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /> </svg> );

export const BarberSettingsView: React.FC<BarberSettingsViewProps> = ({ barberShop, onUpdateServices, onUpdateSchedule, onUploadLogo, onUpdatePromotions, onUpdateTheme }) => {
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [schedule, setSchedule] = useState<ScheduleConfig>(() => normalizeSchedule(barberShop.schedule));
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  
  const [primaryColor, setPrimaryColor] = useState(barberShop.primary_color || '#D4AF37');
  const [secondaryColor, setSecondaryColor] = useState(barberShop.secondary_color || '#F0C44D');
  const [isSavingTheme, setIsSavingTheme] = useState(false);


  useEffect(() => {
    setSchedule(normalizeSchedule(barberShop.schedule));
    setPrimaryColor(barberShop.primary_color || '#D4AF37');
    setSecondaryColor(barberShop.secondary_color || '#F0C44D');
  }, [barberShop]);

  const handleScheduleChange = (type: 'weekday' | 'weekend', field: string, value: string | number) => {
    setSchedule(prev => {
        if (type === 'weekday') {
            return { ...prev, weekdayConfig: { ...prev.weekdayConfig, [field]: value } };
        } else {
            return { ...prev, weekendConfig: { ...prev.weekendConfig, [field]: value } };
        }
    });
  };

  const handleScheduleSave = async () => {
    setIsSavingSchedule(true);
    await onUpdateSchedule(barberShop.id, schedule);
    setIsSavingSchedule(false);
  };
  
  const handleThemeSave = async () => {
    setIsSavingTheme(true);
    await onUpdateTheme(barberShop.id, { primary_color: primaryColor, secondary_color: secondaryColor });
    setIsSavingTheme(false);
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedLogo(file);
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  const handleLogoUpload = async () => {
    if (selectedLogo) {
      setIsUploading(true);
      await onUploadLogo(selectedLogo, barberShop.id);
      setIsUploading(false);
      setSelectedLogo(null);
      setPreviewLogo(null);
    }
  };

  const openServiceModalForNew = () => { setEditingService(null); setIsServiceModalOpen(true); };
  const openServiceModalForEdit = (service: Service) => { setEditingService(service); setIsServiceModalOpen(true); };
  const handleDeleteService = (serviceId: number) => onUpdateServices(barberShop.id, barberShop.services.filter(s => s.id !== serviceId));
  const handleSaveService = (service: Service) => {
    let updatedServices: Service[];
    if (editingService) updatedServices = barberShop.services.map(s => s.id === service.id ? service : s);
    else updatedServices = [...barberShop.services, { ...service, id: Date.now() }];
    onUpdateServices(barberShop.id, updatedServices);
    setIsServiceModalOpen(false);
  };
  
  const openPromotionModalForNew = () => { setEditingPromotion(null); setIsPromotionModalOpen(true); };
  const openPromotionModalForEdit = (promo: Promotion) => { setEditingPromotion(promo); setIsPromotionModalOpen(true); };
  const handleDeletePromotion = (promoId: number) => onUpdatePromotions(barberShop.id, (barberShop.promotions || []).filter(p => p.id !== promoId));
  const handleSavePromotion = (promo: Promotion) => {
    let updatedPromos: Promotion[];
    const currentPromos = barberShop.promotions || [];
    if (editingPromotion) updatedPromos = currentPromos.map(p => p.id === promo.id ? promo : p);
    else updatedPromos = [...currentPromos, { ...promo, id: Date.now() }];
    onUpdatePromotions(barberShop.id, updatedPromos);
    setIsPromotionModalOpen(false);
  };

  return (
    <>
    <div className="bg-brand-surface rounded-lg shadow-2xl overflow-hidden p-6 md:p-8 space-y-12">
      {/* Schedule Management */}
      <section>
        <h3 className="text-2xl font-bold text-brand-text">Gestión de Horarios</h3>
        <p className="text-sm text-brand-text-secondary mb-6">Define los horarios y cupos de tu barbería.</p>
        <div className="space-y-6">
          {/* Weekday Config */}
          <div className="p-4 bg-black/20 rounded-lg">
              <h4 className="font-semibold text-brand-primary mb-3">Lunes a Jueves (Por Horario)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                      <label className="text-xs text-brand-text-secondary">Hora de Inicio</label>
                      <input type="time" value={schedule.weekdayConfig.startTime} onChange={e => handleScheduleChange('weekday', 'startTime', e.target.value)} className="w-full bg-brand-bg border border-gray-600 rounded-md text-sm p-2"/>
                  </div>
                  <div>
                      <label className="text-xs text-brand-text-secondary">Hora de Fin</label>
                      <input type="time" value={schedule.weekdayConfig.endTime} onChange={e => handleScheduleChange('weekday', 'endTime', e.target.value)} className="w-full bg-brand-bg border border-gray-600 rounded-md text-sm p-2"/>
                  </div>
                   <div>
                      <label className="text-xs text-brand-text-secondary">Intervalo (minutos)</label>
                      <input type="number" step="5" min="5" value={schedule.weekdayConfig.slotInterval} onChange={e => handleScheduleChange('weekday', 'slotInterval', Number(e.target.value))} className="w-full bg-brand-bg border border-gray-600 rounded-md text-sm p-2"/>
                  </div>
              </div>
          </div>
          {/* Weekend Config */}
           <div className="p-4 bg-black/20 rounded-lg">
              <h4 className="font-semibold text-brand-primary mb-3">Viernes y Sábado (Por Cupos)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                      <label className="text-xs text-brand-text-secondary">Total de Cupos</label>
                      <input type="number" min="0" value={schedule.weekendConfig.slotsCount} onChange={e => handleScheduleChange('weekend', 'slotsCount', Number(e.target.value))} className="w-full bg-brand-bg border border-gray-600 rounded-md text-sm p-2"/>
                  </div>
                  <div>
                      <label className="text-xs text-brand-text-secondary">Hora de Inicio (Informativo)</label>
                      <input type="time" value={schedule.weekendConfig.startTime} onChange={e => handleScheduleChange('weekend', 'startTime', e.target.value)} className="w-full bg-brand-bg border border-gray-600 rounded-md text-sm p-2"/>
                  </div>
              </div>
          </div>
        </div>
        <div className="mt-6 text-right">
          <button onClick={handleScheduleSave} disabled={isSavingSchedule} className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-bg bg-brand-primary hover:bg-brand-secondary disabled:bg-gray-500">{isSavingSchedule ? 'Guardando...' : 'Guardar Horario'}</button>
        </div>
      </section>

      {/* Brand Customization */}
       <section>
        <h3 className="text-2xl font-bold text-brand-text">Personalización de Marca</h3>
        <p className="text-sm text-brand-text-secondary mb-6">Elige los colores que representan a tu barbería.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-black/20 rounded-lg">
          <div className="flex items-center gap-4">
            <label htmlFor="primary-color" className="text-sm font-medium text-brand-text-secondary">Color Primario</label>
            <input type="color" id="primary-color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded-md border-2 border-gray-600 cursor-pointer"/>
          </div>
          <div className="flex items-center gap-4">
            <label htmlFor="secondary-color" className="text-sm font-medium text-brand-text-secondary">Color Secundario</label>
            <input type="color" id="secondary-color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-10 h-10 rounded-md border-2 border-gray-600 cursor-pointer"/>
          </div>
        </div>
        <div className="mt-6 text-right">
          <button onClick={handleThemeSave} disabled={isSavingTheme} className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-bg bg-brand-primary hover:bg-brand-secondary disabled:bg-gray-500">{isSavingTheme ? 'Guardando...' : 'Guardar Tema'}</button>
        </div>
      </section>

      {/* Logo Management */}
      <section>
        <h3 className="text-2xl font-bold text-brand-text">Logo de la Barbería</h3>
        <p className="text-sm text-brand-text-secondary mb-6">Sube una imagen cuadrada para una mejor visualización.</p>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-lg bg-black/20 flex items-center justify-center overflow-hidden">
            <img src={previewLogo || barberShop.logo_url || `https://ui-avatars.com/api/?name=${barberShop.name.charAt(0)}&background=D4AF37&color=121212&size=96`} alt="Logo" className="w-full h-full object-cover"/>
          </div>
          <div className="flex-grow">
            <input type="file" accept="image/png, image/jpeg" ref={fileInputRef} onChange={handleLogoSelect} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-brand-text hover:bg-brand-bg">Seleccionar Imagen</button>
            {selectedLogo && (
              <div className="mt-2 flex items-center gap-4">
                <p className="text-sm text-brand-text-secondary truncate">{selectedLogo.name}</p>
                <button onClick={handleLogoUpload} disabled={isUploading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-bg bg-brand-primary hover:bg-brand-secondary disabled:bg-gray-500">{isUploading ? 'Subiendo...' : 'Guardar Logo'}</button>
              </div>
            )}
          </div>
        </div>
      </section>

       {/* Promotions Management */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div>
              <h3 className="text-2xl font-bold text-brand-text">Promociones y Marketing</h3>
              <p className="text-sm text-brand-text-secondary">Crea ofertas para atraer más clientes.</p>
          </div>
          <button onClick={openPromotionModalForNew} className="bg-brand-primary text-brand-bg font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors whitespace-nowrap">+ Añadir Promoción</button>
        </div>
        <div className="space-y-3">
          {(barberShop.promotions || []).length > 0 ? ( barberShop.promotions?.map(promo => (
              <div key={promo.id} className="bg-black/20 p-4 rounded-lg flex justify-between items-center transition-colors hover:bg-black/40">
                  <div><p className="font-bold text-brand-text">{promo.title}</p><p className="text-sm text-brand-text-secondary">{promo.description}</p></div>
                  <div className="flex gap-3">
                      <button onClick={() => openPromotionModalForEdit(promo)} className="text-brand-primary hover:text-brand-secondary"><PencilIcon className="w-5 h-5" /></button>
                      <button onClick={() => handleDeletePromotion(promo.id)} className="text-red-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                  </div>
              </div>))
          ) : ( <div className="text-center py-16"><p className="text-lg text-brand-text-secondary">No tienes ninguna promoción activa.</p></div>)}
        </div>
      </section>

      {/* Service Management */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div>
              <h3 className="text-2xl font-bold text-brand-text">Configuración de Servicios</h3>
              <p className="text-sm text-brand-text-secondary">Añade, edita o elimina los servicios que ofreces.</p>
          </div>
          <button onClick={openServiceModalForNew} className="bg-brand-primary text-brand-bg font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors whitespace-nowrap">+ Añadir Servicio</button>
        </div>
        <div className="space-y-3">
          {barberShop.services.length > 0 ? ( barberShop.services.map(service => (
              <div key={service.id} className="bg-black/20 p-4 rounded-lg flex justify-between items-center transition-colors hover:bg-black/40">
                  <div><p className="font-bold text-brand-text">{service.name}</p><p className="text-sm text-brand-text-secondary">{service.duration} min - ₲{service.price.toLocaleString('es-PY')}</p></div>
                  <div className="flex gap-3">
                      <button onClick={() => openServiceModalForEdit(service)} className="text-brand-primary hover:text-brand-secondary"><PencilIcon className="w-5 h-5" /></button>
                      <button onClick={() => handleDeleteService(service.id)} className="text-red-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                  </div>
              </div>))
          ) : ( <div className="text-center py-16"><p className="text-lg text-brand-text-secondary">No has añadido ningún servicio todavía.</p><p className="text-sm text-gray-500">Haz clic en "+ Añadir Servicio" para empezar.</p></div>)}
        </div>
      </section>
    </div>

    <ServiceEditModal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} onSave={handleSaveService} service={editingService} />
    <PromotionEditModal isOpen={isPromotionModalOpen} onClose={() => setIsPromotionModalOpen(false)} onSave={handleSavePromotion} promotion={editingPromotion} />
    </>
  );
};
