import { Lock, ArrowLeft } from 'lucide-react';
import GastosFinancieros from '../components/GastosFinancieros';

function GastosModule({ onBack, user }) {
  const canAccess = user?.rol === 'admin' || user?.rol === 'financiero';

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-lg w-full text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Acceso restringido</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Este módulo está disponible solo para usuarios con rol administrador o financiero.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
      {/* Navbar */}
      <nav className="bg-rose-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 sm:py-0 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={onBack}
                className="hover:bg-rose-500 px-2 sm:px-3 py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                ← Atrás
              </button>
              <h1 className="text-base sm:text-lg lg:text-xl font-bold">
                Control de Gastos - Confirmación 2026
              </h1>
            </div>
            <div className="text-sm sm:text-base text-rose-100">
              Rol: <span className="font-semibold">{user?.rol}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border border-rose-100">
          <GastosFinancieros user={user} />
        </div>
      </div>
    </div>
  );
}

export default GastosModule;
