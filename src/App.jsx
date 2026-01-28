import { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import ModuleSelector from './pages/ModuleSelector';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';

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

// Loading component
function ModuleLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-indigo-600 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1s'}}></div>
        </div>
        <div className="text-center">
          <p className="text-gray-700 font-semibold text-lg">Cargando módulo</p>
          <p className="text-gray-500 text-sm mt-2">Por favor espera...</p>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [currentModule, setCurrentModule] = useState(null);
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
      return ['asistencia', 'documentos', 'sabanas', 'cartas', 'pagos', 'gastos', 'ingresos', 'catequistas', 'estudiantes', 'formacion', 'boletas', 'calendario', 'asignacion-grupos', 'asignacion-personalidad'];
    }
    if (user?.rol === 'financiero') {
      return ['pagos', 'gastos', 'ingresos', 'calendario'];
    }
    if (user?.usuario === 'logistica') {
      return ['asistencia', 'catequistas', 'documentos', 'estudiantes', 'sabanas', 'cartas', 'calendario', 'asignacion-grupos', 'asignacion-personalidad'];
    }
    if (user?.rol === 'formacion') {
      return ['formacion', 'catequistas', 'calendario'];
    }
    return ['asistencia', 'documentos', 'estudiantes', 'pagos', 'calendario'];
  })();

  const handleSelectModule = (module) => {
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

      {!currentModule && (
        <ModuleSelector 
          onSelectModule={handleSelectModule} 
          user={user}
          onLogout={handleLogout}
          savedAccounts={savedAccounts}
          onSwitchAccount={handleSwitchAccount}
          onRemoveAccount={removeSavedAccount}
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
      </Suspense>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
