import React, { useState, useMemo, useRef } from 'react';
import type { Booking, Expense, BarberShop, Service } from '../types';
import { StatCard } from './StatCard';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportingViewProps {
  barberShop: BarberShop;
  bookings: Booking[];
  expenses: Expense[];
  onAddExpense: (expenseData: Omit<Expense, 'id' | 'created_at' | 'barber_shop_id'>) => Promise<void>;
  onDeleteExpense: (expenseId: string) => Promise<void>;
}

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /> </svg> );

export const ReportingView: React.FC<ReportingViewProps> = ({ barberShop, bookings, expenses, onAddExpense, onDeleteExpense }) => {
  const [reportDate, setReportDate] = useState(new Date());
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const pdfReportRef = useRef<HTMLDivElement>(null);

  const { monthlyRevenue, monthlyExpenses, monthlyProfit, topServices, filteredBookings, productSales, realExpenses } = useMemo(() => {
    const year = reportDate.getFullYear();
    const month = reportDate.getMonth();
    
    const filteredBookings = bookings.filter(b => {
      const bDate = new Date(b.date);
      return b.status === 'Completada' && bDate.getFullYear() === year && bDate.getMonth() === month;
    });

    const productSales = expenses.filter(e => {
      const eDate = new Date(e.date);
      return e.category === 'Venta de Producto' && eDate.getFullYear() === year && eDate.getMonth() === month;
    });

    const realExpenses = expenses.filter(e => {
      const eDate = new Date(e.date);
      return e.category !== 'Venta de Producto' && eDate.getFullYear() === year && eDate.getMonth() === month;
    });

    const bookingRevenue = filteredBookings.reduce((acc, booking) => {
        const services = Array.isArray(booking.service) ? booking.service : [booking.service];
        return acc + services.reduce((sAcc, s) => sAcc + s.price, 0);
    }, 0);
    
    const productRevenue = productSales.reduce((acc, sale) => acc + Math.abs(sale.amount), 0);
    const monthlyRevenue = bookingRevenue + productRevenue;

    const monthlyExpenses = realExpenses.reduce((acc, expense) => acc + Number(expense.amount), 0);
    
    const serviceCounts: { [key: string]: number } = {};
    filteredBookings.forEach(booking => {
        const services = Array.isArray(booking.service) ? booking.service : [booking.service];
        services.forEach(s => { serviceCounts[s.name] = (serviceCounts[s.name] || 0) + 1; });
    });
    
    const topServices = Object.entries(serviceCounts).sort(([, a], [, b]) => b - a).slice(0, 5);

    return { monthlyRevenue, monthlyExpenses, monthlyProfit: monthlyRevenue - monthlyExpenses, topServices, filteredBookings, productSales, realExpenses };
  }, [reportDate, bookings, expenses]);

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expenseAmount);
    if (expenseDescription.trim() && !isNaN(amountNum) && amountNum > 0) {
      await onAddExpense({ description: expenseDescription, amount: amountNum, date: new Date().toISOString().split('T')[0] });
      setExpenseDescription(''); setExpenseAmount(''); setShowExpenseForm(false);
    }
  };
  
  const handleExportPDF = async () => {
    const reportElement = pdfReportRef.current;
    if (!reportElement) return;

    setIsExporting(true);

    try {
      const elementToRender = reportElement.cloneNode(true) as HTMLDivElement;
      
      // --- PDF STYLING OVERRIDES FOR LIGHT THEME ---
      elementToRender.style.backgroundColor = 'white';
      elementToRender.style.color = '#1f2937'; // Dark gray text

      elementToRender.querySelectorAll<HTMLElement>('h1, h2, .text-brand-primary').forEach(el => { el.style.color = '#000000'; });
      elementToRender.querySelectorAll<HTMLElement>('.text-brand-text-secondary').forEach(el => { el.style.color = '#4b5563'; });
      elementToRender.querySelectorAll<HTMLElement>('.text-green-400').forEach(el => { el.style.color = '#166534'; });
      elementToRender.querySelectorAll<HTMLElement>('.text-red-400').forEach(el => { el.style.color = '#991b1b'; });
      elementToRender.querySelectorAll<HTMLElement>('.border-gray-700').forEach(el => { el.style.borderColor = '#e5e7eb'; });
      
      const tableHeads = elementToRender.querySelectorAll('thead');
      tableHeads.forEach((thead: HTMLElement) => {
          thead.style.backgroundColor = '#F3F4F6'; // Light gray background
          thead.querySelectorAll('th').forEach(th => { th.style.color = '#374151'; });
      });
      // --- END OF STYLING OVERRIDES ---

      if (barberShop.logo_url) {
        const logoImgElement = elementToRender.querySelector('img');
        if (logoImgElement) {
          try {
            const response = await fetch(barberShop.logo_url);
            if (!response.ok) throw new Error('Logo image could not be fetched.');
            const blob = await response.blob();
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            logoImgElement.src = dataUrl;
            await new Promise<void>((resolve) => {
              logoImgElement.onload = () => resolve();
              logoImgElement.onerror = () => resolve(); 
            });
          } catch (imgError) {
            console.error("Could not process logo for PDF, proceeding without it.", imgError);
          }
        }
      }

      elementToRender.style.position = 'absolute';
      elementToRender.style.left = '-9999px';
      document.body.appendChild(elementToRender);

      const canvas = await html2canvas(elementToRender, {
        backgroundColor: '#FFFFFF',
        scale: 2,
      });

      document.body.removeChild(elementToRender);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`reporte-${reportDate.getFullYear()}-${reportDate.getMonth() + 1}.pdf`);

    } catch (err: any) {
        console.error("Error generating PDF:", err);
        alert("Ocurrió un error al generar el PDF. Revisa la consola para más detalles.");
    } finally {
        setIsExporting(false);
    }
  };

  const getServiceNames = (services: Service[] | Service) => {
    const serviceList = Array.isArray(services) ? services : [services];
    return serviceList.map(s => s.name).join(', ');
  }
  const getTotalPrice = (services: Service[] | Service) => {
    const serviceList = Array.isArray(services) ? services : [services];
    return serviceList.reduce((acc, s) => acc + s.price, 0);
  }

  return (
    <>
    <div className="bg-brand-surface rounded-lg shadow-2xl p-6 md:p-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h3 className="text-2xl font-bold text-brand-text">Reportes y Finanzas</h3>
                <p className="text-sm text-brand-text-secondary">Analiza el rendimiento de tu negocio mes a mes.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                 <input type="month" value={`${reportDate.getFullYear()}-${String(reportDate.getMonth() + 1).padStart(2, '0')}`} onChange={e => setReportDate(new Date(e.target.value))} className="bg-brand-bg border border-gray-600 rounded-md py-2 px-3 text-brand-text w-full"/>
                 <button onClick={handleExportPDF} disabled={isExporting} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-bg bg-brand-primary hover:bg-brand-secondary disabled:bg-gray-500 whitespace-nowrap">{isExporting ? '...' : 'Exportar'}</button>
            </div>
        </div>
        
        <div className="p-4 md:p-8 bg-brand-surface">
            <h4 className="text-xl font-bold text-center text-brand-primary mb-8 capitalize">{reportDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <StatCard title="Ingresos Totales" value={`₲${monthlyRevenue.toLocaleString('es-PY')}`} />
                <StatCard title="Gastos Totales" value={`₲${monthlyExpenses.toLocaleString('es-PY')}`} />
                <StatCard title="Ganancia Neta" value={`₲${monthlyProfit.toLocaleString('es-PY')}`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <section>
                    <h5 className="font-bold text-brand-text mb-4">Servicios Más Populares</h5>
                    {topServices.length > 0 ? (
                        <ul className="space-y-2">{topServices.map(([name, count]) => <li key={name} className="flex justify-between bg-black/20 p-3 rounded-md text-sm"><span>{name}</span><span className="font-semibold">{count} {count > 1 ? 'veces' : 'vez'}</span></li>)}</ul>
                    ) : <p className="text-sm text-brand-text-secondary">No hay servicios completados este mes.</p>}
                </section>
                <section>
                    <h5 className="font-bold text-brand-text mb-4">Ingresos por Ventas de Productos</h5>
                     <ul className="space-y-2">{productSales.map(sale => (
                        <li key={sale.id} className="flex justify-between items-center bg-black/20 p-3 rounded-md text-sm">
                            <div><span>{sale.description}</span><p className="text-xs text-brand-text-secondary">{new Date(sale.date).toLocaleDateString('es-ES')}</p></div>
                            <div className="flex items-center gap-3"><span className="font-semibold text-green-400">+ ₲{Math.abs(sale.amount).toLocaleString('es-PY')}</span></div>
                        </li>
                    ))}</ul>
                    {productSales.length === 0 && <p className="text-sm text-brand-text-secondary">No se registraron ventas de productos este mes.</p>}
                </section>
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h5 className="font-bold text-brand-text">Gastos del Mes</h5>
                        <button onClick={() => setShowExpenseForm(!showExpenseForm)} className="text-sm py-1 px-3 bg-brand-primary/20 text-brand-primary rounded-md hover:bg-brand-primary/40">{showExpenseForm ? 'Cancelar' : '+ Añadir Gasto'}</button>
                    </div>
                    {showExpenseForm && (
                        <form onSubmit={handleAddExpenseSubmit} className="flex flex-col sm:flex-row gap-2 mb-4 p-3 bg-black/20 rounded-md">
                            <input type="text" placeholder="Descripción" value={expenseDescription} onChange={e => setExpenseDescription(e.target.value)} required className="flex-grow bg-brand-bg border border-gray-600 rounded-md text-sm p-2"/>
                            <input type="number" placeholder="Monto" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} required className="w-full sm:w-28 bg-brand-bg border border-gray-600 rounded-md text-sm p-2"/>
                            <button type="submit" className="py-2 px-3 bg-brand-primary text-brand-bg font-bold rounded-md text-sm">OK</button>
                        </form>
                    )}
                    <ul className="space-y-2">{realExpenses.map(expense => (
                        <li key={expense.id} className="flex justify-between items-center bg-black/20 p-3 rounded-md text-sm">
                            <div><span>{expense.description}</span><p className="text-xs text-brand-text-secondary">{new Date(expense.date).toLocaleDateString('es-ES')}</p></div>
                            <div className="flex items-center gap-3"><span className="font-semibold">- ₲{Number(expense.amount).toLocaleString('es-PY')}</span><button onClick={() => onDeleteExpense(expense.id)} className="text-red-500 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button></div>
                        </li>
                    ))}</ul>
                    {realExpenses.length === 0 && <p className="text-sm text-brand-text-secondary">No se registraron gastos este mes.</p>}
                </section>
            </div>
        </div>
    </div>
    
    {/* Hidden element for PDF export */}
    <div className="hidden">
        <div ref={pdfReportRef} className="p-10 bg-brand-surface text-brand-text" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Inter' }}>
            <header className="flex justify-between items-center mb-10 border-b-2 border-brand-primary pb-4">
                {barberShop.logo_url && <img src={barberShop.logo_url} alt="logo" style={{width: '80px', height: '80px', borderRadius: '8px'}} />}
                <div className="text-right">
                    <h1 className="text-3xl font-bold text-brand-primary" style={{ fontFamily: "'Playfair Display', serif" }}>Reporte Mensual</h1>
                    <p className="text-brand-text-secondary">{barberShop.name}</p>
                    <p className="text-brand-text-secondary text-lg capitalize">{reportDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</p>
                </div>
            </header>
            
            <section className="grid grid-cols-3 gap-6 mb-10 text-center">
                 <div><h3 className="text-sm font-semibold uppercase text-brand-text-secondary">Ingresos</h3><p className="text-2xl font-bold text-green-400">₲{monthlyRevenue.toLocaleString('es-PY')}</p></div>
                 <div><h3 className="text-sm font-semibold uppercase text-brand-text-secondary">Gastos</h3><p className="text-2xl font-bold text-red-400">₲{monthlyExpenses.toLocaleString('es-PY')}</p></div>
                 <div><h3 className="text-sm font-semibold uppercase text-brand-text-secondary">Ganancia Neta</h3><p className="text-2xl font-bold text-brand-primary">₲{monthlyProfit.toLocaleString('es-PY')}</p></div>
            </section>
            
            <section className="mb-10">
                <h2 className="text-xl font-bold text-brand-primary mb-4">Desglose de Ingresos (Servicios)</h2>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead style={{backgroundColor: '#121212'}}><tr className="text-left"><th className="p-3 text-xs uppercase">Fecha</th><th className="p-3 text-xs uppercase">Cliente</th><th className="p-3 text-xs uppercase">Servicios</th><th className="p-3 text-xs uppercase text-right">Monto</th></tr></thead>
                    <tbody>{filteredBookings.map(b => <tr key={b.id} className="border-b border-gray-700"><td className="p-3 text-sm">{new Date(b.date).toLocaleDateString('es-ES')}</td><td className="p-3 text-sm">{b.customer.name}</td><td className="p-3 text-sm">{getServiceNames(b.service)}</td><td className="p-3 text-sm text-right">₲{getTotalPrice(b.service).toLocaleString('es-PY')}</td></tr>)}</tbody>
                </table>
            </section>
            
            <section className="mb-10">
                <h2 className="text-xl font-bold text-brand-primary mb-4">Desglose de Ingresos (Productos)</h2>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead style={{backgroundColor: '#121212'}}><tr className="text-left"><th className="p-3 text-xs uppercase">Fecha</th><th className="p-3 text-xs uppercase">Descripción</th><th className="p-3 text-xs uppercase text-right">Monto</th></tr></thead>
                    <tbody>{productSales.map(s => <tr key={s.id} className="border-b border-gray-700"><td className="p-3 text-sm">{new Date(s.date).toLocaleDateString('es-ES')}</td><td className="p-3 text-sm">{s.description}</td><td className="p-3 text-sm text-right">₲{Math.abs(s.amount).toLocaleString('es-PY')}</td></tr>)}</tbody>
                </table>
            </section>

             <section className="mb-10">
                <h2 className="text-xl font-bold text-brand-primary mb-4">Desglose de Gastos</h2>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead style={{backgroundColor: '#121212'}}><tr className="text-left"><th className="p-3 text-xs uppercase">Fecha</th><th className="p-3 text-xs uppercase">Descripción</th><th className="p-3 text-xs uppercase text-right">Monto</th></tr></thead>
                    <tbody>{realExpenses.map(e => <tr key={e.id} className="border-b border-gray-700"><td className="p-3 text-sm">{new Date(e.date).toLocaleDateString('es-ES')}</td><td className="p-3 text-sm">{e.description}</td><td className="p-3 text-sm text-right">- ₲{Number(e.amount).toLocaleString('es-PY')}</td></tr>)}</tbody>
                </table>
            </section>

            <footer style={{position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', fontSize: '12px', color: '#A0A0A0'}}>
                Generado por NestorBarberPro
            </footer>
        </div>
    </div>
    </>
  );
};
