import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Componentes
import Login from './components/Login';
import ProtectedRoute from './layouts/ProtectedRoute';

import ErrorBoundary from './components/ErrorBoundary';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import InstructorLayout from './layouts/InstructorLayout';
import AlumnoLayout from './layouts/AlumnoLayout';

// Páginas actuales de admin
import PromocionesView from './pages/PromocionesView';
import AlumnosView from './pages/AlumnosView';

import DashboardAdmin from './pages/admin/DashboardAdmin';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import WizardCurso from './pages/instructor/WizardCurso';
import AlumnoDashboard from './pages/alumno/AlumnoDashboard';
import VisorLeccion from './pages/alumno/VisorLeccion';
import InscripcionesView from './pages/admin/InscripcionesView';
import CalificacionesView from './pages/instructor/CalificacionesView';
import MisNotasView from './pages/alumno/MisNotasView';
import AdminModulosView from './pages/AdminModulosView';
import ProfesoresView from './pages/ProfesoresView';
import LeccionesView from './pages/LeccionesView';
import ModulosView from './pages/ModulosView';
import { DataProvider } from './context/DataContext';

function App() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20vh' }}>
        <h2 style={{ animation: 'pulse 1.5s infinite' }}>Cargando The Bridge Academy...</h2>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'var(--surface-solid)',
            color: 'var(--text-strong)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            boxShadow: '0 10px 24px rgba(0,0,0,0.1)',
            fontWeight: 600,
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />
      <BrowserRouter>
        <ErrorBoundary>
        <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${role || 'login'}`} replace />} />
        
        {/* Rutas de Administrador */}
        <Route path="/admin/*" element={
          <ProtectedRoute requiredRole="admin">
            <DataProvider>
              <AdminLayout user={user} />
            </DataProvider>
          </ProtectedRoute>
        }>
          <Route index element={<DashboardAdmin />} />
          <Route path="usuarios" element={<AlumnosView />} />
          <Route path="profesores" element={<ProfesoresView />} />
          <Route path="campus" element={<PromocionesView />} />
          <Route path="modulos" element={<AdminModulosView />} />
          <Route path="inscripciones" element={<InscripcionesView />} />
          <Route path="modulos/nuevo" element={<WizardCurso />} />
          <Route path="modulos/ver/:id" element={<VisorLeccion />} />
        </Route>

        {/* Rutas de Instructor */}
        <Route path="/instructor/*" element={
          <ProtectedRoute requiredRole="instructor">
            <InstructorLayout user={user} />
          </ProtectedRoute>
        }>
          <Route index element={<InstructorDashboard />} />
          <Route path="wizard" element={<WizardCurso />} />
          <Route path="lecciones" element={<LeccionesView />} />
          <Route path="modulos" element={<ModulosView />} />
          <Route path="notas" element={<CalificacionesView />} />
        </Route>

        {/* Rutas de Alumno */}
        <Route path="/alumno/*" element={
          <ProtectedRoute requiredRole="alumno">
            <AlumnoLayout user={user} />
          </ProtectedRoute>
        }>
          <Route index element={<AlumnoDashboard />} />
          <Route path="visor/:id?" element={<VisorLeccion />} />
          <Route path="notas" element={<MisNotasView />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to={user ? `/${role}` : "/login"} replace />} />
      </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App;
