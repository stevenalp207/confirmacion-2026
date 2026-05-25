// Catequesis por grupo encargado
export const catequesisGrupos = [
  { numero: 0, nombre: 'Bienvenida', encargado: 'Retiro' },
  { numero: 1, nombre: '¿Quién soy yo? ¿Quién quiero ser?', encargado: 'Piedad' },
  { numero: 2, nombre: 'Llamados a Vivir', encargado: 'Ciencia' },
  { numero: 3, nombre: 'Jesucristo el Hijo de Dios Vivo', encargado: 'Entendimiento' },
  { numero: 4, nombre: 'Tú tienes palabras de vida eterna', encargado: 'Fortaleza' },
  { numero: 5, nombre: 'Jesús muere y resucita para darnos vida', encargado: 'Consejo' },
  { numero: 6, nombre: 'El espíritu Santo en la vida de Jesús Y ¿Quién es el Espíritu Santo? (fusión)', encargado: 'Sabiduria' },
  { numero: 7, nombre: 'El Espíritu Santo nos une a la iglesia', encargado: 'Temor de Dios' },
  { numero: 8, nombre: 'El espíritu nos fortalece en las luchas', encargado: 'Piedad' },
  { numero: 9, nombre: 'Nacidos por el agua y el espíritu', encargado: 'Ciencia' },
  { numero: 10, nombre: 'Confirmados en la fe por el espíritu', encargado: 'Entendimiento' },
  { numero: 11, nombre: 'Fortalecidos por la Eucaristía', encargado: 'Fortaleza' },
  { numero: 12, nombre: 'Reconciliados por el espíritu', encargado: 'Consejo' },
  { numero: 13, nombre: 'La confirmación mi pentecostés', encargado: 'Sabiduria' },
  { numero: 14, nombre: 'La confirmación es una fiesta de la comunidad', encargado: 'Temor de Dios' },
  { numero: 15, nombre: 'El espíritu nos llama a servir', encargado: 'Piedad' },
  { numero: 16, nombre: 'Testigos de Cristo para hacer un mundo nuevo', encargado: 'Ciencia' },
  { numero: 17, nombre: 'Llevados al desierto para elegir a Dios / Elegidos por Jesús, para contemplarlo (fusión)', encargado: 'Entendimiento' },
  { numero: 18, nombre: 'Saciados del agua que da vida', encargado: 'Fortaleza' },
  { numero: 19, nombre: 'Sanados por la luz / Confiados en las promesas de Jesús (fusión)', encargado: 'Consejo' }
]

// Tipos de eventos
export const tiposEvento = {
  catequesis: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '📖', label: 'Catequesis' },
  exposicion: { color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '🎤', label: 'Exposición' },
  reunion: { color: 'bg-green-100 text-green-800 border-green-300', icon: '👥', label: 'Reunión' },
  retiro: { color: 'bg-red-100 text-red-800 border-red-300', icon: '⛪', label: 'Retiro' },
  liturgico: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '✝️', label: 'Litúrgico' },
  administrativo: { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: '📋', label: 'Administrativo' },
  financiero: { color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: '💰', label: 'Financiero' },
  academico: { color: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: '📚', label: 'Académico' },
  vacaciones: { color: 'bg-teal-100 text-teal-800 border-teal-300', icon: '🏖️', label: 'Vacaciones' },
  ensayo: { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: '🎭', label: 'Ensayo' },
  confirmacion: { color: 'bg-rose-100 text-rose-800 border-rose-300', icon: '🕊️', label: 'Confirmación' },
  evento: { color: 'bg-pink-100 text-pink-800 border-pink-300', icon: '🎉', label: 'Evento' },
  clase: { color: 'bg-cyan-100 text-cyan-800 border-cyan-300', icon: '🏫', label: 'Clase' }
}

// Niveles de prioridad
export const prioridades = {
  critica: { color: 'bg-red-500', label: 'Crítica', icon: '🔴' },
  alta: { color: 'bg-orange-500', label: 'Alta', icon: '🟠' },
  media: { color: 'bg-yellow-500', label: 'Media', icon: '🟡' },
  baja: { color: 'bg-green-500', label: 'Baja', icon: '🟢' }
}
