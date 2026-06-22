import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';

export default function AdminLayout({ user, currentView, setCurrentView, children }) {
  const menuItems = [
    { id: 'promociones', label: 'Mis Cursos' },
    { id: 'alumnos', label: 'Alumnos Inscritos' },
    { id: 'estadisticas', label: 'Estadísticas' }
  ];

  return (
    <div className="admin-layout">
      {/* Top Navbar */}
      <header className="top-navbar">
        <div className="navbar-brand">
          <svg className="icon" style={{ width: '28px', height: '28px', fill: 'var(--brand-primary)' }}>
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2 style={{ margin: 0, fontSize: '20px' }}>AprenTIC <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>Instructor</span></h2>
        </div>
        
        <nav className="navbar-nav">
          {menuItems.map(item => (
            <button 
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="navbar-user">
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-strong)' }}>{user.email}</p>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Rol: Instructor</p>
          </div>
          <button onClick={() => signOut(auth)} className="btn-danger">
            Salir
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
