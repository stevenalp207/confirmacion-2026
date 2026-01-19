import { useState } from 'react'
import { asignarGruposEquilibrados, exportarAsignacion, generarReporte } from '../utils/groupAssignment'

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

  const gruposDisponibles = ['Ciencia', 'Piedad', 'Fortaleza', 'Consejo', 'Entendimiento', 'Sabiduría', 'Temor de Dios', 'Formación']

  const handleProcesarNombres = () => {
    if (!listaNombres.trim()) return
    
    const lineas = listaNombres.split('\n').map(l => l.trim()).filter(l => l)
    const est = []
    
    lineas.forEach(linea => {
      const columnas = linea.split('\t').map(c => c.trim())
      
      if (columnas.length >= 5) {
        // Formato: Nombre | Cédula | Género | Año | Especialidad
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

  const handleDescargarCSV = () => {
    if (!resultado) return
    const csv = exportarAsignacion(resultado)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'asignacion_grupos.csv'
    link.click()
  }

  const handleDescargarReporte = () => {
    if (!resultado) return
    const reporte = generarReporte(resultado)
    const blob = new Blob([reporte], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'reporte_grupos.txt'
    link.click()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Asignación Automática de Grupos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Izquierdo: Entrada de datos */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex gap-2 border-b mb-4">
            <button
              onClick={() => setTipoImportacion('nombres')}
              className={`flex-1 py-2 font-semibold border-b-2 transition ${
                tipoImportacion === 'nombres'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📝 Lista
            </button>
            <button
              onClick={() => setTipoImportacion('manual')}
              className={`flex-1 py-2 font-semibold border-b-2 transition ${
                tipoImportacion === 'manual'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              ➕ Manual
            </button>
          </div>

          {tipoImportacion === 'nombres' ? (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-2 text-sm">Pega datos (Nombre | Cédula | Género | Año | Especialidad):</label>
                <textarea
                  className="w-full h-32 p-3 border rounded-lg text-sm font-mono text-xs"
                  placeholder="Alaina Soto Alfaro	84307847	Femenino	Décimo	Diseño Gráfico&#10;Alejandro de Jesús Vargas Méndez	72429663	Masculino	Undécimo	Desarrollo Web&#10;..."
                  value={listaNombres}
                  onChange={(e) => setListaNombres(e.target.value)}
                />
              </div>
              <button
                onClick={handleProcesarNombres}
                disabled={!listaNombres || loading}
                className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
              >
                📥 Importar Nombres
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-2 text-sm">Nombre:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded text-sm"
                  placeholder="Ej: Juan Pérez"
                  value={nuevoEstudiante.nombre}
                  onChange={(e) => setNuevoEstudiante({ ...nuevoEstudiante, nombre: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleAgregarEstudiante()}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-xs">Género:</label>
                  <select
                    className="w-full p-2 border rounded text-sm"
                    value={nuevoEstudiante.genero}
                    onChange={(e) => setNuevoEstudiante({ ...nuevoEstudiante, genero: e.target.value })}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-xs">Especialidad:</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Ej: Diseño"
                    value={nuevoEstudiante.especialidad}
                    onChange={(e) => setNuevoEstudiante({ ...nuevoEstudiante, especialidad: e.target.value })}
                  />
                </div>
              </div>
              <button
                onClick={handleAgregarEstudiante}
                className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 text-sm"
              >
                ➕ Agregar
              </button>
            </div>
          )}

          {estudiantes.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-3">
              <h3 className="font-semibold mb-2 text-sm">📊 Estudiantes: {estudiantes.length}</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
                {estudiantes.map((est, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-1 rounded">
                    <span>{est.nombre}</span>
                    <button
                      onClick={() => handleEliminarEstudiante(idx)}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAsignar}
            disabled={estudiantes.length === 0 || loading}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? '⏳ Asignando...' : '✨ Asignar Grupos'}
          </button>
        </div>

        {/* Panel Centro: Restricciones */}
        <div className="lg:col-span-1 space-y-4">
          <div>
            <h3 className="font-semibold mb-2 text-red-800">⚠️ Problemáticos:</h3>
            <div className="flex gap-2 mb-2">
              <select
                className="flex-1 p-2 border rounded text-sm"
                value={nuevoProblematico}
                onChange={(e) => setNuevoProblematico(e.target.value)}
              >
                <option value="">Seleccionar estudiante...</option>
                {estudiantes.map((est, idx) => (
                  <option key={idx} value={est.nombre}>
                    {est.nombre}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAgregarProblematico}
                disabled={!nuevoProblematico}
                className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {restricciones.problematicos.map((nombre, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-red-100 px-2 py-1 rounded-full text-sm">
                  <span>{nombre}</span>
                  <button onClick={() => handleEliminarProblematico(idx)} className="text-red-600 font-bold">✕</button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-amber-800">👥 Grupos Amigos / Parejas:</h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Nombres separados por coma"
                className="flex-1 p-2 border rounded text-sm"
                value={nuevoGrupoAmigos}
                onChange={(e) => setNuevoGrupoAmigos(e.target.value)}
              />
              <button
                onClick={handleAgregarGrupoAmigos}
                className="px-3 py-2 bg-amber-600 text-white rounded text-sm hover:bg-amber-700"
              >
                +
              </button>
            </div>
            <div className="space-y-1">
              {restricciones.gruposAmigos.map((grupo, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-amber-100 p-1 rounded text-sm">
                  <span className="flex-1">{grupo.join(', ')}</span>
                  <button onClick={() => handleEliminarGrupoAmigos(idx)} className="text-amber-600 font-bold">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel Derecho: Resultados */}
        <div className="lg:col-span-1">
          {resultado && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={handleDescargarCSV}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
                >
                  📥 CSV
                </button>
                <button
                  onClick={handleDescargarReporte}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-semibold"
                >
                  📄 Reporte
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="text-lg font-bold">{resultado.estadisticas.totalEstudiantes}</div>
                  <div className="text-xs">Total</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="text-lg font-bold">{resultado.estadisticas.totalHombres}</div>
                  <div className="text-xs">♂️</div>
                </div>
                <div className="bg-pink-50 p-2 rounded">
                  <div className="text-lg font-bold">{resultado.estadisticas.totalMujeres}</div>
                  <div className="text-xs">♀️</div>
                </div>
              </div>

              {resultado.advertencias.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                  <h4 className="font-semibold text-yellow-800 text-sm mb-1">⚠️ Advertencias:</h4>
                  <div className="space-y-1 text-xs text-yellow-700">
                    {resultado.advertencias.map((adv, i) => (
                      <div key={i}>• {adv.mensaje}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Resultados: Grupos */}
      {resultado && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">📊 Grupos Asignados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {resultado.grupos.map((grupo, idx) => (
              <div key={idx} className="border rounded-lg p-3 bg-white shadow">
                <h3 className="font-bold mb-1 text-sm">{grupo.nombre}</h3>
                <div className="text-xs text-gray-600 mb-2">
                  {grupo.integrantes.length} | ♂️{grupo.hombres} ♀️{grupo.mujeres}
                </div>
                
                {Object.keys(grupo.especialidades).length > 0 && (
                  <div className="text-xs bg-gray-50 p-1 rounded mb-2">
                    {Object.entries(grupo.especialidades).map(([esp, count]) => (
                      <div key={esp} className="text-gray-700">{esp.substring(0, 15)}: {count}</div>
                    ))}
                  </div>
                )}

                <div className="space-y-0.5 text-xs">
                  {grupo.integrantes.map((est, i) => {
                    let bgColor = 'bg-white'
                    let textColor = 'text-gray-900'
                    
                    if (restricciones.problematicos.includes(est.nombre)) {
                      bgColor = 'bg-red-100'
                      textColor = 'text-red-900'
                    } else if (restricciones.gruposAmigos.some(g => g.includes(est.nombre))) {
                      bgColor = 'bg-cyan-100'
                      textColor = 'text-cyan-900'
                    }
                    
                    return (
                      <div key={i} className={`py-0.5 px-1 border-b last:border-b-0 ${bgColor} ${textColor}`}>
                        {est.nombre} - {est.especialidad} - {est.ano} - {est.cedula}
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
