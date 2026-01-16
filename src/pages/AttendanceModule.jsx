import { useState, useEffect } from 'react';
import { grupos } from '../data/grupos';
import Attendance from '../components/Attendance';
import StudentDetail from '../components/StudentDetail';
import { gruposData } from '../data/grupos';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function AttendanceModule({ onBack, user }) {
  const [currentGroup, setCurrentGroup] = useState('');
  const [estudiantes, setEstudiantes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Filtrar grupos según el rol del usuario
  const gruposDisponibles = user?.rol === 'admin' || user?.usuario === 'logistica'
    ? grupos 
    : [user?.rol];

  // Cargar automáticamente el grupo si el usuario no es admin ni logística
  useEffect(() => {
    if (user && user.rol !== 'admin' && user.usuario !== 'logistica' && !currentGroup) {
      setCurrentGroup(user.rol);
    }
  }, [user, currentGroup]);

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

  const handleStudentClick = (estudianteId) => {
    // Buscar el estudiante por su ID real
    let estudiante = null;
    for (const key in estudiantes) {
      if (estudiantes[key].id === estudianteId) {
        estudiante = estudiantes[key];
        break;
      }
    }
    
    if (estudiante) {
      setSelectedStudent({
        id: estudianteId,
        ...estudiante,
        grupo: currentGroup
      });
    }
  };

  const generarPDFAsistencia = () => {
    try {
      if (!currentGroup || !estudiantes) {
        alert('No hay datos para exportar');
        return;
      }

      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(currentGroup, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      
      // Crear tabla
      const tableData = Object.entries(estudiantes).map(([id, estudiante]) => [
        estudiante.nombre,
        '' // Columna vacía para firma
      ]);

      autoTable(doc, {
        startY: 30,
        head: [['Catequizando', 'Firma Padre/Madre/Padrino/Madrina']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 8,
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
          lineColor: [0, 0, 0]
        },
        bodyStyles: {
          textColor: [0, 0, 0]
        },
        columnStyles: {
          0: { cellWidth: 90 },
          1: { cellWidth: 90 }
        },
        margin: { left: 15, right: 15 }
      });

      doc.save(`Lista_Asistencia_${currentGroup}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF: ' + error.message);
    }
  };

  if (selectedStudent) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Navbar */}
        <nav className="sticky top-0 z-20 bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <button
                onClick={() => setSelectedStudent(null)}
                className="hover:bg-green-700 px-3 py-2 rounded-lg transition-colors font-bold text-sm sm:text-base"
              >
                ← Volver a asistencia
              </button>
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl font-bold truncate">{selectedStudent.nombre}</h1>
                <p className="text-green-200 text-xs sm:text-sm">Grupo: {selectedStudent.grupo}</p>
              </div>
            </div>
          </div>
        </nav>

        {/* Contenido */}
        <main className="max-w-7xl mx-auto p-3 sm:p-4">
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
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg text-lg sm:text-xl font-bold transition"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 sm:py-0 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={onBack}
                className="hover:bg-green-700 px-2 sm:px-3 py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                ← Atrás
              </button>
              <h1 className="text-base sm:text-lg lg:text-xl font-bold">Asistencia - Confirmación 2026</h1>
            </div>

            <div className="w-full sm:w-auto">
              <select
                value={currentGroup}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="w-full sm:w-auto bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-300"
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
              Módulo de Asistencia
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 text-center">
              Selecciona un grupo para registrar asistencias
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {gruposDisponibles.map((grupo) => (
                <button
                  key={grupo}
                  onClick={() => handleGroupChange(grupo)}
                  className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg hover:border-green-500 hover:shadow-lg transition-all transform hover:scale-105 text-left"
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                    Grupo: {currentGroup}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    Registra la asistencia de los estudiantes
                  </p>
                </div>
                <button
                  onClick={generarPDFAsistencia}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base transition-colors shadow-md whitespace-nowrap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">Imprimir Lista PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="text-gray-600 text-sm sm:text-base">Cargando datos...</div>
                </div>
              ) : (
                <Attendance 
                  grupo={currentGroup} 
                  estudiantes={estudiantes} 
                  user={user}
                  onStudentClick={handleStudentClick}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AttendanceModule;
