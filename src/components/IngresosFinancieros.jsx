import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { supabase } from '../config/supabase';
import { Plus, Trash2, Edit2, Save, X, Wallet, Calendar, FileText, Link as LinkIcon } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

const metodos = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'sinpe', label: 'SINPE' },
  { value: 'transferencia', label: 'Transferencia' }
];

const IngresoRow = memo(({ ingreso, onEdit, onDelete }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
      <div className="flex items-center gap-2">
        <Calendar size={14} className="text-gray-400 hidden sm:inline" />
        <span className="text-xs sm:text-sm">{new Date(ingreso.fecha).toLocaleDateString('es-CR')}</span>
      </div>
    </td>
    <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
      <div>
        <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{ingreso.origen}</p>
        {ingreso.descripcion && (
          <p className="text-gray-500 text-xs mt-1 truncate">{ingreso.descripcion}</p>
        )}
      </div>
    </td>
    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
      <span className="text-xs sm:text-sm text-gray-700 capitalize">{ingreso.metodo}</span>
    </td>
    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
      <span className="text-xs sm:text-sm font-semibold text-gray-900">₡{ingreso.monto.toLocaleString()}</span>
    </td>
    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
      <div className="flex justify-end gap-1 sm:gap-2">
        {ingreso.comprobante_url && (
          <a
            href={ingreso.comprobante_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center text-emerald-600 hover:text-emerald-900 p-1 rounded hover:bg-emerald-50 transition-colors"
            title="Ver comprobante"
          >
            <LinkIcon size={16} className="sm:w-5 sm:h-5" />
          </a>
        )}
        <button
          onClick={() => onEdit(ingreso)}
          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
          title="Editar"
        >
          <Edit2 size={16} className="sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={() => onDelete(ingreso.id)}
          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
          title="Eliminar"
        >
          <Trash2 size={16} className="sm:w-5 sm:h-5" />
        </button>
      </div>
    </td>
  </tr>
));

function IngresosFinancieros({ user }) {
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    origen: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    metodo: 'efectivo',
    descripcion: '',
    recibido_por: user?.usuario || '',
    comprobante_url: ''
  });

  const loadIngresos = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ingresos_confirmacion')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) throw error;
      setIngresos(data || []);
    } catch (error) {
      console.error('Error cargando ingresos:', error);
      alert('Error al cargar los ingresos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIngresos();
    // Solo cargar una vez al montar el componente
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = useCallback(() => {
    setFormData({
      origen: '',
      monto: '',
      fecha: new Date().toISOString().split('T')[0],
      metodo: 'efectivo',
      descripcion: '',
      recibido_por: user?.usuario || '',
      comprobante_url: ''
    });
    setEditingId(null);
    setShowForm(false);
    setFile(null);
  }, [user?.usuario]);

  const uploadComprobante = useCallback(async (selectedFile) => {
    if (!selectedFile) return formData.comprobante_url || '';
    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `ingreso-${Date.now()}.${fileExt}`;
    const filePath = `${user?.usuario || 'anon'}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('ingresos_comprobantes')
      .upload(filePath, selectedFile, { cacheControl: '3600', upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('ingresos_comprobantes').getPublicUrl(filePath);
    return data?.publicUrl || '';
  }, [formData.comprobante_url, user]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.origen || !formData.monto) {
      alert('Completa el origen y el monto');
      return;
    }

    try {
      setUploading(true);

      const comprobanteUrl = await uploadComprobante(file);

      const ingresoData = {
        ...formData,
        monto: parseFloat(formData.monto),
        fecha: formData.fecha || new Date().toISOString().split('T')[0],
        comprobante_url: comprobanteUrl
      };

      if (editingId) {
        const { error } = await supabase
          .from('ingresos_confirmacion')
          .update(ingresoData)
          .eq('id', editingId);
        if (error) throw error;
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Ingreso actualizado',
          message: 'El ingreso ha sido actualizado exitosamente.'
        });
      } else {
        const { error } = await supabase
          .from('ingresos_confirmacion')
          .insert([ingresoData]);
        if (error) throw error;
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Ingreso registrado',
          message: 'El nuevo ingreso ha sido registrado exitosamente.'
        });
      }

      resetForm();
      await loadIngresos();
      setUploading(false);
    } catch (error) {
      console.error('Error guardando ingreso:', error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error al guardar',
        message: 'Ocurrió un error al guardar el ingreso. Intenta nuevamente.'
      });
      setUploading(false);
    }
  }, [editingId, file, formData, resetForm, uploadComprobante]);

  const handleEdit = useCallback((ingreso) => {
    setFormData({
      origen: ingreso.origen,
      monto: ingreso.monto.toString(),
      fecha: ingreso.fecha,
      metodo: ingreso.metodo,
      descripcion: ingreso.descripcion || '',
      recibido_por: ingreso.recibido_por || user?.usuario || '',
      comprobante_url: ingreso.comprobante_url || ''
    });
    setEditingId(ingreso.id);
    setShowForm(true);
    setFile(null);
  }, [user]);

  const handleDelete = useCallback((id) => {
    setDeleteId(id);
    setModal({
      isOpen: true,
      type: 'error', // Fuerza modal rojo para eliminar
      title: '¿Eliminar ingreso?',
      message: '¿Está seguro de que desea eliminar este ingreso? Esta acción no se puede deshacer.'
    });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase
        .from('ingresos_confirmacion')
        .delete()
        .eq('id', deleteId);
      if (error) throw error;
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Ingreso eliminado',
        message: 'El ingreso ha sido eliminado correctamente.'
      });
      await loadIngresos();
      setDeleteId(null);
    } catch (error) {
      console.error('Error eliminando ingreso:', error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error al eliminar',
        message: 'Ocurrió un error al eliminar el ingreso. Intenta nuevamente.'
      });
    }
  }, [deleteId, loadIngresos]);

  const totalIngresos = useMemo(() => 
    ingresos.reduce((sum, ingreso) => sum + (ingreso.monto || 0), 0),
    [ingresos]
  );

  const ingresosPorMetodo = useMemo(() => 
    metodos.map((m) => ({
      ...m,
      total: ingresos
        .filter((i) => i.metodo === m.value)
        .reduce((sum, i) => sum + i.monto, 0)
    })),
    [ingresos]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-gray-600">Cargando ingresos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl p-5 sm:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="truncate">Gestión de Ingresos</span>
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-emerald-700 hover:bg-emerald-50 px-3 sm:px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            {showForm ? (
              <>
                <X size={18} className="sm:w-5 sm:h-5" />
                <span className="sm:inline">Cancelar</span>
              </>
            ) : (
              <>
                <Plus size={18} className="sm:w-5 sm:h-5" />
                Nuevo
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-5">
            <p className="text-emerald-100 text-xs sm:text-sm mb-2">Total ingresos</p>
            <p className="text-2xl sm:text-3xl font-bold">₡{totalIngresos.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-5">
            <p className="text-emerald-100 text-xs sm:text-sm mb-2">Cantidad de ingresos</p>
            <p className="text-2xl sm:text-3xl font-bold">{ingresos.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-5">
            <p className="text-emerald-100 text-xs sm:text-sm mb-2">Promedio por ingreso</p>
            <p className="text-2xl sm:text-3xl font-bold">
              ₡{ingresos.length > 0 ? Math.round(totalIngresos / ingresos.length).toLocaleString() : '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Totales por método - Cards en mobile, grid en desktop */}
      <div className="bg-white rounded-xl shadow p-5 sm:p-8">
        <h4 className="text-lg font-bold text-gray-800 mb-5">Ingresos por método</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
          {ingresosPorMetodo.map((m) => (
            <div key={m.value} className="border rounded-lg p-4 sm:p-5 bg-emerald-50/60 border-emerald-100">
              <p className="text-emerald-700 text-xs sm:text-sm font-medium mb-2">{m.label}</p>
              <p className="text-emerald-900 text-lg sm:text-xl font-bold">₡{m.total.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-8">
          <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-5">
            {editingId ? 'Editar ingreso' : 'Registrar nuevo ingreso'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Origen *</label>
                <input
                  type="text"
                  value={formData.origen}
                  onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Ej: Venta de comida"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Monto (₡) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="50000"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Fecha</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Método</label>
                <select
                  value={formData.metodo}
                  onChange={(e) => setFormData({ ...formData, metodo: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {metodos.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Descripción (opcional)</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows="3"
                placeholder="Notas o detalles adicionales"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Comprobante (imagen/pdf)</label>
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="comprobante-input"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs sm:text-sm font-semibold cursor-pointer hover:bg-emerald-700 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    {file ? 'Cambiar archivo' : 'Elegir archivo'}
                  </label>
                  <input
                    id="comprobante-input"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <span className="text-xs sm:text-sm text-gray-600 truncate">
                    {file ? file.name : 'Ningún archivo seleccionado'}
                  </span>
                </div>
              </div>
              {formData.comprobante_url && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-700 mt-2 sm:mt-0">
                  <LinkIcon className="w-4 h-4" />
                  <a
                    href={formData.comprobante_url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline truncate"
                  >
                    Ver comprobante
                  </a>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
                disabled={uploading}
              >
                <Save size={18} className="sm:w-5 sm:h-5" />
                {uploading ? 'Subiendo...' : editingId ? 'Actualizar' : 'Guardar'}
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

      {/* Lista - Responsive table con scroll en mobile */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h4 className="text-lg sm:text-xl font-bold text-gray-800">Historial de ingresos</h4>
        </div>

        {ingresos.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-gray-500">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-base sm:text-lg font-medium">No hay ingresos registrados</p>
            <p className="text-xs sm:text-sm mt-2">Haz clic en "Nuevo ingreso" para comenzar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Origen</th>
                  <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Método</th>
                  <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-3 sm:px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ingresos.map((ingreso) => (
                  <IngresoRow
                    key={ingreso.id}
                    ingreso={ingreso}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={modal.title?.toLowerCase().includes('eliminar') ? 'Eliminar' : 'Aceptar'}
        cancelText="Cancelar"
        onConfirm={() => {
          if (modal.title?.toLowerCase().includes('eliminar')) {
            confirmDelete();
          } else {
            setModal({ ...modal, isOpen: false });
          }
        }}
        onCancel={() => {
          setDeleteId(null);
          setModal({ ...modal, isOpen: false });
        }}
      />
    </div>
  );
}

export default IngresosFinancieros;
