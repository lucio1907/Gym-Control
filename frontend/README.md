# Gym Control - Frontend Application 🎨✨

Esta es la interfaz de usuario de **Gym Control**, una aplicación web moderna y de alta fidelidad construida con **Next.js 15**. Se enfoca en proporcionar una experiencia de usuario (UX) premium y fluida tanto para administradores como para alumnos.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router).
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Vanilla CSS para componentes complejos).
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/) para transiciones y micro-interacciones.
- **Iconos**: [Lucide React](https://lucide.dev/).
- **Estado & Datos**: Axios para peticiones a la API.

---

## ✨ Características Premium

- **Diseño Glassmorphism & UX Premium**: Capas translúcidas, animaciones con Framer Motion y feedback visual mediante `FeedbackModal`.
- **Business Analytics Avanzado**: Dashboard estadístico con mapas de calor (Recharts), tendencias de crecimiento y control financiero integrado.
- **Optimización de Alta Carga**: Uso de `content-visibility: auto` y capas promovidas por GPU (`will-change`) para asegurar 60fps constantes.
- **Flujos de Trabajo Inteligentes**: Automatización del alta de alumnos con apertura inmediata de cobro pre-llenado.
- **Responsive Design**: Totalmente adaptado para móviles, tablets y monitores de escritorio.
- **Monitor Terminal**: Interfaz optimizada para el ingreso de alumnos, con visualización de QR y feedback de estado instantáneo.

---

## 📁 Estructura del Proyecto

```text
src/
├── app/            # Rutas y páginas (Dashboard, Monitor, Login, etc.)
├── components/     # Componentes reutilizables (Modales, Tablas, UI)
├── hooks/          # Hooks personalizados de React
├── lib/            # Utilidades y configuración de librerías
└── providers/      # Context Providers para estado global
```

---

## 🚀 Instalación y Setup

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```

2.  **Configurar variables de entorno**: Crea un archivo `.env.local` en la raíz de la carpeta `/frontend`:
    ```env
    NEXT_PUBLIC_API_URL = "http://localhost:8080/api"
    ```

3.  **Iniciar en desarrollo**:
    ```bash
    npm run dev
    ```

---

## 🖼 Capturas y Flujos

- **Login / Registro**: Flujos seguros con validación en tiempo real.
- **Admin Hub**: Centro de mando para la gestión de alumnos.
- **User Dashboard**: Perfil personalizado para el alumno.
- **Monitor**: Pantalla de acceso optimizada.

---

Desarrollado con foco en la **excelencia visual** y la **usabilidad**. 🦾🔥
