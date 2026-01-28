import { useState } from 'react'
import { Users, ArrowRight, AlertCircle } from 'lucide-react'
import { gruposData } from '../data/grupos'
import PersonalityRankingTool from './PersonalityRankingTool'
import PersonalityAssignmentResults from './PersonalityAssignmentResults'
import { asignarPorPersonalidad, validarRankings } from '../utils/introversionAssignment'

export default function GroupAssignmentPersonalityTool() {
  const [paso, setPaso] = useState(1) // 1: seleccionar grupos, 2: ranking, 3: resultados
  const [gruposSeleccionados, setGruposSeleccionados] = useState([])
  const [cantidadNuevosGrupos, setCantidadNuevosGrupos] = useState(3)
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Transformar gruposData a formato del componente
  const gruposDisponibles = Object.keys(gruposData).map(nombreGrupo => {
    const grupoData = gruposData[nombreGrupo]
    return {
      nombre: grupoData.nombre,
      integrantes: Object.values(grupoData.estudiantes).map(est => ({
        nombre: est.nombre,
        cedula: est.id.toString(),
        genero: est.genero || ''
      }))
    }
  })

  const handleSeleccionarGrupos = (nombresGrupos) => {
    const grupos = gruposDisponibles.filter(g => nombresGrupos.includes(g.nombre))
    setGruposSeleccionados(grupos)
    setError('')
    setPaso(2)
  }

  const handleRankingComplete = (gruposConRanking) => {
    const validacion = validarRankings(gruposConRanking)

    if (!validacion.valido) {
      setError(validacion.errores.join('\n'))
      return
    }

    try {
      setLoading(true)
      
      // Simular procesamiento
      setTimeout(() => {
        const nuevoResultado = asignarPorPersonalidad(gruposConRanking, cantidadNuevosGrupos)
        setResultado(nuevoResultado)
        setPaso(3)
        setLoading(false)
      }, 500)
    } catch (err) {
      setError(err.message || 'Error al procesar la asignación')
      setLoading(false)
    }
  }

  const handleNuevaAsignacion = () => {
    setPaso(1)
    setGruposSeleccionados([])
    setResultado(null)
    setError('')
  }

  // PASO 1: Seleccionar grupos
  if (paso === 1) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-linear-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="bg-amber-600 text-white rounded-full p-3">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-amber-900">
                Asignación de Grupos por Personalidad
              </h2>
              <p className="text-amber-800 mt-2">
                Sistema de redistribución equilibrada basado en perfiles introvertidos y extrovertidos
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900 mb-1">¿Cómo funciona?</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Selecciona los grupos que participarán</li>
                <li>Cada grupo rankea sus integrantes (más introvertido → más extrovertido)</li>
                <li>El sistema asigna nuevos grupos con balance 50/50</li>
                <li>Descarga los resultados en Excel</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">1️⃣ Selecciona los grupos que participarán:</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gruposDisponibles.map((grupo) => (
              <label
                key={grupo.nombre}
                className="flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  value={grupo.nombre}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setGruposSeleccionados([...gruposSeleccionados, grupo])
                    } else {
                      setGruposSeleccionados(gruposSeleccionados.filter(g => g.nombre !== grupo.nombre))
                    }
                  }}
                  className="w-5 h-5 rounded"
                />
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{grupo.nombre}</p>
                  <p className="text-sm text-gray-600">{grupo.integrantes.length} integrantes</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">2️⃣ ¿Cuántos nuevos grupos quieres crear?</h3>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max={Math.min(15, Math.floor((gruposSeleccionados.reduce((sum, g) => sum + g.integrantes.length, 0)) / 2)) || 1}
              value={cantidadNuevosGrupos}
              onChange={(e) => setCantidadNuevosGrupos(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
            <div className="bg-amber-600 text-white rounded-lg px-4 py-2 font-bold min-w-20 text-center">
              {cantidadNuevosGrupos}
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Estudiantes: {gruposSeleccionados.reduce((sum, g) => sum + g.integrantes.length, 0)} |
            Aprox. por grupo: ~{Math.ceil((gruposSeleccionados.reduce((sum, g) => sum + g.integrantes.length, 0)) / cantidadNuevosGrupos)}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        <button
          onClick={() => handleSeleccionarGrupos(gruposSeleccionados.map(g => g.nombre))}
          disabled={gruposSeleccionados.length === 0}
          className="w-full py-4 bg-linear-to-r from-amber-600 to-orange-600 text-white rounded-lg font-bold text-lg hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-lg"
        >
          <span>Continuar</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    )
  }

  // PASO 2: Ranking
  if (paso === 2) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setPaso(1)}
          className="mb-4 text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
        >
          ← Volver atrás
        </button>
        <PersonalityRankingTool
          gruposOriginales={gruposSeleccionados}
          onRankingComplete={handleRankingComplete}
        />
      </div>
    )
  }

  // PASO 3: Resultados
  if (paso === 3) {
    return (
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Procesando asignación...</p>
            </div>
          </div>
        ) : (
          <PersonalityAssignmentResults
            resultado={resultado}
            onNuevaAsignacion={handleNuevaAsignacion}
          />
        )}
      </div>
    )
  }
}
