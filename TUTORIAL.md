# 🎓 Tutorial de Onboarding - Guía de Usuario

## ✨ Características del Tutorial

### Aparición Automática
- Se muestra **automáticamente** la primera vez que un usuario accede a la aplicación
- Sólo aparece una vez por navegador/dispositivo
- Se puede saltar en cualquier momento
- Se puede volver a ver desde el panel de notificaciones

### Contenido del Tutorial

#### Paso 1: Bienvenida 🎉
- Saludo inicial
- Explicación breve del propósito del tutorial

#### Paso 2: Activar Notificaciones 🔔
- Destaca el botón de notificaciones en el header
- Explica cómo activarlas
- Indica la ubicación visual

#### Paso 3: Tipos de Recordatorios ⏰
- Lista de todos los tipos de notificaciones disponibles:
  - 📋 Asistencia (Jueves 5:05 PM)
  - 💰 Pagos (Lunes 9:00 AM)
  - 📄 Documentos (Miércoles 10:00 AM)
  - 👨‍🏫 Catequistas (Jueves 4:00 PM)

### Efectos Visuales

#### Durante el Tutorial
- Fondo oscuro con blur
- Animaciones suaves de entrada/salida
- Indicadores de progreso (dots)
- Iconos animados

#### Después del Tutorial
- **Efecto de pulso** en el botón de notificaciones durante 10 segundos
- Anillo azul animado que llama la atención
- El botón crece ligeramente (scale)
- Se detiene automáticamente o al hacer clic

### Controles de Usuario

#### Durante el Tutorial
- **Saltar**: Cierra el tutorial sin completarlo
- **Siguiente**: Avanza al siguiente paso
- **Entendido**: Completa el tutorial (último paso)
- **X**: Cierra el tutorial (esquina superior derecha)
- **Click fuera**: Cierra el tutorial

#### Después del Tutorial
- **Ver tutorial de nuevo**: Enlace en el footer del panel de notificaciones
- Resetea el estado y recarga la página

## 🔧 Configuración Técnica

### localStorage Keys
```javascript
'confirmacion2026_onboarding_completed'  // 'true' cuando se completa
'notifications_pulse_shown'              // 'true' después del efecto de pulso
```

### Hook useOnboarding
```javascript
const {
  shouldShowOnboarding,  // boolean: mostrar o no el tutorial
  isLoading,            // boolean: cargando estado inicial
  completeOnboarding,   // function: marcar como completado
  skipOnboarding,       // function: saltar tutorial
  resetOnboarding       // function: resetear para volver a ver
} = useOnboarding();
```

### Componente OnboardingTutorial
```jsx
<OnboardingTutorial
  onComplete={() => {}}  // Callback cuando se completa
  onSkip={() => {}}      // Callback cuando se salta
/>
```

## 🎨 Personalización

### Modificar Pasos del Tutorial

Editar `src/components/OnboardingTutorial.jsx`:

```javascript
const steps = [
  {
    title: 'Título del paso',
    description: 'Descripción detallada',
    icon: <IconComponent />,
    features: ['Lista', 'de', 'características'], // Opcional
    highlight: 'elemento-a-destacar' // Opcional
  },
  // ... más pasos
];
```

### Cambiar Duración del Efecto de Pulso

Editar `src/components/NotificationManager.jsx` línea 21:

```javascript
setTimeout(() => setShouldPulse(false), 10000); // 10 segundos
```

### Personalizar Animaciones

En `OnboardingTutorial.jsx`:
- `duration-300`: Velocidad de transiciones
- `scale-95`: Factor de escala inicial
- `translate-y-4`: Desplazamiento vertical

## 📱 Compatibilidad

### Desktop
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Opera

### Móvil
- ✅ Chrome Android
- ✅ Safari iOS
- ✅ Samsung Internet
- ✅ Firefox Android

## 🐛 Solución de Problemas

### El tutorial no aparece

**Verificar:**
```javascript
// En la consola del navegador:
localStorage.getItem('confirmacion2026_onboarding_completed')
// Debería ser null o undefined para mostrar el tutorial
```

**Solución:**
```javascript
localStorage.removeItem('confirmacion2026_onboarding_completed');
window.location.reload();
```

### El efecto de pulso no aparece

**Verificar:**
```javascript
localStorage.getItem('notifications_pulse_shown')
// Debería ser null después de completar el onboarding
```

**Solución:**
```javascript
localStorage.removeItem('notifications_pulse_shown');
window.location.reload();
```

### El tutorial se muestra en cada sesión

**Causa:** El localStorage no está funcionando correctamente

**Solución:**
1. Verificar que el navegador permita localStorage
2. Verificar que no esté en modo incógnito
3. Verificar permisos de cookies/almacenamiento

## ✅ Testing Checklist

- [ ] Tutorial aparece en primera visita
- [ ] Se puede saltar con "Saltar"
- [ ] Se puede cerrar con "X"
- [ ] Se puede cerrar haciendo click fuera
- [ ] Navegación entre pasos funciona
- [ ] Botón "Entendido" completa el tutorial
- [ ] No aparece en visitas posteriores
- [ ] Efecto de pulso aparece después de completar
- [ ] Pulso se detiene después de 10s
- [ ] Pulso se detiene al hacer click
- [ ] "Ver tutorial de nuevo" funciona
- [ ] Responsive en móvil
- [ ] Animaciones suaves

## 🎯 Mejoras Futuras (Opcional)

1. **Personalización por Rol**
   - Mostrar pasos diferentes según el rol del usuario
   - Destacar módulos relevantes para cada rol

2. **Interactividad**
   - Permitir hacer click en el botón real durante el tutorial
   - Tour guiado por los módulos principales

3. **Analytics**
   - Rastrear cuántos usuarios completan el tutorial
   - Identificar en qué paso la gente abandona
   - Medir efectividad (conversión a activar notificaciones)

4. **A/B Testing**
   - Probar diferentes versiones del tutorial
   - Optimizar el contenido y la duración

5. **Video Tutorial**
   - Opción de ver un video corto
   - GIFs animados mostrando cómo usar

6. **Multi-idioma**
   - Soporte para inglés y español
   - Detección automática de idioma

---

**Nota:** El tutorial está diseñado para ser discreto y útil sin ser intrusivo. Los usuarios experimentados pueden saltarlo fácilmente, mientras que los nuevos usuarios reciben orientación clara.
