import { useState } from 'react';

export default function AlumnosView() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Gestión de Alumnos</h2>
          <p style={{ margin: 0 }}>Listado y matrículas de alumnos.</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto', opacity: 0.5 }} disabled>
          + Nuevo Alumno (Próximamente)
        </button>
      </div>

      <div className="glass-card" style={{ textAlign: 'center', padding: '64px' }}>
        <svg className="icon" style={{ width: '64px', height: '64px', marginBottom: '16px', fill: 'var(--text-secondary)' }} role="presentation">
          <use href="/icons.svg#social-icon"></use>
        </svg>
        <h3>Módulo de Alumnos en desarrollo</h3>
        <p>Próximamente conectaremos esta tabla con la colección `alumnos` de Firestore.</p>
      </div>
    </div>
  );
}
