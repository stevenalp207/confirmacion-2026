import { useState, useEffect } from 'react';
import { grupos } from '../data/grupos';
import Cartas from '../components/Cartas';
import { gruposData } from '../data/grupos';

function CartasModule({ onBack, user }) {
  const [currentGroup, setCurrentGroup] = useState('');
  const [estudiantes, setEstudiantes] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filtrar grupos según el rol del usuario
  const gruposDisponibles = user?.rol === 'admin' 
    ? grupos 
    : [user?.rol];

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
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 sm:py-0 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={onBack}
                className="hover:bg-purple-700 px-2 sm:px-3 py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                ← Atrás
              </button>
              <h1 className="text-base sm:text-lg lg:text-xl font-bold">Cartas - Confirmación 2026</h1>
            </div>

            <div className="w-full sm:w-auto">
              <select
                value={currentGroup}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="w-full sm:w-auto bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="">Seleccionar Grupo</option>
                {gruposDisponibles.map((grupo) => (
                  <option key={grupo} value={grupo}>
                    {grupo}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        {!currentGroup ? (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
              Módulo de Cartas
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 text-center">
              Selecciona un grupo para registrar la entrega de cartas
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {gruposDisponibles.map((grupo) => (
                <button
                  key={grupo}
                  onClick={() => handleGroupChange(grupo)}
                  className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:shadow-lg transition-all transform hover:scale-105 text-left"
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
                Controla la entrega de cartas de los estudiantes
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="text-gray-600">Cargando datos...</div>
                </div>
              ) : (
                <Cartas grupo={currentGroup} estudiantes={estudiantes} user={user} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartasModule;
