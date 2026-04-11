const ADMIN_ROLES = ['admin'];
const FINANCIAL_ROLES = ['admin', 'financiero'];
const SPECIAL_GROUPS = [
  'ciencia',
  'piedad',
  'fortaleza',
  'consejo',
  'entendimiento',
  'sabiduria',
  'temor de dios',
];

const MODULE_ACCESS = {
  asistencia: ['admin', 'logistica', 'grupo'],
  documentos: ['admin', 'logistica', 'grupo'],
  sabanas: ['admin', 'logistica'],
  cartas: ['admin', 'logistica'],
  pagos: ['admin', 'financiero', 'grupo'],
  gastos: FINANCIAL_ROLES,
  ingresos: FINANCIAL_ROLES,
  catequistas: ['admin', 'logistica', 'formacion', 'grupo'],
  estudiantes: ['admin', 'logistica', 'grupo'],
  formacion: ['admin', 'formacion'],
  boletas: ['admin'],
  calendario: ['admin', 'financiero', 'logistica', 'formacion', 'retiro', 'catequista', 'grupo'],
  'asignacion-grupos': ['admin', 'logistica'],
  'asignacion-personalidad': ['admin', 'logistica'],
  'dashboard-asistencia': ['admin', 'logistica'],
  'dashboard-financiero': ['admin', 'financiero', 'logistica', 'retiro', 'catequista', 'grupo'],
  seguridad: ['admin', 'logistica', 'catequista'],
};

const MODULE_ORDER = [
  'asistencia',
  'documentos',
  'sabanas',
  'cartas',
  'pagos',
  'gastos',
  'ingresos',
  'catequistas',
  'estudiantes',
  'formacion',
  'boletas',
  'calendario',
  'asignacion-grupos',
  'asignacion-personalidad',
  'dashboard-asistencia',
  'dashboard-financiero',
  'seguridad',
];

function normalize(value = '') {
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function resolveIdentity(userOrRole) {
  if (!userOrRole) {
    return { role: '', username: '' };
  }

  if (typeof userOrRole === 'string') {
    return { role: normalize(userOrRole), username: '' };
  }

  return {
    role: normalize(userOrRole.rol),
    username: normalize(userOrRole.usuario),
  };
}

function isLogistica(identity) {
  return identity.role === 'logistica' || identity.username === 'logistica';
}

function isGroupRole(identity) {
  if (!identity.role) return false;

  return (
    SPECIAL_GROUPS.includes(identity.role) ||
    (!isLogistica(identity) &&
      !ADMIN_ROLES.includes(identity.role) &&
      !['financiero', 'formacion', 'retiro', 'catequista'].includes(identity.role))
  );
}

export function canAccess(module, userOrRole) {
  const allowed = MODULE_ACCESS[module];
  if (!allowed) return false;

  const identity = resolveIdentity(userOrRole);

  if (allowed.includes('admin') && ADMIN_ROLES.includes(identity.role)) {
    return true;
  }

  if (allowed.includes('logistica') && isLogistica(identity)) {
    return true;
  }

  if (allowed.includes('grupo') && isGroupRole(identity)) {
    return true;
  }

  return allowed.includes(identity.role);
}

export function requireAccess(module, userOrRole) {
  if (!canAccess(module, userOrRole)) {
    throw new Error(`Acceso denegado al modulo: ${module}`);
  }
}

export function isAdmin(userOrRole) {
  const identity = resolveIdentity(userOrRole);
  return ADMIN_ROLES.includes(identity.role);
}

export function isFinancialUser(userOrRole) {
  const identity = resolveIdentity(userOrRole);
  return FINANCIAL_ROLES.includes(identity.role);
}

export function getAllowedModules(user) {
  return MODULE_ORDER.filter((moduleId) => canAccess(moduleId, user));
}
