import { useEffect, useState } from 'react';
import logo from '../assets/logo.png';
import { 
  CheckCircle, 
  Users, 
  FileText, 
  GraduationCap, 
  BedDouble, 
  Mail, 
  DollarSign, 
  ArrowRight,
  Wallet,
  BookOpen,
  FileCheck,
  Calendar,
  Shuffle,
  User,
  X,
  LogOut,
  UserCheck
} from 'lucide-react';
import NotificationManager from '../components/NotificationManager';
import OnboardingTutorial from '../components/OnboardingTutorial';
import { useOnboarding } from '../hooks/useOnboarding';

function ModuleSelector({ onSelectModule, user, onLogout, savedAccounts, onSwitchAccount, onRemoveAccount }) {
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  
  // Onboarding tutorial
  const { shouldShowOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

  useEffect(() => {
    if (showSwitcher) {
      // start enter animation on mount
      const id = requestAnimationFrame(() => setSheetVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setSheetVisible(false);
    }
  }, [showSwitcher]);

  const closeSwitcher = () => {
    // play exit animation then unmount
    setSheetVisible(false);
    setTimeout(() => setShowSwitcher(false), 200);
  };

  const handleSwitch = (usuario) => {
    onSwitchAccount(usuario);
    setShowSwitcher(false);
  };

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
            <div className="flex items-center gap-2">
              <NotificationManager />
              <div className="relative">
                <button
                  onClick={() => (showSwitcher ? closeSwitcher() : setShowSwitcher(true))}
                  className="p-2 bg-white border border-gray-200 text-gray-800 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition"
                  title="Cambiar cuenta"
                  aria-label="Cambiar cuenta"
                >
                  <User className="w-5 h-5" />
                </button>

                {showSwitcher && (
                  <>
                    {/* Desktop dropdown */}
                    <div className="hidden sm:block absolute top-full mt-2 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-2xl z-50">
                      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Cuentas guardadas</span>
                        <button
                          onClick={closeSwitcher}
                          className="text-gray-400 hover:text-gray-600"
                          aria-label="Cerrar selector"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                        {savedAccounts?.length ? (
                          savedAccounts.map((account) => (
                            <div key={account.usuario} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{account.usuario}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">{account.rol}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleSwitch(account.usuario)}
                                  className="text-blue-600 text-xs font-semibold hover:underline"
                                >
                                  Usar
                                </button>
                                <button
                                  onClick={() => onRemoveAccount(account.usuario)}
                                  className="text-gray-400 hover:text-gray-600"
                                  aria-label={`Quitar ${account.usuario}`}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No hay cuentas guardadas.</p>
                        )}
                      </div>
                    </div>

                    {/* Mobile bottom sheet */}
                    <div className="sm:hidden fixed inset-0 z-50">
                      {/* Backdrop */}
                      <div
                        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${sheetVisible ? 'opacity-100' : 'opacity-0'}`}
                        onClick={closeSwitcher}
                        aria-hidden="true"
                      />
                      {/* Sheet */}
                      <div className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-200 ${sheetVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                        <div className="pt-3 pb-2 flex justify-center">
                          <div className="h-1.5 w-10 bg-gray-300 rounded-full" />
                        </div>
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
                          <span className="text-sm sm:text-base font-semibold text-gray-800 flex-1 whitespace-nowrap">Cuentas guardadas</span>
                          <button
                            onClick={closeSwitcher}
                            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                            aria-label="Cerrar"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                          {savedAccounts?.length ? (
                            savedAccounts.map((account) => (
                              <button
                                key={account.usuario}
                                onClick={() => handleSwitch(account.usuario)}
                                className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
                              >
                                <div className="text-left">
                                  <p className="text-sm font-semibold text-gray-800">{account.usuario}</p>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide">{account.rol}</p>
                                </div>
                                <X
                                  onClick={(e) => { e.stopPropagation(); onRemoveAccount(account.usuario); }}
                                  className="w-4 h-4 text-gray-400 hover:text-gray-600"
                                  aria-label={`Quitar ${account.usuario}`}
                                />
                              </button>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No hay cuentas guardadas.</p>
                          )}
                        </div>
                        <div className="p-4 border-t border-gray-100">
                          <button
                            onClick={closeSwitcher}
                            className="w-full py-3 bg-gray-100 text-gray-800 font-semibold rounded-lg"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={onLogout}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
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
              : user?.rol === 'financiero'
              ? 'Acceso a pagos, ingresos y control de gastos'
              : user?.rol === 'formacion'
              ? 'Registra asistencia de las 15 formaciones del retiro'
              : `Acceso limitado al grupo: ${user?.rol}`}
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* Asistencia Module */}
          {user?.rol !== 'financiero' && user?.rol !== 'formacion' && (
            <div
              onClick={() => onSelectModule('asistencia')}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-1 cursor-pointer p-4 sm:p-6 lg:p-8 group animate-fade-in border border-transparent hover:border-green-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 sm:p-4 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors mb-3 sm:mb-4">
                  <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-green-600 group-hover:animate-bounce-sm" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Asistencia
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                  Registra la asistencia de los estudiantes en las reuniones de jueves
                </p>
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white group-hover:animate-pop-in transition-all">
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Catequistas Module - Only for admin and logistica */}
          {(user?.rol === 'admin' || user?.usuario === 'logistica' || user?.rol === 'formacion') && (
            <div
              onClick={() => onSelectModule('catequistas')}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-1 cursor-pointer p-4 sm:p-6 lg:p-8 group animate-fade-in border border-transparent hover:border-blue-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 sm:p-4 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors mb-3 sm:mb-4">
                  <Users className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-blue-600 group-hover:animate-bounce-sm" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Catequistas
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                  Registra la asistencia de todos los catequistas
                </p>
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:animate-pop-in transition-all">
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Documentos Module */}
          {user?.rol !== 'financiero' && user?.rol !== 'formacion' && (
            <div
              onClick={() => onSelectModule('documentos')}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-1 cursor-pointer p-4 sm:p-6 lg:p-8 group animate-fade-in border border-transparent hover:border-blue-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 sm:p-4 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors mb-3 sm:mb-4">
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-blue-600 group-hover:animate-bounce-sm" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Documentos
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                  Controla la entrega de documentos requeridos para la confirmación
                </p>
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:animate-pop-in transition-all">
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Estudiantes Module */}
          {user?.rol !== 'financiero' && user?.rol !== 'formacion' && (
            <div
              onClick={() => onSelectModule('estudiantes')}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-1 cursor-pointer p-4 sm:p-6 lg:p-8 group animate-fade-in border border-transparent hover:border-cyan-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 sm:p-4 rounded-full bg-cyan-100 group-hover:bg-cyan-200 transition-colors mb-3 sm:mb-4">
                  <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-cyan-600 group-hover:animate-bounce-sm" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Estudiantes
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                  Consulta información y estado de todos los estudiantes
                </p>
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white group-hover:animate-pop-in transition-all">
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Calendario Module - visible para todos los roles */}
          <div
            onClick={() => onSelectModule('calendario')}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-1 cursor-pointer p-4 sm:p-6 lg:p-8 group animate-fade-in border border-transparent hover:border-violet-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-3 sm:p-4 rounded-full bg-violet-100 group-hover:bg-violet-200 transition-colors mb-3 sm:mb-4">
                <Calendar className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-violet-600 group-hover:animate-bounce-sm" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                Calendario
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                Cronograma completo de eventos, catequesis y actividades 2026
              </p>
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white group-hover:animate-pop-in transition-all">
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          {/* Sábanas Module - Only for admin and logistica */}
          {(user?.rol === 'admin' || user?.usuario === 'logistica') && (
            <div
              onClick={() => onSelectModule('sabanas')}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-1 cursor-pointer p-4 sm:p-6 lg:p-8 group animate-fade-in border border-transparent hover:border-orange-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 sm:p-4 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors mb-3 sm:mb-4">
                  <BedDouble className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-orange-600 group-hover:animate-bounce-sm" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Sábanas
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                  Registra la entrega de sábanas de los estudiantes
                </p>
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white group-hover:animate-pop-in transition-all">
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Cartas Module - Only for admin and logistica */}
          {(user?.rol === 'admin' || user?.usuario === 'logistica') && (
            <div
              onClick={() => onSelectModule('cartas')}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-1 cursor-pointer p-4 sm:p-6 lg:p-8 group animate-fade-in border border-transparent hover:border-purple-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 sm:p-4 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors mb-3 sm:mb-4">
                  <Mail className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-purple-600 group-hover:animate-bounce-sm" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Cartas
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                  Registra la entrega de cartas de los estudiantes
                </p>
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white group-hover:animate-pop-in transition-all">
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Pagos Module - admin, financiero y usuarios de grupos */}
          {(user?.rol === 'admin' || user?.rol === 'financiero' || ['Ciencia', 'Piedad', 'Fortaleza', 'Consejo', 'Entendimiento', 'Sabiduría', 'Temor de Dios'].includes(user?.rol)) && (
            <div
              onClick={() => onSelectModule('pagos')}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-1 cursor-pointer p-4 sm:p-6 lg:p-8 group animate-fade-in border border-transparent hover:border-blue-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 sm:p-4 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors mb-3 sm:mb-4">
                  <DollarSign className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-blue-600 group-hover:animate-bounce-sm" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Pagos
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                  {user?.rol === 'financiero'
                    ? 'Controla los pagos del retiro'
                    : 'Controla los pagos del retiro (₡50.000 por estudiante)'}
                </p>
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:animate-pop-in transition-all">
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Ingresos Module - solo financiero y admin */}
          {(user?.rol === 'admin' || user?.rol === 'financiero') && (
            <div
              onClick={() => onSelectModule('ingresos')}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-1 cursor-pointer p-4 sm:p-6 lg:p-8 group animate-fade-in border border-transparent hover:border-emerald-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 sm:p-4 rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors mb-3 sm:mb-4">
                  <Wallet className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-emerald-600 group-hover:animate-bounce-sm" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Ingresos
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                  Registra entradas y método: sinpe, efectivo o transferencia
                </p>
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:animate-pop-in transition-all">
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Gastos Module - solo financiero y admin */}
          {(user?.rol === 'admin' || user?.rol === 'financiero') && (
            <div
              onClick={() => onSelectModule('gastos')}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-1 cursor-pointer p-4 sm:p-6 lg:p-8 group animate-fade-in border border-transparent hover:border-rose-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 sm:p-4 rounded-full bg-rose-100 group-hover:bg-rose-200 transition-colors mb-3 sm:mb-4">
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-rose-600 group-hover:animate-bounce-sm" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Gastos
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                  Control de gastos y reportes financieros
                </p>
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white group-hover:animate-pop-in transition-all">
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Formacion Module - admin y rol formacion */}
          {(user?.rol === 'admin' || user?.rol === 'formacion') && (
            <div
              onClick={() => onSelectModule('formacion')}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-1 cursor-pointer p-4 sm:p-6 lg:p-8 group animate-fade-in border border-transparent hover:border-indigo-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 sm:p-4 rounded-full bg-indigo-100 group-hover:bg-indigo-200 transition-colors mb-3 sm:mb-4">
                  <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-indigo-600 group-hover:animate-bounce-sm" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Formación
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                  Registra la asistencia de las 15 formaciones del retiro
                </p>
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:animate-pop-in transition-all">
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Boletas Module - solo admin */}
          {user?.rol === 'admin' && (
            <div
              onClick={() => onSelectModule('boletas')}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-1 cursor-pointer p-4 sm:p-6 lg:p-8 group animate-fade-in border border-transparent hover:border-teal-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 sm:p-4 rounded-full bg-teal-100 group-hover:bg-teal-200 transition-colors mb-3 sm:mb-4">
                  <FileCheck className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-teal-600 group-hover:animate-bounce-sm" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Boletas
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                  Genera boletas de confirmación en formato Word
                </p>
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white group-hover:animate-pop-in transition-all">
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Group Assignment Module - para logistica */}
          {user?.usuario === 'logistica' && (
            <div
              onClick={() => onSelectModule('asignacion-grupos')}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-1 cursor-pointer p-4 sm:p-6 lg:p-8 group animate-fade-in border border-transparent hover:border-amber-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 sm:p-4 rounded-full bg-amber-100 group-hover:bg-amber-200 transition-colors mb-3 sm:mb-4">
                  <Shuffle className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-amber-600 group-hover:animate-bounce-sm" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Asignación de Grupos
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                  Sistema automático para distribuir estudiantes equilibradamente
                </p>
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white group-hover:animate-pop-in transition-all">
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Personality Assignment Module - para logistica */}
          {user?.usuario === 'logistica' && (
            <div
              onClick={() => onSelectModule('asignacion-personalidad')}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-1 cursor-pointer p-4 sm:p-6 lg:p-8 group animate-fade-in border border-transparent hover:border-pink-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 sm:p-4 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors mb-3 sm:mb-4">
                  <UserCheck className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-pink-600 group-hover:animate-bounce-sm" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Asignación por Personalidad
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                  Distribuye grupos balanceando introvertidos y extrovertidos
                </p>
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white group-hover:animate-pop-in transition-all">
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
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

      {/* Onboarding Tutorial */}
      {shouldShowOnboarding && (
        <OnboardingTutorial
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      )}
    </div>
  );
}

export default ModuleSelector;
