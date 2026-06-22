import { useState, useEffect } from 'react';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './components/Login';
import AdminLayout from './components/layout/AdminLayout';
import PromocionesView from './pages/PromocionesView';
import AlumnosView from './pages/AlumnosView';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('promociones');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20vh' }}>
        <h2 style={{ animation: 'pulse 1.5s infinite' }}>Cargando The Bridge Academy...</h2>
      </div>
    );
  }

  // Si no está logueado, muestra el login
  if (!user) {
    return <Login />;
  }

  // Router simple:
  const renderView = () => {
    switch(currentView) {
      case 'promociones': return <PromocionesView />;
      case 'alumnos': return <AlumnosView />;
      case 'profesores': return <div style={{padding: '48px', textAlign: 'center'}}>Módulo Profesores próximamente</div>;
      default: return <PromocionesView />;
    }
  };

  return (
    <AdminLayout user={user} currentView={currentView} setCurrentView={setCurrentView}>
      {renderView()}
    </AdminLayout>
  )
}

export default App;
