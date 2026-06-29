import { memo } from 'react';

const Badge = memo(function Badge({ children, variant = 'neutral' }) {
  const styles = {
    neutral: 'bg-slate-100 text-slate-600 border border-slate-200',
    success: 'bg-green-100 text-green-700 border border-green-200',
    danger: 'bg-red-100 text-red-700 border border-red-200',
    warning: 'bg-amber-100 text-amber-700 border border-amber-200',
    primary: 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${styles[variant] || styles.neutral}`}>
      {children}
    </span>
  );
});

export default Badge;
