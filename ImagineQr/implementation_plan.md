# Implementation Plan: Imagine Qr

## Goal Description
Create a secure, fast, and robust Android application to control access events using QR codes. The system relies on Google Sheets as a database and Google Apps Script as the backend API to minimize infrastructure costs while maintaining real-time validation.

## Architecture

### Backend: Google Apps Script (Web App)
- **Database**: Google Spreadsheet with 3 tabs: `entradas`, `logs`, `devices`.
- **API**: `doPost(e)` handles all requests.
- **Security**: 
  - `LockService`: Prevents double scans (Race Conditions).
  - Device Authentication: Checks `deviceId` + `pin` against `devices` sheet.
- **Logic**: 
  - Validates Entry ID / QR Value.
  - Checks status (`valid`, `used`, `void`).
  - Updates entry status to `used` + timestamp on successful entry.
  - Logs every interaction.

### Frontend: Flutter (Android)
- **State Management**: `Provider` or simple `ChangeNotifier` (Keep it lightweight and robust).
- **Navigation**: `GoRouter` or standard `Navigator`.
- **Scanning**: `mobile_scanner` (Performance and ease of use with ML Kit under the hood).
- **Storage**: `flutter_secure_storage` for storing Device ID and PIN.
- **Network**: `http` package with custom timeout and retry logic.

## Data Structures

### Google Sheet Schema

**Tab: `devices`**
| Col | Header | Type | Description |
|---|---|---|---|
| A | device_id | string | Unique ID for the phone/operator (e.g., "GATE_1") |
| B | alias | string | Human readable name (e.g., "Main Entrance") |
| C | pin | string | Access PIN |
| D | enabled | boolean | Master switch |

**Tab: `entradas`**
| Col | Header | Type | Description |
|---|---|---|---|
| A | event_id | string | Event Identifier |
| B | entry_id | string | UUID |
| C | tipo | string | "anticipada" / "invitado" |
| D | nombre | string | First Name |
| E | apellido | string | Last Name |
| F | documento| string | User ID Doc |
| G | quien_invita | string | Reference for guests |
| H | qr_value | string | The distinct token scanned |
| I | estado | string | "valid", "used", "void" |
| J | used_at | datetime | When it was scanned |
| K | used_by_device | string | Which device scanned it |
| L | used_by_user | string | Operator ID (optional) |
| M | notes | string | admin notes |

**Tab: `logs`**
| Col | Header | Type | Description |
|---|---|---|---|
| A | timestamp | datetime | Server time |
| B | event_id | string | |
| C | qr_value | string | |
| D | result | string | "valid", "used", "not_found", "void", "device_denied", "error" |
| E | device_id | string | |
| F | user_id | string | |
| G | extra | string | Debug info or error message |

## API Specification

**Endpoint**: `POST <deployment-url>`

**Request Body**:
```json
{
  "action": "validate", 
  "eventId": "FIESTA_2026",
  "qrValue": "IMQR1|...",
  "deviceId": "GATE_1",
  "pin": "1234"
}
```

**Response Body**:
```json
{
  "ok": true,
  "result": "valid",
  "message": "Access Granted",
  "entry": {
    "nombre": "Juan",
    "apellido": "Perez",
    "tipo": "anticipada",
    //... other fields
  }
}
```

## User Review Required
> [!IMPORTANT]
> - The Google Sheet must be manually created by the user with the specific tab names.
> - The Apps Script must be deployed as "Web App" with access set to "Anyone" (Security is handled by the script checking Device ID + PIN, not Google Auth).

## Proposed Changes

### Backend
- Create `backend/Code.js`: Contains the full server-side logic.

### Frontend
- Create `app/lib/main.dart`: Entry point.
- Create `app/lib/services/api_service.dart`: API communication.
- Create `app/lib/services/storage_service.dart`: Secure storage.
- Create `app/lib/screens/login_screen.dart`: Device config.
- Create `app/lib/screens/scanner_screen.dart`: The core experience.
- Create `app/lib/screens/result_screen.dart`: The visual feedback.
- Create `app/lib/models/entry_model.dart`: Data parsing.

## Verification Plan
1. **Manual Verification**: Since I cannot run the Flutter app, I will review the code for logic errors, null safety, and proper state handling.
2. **Sheet Simulation**: logic will be verified by reviewing the GAS code flow against standard race condition patterns.
