// Catequistas para Confirmación 2026
export const catequistas = [
  // Consejo
  { nombre: 'Jefferson David Aguilar Guzman *', grupo: 'Consejo', comision: 'Retiro', fechaNacimiento: '12/03/2006' },
  { nombre: 'Nashamy Araya Castellón', grupo: 'Consejo', comision: '', fechaNacimiento: '16/03/2006' },
  { nombre: 'Julissa Escalante Badilla', grupo: 'Consejo', comision: 'Medios', fechaNacimiento: '29/06/2007' },
  { nombre: 'Montserrat Campos Hernández', grupo: 'Consejo', comision: 'Medios', fechaNacimiento: '9/04/2008' },
  
  // Piedad
  { nombre: 'Adrian Chaves Herrera', grupo: 'Piedad', comision: '', fechaNacimiento: '19/11/2005' },
  { nombre: 'María Paula Avilés González', grupo: 'Piedad', comision: 'Medios', fechaNacimiento: '7/11/2006' },
  { nombre: 'Justin Rojas Salazar *', grupo: 'Piedad', comision: 'Retiro', fechaNacimiento: '29/03/2006' },
  { nombre: 'Johanna Victoria Castro Guillén', grupo: 'Piedad', comision: 'Logística', fechaNacimiento: '19/12/2006' },
  { nombre: 'Montserrat de Los Ángeles Mata Madriz', grupo: 'Piedad', comision: 'Logística', fechaNacimiento: '10/02/2008' },
  
  // Sabiduría
  { nombre: 'Amanda Cordero Trejos *', grupo: 'Sabiduría', comision: 'Medios', fechaNacimiento: '6/03/2006' },
  { nombre: 'Jeaustin Emanuel Fernández Arias', grupo: 'Sabiduría', comision: '', fechaNacimiento: '31/10/2007' },
  { nombre: 'Ismael Josué Rivera Quesada', grupo: 'Sabiduría', comision: '', fechaNacimiento: '9/01/2007' },
  { nombre: 'Mariana Segura Piedra', grupo: 'Sabiduría', comision: 'Financiero', fechaNacimiento: '2/07/2007' },
  { nombre: 'Amanda Villegas Centeno', grupo: 'Sabiduría', comision: 'Financiero', fechaNacimiento: '21/05/2007' },
  
  // Ciencia
  { nombre: 'Luis Ángel Sánchez Badilla *', grupo: 'Ciencia', comision: 'Retiro', fechaNacimiento: '31/03/2006' },
  { nombre: 'Sharlyn Blanco Mora', grupo: 'Ciencia', comision: 'Medios', fechaNacimiento: '20/03/2008' },
  { nombre: 'Mariam Astua Solano', grupo: 'Ciencia', comision: 'Retiro', fechaNacimiento: '13/10/2007' },
  { nombre: 'Marco Andrés Sandí Chinchilla', grupo: 'Ciencia', comision: 'Financiero', fechaNacimiento: '28/12/2007' },
  { nombre: 'Ashley Rodríguez González', grupo: 'Ciencia', comision: '', fechaNacimiento: '3/02/2004' },
  
  // Temor de Dios
  { nombre: 'Mathias Calderon Sequeira', grupo: 'Temor de Dios', comision: '', fechaNacimiento: '13/12/2005' },
  { nombre: 'Karemy Guzmán Cruz', grupo: 'Temor de Dios', comision: 'Retiro', fechaNacimiento: '21/08/2007' },
  { nombre: 'Sofía Arce Hernández', grupo: 'Temor de Dios', comision: 'Retiro', fechaNacimiento: '25/01/2007' },
  { nombre: 'Sebastián Huertas Arce *', grupo: 'Temor de Dios', comision: 'Financiero', fechaNacimiento: '12/04/2006' },
  { nombre: 'Nazareth Sofía Montoya Chacón', grupo: 'Temor de Dios', comision: 'Financiero', fechaNacimiento: '22/10/2007' },
  
  // Entendimiento
  { nombre: 'Samuel Brenes Vargas *', grupo: 'Entendimiento', comision: 'Retiro', fechaNacimiento: '6/04/2006' },
  { nombre: 'Luis Felipe Mora Ramírez', grupo: 'Entendimiento', comision: 'Retiro', fechaNacimiento: '30/04/2006' },
  { nombre: 'Noelia Odilie Matarrita Araya', grupo: 'Entendimiento', comision: '', fechaNacimiento: '3/06/2007' },
  { nombre: 'Sebastián Altamirano Ling', grupo: 'Entendimiento', comision: 'Financiero', fechaNacimiento: '27/07/2008' },
  { nombre: 'Monserrat Solano Vargas', grupo: 'Entendimiento', comision: 'Logística', fechaNacimiento: '2/04/2007' },
  
  // Fortaleza
  { nombre: 'Dylan Chacón Sandoval *', grupo: 'Fortaleza', comision: 'Financiero', fechaNacimiento: '11/05/2006' },
  { nombre: 'Steven Alpizar Gamboa', grupo: 'Fortaleza', comision: 'Logística', fechaNacimiento: '20/07/2007' },
  { nombre: 'Jimena Valeska Angulo Ramirez', grupo: 'Fortaleza', comision: 'Medios', fechaNacimiento: '19/11/2006' },
  { nombre: 'Francella Fallas Castro', grupo: 'Fortaleza', comision: 'Medios', fechaNacimiento: '30/01/2008' },
  
  // Formación
  { nombre: 'José Pablo Castro Jiménez', grupo: 'Formación', comision: '', fechaNacimiento: '13/12/2003' },
  { nombre: 'Gabriel Esteban Valverde Guzmán', grupo: 'Formación', comision: '', fechaNacimiento: '14/05/2004' },
  { nombre: 'Adriana Álvarez Lizano', grupo: 'Formación', comision: '', fechaNacimiento: '12/09/2005' }
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
