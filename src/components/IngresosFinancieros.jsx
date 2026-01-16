import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { Plus, Trash2, Edit2, Save, X, Wallet, Calendar, FileText, Link as LinkIcon } from 'lucide-react';

function IngresosFinancieros({ user }) {
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    origen: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    metodo: 'efectivo',
    descripcion: '',
    recibido_por: user?.usuario || '',
    comprobante_url: ''
  });

  const metodos = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'sinpe', label: 'SINPE' },
    { value: 'transferencia', label: 'Transferencia' }
  ];

  useEffect(() => {
    loadIngresos();
  }, []);

  const loadIngresos = async () => {
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
  };

  const resetForm = () => {
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
  };

  const uploadComprobante = async (selectedFile) => {
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
  };

  const handleSubmit = async (e) => {
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
        alert('✅ Ingreso actualizado');
      } else {
        const { error } = await supabase
          .from('ingresos_confirmacion')
          .insert([ingresoData]);
        if (error) throw error;
        alert('✅ Ingreso registrado');
      }

      resetForm();
      loadIngresos();
      setUploading(false);
    } catch (error) {
      console.error('Error guardando ingreso:', error);
      alert('❌ Error al guardar el ingreso');
      setUploading(false);
    }
  };

  const handleEdit = (ingreso) => {
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
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este ingreso?')) return;
    try {
      const { error } = await supabase
        .from('ingresos_confirmacion')
        .delete()
        .eq('id', id);
      if (error) throw error;
      alert('✅ Ingreso eliminado');
      loadIngresos();
    } catch (error) {
      console.error('Error eliminando ingreso:', error);
      alert('❌ Error al eliminar el ingreso');
    }
  };

  const totalIngresos = ingresos.reduce((sum, ingreso) => sum + (ingreso.monto || 0), 0);

  const ingresosPorMetodo = metodos.map((m) => ({
    ...m,
    total: ingresos
      .filter((i) => i.metodo === m.value)
      .reduce((sum, i) => sum + i.monto, 0)
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-gray-600">Cargando ingresos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-8 h-8" />
            Gestión de Ingresos
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            {showForm ? (
              <>
                <X size={20} />
                Cancelar
              </>
            ) : (
              <>
                <Plus size={20} />
                Nuevo ingreso
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-emerald-100 text-sm mb-1">Total ingresos</p>
            <p className="text-3xl font-bold">₡{totalIngresos.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-emerald-100 text-sm mb-1">Cantidad de ingresos</p>
            <p className="text-3xl font-bold">{ingresos.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-emerald-100 text-sm mb-1">Promedio por ingreso</p>
            <p className="text-3xl font-bold">
              ₡{ingresos.length > 0 ? Math.round(totalIngresos / ingresos.length).toLocaleString() : '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Totales por método */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Ingresos por método</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ingresosPorMetodo.map((m) => (
            <div key={m.value} className="border rounded-lg p-4 bg-emerald-50/60 border-emerald-100">
              <p className="text-emerald-700 text-sm font-medium mb-1">{m.label}</p>
              <p className="text-emerald-900 text-xl font-bold">₡{m.total.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-xl font-bold text-gray-800 mb-4">
            {editingId ? 'Editar ingreso' : 'Registrar nuevo ingreso'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Origen *</label>
                <input
                  type="text"
                  value={formData.origen}
                  onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Ej: Venta de comida"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monto (₡) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="50000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Método</label>
                <select
                  value={formData.metodo}
                  onChange={(e) => setFormData({ ...formData, metodo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {metodos.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (opcional)</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows="3"
                placeholder="Notas o detalles adicionales"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comprobante (imagen/pdf)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-600"
                />
                {file && (
                  <p className="text-xs text-gray-500 mt-1">Archivo seleccionado: {file.name}</p>
                )}
              </div>
              {formData.comprobante_url && (
                <div className="flex items-center gap-2 text-sm text-emerald-700">
                  <LinkIcon className="w-4 h-4" />
                  <a
                    href={formData.comprobante_url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    Ver comprobante actual
                  </a>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={uploading}
              >
                <Save size={20} />
                {uploading ? 'Subiendo...' : editingId ? 'Actualizar' : 'Guardar'} ingreso
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-xl font-bold text-gray-800">Historial de ingresos</h4>
        </div>

        {ingresos.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No hay ingresos registrados</p>
            <p className="text-sm mt-2">Haz clic en "Nuevo ingreso" para comenzar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrado por</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comprobante</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ingresos.map((ingreso) => (
                  <tr key={ingreso.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        {new Date(ingreso.fecha).toLocaleDateString('es-CR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <p className="font-medium">{ingreso.origen}</p>
                        {ingreso.descripcion && (
                          <p className="text-gray-500 text-xs mt-1">{ingreso.descripcion}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">{ingreso.metodo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₡{ingreso.monto.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ingreso.recibido_por}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-700">
                      {ingreso.comprobante_url ? (
                        <a
                          href={ingreso.comprobante_url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          Ver
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(ingreso)}
                          className="text-emerald-600 hover:text-emerald-900 p-1 rounded hover:bg-emerald-50 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(ingreso.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default IngresosFinancieros;
