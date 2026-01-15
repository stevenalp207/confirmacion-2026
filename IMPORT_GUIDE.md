# Guía de Importación de Estudiantes

Esta guía te ayudará a importar estudiantes desde archivos CSV o Excel a la base de datos de Firebase.

## Formato de Datos

### Estructura Recomendada

Tu archivo CSV/Excel debe tener al menos dos columnas:
- **ID**: Número único para cada estudiante
- **Nombre**: Nombre completo del estudiante

Ejemplo de CSV:
```csv
ID,Nombre
1,Juan Pérez Gómez
2,María García López
3,Carlos Rodríguez Sánchez
4,Ana Martínez Torres
5,Luis Fernández Díaz
```

## Método 1: Importar desde CSV usando JavaScript

### Paso 1: Preparar el archivo CSV

Guarda tu archivo CSV en la carpeta `src/data/` con el nombre del grupo, por ejemplo:
- `ciencia.csv`
- `piedad.csv`
- etc.

### Paso 2: Convertir CSV a JSON

Puedes usar herramientas online como [CSV to JSON](https://csvjson.com/csv2json) o usar este código JavaScript:

```javascript
// Función para convertir CSV a array de objetos
function csvToArray(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',');
    const obj = {};
    
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j].trim().toLowerCase()] = values[j].trim();
    }
    
    result.push({
      id: parseInt(obj.id),
      nombre: obj.nombre
    });
  }
  
  return result;
}

// Usar en la consola del navegador
const csvText = `ID,Nombre
1,Juan Pérez Gómez
2,María García López
3,Carlos Rodríguez Sánchez`;

const estudiantes = csvToArray(csvText);
console.log(estudiantes);
```

### Paso 3: Importar a Firebase

Una vez tengas el array de estudiantes, usa la función de importación:

```javascript
// En la consola del navegador
const estudiantesCiencia = [
  { id: 1, nombre: 'Juan Pérez Gómez' },
  { id: 2, nombre: 'María García López' },
  { id: 3, nombre: 'Carlos Rodríguez Sánchez' }
];

await importarEstudiantes('Ciencia', estudiantesCiencia);
```

## Método 2: Usar Excel y copiar/pegar

### Paso 1: Preparar Excel

Crea una hoja de Excel con dos columnas: ID y Nombre

| ID | Nombre |
|----|--------|
| 1 | Juan Pérez |
| 2 | María García |

### Paso 2: Convertir a formato JavaScript

Selecciona tus datos y cópialos, luego usa este código para convertir:

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
      
      console.log(`✓ Grupo ${grupoNombre} importado (${estudiantes.length} estudiantes)`);
    }
    
    console.log('✓ Importación completada');
    return { success: true };
  } catch (error) {
    console.error('Error en la importación:', error);
    return { success: false, error: error.message };
  }
}
```

### Paso 2: Preparar tus datos

```javascript
const todosLosEstudiantes = {
  'Ciencia': [
    { id: 1, nombre: 'Juan Pérez' },
    { id: 2, nombre: 'María García' },
    // ... más
  ],
  'Piedad': [
    { id: 1, nombre: 'Ana Martínez' },
    { id: 2, nombre: 'Luis Rodríguez' },
    // ... más
  ],
  // ... otros grupos
};

// Ejecutar importación
await importarTodosLosGrupos(todosLosEstudiantes);
```

## Verificación

Después de importar:

1. Ve a Firebase Console > Realtime Database
2. Verifica que la estructura sea:
   ```
   grupos/
     Ciencia/
       nombre: "Ciencia"
       estudiantes/
         1/
           id: 1
           nombre: "Juan Pérez"
           documentos: {}
           asistencias: {}
   ```

3. Recarga la aplicación y selecciona el grupo para verificar que los estudiantes aparezcan

## Solución de Problemas

### Error: "Permission denied"
- Asegúrate de estar autenticado
- Verifica las reglas de seguridad de Firebase

### Los datos no aparecen
- Verifica la estructura JSON en Firebase Console
- Asegúrate de que los IDs sean números o strings consistentes
- Recarga la página completamente (Ctrl+Shift+R)

### Duplicados
- Si importas dos veces, los datos se sobrescribirán (no se duplicarán)
- Para agregar estudiantes sin sobrescribir, usa `update` en lugar de `set`

## Ejemplo Completo

```javascript
// 1. Preparar datos
const estudiantesCiencia = [
  { id: 1, nombre: 'Juan Pérez Gómez' },
  { id: 2, nombre: 'María García López' },
  { id: 3, nombre: 'Carlos Rodríguez Sánchez' },
  { id: 4, nombre: 'Ana Martínez Torres' },
  { id: 5, nombre: 'Luis Fernández Díaz' }
];

// 2. Importar
await importarEstudiantes('Ciencia', estudiantesCiencia);

// 3. Verificar
console.log('Importación completada. Verifica en Firebase Console.');
```
