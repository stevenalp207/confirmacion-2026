import { useState } from 'react';
import { gruposData } from '../data/grupos';
import StudentDetail from './StudentDetail';
import { ArrowLeft, ArrowRight } from 'lucide-react';

function StudentList({ grupo, user }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Obtener estudiantes del grupo
  const grupoInfo = gruposData[grupo];
  const estudiantesObj = grupoInfo?.estudiantes || {};
  
  // Convertir a array - usar directamente los datos que incluyen el id real
  const estudiantes = Object.values(estudiantesObj).map(data => ({
    ...data
  }));

  // Filtrar por búsqueda
  const filteredEstudiantes = estudiantes.filter(est =>
    est.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedStudent) {
    return (
      <div>
        <button
          onClick={() => setSelectedStudent(null)}
          className="mb-3 sm:mb-4 px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a la lista
        </button>
        <StudentDetail
          grupo={grupo}
          estudianteId={selectedStudent.id}
          estudiante={selectedStudent}
          user={user}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Búsqueda */}
      <div>
        <input
          type="text"
          placeholder="Buscar estudiante por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Información */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-gray-800 text-sm sm:text-base">
          <strong>Total de estudiantes:</strong> {filteredEstudiantes.length} / {estudiantes.length}
        </p>
      </div>

      {/* Lista de estudiantes */}
      <div className="space-y-2">
        {filteredEstudiantes.length > 0 ? (
          filteredEstudiantes.map(est => (
            <button
              key={est.id}
              onClick={() => setSelectedStudent(est)}
              className="w-full p-3 sm:p-4 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-lg transition text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{est.nombre}</p>
                  <p className="text-xs sm:text-sm text-gray-600">ID: {est.id}</p>
                </div>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 shrink-0" />
              </div>
            </button>
          ))
        ) : (
          <p className="text-gray-600 text-center py-6 sm:py-8 text-sm sm:text-base">No se encontraron estudiantes</p>
        )}
      </div>
    </div>
  );
}

export default StudentList;
