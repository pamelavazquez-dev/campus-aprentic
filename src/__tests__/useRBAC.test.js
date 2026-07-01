import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRBAC } from '../hooks/useRBAC';

// Mock de useAuth
const mockUseAuth = vi.fn();
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth()
}));

describe('useRBAC Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe devolver permisos de instructor correctamente', () => {
    mockUseAuth.mockReturnValue({ user: { uid: '123' }, role: 'instructor', loading: false });

    const { result } = renderHook(() => useRBAC());
    
    expect(result.current.role).toBe('instructor');
    expect(result.current.canEditModules).toBe(true);
    expect(result.current.canManageUsers).toBe(false);
    expect(result.current.fallbackRoute).toBe('/instructor');
    expect(result.current.isAuthorized('instructor')).toBe(true);
    expect(result.current.isAuthorized('admin')).toBe(false);
  });

  it('debe devolver permisos de admin correctamente', () => {
    mockUseAuth.mockReturnValue({ user: { uid: '999' }, role: 'admin', loading: false });

    const { result } = renderHook(() => useRBAC());
    
    expect(result.current.role).toBe('admin');
    expect(result.current.canEditModules).toBe(true);
    expect(result.current.canManageUsers).toBe(true);
    expect(result.current.fallbackRoute).toBe('/admin');
  });

  it('debe aplicar la política por defecto (default) si el rol es desconocido', () => {
    mockUseAuth.mockReturnValue({ user: { uid: '000' }, role: 'desconocido', loading: false });

    const { result } = renderHook(() => useRBAC());
    
    expect(result.current.canEditModules).toBe(false);
    expect(result.current.canManageUsers).toBe(false);
    expect(result.current.fallbackRoute).toBe('/login');
  });
});
