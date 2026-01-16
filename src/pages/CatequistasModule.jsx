import { useState, useEffect, useCallback } from 'react';
import { fechasJueves } from '../data/grupos';
import { supabase } from '../config/supabase';

function CatequistasModule({ onBack, user }) {
  const [catequistasState, setCatequistasState] = useState({});
  const [catequistasNombres, setCatequistasNombres] = useState([
    'Adriana Álvarez',
    'Amanda Cordero',
    'Amanda Villegas',
    'André Barboza',
    'Andrey Corrales',
    'Ashley Rodriguez',
    'Brenda Jiménez',
    'Dylan Chacón',
    'Esteban Naranjo',
    'Fabiola Fallas',
    'Gabriel Valverde',
    'Isaac Monge',
    'Ismael Rivera',
    'Jefferson Aguilar',
    'Valeska Angulo',
    'Johanna Castro',
    'Jose Joel Vargas',
    'Jose Pablo Castro',
    'Josué Escorcia',
    'Julissa Escalante',
    'Jeaustin Fernandez',
    'Justin Rojas',
    'Karemy Guzmán',
    'Krystel Narváez',
    'Luis Ángel Sánchez',
    'Luis Felipe Mora',
    'María Paula Avilés',
    'María Paula Hurtado',
    'Mariam Astua',
    'Mariana Segura',
    'Mathias Calderon',
    'Monserrat Solano',
    'Nashamy Araya',
    'Noelia Matarrita',
    'Oscar Sandí',
    'Samuel Brenes',
    'Sebastián Araya',
    'Sebastian Huertas',
    'Sofia Arce',
    'Steven Alpízar',
    'Susseth Alan Pérez'
  ]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCatequistas = useCallback(async () => {
    try {
      const newState = {};
      const nombres = new Set(catequistasNombres);

      // Cargar TODOS los catequistas sin filtrar por grupo
      const { data, error } = await supabase
        .from('asistencia_catequistas')
        .select('*')
        .order('catequista_nombre', { ascending: true });

      if (error) {
        console.error('Error loading catequistas:', error);
      } else if (data) {
        data.forEach(item => {
          nombres.add(item.catequista_nombre);
          if (!newState[item.catequista_nombre]) {
            newState[item.catequista_nombre] = {};
          }
          newState[item.catequista_nombre][item.fecha] = item.estado;
        });
      }

      setCatequistasNombres(Array.from(nombres));
      setCatequistasState(newState);
    } catch (error) {
      console.error('Error loading catequistas:', error);
    } finally {
      setLoading(false);
    }
  }, [catequistasNombres]);

  useEffect(() => {
    loadCatequistas();
  }, []);

  const handleEstadoChange = async (catequista, fecha) => {
    const estadoActual = catequistasState[catequista]?.[fecha] || 'ausente';
    
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
        .eq('fecha', fecha)
        .single();

      let error;
      
      if (existing) {
        // Si existe, actualizar
        const result = await supabase
          .from('asistencia_catequistas')
          .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
          .eq('catequista_nombre', catequista)
          .eq('fecha', fecha);
        error = result.error;
      } else {
        // Si no existe, insertar
        const result = await supabase
          .from('asistencia_catequistas')
          .insert({
            catequista_nombre: catequista,
            fecha: fecha,
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
          [fecha]: nuevoEstado
        }
      }));
    } catch (error) {
      console.error('Error changing estado:', error);
      alert('Error al cambiar el estado');
    }
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

  const agregarCatequista = async () => {
    if (!nuevoNombre.trim()) return;

    const nombreLimpio = nuevoNombre.trim();
    if (catequistasNombres.includes(nombreLimpio)) {
      alert('Este catequista ya existe');
      setNuevoNombre('');
      return;
    }

    setCatequistasNombres(prev => [...prev, nombreLimpio]);
    setCatequistasState(prev => ({
      ...prev,
      [nombreLimpio]: {}
    }));
    setNuevoNombre('');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="hover:bg-indigo-700 px-3 py-2 rounded-lg transition-colors"
              >
                ← Atrás
              </button>
              <h1 className="text-xl font-bold">Catequistas - Confirmación 2026</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Asistencia de Catequistas
          </h2>
          <p className="text-gray-600 mb-6">
            Registra la asistencia de todos los catequistas
          </p>

          {/* Agregar Catequista */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">Agregar nuevo catequista</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && agregarCatequista()}
                placeholder="Nombre del catequista"
                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={agregarCatequista}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Tabla de Asistencia */}
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="text-gray-600">Cargando datos...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-indigo-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Catequista</th>
                    {fechasJueves.map((fecha) => (
                      <th
                        key={fecha}
                        className="px-2 py-3 text-center text-xs font-semibold text-gray-700 bg-indigo-50"
                      >
                        {new Date(fecha).toLocaleDateString('es-CR', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {catequistasNombres.map((catequista) => (
                    <tr key={catequista} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 sticky left-0 bg-white">
                        {catequista}
                      </td>
                      {fechasJueves.map((fecha) => {
                        const estado = catequistasState[catequista]?.[fecha] || 'ausente';
                        const icon = getEstadoIcon(estado);
                        const colorClass = getEstadoColor(estado);
                        
                        return (
                          <td
                            key={`${catequista}-${fecha}`}
                            className="px-2 py-3 text-center"
                          >
                            <button
                              onClick={() => handleEstadoChange(catequista, fecha)}
                              className={`w-10 h-10 rounded-lg border-2 font-bold text-sm hover:shadow-md transition-all ${colorClass}`}
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
          )}

          {/* Leyenda */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Leyenda:</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 text-green-800 border-2 border-green-400 rounded font-bold flex items-center justify-center">✓</div>
                <span className="text-sm text-gray-600">Presente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-800 border-2 border-blue-400 rounded font-bold flex items-center justify-center">J</div>
                <span className="text-sm text-gray-600">Justificado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 text-red-800 border-2 border-red-400 rounded font-bold flex items-center justify-center">✗</div>
                <span className="text-sm text-gray-600">Ausente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CatequistasModule;
