import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Login from '../components/Login';

// Mock de Firebase para que el test no intente conectarse
vi.mock('../config/firebase', () => ({
  auth: {},
  db: {}
}));

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
}));

describe('Login Component', () => {
  it('renderiza correctamente el título de acceso', () => {
    render(<Login />);
    const titleElement = screen.getByText(/Acceso Plataforma/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('muestra los inputs de email y contraseña', () => {
    render(<Login />);
    const emailInput = screen.getByPlaceholderText(/usuario@demo.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it('el botón de login está presente y dice Iniciar Sesión', () => {
    render(<Login />);
    const button = screen.getByRole('button', { name: /Iniciar Sesión/i });
    expect(button).toBeInTheDocument();
  });
});
