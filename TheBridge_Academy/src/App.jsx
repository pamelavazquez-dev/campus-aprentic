import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { auth } from './config/firebase';
import { signOut } from 'firebase/auth';

const queryClient = new QueryClient();

// Componentes
import Login from './components/Login';
import ProtectedRoute from './layouts/ProtectedRoute';

import ErrorBoundary from './components/ErrorBoundary';

// Layouts
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const InstructorLayout = lazy(() => import('./layouts/InstructorLayout'));
const AlumnoLayout = lazy(() => import('./layouts/AlumnoLayout'));

// Páginas actuales de admin
const PromocionesView = lazy(() => import('./pages/PromocionesView'));
const AlumnosView = lazy(() => import('./pages/AlumnosView'));

const DashboardAdmin = lazy(() => import('./pages/admin/DashboardAdmin'));
const InstructorDashboard = lazy(() => import('./pages/instructor/InstructorDashboard'));
const WizardCurso = lazy(() => import('./pages/instructor/WizardCurso'));
const AlumnoDashboard = lazy(() => import('./pages/alumno/AlumnoDashboard'));
const VisorLeccion = lazy(() => import('./pages/alumno/VisorLeccion'));
const InscripcionesView = lazy(() => import('./pages/admin/InscripcionesView'));
const CalificacionesView = lazy(() => import('./pages/instructor/CalificacionesView'));
const MisNotasView = lazy(() => import('./pages/alumno/MisNotasView'));
const AdminModulosView = lazy(() => import('./pages/AdminModulosView'));
const ProfesoresView = lazy(() => import('./pages/ProfesoresView'));
const LeccionesView = lazy(() => import('./pages/LeccionesView'));
const ModulosView = lazy(() => import('./pages/ModulosView'));
import { DataProvider } from './context/DataContext';

function App() {
  const { user, role, loading } = useAuth();
  const homePath = user && role ? `/${role}` : '/login';

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20vh' }}>
        <h2 style={{ animation: 'pulse 1.5s infinite' }}>Cargando The Bridge Academy...</h2>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
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
        <DataProvider>
        <Suspense fallback={
          <div style={{ textAlign: 'center', marginTop: '20vh' }}>
            <h2 style={{ animation: 'pulse 1.5s infinite' }}>Cargando interfaz...</h2>
          </div>
        }>
        <Routes>
        <Route path="/login" element={
          !user ? <Login /> : 
          role ? <Navigate to={`/${role}`} replace /> : 
          <div style={{ textAlign: 'center', marginTop: '20vh' }}>
            <h2>⚠️ Acceso Denegado</h2>
            <p>Tu cuenta no tiene ningún rol asignado en el sistema.</p>
            <p>Por favor, contacta con un administrador.</p>
            <button onClick={() => signOut(auth)} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Cerrar Sesión</button>
          </div>
        } />
        
        {/* Rutas de Administrador */}
        <Route path="/admin/*" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout user={user} />
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
        <Route path="*" element={<Navigate to={homePath} replace />} />
      </Routes>
        </Suspense>
        </DataProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App;
