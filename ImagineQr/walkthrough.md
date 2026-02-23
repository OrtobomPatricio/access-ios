# 🧪 Guía de Pruebas y Uso: Imagine Qr

Esta guía te llevará paso a paso desde "cero" hasta escanear tu primera entrada.

## 1. Configuración del Backend (La "Base de Datos")

Lo primero es tener el sistema que validará los códigos.

1.  **Abre Google Sheets**: Crea una hoja nueva.
2.  **Instala el Script**:
    *   Ve a `Extensiones` > `Apps Script`.
    *   Copia el contenido de `backend/Code.gs` (está en tu carpeta del proyecto).
    *   Pégalo en el editor de Apps Script.
    *   Guarda (`Ctrl+S`).
3.  **Ejecuta el Setup**:
    *   En el editor, selecciona la función `setupSheet` arriba y dale a "Ejecutar".
    *   Acepta los permisos (esto creará las pestañas `entradas`, `logs`, `devices` automáticamente).
4.  **Despliega la Web App**:
    *   Botón azul "Implementar" > "Nueva implementación".
    *   Tipo: "Aplicación web".
    *   Ejecutar como: "Yo".
    *   Quién tiene acceso: "**Cualquier persona**" (¡Muy importante!).
    *   Copia la **URL** que te da al final.

## 2. Crear Datos de Prueba

Antes de usar la app, necesitas una "entrada" válida en el sistema.

1.  Ve a la pestaña `entradas`.
2.  Rellena una fila con estos datos (fila 2, porque la 1 son encabezados):
    *   `event_id`: `TEST_001`
    *   `entry_id`: `12345`
    *   `tipo`: `VIP`
    *   `nombre`: `Tu Nombre`
    *   `apellido`: `Tu Apellido`
    *   `qr_value`: `IMQR1|TEST_001|12345` (Este es el código secreto que irá en el QR).
    *   `estado`: `valid`

## 3. Generar el Código QR

Necesitas el QR físico (o en pantalla) para escanear.

1.  Ve a cualquier generador de QR online (ej: [the-qrcode-generator.com](https://www.the-qrcode-generator.com/)).
2.  Escribe el texto EXACTO que pusiste en `qr_value`:
    ```text
    IMQR1|TEST_001|12345
    ```
3.  Deja ese QR visible en tu pantalla.

## 4. Configurar y Ejecutar la App Móvil

1.  **Abre el proyecto Flutter**: Ve a la carpeta `imagine_qr`.
2.  **Instala dependencias**: En tu terminal ejecuta `flutter pub get`.
3.  **Ejecuta la App**: Conecta tu Android y dale a "Run" o `flutter run` en la terminal.

## 5. Flujo de Prueba en la App

1.  **Pantalla de Login**:
    *   **API URL**: Pega la URL que copiaste en el paso 1 (Web App).
    *   **Device ID**: `DEV_01` (este dispositivo viene creado por defecto en la hoja `devices`).
    *   **PIN**: `1234`.
    *   Dale a "SAVE & CONTINUE".
2.  **Pantalla Home**:
    *   **Event ID**: Escribe `TEST_001` (debe coincidir con la columna `event_id` de la hoja).
    *   Dale a "START SCANNING".
3.  **Escaneo (La Prueba de Fuego)**:
    *   Apunta con la cámara al QR que generaste en el paso 3.
4.  **Resultado**:
    *   **Primer intento**: Debería salir pantalla VERDE con "ACCESS GRANTED".
    *   Dale a "SCAN NEXT".
    *   **Segundo intento**: Escanea el MISMO QR. Debería salir pantalla ROJA con "ALREADY USED" y la hora del primer escaneo.

## 6. Verificación Final

1.  Ve a tu Google Sheet.
2.  En la pestaña `entradas`, la fila de prueba ahora debe tener estado `used` y la columna `used_at` con la hora.
3.  En la pestaña `logs`, deberías ver dos filas: una con `valid` y otra con `used`.

¡Si todo esto funciona, tu sistema está listo para producción! 🚀
