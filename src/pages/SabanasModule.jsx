import { useState, useEffect } from 'react';
import { grupos } from '../data/grupos';
import Sabanas from '../components/Sabanas';
import { gruposData } from '../data/grupos';

function SabanasModule({ onBack, user }) {
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
      <nav className="bg-orange-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="hover:bg-orange-700 px-3 py-2 rounded-lg transition-colors"
              >
                ← Atrás
              </button>
              <h1 className="text-xl font-bold">Sábanas - Confirmación 2026</h1>
            </div>

            <div>
              <select
                value={currentGroup}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="bg-orange-700 text-white px-4 py-2 rounded-lg border border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-300"
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
      <div className="container mx-auto px-4 py-8">
        {!currentGroup ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Módulo de Sábanas
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Selecciona un grupo para registrar la entrega de sábanas
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gruposDisponibles.map((grupo) => (
                <button
                  key={grupo}
                  onClick={() => handleGroupChange(grupo)}
                  className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-lg hover:border-orange-500 hover:shadow-lg transition-all transform hover:scale-105 text-left"
                >
                  <div className="font-semibold text-gray-800 text-lg">{grupo}</div>
                  <div className="text-sm text-gray-600 mt-1">Click para acceder</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
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
