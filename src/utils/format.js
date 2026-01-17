// Formatting helpers for es-ES locale and Costa Rica currency
export function formatDate(value, options = {}) {
  try {
    const date = value instanceof Date ? value : new Date(value)
    if (isNaN(date.getTime())) return ''
    const fmt = new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      ...options,
    })
    return fmt.format(date)
  } catch {
    return ''
  }
}

export function formatTime(value, options = {}) {
  try {
    const date = value instanceof Date ? value : new Date(value)
    if (isNaN(date.getTime())) return ''
    const fmt = new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      ...options,
    })
    return fmt.format(date)
  } catch {
    return ''
  }
}

export function formatCurrency(amount, currency = 'CRC') {
  try {
    const num = typeof amount === 'number' ? amount : Number(amount)
    if (isNaN(num)) return ''
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(num)
  } catch {
    return ''
  }
}

export function capitalizeName(name) {
  if (!name || typeof name !== 'string') return ''
  return name
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function normalizeString(s) {
  if (!s || typeof s !== 'string') return ''
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}
