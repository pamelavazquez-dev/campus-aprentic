# Guía de Defensa Táctica del Proyecto (Tech Lead / Auditoría de Arquitectura)

Este documento es material clasificado de uso interno, diseñado para que **todo el equipo técnico** (desde perfiles junior hasta Tech Leads) entienda no solo *qué* hemos hecho, sino *por qué* lo hemos hecho. 

Cada punto incluye un **"💡 Contexto para el Equipo"** (para asegurar que todos manejamos los mismos conceptos básicos) seguido de la **"🛡️ Defensa Oficial"** (el argumento técnico puro para usar ante CTOs, inversores o auditores).

## 📑 Índice de Contenidos
1. [Contexto Funcional y Flujos de Usuario](#1-contexto-funcional-y-flujos-de-usuario-el-qué-y-el-para-qué)
2. [Decisiones del Stack Tecnológico](#2-decisiones-del-stack-tecnológico-con-qué-lo-construimos)
3. [El Modelo de Datos (Bases de Datos NoSQL)](#3-el-modelo-de-datos-bases-de-datos-nosql-en-firebase)
4. [Flujo de Autenticación y Ciclo de Vida del Usuario](#4-flujo-de-autenticación-y-ciclo-de-vida-del-usuario)
5. [Flujos Críticos Explicados Paso a Paso](#5-flujos-críticos-explicados-paso-a-paso)
6. [Gestión del Estado y Performance](#6-gestión-del-estado-y-performance-react-context)
7. [Estructura de Carpetas](#7-estructura-de-carpetas-dónde-está-cada-cosa)
8. [Resumen Ejecutivo de la Arquitectura](#8-resumen-ejecutivo-de-la-arquitectura)
9. [Justificación de Decisiones Difíciles](#9-justificación-de-decision-difíciles-trade-offs)
10. [Q&A: Preguntas Críticas y Rebatimientos](#10-qa-preguntas-críticas-y-rebatimientos-batería-anti-auditoría)

---

## 1. Contexto Funcional y Flujos de Usuario (El "Qué" y el "Para Qué")

💡 **Contexto para el Equipo:** Antes de hablar de código, necesitamos entender el producto. The Bridge Academy es una plataforma B2B/B2C para escuelas de programación. Su objetivo es que los alumnos consuman lecciones, que los instructores las creen, y que el administrador controle el negocio.

### Los 3 Roles y sus Permisos (RBAC)
Para evitar accidentes y mantener el sistema seguro, dividimos la plataforma en tres niveles estrictos:

1. **El Administrador (Coordinador Académico):**
   - **Qué hace:** Tiene vista global. Crea sedes (campus como Sevilla o Málaga), da de alta promociones (Full Stack, Ciberseguridad), y registra a profesores y alumnos.
   - **Por qué puede hacerlo:** Es el responsable de la estructura del negocio. No crea el contenido de las lecciones, solo construye "las tuberías" para que el profesor trabaje.
2. **El Profesor (Instructor):**
   - **Qué hace:** Solo ve las promociones a las que el Admin le ha dado acceso. Su trabajo es poblar el contenido: subir PDFs, escribir lecciones en Markdown y publicar temarios.
   - **Por qué NO puede hacer lo del Admin:** Imagina si un profesor por error borrara la sede entera de Málaga. Al limitarle el acceso (Principio de Menor Privilegio), trabaja sin miedo a romper el sistema global.
3. **El Alumno (Consumidor Final):**
   - **Qué hace:** Entra a su campus, ve los módulos activos y lee las lecciones. Solo tiene permiso de lectura.
   - **Por qué NO puede hacer lo del Profesor:** Por motivos obvios de integridad académica. Su flujo es 100% de consumo y seguimiento de calificaciones.

---

## 2. Decisiones del Stack Tecnológico (Con qué lo construimos)

💡 **Contexto para el Equipo:** No usamos estas tecnologías porque estén de moda, sino porque resuelven problemas específicos para el modelo de negocio de una Academia.

- **Vite + React 19:** Necesitábamos que la plataforma fuera una SPA (*Single Page Application*). La página no recarga cuando cambias de módulo, dando una sensación de fluidez y rapidez extrema, crucial para mantener la concentración del alumno. 
- **Firebase (Auth + Firestore):** Crear nuestro propio backend con Node/SQL nos habría costado meses de infraestructura. Firebase nos da autenticación y base de datos en la nube (BaaS) en horas.
- **Zod (Seguridad de Datos):** Es nuestro "portero de discoteca". Antes de enviar una lección a Firebase, Zod revisa que el título no esté vacío, que la URL sea válida y previene que entren datos corruptos a la base de datos.
- **TailwindCSS:** En lugar de lidiar con cientos de archivos CSS desorganizados, Tailwind nos permite diseñar interfaces rápidas y modernas garantizando un diseño muy visual sin salir de React.

---

## 3. El Modelo de Datos (Bases de Datos NoSQL en Firebase)

💡 **Contexto para el Equipo:** En Firebase no tenemos "tablas" conectadas por líneas como en SQL (MySQL/Postgres). Tenemos "Colecciones" que contienen "Documentos" (archivos JSON). Al no haber conexiones automáticas, tenemos que diseñarlo pensando en *cómo vamos a leer la información*.

- **Entidades Principales:** Tenemos colecciones para `Campus`, `Promociones`, `Usuarios` (Admin, Alumno, Profesor), `Modulos`, `Lecciones`, `Inscripciones`, `Notas`, `Proyectos` y `Reviews`. 
- **Relaciones por Referencia (IDs):** En lugar de guardar todos los datos de un módulo dentro de la promoción, guardamos solo su ID. Esto se llama "Normalización". 
- **Subcolecciones de Texto:** 
  - 🛡️ **Defensa Oficial:** *"Para proteger el rendimiento y la factura de Firebase, el contenido gigante (Markdown de la clase) no vive en la raíz del documento de la lección. Vive en una subcolección aislada `lecciones/{id}/contenido/main`. Así, cuando listamos las 50 lecciones de un módulo para montar el menú lateral, descargamos 50KB en lugar de 50MB."*

---

## 4. Flujo de Autenticación y Ciclo de Vida del Usuario

💡 **Contexto para el Equipo:** Cuando un usuario entra, ocurren dos cosas de forma invisible: Firebase Auth comprueba su contraseña, y Firestore (la base de datos) nos dice quién es (su rol y su campus).

- **Auth vs Base de Datos:** Firebase Auth es solo el "guardia de seguridad" que verifica la identidad. Firestore es "recursos humanos" que nos dice qué permisos tiene esa persona.
- **Flujo de Primer Login:** 
  - 🛡️ **Defensa Oficial:** *"Por seguridad proactiva, interceptamos a los usuarios recién creados (que tienen una contraseña autogenerada) mediante el componente `ForcePasswordChangeModal`. Hasta que no establecen una clave criptográfica personal fuerte, el estado global de la aplicación (vía `useAuth`) bloquea cualquier navegación interactiva."*

---

## 5. Flujos Críticos Explicados Paso a Paso

### El `WizardCurso.jsx` (Creación de Lecciones)
💡 **Contexto para el Equipo:** Es la pantalla donde el Profesor crea el temario. Si tiene un PDF, en lugar de copiar a mano, usa nuestra herramienta para extraer el texto.
- 🛡️ **Defensa Oficial:** *"Cuando el instructor arrastra un PDF, `usePDFImport` lanza un WebWorker de `pdf.js` en segundo plano. Esto extrae el texto puro, lo pre-formatea y lo inyecta en el estado de React sin congelar el Main Thread. Es 'Edge-Computing' puro: ahorramos el 100% de los costes de backend en procesamiento documental."*

### El `VisorLeccion.jsx` (Lectura del Alumno)
💡 **Contexto para el Equipo:** Es la pantalla donde el Alumno lee la clase.
- 🛡️ **Defensa Oficial:** *"Renderizamos el Markdown almacenado en la subcolección usando `react-markdown` y `rehype-sanitize` para construir un AST (Abstract Syntax Tree) libre de inyecciones maliciosas. Si una tabla o bloque de código falla al renderizar por un error de sintaxis del profesor, nuestro `ErrorBoundary` local captura el fallo mostrando un aviso amigable solo en ese bloque, sin tirar abajo toda la aplicación."*

---

## 6. Gestión del Estado y Performance (React Context)

💡 **Contexto para el Equipo:** Para que las pantallas carguen rápido, no podemos pedir la información a la base de datos cada vez que hacemos clic en un botón. Guardamos la información general en la "memoria RAM" del navegador.

- 🛡️ **Defensa Oficial:** *"Utilizamos `DataContext` para mantener en memoria datos estructurales (Promociones y Campus), minimizando lecturas redundantes a Firestore. Para optimizar el rendimiento y evitar renderizados en cascada (cascading renders) que bloqueen la UI, las rutas de la aplicación están divididas mediante Lazy Loading en `App.jsx`, de forma que un alumno jamás descarga el código Javascript del panel de Administración."*

---

## 7. Estructura de Carpetas (Dónde está cada cosa)

💡 **Contexto para el Equipo:** Si tú o Pame necesitáis arreglar un bug o añadir una funcionalidad, debéis saber exactamente dónde buscar. Nuestro proyecto sigue una "Arquitectura por Capas" (Layered Architecture).

- `src/components/`: Las "piezas de Lego" visuales. Aquí están los botones, formularios y tablas reutilizables. Estos componentes son "tontos": solo dibujan cosas en pantalla, no hablan con la base de datos.
- `src/pages/`: Las "pantallas" completas. Agrupan varios componentes para armar una vista entera (ej. `WizardCurso.jsx` o `AlumnoDashboard.jsx`). Están divididas lógicamente por rol.
- `src/services/`: Nuestro "cartero". Estos archivos son los únicos autorizados a hablar con la base de datos de Firebase. Si hay que leer, guardar o borrar un alumno, se hace mediante llamadas aquí.
- `src/models/`: Los "traductores". Cogen los datos en bruto y feos que devuelve Firebase y los convierten en objetos limpios y predecibles que React puede usar fácilmente.
- `src/schemas/`: La "aduana" de Zod. Aquí definimos reglas estrictas (ej. "el título no puede estar vacío" o "el email debe llevar una @").
- `src/hooks/`: Lógica compleja separada de las vistas. Por ejemplo, `usePDFImport.js` contiene toda la matemática y lógica pesada de extraer texto de un PDF, dejando limpia a la vista `WizardCurso`.
- `src/context/`: Memoria global. Guarda información que toda la app necesita en cualquier momento (como saber si el usuario es Admin o ver si el "Modo Oscuro" está activado) sin tener que pasar la información de archivo en archivo.

---

## 8. Resumen Ejecutivo de la Arquitectura

Los pilares innegociables de nuestra infraestructura son cuatro:

1. **Zero-Cost Storage & Compute (Edge Computing en Cliente):** Hemos reemplazado los costosos S3 Buckets y funciones AWS Lambda/Cloud Functions por poder de cómputo delegado al dispositivo cliente. Procesar en el navegador reduce nuestra factura operativa casi a cero.
2. **Zero-Trust Security (Confianza Cero):** Ni el frontend confía en el backend, ni el backend confía en el frontend. El DOM purga activamente el HTML en cliente; Firestore rechaza escrituras que no coincidan criptográficamente con el JWT de la petición.
3. **Aislamiento Funcional FinOps:** Toda lectura a bases de datos asume que el coste es alto, obligando al uso de subcolecciones (segregación masiva) y forzando lecturas prioritarias en la caché local (`IndexedDB`).
4. **QA Driven Development (Calidad Asegurada):** Una suite de pruebas automatizada, asíncrona y basada en comportamiento (Behavior-Driven) para evitar regresiones en los flujos críticos.

---

## 9. Justificación de Decisiones Difíciles (Trade-offs)

### ¿Por qué forzar la extracción de un PDF de hasta 800 KB en el cliente en lugar de en un Microservicio?

💡 **Contexto para el Equipo:** Procesar un PDF es una tarea muy pesada ("costosa computacionalmente"). Si hacemos que un servidor lo haga, tenemos que pagar por ese servidor cada vez que un profesor sube un PDF. Si hacemos que lo haga el navegador del profesor, ¡nos sale gratis! Pero el riesgo es que si el archivo es gigante, el navegador se quede "congelado" (bloqueando el *Main Thread* o Hilo Principal). 

🛡️ **Defensa Oficial:** A priori, procesar archivos pesados en React puede saturar el navegador. Sin embargo, lo solventamos mediante un Web Worker (`GlobalWorkerOptions.workerSrc`) aislado del hilo principal (*Main Thread*). 
* **Beneficios:** Cero coste de ancho de banda y servidor, latencia imperceptible (no dependemos de ping de red para subir y bajar el archivo transformado) y la privacidad total de los documentos de los profesores.
* **Protección del Main Thread:** Se incluyó asincronía forzada y `yield` al *Event Loop* durante el bucle de las páginas del PDF. Si el texto supera los 800 KB (un tamaño crítico para parsear Markdown en teléfonos móviles de estudiantes), el frontend aborta la operación con un mensaje empático para evitar cuelgues (Bloqueo Amigable).

---

## 10. Q&A: Preguntas Críticas y Rebatimientos (Batería Anti-Auditoría)

### P1: "Estás permitiendo que los profesores guarden y que los alumnos rendericen puro Markdown. ¿Cómo nos aseguras que esto no es un coladero para inyección XSS?"

💡 **Contexto para el Equipo:** XSS (*Cross-Site Scripting*) es un ataque donde un hacker escribe código malicioso (como `<script>robarContraseña()</script>`) dentro de un texto normal (el Markdown de la lección). Si React simplemente dibuja ese texto, el script se ejecuta en la pantalla de todos los alumnos. Para evitarlo, "sanitizamos" (limpiamos) el texto antes de dibujarlo.

🛡️ **Defensa Oficial:** "Porque no confiamos en la naturaleza estática del contenido. Utilizamos `react-markdown`, que por defecto evita el uso del atributo genérico `dangerouslySetInnerHTML`, el vector más común de ataque en React. Aún así, para evitar brechas en conversores de sintaxis, hemos integrado `rehype-sanitize`. Esto purga activamente el Árbol Sintáctico (AST) durante la carga en cliente, desinfectando nodos hostiles (`<script>`, eventos en línea como `onerror` en `<img>` y enlaces del tipo `javascript:alert`) antes de que toquen el Virtual DOM. Adicionalmente, el esquema Zod exige protocolos seguros (`http/https`)."

### P2: "¿Por qué en las Firestore Rules decidisteis no utilizar 'Funciones' para no repetir código (DRY)?"

💡 **Contexto para el Equipo:** DRY (*Don't Repeat Yourself*) es la regla de oro de la programación: no repitas código. Si compruebas si alguien es admin en 10 sitios, deberías crear una función `esAdmin()` y llamarla 10 veces. PERO en Firebase Firestore, llamar a funciones dentro de las reglas de seguridad añade tiempo de cómputo y riesgo de errores que rompen toda la base de datos de golpe.

🛡️ **Defensa Oficial:** "En Firestore Rules, mantener el principio DRY mediante funciones suele encadenarse en facturaciones inesperadas y bloqueos lógicos difíciles de auditar. Optamos por la hiper-optimización usando bloques `match` puros e *inline*. Cada bloque exige directamente que la variable del documento sea estrictamente idéntica al `request.auth.uid`. Esto garantiza un tiempo de cómputo ínfimo por parte del motor de Google (coste mínimo) y previene que un error en una función centralizada comprometa toda la base de datos."

### P3: "Limitáis el tamaño del texto a 800 KB en el cliente, pero si un hacker intercepta la petición o usa Postman, ¿no puede mandar un payload de 10 MB directo a Firebase?"

💡 **Contexto para el Equipo:** El Frontend (React) es como la puerta de una discoteca, y Zod es el portero. Pero un hacker puede saltarse la puerta e inyectar datos directo a la base de datos (Backend) usando un script. A esto se le llama "Bypass". Por eso, nunca debemos confiar solo en el Frontend.

🛡️ **Defensa Oficial:** "Correcto. El cliente es inseguro por definición. Por eso hemos implementado Defensa en Profundidad (*Defense in Depth*). 
1. **Frontend:** React aborta si sobrepasa los 800KB para evitar gasto de red inútil.
2. **Esquema Validado:** El paquete `zod` asegura tipado fuerte.
3. **Documento Segregado (Backend):** Incluso si un payload hostil de 10MB entra, al haber dividido la arquitectura usando la subcolección `lecciones/{id}/contenido/main`, un payload gigante no bloquearía el índice general del curso. Los 10MB no se traen a memoria al listar las lecciones del módulo, aislando el daño al mínimo absoluto."

### P4: "¿Qué impacto financiero tiene vuestro modelo de datos para Firebase a largo plazo si tenemos miles de alumnos?"

💡 **Contexto para el Equipo:** Firebase cobra por cada vez que "leemos" un documento. Si 1.000 alumnos abren una lección 10 veces para estudiar, son 10.000 lecturas. Si lo multiplicamos por meses, la factura puede ser inmensa. *IndexedDB* es una pequeña base de datos oculta en el navegador del usuario que guarda cosas que ya ha leído para no volver a pedirlas a Firebase.

🛡️ **Defensa Oficial:** "Impacto insignificante gracias a nuestra agresiva estrategia FinOps. El listado (índice) carga documentos que pesan escasos Bytes. Para el texto masivo (la subcolección `contenido`), utilizamos un `fetch` específico `getLeccionMarkdown` donde la configuración prioriza la lectura local: `getDocFb(docRef, { source: 'cache' })`. Gracias al *IndexedDB* habilitado, si 10.000 alumnos vuelven a abrir una lección que ya cargaron ayer, nuestra factura en lecturas a la nube es exactamente igual a **CERO**."

### P5: "¿Qué pasa con PDF.js? Importar librerías desde URLs externas (CDNs) os hace vulnerables a ataques de Supply Chain."

💡 **Contexto para el Equipo:** Un ataque de *Supply Chain* (Cadena de Suministro) ocurre cuando usamos una librería externa (ej. cargamos un script desde `unpkg.com` o `cdnjs.com`) y un hacker logra hackear esa página externa. Si cambian el script ahí, nuestra app descargará el virus automáticamente sin que nos demos cuenta.

🛡️ **Defensa Oficial:** "Este vector está completamente mitigado. No apuntamos a ningún path remoto. Descargamos y paquetizamos localmente la distribución mediante Webpack/Vite (`GlobalWorkerOptions.workerSrc = new URL(..., import.meta.url)`). Además, los diccionarios gráficos necesarios se sirven desde nuestro propio hosting de activos estáticos. La plataforma es totalmente autosuficiente (*Self-Contained*)."

### P6: "Veo que dependemos fuertemente del Frontend para la lógica RBAC (Permisos). ¿Cómo prevenimos que alguien rompa el control de accesos al modificar código?"

💡 **Contexto para el Equipo:** RBAC (*Role Based Access Control*) significa que dependiendo de tu rol (Admin, Profesor, Alumno) puedes ver o hacer ciertas cosas. Si un programador del equipo hace un cambio y sin querer permite que los alumnos borren lecciones, sería catastrófico. No podemos depender de acordarnos de probar todo a mano.

🛡️ **Defensa Oficial:** "Mediante una suite de QA especializada. No confiamos en testeos manuales para el control de accesos. Hemos implementado pruebas unitarias exhaustivas con `Vitest` sobre el hook `useRBAC`, validando paramétricamente cada combinación posible de Rol contra cada acción (Crear, Editar, Borrar). Si un desarrollador modifica inadvertidamente los niveles de privilegio, el CI/CD fallará instantáneamente."

### P7: "¿No va a ser vuestra estructura de carpetas actual un infierno de mantenimiento cuando la aplicación crezca?"

💡 **Contexto para el Equipo:** Actualmente tenemos carpetas por "tipos de archivo" (`hooks/`, `components/`, `services/`). Si en el futuro tenemos módulos de pagos, foros, tutorías y certificados, buscar el "hook del foro", el "servicio del foro" y el "componente del foro" será un caos. *Feature-Sliced Design* propone agrupar las cosas por "Funcionalidad": tener una carpeta `Foro/` que contenga sus propios hooks y servicios.

### P8: "¿Por qué generar los certificados PDF en el cliente (html2canvas + jspdf) en lugar de en el servidor (Puppeteer/PDFKit)?"

💡 **Contexto para el Equipo:** Generar un diploma bonito en PDF requiere mucho cálculo. Si lo hacemos en un servidor, cada vez que un alumno aprueba, el servidor tiene que arrancar un navegador fantasma (Puppeteer), dibujar el HTML, tomar una "foto" y crear un PDF. Eso gasta muchísima memoria y CPU. Si lo hace el navegador de cada alumno, nos ahorramos todo ese esfuerzo.

🛡️ **Defensa Oficial:** "Una vez más, FinOps y escalabilidad. La renderización server-side de PDFs complejos (especialmente con diseños detallados como el 'Dark/Light Mode', patrones SVG y flexbox) es extremadamente intensiva en recursos de cómputo (CPU/Memoria). Al delegarlo al cliente usando `html2canvas` para el rasterizado del DOM y `jspdf` para el empaquetado del documento, garantizamos un diseño *pixel-perfect* (wysiwyg). Aplicamos la lógica de negocio (nota >= 5 en todos los módulos) de forma local, evitando llamadas API superfluas o cargas en servicios Serverless."
