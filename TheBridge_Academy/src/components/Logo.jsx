export default function Logo({ size = 'md', showText = true }) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: { the: 'text-[8px]', bridge: 'text-[16px]', mt: '-mt-0.5' },
    md: { the: 'text-[10px]', bridge: 'text-[20px]', mt: '-mt-1' },
    lg: { the: 'text-[14px]', bridge: 'text-[28px]', mt: '-mt-1.5' },
    xl: { the: 'text-[20px]', bridge: 'text-[40px]', mt: '-mt-2' }
  };

  const t = textSizes[size];

  return (
    <div className="flex items-center gap-3">
      {/* Logo Icon */}
      <div className={`${iconSizes[size]} text-brand-primary flex-shrink-0 drop-shadow-sm`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Red rounded square */}
          <rect width="100" height="100" rx="20" fill="currentColor" />
          {/* White bridge/arch shape */}
          <path d="M20 45 h60 v40 h-20 v-20 h-20 v20 h-20 z" fill="white" />
        </svg>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col items-start leading-none tracking-tight font-black text-text-strong uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          <span className={`${t.the}`}>THE</span>
          <span className={`${t.bridge} ${t.mt}`}>BRIDGE</span>
        </div>
      )}
    </div>
  );
}
