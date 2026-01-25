import { useState, useEffect, useCallback } from 'react';
import { numeroCatequesis, getCatequesisLabel } from '../data/grupos';
import { catequistas } from '../data/catequistas';
import { supabase } from '../config/supabase';
import { Search, Filter, MapPin } from 'lucide-react';

function CatequistasModule({ onBack }) {
  const [catequistasState, setCatequistasState] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  
  // Generar array de índices de catequesis [0, 1, 2, ..., numeroCatequesis-1]
  const catequesisIndices = Array.from({ length: numeroCatequesis }, (_, i) => i);

  // Obtener grupos únicos de catequistas
  const uniqueGroups = [...new Set(catequistas.map(c => c.grupo))];

  const loadCatequistas = useCallback(async () => {
    try {
      const newState = {};

      // Cargar TODOS los catequistas sin filtrar por grupo
      const { data, error } = await supabase
        .from('asistencia_catequistas')
        .select('*')
        .order('catequista_nombre', { ascending: true });

      if (error) {
        console.error('Error loading catequistas:', error);
      } else if (data) {
        data.forEach(item => {
          if (!newState[item.catequista_nombre]) {
            newState[item.catequista_nombre] = {};
          }
          newState[item.catequista_nombre][item.catequesis_num] = item.estado;
        });
      }

      setCatequistasState(newState);
    } catch (error) {
      console.error('Error loading catequistas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatequistas();
  }, []);

  const handleEstadoChange = async (catequista, catequesisNum) => {
    const estadoActual = catequistasState[catequista]?.[catequesisNum] || 'ausente';
    
    const ciclo = {
      'ausente': 'presente',
      'presente': 'justificado',
      'justificado': 'ausente'
    };
    
    const nuevoEstado = ciclo[estadoActual];

    try {
      // Primero verificar si existe
      const { data: existing } = await supabase
        .from('asistencia_catequistas')
        .select('id')
        .eq('catequista_nombre', catequista)
        .eq('catequesis_num', catequesisNum)
        .single();

      let error;
      
      if (existing) {
        // Si existe, actualizar
        const result = await supabase
          .from('asistencia_catequistas')
          .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
          .eq('catequista_nombre', catequista)
          .eq('catequesis_num', catequesisNum);
        error = result.error;
      } else {
        // Si no existe, insertar
        const result = await supabase
          .from('asistencia_catequistas')
          .insert({
            catequista_nombre: catequista,
            catequesis_num: catequesisNum,
            estado: nuevoEstado,
            grupo: 'General'
          });
        error = result.error;
      }

      if (error) {
        console.error('Error saving estado:', error);
        alert('Error al guardar: ' + error.message);
        return;
      }

      // Actualiza el estado local
      setCatequistasState(prev => ({
        ...prev,
        [catequista]: {
          ...prev[catequista],
          [catequesisNum]: nuevoEstado
        }
      }));
    } catch (error) {
      console.error('Error changing estado:', error);
      alert('Error al cambiar el estado');
    }
  };

  // Función para filtrar catequistas
  const filteredCatequistas = catequistas.filter(catequista => {
    const matchesSearch = catequista.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroups.length === 0 || selectedGroups.includes(catequista.grupo);
    return matchesSearch && matchesGroup;
  }).sort((a, b) => {
    if (a.grupo !== b.grupo) {
      return a.grupo.localeCompare(b.grupo);
    }
    return a.nombre.localeCompare(b.nombre);
  });

  // Función para alternar selección de grupo
  const toggleGroup = (grupo) => {
    setSelectedGroups(prev =>
      prev.includes(grupo)
        ? prev.filter(g => g !== grupo)
        : [...prev, grupo]
    );
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'presente':
        return 'bg-green-100 text-green-800 border-green-400';
      case 'justificado':
        return 'bg-blue-100 text-blue-800 border-blue-400';
      case 'ausente':
        return 'bg-red-100 text-red-800 border-red-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-400';
    }
  };

  const getEstadoIcon = (estado) => {
    switch(estado) {
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

  // Se quitó la funcionalidad de agregar catequista

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold">CATEQUISTAS</h1>
            <button
              onClick={onBack}
              className="bg-white text-blue-600 hover:bg-gray-100 px-5 py-3 rounded-lg transition-colors font-semibold text-base sm:text-lg w-full sm:w-auto"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-5 sm:py-6 lg:py-8">
        <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 lg:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            Asistencia de Catequistas
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-5 sm:mb-6">
            Registra la asistencia de todos los catequistas
          </p>

          {/* Sección de Filtros */}
          <div className="mb-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
            {/* Búsqueda por nombre */}
            <div className="mb-5">
              <label className="block text-sm sm:text-base font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Search className="w-5 h-5" /> Buscar catequista por nombre
              </label>
              <input
                type="text"
                placeholder="Escribe el nombre del catequista..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>

            {/* Filtro por grupo */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Filtrar por grupo
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedGroups([])}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-bold transition ${
                    selectedGroups.length === 0
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Todos ({catequistas.length})
                </button>
                {uniqueGroups.map(grupo => {
                  const count = catequistas.filter(c => c.grupo === grupo).length;
                  const isSelected = selectedGroups.includes(grupo);
                  return (
                    <button
                      key={grupo}
                      onClick={() => toggleGroup(grupo)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-bold transition ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {grupo} <span className="text-xs bg-gray-300 px-2 py-1 rounded ml-1">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Información de resultados */}
            <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
              <p className="text-sm sm:text-base text-blue-900 font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4" /> Mostrando: <span className="font-bold text-blue-600">{filteredCatequistas.length}</span> de {catequistas.length} catequistas
              </p>
            </div>
          </div>

          {/* Tabla de Asistencia */}
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="text-gray-600 text-sm sm:text-base">Cargando datos...</div>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-3 sm:px-0">
                <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 sticky left-0 bg-blue-50 z-10 shadow-sm">Catequista</th>
                      <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 bg-blue-50">Grupo</th>
                      {catequesisIndices.map((catequesisNum) => (
                        <th
                          key={catequesisNum}
                          className="px-2 py-2 sm:py-3 text-center text-xs font-semibold text-gray-700 bg-blue-50 whitespace-nowrap"
                        >
                          {getCatequesisLabel(catequesisNum)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCatequistas.length > 0 ? (
                      filteredCatequistas.map((catequista) => (
                        <tr key={catequista.nombre} className="border-t border-gray-200 hover:bg-gray-50">
                          <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-800 sticky left-0 bg-white hover:bg-gray-50 z-10 shadow-sm">
                            {catequista.nombre}
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-gray-600">
                            <span className="inline-block px-2 py-1 bg-blue-50 text-blue-900 rounded-full font-medium">
                              {catequista.grupo}
                            </span>
                          </td>
                          {catequesisIndices.map((catequesisNum) => {
                            const estado = catequistasState[catequista.nombre]?.[catequesisNum] || 'ausente';
                            const icon = getEstadoIcon(estado);
                            const colorClass = getEstadoColor(estado);
                            
                            return (
                              <td
                                key={`${catequista.nombre}-${catequesisNum}`}
                                className="px-1 sm:px-2 py-2 sm:py-3 text-center"
                              >
                                <button
                                  onClick={() => handleEstadoChange(catequista.nombre, catequesisNum)}
                                  className={`w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg border-2 font-bold text-xs sm:text-sm hover:shadow-md transition-all ${colorClass}`}
                                >
                                  {icon}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={catequesisIndices.length + 2} className="px-4 py-8 text-center text-gray-500">
                          <p className="font-medium">No se encontraron catequistas con los filtros aplicados</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Leyenda */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm sm:text-base text-gray-700 mb-2">Leyenda:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 text-green-800 border-2 border-green-400 rounded font-bold flex items-center justify-center text-sm sm:text-base">✓</div>
                <span className="text-xs sm:text-sm text-gray-600">Presente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 text-blue-800 border-2 border-blue-400 rounded font-bold flex items-center justify-center text-sm sm:text-base">J</div>
                <span className="text-xs sm:text-sm text-gray-600">Justificado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 text-red-800 border-2 border-red-400 rounded font-bold flex items-center justify-center text-sm sm:text-base">✗</div>
                <span className="text-xs sm:text-sm text-gray-600">Ausente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CatequistasModule;
