// Validation helpers tuned for the app
export function required(value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

export function isEmail(email) {
  if (!email) return false
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  return re.test(String(email).toLowerCase())
}

export function isPhoneCR(phone) {
  if (!phone) return false
  const digits = String(phone).replace(/[^0-9]/g, '')
  // Costa Rica phone numbers are 8 digits
  return /^\d{8}$/.test(digits)
}

export function isCedulaCR(id) {
  if (!id) return false
  const digits = String(id).replace(/[^0-9]/g, '')
  // Basic check: 9 to 12 numeric digits (cedula formats vary)
  return digits.length >= 9 && digits.length <= 12
}

export function isPositiveAmount(value) {
  const num = typeof value === 'number' ? value : Number(value)
  return !isNaN(num) && num > 0
}

export function maxLength(value, max) {
  if (typeof value !== 'string') return false
  return value.length <= max
}
