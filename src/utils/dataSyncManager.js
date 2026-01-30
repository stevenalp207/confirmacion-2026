/**
 * Data Sync Manager
 * Gestiona la sincronización de datos entre cliente y servidor
 * Maneja cambios offline y los sincroniza cuando se restaura la conexión
 */

class DataSyncManager {
  constructor() {
    this.syncQueue = [];
    this.isSyncing = false;
    this.syncListeners = [];
    this.lastSyncTime = null;
    this.isOnline = navigator.onLine;
    this.storageKey = 'dataSyncQueue';
    this.loadFromStorage();
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('[DataSync] Conexión restaurada, iniciando sincronización...');
      this.syncAll();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('[DataSync] Modo offline activado');
      this.notifyListeners('offline');
    });
  }

  /**
   * Agregar una operación a la cola de sincronización
   */
  addToQueue(operation) {
    const syncItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...operation,
      status: 'pending',
      retries: 0,
      maxRetries: 3,
    };

    this.syncQueue.push(syncItem);
    this.saveToStorage();
    this.notifyListeners('itemAdded', syncItem);

    // Si estamos online, intentar sincronizar inmediatamente
    if (this.isOnline && !this.isSyncing) {
      this.syncAll();
    }

    return syncItem.id;
  }

  /**
   * Sincronizar todas las operaciones pendientes
   */
  async syncAll() {
    if (this.isSyncing || !this.isOnline) {
      return;
    }

    if (this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    this.notifyListeners('syncStart');

    console.log(`[DataSync] Iniciando sincronización de ${this.syncQueue.length} items...`);

    const pending = this.syncQueue.filter(item => item.status === 'pending');

    for (const item of pending) {
      try {
        await this.syncItem(item);
      } catch (error) {
        console.error(`[DataSync] Error al sincronizar item ${item.id}:`, error);
        this.notifyListeners('syncError', { item, error });
      }
    }

    this.isSyncing = false;
    this.lastSyncTime = new Date();
    this.notifyListeners('syncEnd', { timestamp: this.lastSyncTime });

    // Limpiar items completados
    this.syncQueue = this.syncQueue.filter(item => item.status !== 'completed');
    this.saveToStorage();
  }

  /**
   * Sincronizar un item individual
   */
  async syncItem(item) {
    try {
      const response = await fetch(item.endpoint, {
        method: item.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...item.headers,
        },
        body: JSON.stringify(item.data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Actualizar estado del item
      item.status = 'completed';
      item.response = result;

      console.log(`[DataSync] Item ${item.id} sincronizado correctamente`);
      this.notifyListeners('itemSynced', item);

      return result;
    } catch (error) {
      item.retries++;

      if (item.retries < item.maxRetries) {
        item.status = 'pending';
        console.log(
          `[DataSync] Reintentando item ${item.id} (intento ${item.retries}/${item.maxRetries})`
        );
      } else {
        item.status = 'failed';
        item.error = error.message;
        console.error(`[DataSync] Item ${item.id} falló después de ${item.maxRetries} reintentos`);
      }

      throw error;
    }
  }

  /**
   * Obtener estado de la cola
   */
  getQueueStatus() {
    const pending = this.syncQueue.filter(item => item.status === 'pending').length;
    const completed = this.syncQueue.filter(item => item.status === 'completed').length;
    const failed = this.syncQueue.filter(item => item.status === 'failed').length;

    return {
      total: this.syncQueue.length,
      pending,
      completed,
      failed,
      isSyncing: this.isSyncing,
      isOnline: this.isOnline,
      lastSyncTime: this.lastSyncTime,
      items: this.syncQueue,
    };
  }

  /**
   * Guardar cola en localStorage
   */
  saveToStorage() {
    try {
      const data = this.syncQueue.filter(item => item.status !== 'completed');
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('[DataSync] Error al guardar en localStorage:', error);
    }
  }

  /**
   * Cargar cola desde localStorage
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        this.syncQueue = JSON.parse(data);
        console.log(`[DataSync] Cargados ${this.syncQueue.length} items del almacenamiento`);
      }
    } catch (error) {
      console.error('[DataSync] Error al cargar del localStorage:', error);
    }
  }

  /**
   * Limpiar un item específico
   */
  removeItem(id) {
    this.syncQueue = this.syncQueue.filter(item => item.id !== id);
    this.saveToStorage();
    this.notifyListeners('itemRemoved', { id });
  }

  /**
   * Limpiar toda la cola
   */
  clearQueue() {
    this.syncQueue = [];
    this.saveToStorage();
    this.notifyListeners('queueCleared');
  }

  /**
   * Suscribirse a cambios
   */
  subscribe(listener) {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notificar a todos los listeners
   */
  notifyListeners(event, data) {
    this.syncListeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('[DataSync] Error en listener:', error);
      }
    });
  }

  /**
   * Obtener estado de un item específico
   */
  getItemStatus(id) {
    return this.syncQueue.find(item => item.id === id);
  }

  /**
   * Reintentar un item que falló
   */
  async retryItem(id) {
    const item = this.syncQueue.find(item => item.id === id);
    if (!item) return;

    item.status = 'pending';
    item.retries = 0;

    if (this.isOnline) {
      await this.syncItem(item);
    }
  }
}

// Crear instancia global única
export const dataSyncManager = new DataSyncManager();

export default DataSyncManager;
