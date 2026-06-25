import { z } from 'zod';

const requiredText = (fieldName) => (
  z.string().trim().min(1, `${fieldName} es obligatorio`)
);

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;

    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }, 'Introduce una URL valida');

export const loginSchema = z.object({
  email: z.email('Introduce un email valido').trim(),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
});

export const promocionSchema = z.object({
  nombre: requiredText('El nombre'),
  fechaInicio: requiredText('La fecha de inicio'),
  fechaFin: z.string().optional().nullable(),
  campus_id: requiredText('La sede'),
  alumnos_id: z.array(z.string()).default([]),
  profesor_id: z.array(z.string()).default([]),
});

export const alumnoSchema = z.object({
  nombre: requiredText('El nombre'),
  email: z.email('Introduce un email valido').trim(),
  avatar: z.string().default(''),
  promociones_id: z.array(z.string()).default([]),
  modulos_id: z.array(z.string()).default([]),
});

export const profesorSchema = z.object({
  nombre: requiredText('El nombre'),
  email: z.email('Introduce un email valido').trim(),
  avatar: z.string().default(''),
  campus_id: requiredText('El campus'),
  promocion_id: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const profesorEstadoSchema = z.object({
  isActive: z.boolean(),
});

export const moduloSchema = z.object({
  nombre: requiredText('El nombre'),
  tipo: z.enum(['fs', 'ciber'], 'Selecciona un tipo de modulo'),
  horas: z.coerce.number().int('Las horas deben ser un numero entero').min(1, 'Las horas deben ser mayores que 0'),
  lecciones_Id: z.array(z.string()).default([]),
});

export const leccionSchema = z.object({
  modulo_id: requiredText('El modulo'),
  titulo: requiredText('El titulo'),
  descripcion: requiredText('La descripcion'),
  contenido_url: optionalUrl.default(''),
  videos_url: z.array(z.string()).default([]),
});

export const adminSchema = z.object({
  nombre: requiredText('El nombre'),
  email: z.email('Introduce un email valido').trim(),
  avatar: z.string().default(''),
  campus_asignados: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const adminEstadoSchema = z.object({
  isActive: z.boolean(),
});
