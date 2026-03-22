import { useState } from 'react'
import { Trash2, Eye, Download, ArrowLeft, Edit2, Check, X } from 'lucide-react'
import { obtenerAsignaciones, borrarAsignacion, actualizarNombreAsignacion } from '../utils/assignmentsStorage'
import { exportarAsignacionAleatoriaExcel } from '../utils/groupAssignment'
import RandomAssignmentResults from './RandomAssignmentResults'

export default function SavedAssignmentsHistory({ onBack }) {
  const [asignaciones, setAsignaciones] = useState(obtenerAsignaciones())
  const [selectedId, setSelectedId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editingNombre, setEditingNombre] = useState('')

  const handleEliminar = (id) => {
    if (confirm('¿Seguro que deseas eliminar esta asignación?')) {
      borrarAsignacion(id)
      setAsignaciones(obtenerAsignaciones())
      if (selectedId === id) {
        setSelectedId(null)
      }
    }
  }

  const handleEditar = (id, nombre) => {
    setEditingId(id)
    setEditingNombre(nombre)
  }

  const handleGuardarNombre = (id) => {
    actualizarNombreAsignacion(id, editingNombre)
    setAsignaciones(obtenerAsignaciones())
    setEditingId(null)
  }

  const handleDescargar = (asignacion) => {
    try {
      exportarAsignacionAleatoriaExcel(asignacion.resultado.grupos, asignacion.resultado.estadisticas)
    } catch (error) {
      console.error('Error al descargar:', error)
      alert('Error al generar el archivo')
    }
  }

  if (selectedId) {
    const asignacion = asignaciones.find(a => a.id === selectedId)
    if (asignacion) {
      return (
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setSelectedId(null)}
            className="mb-4 text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al historial
          </button>
          <RandomAssignmentResults
            resultado={asignacion.resultado}
            onNuevaAsignacion={() => setSelectedId(null)}
          />
        </div>
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Eye className="w-8 h-8 text-violet-600" />
            Asignaciones Guardadas
          </h1>
          <p className="text-gray-600 mt-1">
            {asignaciones.length} asignación{asignaciones.length !== 1 ? 'es' : ''} guardada{asignaciones.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Volver
        </button>
      </div>

      {asignaciones.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg">No hay asignaciones guardadas aún</p>
          <p className="text-gray-400 mt-2">
            Crea una asignación y guárdala para verla aquí
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {asignaciones.map((asignacion) => (
            <div
              key={asignacion.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {editingId === asignacion.id ? (
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={editingNombre}
                          onChange={(e) => setEditingNombre(e.target.value)}
                          className="flex-1 px-3 py-2 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleGuardarNombre(asignacion.id)}
                          className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-800">{asignacion.nombre}</h3>
                        <button
                          onClick={() => handleEditar(asignacion.id, asignacion.nombre)}
                          className="p-1 text-gray-500 hover:text-violet-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(asignacion.fecha).toLocaleDateString('es-CR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold">
                      {asignacion.cantidadGrupos} grupos
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {asignacion.totalEstudiantes} estudiantes
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedId(asignacion.id)}
                    className="flex-1 py-2 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-lg font-semibold hover:from-violet-700 hover:to-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Detalles
                  </button>

                  <button
                    onClick={() => handleDescargar(asignacion)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </button>

                  <button
                    onClick={() => handleEliminar(asignacion.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
