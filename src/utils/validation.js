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
// Reglas de validación reutilizables
export const validationRules = {
  required: (value, fieldName) => {
    if (!value || value.toString().trim() === '') {
      return `${fieldName} es requerido`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? 'Email no válido' : null;
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[0-9]{7,15}$/;
    return !phoneRegex.test(value.replace(/[^0-9]/g, '')) ? 'Teléfono no válido' : null;
  },

  minLength: (value, min, fieldName) => {
    if (!value) return null;
    return value.toString().length < min ? `${fieldName} debe tener al menos ${min} caracteres` : null;
  },

  maxLength: (value, max, fieldName) => {
    if (!value) return null;
    return value.toString().length > max ? `${fieldName} no puede exceder ${max} caracteres` : null;
  },

  number: (value) => {
    if (!value) return null;
    return isNaN(value) ? 'Debe ser un número' : null;
  },

  positiveNumber: (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    return isNaN(num) || num <= 0 ? 'Debe ser un número positivo' : null;
  },

  currency: (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    return isNaN(num) || num < 0 ? 'Cantidad no válida' : null;
  }
};

export function validateForm(data, rules) {
  const errors = {};

  for (const field in rules) {
    const fieldRules = rules[field];
    for (const rule of fieldRules) {
      const error = rule(data[field]);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}