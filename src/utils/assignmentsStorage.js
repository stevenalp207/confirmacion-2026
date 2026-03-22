// Utilidades para manejar localStorage de asignaciones

export function guardarAsignacion(resultado, nombre) {
  const asignaciones = JSON.parse(localStorage.getItem('asignacionesGuardadas') || '[]')
  
  const asignacion = {
    id: Date.now(),
    nombre: nombre || `Asignación ${new Date().toLocaleDateString()}`,
    fecha: new Date().toISOString(),
    resultado: resultado,
    totalEstudiantes: resultado.estadisticas.totalEstudiantes,
    cantidadGrupos: resultado.grupos.length,
    metodo: resultado.metodo || 'no especificado'
  }
  
  asignaciones.push(asignacion)
  localStorage.setItem('asignacionesGuardadas', JSON.stringify(asignaciones))
  
  return asignacion.id
}

export function obtenerAsignaciones() {
  const asignaciones = JSON.parse(localStorage.getItem('asignacionesGuardadas') || '[]')
  return asignaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
}

export function obtenerAsignacion(id) {
  const asignaciones = JSON.parse(localStorage.getItem('asignacionesGuardadas') || '[]')
  return asignaciones.find(a => a.id === id)
}

export function borrarAsignacion(id) {
  const asignaciones = JSON.parse(localStorage.getItem('asignacionesGuardadas') || '[]')
  const filtradas = asignaciones.filter(a => a.id !== id)
  localStorage.setItem('asignacionesGuardadas', JSON.stringify(filtradas))
}

export function actualizarNombreAsignacion(id, nuevoNombre) {
  const asignaciones = JSON.parse(localStorage.getItem('asignacionesGuardadas') || '[]')
  const asignacion = asignaciones.find(a => a.id === id)
  if (asignacion) {
    asignacion.nombre = nuevoNombre
    localStorage.setItem('asignacionesGuardadas', JSON.stringify(asignaciones))
  }
}
