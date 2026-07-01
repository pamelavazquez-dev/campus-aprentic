import React from 'react';

// Patrón de circuito impreso en base64 para evitar dependencias externas en html2canvas
const circuitPattern = `data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h20v20h-20z' fill='none' stroke='%23333' stroke-width='1'/%3E%3Cpath d='M30 20h40v40h-40z' fill='none' stroke='%23333' stroke-width='1'/%3E%3Ccircle cx='50' cy='50' r='3' fill='%23333'/%3E%3Ccircle cx='20' cy='20' r='2' fill='%23333'/%3E%3Cpath d='M20 20L50 50' stroke='%23333' stroke-width='1'/%3E%3Cpath d='M50 10L10 50' stroke='%23333' stroke-width='1'/%3E%3Cpath d='M90 10v80' stroke='%23333' stroke-width='1'/%3E%3Cpath d='M10 90h80' stroke='%23333' stroke-width='1'/%3E%3C/svg%3E`;

// Patrón más complejo y estético simulando circuitos
const circuitBg = `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23333333' stroke-width='1' stroke-opacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3Cpath d='M30 30h20v20H30z' /%3E%3Cpath d='M0 40h80M40 0v80M20 20l40 40M60 20L20 60' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

const CertificadoPDF = ({ nombreAlumno, fecha, nombreCurso }) => {
  return (
    <div
      id="certificado-pdf-container"
      style={{
        width: '1122px', // A4 Landscape
        height: '793px',
        backgroundColor: '#050505',
        backgroundImage: circuitBg,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '50px 80px',
        boxSizing: 'border-box',
        color: '#FFFFFF',
        fontFamily: "'Inter', sans-serif",
        border: '18px solid #E6293C', // Rojo exacto de la imagen
        overflow: 'hidden'
      }}
    >
      {/* Fondo sólido central para que el texto se lea bien sobre el circuito */}
      <div style={{
        position: 'absolute',
        top: '40px', left: '150px', right: '150px', bottom: '40px',
        backgroundColor: '#050505',
        zIndex: 1,
        borderRadius: '20px',
        boxShadow: '0 0 60px 60px #050505' // Difuminar bordes del fondo sólido
      }}></div>

      <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', position: 'relative' }}>
        
        {/* Logo Superior */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          {/* Símbolo A */}
          <div style={{ 
            fontSize: '70px', 
            fontWeight: 900, 
            color: '#E6293C', 
            lineHeight: 1,
            fontFamily: 'sans-serif',
            marginBottom: '8px',
            transform: 'scaleY(1.1) scaleX(1.2)' // Ensanchar un poco la A para imitar el logo
          }}>
            A
          </div>
          <h1 style={{ color: '#E6293C', margin: 0, fontSize: '22px', fontWeight: 900, letterSpacing: '4px' }}>
            APRENTIC ACADEMY
          </h1>
        </div>

        {/* Título Principal */}
        <h2 style={{ fontSize: '42px', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', color: '#E6293C', margin: '0 0 30px 0' }}>
          CERTIFICADO DE FINALIZACIÓN
        </h2>
        
        <p style={{ fontSize: '24px', color: '#FFFFFF', margin: '0 0 20px 0', fontWeight: 400 }}>
          Este documento certifica que
        </p>
        
        {/* Nombre del Alumno */}
        <h3 style={{ fontSize: '72px', fontWeight: 900, margin: '15px 0', color: '#E6293C', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {nombreAlumno || 'Nombre del Alumno'}
        </h3>
        
        {/* Subtexto extra (imitando el texto pequeño de la imagen) */}
        <p style={{ fontSize: '10px', color: '#888888', margin: '5px 0 35px 0', maxWidth: '700px', textAlign: 'center', lineHeight: '1.4' }}>
          Este documento certifica que {nombreAlumno || 'el alumno'} ha completado satisfactoriamente todos los módulos teóricos y prácticos de la formación, demostrando las aptitudes necesarias.
        </p>
        
        <p style={{ fontSize: '24px', color: '#FFFFFF', margin: '0 0 20px 0', fontWeight: 500, padding: '0 40px', lineHeight: '1.4' }}>
          Ha completado satisfactoriamente todos los módulos<br/>en coordinación y completado requerimientos en
        </p>
        
        {/* Nombre del Curso */}
        <h4 style={{ fontSize: '38px', fontWeight: 900, color: '#E6293C', margin: '10px 0 0 0', textTransform: 'uppercase' }}>
          {nombreCurso || 'Curso Desconocido'}
        </h4>
      </div>

      {/* Footer: 3 Columnas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', position: 'absolute', bottom: '60px', zIndex: 10, padding: '0 100px', boxSizing: 'border-box' }}>
        
        {/* Izquierda: Firma 1 */}
        <div style={{ textAlign: 'center', width: '220px' }}>
          <div style={{ fontFamily: "'Brush Script MT', 'Comic Sans MS', cursive, sans-serif", fontSize: '42px', color: '#FFFFFF', marginBottom: '-5px', opacity: 0.9 }}>
            Signatura
          </div>
          <div style={{ borderTop: '2px solid #FFFFFF', paddingTop: '8px' }}>
            <p style={{ margin: 0, fontSize: '16px', color: '#FFFFFF', fontWeight: 800, letterSpacing: '1px' }}>Signatura</p>
            <p style={{ margin: 0, fontSize: '16px', color: '#FFFFFF', fontWeight: 800, letterSpacing: '1px' }}>Signatura</p>
          </div>
        </div>

        {/* Centro: Fecha */}
        <div style={{ textAlign: 'center', paddingBottom: '16px', flex: 1 }}>
          <p style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '1px' }}>
            {fecha || 'DD/MM/YYYY'}
          </p>
        </div>

        {/* Derecha: Firma 2 */}
        <div style={{ textAlign: 'center', width: '220px' }}>
          <div style={{ fontFamily: "'Brush Script MT', 'Comic Sans MS', cursive, sans-serif", fontSize: '42px', color: '#FFFFFF', marginBottom: '-5px', opacity: 0.9 }}>
            Signatura
          </div>
          <div style={{ borderTop: '2px solid #FFFFFF', paddingTop: '8px' }}>
            <p style={{ margin: 0, fontSize: '16px', color: '#FFFFFF', fontWeight: 800, letterSpacing: '1px' }}>Signatura</p>
            <p style={{ margin: 0, fontSize: '16px', color: '#FFFFFF', fontWeight: 800, letterSpacing: '1px' }}>Signatura</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CertificadoPDF;
