// Simple role-based permissions for modules
const ADMIN_ROLES = ['admin', 'logistica']

function isGroupRole(role) {
  if (!role) return false
  return !ADMIN_ROLES.includes(role)
}

const MODULE_ACCESS = {
  attendance: [...ADMIN_ROLES, 'grupo'], // groups can access their attendance
  catequistas: ADMIN_ROLES, // only admin/logistica
  documents: [...ADMIN_ROLES, 'grupo'],
  sabanas: ADMIN_ROLES,
  cartas: ADMIN_ROLES,
  pagos: ADMIN_ROLES,
  ingresos: ADMIN_ROLES,
  gastos: ADMIN_ROLES,
  students: [...ADMIN_ROLES, 'grupo'],
}

export function canAccess(module, role) {
  const allowed = MODULE_ACCESS[module]
  if (!allowed) return false
  if (allowed.includes('grupo') && isGroupRole(role)) return true
  return allowed.includes(role)
}

export function requireAccess(module, role) {
  if (!canAccess(module, role)) {
    throw new Error(`Acceso denegado al módulo: ${module}`)
  }
}

export function isAdmin(role) {
  return ADMIN_ROLES.includes(role)
}
