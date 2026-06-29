import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import GlobalLoader from './components/ui/GlobalLoader'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Suspense fallback={<GlobalLoader text="Cargando The Bridge Academy..." />}>
        <App />
      </Suspense>
    </AuthProvider>
  </StrictMode>,
)
