import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import ModuleSelector from './pages/ModuleSelector';
import AttendanceModule from './pages/AttendanceModule';
import DocumentsModule from './pages/DocumentsModule';
import SabanasModule from './pages/SabanasModule';
import CartasModule from './pages/CartasModule';
import PagosModule from './pages/PagosModule';
import CatequistasModule from './pages/CatequistasModule';
import StudentsModule from './pages/StudentsModule';

function AppContent() {
  const [currentModule, setCurrentModule] = useState(null);
  const { user, loading, logout } = useAuth();

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

  const handleSelectModule = (module) => {
    setCurrentModule(module);
  };

  const handleBack = () => {
    setCurrentModule(null);
  };

  const handleLogout = () => {
    logout();
    setCurrentModule(null);
  };

  return (
    <>
      {!currentModule && (
        <ModuleSelector 
          onSelectModule={handleSelectModule} 
          user={user}
          onLogout={handleLogout}
        />
      )}
      {currentModule === 'asistencia' && <AttendanceModule onBack={handleBack} user={user} />}
      {currentModule === 'documentos' && <DocumentsModule onBack={handleBack} user={user} />}
      {currentModule === 'sabanas' && <SabanasModule onBack={handleBack} user={user} />}
      {currentModule === 'cartas' && <CartasModule onBack={handleBack} user={user} />}
      {currentModule === 'pagos' && <PagosModule onBack={handleBack} user={user} />}
      {currentModule === 'catequistas' && <CatequistasModule onBack={handleBack} user={user} />}
      {currentModule === 'estudiantes' && <StudentsModule onBack={handleBack} user={user} />}
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
