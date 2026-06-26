import { z } from 'zod';

const requiredText = (fieldName) => (
  z.string().trim().min(1, `${fieldName} es obligatorio`)
);

const optionalUrl = z.string().trim();

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
  estado: z.enum(['activa', 'completada']).default('activa'),
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
  activo: z.boolean().default(true),
  profesor_id: z.union([z.string(), z.array(z.string())]).default(''),
  promociones_activas: z.array(z.string()).default([]),
});

export const leccionSchema = z.object({
  modulo_id: requiredText('El modulo'),
  titulo: requiredText('El titulo'),
  descripcion: requiredText('La descripcion'),
  contenido_url: optionalUrl.default(''),
  contenido_markdown: z.string().optional().default(''),
  videos_url: z.array(z.string()).default([]),
});

export const proyectoEntregaSchema = z.object({
  titulo: requiredText('El titulo'),
  descripcion: z.string().trim().max(500, 'La descripcion no puede superar 500 caracteres').default(''),
  alumnoId: requiredText('El alumno'),
  alumnoEmail: z.email('Introduce un email valido').trim(),
  alumnoAuthUid: requiredText('El usuario autenticado'),
  moduloId: requiredText('El modulo'),
  leccionId: requiredText('La leccion'),
  promocionId: z.string().trim().default(''),
  archivoUrl: optionalUrl.refine(Boolean, 'El archivo es obligatorio'),
  archivoNombre: requiredText('El nombre del archivo'),
  estado: z.enum(['entregado', 'revisado']).default('entregado'),
  alumnoIds: z.array(z.string()).default([]),
  notas: z.array(z.string()).default([]),
  entregadoEn: requiredText('La fecha de entrega'),
  actualizadoEn: requiredText('La fecha de actualizacion'),
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
