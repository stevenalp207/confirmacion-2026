import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

function Pagos({ grupo, estudiantes, catequistas, esCatequistas }) {
  const [pagosState, setPagosState] = useState({});
  const [loading, setLoading] = useState(true);

  // Monto requerido según el tipo
  const montoRequerido = esCatequistas ? 15000 : 50000;
  const tablaNombre = esCatequistas ? 'pagos_catequistas' : 'pagos_retiro';

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

  const handleMontoPagado = async (id, nuevoMonto) => {
    const pagado = nuevoMonto >= montoRequerido;

    try {
      if (esCatequistas) {
        // Guardar pago de catequista
        const { error } = await supabase
          .from('pagos_catequistas')
          .upsert({
            catequista_nombre: id,
            monto_requerido: montoRequerido,
            monto_pagado: nuevoMonto,
            pagado: pagado
          }, {
            onConflict: 'catequista_nombre'
          });

        if (error) {
          console.error('Error updating pago:', error);
          alert('Error al actualizar el pago');
          return;
        }
      } else {
        // Guardar pago de estudiante
        const estudiante = estudiantes[id];
        const { error } = await supabase
          .from('pagos_retiro')
          .upsert({
            grupo,
            estudiante_id: id,
            estudiante_nombre: estudiante.nombre,
            monto_requerido: montoRequerido,
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

  const totalPagado = Object.values(pagosState).reduce((sum, p) => sum + p.monto_pagado, 0);
  const cantidadPersonas = esCatequistas ? catequistas.length : Object.keys(estudiantes).length;
  const totalRequerido = cantidadPersonas * montoRequerido;
  const completados = Object.values(pagosState).filter(p => p.pagado).length;

  // Crear lista de personas según el tipo
  const listaPersonas = esCatequistas 
    ? catequistas.map(nombre => ({ id: nombre, nombre: nombre }))
    : Object.entries(estudiantes).map(([id, est]) => ({ id, nombre: est.nombre }));

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
                    <input
                      type="number"
                      value={pago.monto_pagado}
                      onChange={(e) => handleMontoPagado(id, parseInt(e.target.value) || 0)}
                      className="w-32 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-center font-semibold"
                      min="0"
                    />
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
