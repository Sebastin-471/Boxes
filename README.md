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

## 🛡️ Seguridad y Arquitectura

El sistema ha sido rigurosamente auditado y cuenta con múltiples capas de protección:
- **Autenticación JWT Segura**: Las sesiones se manejan mediante tokens seguros, eliminando el almacenamiento en texto plano en ubicaciones vulnerables (como `localStorage`).
- **Data Layer Guards**: Todas las operaciones a la base de datos (Supabase) están protegidas por el validador estricto `requireAuth()`, garantizando que solo los usuarios autenticados realicen acciones.
- **Sanitización de Entradas**: Implementación de *whitelists* en los payloads de la API y algoritmos de sanitización (`sanitizeText`) sobre los campos de texto libre para bloquear ataques XSS y la inyección de caracteres de control.
- **Hardening del Entorno**: Restricción de claves de servicio en el frontend; se delega toda la seguridad de la información a las reglas RLS (Row Level Security) nativas de la base de datos.

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
3. Crea un archivo `.env` en la raíz del proyecto y configura tus credenciales públicas de Supabase:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key_publica
   ```
   *(Nota de Seguridad: Nunca incluyas tu Service Role Key en el archivo de entorno del frontend).*

### Comandos Disponibles
- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Genera el bundle de producción optimizado.
- `npm run sync`: Compila y sincroniza los cambios con el proyecto de Capacitor (Android).
- `npm run open:android`: Abre el proyecto en Android Studio para generar el APK.
- `npm run preview`: Previsualiza la versión de producción localmente.

## 📂 Estructura del Proyecto
- `/src/api`: Servicios de conexión con Supabase y utilidades de validación/sanitización.
- `/src/components`: Componentes UI comunes y layout principal.
- `/src/context`: Manejadores de estado global (Autenticación, Notificaciones Toast).
- `/src/features`: Lógica de negocio altamente segmentada (auth, orders, returns, clients, dashboard).
- `/src/hooks`: Hooks de React personalizados para Realtime y manejo en caché de productos.
- `/src/styles`: Sistema de diseño fundacional basado en CSS puro.
- `/public`: Activos estáticos, Service Worker (PWA) y Manifest.