import { useState, useEffect, useCallback } from 'react';
import { numeroCatequesis, getCatequesisLabel } from '../data/grupos';
import { supabase } from '../config/supabase';

function Attendance({ grupo, estudiantes, user, onStudentClick }) {
  const [asistenciasState, setAsistenciasState] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Generar array de índices de catequesis [0, 1, 2, ..., numeroCatequesis-1]
  const catequesisIndices = Array.from({ length: numeroCatequesis }, (_, i) => i);

  const loadAsistencias = useCallback(async () => {
    try {
      const newState = {};
      
      // Inicializar con estado 'ausente' por defecto
      // Iterar sobre los valores del objeto estudiantes para obtener los IDs reales
      for (const key in estudiantes) {
        const estudianteId = estudiantes[key].id; // Usar el ID real del estudiante
        newState[estudianteId] = {};
        for (const catequesisNum of catequesisIndices) {
          newState[estudianteId][catequesisNum] = 'ausente';
        }
      }

      // Cargar asistencias desde Supabase
      const { data, error } = await supabase
        .from('asistencias')
        .select('*')
        .eq('grupo', grupo);

      if (error) {
        console.error('Error loading asistencias:', error);
      } else if (data) {
        // Procesar datos de Supabase
        data.forEach(item => {
          if (newState[item.estudiante_id]) {
            newState[item.estudiante_id][item.catequesis_num] = item.estado;
          }
        });
      }

      setAsistenciasState(newState);
    } catch (error) {
      console.error('Error loading asistencias:', error);
    } finally {
      setLoading(false);
    }
  }, [grupo, estudiantes, catequesisIndices]);

  useEffect(() => {
    if (grupo && estudiantes) {
      loadAsistencias();
    }
  }, [grupo, estudiantes, loadAsistencias]);

  const handleEstadoChange = async (estudianteId, catequesisNum) => {
    const estadoActual = asistenciasState[estudianteId]?.[catequesisNum] || 'ausente';
    
    // Ciclo: ausente -> presente -> justificado -> ausente
    const ciclo = {
      'ausente': 'presente',
      'presente': 'justificado',
      'justificado': 'ausente'
    };
    
    const nuevoEstado = ciclo[estadoActual];
    
    // Encontrar el estudiante por su ID real
    let estudiante = null;
    for (const key in estudiantes) {
      if (estudiantes[key].id === estudianteId) {
        estudiante = estudiantes[key];
        break;
      }
    }

    if (!estudiante) {
      console.error('Estudiante no encontrado');
      return;
    }

    try {
      // Guardar en Supabase
      const { error } = await supabase
        .from('asistencias')
        .upsert({
          grupo,
          estudiante_id: estudianteId,
          catequesis_num: catequesisNum,
          estado: nuevoEstado
        }, {
          onConflict: 'grupo,estudiante_id,catequesis_num'
        });

      if (error) {
        console.error('Error updating asistencia:', error);
        alert('Error al actualizar la asistencia');
        return;
      }

      // Update local state
      setAsistenciasState(prev => ({
        ...prev,
        [estudianteId]: {
          ...prev[estudianteId],
          [catequesisNum]: nuevoEstado
        }
      }));
    } catch (error) {
      console.error('Error updating asistencia:', error);
      alert('Error al actualizar la asistencia');
    }
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Cargando asistencias...</div>
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Asistencia - Jueves</h2>
        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 border-2 border-green-400 rounded text-center text-green-800 font-bold text-xs sm:text-sm flex items-center justify-center">✓</div>
            <span className="text-gray-700">Presente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-100 border-2 border-red-400 rounded text-center text-red-800 font-bold text-xs sm:text-sm flex items-center justify-center">✗</div>
            <span className="text-gray-700">Ausente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-100 border-2 border-yellow-400 rounded text-center text-yellow-800 font-bold text-xs sm:text-sm flex items-center justify-center">!</div>
            <span className="text-gray-700">Justificado</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <div className="inline-block min-w-full align-middle px-3 sm:px-0">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10 shadow-sm">
                Estudiante
              </th>
              {catequesisIndices.map((catequesisNum) => (
                <th key={catequesisNum} className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 min-w-max whitespace-nowrap">
                  {getCatequesisLabel(catequesisNum)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(estudiantes).map(([_key, estudiante]) => {
              const estudianteId = estudiante.id; // Usar el ID real del estudiante
              return (
                <tr key={estudianteId} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium sticky left-0 bg-white hover:bg-gray-50 z-10 shadow-sm">
                    <button
                      onClick={() => onStudentClick && onStudentClick(estudianteId)}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer text-left w-full"
                      title="Ver perfil del estudiante"
                    >
                      {estudiante.nombre}
                    </button>
                  </td>
                  {catequesisIndices.map(catequesisNum => {
                    const estado = asistenciasState[estudianteId]?.[catequesisNum] || 'ausente';
                    
                    let bgColor, icon, label;
                    if (estado === 'presente') {
                      bgColor = 'bg-green-500';
                      icon = '✓';
                      label = 'Presente';
                    } else if (estado === 'justificado') {
                      bgColor = 'bg-yellow-500';
                      icon = '!';
                      label = 'Justificado';
                    } else {
                      bgColor = 'bg-red-500';
                      icon = '✗';
                      label = 'Ausente';
                    }
                    
                    return (
                      <td key={catequesisNum} className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-center">
                        <button
                          onClick={() => handleEstadoChange(estudianteId, catequesisNum)}
                          className={`w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg font-bold text-white text-base sm:text-lg transition-all transform hover:scale-110 active:scale-95 shadow-md cursor-pointer ${bgColor}`}
                          title={label}
                        >
                          {icon}
                        </button>
                      </td>
                    );
                  })}
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

export default Attendance;
