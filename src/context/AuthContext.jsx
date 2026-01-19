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
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('usuario', usuario)
        .eq('contraseña', contraseña)
        .single();

      if (error || !data) {
        return { success: false, error: 'Usuario o contraseña incorrectos' };
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
      return { success: false, error: 'Error al iniciar sesión' };
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
