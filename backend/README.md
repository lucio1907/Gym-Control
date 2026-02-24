# Gym Control - Backend API 🚀

Este es el backend oficial de **Gym Control**, una plataforma integral para la gestión de gimnasios. Construido con una arquitectura robusta, escalable y tipos estrictos en **TypeScript**.

---

## 🛠 Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **ORM**: [Sequelize](https://sequelize.org/) (PostgreSQL)
- **Validación**: [Zod](https://zod.dev/)
- **Autenticación**: JWT (JSON Web Tokens) & HTTP-only Cookies (Máxima seguridad)
- **Correos**: [Nodemailer](https://nodemailer.com/) con plantillas HTML profesionales.

---

## ✨ Características Principales

- **Gestión de Perfiles**: Registro, login y recuperación de contraseña para alumnos.
- **Panel Administrativo**: Control total de alumnos, perfiles y rutinas.
- **Asistencia con Doble Validación**:
    - Bloqueo por vencimiento de cuota (Tiempo real).
    - Sistema anti-spam (Cooldown de 2 minutos).
- **Billing Automation**: 
    - **Cron Job**: Proceso automático diario para actualizar estados de pago.
    - **Real-time Blocking**: Bloqueo instantáneo si la fecha de vencimiento ha pasado, incluso antes de que corra el cron.
- **Seguridad**: Middlewares de protección de rutas basados en roles y sesiones seguras mediante cookies.

---

## 📁 Estructura del Proyecto

```text
src/
├── config/       # Configuración de DB (Sequelize)
├── controllers/  # Lógica de manejo de peticiones
├── middlewares/  # Protección de rutas y validaciones
├── models/       # Definición de modelos de Sequelize
├── routes/       # Definición de endpoints de la API
├── services/     # Lógica de negocio (Cron, Attendance, Payments)
├── templates/    # Plantillas HTML para correos de soporte
└── validators/   # Esquemas de validación con Zod
```

---

## 🚀 Instalación y Setup

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```

2.  **Configurar variables de entorno**: Crea un archivo `.env`:
    ```env
    PORT = 8080
    FRONTEND_URL = "http://localhost:3000"
    PG_HOST = "localhost"
    PG_DATABASE = "GymControl"
    PG_USERNAME = "tu_usuario"
    PG_PASSWORD = "tu_password"
    JWT_SECRET_KEY = "tu_clave_secreta"
    EMAIL_USER = "tu_email@gmail.com"
    EMAIL_PASS = "tu_app_password"
    ```

3.  **Correr en desarrollo**:
    ```bash
    npm run dev
    ```

---

## 🛠 Mantenimiento y Verificación

El proyecto incluye scripts de auditoría para asegurar la salud del sistema:
- **Verificación Completa**: `npx ts-node scripts/verify-backend.ts`
    - Prueba automáticamente: Cooldown de entrada, bloqueo por deuda en tiempo real y lógica del Cron de facturación.

---

## 🛣 API Endpoints Principales

- `POST /api/profiles/register`: Registro de alumnos.
- `POST /api/attendance/check-in/:method`: Ingreso por QR o DNI.
- `GET /api/qrs/generate-qr`: Generar QR temporal (Solo User).
- `POST /api/payments/`: Registrar pago y resetear asistencias (Solo Admin).

---

Desarrollado para ser **escalable, seguro y fácil de mantener**. 🚀
