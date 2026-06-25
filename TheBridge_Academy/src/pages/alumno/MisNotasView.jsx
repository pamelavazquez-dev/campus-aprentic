import { useState, useEffect, useContext, useMemo } from 'react';
import { DataContext } from '../../context/DataContext';
import { useAuth } from '../../hooks/useAuth';
import { getAllNotas } from '../../services/notas.service';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function MisNotasView() {
  const { user } = useAuth();
  const { modulos, loading: dataLoading } = useContext(DataContext);
  const [notas, setNotas] = useState([]);
  const [loadingNotas, setLoadingNotas] = useState(true);
  const [alumnoActual, setAlumnoActual] = useState(null);

  const fetchNotas = async () => {
    try {
      const data = await getAllNotas();
      setNotas(data);
    } catch (error) {
      console.error("Error cargando notas:", error);
    } finally {
      setLoadingNotas(false);
    }
  };

  useEffect(() => {
    fetchNotas();
    
    const fetchAlumno = async () => {
      if (user) {
        try {
          let currentAlumno = null;
          const alumnoDoc = await getDoc(doc(db, 'alumnos', user.uid));
          if (alumnoDoc.exists()) {
            currentAlumno = { id: alumnoDoc.id, ...alumnoDoc.data() };
          } else if (user.email) {
            const q = query(collection(db, 'alumnos'), where('email', '==', user.email), limit(1));
            const snap = await getDocs(q);
            if (!snap.empty) {
              const d = snap.docs[0];
              currentAlumno = { id: d.id, ...d.data() };
            }
          }
          if (currentAlumno) {
            setAlumnoActual(currentAlumno);
          }
        } catch (error) {
          console.error("Error cargando perfil de alumno:", error);
        }
      }
    };
    fetchAlumno();
  }, [user]);

  // Filtrar notas para el alumno actual
  const misNotas = useMemo(() => {
    if (!alumnoActual) return [];
    return notas.filter(n => n.alumnoId === alumnoActual.id);
  }, [notas, alumnoActual]);

  if (dataLoading || loadingNotas) return <div>Cargando tus notas...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="bg-gradient-to-br from-[#0f172a] to-[#3e0c15] rounded-2xl relative overflow-hidden border border-white/10" style={{ padding: '32px 48px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 900, margin: 0, color: 'white' }}>Mis Calificaciones</h2>
        <p style={{ color: '#B9C0CA', margin: '8px 0 0 0', fontSize: '16px' }}>Aquí puedes ver el resultado de tus evaluaciones y el feedback de tus instructores.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {misNotas.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', background: 'var(--surface)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>Aún no tienes calificaciones.</p>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>Tus notas aparecerán aquí cuando los instructores evalúen tu desempeño.</p>
          </div>
        ) : (
          misNotas.map(nota => {
            const moduloAsociado = modulos.find(m => m.id === nota.proyectoId);
            const isAprobado = nota.valor >= 5;

            return (
              <div key={nota.id} className="bg-surface backdrop-blur-lg border border-border-default rounded-xl p-8 shadow-sm transition-all duration-400 hover:-translate-y-[6px] hover:shadow-md" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-strong)', margin: '0 0 4px 0' }}>
                      {moduloAsociado?.nombre || 'Módulo Desconocido'}
                    </h3>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Evaluado el {nota.actualizadoEn ? new Date(nota.actualizadoEn).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '32px', fontWeight: 900, color: isAprobado ? '#10B981' : '#EF4444', lineHeight: 1 }}>
                      {nota.valor}<span style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>/10</span>
                    </div>
                    <span style={{ 
                      display: 'inline-block', marginTop: '8px', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                      background: isAprobado ? '#D1FAE5' : '#FEE2E2',
                      color: isAprobado ? '#065F46' : '#991B1B'
                    }}>
                      {isAprobado ? 'Aprobado' : 'Suspenso'}
                    </span>
                  </div>
                </div>
                
                {nota.comentario && (
                  <div style={{ background: 'var(--gray50)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Feedback del Instructor
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-strong)', lineHeight: 1.6 }}>
                      "{nota.comentario}"
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
