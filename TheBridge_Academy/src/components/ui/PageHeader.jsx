export default function PageHeader({ title, description, eyebrow, actions }) {
  return (
    <div className="bg-gradient-to-r from-surface to-brand-primary/10 rounded-3xl p-8 lg:p-10 border border-border-default shadow-sm relative overflow-hidden mb-8 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/20 blur-3xl rounded-full pointer-events-none"></div>
      <div className="relative z-10 flex flex-col gap-2">
        {eyebrow && <span className="text-brand-primary font-black text-xs uppercase tracking-widest">{eyebrow}</span>}
        <h2 className="text-3xl lg:text-4xl font-black text-text-strong tracking-tight mb-0">{title}</h2>
        {description && <p className="text-text-secondary text-lg font-medium max-w-2xl m-0">{description}</p>}
      </div>
      {actions && <div className="relative z-10 flex items-center gap-3">{actions}</div>}
    </div>
  );
}
