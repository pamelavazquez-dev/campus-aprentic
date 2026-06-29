import React, { useState } from 'react';

// Genera un color consistente basado en el string (nombre o email)
const stringToColor = (str) => {
  let hash = 0;
  if (!str) return hash;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

// Obtiene iniciales
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

export default function Avatar({ src, name = '', size = 'md', rounded = 'rounded-full', className = '' }) {
  const [imgError, setImgError] = useState(false);

  // Configuración de tamaños
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;
  const initials = getInitials(name);

  // Generamos un gradiente bonito, dinámico y consistente
  const hash = stringToColor(name);
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 40) % 360; // Desplazamiento de 40 grados para un gradiente suave análogo
  
  const gradientStyle = {
    background: `linear-gradient(135deg, hsl(${h1}, 80%, 65%), hsl(${h2}, 80%, 45%))`,
    color: '#ffffff'
  };

  if (src && !imgError) {
    return (
      <img 
        src={src} 
        alt={name}
        onError={() => setImgError(true)}
        className={`object-cover ${rounded} shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md ${currentSizeClass} ${className}`} 
      />
    );
  }

  return (
    <div 
      className={`relative inline-flex shrink-0 items-center justify-center ${rounded} shadow-sm transition-all duration-300 hover:scale-105 hover:rotate-3 hover:shadow-md overflow-hidden font-black ${currentSizeClass} ${className}`}
      style={gradientStyle}
      title={name}
    >
      <span className="drop-shadow-md">{initials}</span>
      <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
}
