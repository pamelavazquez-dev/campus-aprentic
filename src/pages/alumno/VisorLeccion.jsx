import toast from 'react-hot-toast';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getModuloById } from '../../services/modulos.service';
import { getLeccionesByModuloId, getLeccionMarkdown } from '../../services/lecciones.service';
import { getProyectosByModuloId, guardarEntregaProyecto } from '../../services/proyectos.service';
import { getNotasByAlumnoId } from '../../services/notas.service';
import { useRBAC } from '../../hooks/useRBAC';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { useAuth } from '../../hooks/useAuth';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const getTime = (value) => {
  if (!value) return 0;
  if (typeof value === 'object' && typeof value.seconds === 'number') return value.seconds * 1000;

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const getLegacyEntregaId = (entregas, nota) => {
  if (entregas.length === 0) return '';

  const notaTime = getTime(nota.creadoEn || nota.actualizadoEn);
  const entregasOrdenadas = [...entregas].sort((a, b) => (
    getTime(a.entregadoEn || a.actualizadoEn) - getTime(b.entregadoEn || b.actualizadoEn)
  ));

  if (!notaTime) return entregasOrdenadas[0].id;

  const entregasPrevias = entregasOrdenadas.filter((entrega) => (
    getTime(entrega.entregadoEn || entrega.actualizadoEn) <= notaTime
  ));

  return (entregasPrevias.at(-1) || entregasOrdenadas[0])?.id || '';
};

const CodeBlock = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative rounded-lg overflow-hidden my-6 border border-border-default shadow-lg" style={{ background: '#1e1e1e' }}>
        <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#404040]">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{language}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white transition-colors p-1 cursor-pointer"
            title="Copiar código"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span style={{ color: '#10B981' }}>Copiado!</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: '16px',
            background: '#1e1e1e',
            fontSize: '14px',
            fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace'
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code className={`${className || ''} bg-[var(--gray100)] text-[var(--text-strong)] rounded px-1.5 py-0.5 text-sm font-semibold`} {...props}>
      {children}
    </code>
  );
};

