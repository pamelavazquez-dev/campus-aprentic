export default function Logo({ size = 'md', showText = true, className = '' }) {
  // Dimensiones base del SVG original: 137x32. El isotipo ocupa aproximadamente 32x32.
  const dimensions = {
    sm: { h: 'h-[24px]', wFull: 'w-[102px]', wIcon: 'w-[24px]' },
    md: { h: 'h-[32px]', wFull: 'w-[137px]', wIcon: 'w-[32px]' },
    lg: { h: 'h-[40px]', wFull: 'w-[171px]', wIcon: 'w-[40px]' },
    xl: { h: 'h-[56px]', wFull: 'w-[240px]', wIcon: 'w-[56px]' }
  };

  const dim = dimensions[size] || dimensions.md;
  const currentWidth = showText ? dim.wFull : dim.wIcon;

  return (
    <div className={`relative overflow-hidden flex-shrink-0 transition-all duration-300 ${dim.h} ${currentWidth} ${className}`}>
      {/* 
        El filtro dark:invert dark:hue-rotate-180 funciona de maravilla aquí: 
        - Invierte el negro (texto) a blanco.
        - Invierte el rojo, y al rotarlo 180 grados vuelve a ser rojo (ligeramente oscurecido).
        - Así el logo se adapta perfectamente al dark mode. 
      */}
      <img 
        src="/Logo.svg" 
        alt="The Bridge" 
        className={`h-full max-w-none object-left object-cover dark:invert dark:hue-rotate-180`}
      />
    </div>
  );
}
