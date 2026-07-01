import { describe, it, expect } from 'vitest';
import { Leccion, leccionConverter } from '../models/Leccion.model';

describe('Leccion Model Converter', () => {
  it('debe convertir un objeto Leccion válido a formato Firestore', () => {
    const leccion = new Leccion(
      'id-123',
      'mod-1',
      'Título de Prueba',
      'Descripción',
      'https://url.com',
      ['https://video1.com'],
      '# Markdown'
    );

    const firestoreData = leccionConverter.toFirestore(leccion);

    expect(firestoreData).toEqual({
      modulo_id: 'mod-1',
      titulo: 'Título de Prueba',
      descripcion: 'Descripción',
      contenido_url: 'https://url.com',
      videos_url: ['https://video1.com'],
      contenido_markdown: '# Markdown'
    });
  });

  it('debe extraer el ID correctamente cuando modulo_id es un DocumentReference', () => {
    // Simula el objeto devuelto por Firestore para referencias
    const mockRef = { id: 'ref-mod-1', path: 'modulos/ref-mod-1' };
    
    const mockSnapshot = {
      id: 'doc-1',
      data: () => ({
        modulo_id: mockRef,
        titulo: 'Leccion ref'
      })
    };

    const parsed = leccionConverter.fromFirestore(mockSnapshot, {});
    expect(parsed.modulo_id).toBe('ref-mod-1');
    expect(parsed.titulo).toBe('Leccion ref');
  });

  it('debe mantener el string cuando modulo_id es texto plano', () => {
    const mockSnapshot = {
      id: 'doc-1',
      data: () => ({
        modulo_id: 'texto-plano'
      })
    };

    const parsed = leccionConverter.fromFirestore(mockSnapshot, {});
    expect(parsed.modulo_id).toBe('texto-plano');
  });

  it('debe aplicar valores por defecto ante datos incompletos de la base de datos', () => {
    const mockSnapshot = {
      id: 'doc-corrupto',
      data: () => ({
        // Faltan campos intencionalmente
      })
    };

    const parsed = leccionConverter.fromFirestore(mockSnapshot, {});
    
    expect(parsed.id).toBe('doc-corrupto');
    expect(parsed.modulo_id).toBe('');
    expect(parsed.titulo).toBe('');
    expect(parsed.descripcion).toBe('');
    expect(parsed.contenido_url).toBe('');
    expect(parsed.videos_url).toEqual([]);
    expect(parsed.contenido_markdown).toBe('');
  });
});
