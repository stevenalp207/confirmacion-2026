import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Users, Download } from 'lucide-react';
import { grupos, numeroCatequesis, getCatequesisLabel } from '../data/grupos';
import Attendance from '../components/Attendance';
import StudentDetail from '../components/StudentDetail';
import { gruposData } from '../data/grupos';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../config/supabase';

const GLOBAL_UNLOCK_KEY = 'GLOBAL';

const getPdfEstadoLabel = (estado) => {
  switch (estado) {
    case 'presente':
      return '✓ Presente';
    case 'justificado':
      return '✓ Justificado';
    case 'ausente':
    default:
      return '✗ Ausente';
  }
};

const applyPdfEstadoStyle = (cell, estado) => {
  if (estado === 'presente') {
    cell.styles.textColor = [22, 163, 74];
    cell.styles.fillColor = [220, 252, 231];
  } else if (estado === 'justificado') {
    cell.styles.textColor = [37, 99, 235];
    cell.styles.fillColor = [219, 234, 254];
  } else {
    cell.styles.textColor = [220, 38, 38];
    cell.styles.fillColor = [254, 226, 226];
  }

  cell.styles.fontStyle = 'bold';
};

function AttendanceModule({ onBack, user }) {
  const [currentGroup, setCurrentGroup] = useState('');
  const [estudiantes, setEstudiantes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedEventForDownload, setSelectedEventForDownload] = useState(0);
  const [asistenciasData, setAsistenciasData] = useState({});
  const [maxEnabledCatequesis, setMaxEnabledCatequesis] = useState(0);
  const [savingUnlock, setSavingUnlock] = useState(false);

  // Generar array de índices de catequesis
  const catequesisIndices = Array.from({ length: numeroCatequesis }, (_, i) => i);

  // Cargar asistencias del grupo actual
  useEffect(() => {
    const loadAsistencias = async () => {
      if (!currentGroup) return;
      
      try {
        const { data, error } = await supabase
          .from('asistencias')
          .select('*')
          .eq('grupo', currentGroup);

        if (error) {
          console.error('Error loading asistencias:', error);
        } else if (data) {
          const asistencias = {};
          data.forEach(item => {
            if (!asistencias[item.estudiante_id]) {
              asistencias[item.estudiante_id] = {};
            }
            asistencias[item.estudiante_id][item.catequesis_num] = item.estado;
          });
          setAsistenciasData(asistencias);
        }
      } catch (error) {
        console.error('Error loading asistencias:', error);
      }
    };

    loadAsistencias();
  }, [currentGroup]);

  // Filtrar grupos según el rol del usuario
  const gruposDisponibles = user?.rol === 'admin' || user?.usuario === 'logistica'
    ? grupos 
    : [user?.rol];

  const canManageUnlock = user?.rol === 'admin' || user?.usuario === 'logistica';

  const loadUnlockState = async () => {
    try {
      const { data, error } = await supabase
        .from('asistencia_desbloqueo')
        .select('max_enabled_catequesis')
        .eq('grupo', GLOBAL_UNLOCK_KEY)
        .maybeSingle();

      if (error) {
        console.error('Error loading unlock state:', error);
        setMaxEnabledCatequesis(0);
        return;
      }

      const value = typeof data?.max_enabled_catequesis === 'number' ? data.max_enabled_catequesis : 0;
      setMaxEnabledCatequesis(Math.max(0, Math.min(value, numeroCatequesis - 1)));
    } catch (error) {
      console.error('Error loading unlock state:', error);
      setMaxEnabledCatequesis(0);
    }
  };

  // Manejar navegación del historial para grupos
  useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state;
      if (state?.group && gruposDisponibles.includes(state.group)) {
        setCurrentGroup(state.group);
      } else if (state?.module === 'asistencia' && !state?.group) {
        // Si volvemos al módulo sin grupo específico
        const defaultGroup = user?.rol !== 'admin' && user?.usuario !== 'logistica' 
          ? user?.rol 
          : '';
        setCurrentGroup(defaultGroup);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Restaurar grupo del historial si existe
    const currentState = window.history.state;
    if (currentState?.group && gruposDisponibles.includes(currentState.group)) {
      setCurrentGroup(currentState.group);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user, gruposDisponibles]);

  // Cargar automáticamente el grupo si el usuario no es admin ni logística
  useEffect(() => {
    if (user && user.rol !== 'admin' && user.usuario !== 'logistica' && !currentGroup) {
      const defaultGroup = user.rol;
      setCurrentGroup(defaultGroup);
      
      // Actualizar historial con el grupo predeterminado
      if (window.history.state?.module === 'asistencia') {
        window.history.replaceState(
          { module: 'asistencia', group: defaultGroup },
          '',
          '#asistencia'
        );
      }
    }
  }, [user, currentGroup]);

  useEffect(() => {
    if (currentGroup) {
      loadEstudiantes(currentGroup);
    }
  }, [currentGroup]);

  useEffect(() => {
    loadUnlockState();
  }, []);

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
    
    // Agregar cambio de grupo al historial
    window.history.pushState(
      { module: 'asistencia', group: grupo },
      '',
      `#asistencia`
    );
  };

  const saveUnlockState = async (nextValue) => {
    const boundedValue = Math.max(0, Math.min(nextValue, numeroCatequesis - 1));
    setSavingUnlock(true);

    try {
      const { error } = await supabase
        .from('asistencia_desbloqueo')
        .upsert({
          grupo: GLOBAL_UNLOCK_KEY,
          max_enabled_catequesis: boundedValue,
          actualizado_por: user?.usuario || 'sistema',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'grupo'
        });

      if (error) {
        console.error('Error saving unlock state:', error);
        alert('No se pudo guardar el desbloqueo en Supabase. Revisa la tabla asistencia_desbloqueo.');
        return false;
      }

      setMaxEnabledCatequesis(boundedValue);
      return true;
    } catch (error) {
      console.error('Error saving unlock state:', error);
      alert('No se pudo guardar el desbloqueo en Supabase.');
      return false;
    } finally {
      setSavingUnlock(false);
    }
  };

  const handleUnlockNextAsistencia = async () => {
    if (maxEnabledCatequesis >= numeroCatequesis - 1) return;

    await saveUnlockState(maxEnabledCatequesis + 1);
  };

  const handleUnlockPreviousAsistencia = async () => {
    if (maxEnabledCatequesis <= 0) return;

    await saveUnlockState(maxEnabledCatequesis - 1);
  };

  const handleResetUnlockAsistencia = async () => {
    await saveUnlockState(0);
  };

  const handleStudentClick = (estudianteRef) => {
    if (!estudiantes) return;

    let estudiante = estudiantes[estudianteRef];
    let estudianteId = estudianteRef;

    if (!estudiante) {
      for (const key in estudiantes) {
        if (estudiantes[key].id === estudianteRef) {
          estudiante = estudiantes[key];
          estudianteId = estudiantes[key].id || key;
          break;
        }
      }
    } else {
      estudianteId = estudiante.id || estudianteRef;
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

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      });
      
      // Título
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(currentGroup, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      // Crear tabla
      const tableData = Object.entries(estudiantes).map(([id, estudiante]) => [
        estudiante.nombre,
        '' // Columna vacía para firma
      ]);

      // Calcular tamaño dinámico según cantidad de estudiantes
      const numRows = tableData.length;
      let fontSize = 10;
      let cellPadding = 5;
      
      if (numRows > 16) {
        fontSize = 8;
        cellPadding = 4;
      }
      if (numRows > 20) {
        fontSize = 8;
        cellPadding = 4;
      }
      if (numRows > 24) {
        fontSize = 7;
        cellPadding = 3;
      }

      // Calcular margen para centrar la tabla
      const pageWidth = doc.internal.pageSize.getWidth();
      const colWidths = { col0: 85, col1: 95 };
      const tableWidth = colWidths.col0 + colWidths.col1;
      const marginLeft = (pageWidth - tableWidth) / 2;

      autoTable(doc, {
        startY: 22,
        head: [['Catequizando', 'Firma Padre/Madre/Padrino/Madrina']],
        body: tableData,
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
          1: { cellWidth: colWidths.col1 }
        },
        margin: { left: marginLeft, right: marginLeft, top: 22 }
      });

      doc.save(`Lista_Asistencia_${currentGroup}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF: ' + error.message);
    }
  };

  // Función para descargar asistencia de un evento específico en PDF
  const handleDownloadAsistenciaEvento = () => {
    const eventLabel = getCatequesisLabel(selectedEventForDownload);
    
    // Preparar datos para la tabla
    const tableData = Object.entries(estudiantes).map(([key, estudiante]) => {
      const estado = asistenciasData[estudiante.id]?.[selectedEventForDownload] || 'ausente';
      return [estudiante.nombre, getPdfEstadoLabel(estado)];
    });

    // Crear PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });
    
    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`Registro de Asistencia - ${currentGroup}`, 14, 20);
    
    // Subtítulo con el evento
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Evento: ${eventLabel}  |  Fecha: ${new Date().toLocaleDateString('es-CR')}`, 14, 30);
    
    // Tabla
    const pageWidth = doc.internal.pageSize.getWidth();
    const colWidths = { col0: 120, col1: 40 };
    const tableWidth = colWidths.col0 + colWidths.col1;
    const marginLeftEvento = (pageWidth - tableWidth) / 2;

    autoTable(doc, {
      startY: 40,
      head: [['Catequizando', 'Estado']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 11,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 12
      },
      bodyStyles: {
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: colWidths.col0 },
        1: { cellWidth: colWidths.col1, halign: 'center' }
      },
      alternateRowStyles: {
        fillColor: [240, 253, 244]
      },
      margin: { left: marginLeftEvento, right: marginLeftEvento },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 1) {
          const estado = data.cell.raw;
          if (typeof estado === 'string') {
            if (estado.includes('Presente')) {
              applyPdfEstadoStyle(data.cell, 'presente');
            } else if (estado.includes('Justificado')) {
              applyPdfEstadoStyle(data.cell, 'justificado');
            } else {
              applyPdfEstadoStyle(data.cell, 'ausente');
            }
          }
        }
      }
    });

    // Guardar PDF
    const filename = `asistencia_${currentGroup}_${eventLabel.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const handleDownloadAsistenciaTodosEventos = () => {
    try {
      if (!currentGroup || !estudiantes) {
        alert('No hay datos para exportar');
        return;
      }

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'letter'
      });

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(`Registro Completo de Asistencia - ${currentGroup}`, 14, 16);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha de exportación: ${new Date().toLocaleDateString('es-CR')}`, 14, 22);

      const tableData = Object.entries(estudiantes).map(([id, estudiante]) => {
        const row = [estudiante.nombre];

        catequesisIndices.forEach((catequesisNum) => {
          const estado = asistenciasData[estudiante.id]?.[catequesisNum] || 'ausente';
          row.push(getPdfEstadoLabel(estado));
        });

        return row;
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const nameColWidth = 42;
      const remainingWidth = pageWidth - 28 - nameColWidth;
      const eventColWidth = remainingWidth / catequesisIndices.length;

      autoTable(doc, {
        startY: 28,
        head: [[
          'Catequizando',
          ...catequesisIndices.map((catequesisNum) => getCatequesisLabel(catequesisNum))
        ]],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: catequesisIndices.length > 12 ? 6 : 7,
          cellPadding: 1.5,
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
          textColor: [0, 0, 0]
        },
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 8
        },
        bodyStyles: {
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: nameColWidth, halign: 'left' },
          ...catequesisIndices.reduce((acc, _, index) => {
            acc[index + 1] = { cellWidth: eventColWidth };
            return acc;
          }, {})
        },
        margin: { left: 14, right: 14 },
        didParseCell: function(data) {
          if (data.section === 'body' && data.column.index > 0) {
            const estado = data.cell.raw;
            if (typeof estado === 'string') {
              if (estado.includes('Presente')) {
                applyPdfEstadoStyle(data.cell, 'presente');
              } else if (estado.includes('Justificado')) {
                applyPdfEstadoStyle(data.cell, 'justificado');
              } else {
                applyPdfEstadoStyle(data.cell, 'ausente');
              }
            }
          }
        }
      });

      const filename = `asistencia_completa_${currentGroup}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('Error generando PDF completo:', error);
      alert('Error al generar el PDF completo: ' + error.message);
    }
  };

  if (selectedStudent) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 sm:py-8 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => setSelectedStudent(null)}
              className="flex items-center gap-2 text-green-600 hover:text-green-800 font-semibold transition mb-3 sm:mb-4 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Volver a Asistencia
            </button>
            
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
              <div className="flex flex-col sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                    {selectedStudent.nombre}
                  </h1>
                  <p className="text-gray-600 mt-2 text-xs sm:text-sm lg:text-base">
                    Grupo: {selectedStudent.grupo}
                  </p>
                </div>
                {user && (
                  <div className="text-right text-xs sm:text-sm">
                    <p className="text-gray-600">Usuario: <span className="font-semibold">{user.usuario}</span></p>
                  </div>
                )}
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
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-green-600 hover:text-green-800 font-semibold transition mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Volver al Menú Principal
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="text-center mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2 sm:gap-3">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                Asistencia
              </h1>
              <p className="text-gray-600 mt-2 text-xs sm:text-sm lg:text-base">
                Registra la asistencia de los estudiantes en las reuniones de jueves
              </p>
              {user && (
                <p className="text-gray-600 text-xs sm:text-sm mt-2">
                  Usuario: <span className="font-semibold">{user.usuario}</span>
                </p>
              )}
            </div>

            {/* Selector de grupo */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Grupo
              </label>
              <select
                value={currentGroup}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="w-full sm:w-auto bg-white text-gray-900 px-3 sm:px-4 py-2.5 rounded-lg text-sm sm:text-base border-2 border-gray-300 hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all font-medium shadow-sm"
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

        {canManageUnlock && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Control Global de Asistencia</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Habilitado hasta: {getCatequesisLabel(maxEnabledCatequesis)} ({maxEnabledCatequesis + 1}/{numeroCatequesis})
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <button
                  onClick={handleUnlockNextAsistencia}
                  disabled={savingUnlock || maxEnabledCatequesis >= numeroCatequesis - 1}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base transition-colors shadow-md whitespace-nowrap"
                >
                  {savingUnlock ? 'Guardando...' : 'Habilitar siguiente asistencia'}
                </button>
                <button
                  onClick={handleUnlockPreviousAsistencia}
                  disabled={savingUnlock || maxEnabledCatequesis <= 0}
                  className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base transition-colors shadow-md whitespace-nowrap"
                >
                  Volver a la anterior
                </button>
                <button
                  onClick={handleResetUnlockAsistencia}
                  disabled={savingUnlock || maxEnabledCatequesis === 0}
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base transition-colors shadow-md whitespace-nowrap"
                >
                  Resetear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!currentGroup ? (
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <div className="text-center mb-6">
              <Users className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Selecciona un Grupo
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Elige un grupo para ver y registrar asistencias
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {gruposDisponibles.map((grupo) => (
                <button
                  key={grupo}
                  onClick={() => handleGroupChange(grupo)}
                  className="p-4 sm:p-5 bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl hover:border-green-400 hover:shadow-lg transition-all transform hover:scale-105 text-left group"
                >
                  <div className="font-bold text-gray-800 text-base sm:text-lg mb-1 group-hover:text-green-700 transition-colors">
                    {grupo}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Click para gestionar
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2 flex items-center gap-2">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    Grupo: {currentGroup}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Registra la asistencia de los estudiantes
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
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

              {/* Descargar asistencia por evento */}
              <div className="mt-5 pt-5 border-t border-gray-200">
                <label className="text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <Download className="w-4 h-4" /> Descargar asistencia por evento
                </label>
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <select
                    value={selectedEventForDownload}
                    onChange={(e) => setSelectedEventForDownload(Number(e.target.value))}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition bg-white"
                  >
                    {catequesisIndices.map((catequesisNum) => (
                      <option key={catequesisNum} value={catequesisNum}>
                        {getCatequesisLabel(catequesisNum)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleDownloadAsistenciaEvento}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    Descargar PDF
                  </button>
                  <button
                    onClick={handleDownloadAsistenciaTodosEventos}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    Descargar todos los eventos
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="text-gray-600 text-sm sm:text-base">Cargando datos...</div>
                </div>
              ) : (
                <Attendance 
                  grupo={currentGroup} 
                  estudiantes={estudiantes} 
                  user={user}
                  maxEnabledCatequesis={maxEnabledCatequesis}
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
