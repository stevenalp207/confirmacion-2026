import { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorProvider } from './context/ErrorContext';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorToast from './components/ErrorToast';
import Login from './pages/Login';
import ModuleSelector from './pages/ModuleSelector';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import SkeletonLoader from './components/SkeletonLoader';

// Lazy load all modules for better performance
const AttendanceModule = lazy(() => import('./pages/AttendanceModule'));
const DocumentsModule = lazy(() => import('./pages/DocumentsModule'));
const SabanasModule = lazy(() => import('./pages/SabanasModule'));
const CartasModule = lazy(() => import('./pages/CartasModule'));
const PagosModule = lazy(() => import('./pages/PagosModule'));
const CatequistasModule = lazy(() => import('./pages/CatequistasModule'));
const StudentsModule = lazy(() => import('./pages/StudentsModule'));
const GastosModule = lazy(() => import('./pages/GastosModule'));
const IngresosModule = lazy(() => import('./pages/IngresosModule'));
const FormacionModule = lazy(() => import('./pages/FormacionModule'));
const BoletasModule = lazy(() => import('./pages/BoletasModule'));
const CalendarioModule = lazy(() => import('./pages/CalendarioModule'));
const GroupAssignmentModule = lazy(() => import('./pages/GroupAssignmentModule'));
const PersonalityAssignmentModule = lazy(() => import('./pages/PersonalityAssignmentModule'));
const TodoModule = lazy(() => import('./pages/TodoModule'));
const DashboardFinancieroModule = lazy(() => import('./pages/DashboardFinancieroModule'));
const ParticipacionesModule = lazy(() => import('./pages/ParticipacionesModule'));
const SeguridadModule = lazy(() => import('./pages/SeguridadModule'));

// Loading component - ahora usa SkeletonLoader mejorado
function ModuleLoader() {
  return <SkeletonLoader />;
}

