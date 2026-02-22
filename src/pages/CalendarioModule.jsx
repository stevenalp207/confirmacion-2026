import { useState, useMemo } from 'react'
import { ArrowLeft, Calendar as CalendarIcon, Filter, Search, Clock, AlertCircle, ExternalLink, Download } from 'lucide-react'
import { eventos, tiposEvento, prioridades, catequesisGrupos } from '../data/cronograma'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function CalendarioModule({ onBack, user }) {
  const [vistaActual, setVistaActual] = useState('lista') // 'lista', 'calendario', 'proximos'
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroPrioridad, setFiltroPrioridad] = useState('todos')
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth())
  const [añoSeleccionado, setAñoSeleccionado] = useState(2026)
  const [busqueda, setBusqueda] = useState('')
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalGrupoAbierto, setModalGrupoAbierto] = useState(false)
  const [grupoSeleccionadoPDF, setGrupoSeleccionadoPDF] = useState('')

  // Lista de grupos únicos para el PDF
  const gruposUnicos = useMemo(() => {
    const grupos = [...new Set(catequesisGrupos.map(c => c.encargado))]
    return grupos.filter(g => g !== 'Retiro')
  }, [])

  // Verificar si usuario es admin o logística
  const esAdminOLogistica = user && (user.rol === 'admin' || user.usuario === 'logistica')

  // Mapear rol del usuario al nombre del grupo
  const getGrupoUsuario = () => {
    if (!user || !user.rol) return null
    // Capitalizar primera letra del rol
    const rolCapitalizado = user.rol.charAt(0).toUpperCase() + user.rol.slice(1).toLowerCase()
    // Verificar si existe en los grupos
    if (gruposUnicos.includes(rolCapitalizado)) return rolCapitalizado
    // Mapeos especiales
    const mapeos = {
      'temor': 'Temor de Dios',
      'temor de dios': 'Temor de Dios'
    }
    return mapeos[user.rol.toLowerCase()] || null
  }

  const grupoDelUsuario = getGrupoUsuario()

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

  // Función para obtener la hora según tipo de evento
  const getHoraEvento = (evento) => {
    const tituloLower = evento.titulo.toLowerCase()
    // Verificar envío primero (antes de catequesis porque tienen el mismo tipo)
    if (tituloLower.includes('envío') || tituloLower.includes('envio')) return '12:00 md'
    if (evento.tipo === 'catequesis') return '5:00 pm - 6:30 pm'
    if (evento.tipo === 'exposicion') return '6:45 pm - 7:30 pm'
    if (evento.tipo === 'reunion') return '6:45 pm - 7:30 pm'
    return ''
  }

  // Función para descargar PDF del calendario del grupo
  const descargarCalendarioGrupo = (grupoOverride = null) => {
    const grupoADescargar = grupoOverride || grupoSeleccionadoPDF
    if (!grupoADescargar) return

    // Obtener las catequesis del grupo seleccionado
    const catequesisDelGrupo = catequesisGrupos.filter(c => c.encargado === grupoADescargar)
    const numerosCatequesis = catequesisDelGrupo.map(c => c.numero)

    // Filtrar eventos relevantes para el grupo
    const eventosGrupo = eventos.filter(evento => {
      const tituloLower = evento.titulo.toLowerCase()
      // Solo catequesis/exposiciones que sean exactamente de este grupo
      if ((evento.tipo === 'catequesis' || evento.tipo === 'exposicion')) {
        // Buscar el número de catequesis en el título
        for (const num of numerosCatequesis) {
          // Solo incluir si el evento es de este grupo
          // Evitar coincidencias parciales
          const regex = new RegExp(`(^|[^0-9])#${num}([^0-9]|$)`, 'i')
          if (regex.test(evento.titulo)) return true
        }
        return false
      }
      // Limpieza: solo si está cerca de una catequesis de este grupo
      if (tituloLower.includes('limpieza')) {
        const fechaLimpieza = new Date(evento.fecha + 'T00:00:00')
        for (const num of numerosCatequesis) {
          const catequesisEvento = eventos.find(e => {
            const regex = new RegExp(`(^|[^0-9])#${num}([^0-9]|$)`, 'i')
            return regex.test(e.titulo) && (e.tipo === 'catequesis' || e.tipo === 'exposicion')
          })
          if (catequesisEvento) {
            const fechaCatequesis = new Date(catequesisEvento.fecha + 'T00:00:00')
            const diff = Math.abs(fechaCatequesis - fechaLimpieza) / (1000 * 60 * 60 * 24)
            if (diff <= 7) return true
          }
        }
        return false
      }
      // Envío: solo si es de este grupo
      if (tituloLower.includes('envío')) {
        for (const num of numerosCatequesis) {
          const regex = new RegExp(`(^|[^0-9])#${num}([^0-9]|$)`, 'i')
          if (regex.test(evento.titulo)) return true
        }
        return false
      }
      // Seguridad: solo si está asignada a este grupo
      if (tituloLower.includes('seguridad')) {
        for (const num of numerosCatequesis) {
          const regex = new RegExp(`(^|[^0-9])#${num}([^0-9]|$)`, 'i')
          if (regex.test(evento.titulo) || (evento.descripcion && regex.test(evento.descripcion))) return true
        }
        return false
      }
      return false
    }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

    // Crear PDF
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
    const pageWidth = doc.internal.pageSize.getWidth()

    // Título
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 102, 153)
    doc.text(`CALENDARIO ${grupoADescargar.toUpperCase()} 2026`, pageWidth / 2, 20, { align: 'center' })

    // Preparar datos de la tabla
    const tableData = eventosGrupo.map(evento => {
      const fecha = new Date(evento.fecha + 'T00:00:00')
      const opciones = { weekday: 'long', day: 'numeric', month: 'long' }
      let fechaFormateada = fecha.toLocaleDateString('es-ES', opciones)
      // Capitalizar primera letra
      fechaFormateada = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)
      
      return [
        fechaFormateada,
        evento.titulo,
        getHoraEvento(evento)
      ]
    })

    // Calcular margen para centrar
    const colWidths = { col0: 55, col1: 85, col2: 40 }
    const tableWidth = colWidths.col0 + colWidths.col1 + colWidths.col2
    const marginLeft = (pageWidth - tableWidth) / 2

    autoTable(doc, {
      head: [['FECHA', 'ACTIVIDAD', 'HORA']],
      body: tableData,
      startY: 30,
      theme: 'grid',
      styles: { 
        fontSize: 9, 
        cellPadding: 8,
        lineColor: [0, 102, 153],
        lineWidth: 0.3
      },
      headStyles: { 
        fillColor: [0, 102, 153], 
        textColor: 255, 
        fontStyle: 'bold', 
        halign: 'center',
        fontSize: 10,
        cellPadding: 5
      },
      columnStyles: {
        0: { cellWidth: colWidths.col0 },
        1: { cellWidth: colWidths.col1 },
        2: { cellWidth: colWidths.col2, halign: 'center' }
      },
      margin: { left: marginLeft, right: marginLeft },
      alternateRowStyles: { fillColor: [240, 248, 255] }
    })

    doc.save(`Calendario_${grupoADescargar}_2026.pdf`)
    setModalGrupoAbierto(false)
    setGrupoSeleccionadoPDF('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Volver al Menú Principal
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 mb-4 text-center">
              <div className="flex flex-col items-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
                  <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  <span className="line-clamp-2">Cronograma de Confirmación 2026</span>
                </h1>
                <p className="text-gray-600 mt-2 text-xs sm:text-sm lg:text-base">
                  Calendario completo de eventos, catequesis y actividades
                </p>
                <a
                  href="https://docs.google.com/document/d/1IfZsVTtBbXatAubrDTsxrz7eQvA3BY9B/edit?usp=sharing&ouid=112234919645278192952&rtpof=true&sd=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all text-xs sm:text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver Calendario Original (Google Docs)
                </a>
                <button
                  onClick={() => setModalGrupoAbierto(true)}
                  className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all text-xs sm:text-sm"
                >
                  <Download className="w-4 h-4" />
                  Descargar Calendario por Grupo
                </button>
              </div>
              {user && (
                <div className="text-xs sm:text-sm">
                  <p className="text-gray-600">Usuario: <span className="font-semibold">{user.usuario}</span></p>
                </div>
              )}
            </div>

            {/* Tabs de vistas - Responsive con scroll en mobile */}
            <div className="flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
              <button
                onClick={() => setVistaActual('proximos')}
                className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold transition text-xs sm:text-sm whitespace-nowrap ${
                  vistaActual === 'proximos'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Próximos</span>
                </div>
              </button>
              <button
                onClick={() => setVistaActual('calendario')}
                className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold transition text-xs sm:text-sm whitespace-nowrap ${
                  vistaActual === 'calendario'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Calendario</span>
                </div>
              </button>
              <button
                onClick={() => setVistaActual('lista')}
                className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold transition text-xs sm:text-sm whitespace-nowrap ${
                  vistaActual === 'lista'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Lista</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Sidebar - Filtros y Estadísticas - Collapsible en mobile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 space-y-6 sticky top-4 sm:top-8">
              {/* Búsqueda */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Search className="w-4 h-4" /> Buscar Eventos
                </label>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filtro por tipo */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Evento
                </label>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todos">Todos los tipos</option>
                  {Object.entries(tiposEvento).map(([key, value]) => (
                    <option key={key} value={key}>{value.icon} {value.label}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por prioridad */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Prioridad
                </label>
                <select
                  value={filtroPrioridad}
                  onChange={(e) => setFiltroPrioridad(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Mes
                  </label>
                  <select
                    value={mesSeleccionado}
                    onChange={(e) => setMesSeleccionado(Number(e.target.value))}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {meses.map((mes, index) => (
                      <option key={index} value={index}>{mes}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Estadísticas */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Estadísticas</h3>
                <div className="space-y-2 text-xs sm:text-sm">
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
                <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Catequesis por Grupo</h3>
                <div className="space-y-1 text-xs max-h-48 sm:max-h-64 overflow-y-auto">
                  {catequesisGrupos.map((cat) => (
                    <div key={cat.numero} className="flex items-start gap-2">
                      <span className="font-semibold text-blue-600 min-w-[25px]">#{cat.numero}:</span>
                      <div>
                        <p className="text-gray-800 text-xs">{cat.nombre}</p>
                        <p className="text-gray-500 italic text-xs">({cat.encargado})</p>
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
              <div className="space-y-3 sm:space-y-4">
                {proximosEventos.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 sm:p-12 text-center">
                    <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-sm sm:text-base">No hay eventos próximos en los siguientes 30 días</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-4 sm:p-6 mb-4">
                      <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                        Próximos {proximosEventos.length} Eventos (30 días)
                      </h2>
                      <p className="mt-2 opacity-90 text-xs sm:text-base">Mantente al tanto de las próximas actividades</p>
                    </div>
                    
                    {proximosEventos.map((evento) => {
                      const tipoInfo = tiposEvento[evento.tipo]
                      const prioridadInfo = prioridades[evento.prioridad]
                      const diasRestantes = Math.ceil((new Date(evento.fecha + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24))
                      
                      return (
                        <div key={evento.id} className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition">
                          <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2 sm:gap-4">
                            <div className="flex-1 w-full">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border-2 ${tipoInfo.color}`}>
                                  {tipoInfo.icon} {tipoInfo.label}
                                </span>
                                <div className={`w-3 h-3 rounded-full ${prioridadInfo.color}`} title={prioridadInfo.label}></div>
                                <span className="text-xs sm:text-sm font-semibold text-blue-600">
                                  {diasRestantes === 0 ? '¡HOY!' : diasRestantes === 1 ? '¡MAÑANA!' : `En ${diasRestantes} días`}
                                </span>
                              </div>
                              <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-2">{evento.titulo}</h3>
                              <p className="text-gray-600 mb-3 text-xs sm:text-sm">{evento.descripcion}</p>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
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
              <div className="bg-white rounded-xl shadow-xl p-3 sm:p-6 overflow-x-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {meses[mesSeleccionado]} {añoSeleccionado}
                  </h2>
                  <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      onClick={() => {
                        if (mesSeleccionado === 0) {
                          setMesSeleccionado(11)
                          setAñoSeleccionado(añoSeleccionado - 1)
                        } else {
                          setMesSeleccionado(mesSeleccionado - 1)
                        }
                      }}
                      className="px-2 sm:px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold transition text-xs sm:text-sm"
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
                      className="px-2 sm:px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold transition text-xs sm:text-sm"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>

                {/* Calendario - Responsive grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
                    <div key={dia} className="text-center font-semibold text-gray-700 py-2 text-xs sm:text-sm">
                      {dia}
                    </div>
                  ))}
                  
                  {getDiasDelMes().map((diaInfo, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        if (diaInfo && diaInfo.eventos.length > 0) {
                          setDiaSeleccionado(diaInfo)
                          setModalAbierto(true)
                        }
                      }}
                      className={`min-h-[80px] sm:min-h-[100px] border rounded-lg p-1 sm:p-2 text-xs sm:text-sm ${
                        diaInfo 
                          ? diaInfo.eventos.length > 0
                            ? 'bg-white hover:bg-blue-50 cursor-pointer border-blue-300 hover:border-blue-500 transition'
                            : 'bg-white hover:bg-gray-50'
                          : 'bg-gray-50'
                      }`}
                    >
                      {diaInfo && (
                        <>
                          <div className="font-semibold text-gray-700 mb-1">{diaInfo.dia}</div>
                          <div className="space-y-0.5 sm:space-y-1 max-h-16 sm:max-h-20 overflow-y-auto">
                            {diaInfo.eventos.map(evento => {
                              const tipoInfo = tiposEvento[evento.tipo]
                              return (
                                <div
                                  key={evento.id}
                                  className={`text-xs p-1 rounded border truncate cursor-pointer hover:opacity-80 ${tipoInfo.color}`}
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
              <div className="space-y-3 sm:space-y-4">
                {eventosFiltrados.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 sm:p-12 text-center">
                    <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-sm sm:text-base">No se encontraron eventos con los filtros seleccionados</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-xl p-4 shadow-md">
                      <p className="text-gray-600 text-xs sm:text-sm">
                        Mostrando <span className="font-bold text-blue-600">{eventosFiltrados.length}</span> eventos
                      </p>
                    </div>
                    
                    {eventosFiltrados.map((evento) => {
                      const tipoInfo = tiposEvento[evento.tipo]
                      const prioridadInfo = prioridades[evento.prioridad]
                      
                      return (
                        <div key={evento.id} className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition">
                          <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2 sm:gap-4">
                            <div className="flex-1 w-full">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border-2 ${tipoInfo.color}`}>
                                  {tipoInfo.icon} {tipoInfo.label}
                                </span>
                                <div className={`w-3 h-3 rounded-full ${prioridadInfo.color}`} title={prioridadInfo.label}></div>
                              </div>
                              <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-2">{evento.titulo}</h3>
                              <p className="text-gray-600 mb-3 text-xs sm:text-sm">{evento.descripcion}</p>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
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

      {/* Modal de Eventos del Día */}
      {modalAbierto && diaSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col animate-fade-in">
            {/* Header */}
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  {diaSeleccionado.dia} de {meses[mesSeleccionado]} de {añoSeleccionado}
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  {diaSeleccionado.eventos.length} evento{diaSeleccionado.eventos.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-white/90 hover:text-blue-600 hover:bg-white p-2 rounded-lg transition-colors duration-150"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido - Eventos del día */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {diaSeleccionado.eventos.map((evento) => {
                const tipoInfo = tiposEvento[evento.tipo]
                const prioridadInfo = prioridades[evento.prioridad]
                
                return (
                  <div
                    key={evento.id}
                    className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border-2 ${tipoInfo.color}`}>
                        {tipoInfo.icon} {tipoInfo.label}
                      </span>
                      <div className={`w-3 h-3 rounded-full ${prioridadInfo.color}`} title={prioridadInfo.label}></div>
                    </div>
                    
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                      {evento.titulo}
                    </h3>
                    
                    <p className="text-gray-600 text-sm sm:text-base mb-3">
                      {evento.descripcion}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <span className="px-2 py-1 bg-white rounded border border-gray-300">
                        {evento.categoria}
                      </span>
                      {evento.grupo && (
                        <span className="px-2 py-1 bg-blue-50 rounded border border-blue-300 text-blue-700">
                          Grupo: {evento.grupo}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <button
                onClick={() => setModalAbierto(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Selección de Grupo para PDF */}
      {modalGrupoAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Descargar Calendario
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  {esAdminOLogistica ? 'Selecciona un grupo de confirmación' : `Calendario de ${grupoDelUsuario || 'tu grupo'}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setModalGrupoAbierto(false)
                  setGrupoSeleccionadoPDF('')
                }}
                className="text-white/90 hover:text-blue-600 hover:bg-white p-2 rounded-lg transition-colors duration-150"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido */}
            <div className="p-4 sm:p-6">
              {esAdminOLogistica ? (
                // Admin/Logística: pueden seleccionar cualquier grupo
                <>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Grupo de Confirmación
                  </label>
                  <select
                    value={grupoSeleccionadoPDF}
                    onChange={(e) => setGrupoSeleccionadoPDF(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  >
                    <option value="">Selecciona un grupo...</option>
                    {gruposUnicos.map(grupo => (
                      <option key={grupo} value={grupo}>{grupo}</option>
                    ))}
                  </select>
                </>
              ) : grupoDelUsuario ? (
                // Usuario normal con grupo válido
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <CalendarIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-800 mb-2">
                    Calendario de {grupoDelUsuario}
                  </p>
                  <p className="text-sm text-gray-600">
                    Se descargará el calendario con todas las actividades de tu grupo
                  </p>
                </div>
              ) : (
                // Usuario sin grupo válido
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-800 mb-2">
                    Grupo no encontrado
                  </p>
                  <p className="text-sm text-gray-600">
                    Tu rol ({user?.rol || 'desconocido'}) no corresponde a ningún grupo de catequesis
                  </p>
                </div>
              )}

              {(grupoSeleccionadoPDF || (!esAdminOLogistica && grupoDelUsuario)) && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Catequesis asignadas a {grupoSeleccionadoPDF || grupoDelUsuario}:</span>
                  </p>
                  <ul className="mt-2 text-xs text-blue-700 space-y-1">
                    {catequesisGrupos.filter(c => c.encargado === (grupoSeleccionadoPDF || grupoDelUsuario)).map(c => (
                      <li key={c.numero}>#{c.numero} - {c.nombre}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setModalGrupoAbierto(false)
                  setGrupoSeleccionadoPDF('')
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Si no es admin, usar el grupo del usuario
                  if (!esAdminOLogistica && grupoDelUsuario) {
                    descargarCalendarioGrupo(grupoDelUsuario)
                  } else {
                    descargarCalendarioGrupo()
                  }
                }}
                disabled={esAdminOLogistica ? !grupoSeleccionadoPDF : !grupoDelUsuario}
                className={`flex-1 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  (esAdminOLogistica ? grupoSeleccionadoPDF : grupoDelUsuario)
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Download className="w-4 h-4" />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default CalendarioModule
