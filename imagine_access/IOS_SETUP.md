# 📱 Guía de Configuración iOS - Imagine Access

## ✅ Archivos Preparados

Este proyecto ya tiene configurados los siguientes archivos para iOS:

- ✅ `ios/Runner/Info.plist` - Permisos de cámara y configuración
- ✅ `.env.production` - Plantilla de variables de entorno
- ✅ `build_ios.sh` - Script de automatización

---

## 🚀 Pasos para Compilar en iOS

### Requisitos Previos

1. **Mac con macOS** (MacBook, iMac, Mac Mini)
2. **Xcode** instalado desde Mac App Store
3. **Flutter** instalado en la Mac
4. **CocoaPods** instalado (`sudo gem install cocoapods`)
5. **Apple Developer Account** (para publicar en App Store)

---

### Paso 1: Copiar el Proyecto a la Mac

```bash
# En tu Mac, copia la carpeta imagine_access
# Puedes usar USB, AirDrop, Git, o cualquier método
```

---

### Paso 2: Configurar Variables de Entorno

```bash
cd imagine_access

# Copiar la plantilla
cp .env.production .env

# Editar el archivo .env con tus credenciales reales
# Usa nano, vim, o cualquier editor de texto
nano .env
```

**Contenido del archivo `.env`:**
```bash
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

### Paso 3: Ejecutar el Build Script

```bash
# Hacer el script ejecutable (solo la primera vez)
chmod +x build_ios.sh

# Build para desarrollo (simulador/dispositivo)
./build_ios.sh debug

# Build para release (dispositivo físico)
./build_ios.sh release

# Build para App Store
./build_ios.sh appstore
```

---

### Paso 4: Configurar Firma en Xcode (Primera vez)

1. Abre Xcode:
```bash
open ios/Runner.xcworkspace
```

2. En Xcode, selecciona el proyecto `Runner` en el panel izquierdo

3. Ve a la pestaña **"Signing & Capabilities"**

4. Configura:
   - **Team**: Selecciona tu Apple Developer Team
   - **Bundle Identifier**: Cambia a algo único como `com.tuempresa.imagineaccess`
   - **Version**: 1.0.0
   - **Build**: 1

5. Conecta tu iPhone físico vía USB

6. Presiona el botón **"Run"** (▶️) en Xcode

---

### Paso 5: Preparar para App Store

1. En Xcode, selecciona **Any iOS Device (arm64)** como destino

2. Ve a **Product > Archive**

3. Espera a que se abra el **Organizer**

4. Selecciona tu archivo y haz clic en **"Distribute App"**

5. Selecciona **"App Store Connect"**

6. Sigue las instrucciones para subir

---

## 🔧 Solución de Problemas

### Error: "No code signing identities found"
**Solución:** Ve a Xcode > Preferences > Accounts > Agrega tu Apple ID

### Error: "CocoaPods could not find compatible versions"
**Solución:**
```bash
cd ios
pod deintegrate
pod install --repo-update
cd ..
```

### Error: "Module 'mobile_scanner' not found"
**Solución:**
```bash
flutter clean
flutter pub get
cd ios && pod install
```

### Error: "Camera permission denied"
**Solución:** Asegúrate de que `Info.plist` tenga la clave `NSCameraUsageDescription`

---

## 📋 Checklist Pre-Lanzamiento

Antes de subir a App Store, verifica:

- [ ] Archivo `.env` configurado con credenciales de producción
- [ ] Bundle Identifier único configurado en Xcode
- [ ] Apple Developer Team seleccionado
- [ ] Iconos de app en todos los tamaños
- [ ] Screenshots para App Store preparados
- [ ] App probada en dispositivo físico
- [ ] Scanner QR funciona correctamente
- [ ] Login con Supabase funciona
- [ ] No hay crashes conocidos

---

## 📱 Requisitos de App Store

### Screenshots Necesarios
- iPhone 6.7" (1290 x 2796)
- iPhone 6.5" (1284 x 2778)
- iPhone 5.5" (1242 x 2208)
- iPad 12.9" (2048 x 2732)

### Metadata
- **Título**: Imagine Access (máx 30 caracteres)
- **Subtítulo**: Validador de Tickets QR (máx 30 caracteres)
- **Descripción**: Máximo 4000 caracteres
- **Keywords**: eventos, tickets, qr, escaner, acceso

---

## 🆘 Soporte

Si tienes problemas:

1. Verifica que Flutter esté instalado: `flutter doctor`
2. Verifica que Xcode esté actualizado
3. Revisa los logs de error detalladamente
4. Consulta la documentación de Flutter para iOS

---

**¡Tu app está lista para iOS!** 🎉
