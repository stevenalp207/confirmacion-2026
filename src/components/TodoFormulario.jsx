import { useState, useCallback, useMemo } from 'react';
import { supabase } from '../config/supabase';
import { ArrowLeft, Plus, Send, X, CheckCircle2 } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

// Función para normalizar texto (remover tildes y convertir a minúsculas)
const normalizarTexto = (texto) => {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const comisiones = [
  'Logística', 'Retiro', 'Medios', 'Financiero', 'Formación'
];

const grupos = [
  'Ciencia', 'Piedad', 'Fortaleza', 'Consejo', 'Entendimiento', 
  'Sabiduría', 'Temor de Dios'
];

function TodoFormulario({ user, catequistas, onTaskCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [formData, setFormData] = useState({
    descripcion: '',
    responsables: [],
    fecha_limite: '',
    prioridad: 'normal'
  });
  const [responsableSeleccionado, setResponsableSeleccionado] = useState('');

  // Opciones para el dropdown de responsables
  const opcionesResponsables = [
    ...comisiones.map(c => ({ tipo: 'Comisión', nombre: c })),
    ...grupos.map(g => ({ tipo: 'Grupo', nombre: g })),
  ];

  const handleAddResponsable = () => {
    if (
      responsableSeleccionado &&
      !formData.responsables.includes(responsableSeleccionado)
    ) {
      setFormData({
        ...formData,
        responsables: [...formData.responsables, responsableSeleccionado],
      });
      setResponsableSeleccionado('');
    }
  };

  const handleRemoveResponsable = (nombre) => {
    setFormData({
      ...formData,
      responsables: formData.responsables.filter((r) => r !== nombre),
    });
  };




  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!formData.descripcion.trim()) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Campos incompletos',
        message: 'Completa la descripción.'
      });
      return;
    }

    try {
      setLoading(true);


      // Guardar responsables seleccionados
      const responsables = formData.responsables;

      // Forzar año 2026 en la fecha
      let fecha_limite = formData.fecha_limite;
      if (fecha_limite) {
        const [yyyy, mm, dd] = fecha_limite.split('-');
        fecha_limite = `2026-${mm}-${dd}`;
      } else {
        fecha_limite = null;
      }

      const { error } = await supabase
        .from('tareas')
        .insert([
          {
            descripcion: formData.descripcion,
            responsables: responsables,
            estado: 'pendiente',
            prioridad: formData.prioridad,
            creado_por: user?.usuario || 'anon',
            fecha_limite: fecha_limite,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;



      setFormData({
        descripcion: '',
        responsables: [],
        fecha_limite: '',
        prioridad: 'normal'
      });
      setShowForm(false);
      
      // Notificar al padre que la tarea fue creada
      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (error) {
      console.error('Error creando tarea:', error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Error al crear la tarea.'
      });
    } finally {
      setLoading(false);
    }
  }, [formData, user]);

  const resetForm = useCallback(() => {
    setFormData({
      descripcion: '',
      responsables: [],
      fecha_limite: '',
      prioridad: 'normal'
    });
    setShowForm(false);
  }, []);


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 sm:gap-10">
            <div className="flex flex-col items-center sm:items-start w-full sm:w-auto gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2 sm:gap-3">
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
                Tareas
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm lg:text-base mt-1 sm:mt-0">
                Gestiona tus tareas pendientes
              </p>
              {user && (
                <p className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-0">
                  Usuario: <span className="font-semibold">{user.usuario}</span>
                </p>
              )}
            </div>
            <div className="flex justify-center sm:justify-end w-full sm:w-auto mt-2 sm:mt-0">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm sm:text-base whitespace-nowrap shadow min-w-35"
                style={{ minHeight: '44px' }}
              >
                {showForm ? (
                  <>
                    <X size={18} />
                    Cancelar
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Nueva tarea
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-8">
          <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-5">Crear nueva tarea</h4>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="¿Qué hay que hacer?"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Grupos o comisiones responsables
              </label>
              <div className="flex gap-2">
                <select
                  value={responsableSeleccionado}
                  onChange={e => setResponsableSeleccionado(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  {opcionesResponsables.map((op, idx) => (
                    <option key={idx} value={op.nombre}>
                      {op.tipo}: {op.nombre}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddResponsable}
                  className="bg-gray-400 hover:bg-gray-500 text-white rounded-xl px-3 py-2 flex items-center justify-center"
                  style={{ minWidth: 40, minHeight: 40 }}
                  aria-label="Agregar responsable"
                >
                  <span style={{ fontSize: 20, fontWeight: 'bold' }}>+</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Selecciona y agrega uno o varios grupos o comisiones responsables de la tarea</p>
              
              {/* Chips de responsables seleccionados */}
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.responsables.map((nombre, idx) => (
                  <span
                    key={idx}
                    className="flex items-center bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium min-h-6 h-6"
                    style={{ lineHeight: '1.2', fontSize: '0.85rem' }}
                  >
                    {nombre}
                    <button
                      type="button"
                      onClick={() => handleRemoveResponsable(nombre)}
                      className="ml-1 text-blue-500 hover:text-red-500 focus:outline-none text-base"
                      aria-label={`Quitar ${nombre}`}
                      style={{ lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Fecha límite (opcional)
                </label>
                <input
                  type="date"
                  value={formData.fecha_limite}
                  onChange={(e) => {
                    // Forzar año 2026 en el input
                    let val = e.target.value;
                    if (val) {
                      const [, mm, dd] = val.split('-');
                      val = `2026-${mm || '01'}-${dd || '01'}`;
                    }
                    setFormData({ ...formData, fecha_limite: val });
                  }}
                  min="2026-01-01"
                  max="2026-12-31"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Prioridad
                </label>
                <select
                  value={formData.prioridad}
                  onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="baja">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 text-sm sm:text-base"
                disabled={loading}
              >
                <Send size={18} />
                {loading ? 'Creando...' : 'Crear tarea'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmationModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={() => setModal({ ...modal, isOpen: false })}
        onCancel={() => setModal({ ...modal, isOpen: false })}
      />
    </div>
  );
}

export default TodoFormulario;
