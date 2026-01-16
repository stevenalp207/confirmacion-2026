import logo from '../assets/logo.png';
import { 
  CheckCircle, 
  Users, 
  FileText, 
  GraduationCap, 
  BedDouble, 
  Mail, 
  DollarSign, 
  ArrowRight 
} from 'lucide-react';
import NotificationManager from '../components/NotificationManager';

function ModuleSelector({ onSelectModule, user, onLogout }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with User Info */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <img src={logo} alt="Logo Confirmación" className="h-10 sm:h-12 w-auto" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Confirmación 2026</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Bienvenido: <span className="font-semibold">{user?.usuario}</span>
                  {user?.rol === 'admin' && (
                    <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">
                      ADMIN
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationManager />
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm sm:text-base whitespace-nowrap"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        {/* Content Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
            Selecciona un módulo
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-4">
            {user?.rol === 'admin' 
              ? 'Tienes acceso a todos los módulos y grupos'
              : `Acceso limitado al grupo: ${user?.rol}`
            }
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* Asistencia Module */}
          <div
            onClick={() => onSelectModule('asistencia')}
            className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer p-4 sm:p-6 lg:p-8"
          >
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-green-600 mb-3 sm:mb-4" strokeWidth={1.5} />
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                Asistencia
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                Registra la asistencia de los estudiantes en las reuniones de jueves
              </p>
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 text-green-600">
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          {/* Catequistas Module - Only for admin and logistica */}
          {(user?.rol === 'admin' || user?.usuario === 'logistica') && (
            <div
              onClick={() => onSelectModule('catequistas')}
              className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer p-4 sm:p-6 lg:p-8"
            >
              <div className="flex flex-col items-center text-center">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-blue-600 mb-3 sm:mb-4" strokeWidth={1.5} />
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Catequistas
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                  Registra la asistencia de todos los catequistas
                </p>
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 text-blue-600">
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Documentos Module */}
          <div
            onClick={() => onSelectModule('documentos')}
            className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer p-4 sm:p-6 lg:p-8"
          >
            <div className="flex flex-col items-center text-center">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-blue-600 mb-3 sm:mb-4" strokeWidth={1.5} />
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                Documentos
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                Controla la entrega de documentos requeridos para la confirmación
              </p>
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 text-blue-600">
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          {/* Estudiantes Module */}
          <div
            onClick={() => onSelectModule('estudiantes')}
            className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer p-8"
          >
            <div className="flex flex-col items-center text-center">
              <GraduationCap className="w-20 h-20 text-cyan-600 mb-4" strokeWidth={1.5} />
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Estudiantes
              </h2>
              <p className="text-gray-600 mb-6">
                Consulta información y estado de todos los estudiantes
              </p>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 text-cyan-600">
                <ArrowRight className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Sábanas Module - Only for admin and logistica */}
          {(user?.rol === 'admin' || user?.usuario === 'logistica') && (
            <div
              onClick={() => onSelectModule('sabanas')}
              className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer p-8"
            >
              <div className="flex flex-col items-center text-center">
                <BedDouble className="w-20 h-20 text-orange-600 mb-4" strokeWidth={1.5} />
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Sábanas
                </h2>
                <p className="text-gray-600 mb-6">
                  Registra la entrega de sábanas de los estudiantes
                </p>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Cartas Module - Only for admin and logistica */}
          {(user?.rol === 'admin' || user?.usuario === 'logistica') && (
            <div
              onClick={() => onSelectModule('cartas')}
              className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer p-8"
            >
              <div className="flex flex-col items-center text-center">
                <Mail className="w-20 h-20 text-purple-600 mb-4" strokeWidth={1.5} />
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Cartas
                </h2>
                <p className="text-gray-600 mb-6">
                  Registra la entrega de cartas de los estudiantes
                </p>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Pagos Module - Only for admin and logistica */}
          {(user?.rol === 'admin' || user?.usuario === 'logistica') && (
            <div
              onClick={() => onSelectModule('pagos')}
              className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer p-8"
            >
              <div className="flex flex-col items-center text-center">
                <DollarSign className="w-20 h-20 text-blue-600 mb-4" strokeWidth={1.5} />
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Pagos
                </h2>
                <p className="text-gray-600 mb-6">
                  Controla los pagos del retiro (₡50.000 por estudiante)
                </p>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 text-sm">
          <p>Haz clic en un módulo para comenzar</p>
        </div>
      </div>
    </div>
  );
}

export default ModuleSelector;
