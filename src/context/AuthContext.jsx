import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restaurar sesión al cargar
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
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

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
