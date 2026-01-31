import { useState, useCallback, useMemo } from 'react';
import { supabase } from '../config/supabase';
import { Plus, Send, X, CheckCircle2 } from 'lucide-react';
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
    menciones: '',
    fecha_limite: '',
    prioridad: 'normal'
  });
  const [showMenciones, setShowMenciones] = useState(false);

  // Obtener sugerencias de menciones
  const sugerenciasMenciones = useMemo(() => {
    const texto = formData.menciones;
    const ultimoArroba = texto.lastIndexOf('@');
    
    if (ultimoArroba === -1) return [];

    const busqueda = normalizarTexto(texto.substring(ultimoArroba + 1));
    if (!busqueda.trim()) return [];

    const todasLasOpciones = [
      ...comisiones,
      ...grupos,
      ...(catequistas || []).map(c => c.nombre)
    ];

    return todasLasOpciones.filter(opcion =>
      normalizarTexto(opcion).includes(busqueda)
    );
  }, [formData.menciones, catequistas]);

  const handleMencionesChange = (e) => {
    const valor = e.target.value;
    setFormData({ ...formData, menciones: valor });
    setShowMenciones(valor.includes('@') && sugerenciasMenciones.length > 0);
  };

  const seleccionarMencion = (opcion) => {
    const texto = formData.menciones;
    const ultimoArroba = texto.lastIndexOf('@');
    const nuevasMenciones = texto.substring(0, ultimoArroba) + '@' + opcion + ' ';
    setFormData({ ...formData, menciones: nuevasMenciones });
    setShowMenciones(false);
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

      // Parsear menciones
      const menciones = formData.menciones
        .split(/[@\s,]+/)
        .filter(m => m.trim())
        .map(m => m.trim());

      const { error } = await supabase
        .from('tareas')
        .insert([
          {
            descripcion: formData.descripcion,
            menciones: menciones,
            estado: 'pendiente',
            prioridad: formData.prioridad,
            creado_por: user?.usuario || 'anon',
            fecha_limite: formData.fecha_limite || null,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;


      // Persist success flag in localStorage for post-reload modal
      localStorage.setItem('tareaCreada', '1');

      setFormData({
        descripcion: '',
        menciones: '',
        fecha_limite: '',
        prioridad: 'normal'
      });
      setShowForm(false);
      
      // Recargar tareas después de crear
      if (onTaskCreated) {
        setTimeout(() => onTaskCreated(), 500);
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
      menciones: '',
      fecha_limite: '',
      prioridad: 'normal'
    });
    setShowForm(false);
    setShowMenciones(false);
  }, []);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
        <div className="text-center mb-4 flex flex-col items-center justify-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2 sm:gap-3">
            <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
            Tareas
          </h1>
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm sm:text-base whitespace-nowrap shadow"
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

            <div className="relative">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Mencionar usuarios (escribe @ para sugerir)
              </label>
              <textarea
                value={formData.menciones}
                onChange={handleMencionesChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="2"
                placeholder="Escribe @ seguido del nombre (ej: @Juan @Laura)"
              />
              
              {/* Dropdown de sugerencias */}
              {showMenciones && sugerenciasMenciones.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  {sugerenciasMenciones.map((opcion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => seleccionarMencion(opcion)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      @ {opcion}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Solo tú y los mencionados podrán ver esta tarea</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Fecha límite (opcional)
                </label>
                <input
                  type="date"
                  value={formData.fecha_limite}
                  onChange={(e) => setFormData({ ...formData, fecha_limite: e.target.value })}
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
