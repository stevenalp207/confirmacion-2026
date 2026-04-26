import { useState, useRef, useEffect } from 'react'
import { GripVertical, Check, X, ArrowUp, ArrowDown } from 'lucide-react'
import { ordenarRankingPorDefecto } from '../utils/introversionAssignment'

export default function PersonalityRankingTool({ gruposOriginales, onRankingComplete }) {
  const [gruposConRanking, setGruposConRanking] = useState(
    gruposOriginales.map(grupo => ({
      ...grupo,
      ranking: ordenarRankingPorDefecto(grupo.nombre, grupo.integrantes),
      completado: false
    }))
  )
  const [grupoActual, setGrupoActual] = useState(0)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dropPosition, setDropPosition] = useState(null) // { index, position: 'before' | 'after' }
  const listContainerRef = useRef(null)
  const scrollIntervalRef = useRef(null)
  const scrollSpeedRef = useRef(0)

  // Limpiar intervalo cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current)
      }
    }
  }, [])

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.currentTarget.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1'
    setDraggedIndex(null)
    setDropPosition(null)
    
    // Detener el scroll automático
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (draggedIndex === null || draggedIndex === index) {
      return
    }

    // Auto-scroll suave cuando se arrastra cerca de los bordes
    if (listContainerRef.current) {
      const containerRect = listContainerRef.current.getBoundingClientRect()
      const scrollThreshold = 80
      const maxScrollSpeed = 5
      
      let newScrollSpeed = 0
      
      // Detectar si estamos cerca del borde superior
      if (e.clientY < containerRect.top + scrollThreshold) {
        const distanceFromTop = e.clientY - containerRect.top
        newScrollSpeed = -maxScrollSpeed + (distanceFromTop / scrollThreshold) * maxScrollSpeed
      }
      // Detectar si estamos cerca del borde inferior
      else if (e.clientY > containerRect.bottom - scrollThreshold) {
        const distanceFromBottom = containerRect.bottom - e.clientY
        newScrollSpeed = maxScrollSpeed - (distanceFromBottom / scrollThreshold) * maxScrollSpeed
      }
      
      // Actualizar velocidad de scroll
      scrollSpeedRef.current = newScrollSpeed
      
      // Establecer intervalo de scroll suave si no existe
      if (newScrollSpeed !== 0 && !scrollIntervalRef.current) {
        scrollIntervalRef.current = setInterval(() => {
          if (listContainerRef.current && scrollSpeedRef.current !== 0) {
            listContainerRef.current.scrollTop += scrollSpeedRef.current
          }
        }, 16) // ~60fps
      } 
      // Limpiar intervalo si no hay velocidad
      else if (newScrollSpeed === 0 && scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current)
        scrollIntervalRef.current = null
      }
    }

    // Calcular si el cursor está en la mitad superior o inferior del elemento
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseY = e.clientY
    const elementMiddle = rect.top + rect.height / 2
    
    const position = mouseY < elementMiddle ? 'before' : 'after'
    setDropPosition({ index, position })
  }

  const handleDragLeave = (e) => {
    // Solo limpiar si realmente salimos del elemento
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropPosition(null)
    }
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    
    if (draggedIndex === null || !dropPosition) {
      setDropPosition(null)
      return
    }

    const nuevoRanking = [...gruposConRanking[grupoActual].ranking]
    const [draggedItem] = nuevoRanking.splice(draggedIndex, 1)
    
    // Calcular la posición final considerando si va antes o después
    let finalIndex = dropPosition.index
    if (dropPosition.position === 'after') {
      finalIndex += 1
    }
    
    // Ajustar si el elemento arrastrado estaba antes del punto de inserción
    if (draggedIndex < finalIndex) {
      finalIndex -= 1
    }
    
    nuevoRanking.splice(finalIndex, 0, draggedItem)

    const nuevosGrupos = [...gruposConRanking]
    nuevosGrupos[grupoActual].ranking = nuevoRanking
    setGruposConRanking(nuevosGrupos)
    
    setDraggedIndex(null)
    setDropPosition(null)
  }

  const handleTouchStart = (e, index) => {
    setDraggedIndex(index)
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    
    if (element) {
      const card = element.closest('[data-ranking-index]')
      if (card) {
        const index = parseInt(card.dataset.rankingIndex)
        if (!isNaN(index) && index !== draggedIndex) {
          const rect = card.getBoundingClientRect()
          const touchY = touch.clientY
          const elementMiddle = rect.top + rect.height / 2
          
          const position = touchY < elementMiddle ? 'before' : 'after'
          setDropPosition({ index, position })
        }
      }
    }
  }

  const handleTouchEnd = (e) => {
    if (draggedIndex !== null && dropPosition !== null) {
      const nuevoRanking = [...gruposConRanking[grupoActual].ranking]
      const [draggedItem] = nuevoRanking.splice(draggedIndex, 1)
      
      let finalIndex = dropPosition.index
      if (dropPosition.position === 'after') {
        finalIndex += 1
      }
      
      if (draggedIndex < finalIndex) {
        finalIndex -= 1
      }
      
      nuevoRanking.splice(finalIndex, 0, draggedItem)

      const nuevosGrupos = [...gruposConRanking]
      nuevosGrupos[grupoActual].ranking = nuevoRanking
      setGruposConRanking(nuevosGrupos)
    }
    
    setDraggedIndex(null)
    setDropPosition(null)
  }

  const handleMoverArriba = (index) => {
    if (index === 0) return

    const nuevoRanking = [...gruposConRanking[grupoActual].ranking]
    ;[nuevoRanking[index - 1], nuevoRanking[index]] = [nuevoRanking[index], nuevoRanking[index - 1]]

    const nuevosGrupos = [...gruposConRanking]
    nuevosGrupos[grupoActual].ranking = nuevoRanking
    setGruposConRanking(nuevosGrupos)
  }

  const handleMoverAbajo = (index) => {
    const ranking = gruposConRanking[grupoActual].ranking
    if (index === ranking.length - 1) return

    const nuevoRanking = [...ranking]
    ;[nuevoRanking[index + 1], nuevoRanking[index]] = [nuevoRanking[index], nuevoRanking[index + 1]]

    const nuevosGrupos = [...gruposConRanking]
    nuevosGrupos[grupoActual].ranking = nuevoRanking
    setGruposConRanking(nuevosGrupos)
  }

  const handleGrupoCompletado = () => {
    const nuevosGrupos = [...gruposConRanking]
    nuevosGrupos[grupoActual].completado = true
    setGruposConRanking(nuevosGrupos)

    // Ir al siguiente grupo sin completar
    let siguienteGrupo = grupoActual + 1
    while (siguienteGrupo < nuevosGrupos.length && nuevosGrupos[siguienteGrupo].completado) {
      siguienteGrupo++
    }

    if (siguienteGrupo < nuevosGrupos.length) {
      setGrupoActual(siguienteGrupo)
    }
  }

  const handleIrAlGrupo = (index) => {
    setGrupoActual(index)
  }

  const todosCompletados = gruposConRanking.every(g => g.completado)
  const grupoData = gruposConRanking[grupoActual]

  return (
    <div className="space-y-6 pb-6">
      {/* Instrucciones - Diseño mejorado */}
      <div className="bg-white rounded-xl p-6 text-gray-800 shadow-sm border border-gray-100">
        <div className="flex items-start gap-4">
          <div className="text-3xl">📋</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2 text-gray-900">Ordena los Integrantes</h3>
            <p className="text-gray-600 text-sm mb-2">
              Coloca a los <strong>MÁS EXTROVERTIDOS</strong> <span className="text-orange-600">arriba</span> y los <strong>MÁS INTROVERTIDOS</strong> <span className="text-blue-600">abajo</span>.
            </p>
            <p className="text-xs text-gray-500 font-medium">
              💡 Se cargan valores por defecto segun personalidad • Arrastra las tarjetas o usa las flechas ↑↓ • Marca ✓ cuando termines cada grupo
            </p>
          </div>
        </div>
      </div>

      {/* Tabs de grupos - Diseño mejorado */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="flex flex-wrap gap-0 p-1 border-b border-gray-100">
          {gruposConRanking.map((grupo, idx) => (
            <button
              key={idx}
              onClick={() => handleIrAlGrupo(idx)}
              className={`flex-1 min-w-max px-4 py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2 rounded-lg mx-0.5 ${
                grupoActual === idx
                  ? 'bg-amber-600 text-white shadow-md scale-105'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{grupo.nombre}</span>
              {grupo.completado && (
                <div className="inline-flex items-center justify-center w-5 h-5 bg-green-400 rounded-full">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido del grupo actual */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {grupoData.nombre}
            </h2>
            <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {grupoData.ranking.length} personas
            </span>
          </div>
          <p className="text-gray-600 text-sm">Organiza este grupo de forma estratégica</p>
        </div>

        <div 
          ref={listContainerRef}
          className="space-y-2 max-h-[65vh] overflow-y-auto pr-3 bg-gray-50 rounded-lg p-4"
        >
            {grupoData.ranking.map((estudiante, index) => (
              <div key={`${estudiante.nombre}-${index}`} className="relative">
                {/* Línea indicadora ARRIBA - muestra dónde se insertará si sueltas aquí */}
                {dropPosition?.index === index && dropPosition?.position === 'before' && (
                  <div className="absolute -top-1 left-0 right-0 h-1 bg-amber-500 rounded-full shadow-lg z-10 animate-pulse">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-500 rounded-full"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-500 rounded-full"></div>
                  </div>
                )}

                <div
                  data-ranking-index={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onTouchStart={(e) => handleTouchStart(e, index)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`flex items-center gap-3 p-3.5 rounded-lg border-2 transition-all duration-200 cursor-move ${
                    draggedIndex === index
                      ? 'opacity-40 scale-95 border-amber-400 shadow-lg'
                      : index === 0
                      ? 'bg-white border-orange-300 hover:border-orange-400 hover:shadow-md'
                      : index === grupoData.ranking.length - 1
                      ? 'bg-white border-blue-300 hover:border-blue-400 hover:shadow-md'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {/* Icono de arrastre */}
                  <div className="shrink-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing transition-colors">
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Número de posición */}
                  <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white transition-all ${
                    index === 0 
                      ? 'bg-linear-to-br from-orange-500 to-orange-600 shadow-sm'
                      : index === grupoData.ranking.length - 1
                      ? 'bg-linear-to-br from-blue-500 to-blue-600 shadow-sm'
                      : 'bg-gray-400'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Información del estudiante */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{estudiante.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {estudiante.cedula && `Tel: ${estudiante.cedula}`}
                    </p>
                  </div>

                  {/* Indicador de tipo */}
                  <div className="shrink-0">
                    {index === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        Extrovertido
                      </span>
                    ) : index === grupoData.ranking.length - 1 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Introvertido
                      </span>
                    ) : null}
                  </div>

                  {/* Botones de flechas */}
                  <div className="shrink-0 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMoverArriba(index)
                      }}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg hover:bg-orange-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-gray-600 hover:text-orange-600"
                      title="Mover hacia arriba (más extrovertido)"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMoverAbajo(index)
                      }}
                      disabled={index === grupoData.ranking.length - 1}
                      className="p-1.5 rounded-lg hover:bg-blue-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-gray-600 hover:text-blue-600"
                      title="Mover hacia abajo (más introvertido)"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Línea indicadora ABAJO - muestra dónde se insertará si sueltas aquí */}
                {dropPosition?.index === index && dropPosition?.position === 'after' && (
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-amber-500 rounded-full shadow-lg z-10 animate-pulse">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-500 rounded-full"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-500 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

        {/* Botón de completado */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleGrupoCompletado}
            disabled={grupoData.completado}
            className={`flex-1 py-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 text-base ${
              grupoData.completado
                ? 'bg-gray-100 text-gray-400 cursor-default'
                : 'bg-linear-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg scale-100 hover:scale-105'
            }`}
          >
            <Check className="w-5 h-5" />
            {grupoData.completado ? 'Grupo Completado' : 'Marcar como Completado'}
          </button>
        </div>
      </div>

      {/* Barra de progreso mejorada */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">Progreso General</span>
          <span className="text-sm font-bold text-gray-900">
            {gruposConRanking.filter(g => g.completado).length} de {gruposConRanking.length} grupos
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all duration-500 bg-linear-to-r from-green-400 to-green-600"
            style={{
              width: `${(gruposConRanking.filter(g => g.completado).length / gruposConRanking.length) * 100}%`
            }}
          ></div>
        </div>
      </div>

      {/* Botón final */}
      {todosCompletados && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => onRankingComplete(gruposConRanking)}
            className="w-full sm:w-auto sm:px-8 py-4 bg-linear-to-r from-green-500 via-green-600 to-green-700 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:via-green-700 hover:to-green-800 transition-colors duration-150 shadow-lg flex items-center justify-center gap-2"
          >
            <Check className="w-6 h-6" />
            Continuar con Asignación de Nuevos Grupos
          </button>
        </div>
      )}
    </div>
  )
}
