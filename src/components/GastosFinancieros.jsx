import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { Plus, Trash2, Edit2, Save, X, DollarSign, Calendar, FileText } from 'lucide-react';

const categorias = [
  { value: 'transporte', label: 'Transporte', color: 'blue' },
  { value: 'alimentacion', label: 'Alimentación', color: 'green' },
  { value: 'materiales', label: 'Materiales', color: 'purple' },
  { value: 'hospedaje', label: 'Hospedaje', color: 'orange' },
  { value: 'servicios', label: 'Servicios', color: 'red' },
  { value: 'otros', label: 'Otros', color: 'gray' }
];

function GastosFinancieros({ user }) {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    concepto: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    categoria: 'transporte',
    descripcion: '',
    pagado_por: user?.usuario || ''
  });

  const loadGastos = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gastos_confirmacion')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) throw error;
      setGastos(data || []);
    } catch (error) {
      console.error('Error cargando gastos:', error);
      alert('Error al cargar los gastos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGastos();
  }, [loadGastos]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.concepto || !formData.monto) {
      alert('Por favor completa el concepto y monto');
      return;
    }

    try {
      const gastoData = {
        ...formData,
        monto: parseFloat(formData.monto),
        fecha: formData.fecha || new Date().toISOString().split('T')[0]
      };

      if (editingId) {
        // Actualizar gasto existente
        const { error } = await supabase
          .from('gastos_confirmacion')
          .update(gastoData)
          .eq('id', editingId);

        if (error) throw error;
        alert('✅ Gasto actualizado exitosamente');
      } else {
        // Crear nuevo gasto
        const { error } = await supabase
          .from('gastos_confirmacion')
          .insert([gastoData]);

        if (error) throw error;
        alert('✅ Gasto registrado exitosamente');
      }

      resetForm();
      loadGastos();
    } catch (error) {
      console.error('Error guardando gasto:', error);
      alert('❌ Error al guardar el gasto');
    }
  }, [editingId, formData, loadGastos]);

  const handleEdit = useCallback((gasto) => {
    setFormData({
      concepto: gasto.concepto,
      monto: gasto.monto.toString(),
      fecha: gasto.fecha,
      categoria: gasto.categoria,
      descripcion: gasto.descripcion || '',
      pagado_por: gasto.pagado_por
    });
    setEditingId(gasto.id);
    setShowForm(true);
  }, [user]);

  const handleDelete = useCallback(async (id) => {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return;

    try {
      const { error } = await supabase
        .from('gastos_confirmacion')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('✅ Gasto eliminado');
      loadGastos();
    } catch (error) {
      console.error('Error eliminando gasto:', error);
      alert('❌ Error al eliminar el gasto');
    }
  }, [loadGastos]);

  const resetForm = useCallback(() => {
    setFormData({
      concepto: '',
      monto: '',
      fecha: new Date().toISOString().split('T')[0],
      categoria: 'transporte',
      descripcion: '',
      pagado_por: user?.usuario || ''
    });
    setEditingId(null);
    setShowForm(false);
  }, [user]);

  const totalGastos = useMemo(() => 
    gastos.reduce((sum, gasto) => sum + (gasto.monto || 0), 0),
    [gastos]
  );

  const gastosPorCategoria = useMemo(() => 
    categorias.map(cat => ({
      ...cat,
      total: gastos
        .filter(g => g.categoria === cat.value)
        .reduce((sum, g) => sum + g.monto, 0)
    })),
    [gastos]
  );

  const getCategoriaColor = useCallback((categoria) => {
    const cat = categorias.find(c => c.value === categoria);
    return cat?.color || 'gray';
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-gray-600">Cargando gastos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header con totales */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="truncate">Gestión de Gastos</span>
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-blue-600 hover:bg-blue-50 px-3 sm:px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm sm:text-base whitespace-nowrap"
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
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
            <p className="text-blue-100 text-xs sm:text-sm mb-1">Total Gastos</p>
            <p className="text-2xl sm:text-3xl font-bold">₡{totalGastos.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
            <p className="text-blue-100 text-xs sm:text-sm mb-1">Cantidad de Gastos</p>
            <p className="text-2xl sm:text-3xl font-bold">{gastos.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
            <p className="text-blue-100 text-xs sm:text-sm mb-1">Promedio por Gasto</p>
            <p className="text-2xl sm:text-3xl font-bold">
              ₡{gastos.length > 0 ? Math.round(totalGastos / gastos.length).toLocaleString() : '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Gastos por categoría */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Gastos por Categoría</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
          {gastosPorCategoria.map(cat => (
            <div key={cat.value} className={`bg-${cat.color}-50 border-2 border-${cat.color}-200 rounded-lg p-3 sm:p-4`}>
              <p className={`text-${cat.color}-700 text-xs sm:text-sm font-medium mb-1`}>{cat.label}</p>
              <p className={`text-${cat.color}-900 text-lg sm:text-xl font-bold`}>₡{cat.total.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
            {editingId ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Concepto *
                </label>
                <input
                  type="text"
                  value={formData.concepto}
                  onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Transporte de estudiantes"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Monto (₡) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50000"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Detalles adicionales sobre este gasto..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
              >
                <Save size={18} className="sm:w-5 sm:h-5" />
                {editingId ? 'Actualizar' : 'Guardar'} Gasto
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

      {/* Lista de gastos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h4 className="text-lg sm:text-xl font-bold text-gray-800">Historial de Gastos</h4>
        </div>
        
        {gastos.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-gray-500">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-base sm:text-lg font-medium">No hay gastos registrados</p>
            <p className="text-xs sm:text-sm mt-2">Haz clic en "Nuevo Gasto" para comenzar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Concepto
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Categoría
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gastos.map((gasto) => (
                  <tr key={gasto.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400 hidden sm:inline" />
                        <span className="text-xs sm:text-sm">{new Date(gasto.fecha).toLocaleDateString('es-CR')}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                      <div>
                        <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{gasto.concepto}</p>
                        {gasto.descripcion && (
                          <p className="text-gray-500 text-xs mt-1 truncate">{gasto.descripcion}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getCategoriaColor(gasto.categoria)}-100 text-${getCategoriaColor(gasto.categoria)}-800`}>
                        {categorias.find(c => c.value === gasto.categoria)?.label}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">
                        ₡{gasto.monto.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <button
                          onClick={() => handleEdit(gasto)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(gasto.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} className="sm:w-5 sm:h-5" />
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

export default GastosFinancieros;
