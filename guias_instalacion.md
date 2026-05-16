# Guía de Instalación: BoxManager 📦📱

Esta guía explica paso a paso cómo instalar BoxManager en dispositivos móviles para aprovechar al máximo sus características nativas (funcionamiento offline, notificaciones push, feedback táctil y acceso rápido).

---

## 🍎 Instalación en iPhone (iOS)

En iPhone, la aplicación se instala como una **PWA (Progressive Web App)** a través del navegador Safari. Esto crea un icono en tu pantalla de inicio idéntico a una app de la App Store.

> [!IMPORTANT]
> Debes usar obligatoriamente el navegador **Safari**. Otros navegadores en iOS (como Chrome o Firefox) no permiten añadir PWAs a la pantalla de inicio.

### Pasos:
1. Abre **Safari** en tu iPhone.
2. Navega a la URL o dominio donde está alojada la aplicación BoxManager (ej. *https://tu-dominio.com*).
3. Una vez que la página haya cargado, toca el icono de **Compartir** en la barra inferior (es el cuadrado con una flecha apuntando hacia arriba 📤).
4. En el menú que se despliega, desliza hacia abajo y busca la opción **"Agregar a inicio"** (o "Add to Home Screen"). Toca esa opción.
5. Se abrirá una pantalla de confirmación. Puedes dejar el nombre como "Boxes" o "BoxManager".
6. Toca **"Agregar"** en la esquina superior derecha.
7. ¡Listo! Ve a tu pantalla de inicio y verás el icono de BoxManager.
8. **Primer inicio**: Abre la app desde el nuevo icono y haz tap en cualquier lado. Te pedirá permisos para enviar notificaciones; asegúrate de **Aceptar** para recibir alertas en segundo plano.

---

## 🤖 Instalación en Android

Para Android, existen dos métodos de instalación: a través del navegador (PWA) o instalando el archivo nativo (.apk).

### Método 1: Vía Navegador Chrome (Recomendado / Más rápido)

Este método instala la versión web progresiva directamente en tu teléfono, manteniéndose siempre actualizada automáticamente.

1. Abre **Google Chrome** en tu dispositivo Android.
2. Navega a la URL de BoxManager (ej. *https://tu-dominio.com*).
3. Es probable que en la parte inferior aparezca un aviso automático que diga **"Añadir BoxManager a la pantalla de inicio"**. Si lo ves, simplemente tócalo.
4. Si no aparece el aviso:
   - Toca el menú de los **tres puntos verticales** (⋮) en la esquina superior derecha de Chrome.
   - Selecciona la opción **"Instalar aplicación"** o **"Añadir a la pantalla de inicio"**.
5. Confirma tocando **"Instalar"** en la ventana emergente.
6. ¡Listo! El icono de la aplicación se añadirá a tu cajón de aplicaciones y pantalla de inicio.

### Método 2: Vía APK Nativo (Para integración más profunda)

Este método instala el binario generado con Capacitor, el cual ofrece un acceso un poco más profundo al hardware del teléfono (vibración mejorada, control nativo del teclado).

> [!WARNING]
> Necesitas tener habilitada la instalación de aplicaciones de "Orígenes desconocidos" en tu Android para instalar el `.apk` directamente.

**Para el desarrollador (Cómo generar el APK):**
1. En la PC, abre el proyecto y ejecuta `npm run sync`.
2. Luego ejecuta `npm run open:android` para abrir Android Studio.
3. En Android Studio, ve al menú superior: `Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`.
4. Una vez generado, Android Studio mostrará un mensaje emergente. Haz clic en "Locate" para ver el archivo `app-debug.apk`.
5. Envía ese archivo al dispositivo Android (por correo, WhatsApp, cable USB, etc.).

**Para el usuario (Cómo instalar el APK):**
1. Descarga el archivo `BoxManager.apk` en tu dispositivo Android.
2. Toca el archivo descargado para abrirlo.
3. Si el teléfono te pide permisos para instalar aplicaciones desde esta fuente (Chrome o Administrador de Archivos), dale a **Configuración** y activa el interruptor de **"Permitir desde esta fuente"**.
4. Vuelve atrás y toca **"Instalar"**.
5. Una vez finalizado, toca **"Abrir"**.
6. Concede el permiso de **Notificaciones** apenas lo solicite la aplicación.

---

## 💡 Solución de Problemas Comunes

- **No llegan las notificaciones**:
  - Verifica en los ajustes del teléfono (Ajustes > Aplicaciones > BoxManager > Notificaciones) que los permisos estén habilitados.
  - Asegúrate de no estar en modo "No molestar" o en un modo estricto de "Ahorro de batería".
- **La pantalla se ve cortada o no actualiza**:
  - Tanto en iOS como en Android, si eres el usuario de la PWA, puedes arrastrar la pantalla hacia abajo (Pull-to-refresh) en la pestaña "Dashboard" o "Historial" para forzar la actualización de los pedidos y la interfaz de caché.
