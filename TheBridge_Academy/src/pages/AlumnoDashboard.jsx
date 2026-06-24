import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';

export default function AlumnoDashboard({ profile }) {
  return (
    <section>
      <PageHeader
        eyebrow="Alumno"
        title="Mi Campus"
        description={profile?.nombre || 'Bienvenido a AprenTIC Campus'}
      />

      <div className="summary-grid">
        <StatCard label="Promociones" value={profile?.promociones_id?.length || 0} helper="Programas activos" />
        <StatCard label="Modulos activos" value={profile?.modulos_id?.length || 0} helper="Contenido desbloqueado" />
      </div>
    </section>
  );
}
