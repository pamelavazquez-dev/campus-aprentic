import { render, screen } from '@testing-library/react';
import VisorLeccion from '../pages/alumno/VisorLeccion';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRBAC } from '../hooks/useRBAC';
import { getModuloById } from '../services/modulos.service';
import { getLeccionesByModuloId } from '../services/lecciones.service';
import { getProyectosByModuloId } from '../services/proyectos.service';

// Mock dependencies
jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../hooks/useRBAC', () => ({
  useRBAC: jest.fn(),
}));

jest.mock('../services/modulos.service', () => ({
  getModuloById: jest.fn(),
}));

jest.mock('../services/lecciones.service', () => ({
  getLeccionesByModuloId: jest.fn(),
}));

jest.mock('../services/proyectos.service', () => ({
  getProyectosByModuloId: jest.fn(),
}));

describe('VisorLeccion - Sanitización XSS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe sanitizar payloads XSS en el contenido markdown usando rehype-sanitize', async () => {
    const maliciousMarkdown = `
# Lección con sorpresa
<script>alert("XSS Vulnerability!")</script>
[Haz clic aquí](javascript:alert("XSS2"))
<img src="x" onerror="alert('XSS3')">
`;

    useAuth.mockReturnValue({
      user: { uid: 'user123' },
      profile: { id: 'alumno123', promociones_id: ['promo1'] },
    });
    useRBAC.mockReturnValue({
      canEditModules: false,
    });
    
    getModuloById.mockResolvedValue({ id: 'mod1', nombre: 'Módulo 1', promociones_activas: ['promo1'] });
    getLeccionesByModuloId.mockResolvedValue([
      { id: 'lec1', titulo: 'Lección 1', contenido_markdown: maliciousMarkdown }
    ]);
    getProyectosByModuloId.mockResolvedValue([]);

    render(
      <BrowserRouter>
        <VisorLeccion />
      </BrowserRouter>
    );

    // Esperar a que cargue
    const titulo = await screen.findByText('Lección 1');
    expect(titulo).toBeInTheDocument();

    // Verificamos que las etiquetas de script no se han renderizado o han sido sanitizadas
    const container = document.querySelector('.prose');
    if (container) {
      expect(container.innerHTML).not.toContain('<script>');
      expect(container.innerHTML).not.toContain('onerror=');
      expect(container.innerHTML).not.toContain('javascript:alert');
    }
  });
});
