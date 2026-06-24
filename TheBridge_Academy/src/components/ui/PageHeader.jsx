export default function PageHeader({ title, description, eyebrow, actions }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-gradient-to-br from-[#0f172a] to-[#3e0c15] rounded-2xl p-8 lg:px-12 border border-white/10 shadow-lg relative overflow-hidden animate-fade-in">
      <div className="relative z-10 flex flex-col gap-2">
        {eyebrow && <span className="!text-brand-primary font-black text-xs uppercase tracking-widest">{eyebrow}</span>}
        <h2 className="text-3xl lg:text-4xl font-extrabold !text-white m-0 tracking-tight">{title}</h2>
        {description && <p className="!text-slate-300 font-medium m-0 max-w-2xl text-sm lg:text-base">{description}</p>}
      </div>
      {actions && <div className="relative z-10 flex items-center gap-3">{actions}</div>}
    </div>
  );
}
