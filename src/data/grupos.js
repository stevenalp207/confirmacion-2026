// Grupos para Confirmación 2026
export const grupos = [
  'Ciencia',
  'Piedad',
  'Fortaleza',
  'Consejo',
  'Entendimiento',
  'Sabiduría',
  'Temor de Dios'
];

// Estructura de datos de ejemplo para cada grupo
// En producción, estos datos se cargarán desde archivos externos
export const gruposData = {
  'Ciencia': {
    nombre: 'Ciencia',
    estudiantes: {
      '1': { id: 1, nombre: 'Juan Pérez', documentos: {}, asistencias: {} },
      '2': { id: 2, nombre: 'María García', documentos: {}, asistencias: {} },
      '3': { id: 3, nombre: 'Carlos López', documentos: {}, asistencias: {} },
    }
  },
  'Piedad': {
    nombre: 'Piedad',
    estudiantes: {
      '1': { id: 1, nombre: 'Ana Martínez', documentos: {}, asistencias: {} },
      '2': { id: 2, nombre: 'Luis Rodríguez', documentos: {}, asistencias: {} },
      '3': { id: 3, nombre: 'Sofia Torres', documentos: {}, asistencias: {} },
    }
  },
  'Fortaleza': {
    nombre: 'Fortaleza',
    estudiantes: {
      '1': { id: 1, nombre: 'Pedro Sánchez', documentos: {}, asistencias: {} },
      '2': { id: 2, nombre: 'Laura Ramírez', documentos: {}, asistencias: {} },
      '3': { id: 3, nombre: 'Diego Flores', documentos: {}, asistencias: {} },
    }
  },
  'Consejo': {
    nombre: 'Consejo',
    estudiantes: {
      '1': { id: 1, nombre: 'Carmen Ruiz', documentos: {}, asistencias: {} },
      '2': { id: 2, nombre: 'Roberto Morales', documentos: {}, asistencias: {} },
      '3': { id: 3, nombre: 'Isabel Castro', documentos: {}, asistencias: {} },
    }
  },
  'Entendimiento': {
    nombre: 'Entendimiento',
    estudiantes: {
      '1': { id: 1, nombre: 'Miguel Ortiz', documentos: {}, asistencias: {} },
      '2': { id: 2, nombre: 'Patricia Gómez', documentos: {}, asistencias: {} },
      '3': { id: 3, nombre: 'Andrés Vargas', documentos: {}, asistencias: {} },
    }
  },
  'Sabiduría': {
    nombre: 'Sabiduría',
    estudiantes: {
      '1': { id: 1, nombre: 'Elena Díaz', documentos: {}, asistencias: {} },
      '2': { id: 2, nombre: 'Fernando Herrera', documentos: {}, asistencias: {} },
      '3': { id: 3, nombre: 'Gabriela Medina', documentos: {}, asistencias: {} },
    }
  },
  'Temor de Dios': {
    nombre: 'Temor de Dios',
    estudiantes: {
      '1': { id: 1, nombre: 'Ricardo Jiménez', documentos: {}, asistencias: {} },
      '2': { id: 2, nombre: 'Verónica Silva', documentos: {}, asistencias: {} },
      '3': { id: 3, nombre: 'Héctor Reyes', documentos: {}, asistencias: {} },
    }
  }
};

// Tipos de documentos requeridos
export const tiposDocumentos = [
  { id: 'cedula_catequizando', nombre: 'Cédula Catequizando' },
  { id: 'fe_bautismo', nombre: 'Fe de Bautismo' },
  { id: 'constancia_comunion', nombre: 'Constancia Comunión' },
  { id: 'cedula_padrino', nombre: 'Cédula Padrino' },
  { id: 'fe_confirmacion_padrino', nombre: 'Fe Confirmación Padrino' },
  { id: 'acta_matrimonio', nombre: 'Acta de Matrimonio' },
];

// Número total de catequesis para Confirmación 2026 (incluye eventos especiales)
// 22 catequesis + Retiro Familia + Retiro Padrinos + Ensayo Confirma = 25 sesiones
export const numeroCatequesis = 25;

// Función para obtener el label de cada catequesis
// Índice 11: Retiro Familia (después de Catequesis 10)
// Índice 20: Retiro Padrinos (después de Catequesis 18)
// Índice 24: Ensayo Confirma (después de Catequesis 21)
export const getCatequesisLabel = (index) => {
  if (index === 11) {
    return 'Retiro Familia';
  } else if (index === 20) {
    return 'Retiro Padrinos';
  } else if (index === 24) {
    return 'Ensayo Confirma';
  } else if (index < 11) {
    return `Catequesis ${index}`;
  } else if (index < 20) {
    return `Catequesis ${index - 1}`;
  } else if (index < 24) {
    return `Catequesis ${index - 2}`;
  } else {
    return `Catequesis ${index - 3}`;
  }
};
