import { useState, useMemo } from 'react'
import { ArrowLeft, Calendar as CalendarIcon, Filter, Search, Clock, AlertCircle } from 'lucide-react'
import { eventos, tiposEvento, prioridades, catequesisGrupos } from '../data/cronograma'

function CalendarioModule({ onBack, user }) {
  const [vistaActual, setVistaActual] = useState('lista') // 'lista', 'calendario', 'proximos'
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroPrioridad, setFiltroPrioridad] = useState('todos')
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth())
  const [añoSeleccionado, setAñoSeleccionado] = useState(2026)
  const [busqueda, setBusqueda] = useState('')

  // Función para obtener eventos del mes seleccionado
  const eventosMes = useMemo(() => {
    return eventos.filter(evento => {
      const fechaEvento = new Date(evento.fecha + 'T00:00:00')
      return fechaEvento.getMonth() === mesSeleccionado && 
             fechaEvento.getFullYear() === añoSeleccionado
    })
  }, [mesSeleccionado, añoSeleccionado])

  // Función para obtener próximos eventos (próximos 30 días)
  const proximosEventos = useMemo(() => {
    const hoy = new Date()
    const en30Dias = new Date()
    en30Dias.setDate(hoy.getDate() + 30)
    
    return eventos
      .filter(evento => {
        const fechaEvento = new Date(evento.fecha + 'T00:00:00')
        return fechaEvento >= hoy && fechaEvento <= en30Dias
      })
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .slice(0, 10)
  }, [])

  // Filtrar eventos según criterios
  const eventosFiltrados = useMemo(() => {
    let filtrados = vistaActual === 'proximos' ? proximosEventos : 
                    vistaActual === 'calendario' ? eventosMes : eventos

    if (filtroTipo !== 'todos') {
      filtrados = filtrados.filter(e => e.tipo === filtroTipo)
    }

    if (filtroPrioridad !== 'todos') {
      filtrados = filtrados.filter(e => e.prioridad === filtroPrioridad)
    }

    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase()
      filtrados = filtrados.filter(e => 
        e.titulo.toLowerCase().includes(termino) ||
        e.descripcion.toLowerCase().includes(termino) ||
        e.categoria.toLowerCase().includes(termino)
      )
    }

    return filtrados
  }, [vistaActual, filtroTipo, filtroPrioridad, busqueda, eventos, eventosMes, proximosEventos])

  // Formatear fecha
  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr + 'T00:00:00')
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return fecha.toLocaleDateString('es-ES', opciones)
  }

  // Obtener días del mes para vista calendario
  const getDiasDelMes = () => {
    const primerDia = new Date(añoSeleccionado, mesSeleccionado, 1)
    const ultimoDia = new Date(añoSeleccionado, mesSeleccionado + 1, 0)
    const diasEnMes = ultimoDia.getDate()
    const primerDiaSemana = primerDia.getDay()
    
    const dias = []
    
    // Días vacíos al inicio
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null)
    }
    
    // Días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = `${añoSeleccionado}-${String(mesSeleccionado + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
      const eventosDelDia = eventos.filter(e => e.fecha === fecha)
      dias.push({ dia, fecha, eventos: eventosDelDia })
    }
    
    return dias
  }

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Menú Principal
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                  <CalendarIcon className="w-8 h-8 text-blue-600" />
                  Cronograma de Confirmación 2026
                </h1>
                <p className="text-gray-600 mt-2">
                  Calendario completo de eventos, catequesis y actividades
                </p>
              </div>
              {user && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Usuario: <span className="font-semibold">{user.usuario}</span></p>
                </div>
              )}
            </div>

            {/* Tabs de vistas */}
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setVistaActual('proximos')}
                className={`px-6 py-3 font-semibold transition ${
                  vistaActual === 'proximos'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Próximos Eventos
                </div>
              </button>
              <button
                onClick={() => setVistaActual('calendario')}
                className={`px-6 py-3 font-semibold transition ${
                  vistaActual === 'calendario'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Vista Calendario
                </div>
              </button>
              <button
                onClick={() => setVistaActual('lista')}
                className={`px-6 py-3 font-semibold transition ${
                  vistaActual === 'lista'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Lista Completa
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filtros y Estadísticas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6 sticky top-8">
              {/* Búsqueda */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Buscar Eventos
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtro por tipo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Evento
                </label>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todos">Todos los tipos</option>
                  {Object.entries(tiposEvento).map(([key, value]) => (
                    <option key={key} value={key}>{value.icon} {value.label}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por prioridad */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prioridad
                </label>
                <select
                  value={filtroPrioridad}
                  onChange={(e) => setFiltroPrioridad(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todos">Todas las prioridades</option>
                  {Object.entries(prioridades).map(([key, value]) => (
                    <option key={key} value={key}>{value.icon} {value.label}</option>
                  ))}
                </select>
              </div>

              {/* Selector de mes (solo para vista calendario) */}
              {vistaActual === 'calendario' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mes
                  </label>
                  <select
                    value={mesSeleccionado}
                    onChange={(e) => setMesSeleccionado(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {meses.map((mes, index) => (
                      <option key={index} value={index}>{mes}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Estadísticas */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-3">Estadísticas</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total eventos:</span>
                    <span className="font-semibold">{eventos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Catequesis:</span>
                    <span className="font-semibold">{eventos.filter(e => e.tipo === 'catequesis').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Retiros:</span>
                    <span className="font-semibold text-red-600">{eventos.filter(e => e.tipo === 'retiro').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Filtrados:</span>
                    <span className="font-semibold text-blue-600">{eventosFiltrados.length}</span>
                  </div>
                </div>
              </div>

              {/* Leyenda de Catequesis por Grupo */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-3">Catequesis por Grupo</h3>
                <div className="space-y-1 text-xs max-h-64 overflow-y-auto">
                  {catequesisGrupos.map((cat) => (
                    <div key={cat.numero} className="flex items-start gap-2">
                      <span className="font-semibold text-blue-600 min-w-[25px]">#{cat.numero}:</span>
                      <div>
                        <p className="text-gray-800">{cat.nombre}</p>
                        <p className="text-gray-500 italic">({cat.encargado})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="lg:col-span-3">
            {/* Vista de Próximos Eventos */}
            {vistaActual === 'proximos' && (
              <div className="space-y-4">
                {proximosEventos.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay eventos próximos en los siguientes 30 días</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 mb-4">
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Clock className="w-6 h-6" />
                        Próximos {proximosEventos.length} Eventos (30 días)
                      </h2>
                      <p className="mt-2 opacity-90">Mantente al tanto de las próximas actividades</p>
                    </div>
                    
                    {proximosEventos.map((evento) => {
                      const tipoInfo = tiposEvento[evento.tipo]
                      const prioridadInfo = prioridades[evento.prioridad]
                      const diasRestantes = Math.ceil((new Date(evento.fecha + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24))
                      
                      return (
                        <div key={evento.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${tipoInfo.color}`}>
                                  {tipoInfo.icon} {tipoInfo.label}
                                </span>
                                <div className={`w-3 h-3 rounded-full ${prioridadInfo.color}`} title={prioridadInfo.label}></div>
                                <span className="text-sm font-semibold text-blue-600">
                                  {diasRestantes === 0 ? '¡HOY!' : diasRestantes === 1 ? '¡MAÑANA!' : `En ${diasRestantes} días`}
                                </span>
                              </div>
                              <h3 className="text-xl font-bold text-gray-800 mb-2">{evento.titulo}</h3>
                              <p className="text-gray-600 mb-3">{evento.descripcion}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="w-4 h-4" />
                                  {formatearFecha(evento.fecha)}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 rounded">
                                  {evento.categoria}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            )}

            {/* Vista de Calendario */}
            {vistaActual === 'calendario' && (
              <div className="bg-white rounded-xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {meses[mesSeleccionado]} {añoSeleccionado}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (mesSeleccionado === 0) {
                          setMesSeleccionado(11)
                          setAñoSeleccionado(añoSeleccionado - 1)
                        } else {
                          setMesSeleccionado(mesSeleccionado - 1)
                        }
                      }}
                      className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold transition"
                    >
                      ← Anterior
                    </button>
                    <button
                      onClick={() => {
                        if (mesSeleccionado === 11) {
                          setMesSeleccionado(0)
                          setAñoSeleccionado(añoSeleccionado + 1)
                        } else {
                          setMesSeleccionado(mesSeleccionado + 1)
                        }
                      }}
                      className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold transition"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>

                {/* Calendario */}
                <div className="grid grid-cols-7 gap-2">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
                    <div key={dia} className="text-center font-semibold text-gray-700 py-2">
                      {dia}
                    </div>
                  ))}
                  
                  {getDiasDelMes().map((diaInfo, index) => (
                    <div
                      key={index}
                      className={`min-h-[100px] border rounded-lg p-2 ${
                        diaInfo ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                      }`}
                    >
                      {diaInfo && (
                        <>
                          <div className="font-semibold text-gray-700 mb-1">{diaInfo.dia}</div>
                          <div className="space-y-1">
                            {diaInfo.eventos.map(evento => {
                              const tipoInfo = tiposEvento[evento.tipo]
                              return (
                                <div
                                  key={evento.id}
                                  className={`text-xs p-1 rounded border ${tipoInfo.color} cursor-pointer hover:opacity-80`}
                                  title={`${evento.titulo}\n${evento.descripcion}`}
                                >
                                  <div className="font-semibold truncate">{tipoInfo.icon} {evento.titulo}</div>
                                </div>
                              )
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vista de Lista Completa */}
            {vistaActual === 'lista' && (
              <div className="space-y-4">
                {eventosFiltrados.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No se encontraron eventos con los filtros seleccionados</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-xl p-4 shadow-md">
                      <p className="text-gray-600">
                        Mostrando <span className="font-bold text-blue-600">{eventosFiltrados.length}</span> eventos
                      </p>
                    </div>
                    
                    {eventosFiltrados.map((evento) => {
                      const tipoInfo = tiposEvento[evento.tipo]
                      const prioridadInfo = prioridades[evento.prioridad]
                      
                      return (
                        <div key={evento.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${tipoInfo.color}`}>
                                  {tipoInfo.icon} {tipoInfo.label}
                                </span>
                                <div className={`w-3 h-3 rounded-full ${prioridadInfo.color}`} title={prioridadInfo.label}></div>
                              </div>
                              <h3 className="text-xl font-bold text-gray-800 mb-2">{evento.titulo}</h3>
                              <p className="text-gray-600 mb-3">{evento.descripcion}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="w-4 h-4" />
                                  {formatearFecha(evento.fecha)}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 rounded">
                                  {evento.categoria}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarioModule
