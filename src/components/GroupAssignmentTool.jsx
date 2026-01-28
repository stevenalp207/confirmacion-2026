import { useState } from 'react'
import { asignarGruposEquilibrados, exportarAsignacionExcel } from '../utils/groupAssignment'
import { Trash2, Plus, Download, FileText, Users, AlertCircle, CheckCircle } from 'lucide-react'

export default function GroupAssignmentTool() {
  const [tipoImportacion, setTipoImportacion] = useState('nombres')
  const [listaNombres, setListaNombres] = useState('')
  const [estudiantes, setEstudiantes] = useState([])
  const [nuevoEstudiante, setNuevoEstudiante] = useState({ nombre: '', cedula: '', genero: '', ano: '', especialidad: '' })
  const [restricciones, setRestricciones] = useState({
    problematicos: [],
    gruposAmigos: []
  })
  const [nuevoProblematico, setNuevoProblematico] = useState('')
  const [nuevoGrupoAmigos, setNuevoGrupoAmigos] = useState('')
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)

  const gruposDisponibles = ['Ciencia', 'Piedad', 'Fortaleza', 'Consejo', 'Entendimiento', 'Sabiduría', 'Temor de Dios']

  const handleProcesarNombres = () => {
    if (!listaNombres.trim()) return
    
    const lineas = listaNombres.split('\n').map(l => l.trim()).filter(l => l)
    const est = []
    
    lineas.forEach(linea => {
      const columnas = linea.split('\t').map(c => c.trim())
      
      if (columnas.length >= 5) {
        // Formato: Nombre | Tel | Género | Año | Especialidad
        const nombre = columnas[0]
        const cedula = columnas[1]
        const genero = columnas[2]
        const ano = columnas[3]
        const especialidad = columnas[4]
        
        if (nombre && genero && especialidad) {
          est.push({ nombre, cedula, genero, ano, especialidad })
        }
      } else if (columnas.length === 1) {
        // Si es una línea simple sin tabs, la trata como solo nombre
        est.push({ nombre: columnas[0], cedula: '', genero: '', ano: '', especialidad: '' })
      }
    })
    
    setEstudiantes(est)
    setListaNombres('')
    alert(`✅ ${est.length} estudiantes importados correctamente`)
  }

  const handleAgregarEstudiante = () => {
    if (!nuevoEstudiante.nombre.trim()) return
    setEstudiantes([...estudiantes, { ...nuevoEstudiante }])
    setNuevoEstudiante({ nombre: '', cedula: '', genero: '', ano: '', especialidad: '' })
  }

  const handleEliminarEstudiante = (index) => {
    setEstudiantes(estudiantes.filter((_, i) => i !== index))
  }

  const handleAgregarProblematico = () => {
    if (nuevoProblematico.trim()) {
      setRestricciones({
        ...restricciones,
        problematicos: [...restricciones.problematicos, nuevoProblematico.trim()]
      })
      setNuevoProblematico('')
    }
  }

  const handleAgregarGrupoAmigos = () => {
    const nombres = nuevoGrupoAmigos.split(',').map(n => n.trim()).filter(n => n)
    if (nombres.length >= 2) {
      setRestricciones({
        ...restricciones,
        gruposAmigos: [...restricciones.gruposAmigos, nombres]
      })
      setNuevoGrupoAmigos('')
    }
  }

  const handleEliminarProblematico = (index) => {
    setRestricciones({
      ...restricciones,
      problematicos: restricciones.problematicos.filter((_, i) => i !== index)
    })
  }

  const handleEliminarGrupoAmigos = (index) => {
    setRestricciones({
      ...restricciones,
      gruposAmigos: restricciones.gruposAmigos.filter((_, i) => i !== index)
    })
  }

  const handleAsignar = () => {
    try {
      if (estudiantes.length === 0) {
        alert('Agrega al menos un estudiante')
        return
      }
      setLoading(true)
      const res = asignarGruposEquilibrados(estudiantes, gruposDisponibles, restricciones)
      setResultado(res)
      if (res.advertencias.length > 0) {
        alert(`⚠️ Se encontraron ${res.advertencias.length} advertencia(s)`)
      }
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDescargarExcel = () => {
    if (!resultado) return
    const xls = exportarAsignacionExcel(resultado)
    const blob = new Blob([xls], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'asignacion_grupos.xls'
    link.click()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Tabs de Importación */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Panel 1: Importación de Estudiantes */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Estudiantes
          </h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b">
            <button
              onClick={() => setTipoImportacion('nombres')}
              className={`flex-1 py-2 px-3 text-sm font-semibold border-b-2 transition ${
                tipoImportacion === 'nombres'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              📋 Pegar
            </button>
            <button
              onClick={() => setTipoImportacion('manual')}
              className={`flex-1 py-2 px-3 text-sm font-semibold border-b-2 transition ${
                tipoImportacion === 'manual'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              ➕ Agregar
            </button>
          </div>

          {tipoImportacion === 'nombres' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Datos TSV (Nombre | Tel | Género | Año | Especialidad)
                </label>
                <textarea
                  className="w-full h-32 p-3 border rounded-lg text-xs font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Alaina Soto Alfaro	84307847	Femenino	Décimo	Diseño Gráfico&#10;Alejandro Vargas	72429663	Masculino	Undécimo	Desarrollo Web"
                  value={listaNombres}
                  onChange={(e) => setListaNombres(e.target.value)}
                />
              </div>
              <button
                onClick={handleProcesarNombres}
                disabled={!listaNombres || loading}
                className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition text-sm"
              >
                📥 Importar
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre"
                value={nuevoEstudiante.nombre}
                onChange={(e) => setNuevoEstudiante({ ...nuevoEstudiante, nombre: e.target.value })}
              />
              <input
                type="text"
                className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tel"
                value={nuevoEstudiante.cedula}
                onChange={(e) => setNuevoEstudiante({ ...nuevoEstudiante, cedula: e.target.value })}
              />
              <select
                className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={nuevoEstudiante.genero}
                onChange={(e) => setNuevoEstudiante({ ...nuevoEstudiante, genero: e.target.value })}
              >
                <option value="">Género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
              <input
                type="text"
                className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Año (Ej: Décimo)"
                value={nuevoEstudiante.ano}
                onChange={(e) => setNuevoEstudiante({ ...nuevoEstudiante, ano: e.target.value })}
              />
              <input
                type="text"
                className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Especialidad"
                value={nuevoEstudiante.especialidad}
                onChange={(e) => setNuevoEstudiante({ ...nuevoEstudiante, especialidad: e.target.value })}
              />
              <button
                onClick={handleAgregarEstudiante}
                className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition text-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>
          )}

          {/* Lista de Estudiantes */}
          {estudiantes.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 text-sm">Importados</h3>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                  {estudiantes.length}
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {estudiantes.map((est, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs hover:bg-gray-100 transition">
                    <span className="truncate">{est.nombre}</span>
                    <button
                      onClick={() => handleEliminarEstudiante(idx)}
                      className="text-red-600 hover:text-red-800 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Panel 2: Restricciones */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Restricciones
          </h2>

          {/* Problemáticos */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-700 mb-2 text-red-800">
              🔴 Problemáticos (no pueden estar juntos)
            </label>
            <div className="flex gap-2 mb-2">
              <select
                className="flex-1 p-2 border rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={nuevoProblematico}
                onChange={(e) => setNuevoProblematico(e.target.value)}
              >
                <option value="">Seleccionar...</option>
                {estudiantes.map((est, idx) => (
                  <option key={idx} value={est.nombre}>
                    {est.nombre}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAgregarProblematico}
                disabled={!nuevoProblematico}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {restricciones.problematicos.map((nombre, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-red-100 text-red-900 px-2 py-1 rounded-full text-xs"
                >
                  <span>{nombre.substring(0, 15)}</span>
                  <button
                    onClick={() => handleEliminarProblematico(idx)}
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Grupos Amigos */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 text-cyan-800">
              🔵 Grupos Amigos (separarlos)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Nombres separados por coma"
                className="flex-1 p-2 border rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                value={nuevoGrupoAmigos}
                onChange={(e) => setNuevoGrupoAmigos(e.target.value)}
              />
              <button
                onClick={handleAgregarGrupoAmigos}
                className="px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {restricciones.gruposAmigos.map((grupo, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-cyan-100 text-cyan-900 p-2 rounded text-xs hover:bg-cyan-200 transition"
                >
                  <span className="truncate">{grupo.join(', ')}</span>
                  <button
                    onClick={() => handleEliminarGrupoAmigos(idx)}
                    className="text-cyan-600 hover:text-cyan-800 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 3: Acción y Resultados */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Asignación
          </h2>

          {/* Resumen */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-blue-50 p-3 rounded text-center border-l-4 border-blue-600">
              <div className="text-lg font-bold text-blue-600">{estudiantes.length}</div>
              <div className="text-xs text-gray-600">Estudiantes</div>
            </div>
            <div className="bg-red-50 p-3 rounded text-center border-l-4 border-red-600">
              <div className="text-lg font-bold text-red-600">{restricciones.problematicos.length}</div>
              <div className="text-xs text-gray-600">Problemáticos</div>
            </div>
            <div className="bg-cyan-50 p-3 rounded text-center border-l-4 border-cyan-600">
              <div className="text-lg font-bold text-cyan-600">{restricciones.gruposAmigos.length}</div>
              <div className="text-xs text-gray-600">Grupos</div>
            </div>
          </div>

          <button
            onClick={handleAsignar}
            disabled={estudiantes.length === 0 || loading}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 disabled:bg-gray-400 transition mb-4 text-sm shadow-md hover:shadow-lg"
          >
            {loading ? '⏳ Procesando...' : '✨ Asignar Grupos'}
          </button>

          {resultado && (
            <>
              <div className="bg-green-50 border-l-4 border-green-500 p-3 mb-4 rounded text-sm">
                <p className="text-green-800 font-semibold">✓ Asignación completada</p>
                <p className="text-green-700 text-xs mt-1">{resultado.grupos.length} grupos creados</p>
              </div>

              <button
                onClick={handleDescargarExcel}
                className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-semibold shadow-md mb-4"
              >
                <Download className="w-4 h-4" /> Excel
              </button>

              {resultado.advertencias.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded p-3">
                  <p className="text-yellow-800 font-semibold text-xs mb-2">⚠️ Advertencias</p>
                  <div className="space-y-1 text-xs text-yellow-700">
                    {resultado.advertencias.slice(0, 3).map((adv, i) => (
                      <div key={i}>• {adv.mensaje}</div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Resultados: Grupos */}
      {resultado && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Grupos Asignados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {resultado.grupos.map((grupo, idx) => (
              <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 bg-white hover:shadow-lg transition hover:border-blue-400">
                <h3 className="font-bold text-lg mb-2 text-gray-800 border-b pb-2 text-blue-600">{grupo.nombre}</h3>
                <div className="text-xs text-gray-600 mb-3 space-y-1">
                  <div>👥 <span className="font-semibold">{grupo.integrantes.length}</span> personas</div>
                  <div>♂️ <span className="font-semibold">{grupo.hombres}</span> | ♀️ <span className="font-semibold">{grupo.mujeres}</span></div>
                </div>

                {Object.keys(grupo.especialidades).length > 0 && (
                  <div className="text-xs bg-gray-50 p-2 rounded mb-3">
                    {Object.entries(grupo.especialidades).map(([esp, count]) => (
                      <div key={esp} className="text-gray-700">
                        {esp.substring(0, 12)}: <span className="font-bold text-blue-600">{count}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-1 border-t pt-2">
                  {grupo.integrantes.map((est, i) => {
                    let bgColor = 'bg-white'
                    let textColor = 'text-gray-900'
                    let borderColor = 'border-gray-200'

                    if (restricciones.problematicos.includes(est.nombre)) {
                      bgColor = 'bg-red-100'
                      textColor = 'text-red-900'
                      borderColor = 'border-red-300'
                    } else if (restricciones.gruposAmigos.some(g => g.includes(est.nombre))) {
                      bgColor = 'bg-cyan-100'
                      textColor = 'text-cyan-900'
                      borderColor = 'border-cyan-300'
                    }

                    return (
                      <div key={i} className={`py-1.5 px-2 rounded text-xs ${bgColor} ${textColor} border ${borderColor}`}>
                        <div className="font-semibold">{est.nombre}</div>
                        <div className="text-xs opacity-75 mt-0.5">{est.especialidad} • {est.ano} • {est.cedula}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
