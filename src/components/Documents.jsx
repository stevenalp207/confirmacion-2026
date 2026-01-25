import { useState, useEffect, useCallback } from 'react';
import { tiposDocumentos } from '../data/grupos';
import { supabase } from '../config/supabase';

function Documents({ grupo, estudiantes }) {
  const [documentosState, setDocumentosState] = useState({});
  const [loading, setLoading] = useState(true);

  const loadDocumentos = useCallback(async () => {
    try {
      const newState = {};
      
      // Inicializar estado vacío para todos los estudiantes usando el ID real
      for (const key in estudiantes) {
        const estudianteId = estudiantes[key].id; // Usar el ID real del estudiante
        newState[estudianteId] = {};
      }

      // Cargar documentos desde Supabase
      const { data, error } = await supabase
        .from('documentos_entregados')
        .select('*')
        .eq('grupo', grupo);

      if (error) {
        console.error('Error loading documentos:', error);
      } else if (data) {
        // Procesar datos de Supabase
        data.forEach(item => {
          if (newState[item.estudiante_id]) {
            newState[item.estudiante_id][item.documento_tipo] = item.entregado;
          }
        });
      }

      setDocumentosState(newState);
    } catch (error) {
      console.error('Error loading documentos:', error);
    } finally {
      setLoading(false);
    }
  }, [grupo, estudiantes]);

  useEffect(() => {
    if (grupo && estudiantes) {
      loadDocumentos();
    }
  }, [grupo, estudiantes, loadDocumentos]);

  const handleCheckboxChange = async (estudianteId, docTipo) => {
    const currentValue = documentosState[estudianteId]?.[docTipo] || false;
    const newValue = !currentValue;

    try {
      // Guardar en Supabase
      const { error } = await supabase
        .from('documentos_entregados')
        .upsert({
          grupo,
          estudiante_id: estudianteId,
          documento_tipo: docTipo,
          entregado: newValue
        }, {
          onConflict: 'grupo,estudiante_id,documento_tipo'
        });

      if (error) {
        console.error('Error updating documento:', error);
        alert('Error al actualizar el documento');
        return;
      }

      // Update local state
      setDocumentosState(prev => ({
        ...prev,
        [estudianteId]: {
          ...prev[estudianteId],
          [docTipo]: newValue
        }
      }));
    } catch (error) {
      console.error('Error updating documento:', error);
      alert('Error al actualizar el documento');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Cargando documentos...</div>
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
      <h2 className="text-2xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Entrega de Documentos</h2>
      
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle px-4 sm:px-0">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-blue-50 border-b-2 border-blue-200">
              <tr>
                <th className="px-4 sm:px-4 py-4 text-left text-sm sm:text-base font-bold text-gray-800 sticky left-0 bg-blue-50 z-10 shadow-sm">Estudiante</th>
                {tiposDocumentos.map(doc => (
                  <th key={doc.id} className="px-2 sm:px-4 py-4 text-center text-xs sm:text-sm font-bold text-gray-700 whitespace-normal sm:whitespace-nowrap min-w-[80px] sm:min-w-[120px]">
                    <div className="flex flex-col gap-1">
                      <span className="hidden sm:block">{doc.nombre}</span>
                      <span className="sm:hidden text-xs font-semibold break-words">{doc.nombre}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(estudiantes).map(([_key, estudiante]) => {
                const estudianteId = estudiante.id;
                return (
                  <tr key={estudianteId} className="border-t border-gray-200 hover:bg-blue-50">
                    <td className="px-4 sm:px-4 py-4 text-sm sm:text-base text-gray-800 font-medium sticky left-0 bg-white hover:bg-blue-50 z-10 shadow-sm">
                      {estudiante.nombre}
                    </td>
                    {tiposDocumentos.map(doc => (
                      <td key={doc.id} className="px-3 sm:px-4 py-4 text-center">
                        <div className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={documentosState[estudianteId]?.[doc.id] || false}
                            onChange={() => handleCheckboxChange(estudianteId, doc.id)}
                            className="w-5 h-5 text-blue-600 border-2 border-gray-300 bg-white rounded cursor-pointer accent-blue-600"
                          />
                        </div>
                      </td>
                    ))}
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

export default Documents;
