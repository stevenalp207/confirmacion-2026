/* 
  EJEMPLO DE INTEGRACIÓN COMPLETA DE MEJORAS UX/UI
  Este archivo muestra cómo integrar todos los componentes y mejoras
  en un módulo existente (ej: PagosModule, IngresosModule, etc.)
*/

import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Edit2 } from 'lucide-react';

// Componentes nuevos
import { useToast } from '../hooks/useToast';
import { FormInput, FormButton } from '../components/FormElements';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Modal } from '../components/Modal';
import { DeleteConfirmDialog } from '../components/ConfirmDialog';
import { EmptyDataState, DataTable, StatCard } from '../components/DataDisplay';
import { LoadingSpinner } from '../components/LoadingStates';
import { validateForm, validationRules } from '../utils/validation';

// Hook para manejar estado del formulario
function useFormState(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      // Validar en tiempo real si el campo fue tocado
      validateField(field, value);
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, values[field]);
  };

  const validateField = (field, value) => {
    // Validar según reglas del campo
    const fieldRules = {
      amount: [
        (val) => validationRules.required(val, 'Monto'),
        (val) => validationRules.positiveNumber(val)
      ],
      description: [
        (val) => validationRules.required(val, 'Descripción')
      ]
    };

    if (fieldRules[field]) {
      for (const rule of fieldRules[field]) {
        const error = rule(value);
        if (error) {
          setErrors(prev => ({ ...prev, [field]: error }));
          return;
        }
      }
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    reset,
    setValues
  };
}

// Componente Ejemplo: Módulo de Ingresos Mejorado
function ExampleModuleImproved() {
  // Hooks
  const toast = useToast();
  const form = useFormState({ amount: '', description: '', method: 'sinpe' });

  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Cargar datos
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData([
        { id: 1, amount: 50000, description: 'Pago estudiante 1', method: 'sinpe', date: '2024-01-15' },
        { id: 2, amount: 100000, description: 'Pago estudiante 2', method: 'efectivo', date: '2024-01-16' }
      ]);
      toast.success('Datos cargados correctamente');
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Guardar
  const handleSave = async () => {
    const errors = validateForm(form.values, {
      amount: [
        (val) => validationRules.required(val, 'Monto'),
        (val) => validationRules.positiveNumber(val)
      ],
      description: [
        (val) => validationRules.required(val, 'Descripción')
      ]
    });

    if (Object.keys(errors).length > 0) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('✅ Ingreso guardado exitosamente');
      setIsModalOpen(false);
      form.reset();
      loadData();
    } catch (error) {
      toast.error('❌ Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar
  const handleDelete = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setData(prev => prev.filter(item => item.id !== deleteTarget.id));
      toast.success('Ingreso eliminado');
      setDeleteTarget(null);
    } catch (error) {
      toast.error('Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para crear nuevo
  const handleNew = () => {
    form.reset();
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  // Editar
  const handleEdit = (item) => {
    setSelectedItem(item);
    form.setValues({
      amount: item.amount.toString(),
      description: item.description,
      method: item.method
    });
    setIsModalOpen(true);
  };

  // Columnas de tabla
  const columns = [
    { key: 'date', label: 'Fecha' },
    { key: 'amount', label: 'Monto', render: (val) => `₡${val.toLocaleString()}` },
    { key: 'method', label: 'Método' },
    { key: 'description', label: 'Descripción' },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-2 text-red-600 hover:bg-red-100 rounded transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <ErrorBoundary>
      <div className="space-y-6 p-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Ingresos Financieros</h1>
          <FormButton
            onClick={handleNew}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Ingreso
          </FormButton>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Total Ingresos"
            value={`₡${data.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}`}
            color="green"
          />
          <StatCard
            label="Registros"
            value={data.length}
            color="blue"
          />
          <StatCard
            label="Promedio"
            value={`₡${data.length > 0 ? (data.reduce((sum, item) => sum + item.amount, 0) / data.length).toLocaleString() : 0}`}
            color="blue"
          />
        </div>

        {/* Tabla de datos */}
        {loading ? (
          <LoadingSpinner />
        ) : data.length === 0 ? (
          <EmptyDataState
            icon={Plus}
            title="Sin ingresos registrados"
            subtitle="Comienza a agregar ingresos para llevar el control financiero"
            actionText="Crear Ingreso"
            onAction={handleNew}
            actionVariant="primary"
          />
        ) : (
          <DataTable
            columns={columns}
            rows={data}
            emptyMessage="No hay datos"
          />
        )}

        {/* Modal para crear/editar */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedItem ? 'Editar Ingreso' : 'Nuevo Ingreso'}
          size="lg"
          footer={
            <>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <FormButton
                onClick={handleSave}
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </FormButton>
            </>
          }
        >
          <div className="space-y-4">
            <FormInput
              label="Monto"
              type="number"
              placeholder="0.00"
              value={form.values.amount}
              onChange={(e) => form.handleChange('amount', e.target.value)}
              onBlur={() => form.handleBlur('amount')}
              error={form.errors.amount && form.touched.amount}
              errorMessage={form.errors.amount}
            />

            <FormInput
              label="Descripción"
              type="text"
              placeholder="Describe el ingreso"
              value={form.values.description}
              onChange={(e) => form.handleChange('description', e.target.value)}
              onBlur={() => form.handleBlur('description')}
              error={form.errors.description && form.touched.description}
              errorMessage={form.errors.description}
            />

            <div>
              <label className="block text-sm font-semibold mb-2">Método</label>
              <select
                value={form.values.method}
                onChange={(e) => form.handleChange('method', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sinpe">SINPE</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
          </div>
        </Modal>

        {/* Diálogo de confirmación de eliminación */}
        {deleteTarget && (
          <DeleteConfirmDialog
            isOpen={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            itemName={`Ingreso de ₡${deleteTarget.amount}`}
            loading={loading}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default ExampleModuleImproved;

/*
  PUNTOS CLAVE DE INTEGRACIÓN:

  1. Hooks Personalizados:
     - useToast() para notificaciones
     - useFormState() para manejo de formularios

  2. Componentes de Validación:
     - FormInput con validación en tiempo real
     - ErrorBoundary para errores generales

  3. Componentes de UI:
     - Modal para crear/editar
     - DataTable para mostrar datos
     - EmptyDataState cuando no hay datos
     - StatCard para estadísticas

  4. Confirmaciones:
     - DeleteConfirmDialog antes de eliminar

  5. Notificaciones:
     - toast.success() para operaciones exitosas
     - toast.error() para errores

  6. Loading States:
     - LoadingSpinner mientras carga
     - Estados deshabilitados en botones

  PASOS PARA IMPLEMENTAR EN OTROS MÓDULOS:

  1. Reemplaza useState por useFormState
  2. Añade useToast en la parte superior
  3. Envuelve en <ErrorBoundary>
  4. Reemplaza inputs con <FormInput>
  5. Usa <Modal> en lugar de divs simples
  6. Añade <DeleteConfirmDialog> para eliminaciones
  7. Usa <DataTable> para mostrar listas
  8. Añade llamadas a toast para feedback
*/
