import { useState, useEffect, useCallback } from 'react';
import { fechasJueves } from '../data/grupos';
import { supabase } from '../config/supabase';

function Attendance({ grupo, estudiantes, user }) {
  const [asistenciasState, setAsistenciasState] = useState({});
  const [loading, setLoading] = useState(true);

  const loadAsistencias = useCallback(async () => {
    try {
      const newState = {};
      
      // Inicializar con estado 'ausente' por defecto
      for (const estudianteId in estudiantes) {
        newState[estudianteId] = {};
        for (const fecha of fechasJueves) {
          newState[estudianteId][fecha] = 'ausente';
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
            newState[item.estudiante_id][item.fecha] = item.estado;
          }
        });
      }

      setAsistenciasState(newState);
    } catch (error) {
      console.error('Error loading asistencias:', error);
    } finally {
      setLoading(false);
    }
  }, [grupo, estudiantes]);

  useEffect(() => {
    if (grupo && estudiantes) {
      loadAsistencias();
    }
  }, [grupo, estudiantes, loadAsistencias]);

  const handleEstadoChange = async (estudianteId, fecha) => {
    const estadoActual = asistenciasState[estudianteId]?.[fecha] || 'ausente';
    
    // Ciclo: ausente -> presente -> justificado -> ausente
    const ciclo = {
      'ausente': 'presente',
      'presente': 'justificado',
      'justificado': 'ausente'
    };
    
    const nuevoEstado = ciclo[estadoActual];
    const estudiante = estudiantes[estudianteId];

    try {
      // Guardar en Supabase
      const { error } = await supabase
        .from('asistencias')
        .upsert({
          grupo,
          estudiante_id: estudianteId,
          estudiante_nombre: estudiante.nombre,
          fecha,
          estado: nuevoEstado
        }, {
          onConflict: 'grupo,estudiante_id,fecha'
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
          [fecha]: nuevoEstado
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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Asistencia - Jueves</h2>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 border-2 border-green-400 rounded text-center text-green-800 font-bold">✓</div>
            <span>Presente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-100 border-2 border-red-400 rounded text-center text-red-800 font-bold">✗</div>
            <span>Ausente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-400 rounded text-center text-yellow-800 font-bold">!</div>
            <span>Justificado</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-100">
                Estudiante
              </th>
              {fechasJueves.map(fecha => (
                <th key={fecha} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 min-w-max">
                  {formatFecha(fecha)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(estudiantes).map(([id, estudiante]) => {
              return (
                <tr key={id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium sticky left-0 bg-white hover:bg-gray-50">
                    {estudiante.nombre}
                  </td>
                  {fechasJueves.map(fecha => {
                    const estado = asistenciasState[id]?.[fecha] || 'ausente';
                    
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
                      <td key={fecha} className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleEstadoChange(id, fecha)}
                          className={`w-10 h-10 rounded-lg font-bold text-white text-lg transition-all transform hover:scale-110 active:scale-95 shadow-md cursor-pointer ${bgColor}`}
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
  );
}

export default Attendance;
