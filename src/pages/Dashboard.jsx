import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../config/firebase';
import Navbar from '../components/Navbar';
import Documents from '../components/Documents';
import Attendance from '../components/Attendance';
import { gruposData } from '../data/grupos';

function Dashboard({ user, onLogout }) {
  const [currentGroup, setCurrentGroup] = useState('');
  const [activeTab, setActiveTab] = useState('documentos');
  const [estudiantes, setEstudiantes] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentGroup) {
      loadEstudiantes(currentGroup);
    }
  }, [currentGroup]);

  const loadEstudiantes = async (grupo) => {
    setLoading(true);
    try {
      const estudiantesRef = ref(database, `grupos/${grupo}/estudiantes`);
      const snapshot = await get(estudiantesRef);
      
      if (snapshot.exists()) {
        setEstudiantes(snapshot.val());
      } else {
        // Si no hay datos en Firebase, usar datos de ejemplo
        setEstudiantes(gruposData[grupo]?.estudiantes || {});
      }
    } catch (error) {
      console.error('Error loading estudiantes:', error);
      // Usar datos de ejemplo en caso de error
      setEstudiantes(gruposData[grupo]?.estudiantes || {});
    } finally {
      setLoading(false);
    }
  };

  const handleGroupChange = (grupo) => {
    setCurrentGroup(grupo);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar
        currentGroup={currentGroup}
        onGroupChange={handleGroupChange}
        user={user}
        onLogout={onLogout}
      />

      <div className="container mx-auto px-4 py-8">
        {!currentGroup ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Bienvenido a Confirmación 2026
            </h2>
            <p className="text-gray-600 mb-4">
              Selecciona un grupo en el menú superior para comenzar
            </p>
            <div className="text-left max-w-2xl mx-auto">
              <h3 className="font-semibold text-lg mb-2">Grupos disponibles:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Ciencia</li>
                <li>Piedad</li>
                <li>Fortaleza</li>
                <li>Consejo</li>
                <li>Entendimiento</li>
                <li>Sabiduría</li>
                <li>Temor de Dios</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Grupo: {currentGroup}
              </h1>
              <p className="text-gray-600">
                Gestiona documentos y asistencias de los estudiantes
              </p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-t-lg shadow-md">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('documentos')}
                  className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                    activeTab === 'documentos'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  📄 Documentos
                </button>
                <button
                  onClick={() => setActiveTab('asistencia')}
                  className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                    activeTab === 'asistencia'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  ✓ Asistencia
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b-lg shadow-md p-6">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="text-gray-600">Cargando datos...</div>
                </div>
              ) : (
                <>
                  {activeTab === 'documentos' && (
                    <Documents grupo={currentGroup} estudiantes={estudiantes} />
                  )}
                  {activeTab === 'asistencia' && (
                    <Attendance grupo={currentGroup} estudiantes={estudiantes} />
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
