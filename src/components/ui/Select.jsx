import { useState, useRef, useEffect } from 'react';

export default function Select({ 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Seleccionar...',
  className = '',
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || null;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className={`w-full px-4 py-2.5 bg-surface-solid border border-border-default rounded-xl text-sm text-text-strong transition-all duration-200 outline-none hover:border-brand-primary/50 flex justify-between items-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${isOpen ? 'ring-4 ring-brand-primary/10 border-brand-primary' : ''}`}
      >
        <span className={!selectedOption && placeholder ? 'text-text-secondary' : 'text-text-strong'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg 
          className={`w-4 h-4 text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-surface backdrop-blur-xl border border-border-default rounded-xl shadow-xl overflow-hidden animate-fade-in origin-top">
          <ul className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors duration-200 flex items-center justify-between
                  ${value === opt.value 
                    ? 'bg-brand-primary/10 text-brand-primary font-bold' 
                    : 'text-text-strong hover:bg-brand-primary/5 hover:text-brand-primary'
                  }`}
              >
                {opt.label}
                {value === opt.value && (
                  <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </li>
            ))}
            {options.length === 0 && (
              <li className="px-4 py-3 text-sm text-text-secondary text-center">
                Sin opciones
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
