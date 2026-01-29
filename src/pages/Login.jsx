import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import fondo from '../assets/fondo3.jpeg';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

function Login() {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usuarioValido, setUsuarioValido] = useState(false);
  const { login, savedAccounts, switchAccount, removeSavedAccount } = useAuth();
  const hasQuickAccess = (savedAccounts?.length || 0) > 0;

  const validarUsuario = (valor) => {
    setUsuario(valor);
    setUsuarioValido(valor.trim().length > 0);
  };

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

  const handleQuickSwitch = (usuarioSeleccionado) => {
    setError('');
    setLoading(true);
    const result = switchAccount(usuarioSeleccionado);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative bg-cover bg-bottom" style={{ backgroundImage: `url(${fondo})`}}>
      <div className="absolute inset-0 bg-linear-to-br from-blue-900/70 to-blue-950/80"></div>
      <div className={`relative z-10 w-full ${hasQuickAccess ? 'max-w-5xl' : 'max-w-md'}`}>
        <div className={hasQuickAccess ? 'grid gap-6 md:grid-cols-2 items-stretch' : 'flex justify-center'}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 w-full h-full transform transition-all duration-300 hover:shadow-3xl">
            {/* Header con animación */}
            <div className="text-center mb-6 sm:mb-8 animate-fade-in">
              <div className="flex justify-center mb-4">
                <img src={logo} alt="Logo Confirmación" className="h-20 sm:h-24 md:h-28 w-auto drop-shadow-lg" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Confirmación 2026
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Sistema de Control Integral
              </p>
            </div>

            {/* Form mejorado */}
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Usuario Input */}
              <div className="group">
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 group-focus-within:text-blue-600 transition">
                  👤 Usuario
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={usuario}
                    onChange={(e) => validarUsuario(e.target.value)}
                    placeholder="ej: admin"
                    className="w-full px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-300 bg-white"
                    disabled={loading}
                    autoComplete="username"
                  />
                  {usuarioValido && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-fade-in" />
                  )}
                </div>
              </div>

              {/* Contraseña Input */}
              <div className="group">
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 group-focus-within:text-blue-600 transition">
                  🔐 Contraseña
                </label>
                <div className="relative">
                  <input
                    type={mostrarContraseña ? "text" : "password"}
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="w-full px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-300 bg-white pr-12"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarContraseña(!mostrarContraseña)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                    disabled={loading}
                    title={mostrarContraseña ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {mostrarContraseña ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message mejorado */}
              {error && (
                <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 sm:px-5 py-3 rounded-lg text-xs sm:text-sm flex items-start gap-3 animate-fade-in shadow-sm">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Submit Button mejorado */}
              <button
                type="submit"
                disabled={loading || !usuario || !contraseña}
                className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white font-bold py-3 sm:py-3.5 px-4 rounded-lg text-sm sm:text-base hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Iniciando sesión...
                  </>
                ) : (
                  <>✨ Iniciar Sesión</>
                )}
              </button>
            </form>

            {/* Demo Info mejorada */}
            <div className="mt-8 pt-8 border-t-2 border-gray-200">
              <details className="cursor-pointer group">
                <summary className="text-xs sm:text-sm font-bold text-gray-700 hover:text-blue-600 transition select-none flex items-center gap-2">
                  <span className="group-open:rotate-90 transition duration-300">▶</span>
                  ℹ️ Usuarios de Prueba
                </summary>
                <div className="text-xs sm:text-sm text-gray-700 space-y-3 mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="bg-white p-2 rounded border-l-4 border-green-500">
                    <p className="font-semibold text-gray-800">Grupo:</p>
                    <p><code className="bg-gray-100 px-2 py-1 rounded text-green-700">consejo</code> / <code className="bg-gray-100 px-2 py-1 rounded text-green-700">confi2026</code></p>
                  </div>
                </div>
              </details>
            </div>
          </div>

          {hasQuickAccess && (
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 w-full h-full">
              <div className="flex items-center justify-between mb-4">
                <p className="text-base sm:text-lg font-bold text-blue-900">Acceso Rápido</p>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Dispositivo</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Accede rápidamente con tus cuentas guardadas.
              </p>
              <div className="space-y-3">
                {savedAccounts.map((account) => (
                  <div
                    key={account.usuario}
                    className="flex items-center justify-between gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl"
                  >
                    <button
                      type="button"
                      onClick={() => handleQuickSwitch(account.usuario)}
                      className="flex-1 text-left"
                      disabled={loading}
                      title={`Inicia sesión como ${account.usuario}`}
                    >
                      <p className="font-semibold text-blue-900">{account.usuario}</p>
                      <p className="text-xs text-blue-700">Rol: {account.rol}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSavedAccount(account.usuario)}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-white transition-colors duration-150"
                      aria-label={`Eliminar ${account.usuario}`}
                      disabled={loading}
                      title="Eliminar cuenta guardada"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
}

export default Login;
