// Catequistas para Confirmación 2026
export const catequistas = [
  // Consejo
  { nombre: 'Jefferson David Aguilar Guzman', grupo: 'Consejo', comision: 'Retiro' },
  { nombre: 'Nashamy Araya Castellón', grupo: 'Consejo', comision: '' },
  { nombre: 'Julissa Escalante Badilla', grupo: 'Consejo', comision: 'Medios' },
  { nombre: 'Montserrat Campos Hernández', grupo: 'Consejo', comision: 'Medios' },
  
  // Piedad
  { nombre: 'Adrian Chaves Herrera', grupo: 'Piedad', comision: '' },
  { nombre: 'María Paula Avilés González', grupo: 'Piedad', comision: 'Medios' },
  { nombre: 'Justin Rojas Salazar', grupo: 'Piedad', comision: 'Retiro' },
  { nombre: 'Johanna Victoria Castro Guillén', grupo: 'Piedad', comision: 'Logística' },
  { nombre: 'Montserrat de Los Ángeles Mata Madriz', grupo: 'Piedad', comision: 'Logística' },
  
  // Sabiduría
  { nombre: 'Amanda Cordero Trejos', grupo: 'Sabiduría', comision: 'Medios' },
  { nombre: 'Jeaustin Emanuel Fernández Arias', grupo: 'Sabiduría', comision: '' },
  { nombre: 'Ismael Josué Rivera Quesada', grupo: 'Sabiduría', comision: '' },
  { nombre: 'Mariana Segura Piedra', grupo: 'Sabiduría', comision: 'Financiero' },
  
  // Ciencia
  { nombre: 'Luis Ángel Sánchez Badilla', grupo: 'Ciencia', comision: 'Retiro' },
  { nombre: 'Sharlyn Blanco Mora', grupo: 'Ciencia', comision: 'Medios' },
  { nombre: 'Mariam Astua Solano', grupo: 'Ciencia', comision: 'Retiro' },
  { nombre: 'Marco Andrés Sandí Chinchilla', grupo: 'Ciencia', comision: 'Financiero' },
  { nombre: 'Ashley Rodríguez González', grupo: 'Ciencia', comision: '' },
  
  // Temor de Dios
  { nombre: 'Mathias Calderon Sequeira', grupo: 'Temor de Dios', comision: '' },
  { nombre: 'Karemy Guzmán Cruz', grupo: 'Temor de Dios', comision: 'Retiro' },
  { nombre: 'Sofía Arce Hernández', grupo: 'Temor de Dios', comision: 'Retiro' },
  { nombre: 'Sebastián Huertas Arce', grupo: 'Temor de Dios', comision: 'Financiero' },
  { nombre: 'Nazareth Sofía Montoya Chacón', grupo: 'Temor de Dios', comision: 'Financiero' },
  
  // Entendimiento
  { nombre: 'Samuel Brenes Vargas', grupo: 'Entendimiento', comision: 'Retiro' },
  { nombre: 'Luis Felipe Mora Ramírez', grupo: 'Entendimiento', comision: 'Retiro' },
  { nombre: 'Noelia Odilie Matarrita Araya', grupo: 'Entendimiento', comision: '' },
  { nombre: 'Sebastián Altamirano Ling', grupo: 'Entendimiento', comision: 'Financiero' },
  { nombre: 'Monserrat Solano Vargas', grupo: 'Entendimiento', comision: 'Logística' },
  
  // Fortaleza
  { nombre: 'Dylan Chacón Sandoval', grupo: 'Fortaleza', comision: 'Financiero' },
  { nombre: 'Steven Alpizar Gamboa', grupo: 'Fortaleza', comision: 'Logística' },
  { nombre: 'Jimena Valeska Angulo Ramirez', grupo: 'Fortaleza', comision: 'Medios' },
  { nombre: 'Francella Fallas Castro', grupo: 'Fortaleza', comision: 'Medios' },
  
  // Formación
  { nombre: 'José Pablo Castro Jiménez', grupo: 'Formación', comision: '' },
  { nombre: 'Gabriel Esteban Valverde Guzmán', grupo: 'Formación', comision: '' },
  { nombre: 'Adriana Álvarez Lizano', grupo: 'Formación', comision: '' }
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
