import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function Sabanas({ grupo, estudiantes }) {
  const [sabanasState, setSabanasState] = useState({});
  const [loading, setLoading] = useState(true);

  const loadSabanas = useCallback(async () => {
    try {
      const newState = {};
      
      // Usar el ID real del estudiante
      for (const key in estudiantes) {
        const estudianteId = estudiantes[key].id;
        newState[estudianteId] = false;
      }

      const { data, error } = await supabase
        .from('sabanas_entregadas')
        .select('*')
        .eq('grupo', grupo);

      if (error) {
        console.error('Error loading sábanas:', error);
      } else if (data) {
        data.forEach(item => {
          if (newState.hasOwnProperty(item.estudiante_id)) {
            newState[item.estudiante_id] = item.entregada;
          }
        });
      }

      setSabanasState(newState);
    } catch (error) {
      console.error('Error loading sábanas:', error);
    } finally {
      setLoading(false);
    }
  }, [grupo, estudiantes]);

  useEffect(() => {
    if (grupo && estudiantes) {
      loadSabanas();
    }
  }, [grupo, estudiantes, loadSabanas]);

  const handleCheckboxChange = async (estudianteId) => {
    const currentValue = sabanasState[estudianteId] || false;
    const newValue = !currentValue;

    try {
      const { error } = await supabase
        .from('sabanas_entregadas')
        .upsert({
          grupo,
          estudiante_id: estudianteId,
          entregada: newValue
        }, {
          onConflict: 'grupo,estudiante_id'
        });

      if (error) {
        console.error('Error updating sábana:', error);
        alert('Error al actualizar la sábana');
        return;
      }

      setSabanasState(prev => ({
        ...prev,
        [estudianteId]: newValue
      }));
    } catch (error) {
      console.error('Error updating sábana:', error);
      alert('Error al actualizar la sábana');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Cargando sábanas...</div>
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

  const totalEntregadas = Object.values(sabanasState).filter(Boolean).length;

  const descargarPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Entrega de Sábanas - ${grupo}`, pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Entregadas: ${totalEntregadas} / ${Object.keys(estudiantes).length} | Generado: ${new Date().toLocaleDateString('es-CR')}`, pageWidth / 2, 22, { align: 'center' });

    const tableData = Object.values(estudiantes).map(est => [
      est.nombre,
      sabanasState[est.id] ? 'Si' : 'No'
    ]);

    // Calcular margen para centrar la tabla
    const colWidths = { col0: 120, col1: 50 };
    const tableWidth = colWidths.col0 + colWidths.col1;
    const marginLeft = (pageWidth - tableWidth) / 2;

    autoTable(doc, {
      head: [['Estudiante', 'Estado']],
      body: tableData,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { cellWidth: colWidths.col0 },
        1: { cellWidth: colWidths.col1, halign: 'center' }
      },
      margin: { left: marginLeft, right: marginLeft }
    });

    doc.save(`Sabanas_${grupo}_2026.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Entrega Sábanas</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={descargarPDF}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
          >
            <Download size={16} />
            PDF
          </button>
          <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg font-semibold">
            {totalEntregadas} / {Object.keys(estudiantes).length}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg border-separate border-spacing-0">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 min-w-45 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-100 z-20 border-r border-gray-200">Estudiante</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Sábana Entregada</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(estudiantes).map(([_key, estudiante]) => {
              const estudianteId = estudiante.id;
              return (
                <tr key={estudianteId} className="border-t border-gray-200 hover:bg-gray-50 group">
                  <td className="px-4 py-3 min-w-45 text-sm text-gray-800 font-medium align-middle sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-200">
                    {estudiante.nombre}
                  </td>
                  <td className="px-4 py-3 text-center align-middle flex justify-center">
                    <input
                      type="checkbox"
                      checked={sabanasState[estudianteId] || false}
                      onChange={() => handleCheckboxChange(estudianteId)}
                      className="w-5 h-5 bg-white border-2 border-gray-400 text-orange-600 rounded focus:ring-orange-500 cursor-pointer accent-orange-600"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Sabanas;
