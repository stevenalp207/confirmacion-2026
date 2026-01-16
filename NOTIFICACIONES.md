# Sistema de Notificaciones - Confirmación 2026

## 📱 Cómo usar las notificaciones

### Activar notificaciones

1. **Inicia sesión** en la aplicación
2. Busca el botón de notificaciones en la **esquina inferior derecha** (icono de campana)
3. Haz clic en el botón que dice **"Notificaciones OFF"**
4. Tu navegador te pedirá permiso para mostrar notificaciones - haz clic en **"Permitir"**
5. Una vez activado, el botón cambiará a verde y dirá **"Notificaciones ON"**

### ¿Cuándo recibirás notificaciones?

- **Día**: Todos los **jueves**
- **Hora**: **5:05 PM** (hora de Costa Rica / UTC-6)
- **Mensaje**: "Recuerda pasar lista"

### 📲 Instalar en el celular (PWA)

Para tener la app instalada y recibir notificaciones en tu teléfono:

#### Android (Chrome):
1. Abre la página en Chrome
2. Toca el menú (⋮) en la esquina superior derecha
3. Selecciona **"Agregar a pantalla de inicio"** o **"Instalar app"**
4. Confirma la instalación
5. La app aparecerá como cualquier otra app en tu teléfono

#### iOS (Safari):
1. Abre la página en Safari
2. Toca el botón de compartir (□↑)
3. Desplázate y selecciona **"Agregar a pantalla de inicio"**
4. Confirma
5. **Nota**: Las notificaciones en iOS tienen limitaciones. Considera usar Android para mejor experiencia.

### Probar notificaciones

En modo desarrollo, verás un botón **"Probar notificación"** que te permite verificar que todo funciona correctamente.

### Desactivar notificaciones

Para desactivar las notificaciones:
1. Haz clic en el botón verde **"Notificaciones ON"**
2. El botón cambiará a gris y las notificaciones se desactivarán

### Permisos del navegador

Si rechazaste los permisos por accidente:

**Chrome/Edge:**
1. Haz clic en el candado (🔒) en la barra de direcciones
2. Busca "Notificaciones" en los permisos
3. Cambia de "Bloqueado" a "Permitir"
4. Recarga la página

**Firefox:**
1. Haz clic en el icono de información (ℹ️) en la barra de direcciones
2. Encuentra "Notificaciones" en Permisos
3. Cambia a "Permitir"
4. Recarga la página

## 🔧 Características técnicas

- ✅ Funciona offline (Service Worker)
- ✅ Notificaciones persistentes
- ✅ Programación automática semanal
- ✅ Sincronización con hora de Costa Rica
- ✅ No se duplican notificaciones (una vez por semana)
- ✅ Compatible con PWA (Progressive Web App)

## 🐛 Solución de problemas

**No recibo notificaciones:**
1. Verifica que el botón esté en verde (ON)
2. Revisa los permisos del navegador
3. Asegúrate de que la app esté abierta o instalada como PWA
4. En Android, verifica que las notificaciones no estén bloqueadas en la configuración del sistema

**El botón no aparece:**
1. Asegúrate de haber iniciado sesión
2. Recarga la página
3. Verifica tu conexión a internet

## 💡 Notas importantes

- Las notificaciones funcionan mejor cuando la app está instalada como PWA
- En iOS, las notificaciones web tienen limitaciones importantes
- La app debe estar al menos en segundo plano para que funcionen las notificaciones
- Si cierras completamente el navegador/app, es posible que no recibas la notificación

## 🎯 Próximos pasos

Para mejorar el sistema puedes:
- Agregar más recordatorios personalizados
- Permitir cambiar el día y hora del recordatorio
- Añadir notificaciones para eventos especiales
- Integrar con el calendario del dispositivo
