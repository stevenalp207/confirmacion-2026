import { useState, useEffect, useCallback, useMemo } from 'react';
import { Lock, Download } from 'lucide-react';
import { supabase } from '../config/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function Pagos({ grupo, estudiantes, catequistas, esCatequistas, user }) {
  const [pagosState, setPagosState] = useState({});
  const [loading, setLoading] = useState(true);

  // Monto requerido según el tipo
  const montoRequerido = 50000;

  // Función para verificar si el usuario puede editar pagos
  const canEditPayments = () => {
    if (!user) return false;
    return user.rol === 'admin' || user.rol === 'financiero' || user.usuario === 'logistica';
  };

  const loadPagos = useCallback(async () => {
    try {
      const newState = {};
      
      if (esCatequistas) {
        // Inicializar pagos para todos los catequistas
        catequistas.forEach(nombre => {
          newState[nombre] = {
            monto_pagado: 0,
            pagado: false
          };
        });

        // Cargar pagos desde Supabase
        const { data, error } = await supabase
          .from('pagos_catequistas')
          .select('*');

        if (error) {
          console.error('Error loading pagos:', error);
        } else if (data) {
          data.forEach(item => {
            if (newState[item.catequista_nombre]) {
              newState[item.catequista_nombre] = {
                monto_pagado: item.monto_pagado,
                pagado: item.pagado
              };
            }
          });
        }
      } else {
        // Inicializar pagos para todos los estudiantes usando el ID real
        for (const key in estudiantes) {
          const estudianteId = estudiantes[key].id;
          newState[estudianteId] = {
            monto_pagado: 0,
            pagado: false
          };
        }

        // Cargar pagos desde Supabase
        const { data, error } = await supabase
          .from('pagos_retiro')
          .select('*')
          .eq('grupo', grupo);

        if (error) {
          console.error('Error loading pagos:', error);
        } else if (data) {
          data.forEach(item => {
            if (newState[item.estudiante_id]) {
              newState[item.estudiante_id] = {
                monto_pagado: item.monto_pagado,
                pagado: item.pagado
              };
            }
          });
        }
      }

      setPagosState(newState);
    } catch (error) {
      console.error('Error loading pagos:', error);
    } finally {
      setLoading(false);
    }
  }, [grupo, estudiantes, catequistas, esCatequistas]);

  useEffect(() => {
    if (esCatequistas ? catequistas : (grupo && estudiantes)) {
      loadPagos();
    }
  }, [grupo, estudiantes, catequistas, esCatequistas, loadPagos]);

  // Memoized calculations - MUST be before any conditional returns
  const totalPagado = useMemo(() => 
    Object.values(pagosState).reduce((sum, p) => sum + p.monto_pagado, 0),
    [pagosState]
  );

  const cantidadPersonas = useMemo(() => 
    esCatequistas ? catequistas?.length || 0 : Object.keys(estudiantes || {}).length,
    [esCatequistas, catequistas, estudiantes]
  );

  const totalRequerido = useMemo(() => 
    cantidadPersonas * montoRequerido,
    [cantidadPersonas, montoRequerido]
  );

  const completados = useMemo(() => 
    Object.values(pagosState).filter(p => p.pagado).length,
    [pagosState]
  );

  const listaPersonas = useMemo(() => {
    if (esCatequistas) {
      return (catequistas || []).map(nombre => ({ id: nombre, nombre: nombre }));
    }
    return Object.values(estudiantes || {}).map(est => ({ id: est.id, nombre: est.nombre }));
  }, [esCatequistas, catequistas, estudiantes]);

  const handleMontoPagado = async (id, nuevoMonto) => {
    // Verificar permiso antes de permitir cambio
    if (!canEditPayments()) {
      return;
    }

    const pagado = nuevoMonto >= montoRequerido;

    try {
      if (esCatequistas) {
        // Guardar pago de catequista
        const { error } = await supabase
          .from('pagos_catequistas')
          .upsert({
            grupo,
            catequista_nombre: id,
            monto_pagado: nuevoMonto,
            pagado: pagado
          }, {
            onConflict: 'grupo,catequista_nombre'
          });

        if (error) {
          console.error('Error updating pago:', error);
          alert('Error al actualizar el pago');
          return;
        }
      } else {
        // Guardar pago de estudiante
        const { error } = await supabase
          .from('pagos_retiro')
          .upsert({
            grupo,
            estudiante_id: id,
            monto_pagado: nuevoMonto,
            pagado: pagado
          }, {
            onConflict: 'grupo,estudiante_id'
          });

        if (error) {
          console.error('Error updating pago:', error);
          alert('Error al actualizar el pago');
          return;
        }
      }

      setPagosState(prev => ({
        ...prev,
        [id]: {
          monto_pagado: nuevoMonto,
          pagado: pagado
        }
      }));
    } catch (error) {
      console.error('Error updating pago:', error);
      alert('Error al actualizar el pago');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Cargando pagos...</div>
      </div>
    );
  }

  if (!esCatequistas && (!estudiantes || Object.keys(estudiantes).length === 0)) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg">
        No hay estudiantes en este grupo.
      </div>
    );
  }

  if (esCatequistas && (!catequistas || catequistas.length === 0)) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg">
        No hay catequistas registrados.
      </div>
    );
  }

  const descargarPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();

    const titulo = esCatequistas ? 'Pagos Catequistas' : `Pagos Retiro - ${grupo}`;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(titulo, pageWidth / 2, 12, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Pagado: ${totalPagado.toLocaleString()} / ${totalRequerido.toLocaleString()} CRC | Completados: ${completados}/${cantidadPersonas} | ${new Date().toLocaleDateString('es-CR')}`, pageWidth / 2, 18, { align: 'center' });

    const tableData = listaPersonas.map(({ id, nombre }) => {
      const pago = pagosState[id] || { monto_pagado: 0, pagado: false };
      const falta = Math.max(0, montoRequerido - pago.monto_pagado);
      return [
        nombre,
        pago.monto_pagado.toLocaleString(),
        montoRequerido.toLocaleString(),
        pago.pagado ? 'Completo' : `Falta ${falta.toLocaleString()}`
      ];
    });

    // Ajustar tamaño según cantidad de personas para que quepa en una página
    const fontSize = esCatequistas && cantidadPersonas > 25 ? 7.5 : 8.5;
    const cellPadding = esCatequistas && cantidadPersonas > 25 ? 1.5 : 2;

    // Calcular margen para centrar la tabla
    const colWidths = { col0: 65, col1: 30, col2: 30, col3: 38 };
    const tableWidth = colWidths.col0 + colWidths.col1 + colWidths.col2 + colWidths.col3;
    const marginLeft = (pageWidth - tableWidth) / 2;

    autoTable(doc, {
      head: [[esCatequistas ? 'Catequista' : 'Estudiante', 'Pagado', 'Requerido', 'Estado']],
      body: tableData,
      startY: 22,
      theme: 'grid',
      styles: { fontSize: fontSize, cellPadding: cellPadding },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', halign: 'center', fontSize: fontSize + 1 },
      columnStyles: {
        0: { cellWidth: colWidths.col0 },
        1: { cellWidth: colWidths.col1, halign: 'right' },
        2: { cellWidth: colWidths.col2, halign: 'right' },
        3: { cellWidth: colWidths.col3, halign: 'center' }
      },
      margin: { left: marginLeft, right: marginLeft }
    });

    doc.save(`Pagos_${esCatequistas ? 'Catequistas' : grupo}_2026.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <button
          onClick={descargarPDF}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
        >
          <Download size={16} />
          Descargar PDF
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Requerido</div>
          <div className="text-xl sm:text-2xl font-bold text-blue-600 wrap-break-word overflow-hidden">
            ₡{totalRequerido.toLocaleString('es-CR')}
          </div>
        </div>
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Pagado</div>
          <div className="text-xl sm:text-2xl font-bold text-green-600 wrap-break-word overflow-hidden">
            ₡{totalPagado.toLocaleString('es-CR')}
          </div>
        </div>
        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Completados</div>
          <div className="text-xl sm:text-2xl font-bold text-purple-600 wrap-break-word overflow-hidden">
            {completados} / {cantidadPersonas}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                {esCatequistas ? 'Catequista' : 'Estudiante'}
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Monto Pagado</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Requerido</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Estado</th>
            </tr>
          </thead>
          <tbody>
            {listaPersonas.map(({ id, nombre }) => {
              const pago = pagosState[id] || { monto_pagado: 0, pagado: false };
              const falta = Math.max(0, montoRequerido - pago.monto_pagado);
              
              return (
                <tr key={id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                    {nombre}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="number"
                        value={pago.monto_pagado}
                        onChange={(e) => handleMontoPagado(id, parseInt(e.target.value) || 0)}
                        disabled={!canEditPayments() || pago.monto_pagado >= montoRequerido}
                        className={`w-32 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-center font-semibold ${
                          !canEditPayments() ? 'opacity-50 bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        min="0"
                      />
                      {!canEditPayments() && (
                        <Lock size={16} className="text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    ₡{montoRequerido.toLocaleString('es-CR')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {pago.pagado ? (
                      <div className="inline-block bg-green-100 border-2 border-green-400 text-green-800 px-3 py-1 rounded-lg font-bold text-sm">
                        ✓ Completo
                      </div>
                    ) : (
                      <div className="inline-block bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-3 py-1 rounded-lg font-bold text-sm">
                        Falta: ₡{falta.toLocaleString('es-CR')}
                      </div>
                    )}
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

export default Pagos;
