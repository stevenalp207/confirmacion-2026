import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { grupos, gruposData } from '../data/grupos';
import StudentDetail from '../components/StudentDetail';

function StudentsModule({ onBack, user }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Todos');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Cargar todos los estudiantes de todos los grupos
  const allStudents = [];
  grupos.forEach(grupo => {
    const grupoInfo = gruposData[grupo];
    const estudiantesObj = grupoInfo?.estudiantes || {};
    Object.entries(estudiantesObj).forEach(([id, data]) => {
      allStudents.push({
        id,
        ...data,
        grupo: grupo
      });
    });
  });

  // Filtrar por grupo y búsqueda
  const filteredStudents = allStudents.filter(student => {
    const matchesGroup = selectedGroup === 'Todos' || student.grupo === selectedGroup;
    const matchesSearch = student.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const generarPDFListaGeneral = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(14);
    doc.text('LISTA DE CATEQUIZANDOS - CONFIRMACIÓN 2026', 14, 12);
    doc.setFontSize(10);
    doc.text(`Total de estudiantes: ${allStudents.length}`, 14, 19);
    
    // Crear tabla con datos
    const tableData = allStudents.map(student => [
      student.nombre,
      '', // Espacio para firma
      ''  // Espacio para correo
    ]);
    
    // Crear tabla
    autoTable(doc, {
      head: [['Nombre del catequizando', 'Firma del encargado', 'Correo electrónico del encargado']],
      body: tableData,
      startY: 25,
      columnStyles: {
        0: { cellWidth: 65 },
        1: { cellWidth: 55 },
        2: { cellWidth: 55 }
      },
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9
      },
      bodyStyles: {
        textColor: 0,
        lineColor: [180, 180, 180],
        minCellHeight: 20
      },
      lineWidth: 0.2,
      margin: { top: 25, right: 15, bottom: 15, left: 10 },
      horizontalAlign: 'center',
      didDrawPage: (data) => {
        // Footer
        const pageCount = doc.internal.pages.length - 1;
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.getHeight();
        const pageWidth = pageSize.getWidth();
        
        doc.setFontSize(8);
        doc.text(
          `Página ${data.pageNumber} de ${pageCount}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
      }
    });
    
    doc.save('Lista_Catequizandos.pdf');
  };

  if (selectedStudent) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Navbar */}
        <nav className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedStudent(null)}
                className="hover:bg-blue-800 px-4 py-2 rounded transition"
              >
                ← Volver
              </button>
              <h1 className="text-2xl font-bold">Perfil del Estudiante</h1>
            </div>
          </div>
        </nav>

        {/* Contenido */}
        <main className="max-w-7xl mx-auto p-4">
          <StudentDetail
            grupo={selectedStudent.grupo}
            estudianteId={selectedStudent.id}
            estudiante={selectedStudent}
            user={user}
          />
        </main>

        {/* Botón flotante de salida */}
        <button
          onClick={onBack}
          className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg text-xl font-bold transition"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gestión de Estudiantes</h1>
          <button
            onClick={onBack}
            className="hover:bg-blue-800 px-4 py-2 rounded transition font-semibold"
          >
            ← Salir
          </button>
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto p-4">
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              🔍 Filtros y Búsqueda
            </h2>
            <button
              onClick={generarPDFListaGeneral}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-5 rounded-lg transition shadow-md hover:shadow-lg"
            >
              📋 Imprimir
            </button>
          </div>
          
          {/* Búsqueda por nombre */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              🔎 Buscar por nombre
            </label>
            <input
              type="text"
              placeholder="Escribe el nombre del estudiante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-lg"
            />
          </div>

          {/* Filtro por grupo */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              📍 Filtrar por grupo
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedGroup('Todos')}
                className={`px-4 py-2 rounded-lg font-bold transition ${
                  selectedGroup === 'Todos'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Todos ({allStudents.length})
              </button>
              {grupos.map(grupo => {
                const count = allStudents.filter(s => s.grupo === grupo).length;
                return (
                  <button
                    key={grupo}
                    onClick={() => setSelectedGroup(grupo)}
                    className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1 ${
                      selectedGroup === grupo
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {grupo} <span className="text-xs bg-gray-300 px-2 py-1 rounded">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Información de resultados */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="text-gray-800 font-semibold text-lg">
              📊 Resultados: <span className="text-blue-600 text-2xl">{filteredStudents.length}</span> estudiante(s)
              {selectedGroup !== 'Todos' && ` en ${selectedGroup}`}
            </p>
          </div>
        </div>

        {/* Lista de estudiantes */}
        <div className="space-y-3">
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => (
              <button
                key={`${student.grupo}-${student.id}`}
                onClick={() => setSelectedStudent(student)}
                className="w-full p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition">
                      {student.nombre}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      🆔 {student.id} • 📚 {student.grupo}
                    </p>
                  </div>
                  <div className="text-3xl text-gray-300 group-hover:text-blue-500 transition">→</div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <p className="text-gray-600 text-xl font-medium">
                📭 No se encontraron estudiantes
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Intenta ajustando los filtros de búsqueda
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Botón flotante de salida */}
      <button
        onClick={onBack}
        className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg text-xl font-bold transition"
      >
        ✕
      </button>
    </div>
  );
}

export default StudentsModule;
