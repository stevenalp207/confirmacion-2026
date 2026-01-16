import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!usuario || !contraseña) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    const result = await login(usuario, contraseña);
    
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Confirmación 2026
          </h1>
          <p className="text-gray-600">
            Sistema de Control
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Usuario Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ingresa tu usuario"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
              disabled={loading}
            />
          </div>

          {/* Contraseña Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Demo Info */}
        <div className="mt-8 pt-8 border-t-2 border-gray-200">
          <p className="text-xs text-gray-600 mb-3 font-semibold">
            Usuarios de prueba:
          </p>
          <div className="text-xs text-gray-700 space-y-2">
            <p><strong>Acceso a grupo:</strong> usuario: consejo / contraseña: confi2026</p>
            <p><strong>Acceso total:</strong> usuario: logistica / contraseña: logistica2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
