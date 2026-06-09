# The Bridge Academy - Guia de estilo Figma

Entrega v2 para la epica A: paleta, tipografia, escala de espaciado y componentes base reutilizables con mejor encuadre visual y mas detalle de handoff.

## Archivos

- `style-guide.svg`: pagina unica importable en Figma con fundaciones, componentes, estados y ejemplo compuesto.
- `design-tokens.json`: tokens estructurados para variables de Figma y para React.
- `index.html`: preview local de la guia.

## Fuentes revisadas

- `docs/producto-diseno.md`: alcance MVP, roles, pantallas y flujo principal.
- `docs/wireframes`: estructura de baja fidelidad para home, cursos, detalle, login, dashboards, wizard y visor de leccion.
- `docs/figma-demo`: direccion visual avanzada con rojo de marca, fondo suave, superficies blancas y componentes de producto.

## Como usarlo en Figma

1. Crear una pagina llamada `Style guide`.
2. Importar `style-guide.svg`.
3. Crear variables desde `design-tokens.json`:
   - `Color/Primitive`
   - `Color/Semantic`
   - `Typography`
   - `Spacing`
   - `Radius`
   - `Shadow`
   - `Size`
4. Convertir los grupos `component-*` en componentes reutilizables.
5. Combinar variantes:
   - `Button`: `variant`, `size`, `state`, `leadingIcon`, `trailingIcon`, `fullWidth`
   - `Input`: `state`, `label`, `helperText`, `leadingIcon`, `trailingAction`
   - `Card`: `kind`, `elevation`, `interactive`, `media`, `progress`
   - `Navbar`: `activeItem`, `authenticated`, `role`

## Componentes incluidos

- `Button`: primary, secondary, ghost; estados default, hover y disabled; tamanos sm, md y lg.
- `Input`: default, focus, error y disabled con label, helper text e icono.
- `Card`: course card, metric card y lesson card para cubrir catalogo, dashboard y visor.
- `Navbar`: publico, alumno e instructor.
- `usage-example-dashboard`: ejemplo compuesto para verificar que los componentes funcionan juntos en una pantalla MVP.

## Decisiones de diseno

- La estructura viene de los wireframes; la capa visual viene de la demo avanzada.
- El rojo `#FF3045` se reserva para CTA, foco, progreso y estados criticos.
- El fondo `#F5F6F8`, las superficies blancas y el borde `#D3D6DC` mantienen una interfaz limpia de producto educativo.
- Montserrat se usa en marca y titulares; Inter se usa en UI, formularios y lectura.
- La escala de espaciado parte de 4px para mapear Figma y React sin conversion manual.
- El radio base es `8px`, coherente con las cards y botones ya usados en la demo.
- Los componentes se nombran pensando en props de React, no solo en estilos visuales.

## Mapeo a React

```txt
Button  -> <Button variant size state leadingIcon trailingIcon fullWidth />
Input   -> <Input state label helperText leadingIcon trailingAction />
Card    -> <Card kind elevation interactive media progress />
Navbar  -> <Navbar activeItem authenticated role />
```

## Criterios de aceptacion

- Guia de estilo en una pagina: `style-guide.svg`.
- Componentes base definidos: grupos `component-button-*`, `component-input-*`, `component-card-*` y `component-navbar-*`.
- Decisiones documentadas: este README, `design-tokens.json` y el bloque final del SVG.
