// Calendario de catequesis con el grupo que presenta cada día
// El grupo que presenta NO puede ser asignado a seguridad ese día

export const calendarioSeguridad = [
  { numero: 0, nombre: 'Bienvenida', grupoPresentador: 'Piedad' },
  { numero: 1, nombre: '¿Quién soy yo? ¿Quién quiero ser?', grupoPresentador: 'Ciencia' },
  { numero: 2, nombre: 'Llamados a Vivir', grupoPresentador: 'Entendimiento' },
  { numero: 3, nombre: 'Jesucristo el Hijo de Dios Vivo', grupoPresentador: 'Fortaleza' },
  { numero: 4, nombre: 'Tú tienes palabras de vida eterna', grupoPresentador: 'Consejo' },
  { numero: 5, nombre: 'Jesús muere y resucita para darnos vida', grupoPresentador: 'Sabiduría' },
  { numero: 6, nombre: 'El espíritu Santo en la vida de Jesús', grupoPresentador: 'Temor de Dios' },
  { numero: 7, nombre: '¿Quién es el Espíritu Santo?', grupoPresentador: 'Ciencia' },
  { numero: 8, nombre: 'El Espíritu Santo nos une a la iglesia', grupoPresentador: 'Piedad' },
  { numero: 9, nombre: 'El espíritu nos fortalece en las luchas', grupoPresentador: 'Entendimiento' },
  { numero: 10, nombre: 'Nacidos por el agua y el espíritu', grupoPresentador: 'Fortaleza' },
  { numero: 11, nombre: 'Confirmados en la fe por el espíritu', grupoPresentador: 'Consejo' },
  { numero: 12, nombre: 'Fortalecidos por la Eucaristía', grupoPresentador: 'Sabiduría' },
  { numero: 13, nombre: 'Reconciliados por el espíritu', grupoPresentador: 'Temor de Dios' },
  { numero: 14, nombre: 'La confirmación mi pentecostés', grupoPresentador: 'Ciencia' },
  { numero: 15, nombre: 'La confirmación es una fiesta de la comunidad', grupoPresentador: 'Piedad' },
  { numero: 16, nombre: 'El espíritu nos llama a servir', grupoPresentador: 'Entendimiento' },
  { numero: 17, nombre: 'Testigos de Cristo para hacer un mundo nuevo', grupoPresentador: 'Fortaleza' },
  { numero: 18, nombre: 'Llevados al desierto / Elegidos por Jesús', grupoPresentador: 'Consejo' },
  { numero: 19, nombre: 'Saciados del agua que da vida', grupoPresentador: 'Sabiduría' },
  { numero: 20, nombre: 'Sanados por la luz', grupoPresentador: 'Temor de Dios' },
];

// Catequistas elegibles para seguridad (excluyendo Formación y nuevos)
// Solo incluir catequistas con experiencia que pueden hacer seguridad
export const catequistasElegiblesSeguridad = [
  // Consejo
  { nombre: 'Jefferson David Aguilar Guzman', grupo: 'Consejo' },
  { nombre: 'Nashamy Araya Castellón', grupo: 'Consejo' },
  
  // Piedad
  { nombre: 'Adrian Chaves Herrera', grupo: 'Piedad' },
  { nombre: 'Justin Rojas Salazar', grupo: 'Piedad' },
  { nombre: 'Johanna Victoria Castro Guillén', grupo: 'Piedad' },
  
  // Sabiduría
  { nombre: 'Amanda Cordero Trejos', grupo: 'Sabiduría' },
  { nombre: 'Jeaustin Emanuel Fernández Arias', grupo: 'Sabiduría' },
  { nombre: 'Ismael Josué Rivera Quesada', grupo: 'Sabiduría' },
  { nombre: 'Mariana Segura Piedra', grupo: 'Sabiduría' },
  
  // Ciencia
  { nombre: 'Luis Ángel Sánchez Badilla', grupo: 'Ciencia' },
  { nombre: 'Ashley Rodríguez González', grupo: 'Ciencia' },
  
  // Temor de Dios
  { nombre: 'Mathias Calderon Sequeira', grupo: 'Temor de Dios' },
  { nombre: 'Sofía Arce Hernández', grupo: 'Temor de Dios' },
  { nombre: 'Sebastián Huertas Arce', grupo: 'Temor de Dios' },
  
  // Entendimiento
  { nombre: 'Samuel Brenes Vargas', grupo: 'Entendimiento' },
  { nombre: 'Luis Felipe Mora Ramírez', grupo: 'Entendimiento' },
  { nombre: 'Noelia Odilie Matarrita Araya', grupo: 'Entendimiento' },
  
  // Fortaleza
  { nombre: 'Dylan Chacón Sandoval', grupo: 'Fortaleza' },
  { nombre: 'Steven Alpizar Gamboa', grupo: 'Fortaleza' },
  { nombre: 'Jimena Valeska Angulo Ramirez', grupo: 'Fortaleza' },
];

// Función para obtener catequistas elegibles para una catequesis específica
export const getCatequistasDisponibles = (numeroCatequesis) => {
  const catequesis = calendarioSeguridad.find(c => c.numero === numeroCatequesis);
  if (!catequesis) return catequistasElegiblesSeguridad;
  
  // Filtrar catequistas que NO son del grupo presentador
  return catequistasElegiblesSeguridad.filter(
    c => c.grupo !== catequesis.grupoPresentador
  );
};

// Función para seleccionar N catequistas aleatorios de los disponibles
export const seleccionarCatequistasAleatorios = (numeroCatequesis, cantidad = 3) => {
  const disponibles = getCatequistasDisponibles(numeroCatequesis);
  
  // Mezclar aleatoriamente (Fisher-Yates shuffle)
  const shuffled = [...disponibles];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Retornar los primeros N
  return shuffled.slice(0, cantidad);
};

// Función para generar TODAS las asignaciones de forma equitativa
// Distribuye las asignaciones de manera que cada catequista cubra aproximadamente la misma cantidad
export const generarAsignacionesEquitativas = () => {
  // Conteo de asignaciones por catequista
  const conteo = {};
  catequistasElegiblesSeguridad.forEach(c => {
    conteo[c.nombre] = 0;
  });

  const asignaciones = {};

  // Para cada catequesis, asignar 3 catequistas priorizando los que menos han cubierto
  for (const catequesis of calendarioSeguridad) {
    const disponibles = getCatequistasDisponibles(catequesis.numero);
    
    // Ordenar por cantidad de asignaciones (menor primero), con algo de aleatoriedad para empates
    const ordenados = [...disponibles].sort((a, b) => {
      const diff = conteo[a.nombre] - conteo[b.nombre];
      if (diff !== 0) return diff;
      // Si tienen el mismo conteo, aleatorizar
      return Math.random() - 0.5;
    });

    // Tomar los 3 con menos asignaciones
    const seleccionados = ordenados.slice(0, 3);
    
    // Actualizar conteo
    seleccionados.forEach(c => {
      conteo[c.nombre]++;
    });

    asignaciones[catequesis.numero] = seleccionados.map(c => c.nombre);
  }

  return { asignaciones, conteo };
};
