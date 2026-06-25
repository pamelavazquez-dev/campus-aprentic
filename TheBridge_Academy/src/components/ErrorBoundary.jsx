import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que el siguiente renderizado muestre la UI de repuesto
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Aquí puedes registrar el error en un servicio de reporte de errores (ej. Sentry)
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Puedes renderizar cualquier interfaz de repuesto personalizada
      return (
        <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#111827', margin: '0 0 16px 0' }}>Algo ha salido mal.</h2>
          <p style={{ color: '#6B7280', marginBottom: '24px' }}>
            Ha ocurrido un error inesperado al cargar esta sección. 
            Por favor, recarga la página o vuelve más tarde.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              background: '#4F46E5', color: 'white', padding: '12px 24px', 
              borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600
            }}
          >
            Recargar la página
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '32px', textAlign: 'left', background: '#F3F4F6', padding: '16px', borderRadius: '8px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#374151' }}>Detalles del error (Solo en Desarrollo)</summary>
              <pre style={{ marginTop: '16px', fontSize: '13px', color: '#EF4444', overflowX: 'auto' }}>
                {this.state.error?.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