export default function VisorLeccion() {
  const { id: moduloId } = useParams();
  const navigate = useNavigate();
  const [modulo, setModulo] = useState(null);
  const [lecciones, setLecciones] = useState([]);
  const [selectedLeccion, setSelectedLeccion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proyectos, setProyectos] = useState([]);
  const [notas, setNotas] = useState([]);
  const [entregaForm, setEntregaForm] = useState({ titulo: '', descripcion: '', archivoUrl: '' });
  const [subiendoEntrega, setSubiendoEntrega] = useState(false);
  const { canEditModules } = useRBAC();
  const { user, profile: alumnoActual } = useAuth();
  const [markdownContent, setMarkdownContent] = useState('');
  const [loadingMarkdown, setLoadingMarkdown] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = windowHeight > 0 ? (totalScroll / windowHeight) * 100 : 0;
      setScrollProgress(scroll);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const mod = moduloId ? await getModuloById(moduloId) : null;
        if (mod && !canEditModules) {
          const promosRaw = alumnoActual?.promociones_id || alumnoActual?.promocion_id || [];
          const studentPromos = Array.isArray(promosRaw) ? promosRaw : [promosRaw].filter(Boolean);
          const isBlocked = mod.promociones_activas && mod.promociones_activas.length > 0 
            ? !mod.promociones_activas.some(p => studentPromos.includes(p))
            : true; // Por defecto, bloqueado hasta que el profesor lo habilita
          
          if (isBlocked) {
             toast.error('Este módulo no está disponible');
             navigate('/dashboard');
             return;
          }
        }
        
        const [moduleLecs, moduleProyectos] = await Promise.all([
          getLeccionesByModuloId(moduloId),
          getProyectosByModuloId(moduloId)
        ]);
        const notasAlumno = alumnoActual?.id ? await getNotasByAlumnoId(alumnoActual.id) : [];
        
        setModulo(mod);
        setProyectos(moduleProyectos);
        setNotas(notasAlumno);
        setLecciones(moduleLecs);
        if (moduleLecs.length > 0) setSelectedLeccion(moduleLecs[0]);
      } catch (e) {
        console.error('Error cargando visor:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [moduloId, alumnoActual?.id, canEditModules, navigate]);

  const selectedEntrega = useMemo(() => {
    if (!alumnoActual || !selectedLeccion) return null;
    return proyectos.find(proyecto => (
      proyecto.alumnoId === alumnoActual.id &&
      proyecto.moduloId === moduloId &&
      proyecto.leccionId === selectedLeccion.id
    ));
  }, [alumnoActual, moduloId, proyectos, selectedLeccion]);

  useEffect(() => {
    setEntregaForm({
      titulo: selectedEntrega?.titulo || selectedLeccion?.titulo || '',
      descripcion: selectedEntrega?.descripcion || '',
      archivoUrl: selectedEntrega?.archivoUrl || ''
    });
    
    // Cargar markdown diferido
    async function fetchMarkdown() {
      if (selectedLeccion) {
        setLoadingMarkdown(true);
        const text = await getLeccionMarkdown(selectedLeccion.id);
        setMarkdownContent(text);
        setLoadingMarkdown(false);
      } else {
        setMarkdownContent('');
      }
    }
    fetchMarkdown();
  }, [selectedEntrega, selectedLeccion]);

  const refreshProyectos = async () => {
    if (!moduloId) return;
    const currentProyectos = await getProyectosByModuloId(moduloId);
    setProyectos(currentProyectos);
  };

  const handleSubmitEntrega = async (event) => {
    event.preventDefault();

    if (!alumnoActual || !selectedLeccion || !modulo) {
      toast.error('No se pudo preparar la entrega.');
      return;
    }

    if (!entregaForm.archivoUrl.trim()) {
      toast.error('Pega el enlace de tu proyecto.');
      return;
    }

    setSubiendoEntrega(true);

    try {
      await guardarEntregaProyecto({
        proyectoId: selectedEntrega?.id,
        titulo: entregaForm.titulo,
        descripcion: entregaForm.descripcion,
        alumnoId: alumnoActual.id,
        alumnoEmail: alumnoActual.email,
        alumnoAuthUid: user.uid,
        moduloId,
        leccionId: selectedLeccion.id,
        archivoUrl: entregaForm.archivoUrl.trim(),
        archivoNombre: entregaForm.archivoUrl.trim(),
        promocionId: alumnoActual.promociones_id?.[0] || '',
        entregadoEn: selectedEntrega?.entregadoEn,
      });

      await refreshProyectos();
      toast.success(selectedEntrega ? 'Entrega actualizada correctamente.' : 'Proyecto entregado correctamente.');
    } catch (error) {
      console.error('Error subiendo proyecto:', error);
      toast.error(error.message || 'No se pudo subir el proyecto.');
    } finally {
      setSubiendoEntrega(false);
    }
  };

  const backUrl = canEditModules ? '/admin/modulos' : '/alumno';
  const backText = canEditModules ? '← Volver a Gestión de Módulos' : '← Volver a Mis Módulos';

  const estadoLecciones = useMemo(() => {
    if (!alumnoActual) return { entregadas: {}, aprobadas: {} };

    const entregasModulo = proyectos.filter(proyecto => (
      proyecto.alumnoId === alumnoActual.id &&
      proyecto.moduloId === moduloId
    ));
    const legacyEntregaAprobadaIds = new Set(
      notas
        .filter(nota => nota.proyectoId === moduloId && Number(nota.valor) >= 5)
        .map(nota => getLegacyEntregaId(entregasModulo, nota))
        .filter(Boolean)
    );

    return lecciones.reduce((acc, leccion) => {
      const entrega = entregasModulo.find(proyecto => (
        proyecto.leccionId === leccion.id
      ));

      if (!entrega) return acc;

      acc.entregadas[leccion.id] = true;

      const notaAprobadaEntrega = notas.some(nota => (
        nota.proyectoId === entrega.id &&
        Number(nota.valor) >= 5
      ));

      if (notaAprobadaEntrega || legacyEntregaAprobadaIds.has(entrega.id)) {
        acc.aprobadas[leccion.id] = true;
      }

      return acc;
    }, { entregadas: {}, aprobadas: {} });
  }, [alumnoActual, lecciones, moduloId, notas, proyectos]);

  const completadas = estadoLecciones.entregadas;
  const aprobadas = estadoLecciones.aprobadas;
  const completadasCount = Object.keys(completadas).length;
  const progreso = lecciones.length > 0 ? Math.round((completadasCount / lecciones.length) * 100) : 0;
  const todasCompletadas = lecciones.length > 0 && completadasCount === lecciones.length;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div role="status" aria-live="polite" aria-label="Cargando lecciones" style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid var(--gray200)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px auto' }}></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Cargando lecciones...</p>
        </div>
      </div>
    );
  }

  if (!modulo) {
    return (
      <div style={{ textAlign: 'center', padding: '64px' }}>
        <h3 style={{ color: 'var(--text-strong)' }}>Módulo no encontrado</h3>
        <button className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer" onClick={() => navigate(backUrl)} style={{ width: 'auto', padding: '10px 24px', marginTop: '16px' }}>
          {backText}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Barra de progreso de lectura (Sticky) */}
      <div role="progressbar" aria-valuenow={Math.round(scrollProgress)} aria-valuemin="0" aria-valuemax="100" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '4px', background: 'transparent', zIndex: 9999 }}>
        <div style={{ width: `${scrollProgress}%`, height: '100%', background: 'var(--brand-primary)', transition: 'width 0.1s' }}></div>
      </div>

      {/* Botón Volver Arriba */}
      {scrollProgress > 20 && (
        <button
          aria-label="Volver arriba"
          onClick={scrollToTop}
          style={{
            position: 'fixed', bottom: '32px', right: '32px', zIndex: 9998,
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'var(--brand-primary)', color: 'white',
            border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(255,48,69,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s ease', animation: 'fadeSlideDown 0.3s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      )}

      <div className="lesson-view-shell animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1260px', margin: '0 auto' }}>      {/* Header del módulo */}
      <div className="lesson-view-header bg-gradient-to-br from-surface to-brand-primary/10 rounded-2xl relative overflow-hidden border border-border-default shadow-sm" style={{ padding: '28px 36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate(backUrl)}
              className="text-text-strong"
              style={{ background: 'var(--gray150)', border: '1px solid var(--border-default)', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '13px', padding: '10px 14px' }}
            >
              {backText}
            </button>
            <div style={{ width: '1px', height: '32px', background: 'var(--border-default)' }}></div>
            <h3 className="text-text-strong" style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>
              {modulo?.nombre || modulo?.titulo || 'Cargando...'}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {todasCompletadas && (
              <span style={{ background: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0', borderRadius: '999px', padding: '8px 12px', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                Tareas completadas
              </span>
            )}
            <span className="text-text-secondary" style={{ fontSize: '13px', fontWeight: 700 }}>
              {completadasCount}/{lecciones.length} completadas
            </span>
            <div style={{ width: '120px', height: '6px', background: 'rgba(255,255,255,0.16)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progreso}%`, height: '100%', background: 'linear-gradient(90deg, var(--brand-primary), #FF6B7A)', transition: 'width 0.5s ease', borderRadius: '3px' }}></div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: progreso === 100 ? '#10B981' : 'var(--brand-primary)' }}>
              {progreso}%
            </span>
          </div>
        </div>
      </div>

      {/* Layout principal: Sidebar + Contenido */}
      <div className="lesson-view-main" style={{ display: 'grid', gridTemplateColumns: '380px minmax(0, 1fr)', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Sidebar de lecciones */}
        <div className="lesson-sidebar" style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '18px', overflowY: 'auto', padding: '20px',
          boxShadow: 'var(--shadow-sm)', backdropFilter: 'blur(14px)',
          position: 'sticky', top: '96px', maxHeight: 'calc(100vh - 120px)'
        }}>
          <div style={{ padding: '0 16px 12px 16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Contenido del módulo
            </span>
          </div>

          {lecciones.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
              No hay lecciones disponibles.
            </div>
          ) : (
            lecciones.map((lec, index) => {
              const isSelected = selectedLeccion?.id === lec.id;
              const isDelivered = completadas[lec.id];
              const isApproved = aprobadas[lec.id];
              return (
                <div
                  key={lec.id}
                  onClick={() => setSelectedLeccion(lec)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px', cursor: 'pointer', borderRadius: '12px',
                    background: isSelected ? 'var(--gray100)' : 'transparent',
                    border: `1px solid ${isSelected ? 'var(--brand-primary)' : 'transparent'}`,
                    boxShadow: isSelected ? '0 10px 24px rgba(255,48,69,0.10)' : 'none',
                    transition: 'all 0.2s ease',
                    marginBottom: '8px'
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--gray50)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: '34px', height: '34px', flexShrink: 0, borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 800,
                    background: isApproved ? '#10B981' : (isDelivered ? '#F59E0B' : (isSelected ? 'var(--brand-primary)' : 'var(--gray200)')),
                    color: (isApproved || isDelivered || isSelected) ? 'white' : 'var(--text-secondary)'
                  }}>
                    {isApproved ? '✓' : index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px', fontWeight: isSelected ? 900 : 700,
                      color: isSelected ? 'var(--text-strong)' : 'var(--text-secondary)',
                      lineHeight: 1.35
                    }}>
                      {lec.titulo}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Panel de contenido de la lección */}
        <div className="lesson-content" style={{ flex: 1, minWidth: 0 }}>
          {selectedLeccion ? (
            <div style={{ animation: 'fadeSlideDown 0.3s ease' }}>
              {/* Título y meta */}
                <div className="bg-surface backdrop-blur-lg border border-border-default rounded-xl p-8 shadow-sm" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  {aprobadas[selectedLeccion.id] && (
                    <span style={{ fontSize: '11px', fontWeight: 700, background: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: '6px' }}>
                      ✓ Aprobada
                    </span>
                  )}
                  {completadas[selectedLeccion.id] && !aprobadas[selectedLeccion.id] && (
                    <span style={{ fontSize: '11px', fontWeight: 700, background: '#FEF3C7', color: '#92400E', padding: '4px 10px', borderRadius: '6px' }}>
                      Entregada
                    </span>
                  )}
                </div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 900, color: 'var(--text-strong)', letterSpacing: '-0.5px' }}>
                  {selectedLeccion.titulo}
                </h2>
                <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {selectedLeccion.descripcion || 'Sin descripción disponible.'}
                </p>
              </div>

              {/* Contenido Markdown */}
              {(markdownContent || loadingMarkdown) && (
                <div style={{ marginBottom: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                    📖 Apuntes de la lección
                  </div>
                  {loadingMarkdown ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Cargando contenido...</p>
                  ) : (
                    <div className="prose prose-invert max-w-[800px] mx-auto prose-p:leading-loose prose-p:text-[17px] prose-headings:font-black prose-headings:tracking-tight prose-a:text-brand-primary prose-a:no-underline hover:prose-a:underline overflow-hidden break-words prose-pre:overflow-x-auto prose-table:block prose-table:overflow-x-auto" style={{ color: 'var(--text-strong)', textAlign: 'left' }}>
                      <ReactMarkdown 
                        rehypePlugins={[rehypeSanitize]}
                        allowedElements={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'pre', 'blockquote', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td']}
                        components={{ code: CodeBlock }}
                      >
                        {markdownContent}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )}

              {/* Material */}
              {selectedLeccion.contenido_url && (
                <div style={{ marginBottom: '24px', background: 'var(--surface-solid)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                    📎 Material de la lección
                  </div>
                  <div style={{ background: 'var(--gray50)', borderRadius: '8px', padding: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#DBEAFE', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📄</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-strong)' }}>Documento del temario</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{selectedLeccion.contenido_url}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Vídeos */}
              {selectedLeccion.videos_url && selectedLeccion.videos_url.length > 0 && (
                <div style={{ marginBottom: '24px', background: 'var(--surface-solid)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                    🎬 Vídeos de la lección
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedLeccion.videos_url.map((v, i) => {
                      let youtubeId = '';
                      if (v.includes('youtube.com/watch?v=')) {
                        youtubeId = v.split('v=')[1].split('&')[0];
                      } else if (v.includes('youtu.be/')) {
                        youtubeId = v.split('youtu.be/')[1].split('?')[0];
                      }

                      return (
                        <div key={i} style={{ background: 'var(--surface-solid)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', background: '#FEE2E2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>▶</div>
                            <a href={v} target="_blank" rel="noreferrer" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-strong)', wordBreak: 'break-all', textDecoration: 'none' }} className="hover:text-brand-primary transition-colors">
                              {v}
                            </a>
                          </div>
                          
                          {youtubeId ? (
                            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', background: '#000' }}>
                              <iframe 
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                src={`https://www.youtube.com/embed/${youtubeId}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                          ) : (v.toLowerCase().endsWith('.mp4') || v.toLowerCase().endsWith('.webm') || v.toLowerCase().endsWith('.ogg')) ? (
                            <video controls style={{ width: '100%', borderRadius: '8px', background: '#000' }}>
                              <source src={v} />
                              Tu navegador no soporta el reproductor de vídeo.
                            </video>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sin contenido */}
              {!selectedLeccion.contenido_url && (!selectedLeccion.videos_url || selectedLeccion.videos_url.length === 0) && !markdownContent && !loadingMarkdown && (
                <div style={{ marginBottom: '24px', background: 'var(--surface-solid)', border: '1px dashed var(--border)', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
                  <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>Contenido pendiente</p>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>El instructor aún no ha añadido material a esta lección.</p>
                </div>
              )}

              {!canEditModules && (
                <form
                  onSubmit={handleSubmitEntrega}
                  style={{
                    marginBottom: '24px',
                    background: 'var(--surface-solid)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                        Entrega del proyecto
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Pega el enlace de tu proyecto, repositorio o documento compartido.
                      </p>
                    </div>

                    {selectedEntrega && (
                      <a
                        href={selectedEntrega.archivoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-primary font-black text-sm no-underline hover:underline"
                      >
                        Ver entrega actual
                      </a>
                    )}
                  </div>

                  {selectedEntrega && (
                    <div style={{ background: 'var(--gray100)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-strong)', marginBottom: '4px' }}>
                        {selectedEntrega.titulo}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Entregado el {selectedEntrega.entregadoEn ? new Date(selectedEntrega.entregadoEn).toLocaleDateString() : 'sin fecha'}.
                        Puedes actualizar el enlace si necesitas corregirlo.
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Titulo
                      </label>
                      <input
                        className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
                        value={entregaForm.titulo}
                        onChange={event => setEntregaForm(prev => ({ ...prev, titulo: event.target.value }))}
                        placeholder="Nombre de tu entrega"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Enlace del proyecto
                      </label>
                      <input
                        type="url"
                        className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
                        value={entregaForm.archivoUrl}
                        onChange={event => setEntregaForm(prev => ({ ...prev, archivoUrl: event.target.value }))}
                        placeholder="https://github.com/usuario/proyecto"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Comentario para el instructor
                    </label>
                    <textarea
                      className="w-full px-4 py-3 bg-surface-solid border border-border-default rounded-lg text-sm text-ink transition-all duration-300 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-[#94A3B8]"
                      value={entregaForm.descripcion}
                      onChange={event => setEntregaForm(prev => ({ ...prev, descripcion: event.target.value }))}
                      placeholder="Puedes indicar enlace a GitHub, detalles de ejecucion o cualquier nota importante."
                      rows={3}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      className="bg-brand-gradient text-white py-3 px-6 rounded-lg text-sm font-black transition-all duration-300 hover:-translate-y-0.5 shadow-glow inline-flex items-center justify-center gap-2 border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      disabled={subiendoEntrega || !entregaForm.titulo.trim() || !entregaForm.archivoUrl.trim()}
                      style={{ width: 'auto', padding: '12px 24px' }}
                    >
                      {subiendoEntrega ? 'Guardando...' : selectedEntrega ? 'Actualizar entrega' : 'Entregar proyecto'}
                    </button>
                  </div>
                </form>
              )}

              {/* Botón marcar como completada */}
              {!canEditModules && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  {aprobadas[selectedLeccion.id] ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 700, fontSize: '14px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      Lección aprobada
                    </div>
                  ) : completadas[selectedLeccion.id] ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B', fontWeight: 700, fontSize: '14px' }}>
                      Entrega realizada
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '14px' }}>
                      Pendiente de aprobar
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👈</div>
              <p style={{ fontSize: '16px', fontWeight: 600 }}>Selecciona una lección del panel izquierdo para comenzar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
