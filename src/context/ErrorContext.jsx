import { createContext, useContext, useCallback, useState, useEffect } from 'react';

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitorear conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addError({
        type: 'info',
        message: 'Conexión restaurada',
        autoClose: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      addError({
        type: 'warning',
        message: 'Sin conexión a internet',
        persist: true,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addError = useCallback((error) => {
    const id = Date.now();
    const errorObj = {
      id,
      timestamp: new Date(),
      ...error,
    };

    setErrors(prev => [...prev, errorObj]);

    // Auto-cerrar error si se especifica
    if (error.autoClose) {
      setTimeout(() => {
        removeError(id);
      }, error.autoClose);
    }

    console.error(`[${error.type?.toUpperCase()}]`, error.message, error.data);

    return id;
  }, []);

  const removeError = useCallback((id) => {
    setErrors(prev => prev.filter(err => err.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Manejo de errores no capturados
  useEffect(() => {
    const handleError = (event) => {
      addError({
        type: 'error',
        message: event.message || 'Error no capturado',
        data: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        autoClose: 5000,
      });
    };

    const handleUnhandledRejection = (event) => {
      addError({
        type: 'error',
        message: event.reason?.message || 'Promise rechazada sin manejo',
        data: event.reason,
        autoClose: 5000,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [addError]);

  return (
    <ErrorContext.Provider
      value={{
        errors,
        addError,
        removeError,
        clearErrors,
        isOnline,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError debe usarse dentro de ErrorProvider');
  }
  return context;
};
