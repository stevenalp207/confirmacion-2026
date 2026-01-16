import { useState, useEffect, useCallback } from 'react';
import { tiposDocumentos } from '../data/grupos';
import { supabase } from '../config/supabase';

function Documents({ grupo, estudiantes }) {
  const [documentosState, setDocumentosState] = useState({});
  const [loading, setLoading] = useState(true);

  const loadDocumentos = useCallback(async () => {
    try {
      const newState = {};
      
      // Inicializar estado vacío para todos los estudiantes
      for (const estudianteId in estudiantes) {
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
            newState[item.estudiante_id][item.documento_id] = item.entregado;
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

  const handleCheckboxChange = async (estudianteId, docId) => {
    const currentValue = documentosState[estudianteId]?.[docId] || false;
    const newValue = !currentValue;
    const estudiante = estudiantes[estudianteId];

    try {
      // Guardar en Supabase
      const { error } = await supabase
        .from('documentos_entregados')
        .upsert({
          grupo,
          estudiante_id: estudianteId,
          estudiante_nombre: estudiante.nombre,
          documento_id: docId,
          entregado: newValue
        }, {
          onConflict: 'grupo,estudiante_id,documento_id'
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
          [docId]: newValue
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Entrega de Documentos</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estudiante</th>
              {tiposDocumentos.map(doc => (
                <th key={doc.id} className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  {doc.nombre}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(estudiantes).map(([id, estudiante]) => (
              <tr key={id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                  {estudiante.nombre}
                </td>
                {tiposDocumentos.map(doc => (
                  <td key={doc.id} className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={documentosState[id]?.[doc.id] || false}
                      onChange={() => handleCheckboxChange(id, doc.id)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Documents;