function AppContent() {
  const [currentModule, setCurrentModule] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, loading, logout, savedAccounts, switchAccount, removeSavedAccount } = useAuth();

  // Escuchar mensajes del Service Worker (clicks en notificaciones)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event) => {
        console.log('Mensaje recibido del SW:', event.data);
        
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
          const { url, data } = event.data;
          console.log('Click en notificación, navegando a:', url);
          
          // Extraer el módulo de la URL si existe
          if (url && url !== '/') {
            const match = url.match(/module=(\w+)/);
            if (match && match[1]) {
              const module = match[1];
              console.log('Navegando a módulo:', module);
              setCurrentModule(module);
              
              // Actualizar historial
              window.history.pushState(
                { module }, 
                '', 
                `#${module}`
              );
            }
          }
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, []);

  // Manejar navegación del navegador (botón atrás/adelante)
  useEffect(() => {
    // Función para manejar cambios en el historial
    const handlePopState = (event) => {
      const state = event.state;
      if (state?.module) {
        setCurrentModule(state.module);
      } else {
        setCurrentModule(null);
      }
    };

    // Escuchar eventos de navegación
    window.addEventListener('popstate', handlePopState);

    // Establecer estado inicial si hay módulo en la URL
    const initialState = window.history.state;
    if (initialState?.module) {
      setCurrentModule(initialState.module);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const allowedModules = (() => {
    if (user?.rol === 'admin') {
      return ['asistencia', 'documentos', 'sabanas', 'cartas', 'pagos', 'gastos', 'ingresos', 'catequistas', 'estudiantes', 'formacion', 'boletas', 'calendario', 'asignacion-grupos', 'asignacion-personalidad', 'dashboard-financiero', 'participaciones', 'seguridad'];
    }
    if (user?.rol === 'financiero') {
      return ['pagos', 'gastos', 'ingresos', 'calendario', 'dashboard-financiero'];
    }
    if (user?.usuario === 'logistica') {
      return ['asistencia', 'catequistas', 'documentos', 'estudiantes', 'sabanas', 'cartas', 'calendario', 'asignacion-grupos', 'asignacion-personalidad', 'dashboard-financiero', 'seguridad'];
    }
    if (user?.rol === 'formacion') {
      return ['formacion', 'catequistas', 'calendario', 'participaciones'];
    }
    if (user?.rol === 'retiro') {
      return ['calendario', 'dashboard-financiero', 'participaciones'];
    }
    if (user?.rol === 'catequista') {
      return ['calendario', 'dashboard-financiero', 'participaciones', 'seguridad'];
    }
    // Si el usuario pertenece a un grupo especial, agregar catequistas
    const gruposEspeciales = [
      'Consejo', 'Temor de Dios', 'Ciencia', 'Fortaleza', 'Entendimiento', 'Piedad', 'Sabiduria'
    ];
    if (user?.grupo && gruposEspeciales.includes(user.grupo)) {
      return ['asistencia', 'documentos', 'estudiantes', 'pagos', 'calendario', 'dashboard-financiero', 'participaciones', 'catequistas'];
    }
    if (user?.usuario && gruposEspeciales.map(g => g.toLowerCase()).includes(user.usuario.toLowerCase())) {
      return ['asistencia', 'documentos', 'estudiantes', 'pagos', 'calendario', 'dashboard-financiero', 'participaciones', 'catequistas'];
    }
    return ['asistencia', 'documentos', 'estudiantes', 'pagos', 'calendario', 'dashboard-financiero', 'participaciones'];
  })();

  const handleSelectModule = (module) => {
    // Si module es null, volver al inicio
    if (module === null) {
      setCurrentModule(null);
      window.history.pushState(null, '', '#');
      return;
    }
    
    if (!allowedModules.includes(module)) return;
    setCurrentModule(module);
    
    // Agregar al historial del navegador
    window.history.pushState(
      { module }, 
      '', 
      `#${module}`
    );
  };

  const handleBack = () => {
    setCurrentModule(null);
    
    // Agregar al historial para que el botón atrás funcione
    if (window.history.state?.module) {
      window.history.pushState(null, '', '#');
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentModule(null);
  };

  const handleSwitchAccount = (usuario) => {
    const result = switchAccount(usuario);
    if (result.success) {
      setCurrentModule(null);
    }
  };

  return (
    <>
      {/* PWA y indicadores */}
      <OfflineIndicator />
      <PWAInstallPrompt />

      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Sidebar Desktop */}
        <div className="hidden lg:block">
          <Sidebar
            currentModule={currentModule}
            onSelectModule={handleSelectModule}
            user={user}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Sidebar Mobile */}
        {mobileSidebarOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black/20 z-40"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="lg:hidden">
              <Sidebar
                currentModule={currentModule}
                onSelectModule={(module) => {
                  handleSelectModule(module);
                  setMobileSidebarOpen(false);
                }}
                user={user}
                isCollapsed={false}
                onToggleCollapse={() => setMobileSidebarOpen(false)}
              />
            </div>
          </>
        )}

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col overflow-hidden ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
          {/* Top Bar */}
          <TopBar
            user={user}
            onLogout={handleLogout}
            savedAccounts={savedAccounts}
            onSwitchAccount={handleSwitchAccount}
            onRemoveAccount={removeSavedAccount}
            onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          />

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            {!currentModule && (
              <ModuleSelector 
                onSelectModule={handleSelectModule} 
                user={user}
              />
            )}
            <Suspense fallback={<ModuleLoader />}>
              {currentModule === 'asistencia' && <AttendanceModule onBack={handleBack} user={user} />}
              {currentModule === 'documentos' && <DocumentsModule onBack={handleBack} user={user} />}
              {currentModule === 'sabanas' && <SabanasModule onBack={handleBack} user={user} />}
              {currentModule === 'cartas' && <CartasModule onBack={handleBack} user={user} />}
              {currentModule === 'pagos' && <PagosModule onBack={handleBack} user={user} />}
              {currentModule === 'gastos' && <GastosModule onBack={handleBack} user={user} />}
              {currentModule === 'ingresos' && <IngresosModule onBack={handleBack} user={user} />}
              {currentModule === 'formacion' && <FormacionModule onBack={handleBack} user={user} />}
              {currentModule === 'catequistas' && <CatequistasModule onBack={handleBack} user={user} />}
              {currentModule === 'estudiantes' && <StudentsModule onBack={handleBack} user={user} />}
              {currentModule === 'boletas' && <BoletasModule onBack={handleBack} user={user} />}
              {currentModule === 'calendario' && <CalendarioModule onBack={handleBack} user={user} />}
              {currentModule === 'asignacion-grupos' && <GroupAssignmentModule onBack={handleBack} user={user} />}
              {currentModule === 'asignacion-personalidad' && <PersonalityAssignmentModule onBack={handleBack} user={user} />}
              {currentModule === 'tareas' && <TodoModule onBack={handleBack} user={user} />}
              {currentModule === 'dashboard-financiero' && <DashboardFinancieroModule onBack={handleBack} user={user} />}
              {currentModule === 'participaciones' && <ParticipacionesModule onBack={handleBack} user={user} />}
              {currentModule === 'seguridad' && <SeguridadModule onBack={handleBack} user={user} />}
            </Suspense>
          </main>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <AuthProvider>
          <AppContent />
          <ErrorToast />
        </AuthProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}

export default App;
