import React from 'react'
import { Download, Users, TrendingUp } from 'lucide-react'
import { exportarAsignacionPersonalidadExcel } from '../utils/groupAssignment'

export default function PersonalityAssignmentResults({ resultado, onNuevaAsignacion }) {
  if (!resultado) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay resultados aún</p>
      </div>
    )
  }

  const { grupos, estadisticas, detalles } = resultado

  const handleDescargar = () => {
    try {
      exportarAsignacionPersonalidadExcel(grupos, estadisticas)
    } catch (error) {
      console.error('Error al descargar:', error)
      alert('Error al generar el archivo')
    }
  }

  return (
    <div className="space-y-6">
      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Introvertidos</p>
              <p className="text-3xl font-bold text-blue-900">{detalles.totalIntrovertidos}</p>
            </div>
            <Users className="w-12 h-12 text-blue-400 opacity-50" />
          </div>
        </div>

        <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 font-medium">Extrovertidos</p>
              <p className="text-3xl font-bold text-orange-900">{detalles.totalExtrovertidos}</p>
            </div>
            <Users className="w-12 h-12 text-orange-400 opacity-50" />
          </div>
        </div>

        <div className="bg-linear-to-br from-amber-50 to-amber-100 rounded-lg p-6 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700 font-medium">Total Estudiantes</p>
              <p className="text-3xl font-bold text-amber-900">{estadisticas.totalEstudiantes}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-amber-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Detalles por grupo */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-600" />
          Nuevos Grupos Asignados
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {estadisticas.porGrupo.map((grupoInfo, idx) => {
            const balanceExcelente = grupoInfo.balance <= 1
            const balanceBueno = grupoInfo.balance <= 2

            return (
              <div key={idx} className="rounded-lg border-2 border-gray-200 overflow-hidden">
                {/* Encabezado del grupo */}
                <div className="bg-linear-to-r from-amber-600 to-amber-700 text-white p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold">{grupoInfo.nombre}</h3>
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-bold text-amber-900">
                      {grupoInfo.total} integrantes
                    </span>
                  </div>

                  {/* Indicador de balance */}
                  <div className="flex items-center gap-2 text-sm">
                    {balanceExcelente ? (
                      <span className="bg-green-400 text-white px-2 py-1 rounded text-xs font-bold">
                        ✓ Balance Perfecto
                      </span>
                    ) : balanceBueno ? (
                      <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-bold">
                        ⚠ Balance Bueno
                      </span>
                    ) : (
                      <span className="bg-orange-400 text-white px-2 py-1 rounded text-xs font-bold">
                        Balance: {grupoInfo.balance}
                      </span>
                    )}
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 font-medium">INTROVERTIDOS</p>
                      <p className="text-2xl font-bold text-blue-700">{grupoInfo.introvertidos}</p>
                      <p className="text-xs text-gray-500">{grupoInfo.porcentajeIntro}% del grupo</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">EXTROVERTIDOS</p>
                      <p className="text-2xl font-bold text-orange-700">{grupoInfo.extrovertidos}</p>
                      <p className="text-xs text-gray-500">
                        {(100 - parseFloat(grupoInfo.porcentajeIntro)).toFixed(1)}% del grupo
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lista de integrantes */}
                <div className="p-4">
                  <h4 className="font-bold text-gray-800 mb-3 text-sm">Integrantes:</h4>
                  <div className="space-y-2">
                    {grupoInfo.integrantes.map((est, estIdx) => (
                      <div
                        key={estIdx}
                        className={`p-2 rounded border-l-4 text-sm ${
                          est.tipo === 'Introvertido'
                            ? 'bg-blue-50 border-l-blue-500'
                            : 'bg-orange-50 border-l-orange-500'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800">{est.nombre}</p>
                            {est.cedula && (
                              <p className="text-xs text-gray-600">Cédula: {est.cedula}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              De: {est.grupoOriginal} (Puesto {est.posicion})
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ml-2 ${
                              est.tipo === 'Introvertido'
                                ? 'bg-blue-200 text-blue-800'
                                : 'bg-orange-200 text-orange-800'
                            }`}
                          >
                            {est.tipo === 'Introvertido' ? 'Intro' : 'Extro'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-3 sticky bottom-0 bg-white p-4 border-t border-gray-200 rounded-lg">
        <button
          onClick={handleDescargar}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Descargar Excel
        </button>
        <button
          onClick={onNuevaAsignacion}
          className="flex-1 py-3 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700 transition-colors"
        >
          Nueva Asignación
        </button>
      </div>
    </div>
  )
}
