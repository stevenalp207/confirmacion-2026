import { useState, useEffect } from 'react';
import { grupos } from '../data/grupos';
import Attendance from '../components/Attendance';
import { gruposData } from '../data/grupos';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function AttendanceModule({ onBack, user }) {
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="hover:bg-green-700 px-3 py-2 rounded-lg transition-colors"
              >
                ← Atrás
              </button>
              <h1 className="text-xl font-bold">Asistencia - Confirmación 2026</h1>
            </div>

            <div>
              <select
                value={currentGroup}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="bg-green-700 text-white px-4 py-2 rounded-lg border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-300"
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
              Módulo de Asistencia
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Selecciona un grupo para registrar asistencias
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gruposDisponibles.map((grupo) => (
                <button
                  key={grupo}
                  onClick={() => handleGroupChange(grupo)}
                  className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg hover:border-green-500 hover:shadow-lg transition-all transform hover:scale-105 text-left"
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Grupo: {currentGroup}
                  </h1>
                  <p className="text-gray-600">
                    Registra la asistencia de los estudiantes
                  </p>
                </div>
                <button
                  onClick={generarPDFAsistencia}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                  Imprimir Lista PDF
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="text-gray-600">Cargando datos...</div>
                </div>
              ) : (
                <Attendance grupo={currentGroup} estudiantes={estudiantes} user={user} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AttendanceModule;
