import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Download, Edit2, FileText, Package, Plus, Save, Search, Trash2, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../config/supabase';
import ConfirmationModal from './ConfirmationModal';

const PROCEDENCIAS = ['Equipo Pastoral', 'Oratorio', 'Confirma', 'Otros'];
const CONDICIONES = ['Excelente', 'Buen estado', 'Regular', 'Requiere reparación'];
const BLOQUES = ['Bloque 1', 'Bloque 2', 'Bloque 3', 'Bloque 4', 'Bloque 5'];
const OPCIONES_BLOQUE = ['Uso general', ...BLOQUES];

const createInitialForm = (user) => ({
  detalle: '',
  placa: '',
  cantidad: '1',
  condicion: 'Buen estado',
  procedencia: 'Equipo Pastoral',
  bloques: ['Bloque 1'],
  ubicacion_guardado: '',
  registrado_por: user?.usuario || ''
});

const getBloques = (material) => {
  if (Array.isArray(material.bloques) && material.bloques.length > 0) return material.bloques;
  return material.bloque ? [material.bloque] : [];
};

function MaterialesRetiro({ user }) {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(() => createInitialForm(user));
  const [search, setSearch] = useState('');
  const [filterBlock, setFilterBlock] = useState('');
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [materialToDelete, setMaterialToDelete] = useState(null);

  const loadMateriales = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('materiales_retiro')
        .select('*')
        .order('detalle', { ascending: true });

      if (error) throw error;
      setMateriales(data || []);
    } catch (error) {
      console.error('Error cargando materiales del retiro:', error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'No se pudieron cargar los materiales',
        message: 'Verifica que la tabla materiales_retiro haya sido creada en Supabase y vuelve a intentarlo.'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMateriales();
  }, [loadMateriales]);

  const resetForm = useCallback(() => {
    setFormData(createInitialForm(user));
    setEditingId(null);
    setShowForm(false);
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.detalle.trim() || !formData.ubicacion_guardado.trim() || Number(formData.cantidad) < 1 || formData.bloques.length === 0) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Campos incompletos',
        message: 'Completa el detalle, la cantidad, al menos un bloque y el lugar donde se guarda el material.'
      });
      return;
    }

    const materialData = {
      ...formData,
      detalle: formData.detalle.trim(),
      placa: formData.placa.trim() || null,
      cantidad: Number(formData.cantidad),
      ubicacion_guardado: formData.ubicacion_guardado.trim(),
      registrado_por: formData.registrado_por.trim() || null
    };

    try {
      setSaving(true);
      const request = editingId
        ? supabase.from('materiales_retiro').update(materialData).eq('id', editingId)
        : supabase.from('materiales_retiro').insert([materialData]);
      const { error } = await request;
      if (error) throw error;

      resetForm();
      await loadMateriales();
      setModal({
        isOpen: true,
        type: 'success',
        title: editingId ? 'Material actualizado' : 'Material registrado',
        message: editingId
          ? 'Los datos del material se actualizaron correctamente.'
          : 'El material se agregó al inventario del retiro.'
      });
    } catch (error) {
      console.error('Error guardando material:', error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error al guardar',
        message: 'No fue posible guardar el material. Intenta nuevamente.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (material) => {
    setFormData({
      detalle: material.detalle || '',
      placa: material.placa || '',
      cantidad: String(material.cantidad || 1),
      condicion: material.condicion || 'Buen estado',
      procedencia: material.procedencia || 'Equipo Pastoral',
      bloques: getBloques(material).length > 0 ? getBloques(material) : ['Uso general'],
      ubicacion_guardado: material.ubicacion_guardado || '',
      registrado_por: material.registrado_por || user?.usuario || ''
    });
    setEditingId(material.id);
    setShowForm(true);
  };

  const toggleBloque = (option) => {
    setFormData((current) => {
      if (option === 'Uso general') {
        return { ...current, bloques: ['Uso general'] };
      }

      const currentBlocks = current.bloques.filter((block) => block !== 'Uso general');
      const bloques = currentBlocks.includes(option)
        ? currentBlocks.filter((block) => block !== option)
        : [...currentBlocks, option];

      return { ...current, bloques };
    });
  };

  const handleMovementToggle = async (material, field, checked) => {
    if (field === 'check_in' && checked && !material.check_out) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Primero registra la salida',
        message: 'El check-in solo se puede marcar después de haber registrado el check-out del material.'
      });
      return;
    }

    const changes = field === 'check_out'
      ? { check_out: checked, check_in: checked ? material.check_in : false }
      : { check_in: checked };

    try {
      const { error } = await supabase
        .from('materiales_retiro')
        .update(changes)
        .eq('id', material.id);
      if (error) throw error;

      setMateriales((current) => current.map((item) => (
        item.id === material.id ? { ...item, ...changes } : item
      )));
    } catch (error) {
      console.error('Error actualizando control de movimiento:', error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'No se pudo actualizar',
        message: 'El estado de salida o regreso no se pudo guardar. Intenta nuevamente.'
      });
    }
  };

  const askToDelete = (material) => {
    setMaterialToDelete(material);
    setModal({
      isOpen: true,
      type: 'confirm',
      title: '¿Eliminar material?',
      message: `Se eliminará “${material.detalle}” del inventario. Esta acción no se puede deshacer.`
    });
  };

  const confirmDelete = async () => {
    if (!materialToDelete) return;
    try {
      const { error } = await supabase
        .from('materiales_retiro')
        .delete()
        .eq('id', materialToDelete.id);
      if (error) throw error;

      setMateriales((current) => current.filter((item) => item.id !== materialToDelete.id));
      setMaterialToDelete(null);
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Material eliminado',
        message: 'El material se eliminó del inventario.'
      });
    } catch (error) {
      console.error('Error eliminando material:', error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'No se pudo eliminar',
        message: 'El material no se pudo eliminar. Intenta nuevamente.'
      });
    }
  };

  const filteredMateriales = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('es-CR');
    return materiales.filter((material) => {
      const matchesBlock = !filterBlock || getBloques(material).includes(filterBlock);
      const searchable = [
        material.detalle,
        material.placa,
        material.procedencia,
        material.ubicacion_guardado,
        material.condicion,
        ...getBloques(material)
      ].filter(Boolean).join(' ').toLocaleLowerCase('es-CR');
      return matchesBlock && (!normalizedSearch || searchable.includes(normalizedSearch));
    });
  }, [filterBlock, materiales, search]);

  const summary = useMemo(() => ({
    registros: materiales.length,
    unidades: materiales.reduce((total, material) => total + (Number(material.cantidad) || 0), 0),
    salieron: materiales.filter((material) => material.check_out).length,
    regresaron: materiales.filter((material) => material.check_in).length
  }), [materiales]);

  const descargarPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('Inventario de Materiales - Retiro Confirmación 2026', pageWidth / 2, 14, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(
      `Registros: ${filteredMateriales.length} | Unidades: ${filteredMateriales.reduce((total, material) => total + (Number(material.cantidad) || 0), 0)} | Generado: ${new Date().toLocaleDateString('es-CR')}`,
      pageWidth / 2,
      20,
      { align: 'center' }
    );

    autoTable(doc, {
      head: [['#', 'Detalle', 'Placa', 'Cant.', 'Condición', 'Procedencia', 'Bloques', 'Guardado en', 'Check-out', 'Check-in']],
      body: filteredMateriales.map((material, index) => [
        index + 1,
        material.detalle,
        material.placa || '—',
        material.cantidad,
        material.condicion,
        material.procedencia,
        getBloques(material).join(', '),
        material.ubicacion_guardado,
        material.check_out ? 'Sí' : 'No',
        material.check_in ? 'Sí' : 'No'
      ]),
      startY: 26,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1.5, valign: 'middle' },
      headStyles: { fillColor: [217, 119, 6], textColor: 255, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { cellWidth: 7, halign: 'center' },
        1: { cellWidth: 42 },
        2: { cellWidth: 22 },
        3: { cellWidth: 11, halign: 'center' },
        4: { cellWidth: 28 },
        5: { cellWidth: 28 },
        6: { cellWidth: 19, halign: 'center' },
        7: { cellWidth: 41 },
        8: { cellWidth: 17, halign: 'center' },
        9: { cellWidth: 15, halign: 'center' }
      },
      margin: { left: 10, right: 10 }
    });

    doc.save('Materiales_Retiro_Confirmacion_2026.pdf');
  };

  const closeModal = () => {
    setMaterialToDelete(null);
    setModal((current) => ({ ...current, isOpen: false }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-gray-600">Cargando materiales...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl p-5 sm:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-5">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 sm:w-8 sm:h-8" />
            Inventario del Retiro
          </h2>
          <div className="flex gap-2">
            <button
              onClick={descargarPDF}
              className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm"
            >
              <Download size={18} />
              PDF
            </button>
            <button
              onClick={() => (showForm ? resetForm() : setShowForm(true))}
              className="bg-white text-amber-700 hover:bg-amber-50 px-3 sm:px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm"
            >
              {showForm ? <X size={18} /> : <Plus size={18} />}
              {showForm ? 'Cancelar' : 'Nuevo material'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard label="Registros" value={summary.registros} />
          <SummaryCard label="Unidades" value={summary.unidades} />
          <SummaryCard label="Con check-out" value={summary.salieron} />
          <SummaryCard label="Con check-in" value={summary.regresaron} />
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-7">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-5">
            {editingId ? 'Editar material' : 'Registrar material'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Detalle del material *">
                <input
                  value={formData.detalle}
                  onChange={(event) => setFormData((current) => ({ ...current, detalle: event.target.value }))}
                  className="input-field"
                  placeholder="Ej: Mesa plegable"
                  required
                />
              </Field>
              <Field label="Placa (si aplica)">
                <input
                  value={formData.placa}
                  onChange={(event) => setFormData((current) => ({ ...current, placa: event.target.value }))}
                  className="input-field"
                  placeholder="Ej: ACT-123"
                />
              </Field>
              <Field label="Cantidad *">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.cantidad}
                  onChange={(event) => setFormData((current) => ({ ...current, cantidad: event.target.value }))}
                  className="input-field"
                  required
                />
              </Field>
              <Field label="Condición *">
                <select
                  value={formData.condicion}
                  onChange={(event) => setFormData((current) => ({ ...current, condicion: event.target.value }))}
                  className="input-field"
                >
                  {CONDICIONES.map((condition) => <option key={condition}>{condition}</option>)}
                </select>
              </Field>
              <Field label="Procedencia *">
                <select
                  value={formData.procedencia}
                  onChange={(event) => setFormData((current) => ({ ...current, procedencia: event.target.value }))}
                  className="input-field"
                >
                  {PROCEDENCIAS.map((origin) => <option key={origin}>{origin}</option>)}
                </select>
              </Field>
              <Field label="Bloques donde se usa *">
                <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 p-3">
                  {OPCIONES_BLOQUE.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm font-normal text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.bloques.includes(option)}
                        onChange={() => toggleBloque(option)}
                        className="!w-4 !h-4 !min-w-4 !min-h-4"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Dónde se guardará *">
                <input
                  value={formData.ubicacion_guardado}
                  onChange={(event) => setFormData((current) => ({ ...current, ubicacion_guardado: event.target.value }))}
                  className="input-field"
                  placeholder="Ej: Caja Negra"
                  required
                />
              </Field>
              <Field label="Registrado por">
                <input
                  value={formData.registrado_por}
                  onChange={(event) => setFormData((current) => ({ ...current, registrado_por: event.target.value }))}
                  className="input-field"
                  placeholder="Nombre de la persona"
                />
              </Field>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Save size={18} />
                {saving ? 'Guardando...' : editingId ? 'Actualizar material' : 'Guardar material'}
              </button>
              <button type="button" onClick={resetForm} disabled={saving} className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">Lista de materiales</h3>
              <p className="text-sm text-gray-500 mt-1">Marca salida al salir del colegio y regreso al volver.</p>
            </div>
            <span className="text-sm text-gray-500">{filteredMateriales.length} de {materiales.length} registros</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <label className="relative block flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full h-11 pl-9 pr-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Buscar por material, placa, procedencia o ubicación"
              />
            </label>
            <select
              value={filterBlock}
              onChange={(event) => setFilterBlock(event.target.value)}
              className="h-11 sm:w-48 px-3 py-0 leading-5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              aria-label="Filtrar por bloque"
            >
              <option value="">Todos los bloques</option>
              {OPCIONES_BLOQUE.map((block) => <option key={block}>{block}</option>)}
            </select>
          </div>
        </div>

        {filteredMateriales.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <FileText className="w-14 h-14 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No hay materiales para mostrar</p>
            <p className="text-sm mt-1">Registra un material o modifica los filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <Header>Detalle</Header>
                  <Header>Placa</Header>
                  <Header>Cant.</Header>
                  <Header>Condición</Header>
                  <Header>Procedencia</Header>
                  <Header>Bloques</Header>
                  <Header>Guardado en</Header>
                  <Header centered>Check-out</Header>
                  <Header centered>Check-in</Header>
                  <Header centered>Acciones</Header>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMateriales.map((material) => (
                  <tr key={material.id} className="hover:bg-amber-50/30">
                    <td className="px-4 py-3 font-medium text-gray-900">{material.detalle}</td>
                    <td className="px-4 py-3 text-gray-600">{material.placa || '—'}</td>
                    <td className="px-4 py-3 text-center font-semibold">{material.cantidad}</td>
                    <td className="px-4 py-3 text-gray-700">{material.condicion}</td>
                    <td className="px-4 py-3 text-gray-700">{material.procedencia}</td>
                    <td className="px-4 py-3 text-gray-700">{getBloques(material).join(', ') || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{material.ubicacion_guardado}</td>
                    <td className="px-4 py-3 text-center">
                      <MovementCheckbox
                        checked={Boolean(material.check_out)}
                        label={`Registrar salida de ${material.detalle}`}
                        onChange={(checked) => handleMovementToggle(material, 'check_out', checked)}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <MovementCheckbox
                        checked={Boolean(material.check_in)}
                        disabled={!material.check_out}
                        label={`Registrar regreso de ${material.detalle}`}
                        onChange={(checked) => handleMovementToggle(material, 'check_in', checked)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(material)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar material">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => askToDelete(material)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar material">
                          <Trash2 className="w-4 h-4" />
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

      <ConfirmationModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={materialToDelete ? 'Eliminar' : 'Aceptar'}
        cancelText="Cancelar"
        onConfirm={materialToDelete ? confirmDelete : closeModal}
        onCancel={closeModal}
      />

      <style>{`
        .input-field {
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
        }
        .input-field:focus {
          outline: none;
          border-color: #d97706;
          box-shadow: 0 0 0 2px rgb(245 158 11 / 0.35);
        }
      `}</style>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white/15 rounded-lg p-4">
      <p className="text-amber-50 text-xs sm:text-sm mb-1">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold">{value}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      <span className="block mb-2">{label}</span>
      {children}
    </label>
  );
}

function Header({ children, centered = false }) {
  return (
    <th className={`px-4 py-3 ${centered ? 'text-center' : 'text-left'} text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap`}>
      {children}
    </th>
  );
}

function MovementCheckbox({ checked, disabled = false, label, onChange }) {
  return (
    <label className={`inline-flex items-center justify-center w-7 h-7 rounded border transition-colors ${disabled ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : checked ? 'bg-amber-600 border-amber-600 cursor-pointer' : 'bg-white border-gray-300 hover:border-amber-500 cursor-pointer'}`} title={label}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
        aria-label={label}
      />
      {checked && <Check className="w-4 h-4 text-white" />}
    </label>
  );
}

export default MaterialesRetiro;
