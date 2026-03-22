import { useState } from 'react'
import { Users, ArrowRight, AlertCircle, BarChart3, CheckCircle2, TrendingUp, History } from 'lucide-react'
import { gruposData } from '../data/grupos'
import { asignarGruposAleatorios } from '../utils/groupAssignment'
import RandomAssignmentResults from './RandomAssignmentResults'
import SavedAssignmentsHistory from './SavedAssignmentsHistory'

export default function RandomAssignmentTool() {
  const [paso, setPaso] = useState(0) // 0: menu, 1: seleccionar grupos, 2: resultado
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
        genero: est.genero || '',
        grupoOrigen: grupoData.nombre
      }))
    }
  })

  const handleSeleccionarGrupos = (nombresGrupos) => {
    const grupos = gruposDisponibles.filter(g => nombresGrupos.includes(g.nombre))
    setGruposSeleccionados(grupos)
    setError('')
    procesarAsignacion(grupos)
  }

  const procesarAsignacion = (grupos) => {
    try {
      setLoading(true)
      
      // Preparar lista de estudiantes con grupoOrigen
      const todosEstudiantes = grupos.flatMap(grupo => 
        grupo.integrantes.map(est => ({
          ...est,
          grupoOrigen: grupo.nombre
        }))
      )
      
      // Simular procesamiento
      setTimeout(() => {
        const nuevoResultado = asignarGruposAleatorios(todosEstudiantes, cantidadNuevosGrupos)
        setResultado(nuevoResultado)
        setPaso(2)
        setLoading(false)
      }, 500)
    } catch (err) {
      setError(err.message || 'Error al procesar la asignación aleatoria')
      setLoading(false)
    }
  }

  const handleNuevaAsignacion = () => {
    setPaso(1)
    setGruposSeleccionados([])
    setResultado(null)
    setError('')
  }

  // PASO 0: Menú
  if (paso === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-linear-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-violet-900 mb-2">
            Asignación Aleatoria
          </h2>
          <p className="text-violet-700">¿Qué deseas hacer?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Opción: Nueva Asignación */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-violet-600 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-violet-100 p-4 rounded-full">
                <Users className="w-8 h-8 text-violet-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Nueva Asignación
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Crea una nueva asignación aleatoria de subgrupos
            </p>
            <button
              onClick={handleNuevaAsignacion}
              className="w-full py-3 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-lg font-bold hover:from-violet-700 hover:to-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              Comenzar
            </button>
          </div>

          {/* Opción: Ver Historial */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-emerald-600 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-emerald-100 p-4 rounded-full">
                <History className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Ver Historial
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Consulta las asignaciones que has guardado
            </p>
            <button
              onClick={() => setPaso(3)}
              className="w-full py-3 bg-linear-to-r from-emerald-600 to-green-600 text-white rounded-lg font-bold hover:from-emerald-700 hover:to-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <History className="w-5 h-5" />
              Ver Historial
            </button>
          </div>
        </div>
      </div>
    )
  }

  // PASO 3: Historial de asignaciones guardadas
  if (paso === 3) {
    return (
      <SavedAssignmentsHistory
        onBack={() => setPaso(0)}
      />
    )
  }

  // PASO 1: Seleccionar grupos
  if (paso === 1) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => setPaso(0)}
          className="mb-4 text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1"
        >
          ← Volver al menú
        </button>
        
        <div className="bg-linear-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="bg-violet-600 text-white rounded-full p-3">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-violet-900">
                Asignación Aleatoria de Grupos
              </h2>
              <p className="text-violet-800 mt-2">
                Distribución equilibrada de géneros y grupos de origen de forma aleatoria
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-green-900 mb-1">¿Cómo funciona?</h3>
              <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                <li>Selecciona los grupos que participarán</li>
                <li>El sistema distribuye aleatoriamente manteniendo balance</li>
                <li>Se equilibra automáticamente por género</li>
                <li>Se distribuyen evitando concentración de grupos de origen</li>
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
            <div className="bg-violet-600 text-white rounded-lg px-4 py-2 font-bold min-w-20 text-center">
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
          className="w-full py-4 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-lg"
        >
          <span>Generar Asignación Aleatoria</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    )
  }

  // PASO 2: Resultados
  if (paso === 2) {
    return (
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Procesando asignación aleatoria...</p>
            </div>
          </div>
        ) : resultado ? (
          <>
            {/* Estadísticas rápidas */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-gray-800">Total Estudiantes</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">{resultado.estadisticas.totalEstudiantes}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-800">Balance Promedio</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {resultado.estadisticas.desbalancePromedio.toFixed(1)}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-gray-800">Tamaño Promedio</h3>
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  {resultado.estadisticas.tamañoPromedio}
                </p>
              </div>
            </div>

            <RandomAssignmentResults
              resultado={resultado}
              onNuevaAsignacion={handleNuevaAsignacion}
            />
          </>
        ) : null}
      </div>
    )
  }
}
