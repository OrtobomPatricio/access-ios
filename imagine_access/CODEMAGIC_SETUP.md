# 🚀 Compilar iOS SIN Mac usando Codemagic

Esta guía te permite compilar y publicar tu app iOS **sin tener una Mac física**.

## ¿Qué es Codemagic?

Codemagic es un servicio de CI/CD (Integración Continua) que tiene **Macs reales en la nube** y es específicamente diseñado para Flutter.

- ✅ **Gratis** 500 minutos/mes (suficiente para varios builds)
- ✅ Compila automáticamente al hacer push a GitHub
- ✅ Publica automáticamente a App Store
- ✅ No necesitas instalar nada en tu computadora

---

## 📋 PASO A PASO

### 1. Preparar tu Código

Tu código ya está listo. Los archivos necesarios son:
- ✅ `codemagic.yaml` (ya creado)
- ✅ `ios/Runner/Info.plist` (ya configurado)
- ✅ `.env.production` (plantilla lista)

### 2. Crear Repositorio en GitHub

```bash
# Desde tu carpeta imagine_access
git init
git add .
git commit -m "Initial commit - iOS ready"

# Crea un repositorio en GitHub primero, luego:
git remote add origin https://github.com/TU_USUARIO/imagine-access.git
git branch -M main
git push -u origin main
```

### 3. Crear Cuenta en Codemagic

1. Ve a [codemagic.io](https://codemagic.io)
2. Clic en **"Sign Up"** y elige **"Sign up with GitHub"**
3. Autoriza el acceso a tus repositorios

### 4. Configurar App en Codemagic

1. En el dashboard de Codemagic, clic en **"Add application"**
2. Selecciona tu repositorio `imagine-access`
3. Selecciona **Flutter App**
4. Clic en **"Finish"**

### 5. Configurar Variables Secretas

Ve a **Settings** → **Secret Variables** → **Create group**

Crea un grupo llamado `supabase_credentials`:

```
SUPABASE_URL = https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIs...
```

### 6. Personalizar codemagic.yaml

Edita el archivo `codemagic.yaml` y cambia:

```yaml
bundle_identifier: com.tuempresa.imagineaccess  # ← Tu Bundle ID único
```

Y en la sección de email:
```yaml
recipients:
  - tu-email@ejemplo.com  # ← Tu email real
```

Haz commit y push:
```bash
git add codemagic.yaml
git commit -m "Update Codemagic config"
git push
```

### 7. Ejecutar Build

1. En Codemagic, ve a tu app
2. Clic en **"Start new build"**
3. Selecciona el workflow **"iOS Debug Build"**
4. Clic en **"Start new build"**

¡Listo! Codemagic compilará tu app en sus servidores Mac.

### 8. Descargar el IPA

Cuando termine el build:
1. Ve a la pestaña **"Artifacts"**
2. Descarga el archivo `.ipa`
3. O usa el enlace que te enviarán por email

---

## 📱 PUBLICAR EN APP STORE (Avanzado)

Para publicar automáticamente en App Store, necesitas:

### Configurar Firma de Código (Obligatorio)

1. **Crear App ID en Apple Developer Portal**:
   - Ve a [developer.apple.com](https://developer.apple.com)
   - Certificates, IDs & Profiles → Identifiers
   - Crea un App ID con tu bundle identifier (ej: `com.tuempresa.imagineaccess`)

2. **Crear Certificado de Distribución**:
   - Certificates → Distribution → iOS App Store
   - Sigue las instrucciones para crear el certificado

3. **Crear Provisioning Profile**:
   - Profiles → Distribution → App Store
   - Selecciona tu App ID y certificado

### Configurar App Store Connect API

1. Ve a [App Store Connect](https://appstoreconnect.apple.com)
2. Users and Access → Keys
3. Genera una nueva API Key
4. Copia el Key ID y Issuer ID

### Agregar Secrets en Codemagic

En Settings → Secret Variables, crea el grupo `app_store_credentials`:

```
APP_STORE_CONNECT_KEY = -----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----
APP_STORE_KEY_ID = ABCD123456
APP_STORE_ISSUER_ID = 12345678-1234-1234-1234-123456789012
```

---

## 💰 COSTOS

| Servicio | Gratis | Pago |
|----------|--------|------|
| Codemagic | 500 min/mes | $0.039/min después |
| GitHub Actions (Mac) | 2000 min/mes | $0.08/min después |
| MacInCloud | - | ~$25/mes |

**Para tu app**: Con 500 minutos gratis de Codemagic puedes hacer:
- ~10 builds completos de iOS al mes
- O ~20 builds debug

¡Es más que suficiente para empezar!

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### "Build failed: No signing certificate"
**Solución**: Necesitas configurar la firma de código. Para pruebas, usa el workflow `ios-debug` que no requiere firma.

### "Build failed: Pod install error"
**Solución**: Limpia la caché en Codemagic: Build → Clean build cache

### "IPA no se instala en mi iPhone"
**Solución**: Para instalar en dispositivo físico sin App Store, necesitas:
- Cuenta de Apple Developer ($99/año)
- Configurar Ad Hoc distribution
- Registrar el UDID de tu iPhone

---

## 🎯 ALTERNATIVA: TestFlight (Recomendado)

La forma más fácil de distribuir a testers sin App Store público:

1. Sube el build a App Store Connect (vía Codemagic)
2. Selecciona **TestFlight** (beta testing interno)
3. Agrega los emails de tus testers
4. Ellos reciben invitación para instalar la app

**Ventaja**: No necesitas jailbreak ni instalación complicada.

---

## 📞 SOPORTE

Si tienes problemas con Codemagic:
- 📖 Docs: [docs.codemagic.io](https://docs.codemagic.io)
- 💬 Slack: [codemagicio.slack.com](https://codemagicio.slack.com)
- 📧 Email: support@codemagic.io

---

## ✅ CHECKLIST FINAL

Antes de tu primer build:

- [ ] Código subido a GitHub
- [ ] Cuenta creada en Codemagic
- [ ] App conectada en Codemagic
- [ ] Variables de entorno configuradas
- [ ] Bundle identifier único elegido
- [ ] Workflow seleccionado (debug primero)

**¡Con esto tendrás tu IPA listo en minutos!** 🎉
