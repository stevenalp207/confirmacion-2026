import { useState, useEffect } from 'react';
import { grupos } from '../data/grupos';
import Sabanas from '../components/Sabanas';
import { gruposData } from '../data/grupos';

function SabanasModule({ onBack, user }) {
  const [currentGroup, setCurrentGroup] = useState('');
  const [estudiantes, setEstudiantes] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filtrar grupos según el rol del usuario
  const gruposDisponibles = user?.rol === 'admin' || user?.usuario === 'logistica'
    ? grupos 
    : [user?.rol];

  // Manejar navegación del historial para grupos
  useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state;
      if (state?.group && gruposDisponibles.includes(state.group)) {
        setCurrentGroup(state.group);
      } else if (state?.module === 'sabanas' && !state?.group) {
        setCurrentGroup('');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Restaurar grupo del historial si existe
    const currentState = window.history.state;
    if (currentState?.group && gruposDisponibles.includes(currentState.group)) {
      setCurrentGroup(currentState.group);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user, gruposDisponibles]);

  useEffect(() => {
    if (currentGroup) {
      loadEstudiantes(currentGroup);
    }
  }, [currentGroup]);

  const loadEstudiantes = (grupo) => {
    setLoading(true);
    try {
      setEstudiantes(gruposData[grupo]?.estudiantes || {});
    } catch (error) {
      console.error('Error loading estudiantes:', error);
      setEstudiantes({});
    } finally {
      setLoading(false);
    }
  };

  const handleGroupChange = (grupo) => {
    setCurrentGroup(grupo);
    
    // Agregar cambio de grupo al historial
    window.history.pushState(
      { module: 'sabanas', group: grupo },
      '',
      `#sabanas`
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-orange-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h1 className="text-xl sm:text-2xl font-bold">SÁBANAS</h1>
            <button
              onClick={onBack}
              className="bg-white text-orange-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors font-semibold text-sm sm:text-base w-full sm:w-auto"
            >
              Salir
            </button>
          </div>
          <select
            value={currentGroup}
            onChange={(e) => handleGroupChange(e.target.value)}
            className="w-full sm:w-auto bg-white text-gray-900 px-3 sm:px-4 py-2.5 rounded-lg text-sm sm:text-base border-2 border-orange-300 hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all font-medium shadow-sm"
          >
            <option value="">Seleccionar Grupo</option>
            {gruposDisponibles.map((grupo) => (
              <option key={grupo} value={grupo}>
                {grupo}
              </option>
            ))}
          </select>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        {!currentGroup ? (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
              Módulo de Sábanas
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 text-center">
              Selecciona un grupo para registrar la entrega de sábanas
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {gruposDisponibles.map((grupo) => (
                <button
                  key={grupo}
                  onClick={() => handleGroupChange(grupo)}
                  className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-lg hover:border-orange-500 hover:shadow-lg transition-all transform hover:scale-105 text-left"
                >
                  <div className="font-semibold text-gray-800 text-base sm:text-lg">{grupo}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Click para acceder</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                Grupo: {currentGroup}
              </h1>
              <p className="text-gray-600">
                Controla la entrega de sábanas de los estudiantes
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="text-gray-600">Cargando datos...</div>
                </div>
              ) : (
                <Sabanas grupo={currentGroup} estudiantes={estudiantes} user={user} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SabanasModule;
