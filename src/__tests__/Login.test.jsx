import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../components/Login';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Setup de mocks nativos de Vitest
vi.mock('../config/firebase', () => ({
  auth: {},
  db: {}
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
}));

// Mock para Logo y ThemeToggle que son componentes hijos visuales
vi.mock('../components/Logo', () => ({
  default: () => <div data-testid="mock-logo">Logo</div>
}));

vi.mock('../components/ui/ThemeToggle', () => ({
  default: () => <div data-testid="mock-theme-toggle">ThemeToggle</div>
}));

// Mock del componente FormularioSolicitud que hace fetch a Firestore en useEffect
vi.mock('../components/forms/FormularioSolicitud', () => ({
  default: () => <div data-testid="mock-formulario-solicitud">Formulario Solicitud</div>
}));

describe('Login Component Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar error local si la contraseña está vacía', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    // Escribimos el email pero dejamos la contraseña vacía
    const emailInput = screen.getByPlaceholderText(/usuario@thebridge.tech/i);
    await user.type(emailInput, 'admin@demo.com');
    
    const submitBtn = screen.getByRole('button', { name: /Iniciar Sesión/i });
    await user.click(submitBtn);

    // Esperamos el error definido en Login.jsx
    expect(await screen.findByText(/Contraseña obligatoria/i)).toBeInTheDocument();
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it('debe mostrar un mensaje de error si Firebase rechaza las credenciales', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    // Forzamos un fallo en Firebase con un error que el componente maneje
    const mockError = new Error('auth/invalid-credential');
    mockError.code = 'auth/invalid-credential';
    signInWithEmailAndPassword.mockRejectedValueOnce(mockError);
    
    // Interacción humana
    await user.type(screen.getByPlaceholderText(/usuario@thebridge.tech/i), 'admin@falso.com');
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'password123');
    await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

    // Verificar el toast o mensaje de error de UI (según Login.jsx)
    expect(await screen.findByText(/El usuario no existe o la contraseña es incorrecta/i)).toBeInTheDocument();
  });

  it('debe llamar a Firebase y permitir el login exitoso', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    // Mockeamos respuesta exitosa
    signInWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: '123' } });
    
    await user.type(screen.getByPlaceholderText(/usuario@thebridge.tech/i), 'instructor@demo.com');
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'segura123!');
    await user.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    });
  });
});
