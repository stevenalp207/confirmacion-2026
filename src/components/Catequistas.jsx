import { useState, useEffect, useCallback } from 'react';
import { fechasJueves } from '../data/grupos';
import { supabase } from '../config/supabase';

function Catequistas({ grupo }) {
  const [catequistasState, setCatequistasState] = useState({});
  const [catequistasNombres, setCatequistasNombres] = useState(['Catequista 1', 'Catequista 2', 'Catequista 3']);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCatequistas = useCallback(async () => {
    try {
      const newState = {};

      const { data, error } = await supabase
        .from('asistencia_catequistas')
        .select('*')
        .eq('grupo', grupo);

      if (error) {
        console.error('Error loading catequistas:', error);
      } else if (data) {
        const nombres = new Set(catequistasNombres);
        data.forEach(item => {
          nombres.add(item.catequista_nombre);
          if (!newState[item.catequista_nombre]) {
            newState[item.catequista_nombre] = {};
          }
          newState[item.catequista_nombre][item.fecha] = item.estado;
        });
        setCatequistasNombres(Array.from(nombres));
      }

      setCatequistasState(newState);
    } catch (error) {
      console.error('Error loading catequistas:', error);
    } finally {
      setLoading(false);
    }
  }, [grupo]);

  useEffect(() => {
    if (grupo) {
      loadCatequistas();
    }
  }, [grupo, loadCatequistas]);

  const handleEstadoChange = async (catequista, fecha) => {
    const estadoActual = catequistasState[catequista]?.[fecha] || 'ausente';
    
    const ciclo = {
      'ausente': 'presente',
      'presente': 'justificado',
      'justificado': 'ausente'
    };
    
    const nuevoEstado = ciclo[estadoActual];

    try {
      const { error } = await supabase
        .from('asistencia_catequistas')
        .upsert({
          grupo,
          catequista_nombre: catequista,
          fecha,
          estado: nuevoEstado
        }, {
          onConflict: 'grupo,catequista_nombre,fecha'
        });

      if (error) {
        console.error('Error updating catequista:', error);
        return;
      }

      setCatequistasState(prev => ({
        ...prev,
        [catequista]: {
          ...prev[catequista],
          [fecha]: nuevoEstado
        }
      }));
    } catch (error) {
      console.error('Error updating catequista:', error);
    }
  };

  const agregarCatequista = () => {
    if (nuevoNombre.trim() && !catequistasNombres.includes(nuevoNombre.trim())) {
      const nombre = nuevoNombre.trim();
      setCatequistasNombres([...catequistasNombres, nombre]);
      setCatequistasState(prev => ({
        ...prev,
        [nombre]: {}
      }));
      setNuevoNombre('');
    }
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Cargando catequistas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8 pt-8 border-t-2 border-gray-300">
      <h3 className="text-xl font-bold text-gray-800">Asistencia de Catequistas</h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && agregarCatequista()}
          placeholder="Nombre del catequista"
          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
        />
        <button
          onClick={agregarCatequista}
          className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg transition"
        >
          + Agregar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-100">
                Catequista
              </th>
              {fechasJueves.map(fecha => (
                <th key={fecha} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 min-w-max">
                  {formatFecha(fecha)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {catequistasNombres.map((catequista) => (
              <tr key={catequista} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-800 font-medium sticky left-0 bg-white hover:bg-gray-50">
                  {catequista}
                </td>
                {fechasJueves.map(fecha => {
                  const estado = catequistasState[catequista]?.[fecha] || 'ausente';
                  
                  let bgColor, icon;
                  if (estado === 'presente') {
                    bgColor = 'bg-green-500';
                    icon = '✓';
                  } else if (estado === 'justificado') {
                    bgColor = 'bg-yellow-500';
                    icon = '!';
                  } else {
                    bgColor = 'bg-red-500';
                    icon = '✗';
                  }
                  
                  return (
                    <td key={fecha} className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleEstadoChange(catequista, fecha)}
                        className={`w-10 h-10 rounded-lg font-bold text-white text-lg transition-all transform hover:scale-110 active:scale-95 shadow-md cursor-pointer ${bgColor}`}
                        title={estado}
                      >
                        {icon}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Catequistas;
