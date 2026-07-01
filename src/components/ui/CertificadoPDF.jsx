import React from 'react';

const CertificadoPDF = ({ nombreAlumno, fecha, nombreCurso }) => {
  return (
    <div
      id="certificado-pdf-container"
      style={{
        width: '1122px', // A4 Landscape
        height: '793px',
        backgroundColor: '#000000',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px',
        boxSizing: 'border-box',
        color: '#FFFFFF',
        fontFamily: "'Inter', sans-serif",
        border: '16px solid var(--brand-primary, #FF3045)',
        overflow: 'hidden'
      }}
    >
      {/* Esquinas decorativas (Patrón Circuito Tech) */}
      <div style={{ position: 'absolute', top: 30, left: 30, width: 120, height: 120, borderTop: '6px solid var(--brand-primary, #FF3045)', borderLeft: '6px solid var(--brand-primary, #FF3045)' }}>
        <div style={{ position: 'absolute', top: 10, left: 10, width: 16, height: 16, backgroundColor: 'var(--brand-primary, #FF3045)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', top: 40, left: -6, width: 40, height: 6, backgroundColor: 'var(--brand-primary, #FF3045)' }}></div>
        <div style={{ position: 'absolute', top: -6, left: 40, width: 6, height: 40, backgroundColor: 'var(--brand-primary, #FF3045)' }}></div>
      </div>
      <div style={{ position: 'absolute', bottom: 30, right: 30, width: 120, height: 120, borderBottom: '6px solid var(--brand-primary, #FF3045)', borderRight: '6px solid var(--brand-primary, #FF3045)' }}>
        <div style={{ position: 'absolute', bottom: 10, right: 10, width: 16, height: 16, backgroundColor: 'var(--brand-primary, #FF3045)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: 40, right: -6, width: 40, height: 6, backgroundColor: 'var(--brand-primary, #FF3045)' }}></div>
        <div style={{ position: 'absolute', bottom: -6, right: 40, width: 6, height: 40, backgroundColor: 'var(--brand-primary, #FF3045)' }}></div>
      </div>
      
      {/* Logo Superior */}
      <div style={{ position: 'absolute', top: '70px', left: '0', right: '0', display: 'flex', justifyContent: 'center' }}>
        <h1 style={{ color: 'var(--brand-primary, #FF3045)', margin: 0, fontSize: '32px', fontWeight: 900, letterSpacing: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', border: '4px solid var(--brand-primary, #FF3045)', borderRadius: '8px', fontSize: '28px' }}>
            A
          </span>
          APRENTIC ACADEMY
        </h1>
      </div>

      {/* Contenido Principal */}
      <div style={{ textAlign: 'center', zIndex: 10, marginTop: '50px', width: '100%' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '6px', textTransform: 'uppercase', color: 'var(--brand-primary, #FF3045)', marginBottom: '30px' }}>
          CERTIFICADO DE FINALIZACIÓN
        </h2>
        
        <p style={{ fontSize: '22px', color: '#FFFFFF', marginBottom: '20px', fontWeight: 500 }}>
          Este documento certifica que
        </p>
        
        <h3 style={{ fontSize: '68px', fontWeight: 900, margin: '20px 0', color: 'var(--brand-primary, #FF3045)', textTransform: 'uppercase', letterSpacing: '3px' }}>
          {nombreAlumno || 'Nombre del Alumno'}
        </h3>
        
        <p style={{ fontSize: '22px', color: '#FFFFFF', margin: '40px 0 20px 0', fontWeight: 500, padding: '0 100px' }}>
          Ha completado satisfactoriamente todos los módulos y requisitos académicos correspondientes a:
        </p>
        
        <h4 style={{ fontSize: '42px', fontWeight: 900, color: 'var(--brand-primary, #FF3045)', margin: '0', textTransform: 'uppercase' }}>
          {nombreCurso || 'Curso Desconocido'}
        </h4>
      </div>

      {/* Footer: 3 Columnas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '85%', position: 'absolute', bottom: '70px' }}>
        
        {/* Izquierda: Firma 1 */}
        <div style={{ textAlign: 'center', width: '260px' }}>
          <div style={{ fontFamily: "'Brush Script MT', 'Comic Sans MS', cursive, sans-serif", fontSize: '36px', color: '#FFFFFF', marginBottom: '8px', opacity: 0.9 }}>
            Dirección Académica
          </div>
          <div style={{ borderTop: '2px solid #FFFFFF', paddingTop: '12px' }}>
            <p style={{ margin: 0, fontSize: '15px', color: '#FFFFFF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>
              Signatura
            </p>
          </div>
        </div>

        {/* Centro: Fecha */}
        <div style={{ textAlign: 'center', paddingBottom: '12px' }}>
          <p style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '1px' }}>
            {fecha || 'DD/MM/YYYY'}
          </p>
        </div>

        {/* Derecha: Firma 2 */}
        <div style={{ textAlign: 'center', width: '260px' }}>
          <div style={{ fontFamily: "'Brush Script MT', 'Comic Sans MS', cursive, sans-serif", fontSize: '36px', color: '#FFFFFF', marginBottom: '8px', opacity: 0.9 }}>
            Tutor Asignado
          </div>
          <div style={{ borderTop: '2px solid #FFFFFF', paddingTop: '12px' }}>
            <p style={{ margin: 0, fontSize: '15px', color: '#FFFFFF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>
              Signatura
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CertificadoPDF;
