import { ref, set } from 'firebase/database';
import { database } from '../config/firebase';
import { gruposData } from '../data/grupos';

/**
 * Script para importar datos iniciales a Firebase Realtime Database
 * 
 * Estructura JSON:
 * grupos/
 *   {nombreGrupo}/
 *     estudiantes/
 *       {id}/
 *         nombre: string
 *         documentos: { [tipo]: boolean }
 *         asistencias: { [fecha]: boolean }
 * 
 * Uso:
 * 1. Asegúrate de tener la configuración de Firebase correcta en src/config/firebase.js
 * 2. Ejecuta este script desde la consola del navegador o desde un componente temporal
 * 3. Los datos se importarán a la Realtime Database
 */

export async function importarDatosAFirebase() {
  try {
    console.log('Iniciando importación de datos...');
    
    for (const [grupoNombre, grupoData] of Object.entries(gruposData)) {
      console.log(`Importando grupo: ${grupoNombre}`);
      
      const grupoRef = ref(database, `grupos/${grupoNombre}`);
      await set(grupoRef, grupoData);
      
      console.log(`✓ Grupo ${grupoNombre} importado exitosamente`);
    }
    
    console.log('✓ Importación completada exitosamente');
    return { success: true, message: 'Datos importados correctamente' };
  } catch (error) {
    console.error('Error durante la importación:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Función para importar estudiantes desde un archivo CSV o array
 * 
 * @param {string} grupoNombre - Nombre del grupo
 * @param {Array} estudiantes - Array de estudiantes con formato:
 *   [{ id: 1, nombre: 'Nombre Completo' }, ...]
 */
export async function importarEstudiantes(grupoNombre, estudiantes) {
  try {
    console.log(`Importando ${estudiantes.length} estudiantes al grupo ${grupoNombre}...`);
    
    const estudiantesObj = {};
    estudiantes.forEach(est => {
      estudiantesObj[est.id] = {
        id: est.id,
        nombre: est.nombre,
        documentos: {},
        asistencias: {}
      };
    });
    
    const estudiantesRef = ref(database, `grupos/${grupoNombre}/estudiantes`);
    await set(estudiantesRef, estudiantesObj);
    
    console.log(`✓ ${estudiantes.length} estudiantes importados exitosamente`);
    return { success: true, count: estudiantes.length };
  } catch (error) {
    console.error('Error al importar estudiantes:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Función para limpiar todos los datos de la base de datos
 * ⚠️ USAR CON PRECAUCIÓN - Esta función elimina todos los datos
 */
export async function limpiarBaseDeDatos() {
  if (!confirm('¿Estás seguro de que deseas eliminar todos los datos? Esta acción no se puede deshacer.')) {
    return { success: false, message: 'Operación cancelada' };
  }
  
  try {
    console.log('Limpiando base de datos...');
    const gruposRef = ref(database, 'grupos');
    await set(gruposRef, null);
    console.log('✓ Base de datos limpiada');
    return { success: true };
  } catch (error) {
    console.error('Error al limpiar base de datos:', error);
    return { success: false, error: error.message };
  }
}

// Exportar función para uso directo desde consola del navegador
if (typeof window !== 'undefined') {
  window.importarDatosAFirebase = importarDatosAFirebase;
  window.importarEstudiantes = importarEstudiantes;
  window.limpiarBaseDeDatos = limpiarBaseDeDatos;
}
