import { useState, useEffect, useMemo, useContext, useRef } from 'react';
import { getAllModulos, updateModulo } from '../../services/modulos.service';
import { getAllLecciones, createLeccion, deleteLeccion } from '../../services/lecciones.service';
import { useNavigate } from 'react-router-dom';
import { useRBAC } from '../../hooks/useRBAC';
import { useAuth } from '../../hooks/useAuth';
import { DataContext } from '../../context/DataContext';
import { ROLES } from '../../utils/rbac';
import { usePDFImport } from '../../hooks/usePDFImport';
import toast from 'react-hot-toast';
import { filterModulesByTracks, getProfesorTracks, getUniqueModulesByName, inferModuleTrack } from '../../utils/academicFilters';
import Select from '../../components/ui/Select';

export default function WizardCurso() {
  const [modulos, setModulos] = useState([]);
  const [lecciones, setLecciones] = useState([]);
  const [selectedPromocion, setSelectedPromocion] = useState('');
  const [selectedModulo, setSelectedModulo] = useState('');
  const [expandedLeccion, setExpandedLeccion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCrear, setShowCrear] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nuevaLeccion, setNuevaLeccion] = useState({ titulo: '', descripcion: '', contenido_url: '', videos_url: '' });
  const { isImporting, importPDF, clearPDF, markdownRef, markdownKey } = usePDFImport();
  const [mensaje, setMensaje] = useState({ text: '', type: '' });
  const navigate = useNavigate();
  const { isAuthorized } = useRBAC();
  const { profile } = useAuth();
  const { promociones } = useContext(DataContext);
  const isAdmin = isAuthorized(ROLES.ADMIN);
  const profesorTracks = useMemo(
    () => getProfesorTracks(profile, promociones),
    [profile, promociones]
  );
  const profesorPromociones = useMemo(() => {
    if (isAdmin) return promociones;
    const ids = Array.isArray(profile?.promocion_id) ? profile.promocion_id : [profile?.promocion_id].filter(Boolean);
    return promociones.filter(p => ids.includes(p.id));
  }, [isAdmin, profile, promociones]);

  // Set default promotion
  useEffect(() => {
    if (!selectedPromocion && profesorPromociones.length > 0) {
      setSelectedPromocion(profesorPromociones[0].id);
    }
  }, [profesorPromociones, selectedPromocion]);

  const fetchData = async () => {
    try {
      const [mods, lecs] = await Promise.all([getAllModulos(), getAllLecciones()]);
      const visibleMods = isAdmin
        ? mods
        : getUniqueModulesByName(filterModulesByTracks(mods, profesorTracks));

      setModulos(visibleMods);
      setLecciones(lecs);
      if (!selectedModulo && visibleMods.length > 0) {
        setSelectedModulo(visibleMods[0].id);
      }
    } catch (e) {
      console.error('Error cargando datos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [isAdmin, profesorTracks.join('|')]);

  // Filtrar lecciones por módulo seleccionado
  const leccionesFiltradas = useMemo(() => {
    if (!selectedModulo) return [];
    return lecciones.filter(l => {
      const modId = typeof l.modulo_id === 'string' ? l.modulo_id : (l.modulo_id?.id || '');
      return modId === selectedModulo;
    });
  }, [lecciones, selectedModulo]);

  const moduloActual = modulos.find(m => m.id === selectedModulo);

  // Crear lección
  const handleCrearLeccion = async () => {
    if (!nuevaLeccion.titulo.trim()) return;
    
    // Verificar que el markdown insertado manualmente no supere 800 KB
    const sizeInKB = new Blob([markdownRef.current || '']).size / 1024;
    if (sizeInKB > 800) {
      setMensaje({ text: 'El contenido excede el límite de 800 KB.', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const lecId = `lec-${selectedModulo}-${Date.now()}`;
      const videosArray = nuevaLeccion.videos_url
        ? nuevaLeccion.videos_url.split(',').map(v => v.trim()).filter(Boolean)
        : [];
      await createLeccion(lecId, {
        modulo_id: selectedModulo,
        titulo: nuevaLeccion.titulo.trim(),
        descripcion: nuevaLeccion.descripcion.trim() || 'Sin descripción',
        contenido_url: nuevaLeccion.contenido_url.trim(),
        contenido_markdown: markdownRef.current,
        videos_url: videosArray
      });
      setMensaje({ text: `Lección "${nuevaLeccion.titulo}" creada con éxito.`, type: 'success' });
      setNuevaLeccion({ titulo: '', descripcion: '', contenido_url: '', videos_url: '' });
      clearPDF();
      setShowCrear(false);
      // Refrescar datos
      await fetchData();
    } catch (e) {
      console.error('Error al crear lección:', e);
      let errorMsg = 'Error al crear la lección. Inténtalo de nuevo.';
      if (e.issues) {
        errorMsg = e.issues.map(i => i.message).join(', ');
      } else if (e.message) {
        errorMsg = e.message;
      }
      setMensaje({ text: `Error: ${errorMsg}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Eliminar lección
  const handleEliminarLeccion = async (lecId, titulo) => {
    if (!window.confirm(`¿Seguro que quieres eliminar la lección "${titulo}"?`)) return;
    try {
      await deleteLeccion(lecId);
      setMensaje({ text: `Lección "${titulo}" eliminada.`, type: 'success' });
      setExpandedLeccion(null);
      await fetchData();
    } catch (e) {
      console.error('Error al eliminar lección:', e);
      setMensaje({ text: 'Error al eliminar la lección.', type: 'error' });
    }
  };

  const handlePDFUpload = async (event) => {
    await importPDF(event.target.files[0], 'pdf-wizard');
    event.target.value = '';
  };

  // Auto-clear mensajes
  useEffect(() => {
    if (mensaje.text) {
      const t = setTimeout(() => setMensaje({ text: '', type: '' }), 4000);
      return () => clearTimeout(t);
    }
  }, [mensaje]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid var(--gray200)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px auto' }}></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Cargando módulos y lecciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Page Header */}
      <div className="instructor-page-hero" style={{ margin: '-48px -48px 0 -48px', background: 'var(--surface-solid)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ padding: '32px 48px 32px 48px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 4px 0', color: 'var(--text-strong)', letterSpacing: '-0.5px' }}>
                Módulos y Lecciones
              </h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '15px' }}>
                Selecciona un módulo para gestionar sus lecciones.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de feedback */}
      {mensaje.text && (
        <div style={{
          padding: '12px 20px',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 600,
          animation: 'fadeSlideDown 0.3s ease',
          background: mensaje.type === 'success' ? '#D1FAE5' : '#FEE2E2',
          color: mensaje.type === 'success' ? '#065F46' : '#991B1B',
          border: `1px solid ${mensaje.type === 'success' ? '#A7F3D0' : '#FECACA'}`
        }}>
          {mensaje.type === 'success' ? '✓' : '✕'} {mensaje.text}
        </div>
      )}

      {/* Selectores */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            1. Seleccionar promocion
          </label>
          <Select
            value={selectedPromocion}
            onChange={setSelectedPromocion}
            options={profesorPromociones.map(p => ({
              value: p.id,
              label: p.nombre || p.id,
            }))}
          />
        </div>

        <div style={{ flex: 1, minWidth: '280px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            2. Seleccionar modulo
          </label>
          <Select
            value={selectedModulo}
            onChange={(value) => { setSelectedModulo(value); setExpandedLeccion(null); setShowCrear(false); }}
            options={modulos.map(m => ({
              value: m.id,
              label: `${m.nombre} - ${m.horas || 0}h`,
            }))}
          />
        </div>

        {/* Toggle Activo/Inactivo */}
        {!isAdmin && moduloActual && selectedPromocion && (
          <div
            onClick={async () => {
              const isCurrentlyActive = moduloActual.promociones_activas?.includes(selectedPromocion);
              const newPromocionesActivas = isCurrentlyActive 
                ? (moduloActual.promociones_activas || []).filter(id => id !== selectedPromocion)
                : [...(moduloActual.promociones_activas || []), selectedPromocion];
              
              try {
                await updateModulo(moduloActual.id, {
                  ...moduloActual,
                  promociones_activas: newPromocionesActivas
                });
                setMensaje({ text: `Módulo ${isCurrentlyActive ? 'bloqueado' : 'desbloqueado'} para esta promoción.`, type: 'success' });
                await fetchData();
              } catch (e) {
                console.error(e);
                setMensaje({ text: 'Error al cambiar estado del módulo.', type: 'error' });
              }
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
              border: `1px solid ${moduloActual.promociones_activas?.includes(selectedPromocion) ? '#A7F3D0' : '#FECACA'}`,
              background: moduloActual.promociones_activas?.includes(selectedPromocion) ? '#D1FAE5' : '#FEE2E2',
              transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
          >
            <div style={{
              width: '36px', height: '20px', borderRadius: '10px', position: 'relative',
              background: moduloActual.promociones_activas?.includes(selectedPromocion) ? '#10B981' : '#EF4444', transition: 'background 0.3s'
            }}>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%', background: 'white',
                position: 'absolute', top: '2px', transition: 'left 0.3s',
                left: moduloActual.promociones_activas?.includes(selectedPromocion) ? '18px' : '2px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}></div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: moduloActual.promociones_activas?.includes(selectedPromocion) ? '#065F46' : '#991B1B' }}>
              {moduloActual.promociones_activas?.includes(selectedPromocion) ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        )}

        {/* Botón Crear Lección */}
        {!isAdmin && (
          <button
            className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer"
            onClick={() => { setShowCrear(!showCrear); setExpandedLeccion(null); }}
            style={{ padding: '12px 24px', width: 'auto', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Nueva Lección
          </button>
        )}
      </div>

      {/* Formulario de creación de lección */}
      {showCrear && (
        <div style={{
          background: 'var(--surface-solid)',
          border: '2px solid var(--brand-primary)',
          borderRadius: '16px',
          padding: '28px',
          animation: 'fadeSlideDown 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: 'var(--text-strong)' }}>
              Crear nueva lección en: <span style={{ color: 'var(--brand-primary)' }}>{moduloActual?.nombre}</span>
            </h3>
            <button
              onClick={() => setShowCrear(false)}
              style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
            >✕</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Título de la lección *</label>
              <input
                className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
                value={nuevaLeccion.titulo}
                onChange={e => setNuevaLeccion({ ...nuevaLeccion, titulo: e.target.value })}
                placeholder="Ej: Introducción a React Hooks"
                style={{ width: '100%', padding: '12px 16px', fontSize: '15px' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Descripción</label>
              <textarea
                className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
                value={nuevaLeccion.descripcion}
                onChange={e => setNuevaLeccion({ ...nuevaLeccion, descripcion: e.target.value })}
                placeholder="Descripción del contenido de esta lección..."
                rows={3}
                style={{ width: '100%', padding: '12px 16px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>URL del contenido (Opcional)</label>
              <input
                className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
                value={nuevaLeccion.contenido_url}
                onChange={e => setNuevaLeccion({ ...nuevaLeccion, contenido_url: e.target.value })}
                placeholder="https://... o assets/lecciones/..."
                style={{ width: '100%', padding: '12px 16px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>URLs de vídeos (separados por coma)</label>
              <input
                className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
                value={nuevaLeccion.videos_url}
                onChange={e => setNuevaLeccion({ ...nuevaLeccion, videos_url: e.target.value })}
                placeholder="url1.mp4, url2.mp4"
                style={{ width: '100%', padding: '12px 16px', fontSize: '14px' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>Contenido Markdown</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    onChange={handlePDFUpload} 
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    title="Importar texto de PDF"
                  />
                  <button 
                    type="button" 
                    style={{ background: 'rgba(255,48,69,0.1)', color: 'var(--brand-primary)', border: '1px solid rgba(255,48,69,0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {isImporting ? '⏳ Importando...' : '📄 Importar de PDF'}
                  </button>
                </div>
              </div>
              <textarea
                key={markdownKey}
                className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
                defaultValue={markdownRef.current}
                onChange={e => { markdownRef.current = e.target.value; }}
                placeholder="# Título Principal\n\nEl texto de tu lección aquí..."
                rows={6}
                style={{ width: '100%', padding: '12px 16px', fontSize: '14px', resize: 'vertical', fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button className="bg-transparent text-[#64748B] border-none py-2 px-4 rounded-md text-sm font-black cursor-pointer transition-colors duration-300 hover:bg-black/5 hover:text-brand-primary inline-flex items-center justify-center gap-2" onClick={() => setShowCrear(false)} style={{ padding: '10px 20px', width: 'auto' }}>
              Cancelar
            </button>
            <button
              className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer"
              onClick={handleCrearLeccion}
              disabled={saving || isImporting || !nuevaLeccion.titulo.trim()}
              style={{ padding: '10px 24px', width: 'auto' }}
            >
              {saving ? 'Guardando...' : 'Crear Lección'}
            </button>
          </div>
        </div>
      )}

      {/* Info del módulo seleccionado */}
      {moduloActual && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Módulo</span>
            <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-strong)' }}>{moduloActual.nombre}</span>
          </div>
          <div style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duración</span>
            <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-strong)' }}>{moduloActual.horas || 0} horas</span>
          </div>
          <div style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lecciones</span>
            <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-strong)' }}>{leccionesFiltradas.length}</span>
          </div>
        </div>
      )}

      {/* Lista de Lecciones */}
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 800, color: 'var(--text-strong)' }}>
          Lecciones del módulo
        </h3>

        {leccionesFiltradas.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', background: 'var(--surface-solid)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--gray150)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '28px' }}>📄</div>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>No hay lecciones</p>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 16px 0', fontSize: '14px' }}>Este módulo no tiene lecciones asociadas todavía.</p>
            {!isAdmin && (
              <button className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" onClick={() => setShowCrear(true)} style={{ width: 'auto', padding: '10px 24px' }}>
                + Crear la primera lección
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {leccionesFiltradas.map((lec, index) => {
              const isExpanded = expandedLeccion === lec.id;
              return (
                <div
                  key={lec.id}
                  style={{
                    background: 'var(--surface-solid)',
                    border: `1px solid ${isExpanded ? 'var(--brand-primary)' : 'var(--border)'}`,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease',
                    boxShadow: isExpanded ? '0 4px 16px rgba(255,48,69,0.08)' : '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                >
                  {/* Header de la lección */}
                  <div
                    onClick={() => setExpandedLeccion(isExpanded ? null : lec.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '20px 24px', cursor: 'pointer', transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gray50)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: '40px', height: '40px', flexShrink: 0,
                      background: isExpanded ? 'var(--brand-primary)' : 'var(--gray150)',
                      borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isExpanded ? 'white' : 'var(--text-secondary)',
                      fontWeight: 900, fontSize: '16px', transition: 'all 0.25s ease'
                    }}>
                      {index + 1}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-strong)', marginBottom: '2px' }}>
                        {lec.titulo || 'Sin título'}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {lec.descripcion || 'Sin descripción'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                      {lec.contenido_url && (
                        <span style={{ fontSize: '11px', fontWeight: 700, background: '#DBEAFE', color: '#1D4ED8', padding: '4px 8px', borderRadius: '6px' }}>
                          📎 Material
                        </span>
                      )}
                      {lec.videos_url && lec.videos_url.length > 0 && (
                        <span style={{ fontSize: '11px', fontWeight: 700, background: '#FEE2E2', color: '#B91C1C', padding: '4px 8px', borderRadius: '6px' }}>
                          🎬 Vídeo
                        </span>
                      )}
                      <svg
                        width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transition: 'transform 0.25s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>

                  {/* Contenido expandido */}
                  {isExpanded && (
                    <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid var(--border)', animation: 'fadeSlideDown 0.3s ease' }}>
                      <div style={{ paddingTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ gridColumn: '1 / -1', background: 'var(--gray50)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Descripción</div>
                          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-strong)', lineHeight: 1.6 }}>
                            {lec.descripcion || 'No hay descripción disponible para esta lección.'}
                          </p>
                        </div>

                        <div style={{ background: 'var(--gray50)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Material / Contenido</div>
                          {lec.contenido_url ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '20px' }}>📄</span>
                              <span style={{ fontSize: '14px', color: 'var(--brand-primary)', fontWeight: 600, wordBreak: 'break-all' }}>
                                {lec.contenido_url}
                              </span>
                            </div>
                          ) : (
                            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Sin material adjunto.</p>
                          )}
                        </div>

                        <div style={{ background: 'var(--gray50)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Vídeos</div>
                          {lec.videos_url && lec.videos_url.length > 0 ? (
                            <ul style={{ margin: 0, padding: '0 0 0 16px', listStyle: 'disc' }}>
                              {lec.videos_url.map((v, vi) => (
                                <li key={vi} style={{ fontSize: '14px', color: 'var(--brand-primary)', fontWeight: 600, marginBottom: '4px', wordBreak: 'break-all' }}>
                                  {v}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Sin vídeos adjuntos.</p>
                          )}
                        </div>
                      </div>

                      {/* Acciones del instructor sobre la lección */}
                      {!isAdmin && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEliminarLeccion(lec.id, lec.titulo); }}
                            style={{
                              background: 'transparent', border: '1px solid #FCA5A5', color: '#B91C1C',
                              padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                              cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            🗑 Eliminar lección
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
