import { useState, useRef, useEffect } from 'react'
import { GripVertical, Check, X, ArrowUp, ArrowDown } from 'lucide-react'

export default function PersonalityRankingTool({ gruposOriginales, onRankingComplete }) {
  const [gruposConRanking, setGruposConRanking] = useState(
    gruposOriginales.map(grupo => ({
      ...grupo,
      ranking: [...grupo.integrantes], // Copia inicial sin orden
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
    <div className="space-y-6">
      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2">📋 Instrucciones</h3>
        <p className="text-sm text-blue-800 mb-2">
          Ordena los integrantes de cada grupo de <strong>MÁS EXTROVERTIDO</strong> (arriba) a <strong>MÁS INTROVERTIDO</strong> (abajo).
        </p>
        <p className="text-xs text-blue-700">
          Arrastra y suelta las tarjetas o usa las flechas ↑↓ para reordenar. Marca ✓ cuando termines con cada grupo.
        </p>
      </div>

      {/* Tabs de grupos */}
      <div className="flex flex-wrap gap-2 border-b">
        {gruposConRanking.map((grupo, idx) => (
          <button
            key={idx}
            onClick={() => handleIrAlGrupo(idx)}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              grupoActual === idx
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            } flex items-center gap-2`}
          >
            {grupo.nombre}
            {grupo.completado && <Check className="w-4 h-4 text-green-600" />}
          </button>
        ))}
      </div>

      {/* Contenido del grupo actual */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {grupoData.nombre} ({grupoData.ranking.length} integrantes)
          </h2>

          <div 
            ref={listContainerRef}
            className="space-y-2 max-h-[70vh] overflow-y-auto pr-2"
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
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-move ${
                    draggedIndex === index
                      ? 'opacity-50 scale-95'
                      : index === 0
                      ? 'bg-orange-50 border-orange-300'
                      : index === grupoData.ranking.length - 1
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-gray-50 border-gray-300'
                  } hover:shadow-md`}
                >
                  {/* Icono de arrastre */}
                  <div className="shrink-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Número de posición */}
                  <div className="shrink-0 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>

                  {/* Información del estudiante */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{estudiante.nombre}</p>
                    <p className="text-xs text-gray-600">
                      {estudiante.cedula && `Tel: ${estudiante.cedula}`}
                    </p>
                  </div>

                  {/* Indicador de tipo */}
                  <div className="shrink-0 text-xs font-medium">
                    {index === 0 ? (
                      <span className="px-2 py-1 bg-orange-200 text-orange-800 rounded text-xs">
                        Extrovertido
                      </span>
                    ) : index === grupoData.ranking.length - 1 ? (
                      <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">
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
                      className="p-1.5 rounded hover:bg-orange-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Mover hacia arriba (más extrovertido)"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMoverAbajo(index)
                      }}
                      disabled={index === grupoData.ranking.length - 1}
                      className="p-1.5 rounded hover:bg-blue-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Mover hacia abajo (más introvertido)"
                    >
                      <ArrowDown className="w-3 h-3" />
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
        </div>

        {/* Botón de completado */}
        <div className="flex gap-2">
          <button
            onClick={handleGrupoCompletado}
            disabled={grupoData.completado}
            className={`flex-1 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
              grupoData.completado
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Check className="w-5 h-5" />
            {grupoData.completado ? 'Grupo Completado' : 'Marcar Grupo como Completado'}
          </button>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso</span>
          <span className="text-sm font-bold text-gray-800">
            {gruposConRanking.filter(g => g.completado).length} de {gruposConRanking.length} grupos
          </span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all duration-300"
            style={{
              width: `${(gruposConRanking.filter(g => g.completado).length / gruposConRanking.length) * 100}%`
            }}
          ></div>
        </div>
      </div>

      {/* Botón final */}
      {todosCompletados && (
        <button
          onClick={() => onRankingComplete(gruposConRanking)}
          className="w-full py-4 bg-linear-to-r from-green-600 to-green-700 text-white rounded-lg font-bold text-lg hover:from-green-700 hover:to-green-800 transition-colors shadow-lg"
        >
          ✓ Continuar con Asignación de Nuevos Grupos
        </button>
      )}
    </div>
  )
}
