import { memo } from 'react';

const StatCard = memo(function StatCard({ label, value, helper }) {
  return (
    <article className="bg-surface backdrop-blur-lg border border-border-default rounded-2xl p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <strong className="text-4xl font-extrabold text-text-strong mt-4">{value}</strong>
      {helper && <p className="text-xs font-semibold text-brand-primary mt-2">{helper}</p>}
    </article>
  );
});

export default StatCard;
