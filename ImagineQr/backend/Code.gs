/**
 * Imagine Qr - Backend Logic V1.0.5 - Final Fix
 */

// --- CONFIGURATION ---
const SHEET_ENTRADAS = 'VENTAS'; // Nombre de tu PESTAÑA (abajo a la izquierda)
const SHEET_LOGS = 'logs';
const SHEET_DEVICES = 'devices';

// Columns Mapping (0-indexed)
// TAB: entradas
const COL_EVENT_ID = 0;      // A
const COL_ENTRY_ID = 1;      // B
const COL_TIPO = 2;          // C
const COL_NOMBRE = 3;        // D
const COL_DOCUMENTO = 4;     // E
const COL_TELEFONO = 5;      // F
const COL_CORREO = 6;        // G
const COL_ESTADO = 7;        // H

// Technical Columns
const COL_QR_VALUE = 8;      // I (access_code)
const COL_USED_AT = 9;       // J
const COL_USED_BY_DEVICE = 10; // K
const COL_USED_BY_USER = 11; // L
const COL_QR_IMAGE = 12;     // M (qr_code)

// TAB: devices
const DEV_COL_DEVICE_ID = 0;
const DEV_COL_ALIAS = 1;
const DEV_COL_PIN = 2;
const DEV_COL_ENABLED = 3;

