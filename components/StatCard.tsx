import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
    return (
        <div className="bg-brand-surface p-6 rounded-lg shadow-lg">
            <h3 className="text-sm font-semibold text-brand-text-secondary uppercase tracking-wider">{title}</h3>
            <p className="mt-2 text-4xl font-bold text-brand-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                {value}
            </p>
        </div>
    );
};
