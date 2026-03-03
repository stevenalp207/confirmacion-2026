import { useState, useEffect, useCallback } from 'react';
import { Lock, Download } from 'lucide-react';
import { tiposDocumentos } from '../data/grupos';
import { supabase } from '../config/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function Documents({ grupo, estudiantes, user }) {
  const [documentosState, setDocumentosState] = useState({});
  const [loading, setLoading] = useState(true);

  // Función para verificar si el usuario puede editar documentos
  const canEditDocuments = () => {
    return true;
  };

  const loadDocumentos = useCallback(async () => {
    try {
      const newState = {};
      
      // Inicializar estado vacío para todos los estudiantes usando el ID real
      for (const key in estudiantes) {
        const estudianteId = estudiantes[key].id; // Usar el ID real del estudiante
        newState[estudianteId] = {};
      }

      // Cargar documentos desde Supabase
      const { data, error } = await supabase
        .from('documentos_entregados')
        .select('*')
        .eq('grupo', grupo);

      if (error) {
        console.error('Error loading documentos:', error);
      } else if (data) {
        // Procesar datos de Supabase
        data.forEach(item => {
          if (newState[item.estudiante_id]) {
            newState[item.estudiante_id][item.documento_tipo] = item.entregado;
          }
        });
      }

      setDocumentosState(newState);
    } catch (error) {
      console.error('Error loading documentos:', error);
    } finally {
      setLoading(false);
    }
  }, [grupo, estudiantes]);

  useEffect(() => {
    if (grupo && estudiantes) {
      loadDocumentos();
    }
  }, [grupo, estudiantes, loadDocumentos]);

  const handleCheckboxChange = async (estudianteId, docTipo) => {
    // Verificar permiso antes de permitir cambio
    if (!canEditDocuments()) {
      return;
    }

    const currentValue = documentosState[estudianteId]?.[docTipo] || false;
    const newValue = !currentValue;

    try {
      // Guardar en Supabase
      const { error } = await supabase
        .from('documentos_entregados')
        .upsert({
          grupo,
          estudiante_id: estudianteId,
          documento_tipo: docTipo,
          entregado: newValue
        }, {
          onConflict: 'grupo,estudiante_id,documento_tipo'
        });

      if (error) {
        console.error('Error updating documento:', error);
        alert('Error al actualizar el documento');
        return;
      }

      // Update local state
      setDocumentosState(prev => ({
        ...prev,
        [estudianteId]: {
          ...prev[estudianteId],
          [docTipo]: newValue
        }
      }));
    } catch (error) {
      console.error('Error updating documento:', error);
      alert('Error al actualizar el documento');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Cargando documentos...</div>
      </div>
    );
  }

  if (!estudiantes || Object.keys(estudiantes).length === 0) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg">
        No hay estudiantes en este grupo.
      </div>
    );
  }

  const descargarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Entrega de Documentos - ${grupo}`, pageWidth / 2, 12, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CR')}`, pageWidth / 2, 18, { align: 'center' });

    const headers = ['Estudiante', ...tiposDocumentos.map(d => d.nombre)];
    const tableData = Object.values(estudiantes).map(est => [
      est.nombre,
      ...tiposDocumentos.map(d => documentosState[est.id]?.[d.id] ? 'Si' : 'No')
    ]);

    // Calcular ancho de tabla y centrar
    const colWidth = 22; // ancho para cada columna de documento
    const col0Width = 50;
    const totalTableWidth = col0Width + (tiposDocumentos.length * colWidth);
    const marginLeft = (pageWidth - totalTableWidth) / 2;

    // Crear estilos de columnas dinámicamente
    const columnStyles = { 0: { halign: 'left', cellWidth: col0Width } };
    tiposDocumentos.forEach((_, i) => {
      columnStyles[i + 1] = { cellWidth: colWidth };
    });

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 22,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1.5, halign: 'center' },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', halign: 'center' },
      columnStyles: columnStyles,
      margin: { left: marginLeft, right: marginLeft }
    });

    doc.save(`Documentos_${grupo}_2026.pdf`);
  };

  const descargarPDFAcuseRecibido = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Acuse de Recibido - ${grupo}`, pageWidth / 2, 15, { align: 'center' });

    const headers = [[
      'Estudiante',
      'Firma del estudiante que confirma entregado',
      'Firma de la persona que recibe'
    ]];

    const tableData = Object.values(estudiantes)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
      .map((est) => [est.nombre, '', '']);

    const numRows = tableData.length;
    let fontSize = 9;
    let cellPadding = 2.5;
    let minCellHeight = 14;

    if (numRows > 16) {
      fontSize = 8;
      cellPadding = 2;
      minCellHeight = 11;
    }
    if (numRows > 24) {
      fontSize = 9;
      cellPadding = 1.5;
      minCellHeight = 10;
    }

    const colWidths = { col0: 50, col1: 65, col2: 65 };
    const tableWidth = colWidths.col0 + colWidths.col1 + colWidths.col2;
    const marginLeft = (pageWidth - tableWidth) / 2;

    autoTable(doc, {
      head: headers,
      body: tableData,
      startY: 18,
      theme: 'grid',
      styles: {
        fontSize,
        cellPadding,
        minCellHeight,
        valign: 'middle',
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        textColor: [0, 0, 0]
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.2,
        lineColor: [0, 0, 0],
        fontSize: fontSize + 1
      },
      bodyStyles: {
        textColor: [0, 0, 0]
      },
      columnStyles: {
        0: { cellWidth: colWidths.col0, halign: 'left' },
        1: { cellWidth: colWidths.col1, halign: 'left' },
        2: { cellWidth: colWidths.col2, halign: 'left' }
      },
      margin: { left: marginLeft, right: marginLeft, top: 18, bottom: 10 }
    });

    doc.save(`Acuse_Recibido_Documentos_${grupo}_2026.pdf`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-2xl font-bold text-gray-800">Entrega de Documentos</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={descargarPDF}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
          >
            <Download size={16} />
            PDF
          </button>
          <button
            onClick={descargarPDFAcuseRecibido}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
          >
            <Download size={16} />
            Acuse PDF
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle px-4 sm:px-0">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-blue-50 border-b-2 border-blue-200">
              <tr>
                <th className="px-4 sm:px-4 py-4 text-left text-sm sm:text-base font-bold text-gray-800 sticky left-0 bg-blue-50 z-10 shadow-sm">Estudiante</th>
                {tiposDocumentos.map(doc => (
                  <th key={doc.id} className="px-2 sm:px-4 py-4 text-center text-xs sm:text-sm font-bold text-gray-700 whitespace-normal sm:whitespace-nowrap min-w-[80px] sm:min-w-[120px]">
                    <div className="flex flex-col gap-1">
                      <span className="hidden sm:block">{doc.nombre}</span>
                      <span className="sm:hidden text-xs font-semibold break-words">{doc.nombre}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(estudiantes).map(([_key, estudiante]) => {
                const estudianteId = estudiante.id;
                return (
                  <tr key={estudianteId} className="border-t border-gray-200 hover:bg-blue-50">
                    <td className="px-4 sm:px-4 py-4 text-sm sm:text-base text-gray-800 font-medium sticky left-0 bg-white hover:bg-blue-50 z-10 shadow-sm">
                      {estudiante.nombre}
                    </td>
                    {tiposDocumentos.map(doc => (
                      <td key={doc.id} className="px-3 sm:px-4 py-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <input
                            type="checkbox"
                            checked={documentosState[estudianteId]?.[doc.id] || false}
                            onChange={() => handleCheckboxChange(estudianteId, doc.id)}
                            disabled={!canEditDocuments()}
                            className={`w-5 h-5 border-2 border-gray-300 bg-white rounded cursor-pointer accent-blue-600 ${
                              !canEditDocuments() ? 'opacity-50 cursor-not-allowed' : 'text-blue-600'
                            }`}
                          />
                          {!canEditDocuments() && (
                            <Lock size={16} className="text-gray-400" />
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Documents;