/**
 * Main Entry Point for HTTP POST Requests
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); 
  } catch (e) {
    return createResponse(false, 'error', 'Server busy');
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createResponse(false, 'error', 'Invalid Request Body');
    }

    const data = JSON.parse(e.postData.contents);
    
    // 1. Authenticate Device
    const deviceAuth = authenticateDevice(data.deviceId, data.pin);
    if (!deviceAuth.success) {
      logAttempt(data, 'device_denied', deviceAuth.message);
      return createResponse(false, 'device_denied', deviceAuth.message);
    }
    
    // 2. Route Action
    if (data.action === 'validate') {
      return handleValidate(data);
    } else {
      return createResponse(false, 'error', 'Unknown Action');
    }

  } catch (error) {
    logAttempt({ error: error.toString() }, 'error', 'Exception');
    return createResponse(false, 'error', error.toString());
  } finally {
    lock.releaseLock();
  }
}

function handleValidate(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ENTRADAS);
  const rows = sheet.getDataRange().getValues();
  
  let rowIndex = -1;
  let entryRow = null;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][COL_EVENT_ID] == data.eventId && rows[i][COL_QR_VALUE] == data.qrValue) {
      rowIndex = i;
      entryRow = rows[i];
      break;
    }
  }

  if (rowIndex === -1) {
    logAttempt(data, 'not_found', 'QR not found');
    return createResponse(false, 'not_found', 'Entry not found');
  }

  const currentStatus = entryRow[COL_ESTADO]?.toString().toLowerCase().trim();
  const entryData = extractEntryData(entryRow);

  if (currentStatus === 'void') {
    logAttempt(data, 'void', 'Ticket void');
    return createResponse(false, 'void', 'Ticket ANULADO', entryData);
  }

  if (currentStatus === 'used') {
    logAttempt(data, 'used', 'Ticket used');
    return createResponse(false, 'used', 'Entrada YA USADA', entryData);
  }

  if (currentStatus === 'valid') {
    const timestamp = new Date();
    sheet.getRange(rowIndex + 1, COL_ESTADO + 1).setValue('used');
    sheet.getRange(rowIndex + 1, COL_USED_AT + 1).setValue(timestamp);
    sheet.getRange(rowIndex + 1, COL_USED_BY_DEVICE + 1).setValue(data.deviceId);
    
    entryData.estado = 'used';
    entryData.used_at = timestamp;

    logAttempt(data, 'valid', 'Access Granted');
    return createResponse(true, 'valid', 'Acceso Permitido', entryData);
  }

  logAttempt(data, 'error', `Unknown status: ${currentStatus}`);
  return createResponse(false, 'error', 'Estado desconocido', entryData);
}

function authenticateDevice(deviceId, pin) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_DEVICES);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][DEV_COL_DEVICE_ID] == deviceId) {
      if (rows[i][DEV_COL_ENABLED] !== true && rows[i][DEV_COL_ENABLED] !== "true") {
         return { success: false, message: 'Device Disabled' };
      }
      if (String(rows[i][DEV_COL_PIN]).trim() === String(pin).trim()) {
        return { success: true };
      }
    }
  }
  return { success: false, message: 'Device Not Found' };
}

function extractEntryData(row) {
  return {
    event_id: row[COL_EVENT_ID],
    entry_id: row[COL_ENTRY_ID],
    tipo: row[COL_TIPO],
    nombre: row[COL_NOMBRE],
    documento: row[COL_DOCUMENTO],
    telefono: row[COL_TELEFONO],
    correo: row[COL_CORREO],
    estado: row[COL_ESTADO],
    used_at: row[COL_USED_AT]
  };
}

function logAttempt(data, result, extra) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_LOGS);
    sheet.appendRow([new Date(), data.eventId, data.qrValue, result, data.deviceId, '', extra]);
  } catch (e) {}
}

function createResponse(ok, result, message, entry = null) {
  const response = { ok: ok, result: result, message: message };
  if (entry) response.entry = entry;
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

// --- AUTOMATION UI ---

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('⚡ Imagine QR')
      .addItem('Generar Códigos QR Faltantes', 'generateQrCodes')
      .addSeparator()
      .addItem('Configurar Hojas (Setup)', 'setupSheet')
      .addToUi();
}

function generateQrCodes() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ENTRADAS);
  if (!sheet) {
    const sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets().map(s => s.getName()).join(', ');
    SpreadsheetApp.getUi().alert(`No se encontró la hoja "${SHEET_ENTRADAS}".\nHojas disponibles: ${sheets}`);
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return; 

  // Ask for Event Name
  const response = ui.prompt('Configuración', 'Si falta event_id, ¿cuál pongo?', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;
  const defaultEventId = response.getResponseText().trim() || 'EVENTO_GENERICO';

  const range = sheet.getRange(2, 1, lastRow - 1, COL_QR_IMAGE + 1);
  const values = range.getValues();
  let updates = 0;

  for (let i = 0; i < values.length; i++) {
    let eventId = values[i][COL_EVENT_ID];
    let entryId = values[i][COL_ENTRY_ID];
    const currentQr = values[i][COL_QR_VALUE];
    const rowNum = i + 2; 

    if (!eventId) {
       eventId = defaultEventId;
       values[i][COL_EVENT_ID] = eventId;
    }

    if (!entryId) {
      entryId = (1000 + i).toString();
      values[i][COL_ENTRY_ID] = entryId;
    }

    if (!currentQr && eventId && entryId) {
      values[i][COL_QR_VALUE] = `IMQR1|${eventId}|${entryId}`;
      if (!values[i][COL_ESTADO]) values[i][COL_ESTADO] = 'valid';
      
      // FORMULA CON PUNTO Y COMA
      values[i][COL_QR_IMAGE] = `=IMAGE("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" & ENCODEURL(I${rowNum}); 3)`;
      
      updates++;
    }
  }

  if (updates > 0) {
    range.setValues(values);
    ui.alert(`✅ Listo! ${updates} generados.`);
  } else {
    ui.alert('👍 Todo al día.');
  }
}

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s1 = ss.getSheetByName(SHEET_ENTRADAS);
  if (!s1) { s1 = ss.insertSheet(SHEET_ENTRADAS); }
  if (s1.getLastRow() === 0) {
    s1.appendRow(['event_id', 'entry_id', 'tipo', 'nombre', 'documento', 'telefono', 'correo', 'estado', 'access_code', 'used_at', 'used_by', 'used_by_user', 'qr_code']);
  }
}
