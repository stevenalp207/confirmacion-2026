import { useState } from 'react';
import { useError } from '../context/ErrorContext';
import { useDataSync } from '../hooks/useDataSync';

/**
 * Componente de ejemplo para demostrar cómo usar:
 * - Global Error Handler
 * - Data Sync Manager
 * 
 * Este es un componente de demostración que puedes eliminar después
 */
const SyncExample = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addError } = useError();
  const { addOperation, total, pending, completed, failed, syncAll } = useDataSync();

  // Ejemplo: Simular un error
  const handleTestError = () => {
    addError({
      type: 'error',
      message: 'Este es un error de prueba',
      data: { code: 'TEST_ERROR' },
      autoClose: 5000,
    });
  };

  // Ejemplo: Simular una operación offline
  const handleOfflineOperation = async () => {
    try {
      setIsLoading(true);

      // Agregar una operación a la cola de sincronización
      const id = addOperation(
        '/api/test',
        { message: 'Datos de prueba' },
        'POST'
      );

      addError({
        type: 'info',
        message: 'Operación agregada a la cola de sincronización',
        autoClose: 3000,
      });
    } catch (error) {
      addError({
        type: 'error',
        message: 'Error al agregar operación: ' + error.message,
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Ejemplo: Simular una advertencia
  const handleTestWarning = () => {
    addError({
      type: 'warning',
      message: 'Esta es una advertencia de prueba',
      autoClose: 4000,
    });
  };

  // Ejemplo: Simular un éxito
  const handleTestSuccess = () => {
    addError({
      type: 'success',
      message: '¡Operación completada exitosamente!',
      autoClose: 3000,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Demostración de Manejo de Errores y Sincronización
        </h2>

        {/* Error Handler Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Gestor de Errores Global
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleTestError}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-semibold"
            >
              Mostrar Error
            </button>
            <button
              onClick={handleTestWarning}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition font-semibold"
            >
              Mostrar Advertencia
            </button>
            <button
              onClick={handleTestSuccess}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold"
            >
              Mostrar Éxito
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Los errores aparecerán en la esquina inferior derecha como notificaciones flotantes.
          </p>
        </div>

        {/* Data Sync Manager Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Gestor de Sincronización de Datos
          </h3>

          <div className="bg-gray-50 rounded p-4 mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{total}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{pending}</p>
                <p className="text-xs text-gray-600">Pendientes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{completed}</p>
                <p className="text-xs text-gray-600">Completadas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{failed}</p>
                <p className="text-xs text-gray-600">Fallidas</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleOfflineOperation}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Agregando...' : 'Agregar Operación'}
            </button>
            <button
              onClick={syncAll}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition font-semibold"
            >
              Sincronizar Ahora
            </button>
          </div>

          <p className="text-sm text-gray-600 mt-3">
            Prueba agregando operaciones. Si estás offline, se guardarán en la cola y se
            sincronizarán cuando recuperes conexión.
          </p>
        </div>

        {/* Info */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Características Implementadas
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>
                <strong>Error Boundary:</strong> Captura errores no controlados en componentes
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>
                <strong>Global Error Handler:</strong> Sistema centralizado de notificaciones de
                errores
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>
                <strong>Data Sync Manager:</strong> Cola de sincronización offline con reintentos
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>
                <strong>Detección de conexión:</strong> Monitoreo automático del estado online/offline
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>
                <strong>Persistencia:</strong> Las operaciones se guardan en localStorage
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SyncExample;
