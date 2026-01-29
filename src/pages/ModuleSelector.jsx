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
  UserCheck,
  TrendingUp,
  Activity
} from 'lucide-react';
import OnboardingTutorial from '../components/OnboardingTutorial';
import { useOnboarding } from '../hooks/useOnboarding';

function ModuleSelector({ onSelectModule, user }) {
  // Onboarding tutorial
  const { shouldShowOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

  // Quick stats
  const getQuickStats = () => {
    return [
      { label: 'Estudiantes', value: '~180', color: 'cyan' },
      { label: 'Grupos', value: '7', color: 'blue' },
      { label: 'Catequistas', value: '~30', color: 'indigo' }
    ];
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <img src={logo} alt="Logo Confirmación" className="h-16 w-16 shadow-lg rounded-xl" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Confirmación 2026
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">Sistema de gestión integral</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Bienvenido, {user?.usuario}
            </h2>
            <p className="text-gray-600">
              {user?.rol === 'admin' 
                ? 'Tienes acceso completo a todos los módulos del sistema'
                : user?.rol === 'financiero'
                ? 'Gestiona pagos, ingresos y control financiero'
                : user?.rol === 'formacion'
                ? 'Administra las formaciones del retiro'
                : user?.usuario === 'logistica'
                ? 'Coordina logística y asignación de grupos'
                : `Gestiona tu grupo: ${user?.rol}`}
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {getQuickStats().map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Módulos disponibles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Asistencia Module */}
            {user?.rol !== 'financiero' && user?.rol !== 'formacion' && (
              <ModuleCard
                onClick={() => onSelectModule('asistencia')}
                icon={CheckCircle}
                title="Asistencia"
                description="Registro de asistencia en reuniones"
                color="green"
              />
            )}

            {/* Catequistas Module */}
            {(user?.rol === 'admin' || user?.usuario === 'logistica' || user?.rol === 'formacion') && (
              <ModuleCard
                onClick={() => onSelectModule('catequistas')}
                icon={Users}
                title="Catequistas"
                description="Asistencia de catequistas"
                color="blue"
              />
            )}

            {/* Documentos Module */}
            {user?.rol !== 'financiero' && user?.rol !== 'formacion' && (
              <ModuleCard
                onClick={() => onSelectModule('documentos')}
                icon={FileText}
                title="Documentos"
                description="Control de documentos"
                color="blue"
              />
            )}

            {/* Estudiantes Module */}
            {user?.rol !== 'financiero' && user?.rol !== 'formacion' && (
              <ModuleCard
                onClick={() => onSelectModule('estudiantes')}
                icon={GraduationCap}
                title="Estudiantes"
                description="Información de estudiantes"
                color="cyan"
              />
            )}

            {/* Calendario Module */}
            <ModuleCard
              onClick={() => onSelectModule('calendario')}
              icon={Calendar}
              title="Calendario"
              description="Cronograma de actividades"
              color="violet"
            />

            {/* Sábanas Module */}
            {(user?.rol === 'admin' || user?.usuario === 'logistica') && (
              <ModuleCard
                onClick={() => onSelectModule('sabanas')}
                icon={BedDouble}
                title="Sábanas"
                description="Registro de sábanas"
                color="orange"
              />
            )}

            {/* Cartas Module */}
            {(user?.rol === 'admin' || user?.usuario === 'logistica') && (
              <ModuleCard
                onClick={() => onSelectModule('cartas')}
                icon={Mail}
                title="Cartas"
                description="Entrega de cartas"
                color="purple"
              />
            )}

            {/* Pagos Module */}
            {(user?.rol === 'admin' || user?.rol === 'financiero' || 
              ['Ciencia', 'Piedad', 'Fortaleza', 'Consejo', 'Entendimiento', 'Sabiduría', 'Temor de Dios'].includes(user?.rol)) && (
              <ModuleCard
                onClick={() => onSelectModule('pagos')}
                icon={DollarSign}
                title="Pagos"
                description="Control de pagos del retiro"
                color="blue"
              />
            )}

            {/* Ingresos Module */}
            {(user?.rol === 'admin' || user?.rol === 'financiero') && (
              <ModuleCard
                onClick={() => onSelectModule('ingresos')}
                icon={Wallet}
                title="Ingresos"
                description="Registro de ingresos"
                color="emerald"
              />
            )}

            {/* Gastos Module */}
            {(user?.rol === 'admin' || user?.rol === 'financiero') && (
              <ModuleCard
                onClick={() => onSelectModule('gastos')}
                icon={TrendingUp}
                title="Gastos"
                description="Control de gastos"
                color="rose"
              />
            )}

            {/* Formacion Module */}
            {(user?.rol === 'admin' || user?.rol === 'formacion') && (
              <ModuleCard
                onClick={() => onSelectModule('formacion')}
                icon={BookOpen}
                title="Formación"
                description="Asistencia a formaciones"
                color="indigo"
              />
            )}

            {/* Boletas Module */}
            {user?.rol === 'admin' && (
              <ModuleCard
                onClick={() => onSelectModule('boletas')}
                icon={FileCheck}
                title="Boletas"
                description="Generar boletas"
                color="teal"
              />
            )}

            {/* Group Assignment Module */}
            {(user?.rol === 'admin' || user?.usuario === 'logistica') && (
              <ModuleCard
                onClick={() => onSelectModule('asignacion-grupos')}
                icon={Shuffle}
                title="Asignación Grupos"
                description="Distribuir estudiantes"
                color="amber"
              />
            )}

            {/* Personality Assignment Module */}
            {(user?.rol === 'admin' || user?.usuario === 'logistica') && (
              <ModuleCard
                onClick={() => onSelectModule('asignacion-personalidad')}
                icon={UserCheck}
                title="Asignación Personalidad"
                description="Balance personalidades"
                color="pink"
              />
            )}
          </div>
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

// Module Card Component
function ModuleCard({ onClick, icon: Icon, title, description, color }) {
  const colorClasses = {
    green: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:border-green-300',
    blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:border-blue-300',
    cyan: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-700 hover:border-cyan-300',
    violet: 'bg-violet-50 hover:bg-violet-100 border-violet-200 text-violet-700 hover:border-violet-300',
    orange: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 hover:border-orange-300',
    purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 hover:border-purple-300',
    emerald: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 hover:border-emerald-300',
    rose: 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700 hover:border-rose-300',
    indigo: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700 hover:border-indigo-300',
    teal: 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-700 hover:border-teal-300',
    amber: 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 hover:border-amber-300',
    pink: 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700 hover:border-pink-300'
  };

  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} w-full p-4 rounded-lg border-2 transition-all duration-200 
        hover:shadow-md hover:-translate-y-1 text-left group`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Icon className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1 group-hover:underline">{title}</h3>
          <p className="text-xs opacity-75 line-clamp-2">{description}</p>
        </div>
        <ArrowRight className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}

export default ModuleSelector;
