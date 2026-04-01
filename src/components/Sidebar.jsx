import { useState } from 'react';
import { 
  CheckCircle, 
  Users, 
  FileText, 
  GraduationCap, 
  BedDouble, 
  Mail, 
  DollarSign,
  Wallet,
  BookOpen,
  FileCheck,
  Calendar,
  Shuffle,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ListTodo,
  PieChart,
  Mic,
  Shield
} from 'lucide-react';
import logo from '../assets/logo.png';

function Sidebar({ currentModule, onSelectModule, user, isCollapsed, onToggleCollapse }) {
  const modules = [
    // === INICIO ===
    {
      id: null,
      name: 'Inicio',
      icon: LayoutGrid,
      color: 'gray',
      roles: ['admin', 'financiero', 'logistica', 'formacion', 'retiro', 'catequista', 'Ciencia', 'Piedad', 'Fortaleza', 'Consejo', 'Entendimiento', 'Sabiduría', 'Temor de Dios']
    },
    {
      id: 'calendario',
      name: 'Calendario',
      icon: Calendar,
      color: 'violet',
      roles: ['admin', 'financiero', 'logistica', 'formacion', 'retiro', 'catequista', 'Ciencia', 'Piedad', 'Fortaleza', 'Consejo', 'Entendimiento', 'Sabiduría', 'Temor de Dios']
    },
    // === PERSONAS ===
    {
      id: 'estudiantes',
      name: 'Estudiantes',
      icon: GraduationCap,
      color: 'cyan',
      roles: ['admin', 'logistica', 'Ciencia', 'Piedad', 'Fortaleza', 'Consejo', 'Entendimiento', 'Sabiduría', 'Temor de Dios']
    },
    {
      id: 'catequistas',
      name: 'Catequistas',
      icon: Users,
      color: 'blue',
      roles: ['admin', 'logistica', 'formacion', 'Ciencia', 'Piedad', 'Fortaleza', 'Consejo', 'Entendimiento', 'Sabiduría', 'Temor de Dios']
    },
    {
      id: 'asistencia',
      name: 'Asistencia',
      icon: CheckCircle,
      color: 'green',
      roles: ['admin', 'logistica', 'Ciencia', 'Piedad', 'Fortaleza', 'Consejo', 'Entendimiento', 'Sabiduría', 'Temor de Dios']
    },
    // === DOCUMENTOS ===
    {
      id: 'documentos',
      name: 'Documentos',
      icon: FileText,
      color: 'blue',
      roles: ['admin', 'logistica', 'Ciencia', 'Piedad', 'Fortaleza', 'Consejo', 'Entendimiento', 'Sabiduría', 'Temor de Dios']
    },
    {
      id: 'cartas',
      name: 'Cartas',
      icon: Mail,
      color: 'purple',
      roles: ['admin', 'logistica']
    },
    {
      id: 'sabanas',
      name: 'Sábanas',
      icon: BedDouble,
      color: 'orange',
      roles: ['admin', 'logistica']
    },
    // === FINANZAS ===
    {
      id: 'dashboard-financiero',
      name: 'Dashboard Financiero',
      icon: PieChart,
      color: 'indigo',
      roles: ['admin', 'financiero', 'logistica', 'retiro', 'catequista', 'Ciencia', 'Piedad', 'Fortaleza', 'Consejo', 'Entendimiento', 'Sabiduría', 'Temor de Dios']
    },
    {
      id: 'pagos',
      name: 'Pagos',
      icon: DollarSign,
      color: 'blue',
      roles: ['admin', 'financiero', 'Ciencia', 'Piedad', 'Fortaleza', 'Consejo', 'Entendimiento', 'Sabiduría', 'Temor de Dios']
    },
    {
      id: 'ingresos',
      name: 'Ingresos',
      icon: Wallet,
      color: 'emerald',
      roles: ['admin', 'financiero']
    },
    {
      id: 'gastos',
      name: 'Gastos',
      icon: FileText,
      color: 'rose',
      roles: ['admin', 'financiero']
    },
    // === FORMACIÓN ===
    {
      id: 'formacion',
      name: 'Formación',
      icon: BookOpen,
      color: 'indigo',
      roles: ['admin', 'formacion']
    },
    // === HERRAMIENTAS ADMIN ===
    {
      id: 'boletas',
      name: 'Boletas',
      icon: FileCheck,
      color: 'teal',
      roles: ['admin']
    },
    {
      id: 'asignacion-grupos',
      name: 'Asignación Grupos',
      icon: Shuffle,
      color: 'amber',
      roles: ['admin', 'logistica']
    },
    {
      id: 'asignacion-personalidad',
      name: 'Asignación',
      icon: UserCheck,
      color: 'pink',
      roles: ['admin', 'logistica']
    },
    // === LOGÍSTICA ===
    {
      id: 'seguridad',
      name: 'Seguridad',
      icon: Shield,
      color: 'blue',
      roles: ['admin', 'logistica', 'catequista']
    }
  ];

  const hasAccess = (module) => {
    if (user?.rol === 'admin') return true;
    if (user?.usuario === 'logistica' && module.roles.includes('logistica')) return true;
    return module.roles.includes(user?.rol);
  };

  const visibleModules = modules.filter(hasAccess);

  const getColorClasses = (color, isActive) => {
    if (!isActive) return 'text-gray-700 hover:bg-gray-100';
    
    const colorMap = {
      gray: 'bg-gray-50 text-gray-700',
      green: 'bg-green-50 text-green-700',
      blue: 'bg-blue-50 text-blue-700',
      cyan: 'bg-cyan-50 text-cyan-700',
      violet: 'bg-violet-50 text-violet-700',
      orange: 'bg-orange-50 text-orange-700',
      purple: 'bg-purple-50 text-purple-700',
      emerald: 'bg-emerald-50 text-emerald-700',
      rose: 'bg-rose-50 text-rose-700',
      indigo: 'bg-indigo-50 text-indigo-700',
      teal: 'bg-teal-50 text-teal-700',
      amber: 'bg-amber-50 text-amber-700',
      pink: 'bg-pink-50 text-pink-700'
    };
    
    return `${colorMap[color]} font-medium shadow-sm`;
  };

  const getIconColorClass = (color, isActive) => {
    if (!isActive) return 'text-gray-500';
    
    const colorMap = {
      gray: 'text-gray-600',
      green: 'text-green-600',
      blue: 'text-blue-600',
      cyan: 'text-cyan-600',
      violet: 'text-violet-600',
      orange: 'text-orange-600',
      purple: 'text-purple-600',
      emerald: 'text-emerald-600',
      rose: 'text-rose-600',
      indigo: 'text-indigo-600',
      teal: 'text-teal-600',
      amber: 'text-amber-600',
      pink: 'text-pink-600'
    };
    
    return colorMap[color];
  };

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out fixed left-0 top-0 h-screen z-50 shadow-md`}
    >
      {/* Logo and Title */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-8 w-8" />
            <div>
              <h2 className="font-bold text-gray-800 text-sm">Confirmación</h2>
              <p className="text-xs text-gray-500">2026</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <img src={logo} alt="Logo" className="h-8 w-8 mx-auto" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          {visibleModules.map((module) => {
            const Icon = module.icon;
            const isActive = currentModule === module.id;
            
            return (
              <button
                key={module.id || 'home'}
                onClick={() => onSelectModule(module.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                  getColorClasses(module.color, isActive)
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? module.name : ''}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${getIconColorClass(module.color, isActive)}`} />
                {!isCollapsed && (
                  <span className="text-sm truncate">{module.name}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="p-3 border-t border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        title={isCollapsed ? 'Expandir' : 'Contraer'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        )}
      </button>
    </aside>
  );
}

export default Sidebar;
