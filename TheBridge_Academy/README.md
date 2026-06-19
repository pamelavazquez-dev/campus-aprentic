# The Bridge Academy

Proyecto con frontend React/Vite y backend `aprentic-api` conectado a Firestore.

## Esquema Firestore real

El backend esta alineado con las colecciones visibles en las capturas de `fotos/`:

- `admin`
- `alumnos`
- `campus`
- `inscripciones`
- `lecciones`
- `modulos`
- `notas`
- `profesores`
- `promociones`
- `proyectos`

Las colecciones scaffold antiguas `cursos`, `reviews` y `usuarios` no forman parte del esquema real usado por la API. La autenticacion se deja en Firebase Auth y no crea documentos locales de usuarios.

## Backend

La API vive en `aprentic-api/src/`:

- `models/`: builders con los nombres exactos de campos de Firestore.
- `services/`: CRUD y filtros por relaciones, normalizando `DocumentReference` a rutas legibles.
- `controllers/` y `routes/`: endpoints REST para las colecciones reales.
- `scripts/analyze-db.js`: inspecciona Firestore mostrando referencias como `/coleccion/documento`.
- `scripts/seed.js`: dataset de referencia alineado con el esquema actual.

Los services aceptan alias de entrada cuando ayudan a la API, pero persisten los campos tal como existen en Firestore. Por ejemplo, `admin` escribe `isActice` y `ombre` porque esos son los campos vistos en la base.

## Frontend

La app React esta en `src/` con paginas base (`Home`, `Login`, `Dashboard`, `Profile`) y componentes reutilizables (`Button`, `Card`, `Input`, `Layout`, `Navbar`, etc.).

## Comandos

Frontend:

```bash
npm install
npm run dev
npm run build
```

Backend:

```bash
cd aprentic-api
npm install
node scripts/analyze-db.js
```
