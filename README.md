# BoxManager PWA 📦

Sistema de gestión de pedidos optimizado para dispositivos móviles, diseñado para equipos pequeños que requieren un seguimiento preciso del ciclo de vida de productos (cajas).

## 🚀 Características Principales

- **PWA (Progressive Web App)**: Instalable en dispositivos Android e iOS. Funciona con un "Offline Shell" para mayor rapidez.
- **Gestión de Ciclo de Vida**: Seguimiento de estados: *Pendiente -> En curso -> Listo -> Entregado*.
- **Registro de Entregas**: Identificación de quién entregó cada pedido o si fue recogido por el cliente.
- **Edición y Rollback**: Capacidad de corregir datos y revertir estados ante errores humanos.
- **Interfaz Premium**: Diseño "Dark Mode" con glassmorphism, animaciones suaves y notificaciones tipo toast.
- **Sincronización en Tiempo Real**: Integración con Supabase para actualizaciones instantáneas entre todos los trabajadores.

## 🛠️ Tecnologías

- **Frontend**: React 19 + Vite
- **Estilos**: Vanilla CSS (Custom Design System)
- **Base de Datos**: Supabase (PostgreSQL)
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React

## 📦 Instalación

1. Clona el repositorio.
2. Instala las dependencias: `npm install`.
3. Configura tus credenciales de Supabase en `src/lib/supabase.js`.
4. Ejecuta el servidor de desarrollo: `npm run dev`.
5. Para producción: `npm run build`.

---
Desarrollado para el equipo de BoxManager.
