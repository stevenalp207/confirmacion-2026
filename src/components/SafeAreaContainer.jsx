import { useSafeArea } from '../hooks/useTouchGestures';

/**
 * Componente que ajusta automáticamente el padding para safe-area (notch)
 * Envuelve el contenido principal de la app
 */
export default function SafeAreaContainer({ children, className = '' }) {
  const safeArea = useSafeArea();

  return (
    <div
      className={className}
      style={{
        paddingTop: `max(1rem, ${safeArea.top}px)`,
        paddingRight: `max(1rem, ${safeArea.right}px)`,
        paddingBottom: `max(1rem, ${safeArea.bottom}px)`,
        paddingLeft: `max(1rem, ${safeArea.left}px)`,
      }}
    >
      {children}
    </div>
  );
}
