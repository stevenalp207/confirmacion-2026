# Guía de Datos de Estudiantes

Esta guía te ayudará a gestionar los datos de estudiantes en el sistema.

## Estructura de Datos

Los datos de estudiantes están almacenados en `src/data/grupos.js`

### Formato

```javascript
export const gruposData = {
  'Ciencia': {
    estudiantes: {
      '1': { id: 1, nombre: 'Juan Pérez Gómez' },
      '2': { id: 2, nombre: 'María García López' },
      // ...
    }
  },
  // ... otros grupos
}
```

```javascript
// Pega tus datos de Excel aquí (separados por tabs)
const excelData = `1	Juan Pérez Gómez
2	María García López
3	Carlos Rodríguez Sánchez`;

// Convertir a array
const estudiantes = excelData.split('\n').map(line => {
  const [id, nombre] = line.split('\t');
  return { id: parseInt(id), nombre: nombre.trim() };
});

// Importar
await importarEstudiantes('Ciencia', estudiantes);
```

## Método 3: Actualizar el archivo grupos.js

### Editar directamente el código

Abre el archivo `src/data/grupos.js` y modifica la sección de estudiantes para cada grupo:

```javascript
export const gruposData = {
  'Ciencia': {
    nombre: 'Ciencia',
    estudiantes: {
      '1': { id: 1, nombre: 'Juan Pérez Gómez', documentos: {}, asistencias: {} },
      '2': { id: 2, nombre: 'María García López', documentos: {}, asistencias: {} },
      '3': { id: 3, nombre: 'Carlos Rodríguez Sánchez', documentos: {}, asistencias: {} },
      // ... más estudiantes
    }
  },
  // ... otros grupos
};
```

Luego ejecuta en la consola del navegador:
```javascript
await importarDatosAFirebase();
```

## Método 4: Importación masiva desde archivo

Si tienes un archivo grande, puedes crear un script de importación:

### Paso 1: Crear script de importación

Crea un archivo `src/utils/importFromFile.js`:

```javascript
import { ref, set } from 'firebase/database';
import { database } from '../config/firebase';

// Importar desde un objeto con todos los grupos
export async function importarTodosLosGrupos(todosLosDatos) {
  try {
    for (const [grupoNombre, estudiantes] of Object.entries(todosLosDatos)) {
      console.log(`Importando grupo: ${grupoNombre}...`);
      
      const estudiantesObj = {};
      estudiantes.forEach((est, index) => {
        const id = est.id || (index + 1);
        estudiantesObj[id] = {
          id: id,
          nombre: est.nombre,
          documentos: {},
          asistencias: {}
        };
      });
      
      const grupoRef = ref(database, `grupos/${grupoNombre}`);
      await set(grupoRef, {
        nombre: grupoNombre,
        estudiantes: estudiantesObj
      });
## Agregar o Modificar Estudiantes

### Método 1: Editar directamente el archivo

1. Abre `src/data/grupos.js`
2. Encuentra el grupo correspondiente
3. Agrega o modifica los estudiantes en el formato:

```javascript
'ID': { id: ID, nombre: 'Nombre Completo' }
```

### Método 2: Agregar desde la aplicación

Los estudiantes se sincronizan automáticamente con Supabase cuando usas los módulos.

## Notas Importantes

- Los datos en `src/data/grupos.js` son el origen de verdad para la estructura inicial
- La información de asistencia, documentos, etc. se guarda en Supabase
- Los cambios en Supabase persisten entre dispositivos
- Para backup, exporta desde Supabase regularmente
