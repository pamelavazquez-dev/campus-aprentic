# The Bridge Academy - Plataforma E-Learning 🎓

> Empoderando el talento tecnológico con una plataforma escalable, segura y altamente eficiente.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=Vitest&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=Zod&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🚀 Propuesta de Valor

The Bridge Academy es una plataforma de e-learning B2B/B2C diseñada desde cero para resolver los problemas clásicos de la educación tecnológica a distancia: altos costes de infraestructura y baja retención de estudiantes. Nuestra arquitectura nos otorga una ventaja competitiva única: **eficiencia extrema en costes operativos**. Hemos descentralizado el procesamiento de grandes volúmenes de datos mediante un innovador sistema de extracción de texto de PDFs directamente en el navegador del cliente (*Client-Side Processing*). Esto elimina por completo la necesidad de costosos servidores de procesamiento (Cloud Functions/Lambdas) y minimiza drásticamente el uso de Storage, permitiendo a la plataforma escalar de manera exponencial sin que los costes de infraestructura se disparen.

## ✨ Características Clave

- **Experiencia de Usuario Inmersiva:** Interfaz limpia, accesible e inspirada en las mejores prácticas de diseño UI/UX para maximizar la retención y concentración del estudiante.
- **Creación de Contenido Dinámico:** Los instructores pueden importar documentos complejos en PDF directamente o escribir lecciones con soporte Markdown enriquecido. El contenido se sanitiza instantáneamente contra vulnerabilidades XSS.
- **Jerarquía de Roles (RBAC) Granular:** Diferenciación estricta entre Administradores, Instructores y Alumnos. Cada perfil tiene una vista adaptada (Dashboard) que muestra únicamente lo que necesitan, garantizando el principio de menor privilegio.
- **Gestión Multi-Campus y Promociones:** Control total sobre diferentes sedes (ej. Sevilla, Málaga) y especialidades (Full Stack, Ciberseguridad), permitiendo segmentar el acceso a los módulos educativos de forma inteligente y automatizada.
- **Validación Robusta (Zero-Trust):** Aseguramiento de los datos de extremo a extremo usando `Zod` en el frontend y Reglas de Seguridad estrictas en Firestore, evitando la entrada de payloads corruptos o maliciosos.

## 🏗️ Arquitectura y Tech Stack

Nuestro flujo de datos está diseñado para ser rápido, seguro y tolerante a fallos:

- **Frontend:** Construido con **React 19** y **Vite**, utilizando **TailwindCSS v4** para un sistema de diseño consistente.
- **Base de Datos y Auth:** Integración nativa con **Firebase Authentication** y **Firestore**. El acceso a los documentos está fuertemente protegido mediante *Firestore Security Rules*, bloqueando lecturas/escrituras no autorizadas.
- **Gestión de Estado y Formularios:** Patrones de Hooks personalizados (`useAuth`, `useRBAC`, `usePDFImport`) que abstraen la complejidad y conectan la vista con los conversores bidireccionales de Firestore (modelos de datos).
- **QA y Testing:** Suite de pruebas integral construida con **Vitest** y **React Testing Library**, asegurando validaciones, lógica asíncrona y flujos de UI a prueba de regresiones.

## ⚙️ Quick Start

Instrucciones a prueba de fallos para clonar, instalar y levantar el proyecto en menos de 2 minutos.

```bash
# 1. Clona el repositorio
git clone https://github.com/TheBridge-FullStackDeveloper/AprenTIC_Academy_-FullStack_Web_Sevilla_Group_1.git
cd AprenTIC_Academy_-FullStack_Web_Sevilla_Group_1

# 2. Instala las dependencias
npm install

# 3. Configura las variables de entorno
# Crea un archivo .env en la raíz e inyecta tus credenciales de Firebase:
# VITE_FIREBASE_API_KEY="tu_api_key"
# VITE_FIREBASE_AUTH_DOMAIN="tu_auth_domain"
# VITE_FIREBASE_PROJECT_ID="tu_project_id"
# ... 

# 4. Inicia el servidor de desarrollo
npm run dev
```

La plataforma estará disponible localmente en `http://localhost:5173`.

## 📂 Estructura del Proyecto (Migración a FSD - Feature-Sliced Design)

Para garantizar la escalabilidad a nivel *Enterprise*, el proyecto adopta los principios de **Feature-Sliced Design**. Esto significa que el código no solo se divide por capas técnicas, sino por **Dominios de Negocio (Features)**.

```text
📦 TheBridge-Academy
 ┣ 📂 src
 ┃ ┣ 📂 app          # Configuración global, Providers (Auth, Data) y Enrutador principal (App.jsx)
 ┃ ┣ 📂 features     # 🚀 Dominios de Negocio (Módulos independientes)
 ┃ ┃ ┣ 📂 auth       # Lógica de Login, Cambio de Contraseña, Validaciones Zod de Auth
 ┃ ┃ ┣ 📂 lecciones  # Visor PDF, Creador Markdown, usePDFImport, Servicios de Lecciones
 ┃ ┃ ┣ 📂 usuarios   # Gestión CRUD de Alumnos/Profesores, Modelos, Tablas UI
 ┃ ┃ ┗ 📂 campus     # Gestión de Sedes (Sevilla/Málaga) y Promociones
 ┃ ┣ 📂 shared       # 🧱 Código compartido y agnóstico (UI Kit)
 ┃ ┃ ┣ 📂 ui         # Componentes base (Botones, Inputs, Badges, Modales)
 ┃ ┃ ┣ 📂 api        # Configuración base de Firebase y base.service.js
 ┃ ┃ ┗ 📂 utils      # Helpers globales (RBAC, formateadores, etc.)
 ┃ ┗ 📂 pages        # Vistas de alto nivel (Agrupan features)
 ┃   ┣ 📂 admin
 ┃   ┣ 📂 instructor
 ┃   ┗ 📂 alumno
 ┣ 📜 package.json
 ┗ 📜 README.md
```

Esta estructura garantiza **alta cohesión** (todo lo relacionado con lecciones vive junto) y **bajo acoplamiento** (las features no se cruzan indiscriminadamente).

## 🤝 Comercialización y Contacto

The Bridge Academy está preparado para revolucionar el sector EdTech. Su arquitectura modular permite adaptarlo rápidamente a otras verticales formativas, universidades corporativas o plataformas SaaS privadas, ofreciendo rentabilidad inmediata gracias a la optimización de procesamiento en cliente.

¿Interesado en una **demo técnica**, integración B2B o explorar una colaboración estratégica como inversor?  
📬 Contáctanos directamente a través del repositorio para agendar una llamada y descubrir el potencial tecnológico de la plataforma.

---
*Construido con código limpio, arquitectura resiliente y visión de producto.*
