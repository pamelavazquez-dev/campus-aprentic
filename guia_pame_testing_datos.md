# Guía de Pruebas y Volcado de Datos (Backlog)

¡Hola Pame!

Tasio y yo acabamos de terminar una refactorización masiva de la rama `main`. Hemos borrado el backend de Node y ahora **todos los modelos y servicios de Firestore están tipados con Clases de React** (puedes verlos en `src/models/` y `src/services/`).

Para las nuevas tareas del Backlog que te han asignado, aquí tienes la ruta a seguir usando la nueva arquitectura:

## 1. Crear Usuarios por Rol y Probar Rutas

Para simular los 3 roles, Firebase requiere que el usuario exista en *Authentication* y que además tenga un documento con su información en la colección correspondiente.

### Pasos a seguir:
1. Arranca la app y usa el formulario de **Registro / Login** (o créalos directamente a mano en la consola web de Firebase Auth).
2. **Importante:** Consigue el `UID` de cada uno de los 3 usuarios que crees.
3. Ahora ve a tu código (puedes hacerte un botón temporal de "Setup") o a la consola de Firestore y crea los perfiles usando los servicios que hemos construido:

```javascript
import { createAdmin } from '../services/admins.service';
import { createProfesor } from '../services/profesores.service';
import { createAlumno } from '../services/alumnos.service';

// Reemplaza los UIDs con los generados por Firebase Auth
await createAdmin("UID_DEL_ADMIN", { nombre: "Admin Supremo", email: "admin@test.com" });
await createProfesor("UID_DEL_PROFE", { nombre: "Profe Ciber", email: "profe@test.com", campus_id: "ID_SEVILLA" });
await createAlumno("UID_DEL_ALUMNO", { nombre: "Alumno FS", email: "alumno@test.com" });
```

4. Haz Login en la UI con cada correo y verifica que el *Router* te redirige al Dashboard correcto según la colección en la que exista el usuario.

## 2. Inserción de Datos (Mock Data en Firestore)

Se pide crear Módulos, Campus, Promociones y Lecciones. Como ahora **nuestros servicios inyectan automáticamente los Converters de Clases**, te prohíbo terminantemente insertar JSONs crudos con `setDoc`. **Debes importar y llamar a nuestras funciones de `src/services`** para que los datos suban con el tipado perfecto.

Aquí tienes un esqueleto tipo script que puedes ejecutar (o meter en un `useEffect` temporal en una vista vacía) para generar los datos de golpe:

```javascript
import { createCampus } from '../services/campus.service';
import { createModulo } from '../services/modulos.service';
import { createPromocion } from '../services/promociones.service';
import { createLeccion } from '../services/lecciones.service';

const sembrarDatos = async () => {
  // 1. Crear Campus
  const idSevilla = "campus-sevilla";
  const idMalaga = "campus-malaga";
  await createCampus(idSevilla, { nombre: "Sevilla", sede: "Sevilla" });
  await createCampus(idMalaga, { nombre: "Málaga", sede: "Málaga" });

  // 2. Crear Módulos (0 al 3) para FS y CIBER
  const idFS0 = "mod-fs-0";
  const idCiber0 = "mod-cib-0";
  await createModulo(idFS0, { nombre: "FS - Módulo 0: Ramp Up", horas: 40 });
  // ... repite para módulos 1, 2, 3 y para CIBER

  // 3. Crear 1 Lección por Módulo
  await createLeccion("lec-fs-0-1", { modulo_id: idFS0, titulo: "Instalación de VSCode y Node", descripcion: "Setup inicial" });
  await createLeccion("lec-cib-0-1", { modulo_id: idCiber0, titulo: "Conceptos de Redes", descripcion: "TCP/IP" });

  // 4. Crear Promociones (1 por campus, por rama)
  await createPromocion("promo-sevilla-fs", { nombre: "FS Septiembre Sevilla", campus_id: idSevilla, fechaInicio: new Date().toISOString() });
  await createPromocion("promo-malaga-ciber", { nombre: "CIBER Octubre Málaga", campus_id: idMalaga, fechaInicio: new Date().toISOString() });

  console.log("✅ Base de datos sembrada correctamente");
};
```

### Reglas de Oro para Pame:
> [!WARNING]
> No uses nunca métodos directos de `firebase/firestore` (como `addDoc` o `setDoc`) desde los componentes. Todo tiene que pasar por nuestras funciones en `src/services/` para garantizar la integridad de los datos de la base de datos Serverless.
