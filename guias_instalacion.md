# Guía de Compilación e Instalación Nativa (Android & iOS)

Dado que la aplicación está construida con React y Capacitor, podemos generar binarios nativos para Android (`.apk` / `.aab`) y para iOS (`.ipa`).

El principal reto es **iOS**, ya que Apple requiere estrictamente el entorno **macOS** y **Xcode** para compilar aplicaciones. A continuación se detallan las estrategias para ambos sistemas operativos desde un entorno **Windows**.

---

## 🟢 Android: Generación de `.apk` desde Windows

Crear el instalable nativo para Android es directo y gratuito en Windows.

### 1. Requisitos Previos
- **Android Studio**: Descarga e instala el IDE oficial de Google.
- **Java Development Kit (JDK)**: Generalmente viene incluido con Android Studio (versión 17 o superior recomendada).

### 2. Sincronizar el Proyecto Web
Primero, debemos construir el código web de producción y sincronizarlo con la carpeta nativa de Android:
```bash
# 1. Compila el código web (React/Vite)
npm run build

# 2. Sincroniza los archivos web al proyecto Android de Capacitor
npx cap sync android
```

### 3. Abrir Android Studio y Compilar
```bash
# 3. Abre el proyecto en Android Studio
npx cap open android
```
1. Una vez dentro de Android Studio, espera a que termine de indexar y descargar las dependencias de Gradle (verás una barra de progreso en la parte inferior).
2. En la barra superior de Android Studio, haz clic en **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3. Espera un momento. Cuando termine, aparecerá una notificación emergente abajo a la derecha. Haz clic en **"locate"** (localizar).
4. Se abrirá el explorador de archivos de Windows. Ahí encontrarás tu archivo `app-debug.apk`.

### 4. Instalación en el Dispositivo
1. Conecta tu teléfono Android a tu PC mediante cable USB o súbelo a Google Drive/Telegram.
2. Descarga el `.apk` en tu móvil.
3. Ábrelo y, si te lo pide, acepta el permiso de **"Instalar aplicaciones de origen desconocido"**.
4. ¡Listo! La app estará instalada de forma nativa.

---

## 🍎 iOS: Generación de `.ipa` SIN una Mac

Apple tiene un ecosistema muy cerrado. Oficialmente, **necesitas Xcode y macOS** para crear el archivo `.ipa`. Sin embargo, al no tener una Mac, debes utilizar **servicios en la nube (Cloud CI/CD)** que compilan el código por ti usando servidores de Apple remotos.

> ⚠️ **IMPORTANTE SOBRE IOS**: Incluso si compilas el `.ipa` en la nube, **Apple exige que tengas una cuenta de desarrollador de pago ($99 USD al año)** para poder firmar la aplicación e instalarla en iPhones reales, a menos que uses métodos temporales (como AltStore).

A continuación, la mejor alternativa paso a paso utilizando **GitHub Actions** (Servidores Mac en la nube gratuitos).

### Opción 1: Compilación en la nube (GitHub Actions)

**Requisitos:**
- Tu código debe estar subido a un repositorio de **GitHub**.
- Necesitas una cuenta de Apple Developer (pago) para obtener tus certificados de firma (`Certificates, Identifiers & Profiles`).

**Paso a paso teórico:**
1. **Configurar el proyecto Capacitor para iOS:**
   ```bash
   npx cap add ios
   ```
2. **Crear el flujo de trabajo (Workflow):**
   En tu proyecto, crea un archivo en `.github/workflows/build-ios.yml` con instrucciones para que GitHub use una máquina virtual macOS:
   ```yaml
   name: Build iOS App
   on:
     push:
       branches: [ "main" ]
   jobs:
     build:
       runs-on: macos-latest # ¡Aquí está la magia! GitHub nos presta una Mac.
       steps:
       - uses: actions/checkout@v3
       - name: Setup Node
         uses: actions/setup-node@v3
         with: { node-version: '18' }
       - run: npm install
       - run: npm run build
       - run: npx cap sync ios
       # Pasos adicionales para instalar certificados de Apple mediante Fastlane...
       # Paso de compilación final con xcodebuild
   ```
3. **Descargar el `.ipa`:**
   Una vez que GitHub termine de ejecutar el proceso (toma unos 15 minutos), el archivo `.ipa` quedará como un "Artifact" en la pestaña "Actions" de GitHub, listo para ser descargado.

### Opción 2: Servicios Automatizados (Ionic Appflow o Codemagic)
Si configurar GitHub Actions y Fastlane resulta muy complejo, existen plataformas diseñadas específicamente para compilar Capacitor en la nube:
1. **Codemagic.io**: Te permite conectar tu repositorio y con una interfaz gráfica (sin código) selecciona "Construir para iOS". Ellos se encargan de levantar la Mac virtual y entregarte el `.ipa`. (Tiene capa gratuita limitada).
2. **Ionic Appflow**: Es la plataforma oficial de los creadores de Capacitor. Es excelente pero es de pago.

### Opción 3: Máquina Virtual Local (Hackintosh)
Consiste en instalar software como **VMware** o **VirtualBox** en tu PC con Windows y montar una imagen de macOS.
1. Instalas macOS en la máquina virtual.
2. Dentro de esa macOS virtual, instalas Xcode.
3. Abres el proyecto, conectas tu iPhone a la PC (la máquina virtual captura el USB) y le das "Play" en Xcode para instalarlo directamente.
*(Nota: Requiere una PC potente, con al menos 16GB de RAM).*

---

### 💡 Alternativa Recomendada para iOS: Instalación PWA
Dado que instalar un `.ipa` fuera del App Store requiere cuentas de pago de $99/año o re-firmas semanales (AltStore), **la solución ideal y gratuita para iOS es usar la PWA (que ya está configurada)**.

1. Abre la web alojada de tu app en **Safari** en el iPhone.
2. Toca el botón de **"Compartir"** (el cuadrado con la flecha hacia arriba).
3. Selecciona **"Añadir a la pantalla de inicio"** (Add to Home Screen).
4. ¡Listo! Safari instalará la aplicación en el teléfono. Con las mejoras de la aplicación, esta tendrá notificaciones push nativas, feedback táctil y pantalla completa, siendo casi indistinguible de una app nativa `.ipa`, **sin necesidad de compilar nada ni pagar a Apple**.
