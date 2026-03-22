import { Download, Users, BarChart3, AlertCircle, Save } from 'lucide-react'
import { useState } from 'react'
import { exportarAsignacionAleatoriaExcel } from '../utils/groupAssignment'
import { guardarAsignacion } from '../utils/assignmentsStorage'

export default function RandomAssignmentResults({ resultado, onNuevaAsignacion }) {
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  
  if (!resultado) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay resultados aún</p>
      </div>
    )
  }

  const { grupos, estadisticas, advertencias } = resultado

  // Calcular resumen por grupo original DENTRO de cada grupo nuevo
  const calcularResumenGrupo = (integrantes) => {
    const resumen = {}
    const gruposConocidos = ['Ciencia', 'Consejo', 'Entendimiento', 'Fortaleza', 'Piedad', 'Sabiduría', 'Temor de Dios']
    
    gruposConocidos.forEach(grupo => {
      resumen[grupo] = { mujeres: 0, hombres: 0 }
    })

    integrantes.forEach(est => {
      const grupoOrigen = est.grupoOrigen || 'Sin grupo'
      if (!resumen[grupoOrigen]) {
        resumen[grupoOrigen] = { mujeres: 0, hombres: 0 }
      }

      const genero = est.genero?.toLowerCase()
      if (genero === 'femenino' || genero === 'mujer' || genero === 'f') {
        resumen[grupoOrigen].mujeres++
      } else {
        resumen[grupoOrigen].hombres++
      }
    })

    return resumen
  }

  const handleDescargar = () => {
    try {
      exportarAsignacionAleatoriaExcel(grupos, estadisticas)
    } catch (error) {
      console.error('Error al descargar:', error)
      alert('Error al generar el archivo')
    }
  }

  const handleGuardar = () => {
    setGuardando(true)
    try {
      const nombreDefault = `Asignación ${new Date().toLocaleDateString('es-CR')}`
      const nombre = prompt('¿Cómo deseas nombrar esta asignación?', nombreDefault)
      
      if (nombre) {
        guardarAsignacion(resultado, nombre)
        setGuardado(true)
        
        // Mostrar confirmación por 3 segundos
        setTimeout(() => {
          setGuardado(false)
        }, 3000)
      }
    } catch (error) {
      console.error('Error al guardar:', error)
      alert('Error al guardar la asignación')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Total Estudiantes</p>
              <p className="text-3xl font-bold text-green-900">{estadisticas.totalEstudiantes}</p>
            </div>
            <Users className="w-12 h-12 text-green-400 opacity-50" />
          </div>
        </div>

        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Hombres</p>
              <p className="text-3xl font-bold text-blue-900">{estadisticas.totalHombres}</p>
            </div>
            <Users className="w-12 h-12 text-blue-400 opacity-50" />
          </div>
        </div>

        <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Mujeres</p>
              <p className="text-3xl font-bold text-purple-900">{estadisticas.totalMujeres}</p>
            </div>
            <Users className="w-12 h-12 text-purple-400 opacity-50" />
          </div>
        </div>

        <div className="bg-linear-to-br from-violet-50 to-violet-100 rounded-lg p-6 border border-violet-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-violet-700 font-medium">Desbalance Promedio</p>
              <p className="text-3xl font-bold text-violet-900">{estadisticas.desbalancePromedio.toFixed(1)}</p>
            </div>
            <BarChart3 className="w-12 h-12 text-violet-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Advertencias */}
      {advertencias.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">Advertencias</h3>
              <ul className="space-y-1">
                {advertencias.map((adv, idx) => (
                  <li key={idx} className="text-sm text-yellow-800">{adv.mensaje}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Detalle de grupos */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-violet-600" />
          Resultados por Grupo
        </h2>

        <div className="grid gap-4">
          {grupos.map((grupo, idx) => {
            const resumenGrupo = calcularResumenGrupo(grupo.integrantes)
            return (
              <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Header del grupo */}
                <div className="bg-linear-to-r from-violet-600 to-purple-600 text-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{grupo.nombre}</h3>
                    <div className="text-sm">
                      {grupo.integrantes.length} personas | {grupo.hombres}H - {grupo.mujeres}M
                    </div>
                  </div>
                </div>

                {/* Tabla de resumen por grupo original */}
                <div className="overflow-x-auto">
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
                      {['Ciencia', 'Consejo', 'Entendimiento', 'Fortaleza', 'Piedad', 'Sabiduría', 'Temor de Dios'].map((grupoNombre, gIdx) => {
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
                      {/* Fila de totales */}
                      <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                        <td className="px-4 py-3 text-gray-900">TOTAL</td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-purple-200 text-purple-900 px-2 py-1 rounded text-xs font-bold">
                            {grupo.mujeres}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-blue-200 text-blue-900 px-2 py-1 rounded text-xs font-bold">
                            {grupo.hombres}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-green-200 text-green-900 px-2 py-1 rounded text-xs font-bold">
                            {grupo.integrantes.length}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Tabla de integrantes */}
                <div className="overflow-x-auto border-t">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">#</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Género</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Grupo Origen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupo.integrantes.map((est, estIdx) => (
                        <tr key={estIdx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-600">{estIdx + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{est.nombre}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              est.genero?.toLowerCase() === 'femenino' || 
                              est.genero?.toLowerCase() === 'mujer' || 
                              est.genero?.toLowerCase() === 'f'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {est.genero?.toLowerCase() === 'femenino' || 
                               est.genero?.toLowerCase() === 'mujer' || 
                               est.genero?.toLowerCase() === 'f'
                                ? 'Mujer'
                                : 'Hombre'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{est.grupoOrigen}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col gap-3 pt-6 border-t">
        {guardado && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
            ✓ Asignación guardada correctamente
          </div>
        )}
        
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex-1 py-3 bg-linear-to-r from-emerald-600 to-green-600 text-white rounded-lg font-bold hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {guardando ? 'Guardando...' : 'Guardar Asignación'}
          </button>

          <button
            onClick={handleDescargar}
            className="flex-1 py-3 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-lg font-bold hover:from-violet-700 hover:to-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Descargar Excel
          </button>

          <button
            onClick={onNuevaAsignacion}
            className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 transition-colors"
          >
            Nueva Asignación
          </button>
        </div>
      </div>
    </div>
  )
}
