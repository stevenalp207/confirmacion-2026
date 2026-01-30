import { useState, useEffect, useCallback } from 'react';
import { dataSyncManager } from '../utils/dataSyncManager';

/**
 * Hook para usar el Data Sync Manager
 * Proporciona acceso a las funcionalidades de sincronización
 */
export const useDataSync = () => {
  const [syncStatus, setSyncStatus] = useState(dataSyncManager.getQueueStatus());

  useEffect(() => {
    // Actualizar estado cuando hay cambios
    const unsubscribe = dataSyncManager.subscribe((event) => {
      setSyncStatus(dataSyncManager.getQueueStatus());
    });

    return unsubscribe;
  }, []);

  const addOperation = useCallback(
    (endpoint, data, method = 'POST', headers = {}) => {
      return dataSyncManager.addToQueue({
        endpoint,
        data,
        method,
        headers,
      });
    },
    []
  );

  const retryItem = useCallback((id) => {
    return dataSyncManager.retryItem(id);
  }, []);

  const removeItem = useCallback((id) => {
    dataSyncManager.removeItem(id);
  }, []);

  const clearQueue = useCallback(() => {
    dataSyncManager.clearQueue();
  }, []);

  const syncAll = useCallback(() => {
    return dataSyncManager.syncAll();
  }, []);

  return {
    ...syncStatus,
    addOperation,
    retryItem,
    removeItem,
    clearQueue,
    syncAll,
  };
};

export default useDataSync;
