import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { grupos, gruposData, tiposDocumentos } from '../data/grupos';
import StudentDetail from '../components/StudentDetail';
import StudentPhoto from '../components/StudentPhoto';
import { ArrowLeft, Search, MapPin, Printer, BarChart3, ArrowRight, Users } from 'lucide-react';
import { supabase } from '../config/supabase';

const slugifyStudentName = (name = '') => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
};

const getStudentSlugFromHash = () => {
  const hash = window.location.hash.replace(/^#/, '').trim();
  if (!hash.toLowerCase().startsWith('estudiantes')) return '';
  const [, studentSlug = ''] = hash.split('/');
  return decodeURIComponent(studentSlug);
};

function StudentsModule({ onBack, user }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Todos');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [documentosCountByStudent, setDocumentosCountByStudent] = useState({});

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

  const getStudentBySlug = (slug) => {
    if (!slug) return null;
    return allStudents.find(student => slugifyStudentName(student.nombre) === slug) || null;
  };

  const navigateToStudent = (student) => {
    const slug = slugifyStudentName(student.nombre);
    window.history.pushState(
      { module: 'estudiantes', studentSlug: slug },
      '',
      `#estudiantes/${encodeURIComponent(slug)}`
    );
    setSelectedStudent(student);
  };

  const backToStudentsList = () => {
    window.history.pushState(
      { module: 'estudiantes' },
      '',
      '#estudiantes'
    );
    setSelectedStudent(null);
  };

  useEffect(() => {
    const syncSelectedStudentWithHash = () => {
      const studentSlug = getStudentSlugFromHash();

      if (!studentSlug) {
        setSelectedStudent(null);
        return;
      }

      const matchedStudent = getStudentBySlug(studentSlug);
      if (matchedStudent) {
        setSelectedStudent(matchedStudent);
      }
    };

    syncSelectedStudentWithHash();
    window.addEventListener('popstate', syncSelectedStudentWithHash);
    window.addEventListener('hashchange', syncSelectedStudentWithHash);

    return () => {
      window.removeEventListener('popstate', syncSelectedStudentWithHash);
      window.removeEventListener('hashchange', syncSelectedStudentWithHash);
    };
  }, []);

  const loadDocumentosResumen = async () => {
    try {
      const { data, error } = await supabase
        .from('documentos_entregados')
        .select('grupo,estudiante_id,entregado')
        .eq('entregado', true);

      if (error) {
        console.error('Error loading documentos resumen:', error);
        return;
      }

      const nextCounts = {};
      (data || []).forEach((row) => {
        const key = `${row.grupo}::${row.estudiante_id}`;
        nextCounts[key] = (nextCounts[key] || 0) + 1;
      });

      setDocumentosCountByStudent(nextCounts);
    } catch (error) {
      console.error('Error loading documentos resumen:', error);
    }
  };

  useEffect(() => {
    if (!selectedStudent) {
      loadDocumentosResumen();
    }
  }, [selectedStudent]);

  // Función para contar documentos entregados
  const countDocumentosEntregados = (student) => {
    const key = `${student.grupo}::${student.id}`;
    return documentosCountByStudent[key] || 0;
  };

  const totalDocumentos = tiposDocumentos.length;

  // Filtrar por grupo y búsqueda
  const filteredStudents = allStudents.filter(student => {
    const matchesGroup = selectedGroup === 'Todos' || student.grupo === selectedGroup;
    const matchesSearch = student.nombre.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesGroup && matchesSearch;
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
              onClick={backToStudentsList}
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

          {/* Información de resultados */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="text-gray-800 font-semibold text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" /> Resultados: <span className="text-blue-600 text-2xl">{filteredStudents.length}</span> estudiante(s)
              {selectedGroup !== 'Todos' && ` en ${selectedGroup}`}
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
                  onClick={() => navigateToStudent(student)}
                  className="w-full p-3 sm:p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg sm:hover:-translate-y-1 transition text-left group"
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <StudentPhoto
                        email={student.correoInstitucional}
                        name={student.nombre}
                        sizeClass="w-12 h-12 text-sm sm:w-14 sm:h-14 sm:text-base"
                      />
                      <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                          <p className="font-bold text-gray-800 text-base sm:text-lg leading-tight group-hover:text-blue-600 transition truncate">
                            {student.nombre}
                          </p>
                          <p className="text-gray-700 truncate">
                            {(student.especialidad || 'Especialidad no registrada')} - {student.grupo}
                          </p>
                          <p className="text-gray-700 font-semibold truncate sm:break-all">
                            {student.id} - {student.correoInstitucional || 'Correo no registrado'}
                          </p>
                        </div>

                        <div className="mt-2 sm:mt-3 flex items-center gap-2">
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
                    </div>
                    <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300 group-hover:text-blue-500 transition ml-2 sm:ml-4 flex-shrink-0 self-center" />
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
