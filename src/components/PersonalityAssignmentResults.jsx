import { AlertCircle, Download, Users, TrendingUp } from 'lucide-react'
import { exportarAsignacionPersonalidadExcel } from '../utils/groupAssignment'

const ORDEN_GRUPOS_ORIGEN = [
  'Ciencia',
  'Consejo',
  'Entendimiento',
  'Fortaleza',
  'Piedad',
  'Sabiduría',
  'Temor de Dios'
]

export default function PersonalityAssignmentResults({ resultado, onNuevaAsignacion }) {
  if (!resultado) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay resultados aún</p>
      </div>
    )
  }

  const { grupos, estadisticas, detalles, advertencias = [] } = resultado

  const calcularResumenGrupo = (integrantes) => {
    const resumen = {}

    ORDEN_GRUPOS_ORIGEN.forEach((grupo) => {
      resumen[grupo] = { mujeres: 0, hombres: 0 }
    })

    integrantes.forEach((est) => {
      const grupoOrigen = est.grupoOriginal || 'Sin grupo'
      if (!resumen[grupoOrigen]) {
        resumen[grupoOrigen] = { mujeres: 0, hombres: 0 }
      }

      const genero = (est.genero || '').toLowerCase().trim()
      if (genero === 'femenino' || genero === 'mujer' || genero === 'f') {
        resumen[grupoOrigen].mujeres += 1
      } else {
        resumen[grupoOrigen].hombres += 1
      }
    })

    return resumen
  }

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        <div className="bg-linear-to-br from-violet-50 to-violet-100 rounded-lg p-6 border border-violet-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-violet-700 font-medium">Genero (H/M)</p>
              <p className="text-2xl font-bold text-violet-900">{detalles.totalHombres}/{detalles.totalMujeres}</p>
            </div>
            <Users className="w-12 h-12 text-violet-400 opacity-50" />
          </div>
        </div>
      </div>

      {advertencias.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-yellow-900 mb-1">Advertencias de restricciones</p>
              <p className="text-sm text-yellow-800">Se detectaron {advertencias.length} advertencias. Revisa los grupos marcados para ajustar manualmente si es necesario.</p>
            </div>
          </div>
        </div>
      )}

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
            const resumenGrupo = calcularResumenGrupo(grupoInfo.integrantes)

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
                  <p className="text-sm font-bold text-gray-800 mb-3">
                    {grupoInfo.total} personas | {grupoInfo.hombres}H - {grupoInfo.mujeres}M
                  </p>

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
                  <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-700">
                    <p>
                      Genero: <span className="font-bold">{grupoInfo.hombres}H / {grupoInfo.mujeres}M</span>
                      {grupoInfo.sinGenero > 0 && <span> / {grupoInfo.sinGenero} sin dato</span>}
                    </p>
                    <p className="mt-1">
                      Max. mismo origen: <span className="font-bold">{Math.max(0, ...Object.values(grupoInfo.origenes || {}))}</span>
                    </p>
                  </div>
                </div>

                {/* Tabla resumen por grupo original */}
                <div className="overflow-x-auto border-b border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-blue-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Grupo Original</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">Mujeres</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">Hombres</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ORDEN_GRUPOS_ORIGEN.map((grupoNombre, gIdx) => {
                        const dato = resumenGrupo[grupoNombre]
                        const total = (dato?.mujeres || 0) + (dato?.hombres || 0)
                        if (total === 0) return null

                        return (
                          <tr key={gIdx} className={gIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 font-medium text-gray-800">{grupoNombre}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">
                                {dato?.mujeres || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                                {dato?.hombres || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                {total}
                              </span>
                            </td>
                          </tr>
                        )
                      })}

                      <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                        <td className="px-4 py-3 text-gray-900">TOTAL</td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-purple-200 text-purple-900 px-2 py-1 rounded text-xs font-bold">
                            {grupoInfo.mujeres}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-blue-200 text-blue-900 px-2 py-1 rounded text-xs font-bold">
                            {grupoInfo.hombres}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-green-200 text-green-900 px-2 py-1 rounded text-xs font-bold">
                            {grupoInfo.total}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
                              <p className="text-xs text-gray-600">Tel: {est.cedula}</p>
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
