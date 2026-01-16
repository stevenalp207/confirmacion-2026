import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

function Sabanas({ grupo, estudiantes }) {
  const [sabanasState, setSabanasState] = useState({});
  const [loading, setLoading] = useState(true);

  const loadSabanas = useCallback(async () => {
    try {
      const newState = {};
      
      for (const estudianteId in estudiantes) {
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
            newState[item.estudiante_id] = item.entregado;
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
    const estudiante = estudiantes[estudianteId];

    try {
      const { error } = await supabase
        .from('sabanas_entregadas')
        .upsert({
          grupo,
          estudiante_id: estudianteId,
          estudiante_nombre: estudiante.nombre,
          entregado: newValue
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Entrega de Sábanas</h2>
        <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg font-semibold">
          {totalEntregadas} / {Object.keys(estudiantes).length}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estudiante</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Sábana Entregada</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(estudiantes).map(([id, estudiante]) => (
              <tr key={id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                  {estudiante.nombre}
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={sabanasState[id] || false}
                    onChange={() => handleCheckboxChange(id)}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Sabanas;
