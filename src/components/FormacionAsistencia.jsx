import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { nombresFormacion } from '../data/formacion';

function FormacionAsistencia({ user }) {
  const [asistenciasState, setAsistenciasState] = useState({});
  const [loading, setLoading] = useState(true);
  const [personas, setPersonas] = useState([]);
  
  // 15 formaciones
  const NUM_FORMACIONES = 15;
  const formacionesIndices = Array.from({ length: NUM_FORMACIONES }, (_, i) => i + 1);

  // Cargar lista de personas (puedes ajustar según tu estructura)
  useEffect(() => {
    try {
      // Usar nombres locales de formacion.js
      const newPersonas = nombresFormacion.map((nombre, index) => ({
        id: `persona-${index}`,
        nombre: nombre
      }));
      setPersonas(newPersonas);
    } catch (error) {
      console.error('Error loading personas:', error);
      setPersonas([]);
    }
  }, []);

  useEffect(() => {
    if (personas.length === 0) return;

    const loadAsistencias = async () => {
      try {
        const newState = {};
        
        // Inicializar con estado 'ausente' por defecto
        personas.forEach(persona => {
          newState[persona.id] = {};
          for (const formacionNum of formacionesIndices) {
            newState[persona.id][formacionNum] = 'ausente';
          }
        });

        // Cargar asistencias desde Supabase
        const { data, error } = await supabase
          .from('asistencias_formacion')
          .select('*');

        if (error) {
          console.error('Error loading asistencias:', error);
          setAsistenciasState(newState);
        } else if (data && data.length > 0) {
          data.forEach(item => {
            // Buscar persona por nombre
            const persona = personas.find(p => p.nombre === item.formacion_nombre);
            if (persona && newState[persona.id]) {
              newState[persona.id][item.formacion_num] = item.estado;
            }
          });
          setAsistenciasState(newState);
        } else {
          setAsistenciasState(newState);
        }
      } catch (error) {
        console.error('Error loading asistencias:', error);
        // Inicializar con estado vacío
        const newState = {};
        personas.forEach(persona => {
          newState[persona.id] = {};
          for (const formacionNum of formacionesIndices) {
            newState[persona.id][formacionNum] = 'ausente';
          }
        });
        setAsistenciasState(newState);
      } finally {
        setLoading(false);
      }
    };

    loadAsistencias();
  }, [personas, formacionesIndices]);

  const handleEstadoChange = async (personaId, formacionNum) => {
    const estadoActual = asistenciasState[personaId]?.[formacionNum] || 'ausente';
    
    // Ciclo: ausente -> presente -> justificado -> ausente
    const ciclo = {
      'ausente': 'presente',
      'presente': 'justificado',
      'justificado': 'ausente'
    };
    
    const nuevoEstado = ciclo[estadoActual];
    const persona = personas.find(p => p.id === personaId);

    try {
      const { error } = await supabase
        .from('asistencias_formacion')
        .upsert({
          formacion_nombre: persona.nombre,
          formacion_num: formacionNum,
          estado: nuevoEstado
        }, {
          onConflict: 'formacion_nombre,formacion_num'
        });

      if (error) {
        console.error('Error updating asistencia:', error);
        alert('Error al actualizar la asistencia');
        return;
      }

      setAsistenciasState(prev => ({
        ...prev,
        [personaId]: {
          ...prev[personaId],
          [formacionNum]: nuevoEstado
        }
      }));
    } catch (error) {
      console.error('Error updating asistencia:', error);
      alert('Error al actualizar la asistencia');
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'presente':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'justificado':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ausente':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'presente':
        return '✓';
      case 'justificado':
        return 'J';
      case 'ausente':
        return '✗';
      default:
        return '-';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Cargando asistencias...</div>
      </div>
    );
  }

  if (personas.length === 0) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg">
        <p className="font-semibold">No hay personas registradas en formación.</p>
        <p className="text-sm mt-2">Por favor, crea registros en la tabla formacion_personas en Supabase.</p>
      </div>
    );
  }

  // Calcular totales
  const totalPresentesPorPersona = personas.map(persona => {
    const presentes = Object.values(asistenciasState[persona.id] || {})
      .filter(e => e === 'presente').length;
    return { id: persona.id, presentes };
  });

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
        <div className="text-sm text-gray-600">Total de formaciones a registrar</div>
        <div className="text-2xl font-bold text-blue-600">{NUM_FORMACIONES}</div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10">
                Persona
              </th>
              {formacionesIndices.map((num) => (
                <th
                  key={num}
                  className="px-2 py-3 text-center text-xs font-semibold text-gray-700 min-w-[40px]"
                >
                  F{num}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Presentes
              </th>
            </tr>
          </thead>
          <tbody>
            {personas.map((persona) => {
              const presentes = totalPresentesPorPersona.find(p => p.id === persona.id)?.presentes || 0;
              return (
                <tr key={persona.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium sticky left-0 bg-white z-10">
                    {persona.nombre}
                  </td>
                  {formacionesIndices.map((formacionNum) => {
                    const estado = asistenciasState[persona.id]?.[formacionNum] || 'ausente';
                    return (
                      <td key={formacionNum} className="px-2 py-3 text-center">
                        <button
                          onClick={() => handleEstadoChange(persona.id, formacionNum)}
                          className={`w-8 h-8 rounded border-2 font-bold text-xs cursor-pointer transition-colors ${getEstadoColor(estado)}`}
                          title={`${estado}: Click para cambiar`}
                        >
                          {getEstadoLabel(estado)}
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center text-sm font-semibold text-blue-700">
                    {presentes}/{NUM_FORMACIONES}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-600">
        <p><strong>Leyenda:</strong></p>
        <p>✓ = Presente | J = Justificado | ✗ = Ausente</p>
        <p className="mt-2">Haz clic en cualquier celda para cambiar el estado.</p>
      </div>
    </div>
  );
}

export default FormacionAsistencia;
