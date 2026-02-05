import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedAccounts, setSavedAccounts] = useState([]);

  useEffect(() => {
    // Restaurar sesión y cuentas guardadas al cargar
    const storedUser = localStorage.getItem('user');
    const storedAccounts = localStorage.getItem('savedAccounts');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedAccounts) {
      setSavedAccounts(JSON.parse(storedAccounts));
    }

    setLoading(false);
  }, []);

  const login = async (usuario, contraseña) => {
    try {
      // Limpiar espacios en blanco
      const usuarioLimpio = usuario.trim();
      const contraseñaLimpia = contraseña.trim();

      // Verificar conexión a internet primero
      if (!navigator.onLine) {
        return { success: false, error: 'No hay conexión a internet. Verifica tu conexión y vuelve a intentar.' };
      }

      console.log('Intentando login para usuario:', usuarioLimpio);

      // Timeout de 15 segundos para la conexión
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), 15000)
      );

      // Buscar solo por usuario para evitar problemas de encoding con "contraseña"
      const queryPromise = supabase
        .from('usuarios')
        .select('*')
        .eq('usuario', usuarioLimpio)
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      
      console.log('Respuesta de Supabase:', { data: data ? 'encontrado' : 'no encontrado', error: error?.message || 'ninguno' });

      if (error) {
        console.error('Error de Supabase:', error);
        
        // Mensajes más específicos según el tipo de error
        if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
          return { success: false, error: 'Error de conexión. Tu red puede estar bloqueando el acceso al servidor. Intenta con WiFi o datos móviles.' };
        }
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Usuario no encontrado' };
        }
        return { success: false, error: 'Error al conectar con el servidor. Intenta de nuevo.' };
      }

      if (!data) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      // Verificar contraseña localmente (evita problemas de encoding)
      if (data.contraseña !== contraseñaLimpia) {
        console.log('Contraseña incorrecta');
        return { success: false, error: 'Contraseña incorrecta' };
      }

      const userData = {
        id: data.id,
        usuario: data.usuario,
        rol: data.rol
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      setSavedAccounts((prev) => {
        const updated = prev.some((account) => account.id === userData.id)
          ? prev.map((account) => (account.id === userData.id ? userData : account))
          : [...prev, userData];

        localStorage.setItem('savedAccounts', JSON.stringify(updated));
        return updated;
      });

      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      
      if (error.message === 'TIMEOUT') {
        return { success: false, error: 'La conexión tardó demasiado. Tu red puede estar lenta o bloqueando el acceso.' };
      }
      
      if (error.name === 'TypeError' && error.message?.includes('fetch')) {
        return { success: false, error: 'No se puede conectar al servidor. Verifica tu conexión a internet.' };
      }
      
      return { success: false, error: `Error al iniciar sesión: ${error.message || 'Error desconocido'}` };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const switchAccount = (usuario) => {
    const account = savedAccounts.find((item) => item.usuario === usuario);

    if (!account) {
      return { success: false, error: 'Cuenta no encontrada' };
    }

    setUser(account);
    localStorage.setItem('user', JSON.stringify(account));
    return { success: true };
  };

  const removeSavedAccount = (usuario) => {
    setSavedAccounts((prev) => {
      const updated = prev.filter((item) => item.usuario !== usuario);
      localStorage.setItem('savedAccounts', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, savedAccounts, switchAccount, removeSavedAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
