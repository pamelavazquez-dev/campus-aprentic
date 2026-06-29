# Guía de Defensa Táctica del Proyecto (Tech Lead / Auditoría de Arquitectura)

Este documento es material clasificado de uso interno. Su propósito es dotar a la ingeniería líder del proyecto de todos los argumentos, justificaciones arquitectónicas y resoluciones de compromisos (trade-offs) adoptadas durante la construcción del sistema e-learning. Úsalo para defender decisiones ante CTOs, Comités de FinOps o Expertos de Ciberseguridad.

## 1. Resumen Ejecutivo de la Arquitectura
Los pilares innegociables de nuestra infraestructura son tres:

1. **Zero-Cost Storage & Compute:** Hemos reemplazado los S3 Buckets y funciones AWS Lambda/Cloud Functions por poder de cómputo delegado al dispositivo cliente. Procesar en el navegador reduce nuestra factura operativa casi a cero.
2. **Zero-Trust Security (Confianza Cero):** Ni el frontend confía en el backend, ni el backend confía en el frontend. El DOM purga activamente el HTML; Firestore rechaza escrituras que no coincidan criptográficamente con el JWT de la petición.
3. **Aislamiento Funcional FinOps:** Toda lectura a bases de datos asume que el coste es alto, obligando al uso de subcolecciones (segregación masiva) y forzando lecturas prioritarias en la caché IndexedDB.

---

## 2. Justificación de Decisiones Difíciles (Trade-offs)

### ¿Por qué forzar la extracción de un PDF de hasta 800 KB en el cliente en lugar de en un Microservicio?
A priori, procesar archivos pesados en React (usando `pdf.js`) puede saturar el navegador de clientes con hardware limitado. Sin embargo, lo solventamos mediante un Web Worker (`GlobalWorkerOptions.workerSrc`) aislado del hilo principal (Main Thread). 
* **Beneficios:** Cero coste de ancho de banda y servidor, latencia imperceptible (no dependemos de ping de red para transformar el archivo) y la privacidad total de los documentos de los profesores.
* **Protección del Main Thread:** Se incluyó asincronía forzada y `yield` al *Event Loop* durante el bucle de las páginas del PDF. Si el texto resultante supera los 800 KB (un tamaño peligroso para el parseador de Markdown en dispositivos móviles de estudiantes), el frontend aborta la operación antes de saturar memoria con un mensaje empático (Bloqueo Amigable).

---

## 3. Q&A: Preguntas Críticas y Rebatimientos (Batería Anti-Auditoría)

Enfrentar preguntas agresivas durante auditorías o reviews técnicas requiere precisión atómica en la respuesta.

### P1: "Estás permitiendo que los profesores guarden y que los alumnos rendericen puro Markdown extraído arbitrariamente. ¿Cómo nos aseguras que esto no es un coladero para inyección XSS de payloads complejos?"
**Defensa:** "Porque no confiamos en la naturaleza estática del contenido. Utilizamos el paquete `react-markdown`, que por defecto evita el uso del atributo genérico `dangerouslySetInnerHTML`, el cual es el vector más común de ataque en React. Aún así, para evitar brechas en conversores de sintaxis, hemos integrado `rehype-sanitize`. Esto purga activamente el Árbol Sintáctico (AST) durante la carga en cliente, desinfectando nodos hostiles (`<script>`, eventos en línea como `onerror` en `<img>` y enlaces del tipo `javascript:alert`) antes de que toquen el Virtual DOM. Adicionalmente, el esquema Zod asegura que los hipervínculos aislados (`archivoUrl`, avatares) fuercen una regex rigurosa que exige protocolos `http/https` (o rutas relativas), mitigando ataques a nivel de esquemas formales."

### P2: "¿Por qué en las Firestore Rules decidisteis no utilizar 'Funciones de validación externas personalizadas'? ¿No viola esto el principio DRY (Don't Repeat Yourself) si tenemos lógicas complejas?"
**Defensa:** "En Firestore Rules, mantener el principio DRY mediante funciones (`function checkAdmin() { ... }`) suele encadenarse en facturaciones inesperadas y bloqueos lógicos no detectables en pruebas unitarias estáticas. Optamos por la hiper-optimización usando bloques `match` puros e inline. Cada bloque exige que la variable del documento, ejemplo `request.resource.data.alumnoAuthUid`, sea estrictamente idéntica al `request.auth.uid`. Esto garantiza un tiempo de cómputo ínfimo por parte del motor de reglas de Google (coste mínimo) y previene cualquier regresión que deje una brecha de seguridad global porque una función central se haya modificado erróneamente."

### P3: "He revisado el esquema Zod en `app.schemas.js`. Limitáis el tamaño del texto a 800 KB, pero si un usuario intercepta el JS, ¿no puede mandar un payload de 10 MB directo a Firebase por un endpoint paralelo?"
**Defensa:** "Correcto. El cliente es inseguro por definición. Por eso hemos implementado Defensa en Profundidad (Defense in Depth). 
1. **Frontend:** React chequea estáticamente el tamaño del buffer y dispara un Toast si sobrepasa los 800KB para evitar gasto de red inútil.
2. **Esquema Validado (Capa Media):** El paquete `zod` (`.max(820_000)`) asegura que las peticiones generadas por el cliente nativo sean abortadas si superan ese tamaño.
3. **Documento en Base de Datos (Segregado):** Incluso en el peor de los casos (un bypass de red manual forzando las reglas), al haber dividido la arquitectura usando una subcolección `lecciones/{id}/contenido/main`, un payload hostil no bloquearía la consulta de los demás alumnos en el índice general del curso, porque esos 10MB no se traen a memoria al listar `getLeccionesByModuloId`, aislando el daño al mínimo."

### P4: "¿Qué impacto financiero tiene vuestro modelo de datos para Firebase a largo plazo si tenemos miles de alumnos visualizando índices y módulos diariamente?"
**Defensa:** "Impacto insignificante gracias a nuestra agresiva estrategia FinOps. La reestructuración de la base de datos en dos capas soluciona esto. Primero, el listado (índice del curso) carga un documento por lección que pesa escasos Bytes (solo título e IDs). Segundo, la capa masiva de texto (la subcolección `contenido`) requiere un `fetch` específico `getLeccionMarkdown` donde la configuración prioriza la lectura local: `getDocFb(docRef, { source: 'cache' })`. Gracias a que la aplicación aprovecha el IndexedDB habilitado, si 10.000 alumnos vuelven a abrir una lección que ya cargaron ayer para estudiar un concepto de nuevo, nuestra factura en lecturas a la nube es exactamente igual a CERO."

### P5: "¿Qué pasa con PDF.js? Importar de CDNs y descargar workers dinámicamente os hace vulnerables a ataques de Supply Chain si secuestran el CDN."
**Defensa:** "Este vector está completamente mitigado. No apuntamos a ningúnpath remoto. Descargamos y paquetizamos localmente la distribución minificada mediante Webpack/Vite (`GlobalWorkerOptions.workerSrc = new URL(..., import.meta.url)`). Además, respecto a los diccionarios gráficos necesarios para renderizar ciertas fuentes, la opción `cMapUrl` apunta expresamente a `/cmaps/`, sirviendo desde nuestro propio hosting de activos estáticos. La plataforma es totalmente autosuficiente (Self-Contained) de dependencias dinámicas externas al ejecutar su motor."
