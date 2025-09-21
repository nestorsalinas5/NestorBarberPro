import React from 'react';

interface LicenseWarningBannerProps {
  licenseExpiresAt: string | null;
}

export const LicenseWarningBanner: React.FC<LicenseWarningBannerProps> = ({ licenseExpiresAt }) => {
  if (!licenseExpiresAt) return null;

  const expires = new Date(licenseExpiresAt);
  const now = new Date();
  const diffTime = expires.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 10 || diffDays < 0) {
    return null;
  }

  const message = diffDays === 0 
    ? "Tu licencia expira hoy." 
    : `Tu licencia expira en ${diffDays} ${diffDays === 1 ? 'día' : 'días'}.`;

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm p-4 rounded-lg mb-6 text-center animate-fade-in">
      <strong>¡Atención!</strong> {message} Por favor, contacta al administrador para renovarla y evitar la suspensión del servicio.
    </div>
  );
};
