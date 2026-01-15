# Guía de Configuración de Firebase

## Paso 1: Crear un Proyecto de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto" o "Add project"
3. Nombra tu proyecto (ej: "confirmacion-2026")
4. Sigue los pasos del asistente

## Paso 2: Configurar Authentication

1. En el menú lateral, selecciona **Authentication**
2. Haz clic en "Get started" o "Comenzar"
3. En la pestaña "Sign-in method":
   - Habilita **Email/Password**
   - Guarda los cambios

## Paso 3: Configurar Realtime Database

1. En el menú lateral, selecciona **Realtime Database**
2. Haz clic en "Create Database" o "Crear base de datos"
3. Selecciona una ubicación (ej: United States)
4. Selecciona **"Start in test mode"** por ahora
5. Haz clic en "Enable"

## Paso 4: Configurar Reglas de Seguridad

1. En Realtime Database, ve a la pestaña **Rules**
2. Reemplaza las reglas con las siguientes:

```json
{
  "rules": {
    "grupos": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$grupoId": {
        ".validate": "newData.hasChildren(['nombre', 'estudiantes'])",
        "nombre": {
          ".validate": "newData.isString()"
        },
        "estudiantes": {
          "$estudianteId": {
            ".validate": "newData.hasChildren(['id', 'nombre'])",
            "id": {
              ".validate": "newData.isNumber()"
            },
            "nombre": {
              ".validate": "newData.isString()"
            },
            "documentos": {
              "$documentoId": {
                ".validate": "newData.isBoolean()"
              }
            },
            "asistencias": {
              "$fecha": {
                ".validate": "newData.isBoolean()"
              }
            }
          }
        }
      }
    }
  }
}
```

3. Haz clic en "Publish" o "Publicar"

## Paso 5: Obtener las Credenciales de Firebase

1. En el menú lateral, haz clic en el ícono de engranaje ⚙️ y selecciona **Project settings**
2. Desplázate hasta la sección "Your apps"
3. Haz clic en el ícono de web **</>**
4. Registra tu app (ej: "Confirmacion Web")
5. Copia la configuración de Firebase que se muestra

## Paso 6: Configurar el Proyecto

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` con tus credenciales (OPCIONAL - si prefieres no usar variables de entorno, edita directamente `src/config/firebase.js`):
   ```
   VITE_FIREBASE_API_KEY=tu_api_key_aqui
   VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain_aqui
   VITE_FIREBASE_DATABASE_URL=https://tu-proyecto.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=tu_project_id_aqui
   VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket_aqui
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id_aqui
   VITE_FIREBASE_APP_ID=tu_app_id_aqui
   ```

3. O edita directamente `src/config/firebase.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC...",
     authDomain: "confirmacion-2026.firebaseapp.com",
     databaseURL: "https://confirmacion-2026-default-rtdb.firebaseio.com",
     projectId: "confirmacion-2026",
     storageBucket: "confirmacion-2026.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abc..."
   };
   ```

## Paso 7: Crear Usuarios de Administración

1. En Firebase Console, ve a **Authentication** > **Users**
2. Haz clic en "Add user" o "Agregar usuario"
3. Crea un usuario para cada grupo con el siguiente formato:

**Usuarios recomendados:**
- **Email:** ciencia@confirma.com **Contraseña:** confirma2026
- **Email:** piedad@confirma.com **Contraseña:** confirma2026
- **Email:** fortaleza@confirma.com **Contraseña:** confirma2026
- **Email:** consejo@confirma.com **Contraseña:** confirma2026
- **Email:** entendimiento@confirma.com **Contraseña:** confirma2026
- **Email:** sabiduria@confirma.com **Contraseña:** confirma2026
- **Email:** temordedios@confirma.com **Contraseña:** confirma2026

**Nota:** Puedes personalizar estos correos y contraseñas según tus necesidades. Cada catequista usará su correo de grupo para acceder a su información.

## Paso 8: Importar Datos Iniciales

1. Ejecuta el proyecto:
   ```bash
   npm run dev
   ```

2. Inicia sesión con uno de los usuarios creados

3. Abre la consola del navegador (F12)

4. Ejecuta el comando:
   ```javascript
   importarDatosAFirebase()
   ```

5. Verifica en Firebase Console que los datos se hayan importado correctamente

## Paso 9: Personalizar Datos de Estudiantes

### Opción A: Editar el archivo de datos

1. Edita `src/data/grupos.js`
2. Modifica los arrays de estudiantes con tus datos reales
3. Ejecuta nuevamente `importarDatosAFirebase()` desde la consola

### Opción B: Importar desde archivo

Si tienes una lista en Excel/CSV:

1. Convierte tu archivo a formato JavaScript
2. Usa la función `importarEstudiantes()` desde la consola:
   ```javascript
   const estudiantes = [
     { id: 1, nombre: 'Juan Pérez' },
     { id: 2, nombre: 'María García' },
     // ...más estudiantes
   ];
   importarEstudiantes('Ciencia', estudiantes);
   ```

## Solución de Problemas

### Error: "Cannot parse Firebase url"
- Verifica que `databaseURL` tenga el formato correcto: `https://tu-proyecto.firebaseio.com`
- Asegúrate de haber creado una Realtime Database en Firebase Console

### Error: "Permission denied"
- Verifica que las reglas de seguridad estén configuradas correctamente
- Asegúrate de estar autenticado (logged in)

### No aparecen datos después de importar
- Verifica en Firebase Console > Realtime Database que los datos se hayan guardado
- Revisa la consola del navegador por errores
- Verifica que el formato de datos sea correcto

## Recursos Adicionales

- [Documentación de Firebase Authentication](https://firebase.google.com/docs/auth)
- [Documentación de Realtime Database](https://firebase.google.com/docs/database)
- [Reglas de Seguridad](https://firebase.google.com/docs/database/security)
