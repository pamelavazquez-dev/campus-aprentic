import { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './layouts/ProtectedRoute';
import GlobalLoader from './components/ui/GlobalLoader';
import ForcePasswordChangeModal from './components/auth/ForcePasswordChangeModal';

const queryClient = new QueryClient();

const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const InstructorLayout = lazy(() => import('./layouts/InstructorLayout'));
const AlumnoLayout = lazy(() => import('./layouts/AlumnoLayout'));

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

function App() {
  const { user, role, profile } = useAuth();
  const homePath = user && role ? `/${role}` : '/login';
  const passwordChangeCompleted = user
    ? localStorage.getItem(`initialPasswordChanged_${user.uid}`) === 'true'
    : false;

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

        <HashRouter>
          <ErrorBoundary>
            <DataProvider>
              <Suspense fallback={<GlobalLoader text="Cargando interfaz..." />}>
                <Routes>
                  <Route
                    path="/login"
                    element={
                      !user ? (
                        <Login />
                      ) : role ? (
                        <Navigate to={`/${role}`} replace />
                      ) : (
                        <div style={{ textAlign: 'center', marginTop: '20vh' }}>
                          <h2>Acceso Denegado</h2>
                          <p>Tu cuenta no tiene ningun rol asignado en el sistema.</p>
                          <p>Por favor, contacta con un administrador.</p>
                          <button
                            onClick={() => signOut(auth)}
                            style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
                          >
                            Cerrar Sesion
                          </button>
                        </div>
                      )
                    }
                  />

                  <Route
                    path="/admin/*"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminLayout user={user} />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<DashboardAdmin />} />
                    <Route path="usuarios" element={<AlumnosView />} />
                    <Route path="profesores" element={<ProfesoresView />} />
                    <Route path="campus" element={<PromocionesView />} />
                    <Route path="modulos" element={<AdminModulosView />} />
                    <Route path="inscripciones" element={<InscripcionesView />} />
                    <Route path="modulos/nuevo" element={<WizardCurso />} />
                    <Route path="modulos/ver/:id" element={<VisorLeccion />} />
                  </Route>

                  <Route
                    path="/instructor/*"
                    element={
                      <ProtectedRoute requiredRole="instructor">
                        <InstructorLayout user={user} />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<InstructorDashboard />} />
                    <Route path="wizard" element={<WizardCurso />} />
                    <Route path="lecciones" element={<LeccionesView />} />
                    <Route path="modulos" element={<ModulosView />} />
                    <Route path="notas" element={<CalificacionesView />} />
                  </Route>

                  <Route
                    path="/alumno/*"
                    element={
                      <ProtectedRoute requiredRole="alumno">
                        <AlumnoLayout user={user} />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AlumnoDashboard />} />
                    <Route path="visor/:id?" element={<VisorLeccion />} />
                    <Route path="notas" element={<MisNotasView />} />
                  </Route>

                  <Route path="*" element={<Navigate to={homePath} replace />} />
                </Routes>
                {user && role && profile?.initialPasswordChangeRequired && !passwordChangeCompleted && (
                  <ForcePasswordChangeModal />
                )}
              </Suspense>
            </DataProvider>
          </ErrorBoundary>
        </HashRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
