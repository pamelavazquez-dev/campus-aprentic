# AprenTIC Campus API

API CommonJS conectada a Firestore para The Bridge Academy.

## Colecciones soportadas

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

No se exponen services ni rutas para `cursos`, `reviews` o `usuarios` porque no aparecen en el esquema real de Firestore. Firebase Auth gestiona las credenciales.

## Scripts

```bash
npm install
node scripts/analyze-db.js
npm run seed
```

`scripts/analyze-db.js` imprime referencias como rutas (`/campus/id`) para revisar rapido la estructura. `scripts/seed.js` contiene datos de referencia con los mismos nombres de campos que la base actual.
