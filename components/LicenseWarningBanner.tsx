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
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 text-sm p-4 rounded-md mb-6 text-left animate-fade-in">
      <strong className="font-bold">¡Atención!</strong>
      <span className="block sm:inline ml-2">{message} Por favor, contacta al administrador para renovarla y evitar la suspensión del servicio.</span>
    </div>
  );
};
