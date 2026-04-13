const AUDIT_STORAGE_KEY = 'confirmacion2026_audit_logs';
const MAX_AUDIT_ITEMS = 1500;
const AUDIT_TABLE = 'audit_logs';

const MODULE_LABELS = {
  asistencia: 'Asistencia',
  documentos: 'Documentos',
  sabanas: 'Sabanas',
  cartas: 'Cartas',
  pagos: 'Pagos',
  gastos: 'Gastos',
  ingresos: 'Ingresos',
  catequistas: 'Catequistas',
  estudiantes: 'Estudiantes',
  formacion: 'Formacion',
  boletas: 'Boletas',
  calendario: 'Calendario',
  'asignacion-grupos': 'Asignacion de Grupos',
  'asignacion-personalidad': 'Asignacion de Sub-grupos',
  'dashboard-asistencia': 'Dashboard de Asistencia',
  'dashboard-financiero': 'Dashboard Financiero',
  seguridad: 'Seguridad',
  logs: 'Logs',
  sistema: 'Sistema'
};

const TABLE_MODULE_MAP = {
  asistencias: 'asistencia',
  asistencias_formacion: 'formacion',
  documentos: 'documentos',
  sabanas: 'sabanas',
  cartas: 'cartas',
  pagos: 'pagos',
  gastos: 'gastos',
  ingresos: 'ingresos',
  catequistas: 'catequistas',
  estudiantes: 'estudiantes',
  formaciones: 'formacion',
  boletas: 'boletas',
  calendario_eventos: 'calendario',
  tareas: 'calendario',
  seguridad_asignaciones: 'seguridad',
  asignaciones_grupos: 'asignacion-grupos',
  asignaciones_personalidad: 'asignacion-personalidad'
};

const TABLE_PREFIX_MODULE_MAP = {
  asistencias_: 'asistencia',
  asistencia_: 'asistencia',
  documentos_: 'documentos',
  cartas_: 'cartas',
  sabanas_: 'sabanas',
  pagos_: 'pagos',
  notas_: 'estudiantes',
  catequistas_: 'catequistas',
  estudiantes_: 'estudiantes'
};

const GROUP_SUFFIX_LABELS = {
  piedad: 'Piedad',
  ciencia: 'Ciencia',
  fortaleza: 'Fortaleza',
  consejo: 'Consejo',
  entendimiento: 'Entendimiento',
  sabiduria: 'Sabiduria',
  temor_de_dios: 'Temor de Dios',
  temor: 'Temor de Dios'
};

function getStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage;
}

function safeJsonParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function normalizeAction(method, init = {}, url = '') {
  if (method === 'DELETE') return 'delete';
  if (method === 'PATCH' || method === 'PUT') return 'update';
  if (method !== 'POST') return method.toLowerCase();

  const headers = init.headers || {};
  const prefer =
    headers?.Prefer ||
    headers?.prefer ||
    (typeof headers.get === 'function' ? headers.get('Prefer') : '') ||
    '';

  if (prefer.toLowerCase().includes('resolution=merge-duplicates')) return 'upsert';
  if (url.includes('on_conflict=')) return 'upsert';
  return 'insert';
}

function extractTableFromUrl(url) {
  const match = url.match(/\/rest\/v1\/([^?\/]+)/i);
  if (!match) return null;
  const table = decodeURIComponent(match[1] || '').trim();
  if (!table || table.toLowerCase() === 'rpc') return null;
  return table;
}

function getCurrentActor() {
  const storage = getStorage();
  if (!storage) return 'sistema';

  const user = safeJsonParse(storage.getItem('user'), null);
  if (!user) return 'sistema';

  return user.usuario || user.rol || 'sistema';
}

function getModuleFromHash() {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#/, '').trim();
  if (!hash) return null;
  const [moduleId] = hash.split('/');
  return moduleId || null;
}

function getModuleForTable(table) {
  if (TABLE_MODULE_MAP[table]) return TABLE_MODULE_MAP[table];

  const prefixMatch = Object.entries(TABLE_PREFIX_MODULE_MAP).find(([prefix]) => table.startsWith(prefix));
  if (prefixMatch) return prefixMatch[1];

  return getModuleFromHash() || 'sistema';
}

function getGroupFromTable(table) {
  if (!table) return null;

  const entries = Object.entries(GROUP_SUFFIX_LABELS);
  for (const [suffix, label] of entries) {
    if (table.endsWith(`_${suffix}`)) return label;
  }

  return null;
}

function getInputUrl(input) {
  if (!input) return '';
  if (typeof input === 'string') return input;
  if (typeof input.url === 'string') return input.url;
  return String(input);
}

function getMethod(input, init = {}) {
  const method = init.method || input?.method || 'GET';
  return String(method).toUpperCase();
}

function parseFilterValue(value = '') {
  if (!value) return null;

  const cleaned = decodeURIComponent(String(value)).replace(/^(eq|neq|gt|gte|lt|lte|like|ilike|is|in|cs|cd|ov|sl|sr|nxr|nxl|adj)\./i, '');
  const withoutParens = cleaned.replace(/^\((.*)\)$/, '$1');
  return withoutParens || null;
}

