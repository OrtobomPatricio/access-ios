# 🎫 Imagine Qr - Sistema de Control de Acceso

Sistema profesional de control de acceso mediante códigos QR, compuesto por una App Android (Flutter) y un Backend Serverless (Google Apps Script + Google Sheets).

## 🚀 Características
- **Escaneo Ultra-rápido**: Lectura de QR con ML Kit.
- **Validación en Tiempo Real**: Conexión directa a Google Sheets.
- **Seguridad Anti-Fraude**: Prevención de doble uso (Race condition handling).
- **Offline-First UI**: Feedback visual inmediato y almacenamiento local de credenciales.
- **Historial Local**: Registro de los últimos 50 escaneos en el dispositivo.

---

## 🛠️ Parte 1: Configuración del Backend (Google Sheets)

### 1. Preparar la Hoja de Cálculo
1. Crea una nueva Google Sheet en [sheets.google.com](https://sheets.google.com).
2. Renombra la hoja a `Imagine Qr Database`.
3. Elimina las pestañas existentes y crea 3 nuevas:
   - `entradas`
   - `logs`
   - `devices`

### 2. Instalar el Código
1. En la Sheet, ve a **Extensiones > Apps Script**.
2. Borra el contenido de `Code.gs`.
3. Copia y pega el contenido del archivo `backend/Code.gs` de este repositorio.
4. Guarda el proyecto (`Ctrl+S`) con el nombre `ImagineQrAPI`.

### 3. Ejecutar Setup Inicial
1. En la barra superior del editor, selecciona la función `setupSheet`.
2. Dale al botón **Ejecutar**.
3. Acepta los permisos (Configuración avanzada > Ir a ImagineQrAPI (no seguro) > Permitir).
4. **Verifica**: Las pestañas de tu Sheet ahora deben tener los encabezados correctos.

### 4. Desplegar como API (Web App)
1. Clic en **Implementar** (botón azul arriba der.) > **Nueva implementación**.
2. **Tipo**: Aplicación web.
3. **Descripción**: `v1`.
4. **Ejecutar como**: `Yo` (tu email).
5. **Quién tiene acceso**: **Cualquier persona** (IMPORTANTE).
6. Clic en **Implementar**.
7. **COPIA la URL de la aplicación web** (termina en `/exec`). Esta es tu `API URL`.

### 5. Crear Claves de Acceso (Dispositivos)
En la pestaña `devices` de tu Google Sheet, edita o agrega dispositivos:
- `device_id`: Identificador único (ej: `PUERTA_1`).
- `alias`: Nombre legible (ej: `Entrada Principal`).
- `pin`: Contraseña numérica (ej: `1234`).
- `enabled`: `TRUE` (casilla marcada).

---

## 📱 Parte 2: App Móvil (Flutter)

### 1. Requisitos
- Flutter SDK instalado.
- Android Studio / VS Code.

### 2. Configuración
1. Abre la carpeta `imagine_qr` en tu editor.
2. Ejecuta `flutter pub get` para bajar dependencias.
3. (Opcional) Abre `lib/utils/constants.dart` y pega tu `API URL` como valor por defecto para facilitar el login.

### 3. Compilar APK
```bash
flutter build apk --release
```
El archivo estará en `build/app/outputs/flutter-apk/app-release.apk`.

### 4. Instalación y Uso
1. Instala el APK en el teléfono Android.
2. Abre la App.
3. **Login**:
   - **API URL**: Pega la URL del Apps Script (si no la pusiste en código).
   - **Device ID**: `PUERTA_1` (o el que creaste).
   - **PIN**: `1234`.
4. **Home**:
   - Ingresa el `Event ID` (ej: `FIESTA_2026`). Debe coincidir con la columna `event_id` en tu hoja `entradas`.
5. **Escanear**:
   - Apunta a los QRs.
   - El formato del QR en la sheet (`qr_value`) debe coincidir exactamente con lo que escaneas.

---

## 🧪 Formato de Datos
Para generar QRs de prueba, inserta una fila en la pestaña `entradas`:
- **event_id**: `FIESTA_2026`
- **entry_id**: (Generar un UUID, ej: `123-abc`)
- **tipo**: `anticipada`
- **nombre**: `Juan`
- **apellido**: `Perez`
- **qr_value**: `IMQR1|FIESTA_2026|123-abc` (Este texto es el que debes convertir a código QR).
- **estado**: `valid`

Si escaneas este QR:
- 1ª vez: ✅ **ACCESO PERMITIDO** (Pasa a estado `used`).
- 2ª vez: ❌ **YA USADO** (Muestra fecha y hora).

---

## ⚠️ Solución de Problemas
- **Dispositivo no autorizado**: Revisa `device_id` y `pin` en la pestaña `devices` y que `enabled` esté en TRUE.
- **Network Error**: Revisa que la URL de la Web App sea correcta y termine en `/exec`. Verifica que tienes internet.
- **Not Found**: El texto del QR escaneado no coincide EXACTAMENTE con la columna `qr_value` de la sheet para ese `event_id`.

---
**Desarrollado con estándares de alto rendimiento.**
