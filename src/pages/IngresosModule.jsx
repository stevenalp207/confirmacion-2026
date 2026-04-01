import { ArrowLeft, TrendingUp } from 'lucide-react';
import IngresosFinancieros from '../components/IngresosFinancieros';
import { canAccess } from '../utils/permissions';

function IngresosModule({ onBack, user }) {
  const canAccessIngresos = canAccess('ingresos', user);

  if (!canAccessIngresos) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-lg w-full text-center space-y-4">
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
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-semibold transition mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Volver al Menú Principal
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="text-center mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2 sm:gap-3">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                Ingresos
              </h1>
              <p className="text-gray-600 mt-2 text-xs sm:text-sm lg:text-base">
                Gestiona los ingresos financieros
              </p>
              {user && (
                <p className="text-gray-600 text-xs sm:text-sm mt-2">
                  Usuario: <span className="font-semibold">{user.usuario}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
          <IngresosFinancieros user={user} />
        </div>
      </div>
    </div>
  );
}

export default IngresosModule;
