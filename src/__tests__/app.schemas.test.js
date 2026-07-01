import { describe, it, expect } from 'vitest';
import { leccionSchema, moduloSchema } from '../schemas/app.schemas';

describe('Zod Validation Schemas', () => {
  describe('leccionSchema', () => {
    const validLeccion = {
      modulo_id: 'mod-1',
      titulo: 'Test',
      descripcion: 'Valid desc',
      contenido_url: 'https://valid.com',
      contenido_markdown: '# Test',
      videos_url: []
    };

    it('debe aceptar datos válidos', () => {
      const result = leccionSchema.safeParse(validLeccion);
      expect(result.success).toBe(true);
    });

    it('debe rechazar campos obligatorios faltantes o vacíos', () => {
      const invalid = { ...validLeccion, titulo: '   ' };
      const result = leccionSchema.safeParse(invalid);
      
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toMatch(/El titulo es obligatorio/i);
    });

    it('debe rechazar URLs inseguras o inválidas en contenido_url', () => {
      const invalid = { ...validLeccion, contenido_url: 'javascript:alert(1)' };
      const result = leccionSchema.safeParse(invalid);
      
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toMatch(/URL invalida o protocolo no seguro/i);
    });

    it('debe fallar si el contenido markdown supera el límite (ej. 800KB)', () => {
      // 820_000 chars limit (from schemas)
      const massiveMarkdown = 'a'.repeat(820001);
      const invalid = { ...validLeccion, contenido_markdown: massiveMarkdown };
      const result = leccionSchema.safeParse(invalid);
      
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toMatch(/excede 800 KB/i);
    });
  });

  describe('moduloSchema', () => {
    it('debe aceptar un módulo válido y setear valores por defecto', () => {
      const validModulo = {
        nombre: 'Nuevo Modulo',
        tipo: 'ciber',
        horas: 15
        // faltan lecciones_Id, activo, profesor_id...
      };

      const result = moduloSchema.safeParse(validModulo);
      expect(result.success).toBe(true);
      expect(result.data.activo).toBe(true);
      expect(result.data.lecciones_Id).toEqual([]);
      expect(result.data.profesor_id).toBe('');
    });

    it('debe rechazar horas inválidas o negativas', () => {
      const invalid = { nombre: 'Test', tipo: 'fs', horas: -5 };
      const result = moduloSchema.safeParse(invalid);
      
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toMatch(/Las horas deben ser mayores que 0/i);
    });
  });
});
