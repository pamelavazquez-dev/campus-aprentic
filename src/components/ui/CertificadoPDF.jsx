import React from 'react';

// Patrón más complejo y estético simulando circuitos (adaptado para fondo claro)
const circuitBg = `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23cbd5e1' stroke-width='1' stroke-opacity='0.6'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3Cpath d='M30 30h20v20H30z' /%3E%3Cpath d='M0 40h80M40 0v80M20 20l40 40M60 20L20 60' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

const CertificadoPDF = ({ nombreAlumno, fecha, nombreCurso }) => {
  return (
    <div
      id="certificado-pdf-container"
      style={{
        width: '1122px', // A4 Landscape
        height: '793px',
        backgroundColor: '#FFFFFF',
        backgroundImage: circuitBg,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between', // Distribuye logo, texto central y footer
        alignItems: 'center',
        padding: '60px 80px', // Aumentado el padding para dar respiro
        boxSizing: 'border-box',
        color: '#0f172a',
        fontFamily: "'Inter', sans-serif",
        border: '18px solid #E6293C', 
        overflow: 'hidden',
        textAlign: 'center'
      }}
    >
      {/* Esquinas decorativas */}
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
      
      {/* --- HEADER --- */}
      <div style={{ zIndex: 10, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
        
        {/* Logo The Bridge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <img 
            src="/Logo.svg" 
            alt="The Bridge Logo" 
            style={{ height: '65px', objectFit: 'contain' }} 
          />
        </div>

        {/* Título Principal */}
        <h2 style={{ fontSize: '38px', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', color: '#E6293C', margin: '0 0 20px 0' }}>
          CERTIFICADO DE FINALIZACIÓN
        </h2>
        
        <p style={{ fontSize: '22px', color: '#334155', margin: '0', fontWeight: 400 }}>
          Este documento certifica que
        </p>
      </div>

      {/* --- BODY (Nombre y Curso) --- */}
      <div style={{ zIndex: 10, position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        
        {/* Nombre del Alumno */}
        <h3 style={{ 
          fontSize: '68px', 
          fontWeight: 900, 
          margin: '0 0 10px 0', 
          color: '#E6293C', 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          textAlign: 'center',
          lineHeight: '1.1'
        }}>
          {nombreAlumno || 'Nombre del Alumno'}
        </h3>
        
        {/* Subtexto extra */}
        <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 30px 0', maxWidth: '750px', textAlign: 'center', lineHeight: '1.5' }}>
          Este documento certifica que {nombreAlumno || 'el alumno'} ha completado satisfactoriamente todos los módulos teóricos y prácticos de la formación, demostrando las aptitudes necesarias.
        </p>
        
        <p style={{ fontSize: '22px', color: '#334155', margin: '0 0 15px 0', fontWeight: 500, padding: '0 40px', lineHeight: '1.4', textAlign: 'center' }}>
          Ha completado satisfactoriamente todos los módulos correspondientes a:
        </p>
        
        {/* Nombre del Curso */}
        <h4 style={{ fontSize: '36px', fontWeight: 900, color: '#E6293C', margin: '0', textTransform: 'uppercase', textAlign: 'center' }}>
          {nombreCurso || 'Curso Desconocido'}
        </h4>
      </div>

      {/* --- FOOTER (Firmas) --- */}
      <div style={{ zIndex: 10, position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', padding: '0 20px', boxSizing: 'border-box' }}>
        
        {/* Izquierda: Firma 1 */}
        <div style={{ textAlign: 'center', width: '240px' }}>
          <div style={{ borderTop: '2px solid #0f172a', paddingTop: '8px', marginTop: '40px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#0f172a', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>Firma del Tutor</p>
          </div>
        </div>

        {/* Centro: Fecha */}
        <div style={{ textAlign: 'center', paddingBottom: '16px', flex: 1 }}>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0f172a', letterSpacing: '1px' }}>
            {fecha || 'DD/MM/YYYY'}
          </p>
        </div>

        {/* Derecha: Firma 2 */}
        <div style={{ textAlign: 'center', width: '240px' }}>
          <div style={{ borderTop: '2px solid #0f172a', paddingTop: '8px', marginTop: '40px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#0f172a', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>Dirección Académica</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CertificadoPDF;
