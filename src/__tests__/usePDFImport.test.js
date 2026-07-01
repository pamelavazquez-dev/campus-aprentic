import { renderHook, act } from '@testing-library/react';
import { usePDFImport } from '../hooks/usePDFImport';
import { extractTextFromPDF } from '../utils/pdfExtractor';
import toast from 'react-hot-toast';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../utils/pdfExtractor', () => ({
  extractTextFromPDF: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
  }
}));

describe('usePDFImport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe abortar y mostrar error si el PDF extraído supera los 800 KB', async () => {
    // Generamos un string gigante (> 800 KB)
    // 800 KB son 819,200 bytes. Generamos un string de 900,000 bytes.
    const massiveString = 'a'.repeat(900000);
    extractTextFromPDF.mockResolvedValueOnce(massiveString);

    const { result } = renderHook(() => usePDFImport());
    
    // Mock del objeto file
    const mockFile = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });

    let isSuccess;
    await act(async () => {
      isSuccess = await result.current.importPDF(mockFile);
    });

    expect(extractTextFromPDF).toHaveBeenCalledWith(mockFile);
    expect(toast.error).toHaveBeenCalledWith(
      'El texto de este PDF es demasiado extenso para una sola lección. Por favor, divídelo en varios temas o sube un documento más corto.',
      expect.any(Object)
    );
    expect(isSuccess).toBe(false);
    expect(result.current.markdownRef.current).toBe(''); // No debe asignarse a la ref
  });

  it('debe procesar exitosamente si el PDF está dentro del límite', async () => {
    const validString = 'Texto válido y corto';
    extractTextFromPDF.mockResolvedValueOnce(validString);

    const { result } = renderHook(() => usePDFImport());
    const mockFile = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });

    let isSuccess;
    await act(async () => {
      isSuccess = await result.current.importPDF(mockFile);
    });

    expect(extractTextFromPDF).toHaveBeenCalledWith(mockFile);
    expect(toast.success).toHaveBeenCalledWith('PDF importado como Markdown correctamente.', expect.any(Object));
    expect(isSuccess).toBe(true);
    expect(result.current.markdownRef.current).toBe(validString);
  });
});
