import { useState } from 'react';
import { gruposData } from '../data/grupos';
import StudentDetail from './StudentDetail';

function StudentList({ grupo, user }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Obtener estudiantes del grupo
  const grupoInfo = gruposData[grupo];
  const estudiantesObj = grupoInfo?.estudiantes || {};
  
  // Convertir a array
  const estudiantes = Object.entries(estudiantesObj).map(([id, data]) => ({
    id,
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
          className="mb-4 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition"
        >
          ← Volver a la lista
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
    <div className="space-y-4">
      {/* Búsqueda */}
      <div>
        <input
          type="text"
          placeholder="Buscar estudiante por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Información */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-gray-800">
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
              className="w-full p-4 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-lg transition text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{est.nombre}</p>
                  <p className="text-sm text-gray-600">ID: {est.id}</p>
                </div>
                <div className="text-2xl">→</div>
              </div>
            </button>
          ))
        ) : (
          <p className="text-gray-600 text-center py-8">No se encontraron estudiantes</p>
        )}
      </div>
    </div>
  );
}

export default StudentList;
