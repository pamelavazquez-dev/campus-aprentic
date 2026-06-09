# Demo visual avanzada - Academy Edition

Estos assets estan preparados para importarse en Figma como base de prototipo.

## Imagenes

- `01-flujo-avanzado-overview.svg`: mapa general del flujo avanzado.
- `02-publico-descubrimiento.svg`: Home, listado con filtros y detalle de curso.
- `03-instructor-avanzado.svg`: dashboard de instructor, wizard y gestion de curso.
- `04-alumno-avanzado.svg`: dashboard de alumno, visor, review y certificado.
- `05-prototipo-clicks.svg`: mapa de conexiones para montar el prototipo en Figma.

Los SVG son la entrega principal: Figma los importa como graficos editables. Si el entorno local tiene conversor disponible, el script tambien puede generar PNGs de apoyo.

## Como usarlo en Figma

1. Crea un archivo nuevo en Figma llamado `Academy Edition - Flujo avanzado`.
2. Arrastra los SVG al canvas.
3. Convierte cada bloque principal en frame si Figma no lo hace automaticamente.
4. En Prototype, conecta:
   - Home -> Listado -> Detalle -> Login/Registro.
   - Login/Registro -> Dashboard instructor o Dashboard alumno.
   - Dashboard instructor -> Wizard -> Gestion de curso.
   - Dashboard alumno -> Visor de leccion -> Review -> Certificado.
5. Usa transicion `Smart Animate` o `Dissolve` a 300 ms.

## Alcance representado

La demo cubre MVP y flujo avanzado: busqueda/filtros, consulta publica de cursos, inscripcion gestionada por el instructor, dashboards por rol, creacion guiada de cursos, lecciones con archivos, progreso, review y certificado como extra.
