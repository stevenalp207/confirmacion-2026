import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

function Cartas({ grupo, estudiantes }) {
  const [cartasState, setCartasState] = useState({});
  const [loading, setLoading] = useState(true);

  const loadCartas = useCallback(async () => {
    try {
      const newState = {};
      
      // Usar el ID real del estudiante
      for (const key in estudiantes) {
        const estudianteId = estudiantes[key].id;
        newState[estudianteId] = false;
      }

      const { data, error } = await supabase
        .from('cartas_entregadas')
        .select('*')
        .eq('grupo', grupo);

      if (error) {
        console.error('Error loading cartas:', error);
      } else if (data) {
        data.forEach(item => {
          if (newState.hasOwnProperty(item.estudiante_id)) {
            newState[item.estudiante_id] = item.entregada;
          }
        });
      }

      setCartasState(newState);
    } catch (error) {
      console.error('Error loading cartas:', error);
    } finally {
      setLoading(false);
    }
  }, [grupo, estudiantes]);

  useEffect(() => {
    if (grupo && estudiantes) {
      loadCartas();
    }
  }, [grupo, estudiantes, loadCartas]);

  const handleCheckboxChange = async (estudianteId) => {
    const currentValue = cartasState[estudianteId] || false;
    const newValue = !currentValue;

    try {
      const { error } = await supabase
        .from('cartas_entregadas')
        .upsert({
          grupo,
          estudiante_id: estudianteId,
          entregada: newValue
        }, {
          onConflict: 'grupo,estudiante_id'
        });

      if (error) {
        console.error('Error updating carta:', error);
        alert('Error al actualizar la carta');
        return;
      }

      setCartasState(prev => ({
        ...prev,
        [estudianteId]: newValue
      }));
    } catch (error) {
      console.error('Error updating carta:', error);
      alert('Error al actualizar la carta');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Cargando cartas...</div>
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

  const totalEntregadas = Object.values(cartasState).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Entrega de Cartas</h2>
        <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-semibold">
          {totalEntregadas} / {Object.keys(estudiantes).length}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estudiante</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Carta Entregada</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(estudiantes).map(([_key, estudiante]) => {
              const estudianteId = estudiante.id;
              return (
                <tr key={estudianteId} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                    {estudiante.nombre}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={cartasState[estudianteId] || false}
                      onChange={() => handleCheckboxChange(estudianteId)}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
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

export default Cartas;
