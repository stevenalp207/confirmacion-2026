# Confirmación 2026 - Sistema de Gestión

Sistema web (SPA) desarrollado con React, Tailwind CSS y Supabase para gestionar la Confirmación 2026.

## 🚀 Características

- **Autenticación basada en roles** con sistema personalizado
- **Gestión de 7 grupos**: Ciencia, Piedad, Fortaleza, Consejo, Entendimiento, Sabiduría, Temor de Dios
- **6 Módulos principales**:
  - **Asistencia**: Registro con 3 estados (presente/ausente/justificado)
  - **Catequistas**: Control de asistencia de catequistas (solo admin/logistica)
  - **Documentos**: Control de entrega de documentos
  - **Sábanas**: Registro de entrega de sábanas (solo admin/logistica)
  - **Cartas**: Registro de entrega de cartas (solo admin/logistica)
  - **Pagos**: Control de pagos del retiro ₡50.000 por estudiante (solo admin/logistica)
- **Diseño Mobile-First** con Tailwind CSS
- **Base de datos en tiempo real** con Supabase PostgreSQL

## 📁 Estructura de Datos en Supabase

### Tablas PostgreSQL

- **usuarios**: Usuarios con roles (admin, logistica, nombres de grupos)
- **asistencias**: Asistencia de estudiantes con estados (presente/ausente/justificado)
- **documentos_entregados**: Control de entrega de documentos por estudiante
- **sabanas_entregadas**: Control de entrega de sábanas
- **cartas_entregadas**: Control de entrega de cartas
- **pagos_retiro**: Pagos del retiro (₡50.000 por estudiante)
- **asistencia_catequistas**: Asistencia de los 41 catequistas

## 🔧 Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [Supabase](https://app.supabase.com/)
2. Ve a **Settings** > **API** y copia:
   - **Project URL**
   - **anon/public key**
3. Actualiza el archivo `src/config/supabase.js` con tus credenciales:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'TU_SUPABASE_URL'
const supabaseAnonKey = 'TU_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 3. Crear las tablas en Supabase

En Supabase > **SQL Editor**, ejecuta los scripts SQL para crear las tablas:
- Ver `SQL_CATEQUISTAS.sql` para la tabla de catequistas
- Las demás tablas ya deberían estar creadas

### 4. Crear usuarios de administración

Los usuarios se crean con el sistema de login. Usuarios predefinidos:
- **admin** (rol: admin)
- **logistica** (rol: logistica)
- **Ciencia**, **Piedad**, **Fortaleza**, **Consejo**, **Entendimiento**, **Sabiduría**, **Temor de Dios** (rol: nombre del grupo)

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

## 🧰 Utilidades agregadas

Se añadieron utilidades reutilizables en `src/utils` para acelerar el trabajo en los módulos:

- `format.js`: Formateo de fechas (`formatDate`), horas (`formatTime`), nombres (`capitalizeName`) y moneda CRC (`formatCurrency`).
- `validation.js`: Validaciones comunes (`required`, `isEmail`, `isPhoneCR`, `isCedulaCR`, `isPositiveAmount`).
- `permissions.js`: Reglas básicas de acceso por rol (`canAccess`, `requireAccess`, `isAdmin`).
- `storage.js`: Hooks de almacenamiento (`useLocalStorage`, `useSessionStorage`) y cache con TTL (`createCache`).
- `export.js`: Exportación a CSV (`toCSV`) y descarga (`downloadCSV`).
- `analytics.js`: Métricas de asistencia y finanzas (`attendanceRate`, `monthlyTotals`, `outstandingPayments`, `groupStats`).

### Ejemplos rápidos

```javascript
import { formatCurrency, attendanceRate, toCSV, downloadCSV } from '@/utils'

// Formatear montos
formatCurrency(50000) // ➜ "₡50.000"

// Tasa de asistencia
attendanceRate([{estado: 'presente'}, {estado: 'ausente'}]) // ➜ 50

// Exportar a CSV
const csv = toCSV([
  { nombre: 'Ana', grupo: 'Ciencia' },
  { nombre: 'Luis', grupo: 'Piedad' },
], [
  { key: 'nombre', header: 'Nombre' },
  { key: 'grupo', header: 'Grupo' },
])
downloadCSV('estudiantes.csv', csv)
```

> Importación abreviada: todos los helpers se re-exportan desde `src/utils/index.js`, por lo que puedes usar `import { ... } from '@/utils'`.
