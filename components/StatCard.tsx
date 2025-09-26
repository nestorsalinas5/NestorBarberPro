import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
    return (
        <div className="bg-brand-light-beige text-brand-dark-charcoal p-6 rounded-lg shadow-lg">
            <h3 className="text-sm font-semibold text-brand-dark-charcoal/70 uppercase tracking-wider">{title}</h3>
            <p className="mt-2 text-4xl font-bold text-brand-dark-green font-serif">
                {value}
            </p>
        </div>
    );
};
