import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Mic, Users, Plus, Trash2, Edit2, Save, X, AlertTriangle, CheckCircle, Award, Calendar, Filter, BarChart3, UserCheck } from 'lucide-react';
import { supabase } from '../config/supabase';
import ConfirmationModal from '../components/ConfirmationModal';
import { catequistas as catequistasData } from '../data/catequistas';

const TIPOS_PARTICIPACION = [
  { value: 'tema_retiro', label: 'Tema de Retiro', peso: 5, color: 'purple' },
  { value: 'reflexion_retiro', label: 'Reflexión de Retiro', peso: 4, color: 'indigo' },
  { value: 'adoracion', label: 'Adoración', peso: 5, color: 'yellow' },
  { value: 'tema_convivencia', label: 'Tema de Convivencia', peso: 3, color: 'blue' },
  { value: 'reflexion_convivencia', label: 'Reflexión de Convivencia', peso: 3, color: 'cyan' },
  { value: 'actividad_retiro', label: 'Actividad de Retiro', peso: 2, color: 'green' },
  { value: 'actividad_convivencia', label: 'Actividad de Convivencia', peso: 2, color: 'teal' },
  { value: 'dinamica', label: 'Dinámica/Juego', peso: 1, color: 'orange' },
  { value: 'catequesis_general', label: 'Catequesis General', peso: 2, color: 'pink' },
  { value: 'obra', label: 'Obra/Teatro', peso: 2, color: 'rose' },
  { value: 'otro', label: 'Otro', peso: 1, color: 'gray' }
];

const EVENTOS = [
  { value: 'convivencia_1', label: 'Primera Convivencia' },
  { value: 'convivencia_2', label: 'Segunda Convivencia' },
  { value: 'convivencia_3', label: 'Tercera Convivencia' },
  { value: 'retiro', label: 'Retiro' },
  { value: 'catequesis', label: 'Catequesis Regular' },
  { value: 'formacion', label: 'Evaluación de Formación' }
];

