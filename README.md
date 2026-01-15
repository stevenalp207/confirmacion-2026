# Confirmación 2026 - Sistema de Gestión

Sistema web (SPA) desarrollado con React, Tailwind CSS y Firebase para gestionar la Confirmación 2026.

## 🚀 Características

- **Autenticación segura** con Firebase Authentication
- **Gestión de 7 grupos**: Ciencia, Piedad, Fortaleza, Consejo, Entendimiento, Sabiduría, Temor de Dios
- **Módulo de Documentos**: Control de entrega de documentos mediante checkboxes
- **Módulo de Asistencia**: Registro de asistencia por fechas de jueves
- **Diseño Mobile-First** con Tailwind CSS
- **Base de datos en tiempo real** con Firebase Realtime Database

## 📁 Estructura de Datos

```json
grupos/
  {nombreGrupo}/
    nombre: string
    estudiantes/
      {id}/
        id: number
        nombre: string
        documentos: { [tipo]: boolean }
        asistencias: { [fecha]: boolean }
```

## 🔧 Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita **Authentication** (Email/Password)
3. Habilita **Realtime Database**
4. Copia tu configuración de Firebase
5. Actualiza el archivo `src/config/firebase.js` con tus credenciales:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  databaseURL: "TU_DATABASE_URL",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};
```

### 3. Configurar reglas de seguridad de Firebase

En Firebase Console > Realtime Database > Rules, copia el contenido del archivo `database.rules.json`:

```json
{
  "rules": {
    "grupos": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### 4. Crear usuarios de administración

En Firebase Console > Authentication > Users, crea usuarios con email y contraseña para cada grupo:

**Usuarios recomendados:**
- ciencia@confirma.com (contraseña: confirma2026)
- piedad@confirma.com (contraseña: confirma2026)
- fortaleza@confirma.com (contraseña: confirma2026)
- consejo@confirma.com (contraseña: confirma2026)
- entendimiento@confirma.com (contraseña: confirma2026)
- sabiduria@confirma.com (contraseña: confirma2026)
- temordedios@confirma.com (contraseña: confirma2026)

**Nota:** Puedes usar cualquier combinación de email y contraseña que prefieras.

### 5. Importar datos iniciales

Hay dos opciones para importar datos:

#### Opción A: Usar datos de ejemplo
1. Ejecuta la aplicación: `npm run dev`
2. Inicia sesión
3. Abre la consola del navegador (F12)
4. Ejecuta: `importarDatosAFirebase()`

#### Opción B: Importar desde archivos personalizados
1. Prepara tus archivos CSV/Excel con los nombres de estudiantes
2. Modifica el archivo `src/data/grupos.js` con tus datos
3. Ejecuta el script de importación desde la consola del navegador

## 🏃 Ejecutar la aplicación

### Modo desarrollo
```bash
npm run dev
```

### Compilar para producción
```bash
npm run build
```

### Vista previa de producción
```bash
npm run preview
```

## 📱 Uso de la aplicación

1. **Iniciar sesión**: Usa las credenciales de Firebase Authentication
2. **Seleccionar grupo**: Usa el navbar para seleccionar uno de los 7 grupos
3. **Gestionar documentos**: Marca los checkboxes para indicar documentos entregados
4. **Registrar asistencia**: Marca la asistencia para cada fecha de jueves

## 📋 Documentos requeridos

- Cédula Catequizando
- Fe de Bautismo
- Constancia Comunión
- Cédula Padrino
- Fe Confirmación Padrino
- Acta de Matrimonio

## 📅 Fechas de Asistencia

Se registra la asistencia de los estudiantes cada jueves. Las fechas se configuran en `src/data/grupos.js`.

## 🔒 Seguridad

- Autenticación requerida para acceder a la aplicación
- Reglas de Firebase configuradas para acceso solo autenticado
- Validación de datos en el servidor

## 🛠️ Tecnologías utilizadas

- **React 19** - Framework de interfaz
- **Vite** - Build tool
- **Tailwind CSS 4** - Framework de estilos
- **Firebase** - Backend y autenticación
  - Authentication
  - Realtime Database
- **ESLint** - Linting

## 📝 Scripts de importación

El archivo `src/utils/importData.js` incluye funciones para:

- `importarDatosAFirebase()`: Importar datos de ejemplo
- `importarEstudiantes(grupo, estudiantes)`: Importar lista de estudiantes
- `limpiarBaseDeDatos()`: Limpiar todos los datos (usar con precaución)

## 📞 Soporte

Para problemas o preguntas, contacta al administrador del sistema.

## 📄 Licencia

Este proyecto es privado y está destinado únicamente para uso interno.
