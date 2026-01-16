import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

function Pagos({ grupo, estudiantes }) {
  const [pagosState, setPagosState] = useState({});
  const [loading, setLoading] = useState(true);

  const loadPagos = useCallback(async () => {
    try {
      const newState = {};
      
      // Inicializar pagos para todos los estudiantes
      for (const estudianteId in estudiantes) {
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

      setPagosState(newState);
    } catch (error) {
      console.error('Error loading pagos:', error);
    } finally {
      setLoading(false);
    }
  }, [grupo, estudiantes]);

  useEffect(() => {
    if (grupo && estudiantes) {
      loadPagos();
    }
  }, [grupo, estudiantes, loadPagos]);

  const handleMontoPagado = async (estudianteId, nuevoMonto) => {
    const estudiante = estudiantes[estudianteId];
    const pagado = nuevoMonto >= 50000;

    try {
      const { error } = await supabase
        .from('pagos_retiro')
        .upsert({
          grupo,
          estudiante_id: estudianteId,
          estudiante_nombre: estudiante.nombre,
          monto_requerido: 50000,
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

      setPagosState(prev => ({
        ...prev,
        [estudianteId]: {
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

  if (!estudiantes || Object.keys(estudiantes).length === 0) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg">
        No hay estudiantes en este grupo.
      </div>
    );
  }

  const totalPagado = Object.values(pagosState).reduce((sum, p) => sum + p.monto_pagado, 0);
  const totalRequerido = Object.keys(estudiantes).length * 50000;
  const completados = Object.values(pagosState).filter(p => p.pagado).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Requerido</div>
          <div className="text-2xl font-bold text-blue-600">
            ₡{totalRequerido.toLocaleString('es-CR')}
          </div>
        </div>
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Pagado</div>
          <div className="text-2xl font-bold text-green-600">
            ₡{totalPagado.toLocaleString('es-CR')}
          </div>
        </div>
        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
          <div className="text-sm text-gray-600">Completados</div>
          <div className="text-2xl font-bold text-purple-600">
            {completados} / {Object.keys(estudiantes).length}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estudiante</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Monto Pagado</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Requerido</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Estado</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(estudiantes).map(([id, estudiante]) => {
              const pago = pagosState[id];
              const falta = Math.max(0, 50000 - pago.monto_pagado);
              
              return (
                <tr key={id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                    {estudiante.nombre}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={pago.monto_pagado}
                      onChange={(e) => handleMontoPagado(id, parseInt(e.target.value) || 0)}
                      className="w-32 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-center font-semibold"
                      min="0"
                    />
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    ₡50.000
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
