const PHOTO_BASE_URL = 'https://cedesdonbosco.ed.cr/virtual/assets/images/padronfotografico/esjbctdb';

export function getCarnetFromEmail(email) {
  if (!email || typeof email !== 'string') return '';

  const localPart = email.split('@')[0]?.trim() || '';
  if (!localPart) return '';

  const digits = localPart.replace(/\D/g, '');
  return digits || '';
}

export function getStudentPhotoUrl(email) {
  const carnet = getCarnetFromEmail(email);
  if (!carnet) return '';
  return `${PHOTO_BASE_URL}/${encodeURIComponent(carnet)}.jpg`;
}
