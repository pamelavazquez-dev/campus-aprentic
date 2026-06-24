import toast from 'react-hot-toast';
import { useState, useEffect, useContext } from 'react';
import { DataContext } from '../../context/DataContext';
import { getAllNotas, createNota, updateNota } from '../../services/notas.service';

export default function CalificacionesView() {
  const { usuarios, modulos, loading } = useContext(DataContext);
  const [notas, setNotas] = useState([]);
  const [loadingNotas, setLoadingNotas] = useState(true);
  const [selectedModulo, setSelectedModulo] = useState('');
  const [notaForm, setNotaForm] = useState({ id: null, alumnoId: '', valor: '', comentario: '' });
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

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
  }, []);

  // Alumnos matriculados en el módulo seleccionado
  const alumnosDelModulo = usuarios.filter(u => 
    u.rol === 'Alumno' && u.modulos_id && u.modulos_id.includes(selectedModulo)
  );

  const handleOpenGrade = (alumno) => {
    // Buscar si ya tiene nota para este módulo (usando moduloId en lugar de proyectoId)
    const existingNota = notas.find(n => n.alumnoId === alumno.id && n.proyectoId === selectedModulo);
    
    setNotaForm({
      id: existingNota?.id || null,
      alumnoId: alumno.id,
      valor: existingNota?.valor || '',
      comentario: existingNota?.comentario || ''
    });
    setShowModal(true);
  };

  const handleSaveNota = async () => {
    setSaving(true);
    try {
      const data = {
        proyectoId: selectedModulo,
        alumnoId: notaForm.alumnoId,
        profesorId: 'current-instructor', // This should technically come from auth context
        valor: Number(notaForm.valor),
        comentario: notaForm.comentario,
        creadoEn: new Date(),
        actualizadoEn: new Date()
      };

      if (notaForm.id) {
        await updateNota(notaForm.id, data);
      } else {
        const newId = `NOT-${Date.now()}`;
        await createNota(newId, data);
      }
      
      await fetchNotas();
      setShowModal(false);
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar la nota");
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingNotas) return <div>Cargando calificaciones...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="bg-gradient-to-br from-[#0f172a] to-[#3e0c15] rounded-2xl relative overflow-hidden border border-white/10" style={{ padding: '32px 48px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 900, margin: 0, color: 'white' }}>Evaluaciones y Notas</h2>
        <p style={{ color: '#B9C0CA', margin: '8px 0 0 0', fontSize: '16px' }}>Califica el desempeño de tus alumnos por módulo.</p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
          Seleccionar Módulo
        </label>
        <select
          className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
          value={selectedModulo}
          onChange={e => setSelectedModulo(e.target.value)}
          style={{ fontSize: '15px', fontWeight: 600, padding: '12px 16px', width: '100%', maxWidth: '400px' }}
        >
          <option value="">-- Elige un módulo --</option>
          {modulos.map(m => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>
      </div>

      {selectedModulo && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: '16px 0 0 0', fontSize: '20px', color: 'var(--text-strong)' }}>
            Alumnos Matriculados ({alumnosDelModulo.length})
          </h3>

          {alumnosDelModulo.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No hay alumnos matriculados en este módulo.</p>
          ) : (
            alumnosDelModulo.map(alumno => {
              const existingNota = notas.find(n => n.alumnoId === alumno.id && n.proyectoId === selectedModulo);
              
              return (
                <div key={alumno.id} className="bg-surface backdrop-blur-lg border border-border-default rounded-xl p-8 shadow-sm transition-all duration-400 hover:-translate-y-[6px] hover:shadow-md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-strong)' }}>{alumno.nombre || alumno.email}</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{alumno.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    {existingNota ? (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: existingNota.valor >= 5 ? '#10B981' : '#EF4444' }}>
                          {existingNota.valor}/10
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Evaluado</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#F59E0B' }}>Sin calificar</div>
                    )}
                    <button className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => handleOpenGrade(alumno)}>
                      {existingNota ? 'Modificar Nota' : 'Evaluar'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in flex flex-col max-h-[90vh]" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="p-6 border-b border-border-default flex justify-between items-center bg-gray150/50 rounded-t-2xl">
              <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-strong)' }}>Calificar Alumno</h3>
              <button className="bg-transparent text-[#94A3B8] border-none p-2 rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-center hover:bg-surface-solid hover:text-brand-primary" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '24px 0' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Calificación (0-10)</label>
                <input 
                  type="number" 
                  min="0" max="10" step="0.1"
                  className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]" 
                  style={{ width: '100%', padding: '12px' }}
                  value={notaForm.valor} 
                  onChange={e => setNotaForm({...notaForm, valor: e.target.value})} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Comentario / Feedback</label>
                <textarea 
                  className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]" 
                  style={{ width: '100%', padding: '12px', minHeight: '100px', resize: 'vertical' }}
                  value={notaForm.comentario} 
                  onChange={e => setNotaForm({...notaForm, comentario: e.target.value})}
                  placeholder="Buen trabajo en..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', padding: '24px' }}>
              <button className="bg-transparent text-[#64748B] border-none py-2 px-4 rounded-md text-sm font-black cursor-pointer transition-colors duration-300 hover:bg-black/5 hover:text-brand-primary inline-flex items-center justify-center gap-2" disabled={saving} onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" disabled={saving || notaForm.valor === ''} onClick={handleSaveNota}>
                {saving ? 'Guardando...' : 'Guardar Calificación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
