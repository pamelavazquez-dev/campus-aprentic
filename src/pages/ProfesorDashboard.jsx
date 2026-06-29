import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';

export default function ProfesorDashboard({ profile }) {
  return (
    <section>
      <PageHeader
        eyebrow="Profesor"
        title="Teacher Dashboard"
        description={profile?.nombre || 'Panel del profesor'}
      />

      <div className="summary-grid">
        <StatCard label="Promociones" value={profile?.promocion_id?.length || 0} helper="Grupos asignados" />
        <StatCard label="Campus" value={profile?.campus_id || 'Sin asignar'} helper="Sede principal" />
      </div>
    </section>
  );
}
