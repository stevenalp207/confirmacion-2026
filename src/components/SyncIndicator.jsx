import { useDataSync } from '../hooks/useDataSync';

const formatLastSync = (value) => {
  if (!value) return 'Sin sincronizacion reciente';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin sincronizacion reciente';

  return `Ultima sync: ${date.toLocaleTimeString('es-CR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

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
  const { pending, failed, isSyncing, isOnline, syncAll, lastSyncTime } = useDataSync();

  // No mostrar nada si todo está sincronizado y online
  if (pending === 0 && failed === 0 && isOnline && !isSyncing) {
    return null;
  }

  const statusTitle = [
    formatLastSync(lastSyncTime),
    failed > 0 ? `${failed} errores por reintentar` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  return (
    <div className="flex items-center gap-2" title={statusTitle}>
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

      {failed > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            {failed}
          </span>
          <span className="text-xs text-amber-600 dark:text-amber-300">
            error
          </span>
          {!isSyncing && isOnline && (
            <button
              onClick={syncAll}
              className="ml-1 px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded hover:bg-amber-200 dark:hover:bg-amber-800 transition"
              title="Reintentar sincronizacion"
            >
              Reintentar
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

      {!isSyncing && isOnline && (
        <span className="hidden xl:inline text-[11px] text-gray-500 dark:text-gray-400">
          {formatLastSync(lastSyncTime)}
        </span>
      )}
    </div>
  );
};

export default SyncIndicator;
