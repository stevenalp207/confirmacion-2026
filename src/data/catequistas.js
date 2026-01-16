// Catequistas para Confirmación 2026
export const catequistas = [
  { nombre: 'Luis Ángel Sánchez Badilla', grupo: 'Ciencia' },
  { nombre: 'Sebastián Huertas Arce', grupo: 'Ciencia' },
  { nombre: 'Mathias Calderon Sequeira', grupo: 'Ciencia' },
  { nombre: 'Jefferson David Aguilar Guzman', grupo: 'Ciencia' },
  
  { nombre: 'Jeaustin Emanuel Fernández Arias', grupo: 'Piedad' },
  { nombre: 'Sofía Arce Hernández', grupo: 'Piedad' },
  { nombre: 'Monserrat Solano Vargas', grupo: 'Piedad' },
  { nombre: 'Luis Felipe Mora Ramírez', grupo: 'Piedad' },
  
  { nombre: 'Johanna Victoria Castro Guillén', grupo: 'Fortaleza' },
  { nombre: 'Gabriel Esteban Valverde Guzmán', grupo: 'Fortaleza' },
  { nombre: 'Julissa Escalante Badilla', grupo: 'Fortaleza' },
  { nombre: 'Steven Alpizar Gamboa', grupo: 'Fortaleza' },
  
  { nombre: 'Justin Rojas Salazar', grupo: 'Consejo' },
  { nombre: 'Ashley Rodríguez González', grupo: 'Consejo' },
  { nombre: 'Samuel Brenes Vargas', grupo: 'Consejo' },
  { nombre: 'Mariam Astua Solano', grupo: 'Consejo' },
  
  { nombre: 'Sharlyn Blanco Mora', grupo: 'Entendimiento' },
  { nombre: 'Marco Andrés Sandí Chinchilla', grupo: 'Entendimiento' },
  { nombre: 'Nazareth Sofía Montoya Chacón', grupo: 'Entendimiento' },
  { nombre: 'Montserrat de Los Ángeles Mata Madriz', grupo: 'Entendimiento' },
  
  { nombre: 'Montserrat Campos Hernández', grupo: 'Sabiduría' },
  { nombre: 'Ismael Josué Rivera Quesada', grupo: 'Sabiduría' },
  { nombre: 'Sebastián Altamirano Ling', grupo: 'Sabiduría' },
  { nombre: 'Francella Fallas Castro', grupo: 'Sabiduría' },
  
  { nombre: 'Nashamy Araya Castellón', grupo: 'Temor de Dios' },
  { nombre: 'Karemy Guzmán Cruz', grupo: 'Temor de Dios' },
  { nombre: 'Noelia Odilie Matarrita Araya', grupo: 'Temor de Dios' },
  { nombre: 'Amanda Cordero Trejos', grupo: 'Temor de Dios' },
  
  { nombre: 'Dylan Chacón Sandoval', grupo: 'Formación' },
  { nombre: 'Mariana Segura Piedra', grupo: 'Formación' }
];

// Obtener solo los nombres de catequistas
export const nombresCatequistas = catequistas.map(c => c.nombre);

// Obtener catequistas por grupo
export const getCatequistasPorGrupo = (grupo) => {
  return catequistas.filter(c => c.grupo === grupo);
};

// Obtener todos los catequistas organizados por grupo
export const catequistasPorGrupo = catequistas.reduce((acc, cat) => {
  if (!acc[cat.grupo]) {
    acc[cat.grupo] = [];
  }
  acc[cat.grupo].push(cat.nombre);
  return acc;
}, {});
