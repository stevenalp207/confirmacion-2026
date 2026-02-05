// Catequistas para Confirmación 2026
export const catequistas = [
  { nombre: 'Luis Ángel Sánchez Badilla', grupo: 'NA' },
  { nombre: 'Sebastián Huertas Arce', grupo: 'NA' },
  { nombre: 'Mathias Calderon Sequeira', grupo: 'NA' },
  { nombre: 'Jefferson David Aguilar Guzman', grupo: 'NA' },
  
  { nombre: 'Jeaustin Emanuel Fernández Arias', grupo: 'NA' },
  { nombre: 'Sofía Arce Hernández', grupo: 'NA' },
  { nombre: 'Monserrat Solano Vargas', grupo: 'NA' },
  { nombre: 'Luis Felipe Mora Ramírez', grupo: 'NA' },
  
  { nombre: 'Johanna Victoria Castro Guillén', grupo: 'NA' },
  { nombre: 'Gabriel Esteban Valverde Guzmán', grupo: 'NA' },
  { nombre: 'Julissa Escalante Badilla', grupo: 'NA' },
  { nombre: 'Steven Alpizar Gamboa', grupo: 'NA' },
  
  { nombre: 'Justin Rojas Salazar', grupo: 'NA' },
  { nombre: 'Ashley Rodríguez González', grupo: 'NA' },
  { nombre: 'Samuel Brenes Vargas', grupo: 'NA' },
  { nombre: 'Mariam Astua Solano', grupo: 'NA' },
  
  { nombre: 'Sharlyn Blanco Mora', grupo: 'NA' },
  { nombre: 'Marco Andrés Sandí Chinchilla', grupo: 'NA' },
  { nombre: 'Nazareth Sofía Montoya Chacón', grupo: 'NA' },
  { nombre: 'Montserrat de Los Ángeles Mata Madriz', grupo: 'NA' },
  
  { nombre: 'Montserrat Campos Hernández', grupo: 'NA' },
  { nombre: 'Ismael Josué Rivera Quesada', grupo: 'NA' },
  { nombre: 'Sebastián Altamirano Ling', grupo: 'NA' },
  { nombre: 'Francella Fallas Castro', grupo: 'NA' },
  
  { nombre: 'Nashamy Araya Castellón', grupo: 'NA' },
  { nombre: 'Karemy Guzmán Cruz', grupo: 'NA' },
  { nombre: 'Noelia Odilie Matarrita Araya', grupo: 'NA' },
  { nombre: 'Amanda Cordero Trejos', grupo: 'NA' },
  
  { nombre: 'Dylan Chacón Sandoval', grupo: 'NA' },
  { nombre: 'Mariana Segura Piedra', grupo: 'NA' },
  { nombre: 'Jimena Valeska Angulo Ramirez', grupo: 'NA' },
  { nombre: 'Adriana Álvarez Lizano', grupo: 'NA' },
  
  { nombre: 'José Pablo Castro Jiménez', grupo: 'NA' },
  { nombre: 'Adrian Chaves Herrera', grupo: 'NA' },
  { nombre: 'María Paula Avilés González', grupo: 'NA' }
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
