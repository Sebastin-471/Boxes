# Guías de Instalación en Dispositivos Móviles

Esta guía detalla los pasos para instalar la aplicación BoxManager en dispositivos Android de forma nativa (como archivo APK) y en iPhone (iOS).

---

## 🤖 Guía de Instalación para Android (Nativa - APK)

BoxManager utiliza **Capacitor** para empaquetar la aplicación web como una aplicación nativa de Android. Para generar el APK, necesitarás tener instalado Android Studio en tu PC.

### Requisitos Previos:
- [Node.js](https://nodejs.org/) instalado.
- [Android Studio](https://developer.android.com/studio) instalado.

### Paso a Paso para generar el APK:

1. **Prepara el proyecto web:**
   Abre una terminal en la carpeta raíz del proyecto y asegúrate de tener las dependencias al día, luego construye la versión de producción:
   ```bash
   npm install
   npm run build
   ```

2. **Sincroniza con Capacitor:**
   Este comando toma los archivos generados en el paso anterior y los inyecta en el proyecto nativo de Android:
   ```bash
   npm run sync
   # (O alternativamente: npx cap sync android)
   ```

3. **Abre Android Studio:**
   Lanza el proyecto directamente en Android Studio mediante la consola:
   ```bash
   npm run open:android
   # (O alternativamente: npx cap open android)
   ```

4. **Genera el archivo APK:**
   - Una vez que Android Studio abra el proyecto y termine de sincronizar Gradle (ver barra de progreso inferior), ve al menú superior.
   - Haz clic en **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   - Espera a que termine el proceso. Aparecerá una notificación en la parte inferior derecha.
   - Haz clic en **"locate"** en esa notificación para que se abra la carpeta donde se guardó el archivo `app-debug.apk`.

5. **Instalación en el móvil:**
   - Copia ese archivo `app-debug.apk` a tu dispositivo Android (vía USB, Google Drive, WhatsApp, etc.).
   - En tu teléfono Android, abre el archivo. (Es posible que te pida permisos para "Instalar aplicaciones de fuentes desconocidas", debes aceptarlo).
   - ¡Listo! BoxManager estará instalado como una aplicación nativa.

---

## 🍏 Guía de Instalación para iPhone (iOS)

El ecosistema de Apple es cerrado, por lo que existen dos caminos. El **Método 1 es el más rápido y recomendado** si no posees una computadora Mac.

### Método 1: Instalación como PWA (Progresive Web App) - *Recomendado*
Como la aplicación está desarrollada bajo el estándar PWA, funciona de maravilla instalándose directamente desde el navegador, sin necesidad de compilar código nativo.

1. **Aloja la aplicación:** La aplicación web debe estar hosteada/subida en algún servidor (Vercel, Netlify, Firebase Hosting, etc.).
2. **Abre Safari:** Desde el iPhone, abre el navegador **Safari** y entra a la URL de tu aplicación.
3. **Botón Compartir:** Toca el ícono de "Compartir" en la barra inferior de Safari (el cuadrado con la flecha apuntando hacia arriba).
4. **Añadir a Inicio:** En el menú que se despliega, baja hasta encontrar la opción **"Añadir a la pantalla de inicio"** (Add to Home Screen).
5. **Confirmar:** Dale un nombre ("BoxManager") y toca en "Añadir".
6. **¡Listo!** El ícono de la app aparecerá en el menú de aplicaciones de tu iPhone y al abrirla se comportará como una aplicación nativa (pantalla completa, funcionará sin internet en caché, etc).

### Método 2: Instalación Nativa (.ipa) - *Solo si tienes MacOS*
Al igual que en Android, Capacitor permite exportar para iOS, pero **Apple exige que el proceso de compilación se haga estrictamente desde una computadora Mac usando el software Xcode**.

1. Asegúrate de tener **Xcode** instalado en tu Mac.
2. Abre la terminal en el proyecto y ejecuta:
   ```bash
   npm run build
   npx cap sync ios
   npx cap open ios
   ```
3. Se abrirá **Xcode**.
4. Conecta tu iPhone a la Mac por cable USB.
5. En la parte superior de Xcode, selecciona tu iPhone como el dispositivo de destino (en lugar de un simulador).
6. Es necesario configurar tu cuenta de desarrollador de Apple en la pestaña **"Signing & Capabilities"**.
7. Presiona el botón de **Play (Run)** en la esquina superior izquierda. Xcode instalará la app nativa directamente en tu dispositivo conectado.
