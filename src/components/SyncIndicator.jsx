import { useDataSync } from '../hooks/useDataSync';
import { useError } from '../context/ErrorContext';

/**
 * Indicador de Sincronización para la TopBar
 * Muestra:
 * - Número de operaciones pendientes
 * - Estado de sincronización
 * - Indicador visual de conexión
 * 
 * Uso: Agregar a TopBar.jsx
 */
const SyncIndicator = () => {
  const { pending, isSyncing, isOnline, syncAll } = useDataSync();
  const { isOnline: isOnlineFromError } = useError();

  // No mostrar nada si todo está sincronizado y online
  if (pending === 0 && isOnline) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Indicador de conexión */}
      <div
        className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-red-500 animate-pulse'
        }`}
        title={isOnline ? 'Conectado' : 'Sin conexión'}
      />

      {/* Contador de pendientes */}
      {pending > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {pending}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isSyncing ? 'sincronizando...' : 'pendiente'}
          </span>
          {!isSyncing && isOnline && (
            <button
              onClick={syncAll}
              className="ml-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition"
              title="Sincronizar ahora"
            >
              ↻
            </button>
          )}
        </div>
      )}

      {/* Estado offline */}
      {!isOnline && (
        <span className="text-xs text-red-600 dark:text-red-400 font-semibold">
          Offline
        </span>
      )}

      {/* Sincronizando */}
      {isSyncing && (
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border-2 border-transparent border-t-blue-600 rounded-full animate-spin" />
          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
            Sincronizando
          </span>
        </div>
      )}
    </div>
  );
};

export default SyncIndicator;