function ParticipacionesModule({ onBack, user }) {
  const [participaciones, setParticipaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [filterCatequista, setFilterCatequista] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEvento, setFilterEvento] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'stats'

  const [formData, setFormData] = useState({
    catequista_id: '',
    catequista_nombre: '',
    tipo: 'tema_retiro',
    evento: 'retiro',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    evaluacion: 'bueno',
    notas: '',
    registrado_por: user?.usuario || ''
  });

  const canEdit = user?.rol === 'admin' || user?.rol === 'retiro' || user?.rol === 'formacion';

  // Catequistas desde archivo local con id generado
  const catequistas = useMemo(() => 
    catequistasData.map((c, idx) => ({ id: idx + 1, nombre: c.nombre, grupo: c.grupo })),
    []
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('participaciones_catequistas')
        .select('*')
        .order('fecha', { ascending: false });

      if (data) setParticipaciones(data);
      if (error) console.error('Error cargando participaciones:', error);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas por catequista
  const estadisticasPorCatequista = useMemo(() => {
    const stats = {};
    
    participaciones.forEach(p => {
      const nombre = p.catequista_nombre;
      if (!stats[nombre]) {
        stats[nombre] = {
          nombre,
          total: 0,
          puntosTotales: 0,
          porTipo: {},
          ultimaParticipacion: null
        };
      }
      
      stats[nombre].total += 1;
      const tipo = TIPOS_PARTICIPACION.find(t => t.value === p.tipo);
      stats[nombre].puntosTotales += tipo?.peso || 1;
      stats[nombre].porTipo[p.tipo] = (stats[nombre].porTipo[p.tipo] || 0) + 1;
      
      if (!stats[nombre].ultimaParticipacion || new Date(p.fecha) > new Date(stats[nombre].ultimaParticipacion)) {
        stats[nombre].ultimaParticipacion = p.fecha;
      }
    });

    return Object.values(stats).sort((a, b) => a.puntosTotales - b.puntosTotales);
  }, [participaciones]);

  // Catequistas sin participación importante
  const catequistasSinParticipacion = useMemo(() => {
    const nombresConParticipacion = new Set(participaciones.map(p => p.catequista_nombre));
    const tiposImportantes = ['tema_retiro', 'reflexion_retiro', 'adoracion', 'tema_convivencia', 'reflexion_convivencia'];
    
    const conParticipacionImportante = new Set(
      participaciones
        .filter(p => tiposImportantes.includes(p.tipo))
        .map(p => p.catequista_nombre)
    );

    return catequistas.filter(c => !conParticipacionImportante.has(c.nombre));
  }, [participaciones, catequistas]);

  // Sugerencias de próximos participantes (los que menos han participado)
  const sugerenciasProximos = useMemo(() => {
    const todosLosNombres = catequistas.map(c => c.nombre);
    const statsMap = {};
    
    todosLosNombres.forEach(nombre => {
      const stat = estadisticasPorCatequista.find(s => s.nombre === nombre);
      statsMap[nombre] = stat?.puntosTotales || 0;
    });

    return todosLosNombres
      .sort((a, b) => statsMap[a] - statsMap[b])
      .slice(0, 5);
  }, [catequistas, estadisticasPorCatequista]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dataToSave = {
        ...formData,
        catequista_nombre: catequistas.find(c => c.id === parseInt(formData.catequista_id))?.nombre || formData.catequista_nombre
      };

      if (editingId) {
        const { error } = await supabase
          .from('participaciones_catequistas')
          .update(dataToSave)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('participaciones_catequistas')
          .insert([dataToSave]);
        if (error) throw error;
      }

      setModal({
        isOpen: true,
        type: 'success',
        title: editingId ? 'Participación actualizada' : 'Participación registrada',
        message: 'Los datos se guardaron correctamente'
      });

      resetForm();
      loadData();
    } catch (error) {
      console.error('Error guardando:', error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo guardar la participación'
      });
    }
  };

  const handleEdit = (participacion) => {
    setFormData({
      catequista_id: participacion.catequista_id || '',
      catequista_nombre: participacion.catequista_nombre,
      tipo: participacion.tipo,
      evento: participacion.evento,
      descripcion: participacion.descripcion || '',
      fecha: participacion.fecha,
      evaluacion: participacion.evaluacion || 'bueno',
      notas: participacion.notas || '',
      registrado_por: participacion.registrado_por
    });
    setEditingId(participacion.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const { error } = await supabase
        .from('participaciones_catequistas')
        .delete()
        .eq('id', deleteId);
      
      if (error) throw error;
      
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Eliminado',
        message: 'La participación fue eliminada'
      });
      
      loadData();
    } catch (error) {
      console.error('Error eliminando:', error);
    } finally {
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      catequista_id: '',
      catequista_nombre: '',
      tipo: 'tema_retiro',
      evento: 'retiro',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0],
      evaluacion: 'bueno',
      notas: '',
      registrado_por: user?.usuario || ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getTipoInfo = (tipo) => TIPOS_PARTICIPACION.find(t => t.value === tipo) || { label: tipo, color: 'gray', peso: 1 };
  const getEventoLabel = (evento) => EVENTOS.find(e => e.value === evento)?.label || evento;

  // Filtrar participaciones
  const participacionesFiltradas = participaciones.filter(p => {
    if (filterCatequista && !p.catequista_nombre.toLowerCase().includes(filterCatequista.toLowerCase())) return false;
    if (filterTipo && p.tipo !== filterTipo) return false;
    if (filterEvento && p.evento !== filterEvento) return false;
    return true;
  });


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold transition mb-3 sm:mb-4"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Volver al Menú Principal
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="text-center mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
                <Mic className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                Asignación de Participaciones
              </h1>
              <p className="text-gray-600 mt-2 text-sm">
                Sistema equitativo para temas, reflexiones y actividades
              </p>
            </div>

            {/* Toggle vista */}
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setViewMode('stats')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  viewMode === 'stats' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Estadísticas
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'stats' ? (
          <>
            {/* Alerta de catequistas sin participación importante */}
            {catequistasSinParticipacion.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-yellow-800">Catequistas sin participación importante</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Los siguientes catequistas no han tenido tema, reflexión o adoración asignada:
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {catequistasSinParticipacion.map(c => (
                        <span key={c.id} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          {c.nombre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sugerencias */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <UserCheck className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-green-800">Sugerencias para próximas participaciones</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Catequistas con menos participaciones que deberían ser considerados:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sugerenciasProximos.map((nombre, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {nombre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Ranking de participaciones */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Ranking de Participaciones
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catequista</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Puntos</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Desglose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {estadisticasPorCatequista.map((stat, idx) => (
                      <tr key={idx} className={idx < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                        <td className="px-4 py-3 text-sm">
                          {idx < 3 ? (
                            <span className="text-yellow-600 font-bold">⚠️</span>
                          ) : (
                            <span className="text-gray-400">{idx + 1}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">{stat.nombre}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm font-medium">
                            {stat.total}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-sm font-bold ${
                            stat.puntosTotales < 5 ? 'bg-red-100 text-red-700' :
                            stat.puntosTotales < 10 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {stat.puntosTotales}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {stat.ultimaParticipacion ? new Date(stat.ultimaParticipacion).toLocaleDateString('es-CR') : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(stat.porTipo).map(([tipo, count]) => {
                              const info = getTipoInfo(tipo);
                              return (
                                <span key={tipo} className={`text-xs px-1.5 py-0.5 rounded bg-${info.color}-100 text-${info.color}-700`}>
                                  {count}x {info.label.split(' ')[0]}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Botón agregar y filtros */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
              {/* En móvil: columna, en desktop: fila */}
              <div className="flex flex-col sm:flex-row gap-4">
                {canEdit && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar Participación
                  </button>
                )}

                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                  <input
                    type="text"
                    placeholder="Buscar catequista..."
                    value={filterCatequista}
                    onChange={(e) => setFilterCatequista(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm w-full sm:w-40"
                  />
                  <select
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm w-full sm:w-auto"
                  >
                    <option value="">Todos los tipos</option>
                    {TIPOS_PARTICIPACION.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <select
                    value={filterEvento}
                    onChange={(e) => setFilterEvento(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm w-full sm:w-auto"
                  >
                    <option value="">Todos los eventos</option>
                    {EVENTOS.map(e => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Formulario */}
            {showForm && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  {editingId ? 'Editar Participación' : 'Nueva Participación'}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catequista</label>
                    <select
                      value={formData.catequista_id}
                      onChange={(e) => setFormData({ ...formData, catequista_id: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {catequistas.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Participación</label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      {TIPOS_PARTICIPACION.map(t => (
                        <option key={t.value} value={t.value}>{t.label} (Peso: {t.peso})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Evento</label>
                    <select
                      value={formData.evento}
                      onChange={(e) => setFormData({ ...formData, evento: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      {EVENTOS.map(e => (
                        <option key={e.value} value={e.value}>{e.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => {
                        const selectedDate = e.target.value;
                        // Forzar año 2026
                        const parts = selectedDate.split('-');
                        const fechaCorregida = `2026-${parts[1]}-${parts[2]}`;
                        setFormData({ ...formData, fecha: fechaCorregida });
                      }}
                      min="2026-01-01"
                      max="2026-12-31"
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <input
                      type="text"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      placeholder="Ej: Reflexión sobre el perdón"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Evaluación</label>
                    <select
                      value={formData.evaluacion}
                      onChange={(e) => setFormData({ ...formData, evaluacion: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="excelente">Excelente</option>
                      <option value="bueno">Bueno</option>
                      <option value="regular">Regular</option>
                      <option value="necesita_mejora">Necesita mejorar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
                    <input
                      type="text"
                      value={formData.notas}
                      onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                      placeholder="Observaciones..."
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div className="md:col-span-2 flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {editingId ? 'Actualizar' : 'Guardar'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lista de participaciones */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catequista</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                      {canEdit && (
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {participacionesFiltradas.map((p) => {
                      const tipoInfo = getTipoInfo(p.tipo);
                      return (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(p.fecha).toLocaleDateString('es-CR')}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {p.catequista_nombre}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${tipoInfo.color}-100 text-${tipoInfo.color}-700`}>
                              {tipoInfo.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {getEventoLabel(p.evento)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                            {p.descripcion || '-'}
                          </td>
                          {canEdit && (
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEdit(p)}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteId(p.id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {participacionesFiltradas.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay participaciones registradas
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Modal de confirmación */}
        <ConfirmationModal
          isOpen={modal.isOpen}
          type={modal.type}
          title={modal.title}
          message={modal.message}
          onConfirm={() => setModal({ ...modal, isOpen: false })}
          onCancel={() => setModal({ ...modal, isOpen: false })}
        />

        {/* Modal de eliminar */}
        <ConfirmationModal
          isOpen={!!deleteId}
          type="warning"
          title="Eliminar participación"
          message="¿Estás seguro de eliminar esta participación?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    </div>
  );
}

export default ParticipacionesModule;
