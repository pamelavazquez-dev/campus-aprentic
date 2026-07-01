import React from 'react';

export default function GlobalLoader({ text = "Cargando The Bridge Academy..." }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-surface overflow-hidden">
      {/* Fondo con gradientes animados */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-brand-primary/10 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-brand-primary/5 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 flex w-full max-w-[320px] flex-col items-center gap-8 px-6 text-center animate-fade-in">
        {/* Contenedor del Logo con brillo */}
        <div className="relative flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 bg-brand-gradient opacity-30 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-20 h-20 bg-surface border border-border-default rounded-2xl shadow-xl flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-brand-primary animate-float" style={{ animation: 'float 3s ease-in-out infinite' }}>
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.3"/>
              <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Texto y Spinner inline */}
        <div className="flex w-full flex-col items-center gap-3">
          <h2 className="m-0 max-w-full text-center text-xl font-black text-text-strong tracking-tight leading-tight break-words">{text}</h2>
          <div className="flex gap-1.5 items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-primary/40 animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2.5 h-2.5 rounded-full bg-brand-primary/70 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
            <div className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
