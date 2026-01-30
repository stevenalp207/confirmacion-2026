import { useError } from '../context/ErrorContext';
import { useDataSync } from '../hooks/useDataSync';

/**
 * Hook para integrar facilmente Data Sync con Supabase
 * Maneja automáticamente errores y sincronización
 */
export const useSupabaseSync = () => {
  const { addError } = useError();
  const { addOperation } = useDataSync();

  /**
   * Agregar/actualizar un registro en Supabase con sincronización
   */
  const syncInsertOrUpdate = async (table, data, method = 'POST') => {
    try {
      // Agregar a cola de sincronización
      addOperation(
        `/api/supabase/${table}`,
        data,
        method,
        {
          'Content-Type': 'application/json',
        }
      );

      addError({
        type: 'success',
        message: `Cambios en ${table} guardados`,
        autoClose: 2000,
      });
    } catch (error) {
      addError({
        type: 'error',
        message: `Error al guardar en ${table}: ${error.message}`,
        autoClose: 5000,
      });
      throw error;
    }
  };

  /**
   * Eliminar un registro con sincronización
   */
  const syncDelete = async (table, id) => {
    try {
      addOperation(
        `/api/supabase/${table}/${id}`,
        { id },
        'DELETE'
      );

      addError({
        type: 'success',
        message: `Registro eliminado de ${table}`,
        autoClose: 2000,
      });
    } catch (error) {
      addError({
        type: 'error',
        message: `Error al eliminar de ${table}: ${error.message}`,
        autoClose: 5000,
      });
      throw error;
    }
  };

  /**
   * Operación genérica con sincronización
   */
  const syncOperation = async (endpoint, data, method = 'POST', description = 'Operación') => {
    try {
      addOperation(endpoint, data, method);

      addError({
        type: 'success',
        message: `${description} guardada`,
        autoClose: 2000,
      });
    } catch (error) {
      addError({
        type: 'error',
        message: `Error en ${description}: ${error.message}`,
        autoClose: 5000,
      });
      throw error;
    }
  };

  return {
    syncInsertOrUpdate,
    syncDelete,
    syncOperation,
  };
};

/**
 * Hook para manejo consistente de errores
 */
export const useErrorHandler = () => {
  const { addError } = useError();

  const handleError = (error, defaultMessage = 'Algo salió mal') => {
    let message = defaultMessage;
    let type = 'error';

    // Manejo específico por tipo de error
    if (error.message) {
      message = error.message;
    }

    if (error.code === 'PGRST116') {
      message = 'Registro no encontrado';
    } else if (error.code === 'PGRST301') {
      message = 'No tienes permisos para esta operación';
    } else if (error.code === 'PGRST302') {
      message = 'Acceso prohibido';
    } else if (error.status === 404) {
      message = 'Recurso no encontrado';
    } else if (error.status === 401) {
      message = 'Sesión expirada, por favor inicia sesión';
      type = 'warning';
    } else if (error.status === 403) {
      message = 'No tienes permisos para acceder a esto';
    } else if (error.status >= 500) {
      message = 'Error en el servidor, intenta más tarde';
    } else if (error.status >= 400) {
      message = 'Error en la solicitud';
    }

    addError({
      type,
      message,
      data: process.env.NODE_ENV === 'development' ? error : null,
      autoClose: 5000,
    });

    console.error(`[ErrorHandler] ${type}:`, error);
  };

  const handleSuccess = (message = 'Operación completada', duration = 2000) => {
    addError({
      type: 'success',
      message,
      autoClose: duration,
    });
  };

  const handleWarning = (message, duration = 3000) => {
    addError({
      type: 'warning',
      message,
      autoClose: duration,
    });
  };

  const handleInfo = (message, duration = 3000) => {
    addError({
      type: 'info',
      message,
      autoClose: duration,
    });
  };

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
  };
};

/**
 * Envoltorio para fetch con manejo automático de errores
 */
export const useSafeAPI = () => {
  const { handleError } = useErrorHandler();

  const safeFetch = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      handleError(error);
      return { success: false, error };
    }
  };

  return { safeFetch };
};

export default useSupabaseSync;
