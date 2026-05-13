# BoxManager 📦 — Mobile First PWA

Sistema de gestión de pedidos y logística optimizado para dispositivos móviles. Diseñado para equipos pequeños que requieren un seguimiento preciso, feedback táctil y notificaciones en tiempo real del ciclo de vida de los productos.

## 🚀 Características Principales

### 📱 Experiencia Móvil Nativa (Mobile-First)
- **Instalable (PWA)**: Registrada como PWA con Service Worker para funcionamiento offline y acceso rápido desde la pantalla de inicio.
- **Pull-to-Refresh**: Gesto nativo para actualizar datos deslizando hacia abajo en listas de pedidos e historial.
- **Feedback Háptico**: Vibración táctil al realizar acciones clave (confirmar pedidos, errores, navegación).
- **Navegación Fluida**: Barra inferior ergonómica y transiciones de página suaves con Framer Motion.

### 🔔 Notificaciones Inteligentes (Zero-Polling)
- **Push en Segundo Plano**: Notificaciones nativas del sistema operativo (estilo WhatsApp) incluso cuando la app está minimizada.
- **Supabase Realtime**: Arquitectura basada en WebSockets; el servidor empuja los cambios instantáneamente sin saturar la base de datos.
- **Filtro de Auto-Spam**: El sistema detecta tus propias acciones para no enviarte notificaciones de lo que tú mismo acabas de registrar.

### ⚡ Rendimiento y UX Premium
- **Optimistic UI**: Los estados de los pedidos se actualizan instantáneamente en la interfaz antes de recibir la confirmación del servidor.
- **Dashboard Interactivo**: Resumen dinámico con métricas diarias, semanales y mensuales con acceso directo a secciones.
- **Diseño Glassmorphism**: Estética moderna en modo oscuro con superficies traslúcidas, desenfoques y jerarquía visual refinada.

### 📦 Gestión Logística
- **Flujo Completo**: Seguimiento detallado: *Pendiente → En Preparación → Listo → Entregado*.
- **Registro de Responsables**: Seguimiento de quién creó el pedido y quién realizó la entrega final.
- **Gestión de Devoluciones**: Módulo dedicado para el registro de devoluciones con impacto automático en las métricas.
- **Autocompletado**: Búsqueda inteligente de clientes y productos para agilizar el registro.

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + Vite
- **Mobile Runtime**: Capacitor (Integración nativa para Android/iOS)
- **Backend-as-a-Service**: Supabase (PostgreSQL, Auth, Realtime)
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React
- **Estilos**: Vanilla CSS con Custom Design System (CSS Variables)

## 📦 Guía de Desarrollo

### Requisitos Previos
- Node.js (v18+)
- Cuenta de Supabase

### Instalación y Configuración
1. Clona el repositorio.
2. Instala dependencias: `npm install`
3. Configura las variables de entorno en `src/api/client.js` con tu URL y Key de Supabase.

### Comandos Disponibles
- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Genera el bundle de producción optimizado.
- `npm run sync`: Compila y sincroniza los cambios con el proyecto de Capacitor (Android).
- `npm run open:android`: Abre el proyecto en Android Studio para generar el APK.
- `npm run preview`: Previsualiza la versión de producción localmente.

## 📂 Estructura del Proyecto
- `/src/api`: Servicios de conexión con Supabase.
- `/src/components`: Componentes UI comunes y layout.
- `/src/features`: Lógica de negocio (pedidos, devoluciones, dashboard).
- `/src/hooks`: Hooks personalizados (realtime, persistencia).
- `/src/styles`: Sistema de diseño basado en variables y utilidades.
- `/public`: Activos estáticos y Service Worker personalizado.

---
Desarrollado con ❤️ para optimizar la logística de **BoxManager**.
