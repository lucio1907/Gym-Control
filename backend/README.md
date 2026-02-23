# Gym Control - Backend API 🚀

Este es el backend oficial de **Gym Control**, una plataforma integral para la gestión de gimnasios, alumnos, rutinas y asistencias. Construido con una arquitectura robusta, escalable y tipos estrictos.

## 🛠 Tech Stack

*   **Runtime**: [Node.js](https://nodejs.org/)
*   **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **ORM**: [Sequelize](https://sequelize.org/) (PostgreSQL)
*   **Validación**: [Zod](https://zod.dev/)
*   **Autenticación**: JWT (JSON Web Tokens) & HTTP-only Cookies
*   **Correos**: [Nodemailer](https://nodemailer.com/)
*   **Utilidades**: bcrypt, nanoid, uuid

## ✨ Características Principales

*   **Gestión de Perfiles**: Registro, login y recuperación de contraseña para alumnos.
*   **Panel Administrativo**: CRUD de administradores y gestión global de la plataforma.
*   **Asistencia Inteligente**: Registro de entradas mediante escaneo de QRs temporales con validación de estado de cuenta.
*   **Sistema de Rutinas**: Asignación y gestión de ejercicios personalizados para cada alumno.
*   **Módulo de Pagos**: Registro de facturación que actualiza automáticamente la membresía y resetea asistencias.
*   **Seguridad**: Middlewares de protección de rutas por rol (Admin/User).

## 📁 Estructura del Proyecto

```text
src/
├── config/       # Configuración de DB (Sequelize)
├── controllers/  # Lógica de manejo de peticiones
├── errors/       # Excepciones personalizadas
├── middlewares/  # Protección de rutas y validaciones
├── models/       # Definición de modelos de Sequelize
├── routes/       # Definición de endpoints de la API
├── services/     # Lógica de negocio encapsulada
├── templates/    # Plantillas HTML para correos
├── utils/        # Herramientas (JWT, helpers)
└── validators/   # Esquemas de validación con Zod
```

## 🚀 Instalación y Setup

1.  **Clonar el repositorio** e ingresar a la carpeta:
    ```bash
    git clone https://github.com/lucio1907/Gym-Control.git
    cd backend
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno**: Crea un archivo `.env` basado en el siguiente ejemplo:
    ```env
    PORT = 8080
    FRONTEND_URL = "http://localhost:5173"
    PG_HOST = "localhost"
    PG_PORT = 5432
    PG_DATABASE = "GymControl"
    PG_USERNAME = "tu_usuario"
    PG_PASSWORD = "tu_password"
    JWT_SECRET_KEY = "una_clave_muy_segura"
    EMAIL_HOST = "smtp.gmail.com"
    EMAIL_PORT = 465
    EMAIL_USER = "tu_email@gmail.com"
    EMAIL_PASS = "tu_app_password"
    ```

4.  **Correr en desarrollo**:
    ```bash
    npm run dev
    ```

## 🛣 API Endpoints

### 👤 Perfiles (Profiles)
*   `POST /api/profiles/register`: Registro de alumnos.
*   `POST /api/profiles/login`: Login de alumnos.
*   `POST /api/profiles/forgot-password`: Solicitar recuperación de contraseña.
*   `POST /api/profiles/reset-password`: Cambiar contraseña con token.
*   `GET /api/profiles/me`: Obtener perfil propio (requiere sesión).
*   `GET /api/profiles/`: Listar todos los alumnos (Solo Admin).

### 🏋️ Rutinas (Routines)
*   `GET /api/routines/profile/:profile_id`: Ver rutinas de un alumno.
*   `POST /api/routines/createRoutine/:profile_id`: Crear rutina (Solo Admin).
*   `PUT /api/routines/updateRoutine/:id`: Editar rutina (Solo Admin).
*   `DELETE /api/routines/deleteRoutine/:id`: Borrar rutina (Solo Admin).

### 📍 Asistencia (Attendance)
*   `POST /api/attendance/check-in/:method`: Registrar entrada (QR_SCAN o MANUAL).
*   `GET /api/attendance/history`: Ver historial de asistencias.

### 💳 Pagos (Payments)
*   `POST /api/payments/`: Registrar un pago y actualizar membresía (Solo Admin).
*   `GET /api/payments/history`: Historial de pagos realizados.

### 🛡 Admin & Seguridad
*   `POST /api/admins/login`: Login de administradores.
*   `GET /api/qrs/generate`: Generar un QR temporal para el ingreso.

---
Desarrollado con ❤️ para la gestión eficiente de gimnasios.
