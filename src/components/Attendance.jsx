import { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { database } from '../config/firebase';
import { fechasJueves } from '../data/grupos';

function Attendance({ grupo, estudiantes }) {
  const [asistenciasState, setAsistenciasState] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (grupo && estudiantes) {
      loadAsistencias();
    }
  }, [grupo, estudiantes]);

  const loadAsistencias = async () => {
    try {
      const newState = {};
      for (const estudianteId in estudiantes) {
        const asistRef = ref(database, `grupos/${grupo}/estudiantes/${estudianteId}/asistencias`);
        const snapshot = await get(asistRef);
        newState[estudianteId] = snapshot.val() || {};
      }
      setAsistenciasState(newState);
    } catch (error) {
      console.error('Error loading asistencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = async (estudianteId, fecha) => {
    const currentValue = asistenciasState[estudianteId]?.[fecha] || false;
    const newValue = !currentValue;

    try {
      // Update in Firebase
      const asistRef = ref(database, `grupos/${grupo}/estudiantes/${estudianteId}/asistencias/${fecha}`);
      await set(asistRef, newValue);

      // Update local state
      setAsistenciasState(prev => ({
        ...prev,
        [estudianteId]: {
          ...prev[estudianteId],
          [fecha]: newValue
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
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Asistencia - Jueves</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-100">
                Estudiante
              </th>
              {fechasJueves.map(fecha => (
                <th key={fecha} className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  {formatFecha(fecha)}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(estudiantes).map(([id, estudiante]) => {
              const asistenciasCount = fechasJueves.filter(
                fecha => asistenciasState[id]?.[fecha]
              ).length;
              
              return (
                <tr key={id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium sticky left-0 bg-white">
                    {estudiante.nombre}
                  </td>
                  {fechasJueves.map(fecha => (
                    <td key={fecha} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={asistenciasState[id]?.[fecha] || false}
                        onChange={() => handleCheckboxChange(id, fecha)}
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center text-sm font-semibold">
                    {asistenciasCount} / {fechasJueves.length}
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

export default Attendance;
