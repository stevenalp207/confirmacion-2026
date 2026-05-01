import { useState, useEffect, useCallback } from 'react';
import { numeroCatequesisCatequistas, getCatequesisLabelCatequistas } from '../data/grupos';
import { catequistas } from '../data/catequistas';
import { supabase } from '../config/supabase';
import { Search, Filter, MapPin, ArrowLeft, Users, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const GROUP_STYLES = {
  piedad: {
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-800'
  },
  consejo: {
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-800'
  },
  fortaleza: {
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-800'
  },
  sabiduria: {
    text: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-800'
  },
  ciencia: {
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-800'
  },
  temor: {
    text: 'text-[oklch(28.6%_0.066_53.813)]',
    badge: 'bg-[oklch(28.6%_0.066_53.813_/_0.18)] text-[oklch(28.6%_0.066_53.813)]'
  },
  entendimiento: {
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800'
  }
};

const normalizeGroupName = (value = '') => {
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

const getGroupStyle = (groupName = '') => {
  const groupKey = normalizeGroupName(groupName);

  if (GROUP_STYLES[groupKey]) return GROUP_STYLES[groupKey];
  if (groupKey.includes('temor')) return GROUP_STYLES.temor;

  return null;
};

const getGroupDisplayName = (groupName = '') => {
  const groupKey = normalizeGroupName(groupName);

  if (groupKey.includes('temor')) return 'Temor de Dios';

  return groupName;
};

const getPdfEstadoLabel = (estado) => {
  switch (estado) {
    case 'presente':
      return 'P';
    case 'justificado':
      return 'J';
    case 'ausente':
    default:
      return 'A';
  }
};

const getPdfCatequesisShortLabel = (index) => {
  if (index === 0) return 'R0';
  if (index === 1) return 'COM';
  if (index === 2) return 'ETM';
  if (index === 14) return 'RF';
  if (index === 23) return 'RP';
  if (index === 27) return 'EC';

  if (index < 14) return `C${index - 2}`;
  if (index < 23) return `C${index - 3}`;
  if (index < 27) return `C${index - 4}`;
  return `C${index - 5}`;
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

// Recibe user como prop
function CatequistasModule({ onBack, user }) {
  const [catequistasState, setCatequistasState] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedEventForDownload, setSelectedEventForDownload] = useState(0);
  
  // Generar array de índices de catequesis [0, 1, 2, ..., numeroCatequesisCatequistas-1]
  const catequesisIndices = Array.from({ length: numeroCatequesisCatequistas }, (_, i) => i);

  // Obtener grupos únicos de catequistas
  const uniqueGroups = [...new Set(catequistas.map(c => c.grupo))];

  const loadCatequistas = useCallback(async () => {
    try {
      const newState = {};

      // Cargar TODOS los catequistas sin filtrar por grupo
      const { data, error } = await supabase
        .from('asistencia_catequistas')
        .select('*')
        .order('catequista_nombre', { ascending: true });

      if (error) {
        console.error('Error loading catequistas:', error);
      } else if (data) {
        data.forEach(item => {
          if (!newState[item.catequista_nombre]) {
            newState[item.catequista_nombre] = {};
          }
          newState[item.catequista_nombre][item.catequesis_num] = item.estado;
        });
      }

      setCatequistasState(newState);
    } catch (error) {
      console.error('Error loading catequistas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatequistas();
  }, []);

  const handleEstadoChange = async (catequista, catequesisNum) => {
    const estadoActual = catequistasState[catequista]?.[catequesisNum] || 'ausente';
    
    const ciclo = {
      'ausente': 'presente',
      'presente': 'justificado',
      'justificado': 'ausente'
    };
    
    const nuevoEstado = ciclo[estadoActual];

    try {
      // Primero verificar si existe
      const { data: existing } = await supabase
        .from('asistencia_catequistas')
        .select('id')
        .eq('catequista_nombre', catequista)
        .eq('catequesis_num', catequesisNum)
        .single();

      let error;
      
      if (existing) {
        // Si existe, actualizar
        const result = await supabase
          .from('asistencia_catequistas')
          .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
          .eq('catequista_nombre', catequista)
          .eq('catequesis_num', catequesisNum);
        error = result.error;
      } else {
        // Si no existe, insertar
        const result = await supabase
          .from('asistencia_catequistas')
          .insert({
            catequista_nombre: catequista,
            catequesis_num: catequesisNum,
            estado: nuevoEstado,
            grupo: 'General'
          });
        error = result.error;
      }

      if (error) {
        console.error('Error saving estado:', error);
        alert('Error al guardar: ' + error.message);
        return;
      }

      // Actualiza el estado local
      setCatequistasState(prev => ({
        ...prev,
        [catequista]: {
          ...prev[catequista],
          [catequesisNum]: nuevoEstado
        }
      }));
    } catch (error) {
      console.error('Error changing estado:', error);
      alert('Error al cambiar el estado');
    }
  };

  // Función para filtrar catequistas
  let filteredCatequistas = catequistas.filter(catequista => {
    const matchesSearch = catequista.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroups.length === 0 || selectedGroups.includes(catequista.grupo);
    return matchesSearch && matchesGroup;
  });

  // Si el usuario pertenece a uno de los grupos especiales, filtrar catequistas por ese grupo
  const gruposEspeciales = [
    'Consejo', 'Temor de Dios', 'Ciencia', 'Fortaleza', 'Entendimiento', 'Piedad', 'Sabiduria'
  ];
  const gruposEspecialesNormalizados = gruposEspeciales.map(normalizeGroupName);

  const resolveUserGroup = () => {
    if (!user) return null;

    const candidates = [user.grupo, user.rol, user.usuario].filter(Boolean);

    for (const candidate of candidates) {
      const normalizedCandidate = normalizeGroupName(candidate);
      const index = gruposEspecialesNormalizados.indexOf(normalizedCandidate);
      if (index >= 0) return gruposEspeciales[index];
    }

    return null;
  };

  const userScopedGroup = resolveUserGroup();

  if (userScopedGroup) {
    filteredCatequistas = filteredCatequistas.filter(
      (c) => normalizeGroupName(c.grupo) === normalizeGroupName(userScopedGroup)
    );
  }

  filteredCatequistas = filteredCatequistas.sort((a, b) => {
    if (a.grupo !== b.grupo) {
      return a.grupo.localeCompare(b.grupo);
    }
    return a.nombre.localeCompare(b.nombre);
  });

  // Función para alternar selección de grupo
  const toggleGroup = (grupo) => {
    setSelectedGroups(prev =>
      prev.includes(grupo)
        ? prev.filter(g => g !== grupo)
        : [...prev, grupo]
    );
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'presente':
        return 'bg-green-100 text-green-800 border-green-400';
      case 'justificado':
        return 'bg-purple-100 text-purple-800 border-purple-400';
      case 'ausente':
        return 'bg-red-100 text-red-800 border-red-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-400';
    }
  };

  const getEstadoIcon = (estado) => {
    switch(estado) {
      case 'presente':
        return '✓';
      case 'justificado':
        return '✓';
      case 'ausente':
        return '✗';
      default:
        return '-';
    }
  };

  // Función para descargar asistencia de un evento específico en PDF
  const handleDownloadAsistencia = () => {
    const eventLabel = getCatequesisLabelCatequistas(selectedEventForDownload);
    
    // Preparar datos para la tabla
    const tableData = filteredCatequistas.map(catequista => {
      const estado = catequistasState[catequista.nombre]?.[selectedEventForDownload] || 'ausente';
      return [catequista.nombre, getGroupDisplayName(catequista.grupo), getPdfEstadoLabel(estado)];
    });

    // Crear PDF en formato carta
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });
    
    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Registro de Asistencia - Catequistas', 14, 12);
    
    // Subtítulo con el evento
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Evento: ${eventLabel}  |  Fecha: ${new Date().toLocaleDateString('es-CR')}`, 14, 18);
    
    // Calcular tamaño de fuente dinámico basado en cantidad de filas
    const numRows = tableData.length;
    let fontSize = 9;
    let cellPadding = 1.3;
    
    if (numRows > 45) {
      fontSize = 7;
      cellPadding = 0.8;
    } else if (numRows > 38) {
      fontSize = 8;
      cellPadding = 1;
    }
    
    // Tabla optimizada para una página
    const pageWidth = doc.internal.pageSize.getWidth();
    const fixedColWidths = 45 + 30; // grupo + estado
    const col0Width = pageWidth - fixedColWidths - 36; // 36 = margen * 2
    const marginLeft = 18;

    autoTable(doc, {
      startY: 22,
      head: [['Catequista', 'Grupo', 'Estado']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: fontSize,
        cellPadding: cellPadding,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: fontSize + 1
      },
      bodyStyles: {
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: col0Width },
        1: { cellWidth: 45, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' }
      },
      alternateRowStyles: {
        fillColor: [240, 248, 255]
      },
      margin: { left: marginLeft, right: marginLeft },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 2) {
          const estado = data.cell.raw;
          if (typeof estado === 'string') {
            if (estado === 'P') {
              applyPdfEstadoStyle(data.cell, 'presente');
            } else if (estado === 'J') {
              applyPdfEstadoStyle(data.cell, 'justificado');
            } else {
              applyPdfEstadoStyle(data.cell, 'ausente');
            }
          }
        }
      }
    });

    // Guardar PDF
    const filename = `asistencia_catequistas_${eventLabel.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const handleDownloadAsistenciaTodosEventos = () => {
    try {
      if (!filteredCatequistas.length) {
        alert('No hay catequistas para exportar');
        return;
      }

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'letter'
      });

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Registro Completo de Asistencia - Catequistas', 14, 14);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha de exportación: ${new Date().toLocaleDateString('es-CR')}`, 14, 20);

      const tableData = filteredCatequistas.map(catequista => {
        const row = [catequista.nombre, getGroupDisplayName(catequista.grupo)];

        catequesisIndices.forEach((catequesisNum) => {
          const estado = catequistasState[catequista.nombre]?.[catequesisNum] || 'ausente';
          row.push(getPdfEstadoLabel(estado));
        });

        return row;
      });

      autoTable(doc, {
        startY: 26,
        head: [[
          'Catequista',
          'Grupo',
          ...catequesisIndices.map((catequesisNum) => getPdfCatequesisShortLabel(catequesisNum))
        ]],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 5.6,
          cellPadding: 0.8,
          overflow: 'linebreak',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 6.2,
          cellPadding: 1
        },
        bodyStyles: {
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 52, halign: 'left' },
          1: { cellWidth: 26, halign: 'center' },
          ...catequesisIndices.reduce((acc, _, index) => {
            acc[index + 2] = { cellWidth: 6.2, halign: 'center' };
            return acc;
          }, {})
        },
        alternateRowStyles: {
          fillColor: [240, 248, 255]
        },
        margin: { left: 10, right: 10 },
        didParseCell: function(data) {
          if (data.section === 'body' && data.column.index >= 2) {
            const estado = data.cell.raw;
            if (estado === 'P') {
              applyPdfEstadoStyle(data.cell, 'presente');
            } else if (estado === 'J') {
              applyPdfEstadoStyle(data.cell, 'justificado');
            } else {
              applyPdfEstadoStyle(data.cell, 'ausente');
            }
          }
        }
      });

      const filename = `asistencia_catequistas_completa_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('Error generando PDF completo:', error);
      alert('Error al generar el PDF completo: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 sm:py-8 px-3 sm:px-4">
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
                Catequistas
              </h1>
              <p className="text-gray-600 mt-2 text-xs sm:text-sm lg:text-base">
                Registra la asistencia de todos los catequistas
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">

          {/* Sección de Filtros */}
          <div className="mb-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
            {/* Búsqueda por nombre */}
            <div className="mb-5">
              <label className="text-sm sm:text-base font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Search className="w-5 h-5" /> Buscar catequista por nombre
              </label>
              <input
                type="text"
                placeholder="Escribe el nombre del catequista..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>

            {/* Filtro por grupo: solo mostrar si el usuario NO pertenece a un grupo especial */}
            {!userScopedGroup && (
                <div>
                  <label className="text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Filtrar por grupo
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedGroups([])}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-bold transition ${
                        selectedGroups.length === 0
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      Todos ({catequistas.length})
                    </button>
                    {uniqueGroups.map(grupo => {
                      const count = catequistas.filter(c => c.grupo === grupo).length;
                      const isSelected = selectedGroups.includes(grupo);
                      const groupStyle = getGroupStyle(grupo);

                      const selectedClass = groupStyle
                        ? `${groupStyle.badge} ring-2 ring-offset-1 ring-gray-300 shadow-md`
                        : 'bg-purple-600 text-white shadow-md';

                      const unselectedClass = groupStyle
                        ? `${groupStyle.badge} opacity-90 hover:opacity-100`
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200';

                      return (
                        <button
                          key={grupo}
                          onClick={() => toggleGroup(grupo)}
                          className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-bold transition ${
                            isSelected
                              ? selectedClass
                              : unselectedClass
                          }`}
                        >
                          {getGroupDisplayName(grupo)} <span className="text-xs bg-gray-300 px-2 py-1 rounded ml-1">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Información de resultados */}
            <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
              <p className="text-sm sm:text-base text-blue-900 font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4" /> Mostrando: <span className="font-bold text-blue-600">{filteredCatequistas.length}</span> de {catequistas.length} catequistas
              </p>
            </div>

            {/* Descargar asistencia por evento */}
            <div className="mt-5 pt-5 border-t border-gray-200">
              <label className="text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                <Download className="w-4 h-4" /> Descargar asistencia por evento
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedEventForDownload}
                  onChange={(e) => setSelectedEventForDownload(Number(e.target.value))}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white"
                >
                  {catequesisIndices.map((catequesisNum) => (
                    <option key={catequesisNum} value={catequesisNum}>
                      {getCatequesisLabelCatequistas(catequesisNum)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleDownloadAsistencia}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-md"
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
              <p className="text-xs text-gray-500 mt-2">
                Se descargará la asistencia de los catequistas filtrados actualmente
              </p>
            </div>
          </div>

          {/* Tabla de Asistencia */}
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="text-gray-600 text-sm sm:text-base">Cargando datos...</div>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-3 sm:px-0">
                <table className="min-w-full bg-white border border-gray-300 rounded-lg border-separate border-spacing-0 shadow-sm">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 min-w-45 text-left text-xs sm:text-sm font-semibold text-gray-700 sticky left-0 bg-blue-50 z-20 border-r border-gray-200">Catequista</th>
                      <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 bg-blue-50">Grupo</th>
                      {catequesisIndices.map((catequesisNum) => (
                        <th
                          key={catequesisNum}
                          className="px-2 py-2 sm:py-3 text-center text-xs font-semibold text-gray-700 bg-blue-50 whitespace-nowrap"
                        >
                          {getCatequesisLabelCatequistas(catequesisNum)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCatequistas.length > 0 ? (
                      filteredCatequistas.map((catequista) => (
                        <tr key={catequista.nombre} className="border-t border-gray-200 hover:bg-gray-50 group">
                          <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 min-w-45 text-xs sm:text-sm font-medium text-gray-800 sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-200">
                            {catequista.nombre}
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-gray-600">
                            <span
                              className={`inline-block px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                                getGroupStyle(catequista.grupo)?.badge || 'bg-blue-50 text-blue-900'
                              }`}
                            >
                              {getGroupDisplayName(catequista.grupo)}
                            </span>
                          </td>
                          {catequesisIndices.map((catequesisNum) => {
                            const estado = catequistasState[catequista.nombre]?.[catequesisNum] || 'ausente';
                            const icon = getEstadoIcon(estado);
                            const colorClass = getEstadoColor(estado);
                            
                            return (
                              <td
                                key={`${catequista.nombre}-${catequesisNum}`}
                                className="px-1 sm:px-2 py-2 sm:py-3 text-center"
                              >
                                <button
                                  onClick={() => handleEstadoChange(catequista.nombre, catequesisNum)}
                                  className={`w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg border-2 font-bold text-xs sm:text-sm hover:shadow-md transition-all ${colorClass}`}
                                >
                                  {icon}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={catequesisIndices.length + 2} className="px-4 py-8 text-center text-gray-500">
                          <p className="font-medium">No se encontraron catequistas con los filtros aplicados</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Leyenda */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm sm:text-base text-gray-700 mb-2">Leyenda:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 text-green-800 border-2 border-green-400 rounded font-bold flex items-center justify-center text-sm sm:text-base">✓</div>
                <span className="text-xs sm:text-sm text-gray-600">Presente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 text-purple-800 border-2 border-purple-400 rounded font-bold flex items-center justify-center text-sm sm:text-base">J</div>
                <span className="text-xs sm:text-sm text-gray-600">Justificado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 text-red-800 border-2 border-red-400 rounded font-bold flex items-center justify-center text-sm sm:text-base">✗</div>
                <span className="text-xs sm:text-sm text-gray-600">Ausente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CatequistasModule;
