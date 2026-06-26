export default function Logo({ size = 'md', showText = true, className = '' }) {
  const dimensions = {
    sm: { h: 'h-[24px]', wFull: 'w-[102px]', wIcon: 'w-[24px]', smallText: 'text-[7px]', bigText: 'text-[19px]' },
    md: { h: 'h-[32px]', wFull: 'w-[137px]', wIcon: 'w-[32px]', smallText: 'text-[9px]', bigText: 'text-[25px]' },
    lg: { h: 'h-[40px]', wFull: 'w-[171px]', wIcon: 'w-[40px]', smallText: 'text-[11px]', bigText: 'text-[31px]' },
    xl: { h: 'h-[56px]', wFull: 'w-[240px]', wIcon: 'w-[56px]', smallText: 'text-[15px]', bigText: 'text-[44px]' },
  };

  const dim = dimensions[size] || dimensions.md;

  return (
    <div className={`relative flex-shrink-0 transition-all duration-300 ${dim.h} ${showText ? dim.wFull : dim.wIcon} ${className}`}>
      {showText ? (
        <div className="flex h-full items-center gap-1" aria-label="The Bridge">
          <div className={`relative overflow-hidden ${dim.h} ${dim.wIcon} flex-shrink-0`}>
            <img
              src="/Logo.svg"
              alt=""
              aria-hidden="true"
              className="h-full max-w-none object-left object-cover logo-image"
            />
          </div>
          <div className="flex flex-col justify-center leading-none text-black dark:text-white">
            <span className={`font-['Montserrat'] ${dim.smallText} font-black tracking-tight`}>THE</span>
            <span className={`font-['Montserrat'] ${dim.bigText} font-black tracking-tight -mt-[1px]`}>BRIDGE</span>
          </div>
        </div>
      ) : (
        <div className={`relative overflow-hidden ${dim.h} ${dim.wIcon}`}>
          <img
            src="/Logo.svg"
            alt="The Bridge"
            className="h-full max-w-none object-left object-cover logo-image"
          />
        </div>
      )}
    </div>
  );
}
