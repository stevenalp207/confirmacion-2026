import { useState } from 'react';
import { useLocalStorage } from '../utils/storage';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { grupos, gruposData } from '../data/grupos';
import StudentDetail from '../components/StudentDetail';
import { ArrowLeft, X, Search, MapPin, Printer, BarChart3, Phone, BookOpen, ArrowRight, Filter, Users } from 'lucide-react';

function StudentsModule({ onBack, user }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Todos');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filterStatus, setFilterStatus] = useState('todos'); // todos, documentos-pendientes, documentos-completos

  // Mostrar estudiantes directamente desde gruposData

  // Cargar todos los estudiantes de todos los grupos
  let allStudents = [];
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
  // Ordenar alfabéticamente por nombre
  allStudents = allStudents.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));

  // Función para contar documentos entregados
  const countDocumentosEntregados = (student) => {
    return Object.values(student.documentos || {}).filter(Boolean).length;
  };

  // Función para actualizar datos de un estudiante
  const actualizarEstudiante = (grupo, estudianteId, nuevosDatos) => {
    setLocalGruposData(prev => {
      const nuevosGrupos = { ...prev };
      nuevosGrupos[grupo] = {
        ...nuevosGrupos[grupo],
        estudiantes: {
          ...nuevosGrupos[grupo].estudiantes,
          [estudianteId]: {
            ...nuevosGrupos[grupo].estudiantes[estudianteId],
            ...nuevosDatos
          }
        }
      };
      return nuevosGrupos;
    });
  };

  const totalDocumentos = 6; // Total de documentos requeridos

  // Filtrar por grupo, búsqueda y estado de documentos
  const filteredStudents = allStudents.filter(student => {
    const matchesGroup = selectedGroup === 'Todos' || student.grupo === selectedGroup;
    const matchesSearch = student.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (filterStatus === 'documentos-pendientes') {
      matchesStatus = countDocumentosEntregados(student) < totalDocumentos;
    } else if (filterStatus === 'documentos-completos') {
      matchesStatus = countDocumentosEntregados(student) === totalDocumentos;
    }
    
    return matchesGroup && matchesSearch && matchesStatus;
  });

  const generarPDFListaGeneral = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });
    
    // Título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Lista de Catequizandos - Confirmación 2026', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    
    // Crear tabla con datos
    const tableData = allStudents.map(student => [
      student.nombre,
      '', // Espacio para firma
      ''  // Espacio para correo
    ]);

    // Calcular tamaño dinámico según cantidad de estudiantes
    const numRows = tableData.length;
    let fontSize = 11;
    let cellPadding = 9;
    
    if (numRows > 50) {
      fontSize = 9;
      cellPadding = 6;
    } else if (numRows > 40) {
      fontSize = 10;
      cellPadding = 7;
    }
    
    // Crear tabla
    const pageWidth = doc.internal.pageSize.getWidth();
    const colWidths = { col0: 60, col1: 60, col2: 60 };
    const tableWidth = colWidths.col0 + colWidths.col1 + colWidths.col2;
    const marginLeft = (pageWidth - tableWidth) / 2;

    autoTable(doc, {
      head: [['Catequizando', 'Firma del encargado', 'Correo electrónico']],
      body: tableData,
      startY: 22,
      theme: 'grid',
      styles: {
        fontSize: fontSize,
        cellPadding: cellPadding,
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        textColor: [0, 0, 0]
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.2,
        lineColor: [0, 0, 0],
        fontSize: fontSize + 1
      },
      bodyStyles: {
        textColor: [0, 0, 0]
      },
      columnStyles: {
        0: { cellWidth: colWidths.col0 },
        1: { cellWidth: colWidths.col1 },
        2: { cellWidth: colWidths.col2 }
      },
      margin: { left: marginLeft, right: marginLeft, top: 22 },
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 sm:py-8 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => setSelectedStudent(null)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition mb-3 sm:mb-4 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Volver a la lista
            </button>
            
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{selectedStudent.nombre}</h1>
                <p className="text-gray-600 text-xs sm:text-sm mt-2">Grupo: <span className="font-semibold">{selectedStudent.grupo}</span></p>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <StudentDetail
            grupo={selectedStudent.grupo}
            estudianteId={selectedStudent.id}
            estudiante={selectedStudent}
            user={user}
            actualizarEstudiante={actualizarEstudiante}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Volver al Menú Principal
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="text-center mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2 sm:gap-3">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                Estudiantes
              </h1>
              <p className="text-gray-600 mt-2 text-xs sm:text-sm lg:text-base">
                Gestiona los estudiantes y sus detalles
              </p>
              {user && (
                <p className="text-gray-600 text-xs sm:text-sm mt-2">
                  Usuario: <span className="font-semibold">{user.usuario}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contenido */}
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 lg:p-8 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 sm:mb-6 pb-5 sm:pb-6 border-b-2 border-gray-200">
            <h2 className="text-2xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Search className="w-6 h-6" /> Filtros y Búsqueda
            </h2>
            <button
              onClick={generarPDFListaGeneral}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-5 rounded-lg text-base sm:text-base transition shadow-md hover:shadow-lg whitespace-nowrap w-full sm:w-auto"
            >
              <Printer className="w-5 h-5" /> Imprimir
            </button>
          </div>
          
          {/* Búsqueda por nombre */}
          <div className="mb-5 sm:mb-6">
            <label className="block text-sm sm:text-sm font-bold text-gray-700 mb-3 sm:mb-3 uppercase tracking-wide flex items-center gap-2">
              <Search className="w-4 h-4" /> Buscar por nombre
            </label>
            <input
              type="text"
              placeholder="Escribe el nombre del estudiante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 sm:px-4 py-3 sm:py-3 text-base sm:text-base lg:text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>

          {/* Filtro por grupo */}
          <div className="mb-5 sm:mb-6">
            <label className="block text-sm sm:text-sm font-bold text-gray-700 mb-3 sm:mb-3 uppercase tracking-wide flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Filtrar por grupo
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedGroup('Todos')}
                className={`px-4 sm:px-4 py-2 rounded-lg text-base sm:text-base font-bold transition ${
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
                    className={`px-4 py-2 rounded-lg text-base font-bold transition flex items-center gap-1 ${
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

          {/* Filtro por estado de documentos */}
          <div className="mb-5 sm:mb-6">
            <label className="block text-sm sm:text-sm font-bold text-gray-700 mb-3 sm:mb-3 uppercase tracking-wide flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filtrar por documentos
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('todos')}
                className={`px-4 sm:px-4 py-2 rounded-lg text-base sm:text-base font-bold transition ${
                  filterStatus === 'todos'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterStatus('documentos-completos')}
                className={`px-4 sm:px-4 py-2 rounded-lg text-base sm:text-base font-bold transition ${
                  filterStatus === 'documentos-completos'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                ✓ Documentos Completos
              </button>
              <button
                onClick={() => setFilterStatus('documentos-pendientes')}
                className={`px-4 sm:px-4 py-2 rounded-lg text-base sm:text-base font-bold transition ${
                  filterStatus === 'documentos-pendientes'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                ⚠ Documentos Pendientes
              </button>
            </div>
          </div>

          {/* Información de resultados */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="text-gray-800 font-semibold text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" /> Resultados: <span className="text-blue-600 text-2xl">{filteredStudents.length}</span> estudiante(s)
              {selectedGroup !== 'Todos' && ` en ${selectedGroup}`}
              {filterStatus !== 'todos' && ` - ${filterStatus === 'documentos-completos' ? 'Documentos Completos' : 'Documentos Pendientes'}`}
            </p>
          </div>
        </div>

        {/* Lista de estudiantes */}
        <div className="space-y-3">
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => {
              const docCount = countDocumentosEntregados(student);
              const isComplete = docCount === totalDocumentos;
              
              return (
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
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                        <Phone className="w-4 h-4" /> {student.id} • <BookOpen className="w-4 h-4" /> {student.grupo}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isComplete ? 'bg-green-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${(docCount / totalDocumentos) * 100}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          isComplete
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {docCount}/{totalDocumentos}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-8 h-8 text-gray-300 group-hover:text-blue-500 transition ml-4 flex-shrink-0" />
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <p className="text-gray-600 text-xl font-medium">
                No se encontraron estudiantes
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Intenta ajustando los filtros de búsqueda
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentsModule;