function getContextFromUrl(url) {
  try {
    const parsed = new URL(url);
    const group = parseFilterValue(parsed.searchParams.get('grupo'));

    const catequistaName =
      parseFilterValue(parsed.searchParams.get('catequista_nombre')) ||
      parseFilterValue(parsed.searchParams.get('nombre_catequista')) ||
      null;

    const estudianteId =
      parseFilterValue(parsed.searchParams.get('estudiante_id')) ||
      parseFilterValue(parsed.searchParams.get('estudianteId')) ||
      null;

    return {
      group,
      catequistaName,
      estudianteId
    };
  } catch {
    return {
      group: null,
      catequistaName: null,
      estudianteId: null
    };
  }
}

function getPayloadPreview(body) {
  if (!body) return null;
  if (typeof body !== 'string') return null;

  const parsed = safeJsonParse(body, null);
  if (!parsed) return null;

  const asArray = Array.isArray(parsed) ? parsed : [parsed];
  const firstRow = asArray[0] || {};

  const groupValue =
    firstRow.grupo ||
    firstRow.group ||
    firstRow.grupo_nombre ||
    firstRow.grupo_name ||
    null;

  const estudianteId = firstRow.estudiante_id ?? firstRow.estudianteId ?? null;
  const catequizandoName =
    firstRow.estudiante_nombre ||
    firstRow.nombre_estudiante ||
    firstRow.catequizando_nombre ||
    null;
  const catequistaName =
    firstRow.catequista_nombre ||
    firstRow.nombre_catequista ||
    null;

  let affectedType = null;
  let affectedId = null;
  let affectedName = null;

  if (estudianteId !== null || catequizandoName) {
    affectedType = 'catequizando';
    affectedId = estudianteId;
    affectedName = catequizandoName;
  } else if (catequistaName) {
    affectedType = 'catequista';
    affectedName = catequistaName;
  }

  return {
    count: asArray.length,
    fields: Object.keys(firstRow).slice(0, 8),
    group: typeof groupValue === 'string' && groupValue.trim() ? groupValue.trim() : null,
    affectedType,
    affectedId,
    affectedName
  };
}

async function saveAuditLogToSupabase(logItem, supabaseUrl, supabaseAnonKey) {
  if (!supabaseUrl || !supabaseAnonKey) return;

  const endpoint = `${supabaseUrl}/rest/v1/${AUDIT_TABLE}`;
  const payload = {
    timestamp: logItem.timestamp,
    actor: logItem.actor,
    module: logItem.module,
    table_name: logItem.table,
    action: logItem.action,
    status: logItem.status,
    duration_ms: logItem.durationMs,
    payload: logItem.payload
  };

  await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(payload)
  });
}

export function readAuditLogs() {
  const storage = getStorage();
  if (!storage) return [];

  const items = safeJsonParse(storage.getItem(AUDIT_STORAGE_KEY), []);
  if (!Array.isArray(items)) return [];
  return items;
}

export function clearAuditLogs() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(AUDIT_STORAGE_KEY);
}

export function getModuleLabel(moduleId) {
  if (!moduleId) return 'Sin modulo';
  return MODULE_LABELS[moduleId] || moduleId;
}

export function registerSupabaseMutationAudit({ input, init, response, durationMs, supabaseUrl, supabaseAnonKey }) {
  const url = getInputUrl(input);
  if (!url.includes('/rest/v1/')) return;

  const method = getMethod(input, init);
  if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) return;
  if (!response?.ok) return;

  const table = extractTableFromUrl(url);
  if (!table) return;
  if (table === AUDIT_TABLE) return;

  const action = normalizeAction(method, init, url);
  const urlContext = getContextFromUrl(url);
  const module = getModuleForTable(table);
  const tableGroup = getGroupFromTable(table);
  const payload = getPayloadPreview(init?.body) || {};
  const resolvedGroup = tableGroup || payload.group || urlContext.group || null;
  if (resolvedGroup) payload.group = resolvedGroup;

  if (!payload.affectedType && urlContext.catequistaName) {
    payload.affectedType = 'catequista';
    payload.affectedName = urlContext.catequistaName;
  }

  if (!payload.affectedType && urlContext.estudianteId) {
    payload.affectedType = 'catequizando';
    payload.affectedId = urlContext.estudianteId;
  }

  const logItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: new Date().toISOString(),
    actor: getCurrentActor(),
    module,
    table,
    action,
    status: response.status,
    durationMs: typeof durationMs === 'number' ? Math.round(durationMs) : null,
    payload,
    group: resolvedGroup
  };

  const storage = getStorage();
  if (!storage) return;

  const current = readAuditLogs();
  const updated = [logItem, ...current].slice(0, MAX_AUDIT_ITEMS);
  storage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));

  // Fire-and-forget para no bloquear la operacion principal.
  void saveAuditLogToSupabase(logItem, supabaseUrl, supabaseAnonKey);
}
