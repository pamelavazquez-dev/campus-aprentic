import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CrearModuloForm from '../components/forms/CrearModuloForm';
import { createModulo } from '../services/modulos.service';

vi.mock('../services/modulos.service', () => ({
  createModulo: vi.fn(),
}));

describe('CrearModuloForm UI Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSaved = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // El form usa validación nativa de HTML5 (required, min="1") que bloquea el onSubmit en JSDOM,
  // por lo que no testeamos la respuesta de Zod aquí, sino que testeamos el 'happy path'.

  it('debe enviar los datos correctamente cuando el formulario es válido', async () => {
    const user = userEvent.setup();
    render(<CrearModuloForm onClose={mockOnClose} onSaved={mockOnSaved} />);
    
    // Rellenamos campos usando placeholders ya que no tienen htmlFor
    await user.type(screen.getByPlaceholderText(/Ej. FS - Módulo 1: Frontend/i), 'Nuevo Modulo Test');
    
    // El tipo de módulo (Especialidad) ya viene por defecto con 'fs' gracias a getInitialTipo.
    // Solo rellenamos las horas:
    const horasInput = screen.getByPlaceholderText(/Ej. 80/i);
    await user.clear(horasInput);
    await user.type(horasInput, '20');

    // Mock del servicio
    const mockCreated = { id: 'mod-123', nombre: 'Nuevo Modulo Test' };
    createModulo.mockResolvedValueOnce(mockCreated);

    const submitBtn = screen.getByRole('button', { name: /Crear Módulo/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(createModulo).toHaveBeenCalledTimes(1);
    });
    
    // Verifica que se llame al callback onSaved con el modulo creado
    expect(mockOnSaved).toHaveBeenCalledWith(mockCreated);
    expect(mockOnClose).toHaveBeenCalled(); // Se cierra el modal
  });
});
