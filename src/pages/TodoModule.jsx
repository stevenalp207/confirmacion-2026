import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../config/supabase';
import {ArrowLeft, CheckCircle2, Trash2, Square, SquareCheckBig, Check  } from 'lucide-react';
import TodoFormulario from '../components/TodoFormulario';
import ConfirmationModal from '../components/ConfirmationModal';
import { catequistas as listaCatequistas } from '../data/catequistas';

// Función para normalizar texto (remover tildes y convertir a minúsculas)
const normalizarTexto = (texto) => {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};


function TodoModule({ user, onBack }) {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
    action: null,
    tareaId: null
  });




  const loadTareas = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tareas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTareas(data || []);
    } catch (error) {
      console.error('Error cargando tareas:', error);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    loadTareas();
  }, [loadTareas]);

  // Callback para mostrar el modal de tarea creada (debe ir después de loadTareas)
  const handleTaskCreated = useCallback(() => {
    setModal({
      isOpen: true,
      type: 'success',
      title: 'Tarea creada',
      message: 'La tarea ha sido creada exitosamente.',
      action: null,
      tareaId: null
    });
    loadTareas();
  }, [loadTareas]);

  // Filtrar tareas que el usuario puede ver (creador, responsable, o todo si es admin)
  const tareasVisibles = useMemo(() => {
    return tareas.filter(tarea => {
      // Admin ve todas las tareas
      if (user?.rol === 'admin') return true;

      const usuarioActual = normalizarTexto(user?.usuario || '');
      const rolActual = normalizarTexto(user?.rol || '');
      const responsablesNormalizados = (tarea.responsables || []).map(r => normalizarTexto(r));
      
      // El usuario puede ver la tarea si:
      // 1. Es el creador
      // 2. Su rol está en la lista de responsables
      // 3. Su usuario está en la lista de responsables
      const puedoVer = 
        normalizarTexto(tarea.creado_por) === usuarioActual ||
        responsablesNormalizados.includes(rolActual) ||
        responsablesNormalizados.includes(usuarioActual);
      
      if (!puedoVer) return false;
      if (filtroEstado && tarea.estado !== filtroEstado) return false;
      if (filtroPrioridad && tarea.prioridad !== filtroPrioridad) return false;
      
      return true;
    });
  }, [tareas, user?.usuario, user?.rol, filtroEstado, filtroPrioridad]);

  const marcarCompleta = useCallback(async (id) => {
    setModal({
      isOpen: true,
      type: 'warning',
      title: '¿Marcar como completada?',
      message: '¿Deseas marcar esta tarea como completada?',
      action: 'completar',
      tareaId: id
    });
  }, []);

  const confirmarCompletacion = useCallback(async () => {
    if (!modal.tareaId) return;
    
    try {
      const { error } = await supabase
        .from('tareas')
        .update({ estado: 'completada' })
        .eq('id', modal.tareaId);

      if (error) throw error;
      
      await loadTareas();
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Tarea completada',
        message: 'La tarea ha sido marcada como completada.',
        action: null,
        tareaId: null
      });
    } catch (error) {
      console.error('Error actualizando tarea:', error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo completar la tarea.',
        action: null,
        tareaId: null
      });
    }
  }, [modal.tareaId, loadTareas]);

  const eliminarTarea = useCallback(async (id) => {
    setModal({
      isOpen: true,
      type: 'error',
      title: '¿Eliminar tarea?',
      message: '¿Estás seguro? Esta acción no se puede deshacer.',
      action: 'eliminar',
      tareaId: id
    });
  }, []);

  const confirmarEliminacion = useCallback(async () => {
    if (!modal.tareaId) return;

    try {
      const { error } = await supabase
        .from('tareas')
        .delete()
        .eq('id', modal.tareaId);

      if (error) throw error;
      
      await loadTareas();
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Tarea eliminada',
        message: 'La tarea ha sido eliminada correctamente.',
        action: null,
        tareaId: null
      });
    } catch (error) {
      console.error('Error eliminando tarea:', error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar la tarea.',
        action: null,
        tareaId: null
      });
    }
  }, [modal.tareaId, loadTareas]);

  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case 'urgente':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'alta':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'baja':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStateColor = (estado) => {
    switch (estado) {
      case 'completada':
        return 'text-green-600';
      case 'en_progreso':
        return 'text-yellow-600';
      case 'pendiente':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Botón Volver al Menú Principal */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition mb-3 sm:mb-4 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Volver al Menú Principal
        </button>

        {user?.rol !== 'catequista' && (
          <TodoFormulario user={user} catequistas={listaCatequistas} onTaskCreated={handleTaskCreated} />
        )}

        {/* Espacio entre header y filtros */}
        <div className="h-4 sm:h-6" />

        {/* Lista de tareas */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
              Mis tareas ({tareasVisibles.length})
            </h3>
          </div>

          {tareasVisibles.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-gray-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-base sm:text-lg font-medium">No hay tareas</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tareasVisibles.map((tarea) => (
                <div key={tarea.id} className={`p-4 sm:p-6 ${tarea.estado === 'completada' ? 'bg-green-50' : ''}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <span className="flex items-center justify-center w-7 h-7">
                          {tarea.estado === 'completada' ? (
                            <SquareCheckBig className="w-5 h-5 text-green-600" />
                          ) : (
                            <Square className="w-5 h-5 text-red-500" />
                          )}
                        </span>
                        <div className="flex-1">
                          <p className={`font-semibold text-sm sm:text-base ${tarea.estado === 'completada' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {tarea.descripcion}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(tarea.prioridad)}`}>
                              {tarea.prioridad}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                              👤 {tarea.creado_por}
                            </span>
                            {tarea.fecha_limite && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                📅 {new Date(tarea.fecha_limite).toLocaleDateString('es-CR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {tarea.responsables && tarea.responsables.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Responsables: {tarea.responsables.join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 sm:ml-4 sm:self-start justify-end w-full sm:w-auto mt-2 sm:mt-0">
                      {tarea.estado !== 'completada' && user?.rol !== 'catequista' && (
                        <button
                          onClick={() => marcarCompleta(tarea.id)}
                          className="p-2 rounded hover:bg-green-100 text-green-600 transition-colors"
                          title="Marcar como completada"
                        >
                          <Check size={20} />
                        </button>
                      )}
                      {(normalizarTexto(tarea.creado_por) === normalizarTexto(user?.usuario) || user?.rol === 'admin') && user?.rol !== 'catequista' && (
                        <button
                          onClick={() => eliminarTarea(tarea.id)}
                          className="p-2 rounded hover:bg-red-100 text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-400">
                    Creado por: {tarea.creado_por} • {new Date(tarea.created_at).toLocaleDateString('es-CR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de confirmación */}
        <ConfirmationModal
          isOpen={modal.isOpen}
          type={modal.type}
          title={modal.title}
          message={modal.message}
          onConfirm={() => {
            if (modal.action === 'completar') {
              confirmarCompletacion();
            } else if (modal.action === 'eliminar') {
              confirmarEliminacion();
            } else {
              setModal({ ...modal, isOpen: false, action: null, tareaId: null });
            }
          }}
          onCancel={() => {
            setModal({ ...modal, isOpen: false, action: null, tareaId: null });
          }}
        />
      </div>
    </div>
  );
}

export default TodoModule;
