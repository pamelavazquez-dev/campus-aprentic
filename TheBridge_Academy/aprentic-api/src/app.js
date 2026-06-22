const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const alumnosRoutes = require('./routes/alumnos.routes');
const profesoresRoutes = require('./routes/profesores.routes');
const promocionesRoutes = require('./routes/promociones.routes');
const proyectosRoutes = require('./routes/proyectos.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const campusRoutes = require('./routes/campus.routes');
const inscripcionesRoutes = require('./routes/inscripciones.routes');
const leccionesRoutes = require('./routes/lecciones.routes');
const modulosRoutes = require('./routes/modulos.routes');
const notasRoutes = require('./routes/notas.routes');
const adminsRoutes = require('./routes/admins.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Auth middleware
const { verifyToken } = require('./middlewares/auth.middleware');

// Register API routes
app.use('/api/auth', authRoutes); // Pública

// Proteger todas las rutas debajo de esta línea
app.use(verifyToken);

app.use('/api/alumnos', alumnosRoutes);
app.use('/api/profesores', profesoresRoutes);
app.use('/api/promociones', promocionesRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/campus', campusRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);
app.use('/api/lecciones', leccionesRoutes);
app.use('/api/modulos', modulosRoutes);
app.use('/api/notas', notasRoutes);
app.use('/api/admins', adminsRoutes);

// Note: /api/cursos, /api/reviews and /api/usuarios are not part of the real Firestore schema.

// Basic error handling
app.use((req, res, next) => {
	res.status(404).json({ error: 'Not found' });
});

module.exports = app;
